import { Bot } from 'grammy';

const bot = new Bot(process.env.BOT_TOKEN);

// React to /start command
bot.command('start', ctx => ctx.reply('Welcome! Up and running.'));

bot.command('hello', ctx => ctx.reply('World!'));

bot.hears(/^ping|пинг$/i, ctx => ctx.reply('pong'));
bot.hears(/^king|кинг$/i, ctx => ctx.reply('kong'));

bot.on('message', ctx => ctx.reply(String(new Date())));

bot.start();

// Enable graceful stop
process.once('SIGINT', () => bot.stop());
process.once('SIGTERM', () => bot.stop());
