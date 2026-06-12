import { Telegraf, session } from 'telegraf';
import { registerCommands } from './commands/index.js';
import { registerHandlers } from './handlers/index.js';
import { logger } from './utils/logger.js';

export function createBot(token) {
  const bot = new Telegraf(token);

  bot.use(session());
  bot.use((ctx, next) => {
    ctx.session = ctx.session || {};
    logger.info(`Update type: ${ctx.updateType}`);
    return next();
  });

  registerCommands(bot);
  registerHandlers(bot);

  return bot;
}
