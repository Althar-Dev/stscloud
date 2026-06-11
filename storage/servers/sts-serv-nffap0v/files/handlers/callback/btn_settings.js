module.exports = async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply('⚙️ Halaman pengaturan belum tersedia, tetapi ini adalah callback settings.');
};
