module.exports = async (ctx) => {
  await ctx.answerCbQuery();

  const message = `👋 Halo!\n━━━━━━━━━━━━━━━━━━━━\n📋 <b>SYARAT & KETENTUAN</b>\n\n▸ Admin tidak bertanggung jawab atas hal yang terjadi di dalam grup\n▸ Jika grup terban, akan dibuat grup baru <b>(wajib join ulang)</b>\n▸ Tidak ada <b>refund</b> dalam kondisi apapun\n▸ Grup tidak memiliki backup konten\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Dengan menekan <b>Join Sekarang</b>, kamu setuju dengan semua ketentuan di atas.`;

  const keyboard = {
    inline_keyboard: [
      [{ text: 'Join Sekarang - 2.000', callback_data: 'btn_join' }],
      [
        { text: 'Cara Bayar', callback_data: 'btn_payment' },
        { text: 'Support', callback_data: 'btn_support' },
      ],
      [{ text: 'Program Refferal', callback_data: 'btn_referral' }],
    ],
  };

  await ctx.editMessageText(message, {
    parse_mode: 'HTML',
    reply_markup: keyboard,
  });
};
