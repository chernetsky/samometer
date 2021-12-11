import { Bot, InlineKeyboard, NextFunction } from 'grammy';
import listsView from '../views/lists.view';
import dealRepository from '../repositories/deal.repository';
import commandsController from './commands.controller';
import { SamometerContext } from './session.controller';

class ListsController {
  init(bot: Bot) {
    bot.callbackQuery('mode-lists', this.changeMode.bind(this));
  }

  async changeMode(ctx: SamometerContext, next: NextFunction) {
    // Рисуем список, потому что переключились на Список дел
    return this._updateList(ctx);
  }

  async _updateList(ctx: SamometerContext) {
    const render = await listsView.render(ctx.from.id);
    if (ctx.session.messageId) {
      // Обновляем сообщение со списком
      await ctx.api.editMessageReplyMarkup(ctx.chat.id, ctx.session.messageId, render[1])
        .catch((err) => {
          /* Список не поменялся */
        });
    } else {
      const response = await ctx.reply.apply(ctx, render);

      const { message_id } = response;

      if (message_id) {
        ctx.session.messageId = message_id;
      }
    }
  }
}

export default new ListsController();
