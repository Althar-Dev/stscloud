
'use server';

import { promises as fs } from 'fs';
import path from 'path';

/**
 * @fileOverview Server actions to handle actual server execution logic.
 * In a production environment, this would interface with a Docker API or a daemon.
 * For this prototype, it manages the process state and logs via the file system.
 */

export async function executeServerPower(serverId: string, action: 'start' | 'stop' | 'restart', config: {
  nodeVersion: string;
  commandRun: string;
  entryFile: string;
  startupCommand: string;
}) {
  try {
    const logPath = path.join(process.cwd(), 'storage', 'servers', serverId, 'logs', 'example.txt');
    const timestamp = new Date().toISOString();
    
    // Ensure log directory exists
    await fs.mkdir(path.dirname(logPath), { recursive: true });

    let logMessage = '';

    if (action === 'start' || action === 'restart') {
      logMessage = `
[${timestamp}] [SYSTEM] Initializing Node.js v${config.nodeVersion} environment...
[${timestamp}] [SYSTEM] Setting up workdir: /home/stscloud/${serverId}
[${timestamp}] [SYSTEM] Executing: ${config.commandRun} ${config.entryFile || ''}
[${timestamp}] [DEBUG] Command: ${config.startupCommand}
[${timestamp}] [INFO] Starting application...
[${timestamp}] [SUCCESS] Application is now running on port 8080.
[${timestamp}] [LOG] Server listening at http://localhost:8080
`;
      if (action === 'restart') {
        const restartMsg = `\n[${timestamp}] [SYSTEM] Restart signal received. Re-booting node...\n`;
        await fs.appendFile(logPath, restartMsg);
      } else {
        await fs.writeFile(logPath, logMessage);
      }
    } else if (action === 'stop') {
      logMessage = `\n[${timestamp}] [SYSTEM] SIGTERM received. Shutting down gracefully...
[${timestamp}] [INFO] Process exited with code 0.
[${timestamp}] [SYSTEM] Server is now offline.
`;
      await fs.appendFile(logPath, logMessage);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Execution Error:', error);
    return { success: false, error: error.message };
  }
}
