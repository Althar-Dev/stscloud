
'use server';

import { promises as fs, createWriteStream } from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import gradient from 'gradient-string';

/**
 * @fileOverview Server actions to handle ACTUAL server execution with real-time log streaming and process group management.
 * Optimized with stylized ASCII art and colored status indicators.
 */

export async function getServerProcessStatus(serverId: string) {
  const pidPath = path.join(process.cwd(), 'storage', 'servers', serverId, 'files', '.sts', 'run.pid');
  try {
    const pidStr = await fs.readFile(pidPath, 'utf8');
    const pid = parseInt(pidStr.trim());
    if (isNaN(pid)) return { running: false };
    
    // Check if process group exists (using signal 0)
    process.kill(pid, 0);
    return { running: true, pid };
  } catch (e) {
    return { running: false };
  }
}

export async function executeServerPower(serverId: string, action: 'start' | 'stop' | 'restart', config: {
  nodeVersion: string;
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
      if (pidStr) {
        const pid = parseInt(pidStr.trim());
        try {
          // SIGINT to process group (negative PID) for Ctrl+C behavior
          process.kill(-pid, 'SIGINT'); 
          await fs.unlink(pidPath).catch(() => {});
          
          // Force kill after 2s if still running
          setTimeout(() => {
             try { process.kill(-pid, 'SIGKILL'); } catch(e) {}
          }, 2000);
        } catch (e) {
          try { process.kill(pid, 'SIGINT'); } catch (e2) {}
          await fs.unlink(pidPath).catch(() => {});
        }
      }
    } catch (e) {}
  };

  if (action === 'stop' || action === 'restart') {
    await fs.appendFile(logPath, `[STS] [${timestamp()}] Terminating process (SIGINT)...\n`);
    await killExisting();
    if (action === 'stop') {
      await fs.appendFile(logPath, `[STS] [${timestamp()}] Server stopped. Status: Offline.\n`);
      return { success: true };
    }
  }

  if (action === 'start' || action === 'restart') {
    try {
      await fs.mkdir(path.dirname(logPath), { recursive: true });
      
      const asciiRaw = `░█▀▀░▀█▀░█▀▀░█▀▀░█░░░█▀█░█░█░█▀▄
░▀▀█░░█░░▀▀█░█░░░█░░░█░█░█░█░█░█
░▀▀▀░░▀░░▀▀▀░▀▀▀░▀▀▀░▀▀▀░▀▀▀░▀▀░`;
      
      // Generate gradient ASCII
      const ascii = gradient(['#bd93f9', '#ff79c6', '#ffb86c']).multiline(asciiRaw);
      
      const nodeModulesPath = path.join(filesDir, 'node_modules');
      let modulesStatus = 'Ok';
      try {
        await fs.access(nodeModulesPath);
      } catch (e) {
        modulesStatus = 'No';
      }

      let diskStatus = 'Ok';
      try {
        await fs.access(filesDir);
      } catch (e) {
        diskStatus = 'Bad';
      }

      const initialLogs = `${ascii}\n[STS] [${timestamp()}] Checking available disk... ${diskStatus === 'Ok' ? green('Ok') : red('Bad')}\n[STS] [${timestamp()}] Checking node_modules... ${modulesStatus === 'Ok' ? green('Ok') : yellow('No')}\n[STS] [${timestamp()}] Starting with Node.Js v${config.nodeVersion}\n[STS] [${timestamp()}] Executing ${config.startupCommand}\n\n`;

      // Always overwrite logs on START to clean previous session
      await fs.writeFile(logPath, initialLogs);

      (async () => {
        const logStream = createWriteStream(logPath, { flags: 'a' });
        
        if (modulesStatus === 'No') {
          logStream.write(`[STS] [${timestamp()}] Installing dependencies (npm install)...\n`);
          
          await new Promise((resolve) => {
            const installProcess = spawn('npx', ['-y', '-p', `node@${config.nodeVersion}`, '--', 'npm', 'install', '--production'], {
              cwd: filesDir,
              env: { 
                ...process.env, 
                NODE_ENV: 'production',
                FORCE_COLOR: '1'
              }
            });

            installProcess.stdout?.on('data', (data) => logStream.write(data));
            installProcess.stderr?.on('data', (data) => logStream.write(data));
            installProcess.on('close', () => resolve(true));
          });
        }

        const commandParts = config.startupCommand.split(' ');
        const child = spawn('npx', ['-y', '-p', `node@${config.nodeVersion}`, '--', ...commandParts], {
          cwd: filesDir,
          detached: true,
          stdio: ['ignore', 'pipe', 'pipe'],
          env: { 
            ...process.env, 
            NODE_ENV: 'production',
            FORCE_COLOR: '1'
          }
        });

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
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  return { success: true };
}
