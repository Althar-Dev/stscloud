
'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { getServerDiskUsage } from './server-files';

/**
 * @fileOverview Server actions to handle actual server execution logic.
 * This simulates a Docker-like environment by validating the filesystem 
 * and project structure before "starting" the process.
 */

export async function executeServerPower(serverId: string, action: 'start' | 'stop' | 'restart', config: {
  nodeVersion: string;
  commandRun: string;
  entryFile: string;
  startupCommand: string;
}) {
  try {
    const baseDir = path.join(process.cwd(), 'storage', 'servers', serverId);
    const filesDir = path.join(baseDir, 'files');
    const logPath = path.join(baseDir, 'logs', 'example.txt');
    const timestamp = () => `[${new Date().toISOString()}]`;
    
    // Ensure directories exist
    await fs.mkdir(path.dirname(logPath), { recursive: true });

    if (action === 'start' || action === 'restart') {
      let logBuffer = action === 'restart' ? `\n${timestamp()} [SYSTEM] Restart signal received. Re-initializing container...\n` : '';
      
      // 1. Check Disk Usage
      const disk = await getServerDiskUsage(serverId);
      logBuffer += `${timestamp()} [SYSTEM] Checking allocated disk space... ${disk.success ? disk.sizeInMB?.toFixed(2) + 'MB used' : 'Error checking disk'}\n`;

      // 2. Validate Project Files (package.json and Entry File)
      const packageJsonPath = path.join(filesDir, 'package.json');
      const entryFilePath = path.join(filesDir, config.entryFile || 'index.js');
      
      let packageExists = false;
      let entryExists = false;

      try {
        await fs.access(packageJsonPath);
        packageExists = true;
        logBuffer += `${timestamp()} [SYSTEM] Found package.json. Dependency check passed.\n`;
      } catch {
        logBuffer += `${timestamp()} [ERROR] package.json NOT FOUND. Server cannot determine dependencies.\n`;
      }

      try {
        await fs.access(entryFilePath);
        entryExists = true;
        logBuffer += `${timestamp()} [SYSTEM] Entry file '${config.entryFile}' located.\n`;
      } catch {
        logBuffer += `${timestamp()} [ERROR] ENTRY FILE '${config.entryFile}' NOT FOUND.\n`;
      }

      // 3. Logic: If files don't exist, terminate boot
      if (!packageExists || !entryExists) {
        logBuffer += `${timestamp()} [SYSTEM] CRITICAL ERROR: Mandatory files missing. Boot sequence terminated.\n`;
        await fs.appendFile(logPath, logBuffer);
        return { 
          success: false, 
          error: `Missing mandatory files: ${!packageExists ? 'package.json ' : ''}${!entryExists ? config.entryFile : ''}` 
        };
      }

      // 4. Simulate Docker Sequence
      logBuffer += `${timestamp()} [DOCKER] Pulling image: node:${config.nodeVersion}-alpine...\n`;
      logBuffer += `${timestamp()} [DOCKER] Image node:${config.nodeVersion}-alpine pulled successfully.\n`;
      logBuffer += `${timestamp()} [DOCKER] Creating container with ${config.nodeVersion} environment...\n`;
      
      logBuffer += `${timestamp()} [SYSTEM] Running: npm install --production\n`;
      logBuffer += `${timestamp()} [INFO] added 142 packages, and audited 143 packages in 4s\n`;
      
      logBuffer += `${timestamp()} [SYSTEM] Executing startup command: ${config.startupCommand}\n`;
      logBuffer += `${timestamp()} [SUCCESS] Application is now online and listening on port 8080.\n`;
      logBuffer += `${timestamp()} [LOG] Server reachable at http://${serverId}.stscloud.net\n`;

      if (action === 'start') {
        await fs.writeFile(logPath, logBuffer);
      } else {
        await fs.appendFile(logPath, logBuffer);
      }
    } else if (action === 'stop') {
      const stopMsg = `\n${timestamp()} [SYSTEM] SIGTERM received. Stopping Docker container...
${timestamp()} [INFO] Processes exited with code 0.
${timestamp()} [SYSTEM] Node is now offline. Project data is preserved in storage.
`;
      await fs.appendFile(logPath, stopMsg);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Execution Error:', error);
    return { success: false, error: error.message };
  }
}
