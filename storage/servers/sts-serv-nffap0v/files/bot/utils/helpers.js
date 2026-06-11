const formatUserInfo = (user) => {
  return {
    id: user.id,
    name: user.first_name + (user.last_name ? ' ' + user.last_name : ''),
    username: user.username || 'N/A',
    isSTS: user.is_STS,
  };
};


const createInlineKeyboard = (buttons) => {
  return {
    reply_markup: {
      inline_keyboard: buttons,
    },
  };
};

const logMessage = (ctx, action = 'Message') => {
  const user = formatUserInfo(ctx.from);
  console.log(`[${action}] ${user.name} (@${user.username}): ${ctx.message?.text || 'N/A'}`);
};

module.exports = {
  formatUserInfo,
  createInlineKeyboard,
  logMessage,
};
