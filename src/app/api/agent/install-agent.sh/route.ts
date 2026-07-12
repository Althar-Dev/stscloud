
import { NextResponse } from 'next/server';

/**
 * @fileOverview Serves the dynamic bash installation script for STSCloud Agents.
 * Fixed: Added functional index.js worker to handle real hardware metrics and API requests.
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
apt-get install -y curl wget git nginx certbot python3-certbot-nginx build-essential unzip

# Install/Check Node.js
if command -v node &> /dev/null; then
    NODE_VER=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
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
    SECRET_KEY=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 32 ; echo '')
    echo "SECRET_KEY=\$SECRET_KEY" > .env
    echo "PORT=9005" >> .env
    echo "STORAGE_PATH=/opt/stscloud/storage/servers" >> .env
    echo -e "\${GREEN}Secret Key baru dibuat.\${NC}"
else
    SECRET_KEY=$(grep SECRET_KEY .env | cut -d '=' -f 2)
    echo -e "\${BLUE}Menggunakan Secret Key yang sudah ada.\${NC}"
fi

# Setup Nginx Configuration (Using Quoted Heredoc to prevent variable expansion)
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
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  }
}
EOF

cat > index.js <<'EOF'
const express = require('express');
const cors = require('cors');
const os = require('os');
const { execSync } = require('child_process');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = process.env.SECRET_KEY;

// Auth Middleware
const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader === \`Bearer \${SECRET_KEY}\`) return next();
    if (req.body && req.body.secret === SECRET_KEY) return next();
    return res.status(401).json({ success: false, error: 'Unauthorized' });
};

// Health Check (Latency checking)
app.get('/', (req, res) => res.send('STSCloud Agent Active'));

// System Hardware Info
app.post('/api/system/info', auth, (req, res) => {
    try {
        const cpus = os.cpus();
        const totalRamBytes = os.totalmem();
        const freeRamBytes = os.freemem();
        
        let totalDisk = "Unknown";
        let freeDiskBytes = 0;
        let totalDiskBytes = 0;

        try {
            const output = execSync("df -B1 / | tail -1", { encoding: 'utf8' }).trim();
            const parts = output.split(/\\s+/);
            if (parts.length >= 4) {
                totalDiskBytes = parseInt(parts[1]);
                freeDiskBytes = parseInt(parts[3]);
                totalDisk = (totalDiskBytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
            }
        } catch (e) {}

        res.json({
            success: true,
            data: {
                cpuModel: cpus[0]?.model || "Generic CPU",
                cpuCores: cpus.length,
                totalRam: (totalRamBytes / (1024 * 1024 * 1024)).toFixed(1) + " GB",
                freeRam: (freeRamBytes / (1024 * 1024 * 1024)).toFixed(1) + " GB",
                usedRam: ((totalRamBytes - freeRamBytes) / (1024 * 1024 * 1024)).toFixed(1) + " GB",
                totalDisk: totalDisk,
                freeDisk: (freeDiskBytes / (1024 * 1024 * 1024)).toFixed(1) + " GB",
                usedDisk: ((totalDiskBytes - freeDiskBytes) / (1024 * 1024 * 1024)).toFixed(1) + " GB"
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 9005;
app.listen(PORT, () => console.log(\`Agent worker running on port \${PORT}\`));
EOF

npm install --production

# Finalizing PM2
echo -e "\${GREEN}[6/6] Memulai layanan di PM2...\${NC}"
pm2 delete stscloud-agent 2>/dev/null || true
pm2 start index.js --name stscloud-agent
pm2 save
pm2 startup | bash || true

echo -e "\${GREEN}Instalasi Selesai!\${NC}"
echo -e "\${BLUE}=======================================================\${NC}"
echo -e "Domain: \${BLUE}\$AGENT_DOMAIN\${NC}"
echo -e "Secret Key: \${YELLOW}\$SECRET_KEY\${NC}"
echo -e "\${BLUE}=======================================================\${NC}"
echo -e "Gunakan Secret Key di atas saat mendaftarkan agent di Dev Console."
echo -e "Agent berjalan di port 9005 dan diproxy oleh Nginx."
echo -e "\${BLUE}=======================================================\${NC}"
`;

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
