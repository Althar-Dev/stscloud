import { sendOrderMenu } from '../utils/order.js';

export function registerOrderCommand(bot) {
  const orderHandler = (ctx) => {
    ctx.reply('Silakan pilih paket produk di toko kami:', { parse_mode: 'HTML', ...sendOrderMenu() });
  };

  bot.command('order', orderHandler);
  bot.command('saweria', orderHandler);
}
