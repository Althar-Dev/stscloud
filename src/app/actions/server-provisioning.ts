'use server';

import { promises as fs } from 'fs';
import path from 'path';

/**
 * @fileOverview Server provisioning logic for creating local directory structures.
 */

export async function provisionServerFiles(serverId: string) {
  try {
    const baseDir = path.join(process.cwd(), 'storage', 'servers', serverId);
    const filesDir = path.join(baseDir, 'files');
    const logsDir = path.join(baseDir, 'logs');

    // Create directories
    await fs.mkdir(filesDir, { recursive: true });
    await fs.mkdir(logsDir, { recursive: true });

    // Create example log file
    const exampleLogPath = path.join(logsDir, 'example.txt');
    const timestamp = new Date().toISOString();
    await fs.writeFile(exampleLogPath, `[${timestamp}] Node provisioned successfully.\n[${timestamp}] Welcome to STSCloud.`);

    return { success: true, path: baseDir };
  } catch (error: any) {
    console.error('Provisioning Error:', error);
    return { success: false, error: error.message };
  }
}
