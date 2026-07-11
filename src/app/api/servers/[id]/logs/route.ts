
import { NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * @fileOverview Real-time Log Streamer using Server-Sent Events (SSE).
 * Provides a persistent connection for terminal logs without client-side polling.
 */

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: serverId } = await params;
  const logPath = path.join(process.cwd(), '..', 'storage', 'servers', serverId, 'files', '.sts', 'logs', 'logs.sts');

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      const sendEvent = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // 1. Send initial logs (last 300 lines)
      try {
        const content = await fs.readFile(logPath, 'utf8');
        const lines = content.split('\n').slice(-300).join('\n');
        sendEvent({ content: lines, initial: true });
      } catch (e) {
        sendEvent({ content: "", initial: true });
      }

      // 2. Watch for changes and stream deltas
      let lastSize = 0;
      try {
        const stats = await fs.stat(logPath);
        lastSize = stats.size;
      } catch (e) {}

      const checkInterval = setInterval(async () => {
        try {
          const stats = await fs.stat(logPath);
          if (stats.size > lastSize) {
            const fd = await fs.open(logPath, 'r');
            const buffer = Buffer.alloc(stats.size - lastSize);
            await fd.read(buffer, 0, stats.size - lastSize, lastSize);
            await fd.close();
            
            const newData = buffer.toString('utf8');
            sendEvent({ content: newData, initial: false });
            lastSize = stats.size;
          } else if (stats.size < lastSize) {
            // File was cleared/truncated
            lastSize = stats.size;
            sendEvent({ content: "", initial: true, cleared: true });
          }
        } catch (e) {
          // File might be temporarily locked or missing during boot
        }
      }, 500); // Internal server-side fast check (much cheaper than HTTP polling)

      req.signal.onabort = () => {
        clearInterval(checkInterval);
        controller.close();
      };
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
