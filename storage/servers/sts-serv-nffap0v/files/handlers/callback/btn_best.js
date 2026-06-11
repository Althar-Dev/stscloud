module.exports = async (ctx) => {
  await ctx.answerCbQuery('Best button pressed!');
  await ctx.reply('🎉 Anda menekan tombol BEST!');
};
