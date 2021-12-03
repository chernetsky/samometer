import { Bot, GrammyError, HttpError, session } from 'grammy';
import { getPong } from './utils';
import commandsController from './controllers/commands.controller';
import listController from './controllers/list.controller';
import { SamometerContext, SessionData } from 'session/context';
// import { Bot, Context, session, SessionFlavor } from 'grammy';
function bootstrap() {
  const bot = new Bot<SamometerContext>(process.env.BOT_TOKEN);

  bot.use(
    session({
      initial(): SessionData {
        return {
          listId: null,
          messageId: null,
        };
      },
    }),
  );

  bot.hears(/^(ping|пинг|king|кинг)$/i, ctx => ctx.reply(getPong(ctx.match[1])));

  [commandsController, listController].forEach(c => c.init(bot));

  bot.on('callback_query:data', async (ctx) => {
    console.log('Unknown button event with payload', ctx.update, ctx.callbackQuery.data);
    return ctx.answerCallbackQuery();
  });

  bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
      console.error('Error in request:', e.description);
    } else if (e instanceof HttpError) {
      console.error('Could not contact Telegram:', e);
    } else {
      console.error('Unknown error:', e);
    }
  });

  bot.start();

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop());
  process.once('SIGTERM', () => bot.stop());
}

bootstrap();
