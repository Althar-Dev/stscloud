module.exports = async (ctx) => {
  await ctx.answerCbQuery();

  await ctx.editMessageText(
    '🆘 Ini adalah bantuan dari callback. Gunakan /help untuk melihat perintah.',
    {
      reply_markup: {
        inline_keyboard: [[{ text: 'Kembali', callback_data: 'btn_home' }]],
      },
    }
  );
};
