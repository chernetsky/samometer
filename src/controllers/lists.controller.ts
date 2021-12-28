import { Bot, NextFunction } from 'grammy';
import listsView from '../views/lists.view';
import listRepository from '../repositories/list.repository';
import { SamometerContext } from './session.controller';

class ListsController {
  private mode: string;

  constructor() {
    this.mode = 'lists';
  }

  init(bot: Bot) {
    // Вывод списка
    bot.callbackQuery('mode-lists', this._updateList.bind(this));

    // Добавление нового списка
    bot.on('message', this.add.bind(this));
  }

  async add(ctx: SamometerContext, next: NextFunction) {
    if (ctx.session.mode !== this.mode) {
      return next();
    }

    const { message: { text } } = ctx;
    if (!text) {
      return ctx.reply('Дайте название нового списка текстом...');
    }

    // Создаём новый список
    await listRepository.create(ctx.from.id, {
      name: text,
    });

    // Удаляем текущее сообщение
    await ctx.deleteMessage();

    // Обновляем список
    return this._updateList(ctx);
  }

  async _updateList(ctx: SamometerContext) {
    const listRender = await listsView.render(ctx.from.id);

    if (ctx.session.messageId) {
      // Обновляем сообщение со списком
      const [, markup] = listRender;
      await ctx.api.editMessageReplyMarkup(ctx.chat.id, ctx.session.messageId, markup)
        .catch((err) => {
          /* Список не поменялся */
        });

    } else {
      // Заново создаём сообщение со списком
      const response = await ctx.reply.apply(ctx, listRender);

      const { message_id } = response;
      if (message_id) {
        ctx.session.messageId = message_id;
      }
    }
  }
}

export default new ListsController();
