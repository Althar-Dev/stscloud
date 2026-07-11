'use server';

import { promises as fs } from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import tar from 'tar';
import { initializeFirebase } from '@/firebase/index';
import { doc, getDoc } from 'firebase/firestore';

/**
 * @fileOverview Server actions for managing server-specific files and logs.
 * Supports Local Storage and Remote Agent I/O via Secure API.
 */

// Helper to fetch Agent details from Firestore
async function getRemoteAgent(agentId: string) {
  const { db } = initializeFirebase();
  try {
    const agentDoc = await getDoc(doc(db, "infrastructure_agents", agentId));
    if (!agentDoc.exists()) return null;
    return agentDoc.data();
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      return { 
        isPermissionError: true, 
        context: { path: `infrastructure_agents/${agentId}`, operation: 'get' } 
      };
    }
    throw error;
  }
}

// Helper to check if a server is remote
async function getServerLocation(serverId: string) {
  const { db } = initializeFirebase();
  try {
    const serverDoc = await getDoc(doc(db, "servers", serverId));
    if (!serverDoc.exists()) return { isRemote: false };
    const data = serverDoc.data();
    if (data.agentId) {
      const agentRes: any = await getRemoteAgent(data.agentId);
      if (agentRes?.isPermissionError) return agentRes;
      return { isRemote: !!agentRes, agent: agentRes };
    }
    return { isRemote: false };
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      return { 
        isPermissionError: true, 
        context: { path: `servers/${serverId}`, operation: 'get' } 
      };
    }
    throw error;
  }
}

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

/**
 * REMOTE BRIDGE: Call Remote Agent API
 */
async function callAgentAPI(agent: any, endpoint: string, payload: any) {
  try {
    const url = `https://${agent.domain}/api/files/${endpoint}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${agent.secretKey}`
      },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (e: any) {
    return { success: false, error: `Agent Unreachable: ${e.message}` };
  }
}

export async function getServerFiles(serverId: string, subPath: string = '') {
  const loc: any = await getServerLocation(serverId);
  if (loc.isPermissionError) return { success: false, isPermissionError: true, context: loc.context };
  
  if (loc.isRemote) {
    return await callAgentAPI(loc.agent, 'list', { serverId, subPath });
  }

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
  const loc: any = await getServerLocation(serverId);
  if (loc.isPermissionError) return { success: false, isPermissionError: true, context: loc.context };
  if (loc.isRemote) return await callAgentAPI(loc.agent, 'create', { serverId, fileName, subPath, type: 'file' });

  try {
    const filePath = path.join(getSafePath(serverId, subPath), fileName);
    await fs.writeFile(filePath, '');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createServerFolder(serverId: string, folderName: string, subPath: string = '') {
  const loc: any = await getServerLocation(serverId);
  if (loc.isPermissionError) return { success: false, isPermissionError: true, context: loc.context };
  if (loc.isRemote) return await callAgentAPI(loc.agent, 'create', { serverId, fileName: folderName, subPath, type: 'folder' });

  try {
    const folderPath = path.join(getSafePath(serverId, subPath), folderName);
    await fs.mkdir(folderPath, { recursive: true });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteServerPaths(serverId: string, names: string[], subPath: string = '') {
  const loc: any = await getServerLocation(serverId);
  if (loc.isPermissionError) return { success: false, isPermissionError: true, context: loc.context };
  if (loc.isRemote) return await callAgentAPI(loc.agent, 'delete', { serverId, names, subPath });

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
  const loc: any = await getServerLocation(serverId);
  if (loc.isPermissionError) return { success: false, isPermissionError: true, context: loc.context };
  if (loc.isRemote) return await callAgentAPI(loc.agent, 'rename', { serverId, oldName, newName, subPath });

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
  const loc: any = await getServerLocation(serverId);
  if (loc.isPermissionError) return { success: false, isPermissionError: true, context: loc.context };
  if (loc.isRemote) return await callAgentAPI(loc.agent, 'archive', { serverId, names, zipName, subPath });

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

export async function unarchiveServerFile(serverId: string, fileName: string, subPath: string = '') {
  const loc: any = await getServerLocation(serverId);
  if (loc.isPermissionError) return { success: false, isPermissionError: true, context: loc.context };
  if (loc.isRemote) return await callAgentAPI(loc.agent, 'unarchive', { serverId, fileName, subPath });

  try {
    const currentDirPath = getSafePath(serverId, subPath);
    const filePath = path.join(currentDirPath, fileName);
    const lowerName = fileName.toLowerCase();

    if (lowerName.endsWith('.zip')) {
      const zip = new AdmZip(filePath);
      zip.extractAllTo(currentDirPath, true);
    } else if (lowerName.endsWith('.tar.gz') || lowerName.endsWith('.tgz') || lowerName.endsWith('.tar')) {
      await tar.x({
        file: filePath,
        cwd: currentDirPath,
      });
    } else {
      return { success: false, error: "Unsupported archive format" };
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function moveServerPaths(serverId: string, names: string[], currentSubPath: string, targetSubPath: string) {
  const loc: any = await getServerLocation(serverId);
  if (loc.isPermissionError) return { success: false, isPermissionError: true, context: loc.context };
  if (loc.isRemote) return await callAgentAPI(loc.agent, 'move', { serverId, names, currentSubPath, targetSubPath });

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
  const loc: any = await getServerLocation(serverId);
  if (loc.isPermissionError) return { success: false, isPermissionError: true, context: loc.context };
  if (loc.isRemote) return await callAgentAPI(loc.agent, 'read', { serverId, fileName, subPath });

  try {
    const filePath = path.join(getSafePath(serverId, subPath), fileName);
    const content = await fs.readFile(filePath, 'utf8');
    return { success: true, content };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function downloadServerFile(serverId: string, fileName: string, subPath: string = '') {
  const loc: any = await getServerLocation(serverId);
  if (loc.isPermissionError) return { success: false, isPermissionError: true, context: loc.context };
  if (loc.isRemote) return await callAgentAPI(loc.agent, 'download', { serverId, fileName, subPath });

  try {
    const filePath = path.join(getSafePath(serverId, subPath), fileName);
    const content = await fs.readFile(filePath);
    return { success: true, content: content.toString('base64'), fileName };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateFileContent(serverId: string, fileName: string, content: string, subPath: string = '') {
  const loc: any = await getServerLocation(serverId);
  if (loc.isPermissionError) return { success: false, isPermissionError: true, context: loc.context };
  if (loc.isRemote) return await callAgentAPI(loc.agent, 'write', { serverId, fileName, content, subPath });

  try {
    const filePath = path.join(getSafePath(serverId, subPath), fileName);
    await fs.writeFile(filePath, content, 'utf8');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getServerLogs(serverId: string) {
  const loc: any = await getServerLocation(serverId);
  if (loc.isPermissionError) return { success: false, isPermissionError: true, context: loc.context };
  if (loc.isRemote) return await callAgentAPI(loc.agent, 'logs', { serverId });

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
  const loc: any = await getServerLocation(serverId);
  if (loc.isPermissionError) return { success: false, isPermissionError: true, context: loc.context };
  if (loc.isRemote) return await callAgentAPI(loc.agent, 'clear-logs', { serverId });

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
    const loc: any = await getServerLocation(serverId);
    if (loc.isPermissionError) {
      return { success: false, isPermissionError: true, context: loc.context };
    }

    if (loc.isRemote) {
      return await callAgentAPI(loc.agent, 'disk-usage', { serverId });
    }

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
  const loc: any = await getServerLocation(serverId);
  if (loc.isPermissionError) return { success: false, isPermissionError: true, context: loc.context };
  if (loc.isRemote) return await callAgentAPI(loc.agent, 'decommission', { serverId });

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