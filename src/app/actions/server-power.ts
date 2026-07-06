"use server";

import { promises as fs, createWriteStream } from 'fs';
import path from 'path';
import { spawn, execSync } from 'child_process';
import gradient from 'gradient-string';
import crypto from 'crypto';

/**
 * @fileOverview Server actions to handle ACTUAL server execution with real-time log streaming.
 * Optimized for Python with local package isolation and robust binary detection.
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
 * Aggressively detects the available python binary path.
 */
function getPythonBinary(): string {
  // Standard binary names and absolute paths to check
  const candidates = [
    'python3', 
    'python', 
    '/usr/bin/python3', 
    '/usr/bin/python', 
    '/usr/local/bin/python3', 
    '/usr/local/bin/python',
    '/opt/homebrew/bin/python3'
  ];

  for (const bin of candidates) {
    try {
      // Check if command exists and returns a version
      execSync(`${bin} --version`, { stdio: 'ignore', timeout: 1500 });
      return bin;
    } catch (e) {}
  }
  
  // Try using 'which' to find it in system path
  try {
    const whichPython3 = execSync('which python3', { encoding: 'utf8' }).trim();
    if (whichPython3) return whichPython3;
  } catch (e) {}
  
  try {
    const whichPython = execSync('which python', { encoding: 'utf8' }).trim();
    if (whichPython) return whichPython;
  } catch (e) {}
  
  // Final desperate fallback
  return 'python3'; 
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

      const initialLogs = `${ascii}\n[STS] [${timestamp()}] Checking environment... ${green('Ok')}\n[STS] [${timestamp()}] Runtime: ${runtimeName} ${versionLabel}\n[STS] [${timestamp()}] System warming up...\n\n`;
      await fs.writeFile(logPath, initialLogs);

      // Background task to prevent Server Action Timeout (502)
      (async () => {
        const logStream = createWriteStream(logPath, { flags: 'a' });
        
        // --- Detection Phase ---
        let pythonBinary = 'python3';
        if (config.runtime === 'python') {
          pythonBinary = getPythonBinary();
          logStream.write(`[STS] [${timestamp()}] Found binary at: ${yellow(pythonBinary)}\n`);
        }

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
              logStream.write(`[STS] [${timestamp()}] Requirements changed. Installing to local directory...\n`);
              try { await fs.mkdir(localPkgDir, { recursive: true }); } catch {}

              const pipSuccess = await new Promise((resolve) => {
                // Use explicit detected path to avoid command not found
                const pipCmd = `${pythonBinary} -m pip install --upgrade --no-cache-dir --disable-pip-version-check --no-input -r requirements.txt --target .python_packages`;
                
                const pip = spawn(pipCmd, {
                  shell: true,
                  cwd: filesDir,
                  env: { ...process.env, PYTHONUNBUFFERED: '1', FORCE_COLOR: '1' }
                });

                pip.stdout?.on('data', (d) => logStream.write(d));
                pip.stderr?.on('data', (d) => logStream.write(d));
                pip.on('error', (err) => {
                  logStream.write(`[STS] [${timestamp()}] [ERROR] Pip launch error: ${err.message}\n`);
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
              if (!pipSuccess) logStream.write(`[STS] [${timestamp()}] [WARN] Proceeding despite pip failure.\n`);
            } else {
              logStream.write(`[STS] [${timestamp()}] requirements.txt is up to date.\n`);
            }
          }
        } else {
          // Node Logic
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
        let finalStartup = config.startupCommand;
        const localPkgDir = path.join(filesDir, '.python_packages');
        
        if (config.runtime === 'python') {
          // Ensure we use the detected absolute path and inject -u
          if (finalStartup.startsWith('python3 ')) {
            finalStartup = finalStartup.replace('python3', `${pythonBinary} -u`);
          } 
          else if (finalStartup.startsWith('python ')) {
            finalStartup = finalStartup.replace('python', `${pythonBinary} -u`);
          }
          else if (finalStartup === 'python3' || finalStartup === 'python') {
            finalStartup = `${pythonBinary} -u`;
          }
          else {
            // Fallback: try to replace any leading 'python' with the path
            finalStartup = finalStartup.replace(/^(python[3]?)/, `${pythonBinary} -u`);
          }
        } else {
          finalStartup = `npx -y -p node@${config.version} -- ${finalStartup}`;
        }

        logStream.write(`\n[STS] [${timestamp()}] Starting application: ${finalStartup}\n\n`);

        const child = spawn(finalStartup, {
          shell: true,
          cwd: filesDir,
          detached: true,
          stdio: ['ignore', 'pipe', 'pipe'],
          env: { 
            ...process.env, 
            PYTHONUNBUFFERED: '1', 
            PYTHONPATH: process.env.PYTHONPATH 
              ? `${localPkgDir}${path.delimiter}${process.env.PYTHONPATH}`
              : localPkgDir,
            FORCE_COLOR: '1'
          }
        });

        if (child.pid) await fs.writeFile(pidPath, child.pid.toString());

        child.stdout?.on('data', (d) => logStream.write(d));
        child.stderr?.on('data', (d) => logStream.write(d));

        child.on('error', (err) => {
          fs.appendFile(logPath, `[STS] [${timestamp()}] [ERROR] Startup failed: ${err.message}\n`).catch(() => {});
          fs.unlink(pidPath).catch(() => {});
        });

        child.on('close', (code) => {
          fs.appendFile(logPath, `\n[STS] [${timestamp()}] Process exited (code ${code})\n`).catch(() => {});
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
