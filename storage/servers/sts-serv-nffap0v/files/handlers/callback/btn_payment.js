module.exports = async (ctx) => {
  await ctx.answerCbQuery();

  await ctx.editMessageText(
    '💳 Berikut adalah informasi cara bayar:\n1. Transfer bank\n2. E-wallet\n3. Pulsa (jika tersedia)',
    {
      reply_markup: {
        inline_keyboard: [[{ text: 'Kembali', callback_data: 'btn_home' }]],
      },
    }
  );
};
