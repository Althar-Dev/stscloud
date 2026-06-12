'use server';

import { promises as fs, createWriteStream } from 'fs';
import path from 'path';
import { spawn } from 'child_process';

/**
 * @fileOverview Server actions to handle ACTUAL server execution with real-time log streaming and status monitoring.
 */

/**
 * Checks if the actual OS process for a server is still running.
 */
export async function getServerProcessStatus(serverId: string) {
  const pidPath = path.join(process.cwd(), 'storage', 'servers', serverId, 'files', '.sts', 'run.pid');
  try {
    const pidStr = await fs.readFile(pidPath, 'utf8');
    const pid = parseInt(pidStr.trim());
    if (isNaN(pid)) return { running: false };
    
    // Signal 0 checks for process existence without killing it
    process.kill(pid, 0);
    return { running: true };
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
  const logPath = path.join(stsDir, 'logs', 'example.txt');
  const pidPath = path.join(stsDir, 'run.pid');
  
  const timestamp = () => `[${new Date().toISOString()}]`;

  // Helper to kill existing process
  const killExisting = async () => {
    try {
      const pidStr = await fs.readFile(pidPath, 'utf8');
      if (pidStr) {
        const pid = parseInt(pidStr.trim());
        try {
          process.kill(pid, 'SIGTERM');
        } catch (e) {
          // Process already dead
        }
        await fs.unlink(pidPath).catch(() => {});
      }
    } catch (e) {
      // PID file not found
    }
  };

  if (action === 'stop' || action === 'restart') {
    await killExisting();
    if (action === 'stop') {
      await fs.appendFile(logPath, `\n${timestamp()} [STS] SIGTERM received. Node is now offline.\n`);
      return { success: true };
    }
  }

  if (action === 'start' || action === 'restart') {
    try {
      // 1. Prepare Environment
      await fs.mkdir(path.dirname(logPath), { recursive: true });
      await fs.writeFile(logPath, `${timestamp()} [STS] Welcome to STSCloud.\n${timestamp()} [STS] Initializing boot sequence...\n`);

      const logStream = createWriteStream(logPath, { flags: 'a' });

      // 2. Dependency Check & Real-time Install
      const nodeModulesPath = path.join(filesDir, 'node_modules');
      try {
        await fs.access(nodeModulesPath);
        logStream.write(`${timestamp()} [STS] Dependencies found. Skipping install.\n`);
      } catch {
        logStream.write(`${timestamp()} [STS] node_modules not found. Running: npm install --production\n`);
        
        // Spawn npm install and wait for it
        await new Promise((resolve, reject) => {
          const installProcess = spawn('npm', ['install', '--production'], {
            cwd: filesDir,
            env: { ...process.env, NODE_ENV: 'production' }
          });

          installProcess.stdout?.on('data', (data) => logStream.write(data));
          installProcess.stderr?.on('data', (data) => logStream.write(data));

          installProcess.on('close', (code) => {
            if (code === 0) {
              logStream.write(`${timestamp()} [STS] Installation complete.\n`);
              resolve(true);
            } else {
              logStream.write(`${timestamp()} [ERROR] npm install failed with code ${code}\n`);
              reject(new Error('Installation failed'));
            }
          });

          installProcess.on('error', (err) => {
            logStream.write(`${timestamp()} [ERROR] Failed to start npm install: ${err.message}\n`);
            reject(err);
          });
        });
      }

      // 3. Prepare Command
      const commandParts = config.startupCommand.split(' ');
      const mainCmd = commandParts[0];
      const args = commandParts.slice(1);

      logStream.write(`${timestamp()} [STS] Executing: ${config.startupCommand}\n\n`);

      // 4. REAL SPAWN FOR USER SCRIPT
      const child = spawn(mainCmd, args, {
        cwd: filesDir,
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, NODE_ENV: 'production' }
      });

      // Stream output directly
      child.stdout?.on('data', (data) => logStream.write(data));
      child.stderr?.on('data', (data) => logStream.write(data));

      child.on('error', (err) => {
        const errLog = `\n${timestamp()} [ERROR] Failed to spawn process: ${err.message}\n`;
        fs.appendFile(logPath, errLog).catch(() => {});
      });

      child.on('close', (code) => {
        const exitLog = `\n${timestamp()} [STS] Process exited with code ${code}\n`;
        fs.appendFile(logPath, exitLog).catch(() => {});
      });

      // Save PID
      if (child.pid) {
        await fs.writeFile(pidPath, child.pid.toString());
      }

      // Detach so it keeps running
      child.unref();

      return { success: true };
    } catch (error: any) {
      const errorMsg = `\n${timestamp()} [ERROR] Boot failed: ${error.message}\n`;
      await fs.appendFile(logPath, errorMsg);
      return { success: false, error: error.message };
    }
  }

  return { success: true };
}
