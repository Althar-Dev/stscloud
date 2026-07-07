const menuHandler = require('../commands/menu');

async function buttonMenuHandler(sock, msg, config = {}) {
  return menuHandler(sock, msg, config);
}

module.exports = buttonMenuHandler;
