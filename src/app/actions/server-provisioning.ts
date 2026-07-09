
'use server';

import { promises as fs } from 'fs';
import path from 'path';

/**
 * @fileOverview Server provisioning logic for creating local directory structures.
 * Updated: Storage moved outside project root (../storage).
 */

export async function provisionServerFiles(serverId: string) {
  try {
    const baseDir = path.join(process.cwd(), '..', 'storage', 'servers', serverId);
    const filesDir = path.join(baseDir, 'files');
    const logsDir = path.join(filesDir, '.sts', 'logs');

    await fs.mkdir(filesDir, { recursive: true });
    await fs.mkdir(logsDir, { recursive: true });

    const logPath = path.join(logsDir, 'logs.sts');
    const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
    const initialLogs = `[STS] [${time}] Welcome to STSCloud.
[STS] [${time}] Node provisioned successfully.
[STS] [${time}] Ready for deployment.
[STS] [${time}] Use Start button to boot the application.\n`;
    
    await fs.writeFile(logPath, initialLogs);

    return { success: true, path: baseDir };
  } catch (error: any) {
    console.error('Provisioning Error:', error);
    return { success: false, error: error.message };
  }
}
