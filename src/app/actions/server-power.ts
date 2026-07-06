"use server";

import { promises as fs, createWriteStream } from 'fs';
import path from 'path';
import { spawn, execSync } from 'child_process';
import gradient from 'gradient-string';
import crypto from 'crypto';

/**
 * @fileOverview Server actions to handle ACTUAL server execution with real-time log streaming.
 * Enhanced with requirements.txt hashing, local dependency isolation, and shell-based spawning.
 */

async function getFileHash(filePath: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
  } catch {
    return "";
  }
}

/**
 * Detects the available python binary on the system (python3 or python).
 */
function getPythonBinary(): string {
  try {
    execSync('python3 --version', { stdio: 'ignore' });
    return 'python3';
  } catch {
    try {
      execSync('python --version', { stdio: 'ignore' });
      return 'python';
    } catch {
      return 'python3'; // Fallback to python3 and let it fail with a clear log
    }
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
      // Check if process exists
      process.kill(pid, 0);
      return { running: true, pid };
    } catch (e) {
      // Process is dead, clean up pid file
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

  const killExisting = async () => {
    try {
      const pidStr = await fs.readFile(pidPath, 'utf8');
      const trimmedPid = pidStr?.trim();
      if (trimmedPid && trimmedPid !== 'BOOTING') {
        const pid = parseInt(trimmedPid);
        if (!isNaN(pid)) {
          // Attempt to kill process group if possible
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

      const initialLogs = `${ascii}\n[STS] [${timestamp()}] Checking environment... ${green('Ok')}\n[STS] [${timestamp()}] Runtime: ${runtimeName} ${versionLabel}\n[STS] [${timestamp()}] System warming up...\n\n`;
      await fs.writeFile(logPath, initialLogs);

      (async () => {
        const logStream = createWriteStream(logPath, { flags: 'a' });
        const pythonBinary = getPythonBinary();
        
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
              logStream.write(`[STS] [${timestamp()}] Changes in requirements.txt detected. Installing packages to local directory...\n`);
              
              try { await fs.mkdir(localPkgDir, { recursive: true }); } catch {}

              const pipSuccess = await new Promise((resolve) => {
                // Use detected python binary for pip
                const pipCmd = `${pythonBinary} -m pip install --upgrade --no-cache-dir --disable-pip-version-check --no-input -r requirements.txt --target .python_packages`;
                
                const pip = spawn(pipCmd, {
                  shell: true,
                  cwd: filesDir,
                  env: { ...process.env, PYTHONUNBUFFERED: '1', FORCE_COLOR: '1' }
                });

                pip.stdout?.on('data', (d) => logStream.write(d));
                pip.stderr?.on('data', (d) => logStream.write(d));

                pip.on('error', (err) => {
                  logStream.write(`[STS] [${timestamp()}] [ERROR] Failed to launch pip: ${err.message}\n`);
                  resolve(false);
                });

                pip.on('close', async (code) => {
                  if (code === 0) {
                    await fs.writeFile(hashPath, currentHash);
                    logStream.write(`[STS] [${timestamp()}] Pip finished successfully.\n`);
                    resolve(true);
                  } else {
                    logStream.write(`[STS] [${timestamp()}] [ERROR] Pip failed with code ${code}\n`);
                    resolve(false);
                  }
                });
              });

              if (!pipSuccess) {
                 logStream.write(`[STS] [${timestamp()}] [WARN] Proceeding with existing packages despite pip failure.\n`);
              }
            } else {
              logStream.write(`[STS] [${timestamp()}] requirements.txt is up to date. Using cached .python_packages.\n`);
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
              const npmCmd = `npx -y -p node@${config.version} -- npm install --production`;
              const npm = spawn(npmCmd, {
                shell: true,
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

        let child;

        if (config.runtime === 'python') {
          const localPkgDir = path.join(filesDir, '.python_packages');
          const pythonPath = process.env.PYTHONPATH 
            ? `${localPkgDir}${path.delimiter}${process.env.PYTHONPATH}`
            : localPkgDir;

          // Replace python3 or python with the detected binary and add -u
          let finalStartup = config.startupCommand;
          if (finalStartup.startsWith('python3 ') || finalStartup === 'python3') {
            finalStartup = finalStartup.replace('python3', `${pythonBinary} -u`);
          } else if (finalStartup.startsWith('python ') || finalStartup === 'python') {
            finalStartup = finalStartup.replace('python', `${pythonBinary} -u`);
          } else if (!finalStartup.includes(' -u ')) {
             // If custom command, try to inject -u after binary
             finalStartup = finalStartup.replace(/^(python[3]?)/, `$1 -u`);
          }

          child = spawn(finalStartup, {
            shell: true,
            cwd: filesDir,
            detached: true,
            stdio: ['ignore', 'pipe', 'pipe'],
            env: { 
              ...process.env, 
              PYTHONUNBUFFERED: '1', 
              PYTHONIOENCODING: 'utf-8',
              FORCE_COLOR: '1',
              PYTHONPATH: pythonPath
            }
          });
        } else {
          const nodeCmd = `npx -y -p node@${config.version} -- ${config.startupCommand}`;
          child = spawn(nodeCmd, {
            shell: true,
            cwd: filesDir,
            detached: true,
            stdio: ['ignore', 'pipe', 'pipe'],
            env: { ...process.env, NODE_ENV: 'production', FORCE_COLOR: '1' }
          });
        }

        if (child.pid) await fs.writeFile(pidPath, child.pid.toString());

        child.stdout?.on('data', (d) => logStream.write(d));
        child.stderr?.on('data', (d) => logStream.write(d));

        child.on('error', (err) => {
          fs.appendFile(logPath, `[STS] [${timestamp()}] [ERROR] Failed to start application: ${err.message}\n`).catch(() => {});
          fs.unlink(pidPath).catch(() => {});
        });

        child.on('close', (code) => {
          fs.appendFile(logPath, `\n[STS] [${timestamp()}] Process exited with code ${code}\n`).catch(() => {});
          fs.unlink(pidPath).catch(() => {});
        });

        child.unref();
      })().catch(err => {
        fs.appendFile(logPath, `\n[STS] [${timestamp()}] [SYSTEM ERROR] ${err.message}\n`).catch(() => {});
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
