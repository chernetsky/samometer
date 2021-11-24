import { Bot, GrammyError, HttpError } from 'grammy';
import { getPong } from './utils';

const bot = new Bot(process.env.BOT_TOKEN);

// React to /start command
bot.command('start', ctx => ctx.reply('Welcome! Up and running.'));

bot.command('hello', ctx => ctx.reply('World!'));

bot.hears(/^(ping|пинг|king|кинг)$/i, ctx => ctx.reply(getPong(ctx.match[1])));

// bot.on('message', ctx => ctx.reply(String(new Date())));

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
