import { Markup } from 'telegraf';

export function registerStartCommand(bot) {
  bot.start(async (ctx) => {
    const name = ctx.from?.first_name || ctx.from?.username || 'Teman';
    const welcomeMessage = `👋 <b>Welcome!</b>

<blockquote>Halo ${name}! Selamat datang di toko kami silahkan pilih menu di bawah ini:</blockquote>\n\n` +
      `<b>Jangan cuma di lihat tapi di order ya betie</b> 😁\n\n`;

    return ctx.reply(
      welcomeMessage,
      {
        parse_mode: 'HTML',
        message_effect_id: '5104841245755180586',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('Menu', 'show_menu'), Markup.button.callback('Testimoni', 'show_testimoni')],
          [Markup.button.callback('Support', 'support'), Markup.button.callback('Bot Info', 'bot_info')],
        ]),
      }
    );
  });

  bot.command('about', (ctx) => {
    ctx.reply('Bot ini dibuat dengan struktur modular menggunakan Telegraf.', { parse_mode: 'HTML' });
  });
}
