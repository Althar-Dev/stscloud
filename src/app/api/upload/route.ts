
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs, createWriteStream } from 'fs';
import path from 'path';
import { Readable } from 'stream';
import Busboy from 'busboy';

/**
 * @fileOverview High-performance streaming upload API using Busboy.
 * Updated: Storage moved outside project root (../storage).
 */

export const runtime = 'nodejs';

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

    const busboy = Busboy({ headers: { 'content-type': contentType } });
    
    let serverId = '';
    let subPath = '';
    const uploadedFiles: string[] = [];

    const uploadPromise = new Promise((resolve, reject) => {
      let activeWrites = 0;
      let isBusboyFinished = false;

      const attemptFinish = () => {
        if (isBusboyFinished && activeWrites === 0) {
          resolve({ success: true, files: uploadedFiles });
        }
      };

      busboy.on('field', (name, val) => {
        if (name === 'serverId') serverId = val;
        if (name === 'subPath') subPath = val;
      });

      busboy.on('file', (name, fileStream, info) => {
        const { filename } = info;
        
        // Critical: Metadata (serverId) must be sent BEFORE files in the FormData
        if (!serverId) {
          fileStream.resume(); // Discard stream
          return;
        }

        const targetDir = getSafePath(serverId, subPath);
        const targetPath = path.join(targetDir, filename);

        activeWrites++;

        // Ensure directory exists synchronously for speed in the stream event
        try {
          const writeStream = createWriteStream(targetPath);
          
          fileStream.pipe(writeStream);

          writeStream.on('finish', () => {
            uploadedFiles.push(filename);
            activeWrites--;
            attemptFinish();
          });

          writeStream.on('error', (err) => {
            activeWrites--;
            attemptFinish();
          });
        } catch (e) {
          fileStream.resume();
          activeWrites--;
          attemptFinish();
        }
      });

      busboy.on('finish', () => {
        isBusboyFinished = true;
        attemptFinish();
      });

      busboy.on('error', (err) => {
        reject(err);
      });
    });

    if (!req.body) {
      return NextResponse.json({ success: false, error: "Empty request body" }, { status: 400 });
    }

    // Convert Web ReadableStream to Node.js Readable
    const nodeStream = Readable.fromWeb(req.body as any);
    nodeStream.pipe(busboy);

    const result = await uploadPromise;
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("API Upload Fatal Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
