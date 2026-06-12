import { registerStartCommand } from './start.js';
import { registerHelpCommand } from './help.js';
import { registerOrderCommand } from './order.js';
import { registerAddCommand } from './add.js';
import { registerDeleteCommand } from './delete.js';
import { registerSetCommand } from './set.js';

export function registerCommands(bot) {
  registerStartCommand(bot);
  registerOrderCommand(bot);
  registerAddCommand(bot);
  registerDeleteCommand(bot);
  registerSetCommand(bot);
  registerHelpCommand(bot);
}
