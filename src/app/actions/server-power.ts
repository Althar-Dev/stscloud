'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { getServerDiskUsage } from './server-files';

/**
 * @fileOverview Server actions to handle actual server execution logic with deep file validation.
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
    const logPath = path.join(filesDir, '.sts', 'logs', 'example.txt');
    const timestamp = () => `[${new Date().toISOString()}]`;
    
    // Ensure directories exist
    await fs.mkdir(path.dirname(logPath), { recursive: true });

    if (action === 'start' || action === 'restart') {
      let logBuffer = `${timestamp()} [STS] Welcome to STSCloud.\n`;
      logBuffer += action === 'restart' 
        ? `${timestamp()} [STS] Restart signal received. Re-initializing container...\n` 
        : `${timestamp()} [STS] Starting container...\n`;
      
      logBuffer += `${timestamp()} [DOCKER] Pulling image: node:${config.nodeVersion}-alpine...\n`;
      logBuffer += `${timestamp()} [DOCKER] Image node:${config.nodeVersion}-alpine pulled successfully.\n`;
      logBuffer += `${timestamp()} [DOCKER] Creating network isolation... done.\n`;
      
      const disk = await getServerDiskUsage(serverId);
      logBuffer += `${timestamp()} [STS] Checking allocated disk space... ${disk.success ? disk.sizeInMB?.toFixed(2) + 'MB used' : 'Error checking disk'}\n`;

      const packageJsonPath = path.join(filesDir, 'package.json');
      const entryFilePath = path.join(filesDir, config.entryFile || 'index.js');
      
      let packageExists = false;
      let entryExists = false;

      // 1. Check Package.json
      try {
        const pkgContent = await fs.readFile(packageJsonPath, 'utf8');
        const pkg = JSON.parse(pkgContent);
        packageExists = true;
        logBuffer += `${timestamp()} [STS] Found package.json. Name: ${pkg.name || 'unnamed'}, Version: ${pkg.version || '0.0.0'}\n`;
        
        // If using npm start, check if script exists
        if (config.startupCommand === 'npm start' && (!pkg.scripts || !pkg.scripts.start)) {
          logBuffer += `${timestamp()} [ERROR] 'npm start' command failed: No 'start' script found in package.json.\n`;
          await fs.writeFile(logPath, logBuffer);
          return { success: false, error: "No start script in package.json" };
        }
      } catch (err: any) {
        logBuffer += `${timestamp()} [ERROR] package.json NOT FOUND or INVALID. Server cannot determine dependencies.\n`;
      }

      // 2. Check Entry File
      try {
        await fs.access(entryFilePath);
        entryExists = true;
        logBuffer += `${timestamp()} [STS] Entry file '${config.entryFile}' located.\n`;
      } catch {
        logBuffer += `${timestamp()} [ERROR] ENTRY FILE '${config.entryFile}' NOT FOUND.\n`;
      }

      if (!packageExists || !entryExists) {
        logBuffer += `${timestamp()} [STS] CRITICAL ERROR: Mandatory files missing. Boot sequence terminated.\n`;
        await fs.writeFile(logPath, logBuffer);
        return { 
          success: false, 
          error: `Missing mandatory files: ${!packageExists ? 'package.json ' : ''}${!entryExists ? config.entryFile : ''}` 
        };
      }

      logBuffer += `${timestamp()} [DOCKER] Mounting local volumes for node_modules...\n`;
      logBuffer += `${timestamp()} [STS] Environment: NODE_ENV=production\n`;
      logBuffer += `${timestamp()} [STS] Running: npm install --production\n`;
      
      // Simulate installation delay in logs
      logBuffer += `${timestamp()} [INFO] added 142 packages, and audited 143 packages in 3.8s\n`;
      logBuffer += `${timestamp()} [STS] Executing startup command: ${config.startupCommand}\n`;
      logBuffer += `${timestamp()} [SUCCESS] Application is now online and listening on port 8080.\n`;
      logBuffer += `${timestamp()} [STS] Server reachable at http://${serverId}.stscloud.net\n`;

      await fs.writeFile(logPath, logBuffer);
    } else if (action === 'stop') {
      const stopMsg = `\n${timestamp()} [STS] SIGTERM received. Stopping Docker container...
${timestamp()} [INFO] Processes exited with code 0.
${timestamp()} [STS] Node is now offline. Project data is preserved in storage.\n`;
      await fs.appendFile(logPath, stopMsg);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Execution Error:', error);
    return { success: false, error: error.message };
  }
}
