import { buildAddMainKeyboard, isAdmin } from '../utils/produk.js';

export function registerAddCommand(bot) {
  bot.command('add', (ctx) => {
    if (!isAdmin(ctx.from?.id)) {
      return ctx.reply('Hanya owner/admin yang dapat menggunakan perintah ini.', { parse_mode: 'HTML' });
    }

    ctx.session = ctx.session || {};
    ctx.session.addFlow = null;
    return ctx.reply(
      'Halo Bos!, apa yang ingin anda tambahkan? silahkan pilih di bawah ini',
      { parse_mode: 'HTML', ...buildAddMainKeyboard() }
    );
  });
}
