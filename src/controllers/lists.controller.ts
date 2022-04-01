import { Bot, InlineKeyboard, NextFunction } from 'grammy';
import listsView from '../views/lists.view';
import listRepository from '../repositories/list.repository';
import { SamometerContext, Mode, SubMode } from './session.controller';
import { InlineQueryResultArticle } from '@grammyjs/types';
import * as jwt from 'jsonwebtoken';
import { escapeMarkdown } from '../utils';

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

    bot.inlineQuery(/^invite-([\w-]*\.[\w-]*\.[\w-]*)$/, this.invite.bind(this));

    bot.callbackQuery(/^invite-accept-([\w-]*\.[\w-]*\.[\w-]*)$/, this.inviteAccept.bind(this));
    bot.callbackQuery(/^invite-decline$/, this.inviteDecline.bind(this));
  }

  async invite(ctx: SamometerContext) {
    // return ctx.reply('Скоро можно будет делиться списками...');

    console.log('Processing inline query lists-invite-*', ctx.match, ctx.update?.inline_query);

    const [, listId] = ctx.match;

    const list = await listRepository.getListById(Number(listId));

    // todo: сохранить в редис uuid + listId c ttl 10 минут
    const inviteAnswer = await this._generateShareAnswer(guid, list.name);

    console.log('inviteAnswer', inviteAnswer);

    return ctx.answerInlineQuery([inviteAnswer]);
  }

  inviteAccept(ctx: SamometerContext) {
    const [, token] = ctx.match;
    console.log('answer', ctx, token);
    console.log('token', token);

    // todo: верифицировать токен
    try {
      const verified = jwt.verify(token, process.env.BOT_TOKEN);
      console.log('verified', verified);
    } catch (err) {
      console.log('Token is invalid');

      // Выдать сообщение о том, что токен истёк
    }

    // todo: выдать юзеру список

    return ctx.reply('Ok');
  }

  inviteDecline(ctx: SamometerContext) {
    return ctx.reply('Sorry no');
  }

  async _generateShareAnswer(guid: string, listName: string): Promise<InlineQueryResultArticle> {
    const inviteAnswer = {
      type: 'article',
      id: 'invite-answer',
      title: `Поделиться списком ${listName}`,
      input_message_content: {
        message_text: `С вами хотят поделиться списком *${escapeMarkdown(listName)}* через бот @SamometerBot\nПримите приглашение и установите @SamometerBot\\, чтобы начать им пользоваться\\. Либо просто отклоните приглашение\\.`,
        parse_mode: 'MarkdownV2',
      },
      reply_markup: (new InlineKeyboard())
        .text('Принять', `invite-accept-${guid}`)
        .text('Отклонить', 'invite-decline')
        .row(),
    } as InlineQueryResultArticle;

    return inviteAnswer;
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
