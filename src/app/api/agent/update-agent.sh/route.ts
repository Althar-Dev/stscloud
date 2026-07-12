
import { NextResponse } from 'next/server';

/**
 * @fileOverview Serves the dynamic bash update script for STSCloud Agents.
 * Allows existing agents to pull the latest worker logic without full re-installation.
 */

export async function GET() {
  const script = `#!/bin/bash

# STSCloud Agent Automated Update Script
# Powered by StarVale Technology Solution

set -e

# Colors for terminal
RED='\\033[0;31m'
GREEN='\\033[0;32m'
BLUE='\\033[0;34m'
YELLOW='\\033[1;33m'
NC='\\033[0m'

echo -e "\${BLUE}=======================================================\${NC}"
echo -e "\${BLUE}            STSCLOUD AGENT UPDATE UTILITY              \${NC}"
echo -e "\${BLUE}=======================================================\${NC}"

# Check for root
if [ "\$EUID" -ne 0 ]; then 
  echo -e "\${RED}Harap jalankan skrip ini sebagai root (sudo).\${NC}"
  exit 1
fi

# Locate Agent Directory
AGENT_DIR="/opt/stscloud/agent"
if [ ! -d "\$AGENT_DIR" ]; then
    echo -e "\${RED}Error: Direktori Agent tidak ditemukan di \$AGENT_DIR\${NC}"
    echo -e "\${YELLOW}Gunakan skrip install-agent.sh jika ini adalah instalasi baru.\${NC}"
    exit 1
fi

cd \$AGENT_DIR

echo -e "\${GREEN}[1/3] Memperbarui file aplikasi...\${NC}"

# Update package.json
cat > package.json <<'EOF'
{
  "name": "stscloud-agent",
  "version": "1.3.0",
  "main": "index.js",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "adm-zip": "^0.5.16",
    "busboy": "^1.6.0",
    "tar": "^7.1.0"
  }
}
EOF

# Update index.js (Latest Full Logic)
cat > index.js <<'EOF'
const express = require('express');
const cors = require('cors');
const os = require('os');
const fs = require('fs').promises;
const { createWriteStream } = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const AdmZip = require('adm-zip');
const tar = require('tar');
const Busboy = require('busboy');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

const SECRET_KEY = process.env.SECRET_KEY;
const STORAGE_BASE = process.env.STORAGE_PATH || '/opt/stscloud/storage/servers';

// Auth Middleware
const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader === 'Bearer ' + SECRET_KEY) return next();
    if (req.body && req.body.secret === SECRET_KEY) return next();
    return res.status(401).json({ success: false, error: 'Unauthorized' });
};

const getSafePath = (serverId, subPath = '') => {
    const base = path.resolve(STORAGE_BASE, serverId, 'files');
    const final = path.resolve(base, subPath);
    if (!final.startsWith(base)) return base;
    return final;
};

const getLogPath = (serverId) => {
    return path.join(STORAGE_BASE, serverId, 'files', '.sts', 'logs', 'logs.sts');
};

// --- SYSTEM APIs ---
app.post('/api/system/info', auth, (req, res) => {
    try {
        const cpus = os.cpus();
        const totalRamBytes = os.totalmem();
        const freeRamBytes = os.freemem();
        let totalDisk = "Unknown", freeDisk = "0 GB", usedDisk = "0 GB", freeDiskBytes = 0;
        try {
            const output = execSync("df -B1 / | tail -1", { encoding: 'utf8' }).trim();
            const parts = output.split(/\s+/);
            if (parts.length >= 4) {
                const total = parseInt(parts[1]);
                const free = parseInt(parts[3]);
                freeDiskBytes = free;
                totalDisk = (total / (1024 ** 3)).toFixed(1) + " GB";
                freeDisk = (free / (1024 ** 3)).toFixed(1) + " GB";
                usedDisk = ((total - free) / (1024 ** 3)).toFixed(1) + " GB";
            }
        } catch (e) {}
        res.json({
            success: true,
            data: {
                cpuModel: cpus[0] ? cpus[0].model : "Generic CPU",
                cpuCores: cpus.length,
                totalRam: (totalRamBytes / (1024 ** 3)).toFixed(1) + " GB",
                usedRam: ((totalRamBytes - freeRamBytes) / (1024 ** 3)).toFixed(1) + " GB",
                freeRam: (freeRamBytes / (1024 ** 3)).toFixed(1) + " GB",
                totalDisk, freeDisk, usedDisk, freeDiskBytes
            }
        });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// --- FILE APIs ---
app.post('/api/files/list', auth, async (req, res) => {
    try {
        const { serverId, subPath } = req.body;
        const target = getSafePath(serverId, subPath);
        await fs.mkdir(target, { recursive: true });
        const entries = await fs.readdir(target, { withFileTypes: true });
        const files = await Promise.all(entries.map(async e => {
            const stats = await fs.stat(path.join(target, e.name));
            return {
                name: e.name,
                type: e.isDirectory() ? 'folder' : 'file',
                size: e.isDirectory() ? '--' : (stats.size / 1024).toFixed(1) + ' KB',
                modified: stats.mtime.toLocaleDateString()
            };
        }));
        res.json({ success: true, files });
    } catch (e) { res.json({ success: false, error: e.message }); }
});

app.post('/api/files/read', auth, async (req, res) => {
    try {
        const { serverId, fileName, subPath } = req.body;
        const target = path.join(getSafePath(serverId, subPath), fileName);
        const content = await fs.readFile(target, 'utf8');
        res.json({ success: true, content });
    } catch (e) { res.json({ success: false, error: e.message }); }
});

app.post('/api/files/write', auth, async (req, res) => {
    try {
        const { serverId, fileName, content, subPath } = req.body;
        const target = path.join(getSafePath(serverId, subPath), fileName);
        await fs.writeFile(target, content, 'utf8');
        res.json({ success: true });
    } catch (e) { res.json({ success: false, error: e.message }); }
});

app.post('/api/files/create', auth, async (req, res) => {
    try {
        const { serverId, fileName, subPath, type } = req.body;
        const target = path.join(getSafePath(serverId, subPath), fileName);
        if (type === 'folder') await fs.mkdir(target, { recursive: true });
        else await fs.writeFile(target, '');
        res.json({ success: true });
    } catch (e) { res.json({ success: false, error: e.message }); }
});

app.post('/api/files/delete', auth, async (req, res) => {
    try {
        const { serverId, names, subPath } = req.body;
        const base = getSafePath(serverId, subPath);
        for (const name of names) await fs.rm(path.join(base, name), { recursive: true, force: true });
        res.json({ success: true });
    } catch (e) { res.json({ success: false, error: e.message }); }
});

app.post('/api/files/rename', auth, async (req, res) => {
    try {
        const { serverId, oldName, newName, subPath } = req.body;
        const base = getSafePath(serverId, subPath);
        await fs.rename(path.join(base, oldName), path.join(base, newName));
        res.json({ success: true });
    } catch (e) { res.json({ success: false, error: e.message }); }
});

app.post('/api/files/move', auth, async (req, res) => {
    try {
        const { serverId, names, currentSubPath, targetSubPath } = req.body;
        const sourceBase = getSafePath(serverId, currentSubPath);
        const targetBase = getSafePath(serverId, path.join(currentSubPath, targetSubPath));
        await fs.mkdir(targetBase, { recursive: true });
        for (const name of names) {
            await fs.rename(path.join(sourceBase, name), path.join(targetBase, name));
        }
        res.json({ success: true });
    } catch (e) { res.json({ success: false, error: e.message }); }
});

app.post('/api/files/archive', auth, async (req, res) => {
    try {
        const { serverId, names, zipName, subPath } = req.body;
        const base = getSafePath(serverId, subPath);
        const zip = new AdmZip();
        for (const name of names) {
            const target = path.join(base, name);
            const stats = await fs.stat(target);
            if (stats.isDirectory()) zip.addLocalFolder(target, name);
            else zip.addLocalFile(target);
        }
        const finalZip = zipName.endsWith('.zip') ? zipName : zipName + '.zip';
        zip.writeZip(path.join(base, finalZip));
        res.json({ success: true });
    } catch (e) { res.json({ success: false, error: e.message }); }
});

app.post('/api/files/unarchive', auth, async (req, res) => {
    try {
        const { serverId, fileName, subPath } = req.body;
        const base = getSafePath(serverId, subPath);
        const target = path.join(base, fileName);
        const lower = fileName.toLowerCase();
        if (lower.endsWith('.zip')) {
            const zip = new AdmZip(target);
            zip.extractAllTo(base, true);
        } else if (lower.endsWith('.tar.gz') || lower.endsWith('.tgz') || lower.endsWith('.tar')) {
            await tar.x({ file: target, cwd: base });
        } else {
            return res.json({ success: false, error: "Unsupported format" });
        }
        res.json({ success: true });
    } catch (e) { res.json({ success: false, error: e.message }); }
});

app.post('/api/files/download', auth, async (req, res) => {
    try {
        const { serverId, fileName, subPath } = req.body;
        const target = path.join(getSafePath(serverId, subPath), fileName);
        const content = await fs.readFile(target);
        res.json({ success: true, content: content.toString('base64'), fileName });
    } catch (e) { res.json({ success: false, error: e.message }); }
});

app.post('/api/files/upload-raw', auth, (req, res) => {
    const busboy = Busboy({ headers: req.headers });
    const serverId = req.query.serverId;
    const subPath = req.query.subPath || '';
    const targetDir = getSafePath(serverId, subPath);
    
    fs.mkdir(targetDir, { recursive: true }).then(() => {
        busboy.on('file', (name, file, info) => {
            const targetPath = path.join(targetDir, info.filename);
            file.pipe(createWriteStream(targetPath));
        });
        busboy.on('finish', () => res.json({ success: true }));
        req.pipe(busboy);
    }).catch(e => res.status(500).json({ success: false, error: e.message }));
});

// --- POWER APIs ---
const pids = new Map();
app.post('/api/power/execute', auth, async (req, res) => {
    try {
        const { serverId, action, config } = req.body;
        const filesDir = path.resolve(STORAGE_BASE, serverId, 'files');
        const stsDir = path.join(filesDir, '.sts');
        const logPath = path.join(stsDir, 'logs', 'logs.sts');

        if (action === 'stop' || action === 'restart') {
            const child = pids.get(serverId);
            if (child) { 
                try { process.kill(-child.pid, 'SIGKILL'); } catch(e) {}
                pids.delete(serverId); 
            }
            if (action === 'stop') return res.json({ success: true });
        }

        await fs.mkdir(path.dirname(logPath), { recursive: true });
        const logStream = createWriteStream(logPath, { flags: 'a' });
        
        if (config.runtime === 'nodejs') {
           const pkgPath = path.join(filesDir, 'package.json');
           try {
              await fs.access(pkgPath);
              logStream.write('[STS] Checking dependencies...\n');
              execSync('npm install --production', { cwd: filesDir });
           } catch(e) {}
        }

        const child = spawn(config.startupCommand, { 
            shell: true, 
            cwd: filesDir, 
            detached: true, 
            stdio: ['pipe', 'pipe', 'pipe'] 
        });
        
        pids.set(serverId, child);
        child.stdout.on('data', d => logStream.write(d));
        child.stderr.on('data', d => logStream.write(d));
        child.on('close', c => {
            logStream.write('\n[STS] Process exited with code ' + c + '\n');
            pids.delete(serverId);
        });

        res.json({ success: true });
    } catch (e) { res.json({ success: false, error: e.message }); }
});

app.post('/api/power/status', auth, (req, res) => {
    res.json({ running: pids.has(req.body.serverId) });
});

app.get('/', (req, res) => res.send('STSCloud Agent Active'));
app.listen(process.env.PORT || 9005, () => console.log('Agent updated and running.'));
EOF

echo -e "\${GREEN}[2/3] Menginstal dependensi baru...\${NC}"
npm install --production

echo -e "\${GREEN}[3/3] Memuat ulang layanan di PM2...\${NC}"
pm2 restart stscloud-agent

echo -e "\${GREEN}Pembaruan Selesai!\${NC}"
echo -e "\${BLUE}=======================================================\${NC}"
echo -e "Agent Anda kini menjalankan versi terbaru."
echo -e "\${BLUE}=======================================================\${NC}"
`;

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
