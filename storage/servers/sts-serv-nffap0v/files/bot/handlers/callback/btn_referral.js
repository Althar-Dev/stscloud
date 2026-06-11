module.exports = async (ctx) => {
  await ctx.answerCbQuery();

  await ctx.editMessageText(
    '🤝 Program Referral:\nAjak teman dan dapatkan reward khusus setiap kali mereka bergabung.',
    {
      reply_markup: {
        inline_keyboard: [[{ text: 'Kembali', callback_data: 'btn_home' }]],
      },
    }
  );
};
