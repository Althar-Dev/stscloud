import { registerTextHandler } from './text.js';
import { registerCallbackHandler } from './callbackQuery.js';

export function registerHandlers(bot) {
  registerTextHandler(bot);
  registerCallbackHandler(bot);
}
