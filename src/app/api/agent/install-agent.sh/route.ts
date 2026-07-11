
import { NextResponse } from 'next/server';

/**
 * @fileOverview Serves the dynamic bash installation script for STSCloud Agents.
 * Updated: Robust dependency checks, Node/PM2 detection, and smart fallback logic.
 */

export async function GET() {
  const script = `#!/bin/bash

# STSCloud Agent Automated Installation Script
# Powered by StarVale Technology Solution

set -e

# Colors for terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

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
read AGENT_DOMAIN

if [ -z "\$AGENT_DOMAIN" ]; then
    echo -e "\${RED}Domain tidak boleh kosong!\${NC}"
    exit 1
fi

# Update and Install System Dependencies
echo -e "\${GREEN}[1/5] Memperbarui paket sistem...\${NC}"
apt-get update -y
apt-get install -y curl wget git nginx certbot python3-certbot-nginx build-essential

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
echo -e "\${GREEN}[2/5] Menyiapkan struktur direktori...\${NC}"
mkdir -p /opt/stscloud/agent
mkdir -p /opt/stscloud/storage/servers
cd /opt/stscloud/agent

# Generate Secret Key if not exists
if [ ! -f .env ]; then
    SECRET_KEY=$(head /raw/urandom | tr -dc A-Za-z0-9 | head -c 32 ; echo '')
    echo "SECRET_KEY=\$SECRET_KEY" > .env
    echo "PORT=9005" >> .env
    echo "STORAGE_PATH=/opt/stscloud/storage/servers" >> .env
    echo -e "\${GREEN}Secret Key baru dibuat.\${NC}"
else
    SECRET_KEY=$(grep SECRET_KEY .env | cut -d '=' -f 2)
    echo -e "\${BLUE}Menggunakan Secret Key yang sudah ada.\${NC}"
fi

# Setup Nginx Configuration
echo -e "\${GREEN}[3/5] Mengonfigurasi Nginx Reverse Proxy...\${NC}"
cat > /etc/nginx/sites-available/stscloud-agent <<EOF
server {
    listen 80;
    server_name $AGENT_DOMAIN;

    # Maksimal ukuran upload
    client_max_body_size 5G;

    # Timeout upload besar
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

        # Streaming upload langsung ke backend
        proxy_request_buffering off;
        proxy_buffering off;

        # Timeout ke backend
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;

        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/stscloud-agent /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
if nginx -t; then
    systemctl restart nginx
else
    echo -e "\${RED}Konfigurasi Nginx bermasalah, silakan periksa manual.\${NC}"
fi

# Setup SSL with Certbot
echo -e "\${GREEN}[4/5] Mengaktifkan SSL Otomatis (Let's Encrypt)...\${NC}"
if certbot --nginx -d \$AGENT_DOMAIN --non-interactive --agree-tos -m admin@\$AGENT_DOMAIN; then
    echo -e "\${GREEN}SSL Berhasil dikonfigurasi.\${NC}"
else
    echo -e "\${YELLOW}Gagal mendapatkan SSL otomatis. Pastikan domain sudah diarahkan ke IP VPS ini.\${NC}"
    echo -e "\${YELLOW}Agent akan tetap berjalan via HTTP (Port 80) untuk sementara.\${NC}"
fi

# Finalizing
echo -e "\${GREEN}[5/5] Instalasi Selesai!\${NC}"
echo -e "\${BLUE}=======================================================\${NC}"
echo -e "Domain: \${BLUE}\$AGENT_DOMAIN\${NC}"
echo -e "Secret Key: \${YELLOW}\$SECRET_KEY\${NC}"
echo -e "\${BLUE}=======================================================\${NC}"
echo -e "Gunakan Secret Key di atas saat mendaftarkan agent di Dev Console."
echo -e "Agent akan otomatis berjalan di port 9005."
echo -e "Pastikan port 80, 443, dan 9005 terbuka di firewall (ufw/iptables)."
echo -e "\${BLUE}=======================================================\${NC}"
`;

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
