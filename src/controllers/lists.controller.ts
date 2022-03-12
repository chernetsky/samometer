import { Bot, NextFunction } from 'grammy';
import listsView from '../views/lists.view';
import listRepository from '../repositories/list.repository';
import { SamometerContext, Mode, SubMode } from './session.controller';

class ListsController {
  private mode: Mode;
  private subMode: SubMode;

  constructor() {
    this.mode = Mode.lists;
    this.subMode = SubMode.basic;
  }

  init(bot: Bot) {
    // Вывод списка
    bot.callbackQuery('mode-lists', this._updateList.bind(this));

    // Добавление нового списка
    bot.on('message', this.add.bind(this));

    // Смена суб-режима
    bot.callbackQuery(/^submode-(\w+)$/, this.setSubMode.bind(this));

    // Поделиться
    bot.callbackQuery(/^lists-share-(\d+)$/, this.share.bind(this));

    // Удалить
    bot.callbackQuery(/^lists-delete-(\d+)$/, this.delete.bind(this));
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

  /**
   * Переключение между суб-режимами
   */
  async setSubMode(ctx: SamometerContext) {
    if (this.subMode === ctx.session.subMode) {
      return;
    }

    this.subMode = ctx.session.subMode;

    // Обновляем список
    return this._updateList(ctx);
  }

  async share(ctx: SamometerContext) {
    const [, listId] = ctx.match;

    return ctx.reply('Скоро можно будет делиться списками...');
    // console.log('Share', dealId);

    // Обновляем список
    // return this._updateList(ctx);
  }

  async delete(ctx: SamometerContext) {
    const [, listId] = ctx.match;

    await listRepository.deleteById(Number(listId));

    // Обновляем список
    return this._updateList(ctx);
  }

  async _updateList(ctx: SamometerContext) {
    const listRender = await listsView.render(ctx.from.id, this.subMode);

    if (ctx.session.messageId) {
      // Обновляем сообщение со списком
      const [text, markup] = listRender;
      await Promise.all([
        ctx.api.editMessageText(ctx.chat.id, ctx.session.messageId, text, { parse_mode: 'MarkdownV2' }),
        ctx.api.editMessageReplyMarkup(ctx.chat.id, ctx.session.messageId, markup),
      ])
        .catch((err) => {
          /* Список не поменялся */
          console.log('_updateList() error', err);
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
