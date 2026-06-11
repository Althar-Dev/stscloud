// /help command handler
module.exports = async (ctx) => {
  const helpText = `
📚 *Daftar Perintah:*

/start - Mulai STS
/help - Tampilkan bantuan
/echo - Ulangi pesan Anda
/status - Cek status STS

Gunakan tombol di bawah untuk akses cepat.
`;

  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🏠 Kembali ke Menu', callback_data: 'btn_home' }],
      ],
    },
  };

  await ctx.reply(helpText, { parse_mode: 'Markdown', ...keyboard });
};
