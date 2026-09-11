
import { NextRequest, NextResponse } from 'next/server';
import { promises as fsPromises, mkdirSync, createWriteStream, unlinkSync } from 'fs';
import path from 'path';
import { Readable } from 'stream';
import Busboy from 'busboy';
import { initializeFirebase } from '@/firebase/index';
import { doc, getDoc } from 'firebase/firestore';

/**
 * @fileOverview High-performance streaming upload API with Remote Agent Proxying.
 * Optimized for zero chunk loss, instant stream piping, and corruption prevention.
 */

export const runtime = 'nodejs';

async function getServerLocation(serverId: string) {
  const { db } = initializeFirebase();
  try {
    const serverDoc = await getDoc(doc(db, "servers", serverId));
    if (!serverDoc.exists()) return { isRemote: false };
    const data = serverDoc.data();
    if (data.agentId) {
      const agentDoc = await getDoc(doc(db, "infrastructure_agents", data.agentId));
      if (agentDoc.exists()) {
        return { isRemote: true, agent: agentDoc.data() };
      }
    }
    return { isRemote: false };
  } catch (e) {
    return { isRemote: false };
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

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return NextResponse.json({ success: false, error: "Invalid content type" }, { status: 400 });
    }

    // 1. Pre-auth & Location Check (Peek at serverId from headers)
    const serverId = req.headers.get('x-sts-server-id');
    const subPath = req.headers.get('x-sts-sub-path') || '';

    if (!serverId) {
      return NextResponse.json({ success: false, error: "Server ID header missing" }, { status: 400 });
    }

    const loc = await getServerLocation(serverId);

    // 2. REMOTE PROXY MODE (Streaming Passthrough)
    if (loc.isRemote && loc.agent) {
      const agent = loc.agent;
      const url = `https://${agent.domain}/api/files/upload-raw?serverId=${serverId}&subPath=${encodeURIComponent(subPath)}`;
      
      // Pipe the entire request body directly to the remote agent
      const agentResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': contentType,
          'Authorization': `Bearer ${agent.secretKey}`
        },
        body: req.body as any,
        // @ts-ignore - duplex is required for streaming bodies in Undici
        duplex: 'half'
      });

      const result = await agentResponse.json();
      return NextResponse.json(result);
    }

    // 3. LOCAL STORAGE MODE (Fast & Safe Disk I/O)
    const busboy = Busboy({ 
      headers: { 'content-type': contentType },
      limits: { fileSize: 5 * 1024 * 1024 * 1024 } // 5GB
    });
    
    const uploadedFiles: string[] = [];
    const activeWritePaths = new Set<string>();

    const uploadPromise = new Promise((resolve, reject) => {
      let activeWrites = 0;
      let isBusboyFinished = false;
      let hasError = false;

      const cleanupPath = (p: string) => {
        try {
          unlinkSync(p);
        } catch (_) {}
      };

      const attemptFinish = () => {
        if (hasError) return;
        if (isBusboyFinished && activeWrites === 0) {
          resolve({ success: true, files: uploadedFiles });
        }
      };

      busboy.on('file', (name, fileStream, info) => {
        // SANITIZE FILENAME: Remove accidental quotes from browser/header
        const filename = info.filename.replace(/^['"]|['"]$/g, '');
        const targetDir = getSafePath(serverId, subPath);
        const targetPath = path.join(targetDir, filename);

        activeWrites++;
        activeWritePaths.add(targetPath);

        try {
          // Synchronous mkdir avoids async promise delay that drops initial stream chunks
          mkdirSync(targetDir, { recursive: true });
          
          const writeStream = createWriteStream(targetPath, { highWaterMark: 1024 * 1024 }); // 1MB chunk buffer
          
          fileStream.pipe(writeStream);

          let fileStreamCompleted = false;

          fileStream.on('end', () => {
            fileStreamCompleted = true;
          });

          fileStream.on('limit', () => {
            fileStream.unpipe(writeStream);
            writeStream.destroy();
            cleanupPath(targetPath);
            activeWritePaths.delete(targetPath);
            activeWrites--;
            attemptFinish();
          });

          fileStream.on('error', (err) => {
            fileStream.unpipe(writeStream);
            writeStream.destroy();
            cleanupPath(targetPath);
            activeWritePaths.delete(targetPath);
            activeWrites--;
            attemptFinish();
          });

          writeStream.on('finish', () => {
            if (fileStreamCompleted) {
              uploadedFiles.push(filename);
            } else {
              cleanupPath(targetPath);
            }
            activeWritePaths.delete(targetPath);
            activeWrites--;
            attemptFinish();
          });

          writeStream.on('error', (err) => {
            writeStream.destroy();
            cleanupPath(targetPath);
            activeWritePaths.delete(targetPath);
            activeWrites--;
            attemptFinish();
          });
        } catch (err) {
          fileStream.resume();
          cleanupPath(targetPath);
          activeWritePaths.delete(targetPath);
          activeWrites--;
          attemptFinish();
        }
      });

      busboy.on('finish', () => {
        isBusboyFinished = true;
        attemptFinish();
      });

      busboy.on('error', (err) => {
        hasError = true;
        for (const p of activeWritePaths) {
          cleanupPath(p);
        }
        reject(err);
      });
    });

    if (!req.body) {
      return NextResponse.json({ success: false, error: "Empty request body" }, { status: 400 });
    }

    const nodeStream = Readable.fromWeb(req.body as any);
    nodeStream.pipe(busboy);

    const result = await uploadPromise;
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("API Upload Fatal Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

