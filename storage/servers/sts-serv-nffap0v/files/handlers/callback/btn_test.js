module.exports = async (ctx) => {
  await ctx.answerCbQuery('Button tested!');
  await ctx.reply('✅ Callback test berhasil.');
};
