
import { NextResponse } from 'next/server';

/**
 * @fileOverview Serves the dynamic bash installation script for STSCloud Agents.
 * Expanded: Complete Agent Worker with File & Power management APIs.
 * Fixed: Escaping issues for Node.js strings and PM2 startup commands.
 */

export async function GET() {
  const script = `#!/bin/bash

# STSCloud Agent Automated Installation Script
# Powered by StarVale Technology Solution

set -e

# Colors for terminal
RED='\\033[0;31m'
GREEN='\\033[0;32m'
BLUE='\\033[0;34m'
YELLOW='\\033[1;33m'
NC='\\033[0m'

echo -e "\${BLUE}=======================================================\${NC}"
echo -e "\${BLUE}          STSCLOUD AGENT STORAGE INSTALLER             \${NC}"
echo -e "\${BLUE}=======================================================\${NC}"

# Check for root
if [ "\$EUID" -ne 0 ]; then 
  echo -e "\${RED}Harap jalankan skrip ini sebagai root (sudo).\${NC}"
  exit 1
fi

# Request Domain
echo -e "\${YELLOW}Masukkan Domain Agent (contoh: node-01.stscloud.id):\${NC}"
read AGENT_DOMAIN < /dev/tty

if [ -z "\$AGENT_DOMAIN" ]; then
    echo -e "\${RED}Domain tidak boleh kosong!\${NC}"
    exit 1
fi

# Update and Install System Dependencies
echo -e "\${GREEN}[1/6] Memperbarui paket sistem...\${NC}"
apt-get update -y
apt-get install -y curl wget git nginx certbot python3-certbot-nginx build-essential unzip tar

# Install/Check Node.js
if command -v node &> /dev/null; then
    NODE_VER=\$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
    echo -e "\${BLUE}Node.js sudah terpasang (v\${NODE_VER}).\${NC}"
    if [ "\$NODE_VER" -lt 18 ]; then
        echo -e "\${YELLOW}Versi Node.js terlalu lama. Mencoba memperbarui ke v20...\${NC}"
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
    fi
else
    echo -e "\${GREEN}Memasang Node.js v20...\${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# Install/Check PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "\${GREEN}Memasang PM2 Process Manager...\${NC}"
    npm install -g pm2
else
    echo -e "\${BLUE}PM2 sudah terpasang.\${NC}"
fi

# Setup Directory
echo -e "\${GREEN}[2/6] Menyiapkan struktur direktori...\${NC}"
mkdir -p /opt/stscloud/agent
mkdir -p /opt/stscloud/storage/servers
cd /opt/stscloud/agent

# Generate Secret Key if not exists
if [ ! -f .env ]; then
    SECRET_KEY=\$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 32 ; echo '')
    echo "SECRET_KEY=\$SECRET_KEY" > .env
    echo "PORT=9005" >> .env
    echo "STORAGE_PATH=/opt/stscloud/storage/servers" >> .env
    echo -e "\${GREEN}Secret Key baru dibuat.\${NC}"
else
    SECRET_KEY=\$(grep SECRET_KEY .env | cut -d '=' -f 2)
    echo -e "\${BLUE}Menggunakan Secret Key yang sudah ada.\${NC}"
fi

# Setup Nginx Configuration
echo -e "\${GREEN}[3/6] Mengonfigurasi Nginx Reverse Proxy...\${NC}"
cat > /etc/nginx/sites-available/stscloud-agent <<'EOF'
server {
    listen 80;
    server_name __DOMAIN__;

    client_max_body_size 5G;
    client_body_timeout 300s;
    client_header_timeout 300s;
    send_timeout 300s;
    keepalive_timeout 65;

    location / {
        proxy_pass http://localhost:9005;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_request_buffering off;
        proxy_buffering off;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sed -i "s/__DOMAIN__/\$AGENT_DOMAIN/g" /etc/nginx/sites-available/stscloud-agent

ln -sf /etc/nginx/sites-available/stscloud-agent /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
if nginx -t; then
    systemctl restart nginx
else
    echo -e "\${RED}Konfigurasi Nginx bermasalah, silakan periksa manual.\${NC}"
fi

# Setup SSL with Certbot
echo -e "\${GREEN}[4/6] Mengaktifkan SSL Otomatis (Let's Encrypt)...\${NC}"
if certbot --nginx -d \$AGENT_DOMAIN --non-interactive --agree-tos -m admin@\$AGENT_DOMAIN; then
    echo -e "\${GREEN}SSL Berhasil dikonfigurasi.\${NC}"
else
    echo -e "\${YELLOW}Gagal mendapatkan SSL otomatis. Pastikan domain sudah diarahkan ke IP VPS ini.\${NC}"
fi

# Deploy Agent Application Worker
echo -e "\${GREEN}[5/6] Memasang STSCloud Worker Application...\${NC}"
cat > package.json <<'EOF'
{
  "name": "stscloud-agent",
  "version": "1.1.0",
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

cat > index.js <<'EOF'
const express = require('express');
const cors = require('cors');
const os = require('os');
const fs = require('fs').promises;
const { createWriteStream, createReadStream } = require('fs');
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
    const token = 'Bearer ' + SECRET_KEY;
    if (authHeader === token) return next();
    if (req.body && req.body.secret === SECRET_KEY) return next();
    return res.status(401).json({ success: false, error: 'Unauthorized' });
};

// Helper: Get safe path
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
        let totalDisk = "Unknown", freeDisk = "0 GB", usedDisk = "0 GB";
        try {
            const output = execSync("df -B1 / | tail -1", { encoding: 'utf8' }).trim();
            const parts = output.split(/\s+/);
            if (parts.length >= 4) {
                const total = parseInt(parts[1]);
                const free = parseInt(parts[3]);
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
                totalDisk, freeDisk, usedDisk
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

app.post('/api/files/disk-usage', auth, async (req, res) => {
    try {
        const { serverId } = req.body;
        const base = path.resolve(STORAGE_BASE, serverId, 'files');
        let total = 0;
        async function calc(p) {
            try {
                const entries = await fs.readdir(p, { withFileTypes: true });
                for (const e of entries) {
                    const full = path.join(p, e.name);
                    const s = await fs.stat(full);
                    if (e.isDirectory()) await calc(full);
                    else total += s.size;
                }
            } catch (err) {}
        }
        await calc(base);
        res.json({ success: true, sizeInMB: total / (1024 * 1024) });
    } catch (e) { res.json({ success: false, error: e.message }); }
});

app.post('/api/files/decommission', auth, async (req, res) => {
    try {
        const { serverId } = req.body;
        await fs.rm(path.resolve(STORAGE_BASE, serverId), { recursive: true, force: true });
        res.json({ success: true });
    } catch (e) { res.json({ success: false, error: e.message }); }
});

app.post('/api/files/upload-raw', auth, (req, res) => {
    const busboy = Busboy({ headers: req.headers });
    const serverId = req.query.serverId;
    const subPath = req.query.subPath;
    const targetDir = getSafePath(serverId, subPath);
    let errorSent = false;

    busboy.on('file', (name, file, info) => {
        const filename = info.filename;
        const targetPath = path.join(targetDir, filename);
        const writeStream = createWriteStream(targetPath);
        file.pipe(writeStream);
    });

    busboy.on('finish', () => {
        if (!errorSent) res.json({ success: true });
    });

    busboy.on('error', (err) => {
        errorSent = true;
        res.status(500).json({ success: false, error: err.message });
    });

    req.pipe(busboy);
});

// --- POWER APIs ---
const pids = new Map();
app.post('/api/power/execute', auth, async (req, res) => {
    try {
        const { serverId, action, config } = req.body;
        const baseDir = path.resolve(STORAGE_BASE, serverId, 'files');
        const stsDir = path.join(baseDir, '.sts');
        const logPath = path.join(stsDir, 'logs', 'logs.sts');

        if (action === 'stop' || action === 'restart') {
            const child = pids.get(serverId);
            if (child) { 
                try { process.kill(-child.pid, 'SIGKILL'); } 
                catch(e) { try { process.kill(child.pid, 'SIGKILL'); } catch(e2) {} } 
                pids.delete(serverId); 
            }
            if (action === 'stop') return res.json({ success: true });
        }

        await fs.mkdir(path.dirname(logPath), { recursive: true });
        const logStream = createWriteStream(logPath, { flags: 'a' });
        
        let cmd = config.startupCommand;
        if (config.runtime === 'nodejs') cmd = 'npx -y -p node@' + config.version + ' -- ' + cmd;
        
        const child = spawn(cmd, { shell: true, cwd: baseDir, detached: true, stdio: ['pipe', 'pipe', 'pipe'] });
        pids.set(serverId, child);
        
        child.stdout.on('data', d => { logStream.write(d); });
        child.stderr.on('data', d => { logStream.write(d); });
        child.on('close', code => { 
            logStream.write('\\n[STS] Process exited with code ' + code + '\\n'); 
            pids.delete(serverId); 
        });
        
        res.json({ success: true });
    } catch (e) { res.json({ success: false, error: e.message }); }
});

app.post('/api/power/status', auth, (req, res) => {
    const { serverId } = req.body;
    const running = pids.has(serverId);
    res.json({ running });
});

app.post('/api/power/input', auth, (req, res) => {
    const { serverId, text } = req.body;
    const child = pids.get(serverId);
    if (child && child.stdin && child.stdin.writable) {
        child.stdin.write(text + '\n');
        return res.json({ success: true });
    }
    res.json({ success: false, error: "Not running or not writable" });
});

app.post('/api/files/logs', auth, async (req, res) => {
    try {
        const { serverId } = req.body;
        const logPath = getLogPath(serverId);
        const content = await fs.readFile(logPath, 'utf8');
        const lines = content.split('\n');
        res.json({ success: true, content: lines.slice(-300).join('\n') });
    } catch (e) { res.json({ success: true, content: "" }); }
});

app.post('/api/files/clear-logs', auth, async (req, res) => {
    try {
        const { serverId } = req.body;
        const logPath = getLogPath(serverId);
        await fs.writeFile(logPath, "");
        res.json({ success: true });
    } catch (e) { res.json({ success: false, error: e.message }); }
});

app.get('/', (req, res) => res.send('STSCloud Agent Active'));

const PORT = process.env.PORT || 9005;
app.listen(PORT, () => console.log('Agent worker running on port ' + PORT));
EOF

npm install --production

# Finalizing PM2
echo -e "\${GREEN}[6/6] Memulai layanan di PM2...\${NC}"
pm2 delete stscloud-agent 2>/dev/null || true
pm2 start index.js --name stscloud-agent
pm2 save
# Only show startup command, users might need to run manually as root if piping fails
pm2 startup

echo -e "\${GREEN}Instalasi Selesai!\${NC}"
echo -e "\${BLUE}=======================================================\${NC}"
echo -e "Domain: \${BLUE}\$AGENT_DOMAIN\${NC}"
echo -e "Secret Key: \${YELLOW}\$SECRET_KEY\${NC}"
echo -e "\${BLUE}=======================================================\${NC}"
`;

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
