import os
import time
import socket
import platform
import requests
import psutil

from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

BOT_TOKEN = "8637068110:AAH3Dd0CIedlc6YQkKYV5XQsMwL8fXuckYM"

BOOT_TIME = psutil.boot_time()


def format_bytes(size):
    for unit in ["B", "KB", "MB", "GB", "TB"]:
        if size < 1024:
            return f"{size:.2f} {unit}"
        size /= 1024


def format_uptime(seconds):
    days = int(seconds // 86400)
    seconds %= 86400
    hours = int(seconds // 3600)
    seconds %= 3600
    minutes = int(seconds // 60)
    seconds = int(seconds % 60)

    return f"{days}d {hours}h {minutes}m {seconds}s"


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "👋 Halo!\n\nGunakan /help untuk melihat daftar command."
    )


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "/start - Mulai bot\n"
        "/help - Bantuan\n"
        "/health - Status server"
    )


async def health(update: Update, context: ContextTypes.DEFAULT_TYPE):
    cpu = psutil.cpu_percent(interval=1)
    cpu_core = psutil.cpu_count()

    ram = psutil.virtual_memory()
    disk = psutil.disk_usage("/")

    uptime = format_uptime(time.time() - BOOT_TIME)

    hostname = socket.gethostname()

    try:
        local_ip = socket.gethostbyname(hostname)
    except:
        local_ip = "-"

    try:
        public_ip = requests.get(
            "https://api.ipify.org",
            timeout=5
        ).text
    except:
        public_ip = "-"

    text = f"""
🖥 <b>Server Health</b>

💻 OS
<code>{platform.system()} {platform.release()}</code>

🏷 Hostname
<code>{hostname}</code>

🌐 Local IP
<code>{local_ip}</code>

🌍 Public IP
<code>{public_ip}</code>

⚙ CPU
Usage : <b>{cpu}%</b>
Core : <b>{cpu_core}</b>

🧠 RAM
Used : <b>{format_bytes(ram.used)}</b>
Free : <b>{format_bytes(ram.available)}</b>
Total : <b>{format_bytes(ram.total)}</b>
Usage : <b>{ram.percent}%</b>

💾 Storage
Used : <b>{format_bytes(disk.used)}</b>
Free : <b>{format_bytes(disk.free)}</b>
Total : <b>{format_bytes(disk.total)}</b>
Usage : <b>{disk.percent}%</b>

⏱ Uptime
<b>{uptime}</b>
"""

    await update.message.reply_text(
        text,
        parse_mode="HTML"
    )


app = ApplicationBuilder().token(BOT_TOKEN).build()

app.add_handler(CommandHandler("start", start))
app.add_handler(CommandHandler("help", help_command))
app.add_handler(CommandHandler("health", health))

print("Bot berjalan...")

app.run_polling()