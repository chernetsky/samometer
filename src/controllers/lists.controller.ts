import { Bot, InlineKeyboard, NextFunction } from 'grammy';
import listsView from '../views/lists.view';
import listRepository from '../repositories/list.repository';
import { SamometerContext, Mode, SubMode } from './session.controller';
import { InlineQueryResultArticle } from '@grammyjs/types';

class ListsController {
  private mode: Mode;

  constructor() {
    // Режим для этого контроллера
    this.mode = Mode.lists;
  }

  init(bot: Bot) {
    // Вывод списка
    bot.callbackQuery(
      'mode-lists',
      this.update.bind(this));

    // Смена суб-режима
    bot.callbackQuery(
      /^submode-\w+$/,
      this.update.bind(this));

    // Удаление списка
    bot.callbackQuery(
      /^lists-delete-(\d+)$/,
      this.delete.bind(this),
      this.update.bind(this));

    // Добавление нового списка
    bot.on(
      'message',
      this.add.bind(this),
      this.update.bind(this));

    // todo: dev share
    const shareListAnswer = {
      type: 'article',
      id: 'share-1',
      title: 'Поделиться списком Таким-то',
      input_message_content: {
        message_text: 'С вами хотят поделиться списком *Таким\\-то* через бот @SamometerBot\nПримите приглашение и установите @SamometerBot\\, чтобы начать им пользоваться\\. Либо просто отклоните приглашение\\.',
        parse_mode: 'MarkdownV2',
      },
      reply_markup: (new InlineKeyboard())
        .text('Принять', 'share-accept-10')
        .text('Отклонить', 'share-decline-10')
        .row(),

    } as InlineQueryResultArticle;

    bot.inlineQuery(/^lists-share-(\d+)$/, (ctx) => {
      // return ctx.reply('Скоро можно будет делиться списками...');

      // console.log('Processing inline query', ctx.match, ctx.update?.inline_query);
      // return ctx.answerInlineQuery([shareListAnswer]);
    });

    bot.callbackQuery(/^share-(accept|decline)-(\d+)$/, async (ctx) => {
      const [, action, id] = ctx.match;
      // console.log(action === 'accept' ? 'Вы приняли приглашение' : 'Сорян');

      await ctx.answerCallbackQuery();

      // console.log(ctx, ctx.from.id, ctx.update.callback_query.from.id);
      // return ctx.api.sendMessage(ctx.from.id, action);
    });
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

    next();
  }

  async delete(ctx: SamometerContext, next: NextFunction) {
    const [, listId] = ctx.match;

    // Удаляем сам список
    await listRepository.setDeleted(Number(listId));

    // Возвращаемся в обычный режим
    ctx.session.subMode = SubMode.basic;

    if (Number(listId) === ctx.session.listId) {
      // Удаление текущего списка - стираем в сессии текущий
      ctx.session.listId = null;
    }

    next();
  }

  async update(ctx: SamometerContext) {
    const listRender = await listsView.render(ctx);

    if (ctx.session.messageId) {
      // Обновляем сообщение со списком
      const [text, markup] = listRender;
      await Promise.all([
        ctx.api.editMessageText(ctx.chat.id, ctx.session.messageId, text, { parse_mode: 'MarkdownV2' }),
        ctx.api.editMessageReplyMarkup(ctx.chat.id, ctx.session.messageId, markup),
      ])
        .catch((err) => {
          /* Список не поменялся */
          console.log('update() error', err);
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
