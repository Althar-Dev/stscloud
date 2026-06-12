import { buildDeleteMainKeyboard, isAdmin } from '../utils/produk.js';

export function registerDeleteCommand(bot) {
  bot.command('delete', (ctx) => {
    if (!isAdmin(ctx.from?.id)) {
      return ctx.reply('Hanya owner/admin yang dapat menggunakan perintah ini.', { parse_mode: 'HTML' });
    }

    ctx.session = ctx.session || {};
    ctx.session.addFlow = null;
    return ctx.reply(
      'Silakan pilih jenis data yang ingin dihapus, lalu lanjutkan menggunakan tombol di bawah.',
      { parse_mode: 'HTML', ...buildDeleteMainKeyboard() }
    );
  });
}
