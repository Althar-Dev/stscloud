// Text message handler
module.exports = async (ctx) => {
  const text = ctx.message.text;
  const userId = ctx.from.id;
  const username = ctx.from.username || 'User';

  console.log(`[${username}] (${userId}): ${text}`);

  // Default response untuk pesan umum
  await ctx.reply(
    `📝 Anda mengirim: "${text}"\n\nGunakan /help untuk melihat perintah yang tersedia.`
  );
};
