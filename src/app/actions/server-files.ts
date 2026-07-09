
'use server';

import { promises as fs } from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

/**
 * @fileOverview Server actions for managing server-specific files and logs.
 * Updated: Storage moved outside project root (../storage).
 */

function getSafePath(serverId: string, subPath: string = '') {
  const baseDir = path.resolve(process.cwd(), '..', 'storage', 'servers', serverId, 'files');
  const finalPath = path.resolve(baseDir, subPath);
  if (!finalPath.startsWith(baseDir)) {
    return baseDir;
  }
  return finalPath;
}

function getLogPath(serverId: string) {
  return path.join(process.cwd(), '..', 'storage', 'servers', serverId, 'files', '.sts', 'logs', 'logs.sts');
}

export async function getServerFiles(serverId: string, subPath: string = '') {
  try {
    const targetPath = getSafePath(serverId, subPath);
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

/**
 * Optimized binary file upload action.
 * Accepts FormData for efficient streaming and multiple files support.
 */
export async function uploadServerFiles(formData: FormData) {
  try {
    const serverId = formData.get('serverId') as string;
    const subPath = (formData.get('subPath') as string) || '';
    const files = formData.getAll('files') as unknown as File[];

    if (!serverId || !files || files.length === 0) {
      throw new Error("Invalid request: No files provided.");
    }

    const baseDir = getSafePath(serverId, subPath);
    
    // Ensure directory exists
    try {
      await fs.access(baseDir);
    } catch {
      await fs.mkdir(baseDir, { recursive: true });
    }

    for (const file of files) {
      const targetPath = path.join(baseDir, file.name);
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await fs.writeFile(targetPath, buffer);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Upload Action Error:", error);
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

export async function deleteServerPaths(serverId: string, names: string[], subPath: string = '') {
  try {
    for (const name of names) {
      const targetPath = path.join(getSafePath(serverId, subPath), name);
      await fs.rm(targetPath, { recursive: true, force: true });
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function renameServerPath(serverId: string, oldName: string, newName: string, subPath: string = '') {
  try {
    const currentDirPath = getSafePath(serverId, subPath);
    const oldPath = path.join(currentDirPath, oldName);
    const newPath = path.join(currentDirPath, newName);
    await fs.rename(oldPath, newPath);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function archiveServerPaths(serverId: string, names: string[], zipName: string, subPath: string = '') {
  try {
    const currentPath = getSafePath(serverId, subPath);
    const zip = new AdmZip();
    for (const name of names) {
      const fullPath = path.join(currentPath, name);
      const stats = await fs.stat(fullPath);
      if (stats.isDirectory()) {
        zip.addLocalFolder(fullPath, name);
      } else {
        zip.addLocalFile(fullPath);
      }
    }
    const finalZipName = zipName.endsWith('.zip') ? zipName : `${zipName}.zip`;
    zip.writeZip(path.join(currentPath, finalZipName));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function moveServerPaths(serverId: string, names: string[], currentSubPath: string, targetSubPath: string) {
  try {
    const sourceDir = getSafePath(serverId, currentSubPath);
    const targetDir = getSafePath(serverId, path.join(currentSubPath, targetSubPath));
    try {
      await fs.access(targetDir);
    } catch {
      await fs.mkdir(targetDir, { recursive: true });
    }
    for (const name of names) {
      const oldPath = path.join(sourceDir, name);
      const newPath = path.join(targetDir, name);
      await fs.rename(oldPath, newPath);
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
    const logPath = getLogPath(serverId);
    try {
      await fs.access(logPath);
      const content = await fs.readFile(logPath, 'utf8');
      const lines = content.split('\n');
      if (lines.length > 300) {
        return { success: true, content: lines.slice(-300).join('\n') };
      }
      return { success: true, content };
    } catch {
      return { success: true, content: "" };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function clearServerLogs(serverId: string) {
  try {
    const logPath = getLogPath(serverId);
    await fs.mkdir(path.dirname(logPath), { recursive: true });
    await fs.writeFile(logPath, "");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getServerDiskUsage(serverId: string) {
  try {
    const serverPath = path.join(process.cwd(), '..', 'storage', 'servers', serverId, 'files');
    try {
      await fs.access(serverPath);
    } catch {
      return { success: true, sizeInMB: 0 };
    }

    let totalSizeBytes = 0;
    async function calculateSize(dirPath: string) {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          try {
            const stats = await fs.stat(fullPath);
            if (entry.isDirectory()) {
              await calculateSize(fullPath);
            } else {
              totalSizeBytes += stats.size;
            }
          } catch (e) {}
        }
      } catch (e) {}
    }

    await calculateSize(serverPath);
    return { success: true, sizeInMB: totalSizeBytes / (1024 * 1024) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function decommissionServerFiles(serverId: string) {
  try {
    const serverDir = path.join(process.cwd(), '..', 'storage', 'servers', serverId);
    try {
      await fs.access(serverDir);
      await fs.rm(serverDir, { recursive: true, force: true });
    } catch {}
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
