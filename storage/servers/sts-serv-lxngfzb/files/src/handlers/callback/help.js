const helpHandler = require('../commands/help');

async function buttonHelpHandler(sock, msg, config = {}) {
  return helpHandler(sock, msg, config);
}

module.exports = buttonHelpHandler;
