
import { NextResponse } from 'next/server';

/**
 * @fileOverview Serves the dynamic bash uninstallation script for STSCloud Agents.
 * Handles cleanup of PM2, Nginx, and system files with safety confirmations.
 */

export async function GET() {
  const script = `#!/bin/bash

# STSCloud Agent Automated Uninstallation Script
# Powered by StarVale Technology Solution

set -e

# Colors for terminal
RED='\\033[0;31m'
GREEN='\\033[0;32m'
BLUE='\\033[0;34m'
YELLOW='\\033[1;33m'
NC='\\033[0m'

echo -e "\${RED}=======================================================\${NC}"
echo -e "\${RED}          STSCLOUD AGENT STORAGE UNINSTALLER           \${NC}"
echo -e "\${RED}=======================================================\${NC}"

# Check for root
if [ "\$EUID" -ne 0 ]; then 
  echo -e "\${RED}Harap jalankan skrip ini sebagai root (sudo).\${NC}"
  exit 1
fi

# Confirm Uninstallation
echo -e "\${YELLOW}Apakah Anda yakin ingin menghapus STSCloud Agent dari server ini? (y/n)\${NC}"
read -r CONFIRM < /dev/tty

if [ "\$CONFIRM" != "y" ] && [ "\$CONFIRM" != "Y" ]; then
    echo -e "Pencopotan dibatalkan."
    exit 0
fi

# 1. Stop and Delete PM2 Process
echo -e "\${GREEN}[1/4] Menghentikan proses agent di PM2...\${NC}"
if command -v pm2 &> /dev/null; then
    pm2 stop stscloud-agent 2>/dev/null || true
    pm2 delete stscloud-agent 2>/dev/null || true
    pm2 save --force 2>/dev/null || true
    echo -e "\${BLUE}Proses PM2 dibersihkan.\${NC}"
else
    echo -e "\${YELLOW}PM2 tidak ditemukan, melewati langkah ini.\${NC}"
fi

# 2. Cleanup Nginx Configuration
echo -e "\${GREEN}[2/4] Menghapus konfigurasi Nginx...\${NC}"
if [ -f /etc/nginx/sites-enabled/stscloud-agent ]; then
    rm -f /etc/nginx/sites-enabled/stscloud-agent
fi
if [ -f /etc/nginx/sites-available/stscloud-agent ]; then
    rm -f /etc/nginx/sites-available/stscloud-agent
fi

if nginx -t &> /dev/null; then
    systemctl restart nginx || true
    echo -e "\${BLUE}Konfigurasi Nginx dihapus dan dimuat ulang.\${NC}"
else
    echo -e "\${RED}Peringatan: Konfigurasi Nginx lainnya bermasalah, silakan periksa manual.\${NC}"
fi

# 3. Remove Core Files
echo -e "\${GREEN}[3/4] Menghapus file sistem agent...\${NC}"
if [ -d /opt/stscloud/agent ]; then
    rm -rf /opt/stscloud/agent
    echo -e "\${BLUE}Direktori /opt/stscloud/agent dihapus.\${NC}"
fi

# 4. Storage Cleanup Option
echo -e "\${YELLOW}[4/4] Apakah Anda ingin menghapus data server (Storage)?\${NC}"
echo -e "\${RED}PERINGATAN: Ini akan menghapus SEMUA file server user yang dihosting di node ini!\${NC}"
echo -e "\${YELLOW}Ketik 'HAPUS' (huruf kapital) untuk mengonfirmasi penghapusan storage:\${NC}"
read -r DELETE_STORAGE < /dev/tty

if [ "\$DELETE_STORAGE" == "HAPUS" ]; then
    echo -e "\${RED}Menghapus seluruh data di /opt/stscloud/storage...\${NC}"
    rm -rf /opt/stscloud/storage
    echo -e "\${GREEN}Seluruh data storage telah dihapus permanen.\${NC}"
else
    echo -e "\${BLUE}Data storage dipertahankan di /opt/stscloud/storage.\${NC}"
fi

# Finalizing
echo -e "\${GREEN}Pencopotan Selesai!\${NC}"
echo -e "\${BLUE}=======================================================\${NC}"
echo -e "Terima kasih telah menggunakan infrastruktur STSCloud."
echo -e "Node ini sekarang bebas dari layanan Agent."
echo -e "\${BLUE}=======================================================\${NC}"
`;

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
