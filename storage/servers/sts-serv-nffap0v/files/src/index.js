import dotenv from 'dotenv';
import { createBot } from './bot.js';
import { althar } from './config/config.js';

dotenv.config();

const token = althar.token;
if (!token) {
  console.error('Error: BOT_TOKEN belum diset di .env atau config');
  process.exit(1);
}

const bot = createBot(token);

bot.catch((err) => {
  console.error('Bot error:', err);
});

bot.launch().then(() => {
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));