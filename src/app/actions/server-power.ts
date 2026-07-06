"use server";

import { promises as fs, createWriteStream } from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import gradient from 'gradient-string';

/**
 * @fileOverview Server actions to handle ACTUAL server execution with real-time log streaming and process group management.
 * Enhanced to support automatic dependency installation (pip/npm) and forced unbuffered Python output.
 */

export async function getServerProcessStatus(serverId: string) {
  const pidPath = path.join(process.cwd(), 'storage', 'servers', serverId, 'files', '.sts', 'run.pid');
  try {
    const pidStr = await fs.readFile(pidPath, 'utf8');
    const content = pidStr.trim();
    
    if (content === 'BOOTING') return { running: true, booting: true };
    
    const pid = parseInt(content);
    if (isNaN(pid)) return { running: false };
    
    try {
      // Check if process exists using signal 0
      process.kill(pid, 0);
      return { running: true, pid };
    } catch (e) {
      // Process is dead but PID file exists, cleanup
      await fs.unlink(pidPath).catch(() => {});
      return { running: false };
    }
  } catch (e) {
    return { running: false };
  }
}

export async function executeServerPower(serverId: string, action: 'start' | 'stop' | 'restart', config: {
  runtime?: string;
  version: string;
  commandRun: string;
  entryFile: string;
  startupCommand: string;
}) {
  const baseDir = path.join(process.cwd(), 'storage', 'servers', serverId);
  const filesDir = path.join(baseDir, 'files');
  const stsDir = path.join(filesDir, '.sts');
  const logPath = path.join(stsDir, 'logs', 'logs.sts');
  const pidPath = path.join(stsDir, 'run.pid');
  
  const timestamp = () => new Date().toLocaleTimeString('en-GB', { hour12: false });
  
  // ANSI Color Helpers
  const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
  const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
  const red = (s: string) => `\x1b[31m${s}\x1b[0m`;

  const killExisting = async () => {
    try {
      const pidStr = await fs.readFile(pidPath, 'utf8');
      const trimmedPid = pidStr?.trim();
      
      if (trimmedPid && trimmedPid !== 'BOOTING') {
        const pid = parseInt(trimmedPid);
        if (!isNaN(pid)) {
          try {
            // Kill entire process group aggressively (negative PID)
            process.kill(-pid, 'SIGKILL'); 
          } catch (e) {
            // Fallback for single process if group kill fails
            try { process.kill(pid, 'SIGKILL'); } catch (e2) {}
          }
        }
      }
    } catch (e) {}
    // Always cleanup PID file
    await fs.unlink(pidPath).catch(() => {});
  };

  if (action === 'stop' || action === 'restart') {
    await fs.appendFile(logPath, `[STS] [${timestamp()}] Terminating process group (SIGKILL)... Status: Offline.\n`);
    await killExisting();
    
    if (action === 'restart') {
      // OS grace period to release ports
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (action === 'stop') {
      return { success: true };
    }
  }

  if (action === 'start' || action === 'restart') {
    try {
      await fs.mkdir(path.dirname(logPath), { recursive: true });
      await fs.mkdir(path.dirname(pidPath), { recursive: true });
      
      // Mark as booting to prevent premature offline status
      await fs.writeFile(pidPath, 'BOOTING');

      const asciiRaw = `░█▀▀░▀█▀░█▀▀░█▀▀░█░░░█▀█░█░█░█▀▄
░▀▀█░░█░░▀▀█░█░░░█░░░█░█░█░█░█░█
░▀▀▀░░▀░░▀▀▀░▀▀▀░▀▀▀░▀▀▀░▀▀▀░▀▀░`;
      
      const ascii = gradient(['#4f46e5', '#3b82f6'])(asciiRaw);
      
      const runtimeName = config.runtime === 'python' ? 'Python' : 'Node.Js';
      const versionLabel = config.runtime === 'python' ? config.version : `v${config.version}`;

      const nodeModulesPath = path.join(filesDir, 'node_modules');
      const packageJsonPath = path.join(filesDir, 'package.json');
      const requirementsPath = path.join(filesDir, 'requirements.txt');

      let diskStatus = 'Ok';
      try { await fs.access(filesDir); } catch (e) { diskStatus = 'Bad'; }

      const initialLogs = `${ascii}\n[STS] [${timestamp()}] Checking available disk... ${diskStatus === 'Ok' ? green('Ok') : red('Bad')}\n[STS] [${timestamp()}] Runtime: ${runtimeName} ${versionLabel}\n[STS] [${timestamp()}] Preparing environment...\n\n`;

      // Always overwrite logs on START to clean previous session
      await fs.writeFile(logPath, initialLogs);

      (async () => {
        const logStream = createWriteStream(logPath, { flags: 'a' });
        
        // --- Dependency Installation Phase ---

        if (config.runtime === 'python') {
          let hasRequirements = false;
          try { await fs.access(requirementsPath); hasRequirements = true; } catch (e) {}

          if (hasRequirements) {
            logStream.write(`[STS] [${timestamp()}] requirements.txt detected. Installing dependencies...\n`);
            await new Promise((resolve) => {
              const installProcess = spawn('python3', ['-m', 'pip', 'install', '-r', 'requirements.txt'], {
                cwd: filesDir,
                env: { 
                  ...process.env, 
                  PYTHONUNBUFFERED: '1', 
                  FORCE_COLOR: '1',
                  PYTHONIOENCODING: 'utf-8'
                }
              });
              installProcess.stdout?.on('data', (data) => logStream.write(data));
              installProcess.stderr?.on('data', (data) => logStream.write(data));
              installProcess.on('close', (code) => {
                logStream.write(`[STS] [${timestamp()}] Pip exited with code ${code}\n`);
                resolve(true);
              });
            });
          }
        } else {
          let modulesExist = false;
          let hasPackageJson = false;
          try { await fs.access(nodeModulesPath); modulesExist = true; } catch (e) {}
          try { await fs.access(packageJsonPath); hasPackageJson = true; } catch (e) {}

          if (hasPackageJson && !modulesExist) {
            logStream.write(`[STS] [${timestamp()}] package.json detected without node_modules. Running npm install...\n`);
            await new Promise((resolve) => {
              const installProcess = spawn('npx', ['-y', '-p', `node@${config.version}`, '--', 'npm', 'install', '--production'], {
                cwd: filesDir,
                env: { ...process.env, NODE_ENV: 'production', FORCE_COLOR: '1' }
              });
              installProcess.stdout?.on('data', (data) => logStream.write(data));
              installProcess.stderr?.on('data', (data) => logStream.write(data));
              installProcess.on('close', (code) => {
                logStream.write(`[STS] [${timestamp()}] Npm exited with code ${code}\n`);
                resolve(true);
              });
            });
          }
        }

        // --- Execution Phase ---
        
        logStream.write(`\n[STS] [${timestamp()}] Booting application: ${config.startupCommand}\n\n`);

        const commandParts = config.startupCommand.split(' ');
        let child;

        if (config.runtime === 'python') {
          // Robust Python spawn: ensure runner is correct and output is unbuffered
          const runner = config.commandRun || 'python3';
          let args = commandParts;
          if (commandParts[0] === runner || commandParts[0] === 'python') {
            args = commandParts.slice(1);
          }

          child = spawn(runner, args, {
            cwd: filesDir,
            detached: true,
            stdio: ['ignore', 'pipe', 'pipe'],
            env: { 
              ...process.env, 
              PYTHONUNBUFFERED: '1', 
              FORCE_COLOR: '1',
              PYTHONIOENCODING: 'utf-8',
              PYTHONPATH: filesDir
            }
          });
        } else {
          // Node.js dynamic versioning via npx
          child = spawn('npx', ['-y', '-p', `node@${config.version}`, '--', ...commandParts], {
            cwd: filesDir,
            detached: true,
            stdio: ['ignore', 'pipe', 'pipe'],
            env: { ...process.env, NODE_ENV: 'production', FORCE_COLOR: '1' }
          });
        }

        if (child.pid) {
          await fs.writeFile(pidPath, child.pid.toString());
        }

        child.stdout?.on('data', (data) => logStream.write(data));
        child.stderr?.on('data', (data) => logStream.write(data));

        child.on('close', (code) => {
          const exitLog = `\n[STS] [${timestamp()}] Process exited with code ${code}\n`;
          fs.appendFile(logPath, exitLog).catch(() => {});
          fs.unlink(pidPath).catch(() => {});
        });

        child.unref();
      })().catch(err => {
        fs.appendFile(logPath, `\n[STS] [${timestamp()}] [ERROR] Execution failure: ${err.message}\n`).catch(() => {});
        fs.unlink(pidPath).catch(() => {});
      });

      return { success: true };
    } catch (error: any) {
      await fs.unlink(pidPath).catch(() => {});
      return { success: false, error: error.message };
    }
  }

  return { success: true };
}
