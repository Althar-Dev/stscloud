export function registerHelpCommand(bot) {
  bot.help((ctx) => {
    ctx.reply('Ketik /start untuk memulai, /order untuk melihat paket toko, atau kirim pesan lain untuk interaksi.', { parse_mode: 'HTML' });
  });
}
