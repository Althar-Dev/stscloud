'use server';

import os from 'os';
import { execSync } from 'child_process';

/**
 * @fileOverview Server action to retrieve real hardware metrics from the host VPS.
 */

export async function getSystemHardwareInfo() {
  try {
    const cpus = os.cpus();
    const totalRamBytes = os.totalmem();
    
    // Total Disk - using 'df' command for real host statistics
    let totalDisk = "Unknown";
    try {
      // Get disk size of the root partition
      const output = execSync("df -h / | tail -1 | awk '{print $2}'", { encoding: 'utf8' }).trim();
      totalDisk = output || "Unknown";
    } catch (e) {
      console.error("Disk Info Error:", e);
    }

    return {
      success: true,
      data: {
        cpuModel: cpus[0]?.model || "Generic CPU",
        cpuCores: cpus.length,
        totalRam: (totalRamBytes / (1024 * 1024 * 1024)).toFixed(1) + " GB",
        totalDisk: totalDisk
      }
    };
  } catch (error: any) {
    console.error("System Info Action Error:", error);
    return { success: false, error: error.message };
  }
}
