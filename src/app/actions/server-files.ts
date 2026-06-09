'use server';

import { promises as fs } from 'fs';
import path from 'path';

/**
 * @fileOverview Server actions for managing server-specific files and logs.
 */

export async function getServerFiles(serverId: string) {
  try {
    const serverPath = path.join(process.cwd(), 'storage', 'servers', serverId, 'files');
    
    // Check if directory exists
    try {
      await fs.access(serverPath);
    } catch {
      return { success: false, error: 'Storage not found' };
    }

    const entries = await fs.readdir(serverPath, { withFileTypes: true });
    
    const files = await Promise.all(entries.map(async (entry) => {
      const fullPath = path.join(serverPath, entry.name);
      const stats = await fs.stat(fullPath);
      
      return {
        name: entry.name,
        type: entry.isDirectory() ? 'folder' : 'file',
        size: entry.isDirectory() ? '--' : `${(stats.size / 1024).toFixed(1)} KB`,
        modified: stats.mtime.toLocaleDateString(),
      };
    }));

    return { success: true, files };
  } catch (error: any) {
    console.error('File Error:', error);
    return { success: false, error: error.message };
  }
}

export async function getServerLogs(serverId: string) {
  try {
    const logPath = path.join(process.cwd(), 'storage', 'servers', serverId, 'logs', 'example.txt');
    
    try {
      await fs.access(logPath);
      const content = await fs.readFile(logPath, 'utf8');
      return { success: true, content };
    } catch {
      return { success: true, content: '[SYSTEM] No logs available yet.' };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getServerDiskUsage(serverId: string) {
  try {
    const serverPath = path.join(process.cwd(), 'storage', 'servers', serverId, 'files');
    
    let totalSizeBytes = 0;
    
    async function calculateSize(dirPath: string) {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          await calculateSize(fullPath);
        } else {
          const stats = await fs.stat(fullPath);
          totalSizeBytes += stats.size;
        }
      }
    }

    try {
      await calculateSize(serverPath);
    } catch {
      return { success: true, sizeInMB: 0 };
    }

    return { success: true, sizeInMB: totalSizeBytes / (1024 * 1024) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
