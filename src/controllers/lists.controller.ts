import { Bot, InlineKeyboard, NextFunction } from 'grammy';
import listsView from '../views/lists.view';
import listRepository from '../repositories/list.repository';
import { SamometerContext } from './session.controller';

class ListsController {
  private mode: string;

  constructor() {
    this.mode = 'lists';
  }

  init(bot: Bot) {
    bot.callbackQuery('mode-lists', this.changeMode.bind(this));

    bot.on('message', this.add.bind(this));
  }

  async changeMode(ctx: SamometerContext, next: NextFunction) {
    // Рисуем список, потому что переключились на Список дел
    return this._updateList(ctx);
  }

  async add(ctx: SamometerContext, next: NextFunction) {
    if (!this._checkMode(ctx)) {
      return next();
    }

    const { message: { text } } = ctx;
    if (!text) {
      return ctx.reply('Нет текста...');
    }

    // Создаём новый список
    await listRepository.create({
      userId: ctx.from.id,
      name: text,
    });

    // Удаляем текущее сообщение
    await ctx.deleteMessage();

    // Обновляем список
    return this._updateList(ctx);
  }

  // todo: Move to base class
  _checkMode(ctx: SamometerContext) {
    return ctx.session.mode === this.mode;
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
