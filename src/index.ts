import { Bot, GrammyError, HttpError, InlineKeyboard, Keyboard } from 'grammy';
import { getPong } from './utils/utils';
import commands from './controllers/commands';

const bot = new Bot(process.env.BOT_TOKEN);

bot.command('start', ctx => commands.start(ctx));

// // Any button of any inline keyboard:
// bot.on('callback_query:data', (ctx, next) => {
//   console.log(ctx.update.callback_query.data);

//   const keyboard = new InlineKeyboard()
//     .text('A', 'button-A').row()
//     .text('~B~', 'button-B').row()
//     .text('C', 'button-C').row()
//     .text('D', 'button-C').row()
//     .text(ctx.update.callback_query.data);

//   ctx.editMessageReplyMarkup({
//     reply_markup: keyboard,
//   });
// });

// bot.command('list', (ctx) => {
//   const keyboard = new InlineKeyboard()
//     .text('🙏🏽\tA', 'button-A').row()
//     .text('🙏🏽\t~strikethrough~', 'button-B').row()
//     .text('<s>strikethrough</s>', 'button-C').row()
//     .text('D', 'button-C').row();

//   // Send the keyboard:
//   ctx.reply('Дела на сегодня', {
//     reply_markup: keyboard,
//     parse_mode: 'MarkdownV2',
//   });

// });

// bot.command('keys', (ctx) => {
//   // Build a keyboard:
//   const keyboard = new Keyboard()
//     .text('A').text('B').row()
//     .text('C').text('D');

//   // Now you can either pass it directly:
//   ctx.reply('Here is your keyboard!', {
//     reply_markup: keyboard,
//   });

//   // Or if you need to specify more options in `reply_markup`:
//   // ctx.reply('Here is your keyboard!', {
//   //   reply_markup: {
//   //     keyboard: keyboard.build(), // note the `build` call
//   //     one_time_keyboard: true,
//   //   },
//   // });
// });

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
