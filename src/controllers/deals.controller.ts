import { Bot, NextFunction } from 'grammy';
import { map } from 'ramda';
import dealsView from '../views/deals.view';
import dealRepository from '../repositories/deal.repository';
import listRepository from '../repositories/list.repository';
import sessionRepository from '../repositories/session.repository';
import { SamometerContext } from './session.controller';

class DealsController {
  private mode: string;

  constructor() {
    this.mode = 'deals';
  }

  init(bot: Bot) {
    // Вывод списка
    bot.callbackQuery(/^mode-deals(-(\d+))?/, this.deals.bind(this));
    bot.command('deals', this.deals.bind(this));
    bot.command('start', this.deals.bind(this));

    // Создать дело
    bot.on('message', this.add.bind(this));

    // Сделано/не сделано
    bot.callbackQuery(/^((un)?done)-(\d+)$/, this.done.bind(this));

    // Очистка списка
    bot.callbackQuery('clear-list', this.clear.bind(this));
  }

  /**
   * Вывод текущего списка дел
   */
  async deals(ctx: SamometerContext) {
    // Обновляем список только для текущего юзера
    return this._updateList(ctx, true);
  }

  async add(ctx: SamometerContext, next: NextFunction) {
    if (ctx.session.mode !== this.mode) {
      return next();
    }

    const { message: { text } } = ctx;
    if (!text) {
      return ctx.reply('Это не дело...');
    }

    // Удаляем текущее сообщение
    await ctx.deleteMessage();

    // Разбиваем на строки: одна строка - одно дело
    const lines = text.split('\n').map((s) => s.trim());

    // Добавляем дела в список
    await Promise.all(lines.map((s) => dealRepository.addDeal({
      listId: ctx.session.listId,
      name: s,
    })));

    // Обновляем список
    return this._updateList(ctx);
  }

  async done(ctx: SamometerContext) {
    const [, action, , dealId] = ctx.match;

    // Меняем статус done на true
    await dealRepository.changeDone(Number(dealId), action === 'done');

    // Обновляем список
    return this._updateList(ctx);
  }

  async clear(ctx: SamometerContext) {
    // Меняем статус deleted
    await dealRepository.setDeleted(ctx.session.listId);

    // Обновляем список
    return this._updateList(ctx);
  }

  async _updateList(ctx: SamometerContext, onlyForMe = false) {
    const currentListId = ctx.session.listId;

    // Получаем рендер списка
    const listRender = await dealsView.render(currentListId);

    // Отправить сообщение всем владельцам списка
    const userIds = onlyForMe
      ? [ctx.from.id]
      : await listRepository.getOwners(currentListId);

    const dbSessions = onlyForMe
      ? [{ key: String(ctx.from.id), value: JSON.stringify(ctx.session) }]
      : await sessionRepository.getByKeys(map(String, userIds));

    for (const s of dbSessions) {
      const { key: chatId, value } = s;
      const sessValues = JSON.parse(value);
      const { listId, messageId, mode } = sessValues;

      if (mode !== this.mode || listId !== currentListId) {
        // В этой сессии не тот режим или не тот текущий список
        // console.log(`Skip list render for session ${chatId}`);
        continue;
      }

      const [text, markup] = listRender;

      if (messageId) {
        // Обновляем сообщение со списком
        await ctx.api.editMessageReplyMarkup(chatId, messageId, markup)
          .catch((err) => {
            /* Список не поменялся */
            console.log('_updateList catch message update', err);
          });
      } else {
        // Заново создаём сообщение со списком
        const response = await ctx.api.sendMessage(chatId, text, markup);

        const { message_id } = response;
        if (message_id && String(ctx.from.id) === chatId) {
          // Текущему юзеру записываем новое messageId в сессию
          ctx.session.messageId = message_id;
        }
      }
    }
  }
}

export default new DealsController();
