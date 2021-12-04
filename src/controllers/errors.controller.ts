import { Bot, GrammyError, HttpError } from 'grammy';

class ErrorsController {
  init(bot: Bot) {
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
  }
}

export default new ErrorsController();
