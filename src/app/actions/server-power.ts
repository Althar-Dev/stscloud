'use server';

import { promises as fs, createWriteStream } from 'fs';
import path from 'path';
import { spawn, execSync } from 'child_process';

/**
 * @fileOverview Server actions to handle ACTUAL server execution using child_process.
 */

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
      const pid = await fs.readFile(pidPath, 'utf8');
      if (pid) {
        process.kill(parseInt(pid), 'SIGTERM');
        await fs.unlink(pidPath);
      }
    } catch (e) {
      // Process not running or file missing
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
      // Clear logs for new session
      await fs.mkdir(path.dirname(logPath), { recursive: true });
      await fs.writeFile(logPath, `${timestamp()} [STS] Welcome to STSCloud.\n${timestamp()} [STS] Initializing boot sequence...\n`);

      // 1. Dependency Check & Real Install
      const nodeModulesPath = path.join(filesDir, 'node_modules');
      try {
        await fs.access(nodeModulesPath);
        await fs.appendFile(logPath, `${timestamp()} [STS] Dependencies found. Skipping install.\n`);
      } catch {
        await fs.appendFile(logPath, `${timestamp()} [STS] node_modules not found. Running: npm install --production\n`);
        try {
          // Execute npm install synchronously to ensure it finishes before app starts
          // In a production env, this would be an async stream, but for reliability we wait here
          execSync('npm install --production', { cwd: filesDir, stdio: 'ignore', timeout: 300000 });
          await fs.appendFile(logPath, `${timestamp()} [STS] Installation complete.\n`);
        } catch (err: any) {
          await fs.appendFile(logPath, `${timestamp()} [ERROR] npm install failed: ${err.message}\n`);
          return { success: false, error: "Failed to install dependencies" };
        }
      }

      // 2. Prepare Command
      const commandParts = config.startupCommand.split(' ');
      const mainCmd = commandParts[0];
      const args = commandParts.slice(1);

      await fs.appendFile(logPath, `${timestamp()} [STS] Executing: ${config.startupCommand}\n`);

      // 3. REAL SPAWN
      const logStream = createWriteStream(logPath, { flags: 'a' });
      
      const child = spawn(mainCmd, args, {
        cwd: filesDir,
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, NODE_ENV: 'production' }
      });

      // Pipe output directly to log file
      child.stdout?.on('data', (data) => logStream.write(data));
      child.stderr?.on('data', (data) => logStream.write(data));

      child.on('error', (err) => {
        const errStream = createWriteStream(logPath, { flags: 'a' });
        errStream.write(`\n${timestamp()} [ERROR] Failed to spawn process: ${err.message}\n`);
        errStream.end();
      });

      // Save PID
      if (child.pid) {
        await fs.writeFile(pidPath, child.pid.toString());
      }

      // Detach the child process so it survives the Server Action lifecycle
      child.unref();

      return { success: true };
    } catch (error: any) {
      await fs.appendFile(logPath, `${timestamp()} [ERROR] Boot failed: ${error.message}\n`);
      return { success: false, error: error.message };
    }
  }

  return { success: true };
}
