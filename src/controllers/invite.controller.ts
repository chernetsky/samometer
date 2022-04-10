import { Bot, InlineKeyboard } from 'grammy';
import listRepository from '../repositories/list.repository';
import inviteRepository from '../repositories/invite.repository';
import userRepository from '../repositories/user.repository';
import { SamometerContext } from './session.controller';
import { InlineQueryResultArticle } from '@grammyjs/types';
import { escapeMarkdown } from '../utils';
import { INVITE_TTL, UUID_REGEX } from '../constants';

class InviteController {
  init(bot: Bot) {
    // inline команда на добавление списка
    bot.inlineQuery(new RegExp(`^invite-(${UUID_REGEX})$`, 'i'), this.invite.bind(this));

    // Ответы на приглашение
    bot.callbackQuery(new RegExp(`^invite-accept-(${UUID_REGEX})$`, 'i'), this.inviteAccept.bind(this));
    bot.callbackQuery(new RegExp(`^invite-decline-(${UUID_REGEX})$`, 'i'), this.inviteDecline.bind(this));
  }

  /**
   * Инлайн-команда на создание приглашения.
   */
  async invite(ctx: SamometerContext) {
    const [, guid] = ctx.match;

    const list = await listRepository.getByGuid(guid);

    if (!list) {
      // Неправильный пригласительный guid
      return;
    }

    // Создаём приглашение
    const invite = await inviteRepository.create(list.id);

    // Текст приглашения, который увидит приглашаемый.
    // С кнопками ответов на приглашение.
    const answer = this._generateInviteAnswer(invite.guid, list.name);

    return ctx.answerInlineQuery([answer]);
  }

  /**
   * Обработкик нажания на кнопку "Принять приглашение".
   * - проверяет инвайт
   * - проверяет наличие пользователя и создаёт, если его нет
   * - добавляет пользователя во владельцы списка
   * - меняет текст пригласительного сообщения
   * - удаляет инвайт
   */
  async inviteAccept(ctx: SamometerContext) {
    const [, guid] = ctx.match;

    // Проверяем наличие приглашения и его актуальность
    const invite = await this._getActualInvite(guid);

    if (!invite) {
      // Нет приглашения или срок истёк
      return ctx.api.editMessageText(null, null, 'Приглашение устарело. Попросите автора списка выдать вам новое.', {
        inline_message_id: ctx.inlineMessageId,
      });
    }

    // Создать пользователя, если такого нет
    const { id, username } = ctx.from;
    await userRepository.upsert({ id, username });

    // Привязать пользователя к списку
    await listRepository.addOwner(invite.listId, id);

    // Удалить инвайт
    await inviteRepository.delete(guid);

    // Написать ответ в бот-чат
    // todo: обновить список списков
    // ctx.api.sendMessage(ctx.from.id, 'Приглашение приняли...'),

    return ctx.api.editMessageText(
      null,
      null,
      'Теперь вы являетесь совладельцем нового списка\\!\nЗапустите бот @SamometerBot и откройте перечень доступных списков\\, чтобы начать им пользоваться\\.',
      {
        inline_message_id: ctx.inlineMessageId,
        parse_mode: 'MarkdownV2',
      });
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
      ctx.api.editMessageText(null, null, 'Вы *отклонили* приглашение\\.\\.\\.', {
        inline_message_id: ctx.inlineMessageId,
        parse_mode: 'MarkdownV2',
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

  /**
   * Проверка приглашения на существование и на актуальность.
   */
  async _getActualInvite(guid: string) {
    const invite = await inviteRepository.getByGuid(guid);

    if (!invite) {
      return null;
    }

    // Проверяем ttl приглашения
    if ((Date.now() - (new Date(invite.createdAt)).getTime()) > INVITE_TTL) {
      await inviteRepository.delete(guid);
      return null;
    }

    return invite;
  }
}

export default new InviteController();
