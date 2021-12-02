import { Bot, GrammyError, HttpError } from 'grammy';
import { getPong } from './utils';
import command from './controllers/command';
import text from './controllers/text';

const bot = new Bot(process.env.BOT_TOKEN);

bot.hears(/^(ping|пинг|king|кинг)$/i, ctx => ctx.reply(getPong(ctx.match[1])));

bot.command('start', command.start);
bot.command('list', command.list);

bot.on('message', text.message);

bot.callbackQuery(/^([un]?done)-(\d+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();

  const [, action, dealId] = ctx.match;
  console.log(action, dealId);

  // return ctx.reply(`${action}, ${dealId}`);
});

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
