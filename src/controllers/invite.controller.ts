import { Bot, InlineKeyboard } from 'grammy';
import listRepository from '../repositories/list.repository';
import inviteRepository from '../repositories/invite.repository';
import { SamometerContext } from './session.controller';
import { InlineQueryResultArticle } from '@grammyjs/types';
import { escapeMarkdown } from '../utils';
import { UUID_REGEX } from '../constants';

class InviteController {
  init(bot: Bot) {
    // inline команда на добавление списка
    bot.inlineQuery(new RegExp(`^invite-(${UUID_REGEX})$`, 'i'), this.invite.bind(this));

    // Ответы на приглашение
    bot.callbackQuery(new RegExp(`^invite-accept-(${UUID_REGEX})$`, 'i'), this.inviteAccept.bind(this));
    bot.callbackQuery(new RegExp(`^invite-decline-(${UUID_REGEX})$`, 'i'), this.inviteDecline.bind(this));
  }

  async invite(ctx: SamometerContext) {
    const [, guid] = ctx.match;

    const list = await listRepository.getByGuid(guid);

    if (!list) {
      // Неправильный пригласительный guid
      return;
    }

    // Создаём приглашение
    const invite = await inviteRepository.create(list.id);

    const answer = this._generateInviteAnswer(invite.guid, list.name);
    return ctx.answerInlineQuery([answer]);
  }

  inviteAccept(ctx: SamometerContext) {
    const [, guid] = ctx.match;
    // Проверяем наличие приглашения и его актуальность

    // todo: Удаляем приглашение

    // todo: верифицировать токен
    // try {
    //   console.log('verified', verified);
    // } catch (err) {
    //   console.log('Token is invalid');

    //   // Выдать сообщение о том, что токен истёк
    // }

    // todo: выдать юзеру список

    // todo: Ответ об успешном приглашении
  }

  /**
   * Отклонение приглашения.
   */
  async inviteDecline(ctx: SamometerContext) {
    const [, guid] = ctx.match;

    return Promise.all([
      // Удалить приглашение
      inviteRepository.delete(guid),

      // Поменять текст приглашения
      ctx.api.editMessageText(null, null, 'Вы отклонили приглашение...', {
        inline_message_id: ctx.inlineMessageId,
      }),

      // Написать ответ в бот-чат
      ctx.api.sendMessage(ctx.from.id, 'Приглашение отклонили...'),
    ]);
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
        .text('Отклонить', `invite-decline-${guid}`)
        .row(),
    } as InlineQueryResultArticle;

    return inviteAnswer;
  }
}

export default new InviteController();
