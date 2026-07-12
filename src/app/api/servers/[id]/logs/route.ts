
import { NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { initializeFirebase } from '@/firebase/index';
import { doc, getDoc } from 'firebase/firestore';

/**
 * @fileOverview Real-time Log Streamer using Server-Sent Events (SSE).
 * Enhanced: Supports Local Storage and Remote Agent Proxying with DELTA streaming.
 */

export const dynamic = 'force-dynamic';

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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: serverId } = await params;
  const loc = await getServerLocation(serverId);

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      const sendEvent = (data: any) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (e) {}
      };

      if (loc.isRemote && loc.agent) {
        // REMOTE MODE: High-frequency Polling with Change Detection for Streaming Feel
        let lastContent = "";
        const agent = loc.agent;
        
        const fetchRemote = async () => {
          try {
            const url = `https://${agent.domain}/api/files/logs`;
            const res = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${agent.secretKey}`
              },
              body: JSON.stringify({ serverId }),
              cache: 'no-store'
            });
            const data = await res.json();
            if (data.success) {
              if (data.content === lastContent) return;

              // 1. Detect if log was cleared/reset
              if (data.content.length < lastContent.length || (lastContent !== "" && data.content === "")) {
                sendEvent({ content: data.content, initial: true, cleared: true });
              } 
              // 2. Initial fetch or total replacement
              else if (!lastContent || !data.content.startsWith(lastContent)) {
                sendEvent({ content: data.content, initial: true });
              } 
              // 3. Delta (Streaming feel)
              else {
                const delta = data.content.substring(lastContent.length);
                sendEvent({ content: delta, initial: false });
              }
              
              lastContent = data.content;
            }
          } catch (e) {}
        };

        await fetchRemote(); // Initial
        // High frequency polling (800ms) to simulate real-time stream
        const interval = setInterval(fetchRemote, 800);

        req.signal.onabort = () => {
          clearInterval(interval);
          try { controller.close(); } catch(e) {}
        };
      } else {
        // LOCAL MODE: Native file watching
        const logPath = path.join(process.cwd(), '..', 'storage', 'servers', serverId, 'files', '.sts', 'logs', 'logs.sts');
        
        try {
          const content = await fs.readFile(logPath, 'utf8');
          sendEvent({ content: content.split('\n').slice(-300).join('\n'), initial: true });
        } catch (e) {
          sendEvent({ content: "", initial: true });
        }

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
              sendEvent({ content: buffer.toString('utf8'), initial: false });
              lastSize = stats.size;
            } else if (stats.size < lastSize) {
              lastSize = stats.size;
              sendEvent({ content: "", initial: true, cleared: true });
            }
          } catch (e) {}
        }, 800);

        req.signal.onabort = () => {
          clearInterval(checkInterval);
          try { controller.close(); } catch(e) {}
        };
      }
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
