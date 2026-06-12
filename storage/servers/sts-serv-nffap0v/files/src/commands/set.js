import { buildSetMainKeyboard, isAdmin } from '../utils/produk.js';

export function registerSetCommand(bot) {
  bot.command('set', (ctx) => {
    if (!isAdmin(ctx.from?.id)) {
      return ctx.reply('Hanya owner/admin yang dapat menggunakan perintah ini.', { parse_mode: 'HTML' });
    }

    ctx.session = ctx.session || {};
    ctx.session.addFlow = null;
    return ctx.reply(
      'Halo Bos!, apa yang ingin anda setting? silahkan pilih di bawah ini',
      { parse_mode: 'HTML', ...buildSetMainKeyboard() }
    );
  });
}
