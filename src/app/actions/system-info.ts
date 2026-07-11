
'use server';

import os from 'os';
import { execSync } from 'child_process';
import { initializeFirebase } from '@/firebase/index';
import { doc, getDoc } from 'firebase/firestore';

/**
 * @fileOverview Server action to retrieve real hardware metrics from the host VPS or Remote Agent.
 */

export async function getSystemHardwareInfo(agentId?: string) {
  try {
    // If agentId is provided, fetch info from the Remote Agent
    if (agentId) {
      const { db } = initializeFirebase();
      const agentDoc = await getDoc(doc(db, "infrastructure_agents", agentId));
      
      if (!agentDoc.exists()) {
        return { success: false, error: "Agent record not found" };
      }

      const agent = agentDoc.data();
      const url = `https://${agent.domain}/api/system/info`;

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${agent.secretKey}`
          },
          body: JSON.stringify({ secret: agent.secretKey }),
          next: { revalidate: 0 }
        });
        
        if (!res.ok) throw new Error(`Agent API returned ${res.status}`);
        return await res.json();
      } catch (e: any) {
        return { success: false, error: `Agent Unreachable: ${e.message}` };
      }
    }

    // Local Host logic (Fallback/Panel node)
    const cpus = os.cpus();
    const totalRamBytes = os.totalmem();
    const freeRamBytes = os.freemem();
    
    let totalDisk = "Unknown";
    let freeDiskBytes = 0;
    let totalDiskBytes = 0;

    try {
      const output = execSync("df -B1 / | tail -1", { encoding: 'utf8' }).trim();
      const parts = output.split(/\s+/);
      
      if (parts.length >= 4) {
        totalDiskBytes = parseInt(parts[1]);
        freeDiskBytes = parseInt(parts[3]);
        totalDisk = (totalDiskBytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
      }
    } catch (e) {
      console.error("Disk Info Error:", e);
    }

    return {
      success: true,
      data: {
        cpuModel: cpus[0]?.model || "Generic CPU",
        cpuCores: cpus.length,
        totalRam: (totalRamBytes / (1024 * 1024 * 1024)).toFixed(1) + " GB",
        freeRam: (freeRamBytes / (1024 * 1024 * 1024)).toFixed(1) + " GB",
        usedRam: ((totalRamBytes - freeRamBytes) / (1024 * 1024 * 1024)).toFixed(1) + " GB",
        totalDisk: totalDisk,
        freeDisk: (freeDiskBytes / (1024 * 1024 * 1024)).toFixed(1) + " GB",
        usedDisk: ((totalDiskBytes - freeDiskBytes) / (1024 * 1024 * 1024)).toFixed(1) + " GB",
        freeDiskBytes: freeDiskBytes
      }
    };
  } catch (error: any) {
    console.error("System Info Action Error:", error);
    return { success: false, error: error.message };
  }
}
