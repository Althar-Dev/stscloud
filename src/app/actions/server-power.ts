"use server";

import { promises as fs, createWriteStream } from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import gradient from 'gradient-string';
import crypto from 'crypto';

/**
 * @fileOverview Server actions to handle ACTUAL server execution with real-time log streaming.
 * Enhanced with requirements.txt hashing and local dependency isolation via --target.
 */

async function getFileHash(filePath: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
  } catch {
    return "";
  }
}

export async function getServerProcessStatus(serverId: string) {
  const pidPath = path.join(process.cwd(), 'storage', 'servers', serverId, 'files', '.sts', 'run.pid');
  try {
    const pidStr = await fs.readFile(pidPath, 'utf8');
    const content = pidStr.trim();
    
    if (content === 'BOOTING') return { running: true, booting: true };
    
    const pid = parseInt(content);
    if (isNaN(pid)) return { running: false };
    
    try {
      process.kill(pid, 0);
      return { running: true, pid };
    } catch (e) {
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
  const hashPath = path.join(stsDir, 'req.hash');
  
  const timestamp = () => new Date().toLocaleTimeString('en-GB', { hour12: false });
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
          try { process.kill(-pid, 'SIGKILL'); } catch (e) {
            try { process.kill(pid, 'SIGKILL'); } catch (e2) {}
          }
        }
      }
    } catch (e) {}
    await fs.unlink(pidPath).catch(() => {});
  };

  if (action === 'stop' || action === 'restart') {
    await fs.appendFile(logPath, `[STS] [${timestamp()}] Terminating process... Status: Offline.\n`);
    await killExisting();
    if (action === 'restart') await new Promise(resolve => setTimeout(resolve, 1000));
    if (action === 'stop') return { success: true };
  }

  if (action === 'start' || action === 'restart') {
    try {
      await fs.mkdir(path.dirname(logPath), { recursive: true });
      await fs.mkdir(path.dirname(pidPath), { recursive: true });
      await fs.writeFile(pidPath, 'BOOTING');

      const asciiRaw = `░█▀▀░▀█▀░█▀▀░█▀▀░█░░░█▀█░█░█░█▀▄
░▀▀█░░█░░▀▀█░█░░░█░░░█░█░█░█░█░█
░▀▀▀░░▀░░▀▀▀░▀▀▀░▀▀▀░▀▀▀░▀▀▀░▀▀░`;
      const ascii = gradient(['#4f46e5', '#4f46e5'])(asciiRaw);
      
      const runtimeName = config.runtime === 'python' ? 'Python' : 'Node.Js';
      const versionLabel = config.runtime === 'python' ? config.version : `v${config.version}`;

      const initialLogs = `${ascii}\n[STS] [${timestamp()}] Checking disk... ${green('Ok')}\n[STS] [${timestamp()}] Runtime: ${runtimeName} ${versionLabel}\n[STS] [${timestamp()}] Environment warming up...\n\n`;
      await fs.writeFile(logPath, initialLogs);

      (async () => {
        const logStream = createWriteStream(logPath, { flags: 'a' });
        
        // --- Dependency Phase ---
        if (config.runtime === 'python') {
          const reqPath = path.join(filesDir, 'requirements.txt');
          const localPkgDir = path.join(filesDir, '.python_packages');
          let hasReq = false;
          try { await fs.access(reqPath); hasReq = true; } catch {}

          if (hasReq) {
            const currentHash = await getFileHash(reqPath);
            let oldHash = "";
            try { oldHash = await fs.readFile(hashPath, 'utf8'); } catch {}

            if (currentHash !== oldHash) {
              logStream.write(`[STS] [${timestamp()}] Changes detected in requirements.txt. Installing to local directory...\n`);
              
              // Ensure local packages directory exists
              try { await fs.mkdir(localPkgDir, { recursive: true }); } catch {}

              await new Promise((resolve) => {
                const pip = spawn('python3', [
                  '-m', 'pip', 'install', 
                  '--upgrade', 
                  '-r', 'requirements.txt', 
                  '--target', '.python_packages'
                ], {
                  cwd: filesDir,
                  env: { ...process.env, PYTHONUNBUFFERED: '1', FORCE_COLOR: '1' }
                });
                pip.stdout?.on('data', (d) => logStream.write(d));
                pip.stderr?.on('data', (d) => logStream.write(d));
                pip.on('close', async (code) => {
                  if (code === 0) await fs.writeFile(hashPath, currentHash);
                  logStream.write(`[STS] [${timestamp()}] Pip finished (code ${code})\n`);
                  resolve(true);
                });
              });
            } else {
              logStream.write(`[STS] [${timestamp()}] No changes in requirements.txt. Using cached .python_packages.\n`);
            }
          }
        } else {
          const pkgPath = path.join(filesDir, 'package.json');
          const modPath = path.join(filesDir, 'node_modules');
          let hasPkg = false, hasMod = false;
          try { await fs.access(pkgPath); hasPkg = true; } catch {}
          try { await fs.access(modPath); hasMod = true; } catch {}

          if (hasPkg && !hasMod) {
            logStream.write(`[STS] [${timestamp()}] Missing node_modules. Running npm install...\n`);
            await new Promise((resolve) => {
              const npm = spawn('npx', ['-y', '-p', `node@${config.version}`, '--', 'npm', 'install', '--production'], {
                cwd: filesDir,
                env: { ...process.env, NODE_ENV: 'production', FORCE_COLOR: '1' }
              });
              npm.stdout?.on('data', (d) => logStream.write(d));
              npm.stderr?.on('data', (d) => logStream.write(d));
              npm.on('close', (code) => {
                logStream.write(`[STS] [${timestamp()}] Npm finished (code ${code})\n`);
                resolve(true);
              });
            });
          }
        }

        // --- Execution Phase ---
        logStream.write(`\n[STS] [${timestamp()}] Starting application: ${config.startupCommand}\n\n`);

        const cmdParts = config.startupCommand.split(' ');
        let child;

        if (config.runtime === 'python') {
          const runner = config.commandRun || 'python3';
          let args = cmdParts;
          if (cmdParts[0] === runner || cmdParts[0] === 'python') args = cmdParts.slice(1);
          
          // Construct PYTHONPATH to include the local target directory
          const localPkgDir = path.join(filesDir, '.python_packages');
          const pythonPath = process.env.PYTHONPATH 
            ? `${localPkgDir}${path.delimiter}${process.env.PYTHONPATH}`
            : localPkgDir;

          child = spawn(runner, ['-u', ...args], {
            cwd: filesDir,
            detached: true,
            stdio: ['ignore', 'pipe', 'pipe'],
            env: { 
              ...process.env, 
              PYTHONUNBUFFERED: '1', 
              PYTHONIOENCODING: 'utf-8',
              FORCE_COLOR: '1',
              PYTHONPATH: pythonPath // Tell Python to look into our local folder
            }
          });
        } else {
          child = spawn('npx', ['-y', '-p', `node@${config.version}`, '--', ...cmdParts], {
            cwd: filesDir,
            detached: true,
            stdio: ['ignore', 'pipe', 'pipe'],
            env: { ...process.env, NODE_ENV: 'production', FORCE_COLOR: '1' }
          });
        }

        if (child.pid) await fs.writeFile(pidPath, child.pid.toString());

        child.stdout?.on('data', (d) => logStream.write(d));
        child.stderr?.on('data', (d) => logStream.write(d));

        child.on('close', (code) => {
          fs.appendFile(logPath, `\n[STS] [${timestamp()}] Process exited with code ${code}\n`).catch(() => {});
          fs.unlink(pidPidPath).catch(() => {});
        });

        child.unref();
      })().catch(err => {
        fs.appendFile(logPath, `\n[STS] [${timestamp()}] [ERROR] ${err.message}\n`).catch(() => {});
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
