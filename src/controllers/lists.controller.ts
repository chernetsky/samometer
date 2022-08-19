import { Bot, NextFunction } from 'grammy';
import listsView from '../views/lists.view';
import listRepository from '../repositories/list.repository';
import { SamometerContext, Mode, SubMode } from './session.controller';

class ListsController {
  private mode: Mode;

  constructor() {
    // Режим для этого контроллера
    this.mode = Mode.lists;
  }

  init(bot: Bot) {
    // Вывод списка списков
    bot.callbackQuery('mode-lists', this.lists.bind(this));
    bot.command('lists', this.lists.bind(this));

    // Смена суб-режима
    bot.callbackQuery(/^submode-\w+$/, this.lists.bind(this));

    // Добавление нового списка
    bot.on('message', this.add.bind(this));

    // Удаление списка
    bot.callbackQuery(/^lists-delete-(\d+)$/, this.delete.bind(this));
  }

  /**
   * Вывод списка списков
   */
  async lists(ctx: SamometerContext) {
    // Обновляем список только для текущего юзера
    return this.update(ctx);
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

    return this.update(ctx);
  }

  async delete(ctx: SamometerContext) {
    const [, listId] = ctx.match;

    // Удалить связь юзера со списком
    const list = await listRepository.removeOwner(Number(listId), ctx.from.id);

    // Удаляем сам список
    // eslint-disable-next-line no-underscore-dangle
    if (list._count.users === 0) {
      // Удаляем список, если владельцев не осталось
      await listRepository.delete(Number(listId));
    }

    // Возвращаемся в обычный режим
    ctx.session.subMode = SubMode.basic;

    if (Number(listId) === ctx.session.listId) {
      // Удаление текущего списка - стираем в сессии текущий
      ctx.session.listId = null;
    }

    return this.update(ctx);
  }

  /**
   * Отображение актуального списка списков.
   * - обновляет существующее сообщение
   * - или отправляет новое
   */
  private async update(ctx: SamometerContext) {
    const listRender = await listsView.render(ctx);

    if (ctx.session.messageId) {
      // Обновляем сообщение со списком
      const [text, markup] = listRender;
      await Promise.all([
        ctx.api.editMessageText(ctx.chat.id, ctx.session.messageId, text, { parse_mode: 'MarkdownV2' }),
        ctx.api.editMessageReplyMarkup(ctx.chat.id, ctx.session.messageId, markup),
      ]).catch(() => { /* Список не поменялся */ });
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
