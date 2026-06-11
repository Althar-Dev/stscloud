module.exports = (STS) => {
  STS.catch((err, ctx) => {
    console.error('Error:', err);
    ctx.reply('❌ Terjadi kesalahan. Silakan coba lagi.').catch(() => {});
  });

  console.log('✓ Error handlers loaded');
};
