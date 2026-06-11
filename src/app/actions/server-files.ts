
'use server';

import { promises as fs } from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

/**
 * @fileOverview Server actions for managing server-specific files and logs with sub-directory support.
 */

function getSafePath(serverId: string, subPath: string = '') {
  const baseDir = path.join(process.cwd(), 'storage', 'servers', serverId, 'files');
  const finalPath = path.join(baseDir, subPath);
  
  // Basic security check to prevent directory traversal
  if (!finalPath.startsWith(baseDir)) {
    throw new Error('Invalid path access');
  }
  return finalPath;
}

export async function getServerFiles(serverId: string, subPath: string = '') {
  try {
    const targetPath = getSafePath(serverId, subPath);
    
    // Check if directory exists
    try {
      await fs.access(targetPath);
    } catch {
      await fs.mkdir(targetPath, { recursive: true });
    }

    const entries = await fs.readdir(targetPath, { withFileTypes: true });
    
    const files = await Promise.all(entries.map(async (entry) => {
      const fullPath = path.join(targetPath, entry.name);
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

export async function createServerFile(serverId: string, fileName: string, subPath: string = '') {
  try {
    const filePath = path.join(getSafePath(serverId, subPath), fileName);
    await fs.writeFile(filePath, '');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function uploadServerFile(serverId: string, fileName: string, base64Content: string, subPath: string = '') {
  try {
    const filePath = path.join(getSafePath(serverId, subPath), fileName);
    const buffer = Buffer.from(base64Content, 'base64');
    await fs.writeFile(filePath, buffer);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function unarchiveServerFile(serverId: string, fileName: string, subPath: string = '') {
  try {
    const currentDirPath = getSafePath(serverId, subPath);
    const filePath = path.join(currentDirPath, fileName);
    
    const zip = new AdmZip(filePath);
    zip.extractAllTo(currentDirPath, true);
    
    return { success: true };
  } catch (error: any) {
    console.error('Unarchive Error:', error);
    return { success: false, error: error.message };
  }
}

export async function createServerFolder(serverId: string, folderName: string, subPath: string = '') {
  try {
    const folderPath = path.join(getSafePath(serverId, subPath), folderName);
    await fs.mkdir(folderPath, { recursive: true });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteServerPath(serverId: string, name: string, subPath: string = '') {
  try {
    const targetPath = path.join(getSafePath(serverId, subPath), name);
    const stats = await fs.stat(targetPath);
    
    if (stats.isDirectory()) {
      await fs.rm(targetPath, { recursive: true, force: true });
    } else {
      await fs.unlink(targetPath);
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function readFileContent(serverId: string, fileName: string, subPath: string = '') {
  try {
    const filePath = path.join(getSafePath(serverId, subPath), fileName);
    const content = await fs.readFile(filePath, 'utf8');
    return { success: true, content };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateFileContent(serverId: string, fileName: string, content: string, subPath: string = '') {
  try {
    const filePath = path.join(getSafePath(serverId, subPath), fileName);
    await fs.writeFile(filePath, content, 'utf8');
    return { success: true };
  } catch (error: any) {
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
      try {
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
      } catch (e) {
        // Folder maybe empty or not exists yet
      }
    }

    await calculateSize(serverPath);
    return { success: true, sizeInMB: totalSizeBytes / (1024 * 1024) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function decommissionServerFiles(serverId: string) {
  try {
    const serverDir = path.join(process.cwd(), 'storage', 'servers', serverId);
    
    try {
      await fs.access(serverDir);
      await fs.rm(serverDir, { recursive: true, force: true });
    } catch {
      // Directory doesn't exist, ignore
    }

    return { success: true };
  } catch (error: any) {
    console.error('Decommission Error:', error);
    return { success: false, error: error.message };
  }
}
