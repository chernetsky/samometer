import { Bot, InlineKeyboard, NextFunction } from 'grammy';
import listRepository from '../repositories/list.repository';
import inviteRepository from '../repositories/invite.repository';
import { SamometerContext } from './session.controller';
import { InlineQueryResultArticle } from '@grammyjs/types';
import { escapeMarkdown } from '../utils';

class InviteController {
  init(bot: Bot) {
    // inline команда на добавление списка
    bot.inlineQuery(/^invite-(\d+)$/, this.invite.bind(this));

    // Ответы на приглашение
    bot.callbackQuery(/^invite-accept-([\w-]*\.[\w-]*\.[\w-]*)$/, this.inviteAccept.bind(this));
    bot.callbackQuery(/^invite-decline$/, this.inviteDecline.bind(this));
  }

  async invite(ctx: SamometerContext) {
    console.log('invite query', ctx.match, ctx.update?.inline_query);

    const [, listId] = ctx.match;

    const invite = await inviteRepository.create(Number(listId));

    const list = await listRepository.getListById(Number(listId));

    const answer = this._generateInviteAnswer(invite.guid, list.name);

    console.log('inviteAnswer', answer);

    return ctx.answerInlineQuery([answer]);
  }

  inviteAccept(ctx: SamometerContext) {
    // todo: Удалить запись в инвайтах

    const [, token] = ctx.match;
    console.log('answer', ctx, token);
    console.log('token', token);

    // todo: верифицировать токен
    // try {
    //   console.log('verified', verified);
    // } catch (err) {
    //   console.log('Token is invalid');

    //   // Выдать сообщение о том, что токен истёк
    // }

    // todo: выдать юзеру список

    return ctx.reply('Ok');
  }

  inviteDecline(ctx: SamometerContext) {
    // todo: Удалить запись в инвайтах
    return ctx.reply('Sorry no');
  }

  _generateInviteAnswer(guid: string, listName: string): InlineQueryResultArticle {
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
}

export default new InviteController();
