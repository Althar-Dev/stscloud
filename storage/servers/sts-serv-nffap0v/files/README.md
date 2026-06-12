# Auto Order Saweria Bot

Bot Telegram modular menggunakan Telegraf.

## Setup

1. Salin `.env.example` ke `.env`
2. Isi `BOT_TOKEN` dengan token bot Telegram kamu
3. Jalankan:

```bash
npm install
npm start
```

## Struktur

- `src/index.js`: entry point aplikasi
- `src/bot.js`: buat dan konfigurasikan bot
- `src/commands/`: perintah bot seperti `/start`, `/help`, `/order`
- `src/handlers/`: penangan pesan dan callback
- `src/utils/`: utilitas seperti logger sederhana
