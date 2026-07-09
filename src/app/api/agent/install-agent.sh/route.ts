
import { NextResponse } from 'next/server';

/**
 * @fileOverview Serves the dynamic bash installation script for STSCloud Agents.
 * Includes Node.js setup, Nginx Reverse Proxy, and automated SSL.
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

# Update and Install Dependencies
echo -e "\${GREEN}[1/5] Memasang dependensi sistem...\${NC}"
apt-get update -y && apt-get upgrade -y
apt-get install -y curl wget git nginx certbot python3-certbot-nginx build-essential

# Install Node.js 20
if ! command -v node &> /dev/null; then
    echo -e "\${GREEN}[2/5] Memasang Node.js v20...\${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# Install PM2
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# Setup Directory
echo -e "\${GREEN}[3/5] Menyiapkan struktur direktori...\${NC}"
mkdir -p /opt/stscloud/agent
mkdir -p /opt/stscloud/storage/servers
cd /opt/stscloud/agent

# Generate Secret Key
SECRET_KEY=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 32 ; echo '')
echo "SECRET_KEY=\$SECRET_KEY" > .env
echo "PORT=9005" >> .env
echo "STORAGE_PATH=/opt/stscloud/storage/servers" >> .env

# Setup Nginx Configuration
echo -e "\${GREEN}[4/5] Mengonfigurasi Nginx Reverse Proxy...\${NC}"
cat > /etc/nginx/sites-available/stscloud-agent <<EOF
server {
    listen 80;
    server_name \$AGENT_DOMAIN;

    location / {
        proxy_pass http://localhost:9005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_cache_bypass \\\$http_upgrade;
        client_max_body_size 100M;
    }
}
EOF

ln -sf /etc/nginx/sites-available/stscloud-agent /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# Setup SSL with Certbot
echo -e "\${GREEN}[5/5] Mengaktifkan SSL Otomatis (Let's Encrypt)...\${NC}"
certbot --nginx -d \$AGENT_DOMAIN --non-interactive --agree-tos -m admin@\$AGENT_DOMAIN || echo -e "\${YELLOW}Gagal mendapatkan SSL otomatis. Pastikan domain sudah diarahkan ke IP VPS ini.\${NC}"

# Finalizing
echo -e "\${BLUE}=======================================================\${NC}"
echo -e "\${GREEN}INSTALLATION COMPLETE!\${NC}"
echo -e "\${BLUE}=======================================================\${NC}"
echo -e "Domain: \${BLUE}\$AGENT_DOMAIN\${NC}"
echo -e "Secret Key: \${YELLOW}\$SECRET_KEY\${NC}"
echo -e "\${BLUE}=======================================================\${NC}"
echo -e "Gunakan Secret Key di atas saat mendaftarkan agent di Dev Console."
echo -e "Agent Worker akan berjalan secara otomatis di port 9005."
echo -e "\${BLUE}=======================================================\${NC}"
`;

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
