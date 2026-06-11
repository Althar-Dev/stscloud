module.exports = async (ctx) => {
  await ctx.answerCbQuery();

  await ctx.editMessageText(
    '📩 Support tersedia 24/7. Silakan kirim pertanyaan Anda di sini, kami akan bantu secepatnya.',
    {
      reply_markup: {
        inline_keyboard: [[{ text: 'Kembali', callback_data: 'btn_home' }]],
      },
    }
  );
};
