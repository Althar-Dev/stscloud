const { Telegraf } = require('telegraf');
const config = require('./config');
const commandHandler = require('./handlers/command_handler');
const messageHandler = require('./handlers/message_handler');
const callbackHandler = require('./handlers/callback_handler');
const errorHandler = require('./handlers/error_handler');
const STS = new Telegraf(config.token);
commandHandler(STS);
messageHandler(STS);
callbackHandler(STS);
errorHandler(STS);

STS.launch().then(() => {
  console.log('STS started successfully! 🤖');
}).catch((err) => {
  console.error('Failed to start STS:', err);
  process.exit(1);
});

process.once('SIGINT', () => STS.stop('SIGINT'));
process.once('SIGTERM', () => STS.stop('SIGTERM'));
