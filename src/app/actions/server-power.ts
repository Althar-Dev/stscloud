'use server';

import { promises as fs, createWriteStream } from 'fs';
import path from 'path';
import { spawn } from 'child_process';

/**
 * @fileOverview Server actions to handle ACTUAL server execution with real-time log streaming and process group management.
 * Optimized to prevent NextJS Server Action timeouts by running execution asynchronously.
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
  
  const timestamp = () => `[${new Date().toISOString()}]`;

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
    await fs.appendFile(logPath, `\n${timestamp()} [STS] Terminating process (SIGINT)...\n`);
    await killExisting();
    if (action === 'stop') {
      await fs.appendFile(logPath, `${timestamp()} [STS] Server stopped. Status: Offline.\n`);
      return { success: true };
    }
  }

  if (action === 'start' || action === 'restart') {
    try {
      await fs.mkdir(path.dirname(logPath), { recursive: true });
      await fs.writeFile(logPath, `${timestamp()} [STS] Starting with Node.js v${config.nodeVersion}...\n`);

      // ASYNC EXECUTION: Fire and forget to avoid NextJS Server Action Timeout
      (async () => {
        const logStream = createWriteStream(logPath, { flags: 'a' });
        
        // 1. Dependency Check
        const nodeModulesPath = path.join(filesDir, 'node_modules');
        let needsInstall = false;
        try {
          await fs.access(nodeModulesPath);
        } catch {
          needsInstall = true;
        }

        if (needsInstall) {
          logStream.write(`${timestamp()} [STS] Installing dependencies (npm install)...\n`);
          
          await new Promise((resolve) => {
            const installProcess = spawn('npx', ['-y', '-p', `node@${config.nodeVersion}`, '--', 'npm', 'install', '--production'], {
              cwd: filesDir,
              env: { 
                ...process.env, 
                NODE_ENV: 'production',
                FORCE_COLOR: '1',
                NPM_CONFIG_COLOR: 'always'
              }
            });

            installProcess.stdout?.on('data', (data) => logStream.write(data));
            installProcess.stderr?.on('data', (data) => logStream.write(data));
            installProcess.on('close', () => resolve(true));
          });
        }

        // 2. Start Application with Node Version Wrapper
        logStream.write(`${timestamp()} [STS] Executing: ${config.startupCommand}\n\n`);
        const commandParts = config.startupCommand.split(' ');
        
        const child = spawn('npx', ['-y', '-p', `node@${config.nodeVersion}`, '--', ...commandParts], {
          cwd: filesDir,
          detached: true, // Create a process group
          stdio: ['ignore', 'pipe', 'pipe'],
          env: { 
            ...process.env, 
            NODE_ENV: 'production',
            FORCE_COLOR: '1',
            NPM_CONFIG_COLOR: 'always'
          }
        });

        if (child.pid) {
          await fs.writeFile(pidPath, child.pid.toString());
        }

        child.stdout?.on('data', (data) => logStream.write(data));
        child.stderr?.on('data', (data) => logStream.write(data));

        child.on('close', (code) => {
          const exitLog = `\n${timestamp()} [STS] Process exited with code ${code}\n`;
          fs.appendFile(logPath, exitLog).catch(() => {});
          fs.unlink(pidPath).catch(() => {});
        });

        child.unref();
      })().catch(err => {
        fs.appendFile(logPath, `\n${timestamp()} [ERROR] Execution failure: ${err.message}\n`).catch(() => {});
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  return { success: true };
}
