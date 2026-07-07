"use server";

import { promises as fs, createWriteStream } from 'fs';
import path from 'path';
import { spawn, execSync } from 'child_process';
import crypto from 'crypto';
import { getServerDiskUsage } from './server-files';
import { sendResourceLimitNotification } from '@/lib/email/notifications';

/**
 * @fileOverview Server actions to handle ACTUAL server execution with real-time log streaming.
 * Features: Strict Resource Guard (Disk/CPU/RAM) and Email Alerts.
 * Fixed: "Unlimited" parsing logic to prevent false failures.
 */

async function getFileHash(filePath: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
  } catch {
    return "";
  }
}

function getPythonBinary(): string {
  const absolutePaths = [
    '/usr/bin/python3', 
    '/usr/bin/python', 
    '/usr/local/bin/python3', 
    '/usr/local/bin/python',
    '/opt/homebrew/bin/python3',
    '/bin/python3',
    '/bin/python'
  ];

  for (const bin of absolutePaths) {
    try {
      execSync(`${bin} --version`, { stdio: 'ignore', timeout: 1500 });
      return bin;
    } catch (e) {}
  }
  return 'python3'; 
}

function parseResourceToKB(str: string = ""): number {
  if (str.toUpperCase() === "UNLIMITED") return Number.MAX_SAFE_INTEGER;
  const val = parseFloat(str);
  if (isNaN(val)) return 0;
  const upper = str.toUpperCase();
  if (upper.includes("GB")) return val * 1024 * 1024;
  if (upper.includes("MB")) return val * 1024;
  return val; 
}

function parseDiskToMB(str: string = ""): number {
  if (str.toUpperCase() === "UNLIMITED") return Number.MAX_SAFE_INTEGER;
  const val = parseFloat(str);
  if (isNaN(val)) return 0;
  if (str.toUpperCase().includes("GB")) return val * 1024;
  return val;
}

export async function getServerProcessStatus(serverId: string, config?: { ramLimit: string; cpuLimit: string; serverName: string; userEmail: string }) {
  const pidPath = path.join(process.cwd(), 'storage', 'servers', serverId, 'files', '.sts', 'run.pid');
  try {
    const pidStr = await fs.readFile(pidPath, 'utf8');
    const content = pidStr.trim();
    
    if (content === 'BOOTING') return { running: true, booting: true };
    
    const pid = parseInt(content);
    if (isNaN(pid)) return { running: false };
    
    try {
      process.kill(pid, 0);
      
      // Strict Resource Monitoring
      if (config && config.userEmail) {
        try {
          const stats = execSync(`ps -p ${pid} -o %cpu,rss --no-headers`, { encoding: 'utf8' }).trim().split(/\s+/);
          const cpuUsage = parseFloat(stats[0]);
          const ramUsageKB = parseFloat(stats[1]);
          
          const cpuLimit = config.cpuLimit.toUpperCase() === "UNLIMITED" ? Number.MAX_SAFE_INTEGER : (parseFloat(config.cpuLimit) || 100);
          const ramLimitKB = parseResourceToKB(config.ramLimit) || (1.5 * 1024 * 1024);
          
          // CPU Guard (Strict check with 0.5% jitter tolerance)
          if (cpuUsage > cpuLimit + 0.5) {
             process.kill(-pid, 'SIGKILL');
             await fs.unlink(pidPath).catch(() => {});
             sendResourceLimitNotification(config.userEmail, config.serverName, 'CPU', `${cpuUsage}%`, config.cpuLimit);
             return { running: false, killed: 'CPU' };
          }
          
          // RAM Guard
          if (ramUsageKB > ramLimitKB) {
             process.kill(-pid, 'SIGKILL');
             await fs.unlink(pidPath).catch(() => {});
             const actualMB = (ramUsageKB / 1024).toFixed(1);
             sendResourceLimitNotification(config.userEmail, config.serverName, 'RAM', `${actualMB}MB`, config.ramLimit);
             return { running: false, killed: 'RAM' };
          }
        } catch (e) {}
      }

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
  limits?: { ram: string; disk: string; cpu: string };
  serverName?: string;
  userEmail?: string;
}) {
  const baseDir = path.join(process.cwd(), 'storage', 'servers', serverId);
  const filesDir = path.join(baseDir, 'files');
  const stsDir = path.join(filesDir, '.sts');
  const logPath = path.join(stsDir, 'logs', 'logs.sts');
  const pidPath = path.join(stsDir, 'run.pid');
  const hashPath = path.join(stsDir, 'req.hash');
  
  const timestamp = () => new Date().toLocaleTimeString('en-GB', { hour12: false });
  const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
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
    await killExisting();
    if (action === 'restart') await new Promise(resolve => setTimeout(resolve, 1000));
    if (action === 'stop') return { success: true };
  }

  if (action === 'start' || action === 'restart') {
    try {
      await fs.mkdir(path.dirname(logPath), { recursive: true });
      await fs.mkdir(path.dirname(pidPath), { recursive: true });
      await fs.writeFile(pidPath, 'BOOTING');

      const ascii = `\x1b[38;2;79;70;229m
░█▀▀░▀█▀░█▀▀░█▀▀░█░░░█▀█░█░█░█▀▄
░▀▀█░░█░░▀▀█░█░░░█░░░█░█░█░█░█░█
░▀▀▀░░▀░░▀▀▀░▀▀▀░▀▀▀░▀▀▀░▀▀▀░▀▀░\x1b[0m`;
      
      const runtimeName = config.runtime === 'python' ? 'Python' : 'Node.Js';
      const versionLabel = config.runtime === 'python' ? config.version : `v${config.version}`;

      let initialLogs = `${ascii}\n[STS] [${timestamp()}] Checking environment... ${green('Ok')}\n`;
      initialLogs += `[STS] [${timestamp()}] Runtime: ${runtimeName} ${versionLabel}\n`;
      initialLogs += `[STS] [${timestamp()}] Checking available disk... `;
      
      const diskRes = await getServerDiskUsage(serverId);
      const currentMB = diskRes.sizeInMB || 0;
      const limitLabel = config.limits?.disk || "2GB";
      const limitMB = parseDiskToMB(limitLabel);

      if (currentMB > limitMB) {
        initialLogs += `(${currentMB.toFixed(1)}MB/${limitLabel}) ${red('Failed')}\n[STS] [${timestamp()}] [ERROR] Disk usage exceeds allocation limit.\n`;
        await fs.writeFile(logPath, initialLogs);
        await fs.unlink(pidPath).catch(() => {});
        if (config.userEmail && config.serverName) {
           sendResourceLimitNotification(config.userEmail, config.serverName, 'Disk', `${currentMB.toFixed(1)}MB`, limitLabel);
        }
        return { success: false, error: "Disk limit reached" };
      }

      initialLogs += `(${currentMB.toFixed(1)}MB/${limitLabel}) ${green('Ok')}\n[STS] [${timestamp()}] System warming up...\n`;
      await fs.writeFile(logPath, initialLogs);

      (async () => {
        const logStream = createWriteStream(logPath, { flags: 'a' });
        let pythonBinary = 'python3';
        if (config.runtime === 'python') pythonBinary = getPythonBinary();

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
              logStream.write(`[STS] [${timestamp()}] Requirements changed. Syncing local packages...\n`);
              try { await fs.mkdir(localPkgDir, { recursive: true }); } catch {}

              const pipSuccess = await new Promise((resolve) => {
                const pipCmd = `"${pythonBinary}" -m pip install --prefer-binary --disable-pip-version-check --no-input -r requirements.txt --target .python_packages`;
                const pip = spawn(pipCmd, {
                  shell: true,
                  cwd: filesDir,
                  env: { ...process.env, PYTHONUNBUFFERED: '1', FORCE_COLOR: '1' }
                });
                pip.stdout?.on('data', (d) => logStream.write(d));
                pip.stderr?.on('data', (d) => logStream.write(d));
                pip.on('close', async (code) => {
                  if (code === 0) {
                    await fs.writeFile(hashPath, currentHash);
                    logStream.write(`[STS] [${timestamp()}] Pip synchronization complete.\n`);
                    resolve(true);
                  } else {
                    logStream.write(`[STS] [${timestamp()}] [ERROR] Pip failed with code ${code}\n`);
                    resolve(false);
                  }
                });
              });
              if (!pipSuccess) logStream.write(`[STS] [${timestamp()}] [WARN] Proceeding with partial/existing packages.\n`);
            } else {
              logStream.write(`[STS] [${timestamp()}] Requirements satisfied (cached).\n`);
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
                logStream.write(`[STS] [${timestamp()}] Install finished (code ${code})`);
                resolve(true);
              });
            });
          }
        }

        let finalStartup = config.startupCommand;
        const localPkgDir = path.join(filesDir, '.python_packages');
        
        if (config.runtime === 'python') {
          const quotedBin = `"${pythonBinary}"`;
          if (finalStartup.startsWith('python3 ')) finalStartup = finalStartup.replace('python3', `${quotedBin} -u`);
          else if (finalStartup.startsWith('python ')) finalStartup = finalStartup.replace('python', `${quotedBin} -u`);
          else if (finalStartup === 'python3' || finalStartup === 'python') finalStartup = `${quotedBin} -u`;
          else finalStartup = finalStartup.replace(/^(python[3]?)/, `${quotedBin} -u`);
        } else {
          finalStartup = `npx -y -p node@${config.version} -- ${finalStartup}`;
        }

        logStream.write(`\n[STS] [${timestamp()}] Starting application\n`);

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
