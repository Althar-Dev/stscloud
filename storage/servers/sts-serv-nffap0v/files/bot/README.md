# STS Telegram Modular

STS Telegram yang dibangun dengan Node.js menggunakan framework **Telegraf**.

## 📋 Struktur Proyek

```
STS/
├── handlers/              # Handler untuk commands, messages, callbacks
│   ├── commands/         # Command handlers (/start, /help, etc)
│   ├── messages/         # Message handlers (text, photo, etc)
│   ├── callback/         # Callback handlers untuk inline buttons
│   ├── command_handler.js
│   ├── message_handler.js
│   ├── callback_handler.js
│   └── error_handler.js
├── utils/                # Utility functions dan helpers
│   └── helpers.js
├── main.js              # Entry point STS
├── config.js            # Configuration
├── package.json         # Dependencies
├── .env                 # Environment variables
└── README.md            # Documentation
```

## 🚀 Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Konfigurasi Token
Edit file `.env` dan masukkan Telegram STS Token:
```
TELEGRAM_TOKEN=your_STS_token_here
```

Dapatkan token dari [@STSFather](https://t.me/STSfather)

### 3. Jalankan STS
```bash
npm start
```

Atau untuk development dengan auto-reload:
```bash
npm run dev
```

## 📝 Commands

- `/start` - Memulai STS
- `/help` - Tampilkan bantuan
- `/echo` - Ulangi pesan

## 🏗️ Struktur Modular

### Menambah Command Baru

Buat file di `handlers/commands/`:
```javascript
// handlers/commands/echo.js
module.exports = async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1).join(' ');
  await ctx.reply(`Echo: ${args}`);
};
```

Daftarkan di `handlers/command_handler.js`:
```javascript
const echoCommand = require('./commands/echo');
STS.command('echo', echoCommand);
```

### Menambah Message Handler Baru

Buat file di `handlers/messages/`:
```javascript
// handlers/messages/photo_handler.js
module.exports = async (ctx) => {
  await ctx.reply('📸 Foto diterima!');
};
```

Daftarkan di `handlers/message_handler.js`:
```javascript
const photoHandler = require('./messages/photo_handler');
STS.on('photo', photoHandler);
```

### Menambah Callback Handler

Edit `handlers/callback_handler.js`:
```javascript
STS.action('btn_like', async (ctx) => {
  await ctx.answerCbQuery('👍 Anda menyukai ini!');
});
```

## 🛠️ Teknologi

- **Telegraf** - Framework Telegram STS untuk Node.js
- **dotenv** - Environment variable management
- **axios** - HTTP client (opsional untuk API calls)

## 📚 Referensi

- [Telegraf Documentation](https://telegraf.js.org/)
- [Telegram STS API](https://core.telegram.org/STSs/api)
- [STSFather](https://t.me/STSfather)

## 📄 License

ISC
