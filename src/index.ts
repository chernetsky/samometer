import { Bot } from 'grammy';

import commandsController from './controllers/commands.controller';
import errorsController from './controllers/errors.controller';
import dealsController from './controllers/deals.controller';
import sessionController, { SamometerContext } from './controllers/session.controller';

function bootstrap() {
  const bot = new Bot<SamometerContext>(process.env.BOT_TOKEN);

  [
    sessionController,
    commandsController,
    dealsController,
    errorsController,
  ].forEach(c => c.init(bot));

  bot.start();

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop());
  process.once('SIGTERM', () => bot.stop());
}

bootstrap();
