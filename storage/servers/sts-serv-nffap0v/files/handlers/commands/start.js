module.exports = async (ctx) => {
  const username = ctx.from.username || ctx.from.first_name || 'User';
  const message = `👋 Halo, <b>${username}</b>!\n━━━━━━━━━━━━━━━━━━━━\n📋 <b>SYARAT & KETENTUAN</b>\n\n▸ Admin tidak bertanggung jawab atas hal yang terjadi di dalam grup\n▸ Jika grup terban, akan dibuat grup baru <b>(wajib join ulang)</b>\n▸ Tidak ada <b>refund</b> dalam kondisi apapun\n▸ Grup tidak memiliki backup konten\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Dengan menekan <b>Join Sekarang</b>, kamu setuju dengan semua ketentuan di atas.`;

  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Join Sekarang - 2.000', callback_data: 'btn_join' }],
        [
          { text: 'Cara Bayar', callback_data: 'btn_payment' },
          { text: 'Support', callback_data: 'btn_support' },
        ],
        [{ text: 'Program Refferal', callback_data: 'btn_referral' }],
      ],
    },
  };

  await ctx.reply(message, {
    parse_mode: 'HTML',
    ...keyboard,
  });
};
