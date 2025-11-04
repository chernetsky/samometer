import { Bot } from 'grammy';

import commandsController from './controllers/commands.controller';
import errorsController from './controllers/errors.controller';
import dealsController from './controllers/deals.controller';
import listsController from './controllers/lists.controller';
import inviteController from './controllers/invite.controller';
import sessionController, { SamometerContext } from './controllers/session.controller';

function bootstrap() {
  const bot = new Bot<SamometerContext>(process.env.BOT_TOKEN);
  console.debug('Bot object created...');
  [
    commandsController,
    //sessionController,
    //dealsController,
    //listsController,
    //inviteController,
    errorsController,
  ].forEach(c => {
    try {
      c.init(bot);
    } catch (err) {
      console.error(`${c.constructor.name} init error: ${err.message}`);
    }
  });

  console.debug('Controllers initialized...');
  
  bot.start();

  console.debug('Bot started...');

  // Enable graceful stop
  process.once('SIGINT', () => {
    console.log('SIGINT', (new Date()).toISOString());
    bot.stop();
  });

  process.once('SIGTERM', () => {
    console.log('SIGTERM', (new Date()).toISOString());
    bot.stop();
  });
}

bootstrap();
