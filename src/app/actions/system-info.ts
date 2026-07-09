
'use server';

import os from 'os';
import { execSync } from 'child_process';

/**
 * @fileOverview Server action to retrieve real hardware metrics from the host VPS.
 * Updated to include precision byte counts for available disk to support stock calculation.
 */

export async function getSystemHardwareInfo() {
  try {
    const cpus = os.cpus();
    const totalRamBytes = os.totalmem();
    
    let totalDisk = "Unknown";
    let freeDiskBytes = 0;
    try {
      // Get disk size of the root partition in bytes (-B1)
      const output = execSync("df -B1 / | tail -1", { encoding: 'utf8' }).trim();
      const parts = output.split(/\s+/);
      
      if (parts.length >= 4) {
        const totalBytes = parseInt(parts[1]);
        const availableBytes = parseInt(parts[3]);
        
        totalDisk = (totalBytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
        freeDiskBytes = availableBytes;
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
        totalDisk: totalDisk,
        freeDiskBytes: freeDiskBytes // Added for stock logic
      }
    };
  } catch (error: any) {
    console.error("System Info Action Error:", error);
    return { success: false, error: error.message };
  }
}
