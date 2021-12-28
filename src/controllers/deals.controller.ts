import { Bot, InlineKeyboard, NextFunction } from 'grammy';
import dealsView from '../views/deals.view';
import dealRepository from '../repositories/deal.repository';
import listRepository from '../repositories/list.repository';
import { SamometerContext } from './session.controller';

class DealsController {
  private mode: string;

  constructor() {
    this.mode = 'deals';
  }

  init(bot: Bot) {
    // Вывод списка
    bot.callbackQuery(/^mode-deals(-(\d+))?/, this._updateList.bind(this));
    bot.command('list', this._updateList.bind(this));

    // Создать дело
    bot.on('message', this.add.bind(this));

    // Сделано/не сделано
    bot.callbackQuery(/^((un)?done)-(\d+)$/, this.done.bind(this));

    // Очистка списка
    bot.callbackQuery('clear-list', this.clear.bind(this));

  }

  async add(ctx: SamometerContext, next: NextFunction) {
    if (ctx.session.mode !== this.mode) {
      return next();
    }

    const { message: { text } } = ctx;
    if (!text) {
      return ctx.reply('Это не дело...');
    }

    // Добавляем дело в список
    await dealRepository.addDeal({
      listId: ctx.session.listId,
      name: text,
    });

    // Удаляем текущее сообщение
    await ctx.deleteMessage();

    // Обновляем список
    return this._updateList(ctx, true);
  }

  async done(ctx: SamometerContext) {
    const [, action, , dealId] = ctx.match;

    // Меняем статус done на true
    await dealRepository.changeDone(Number(dealId), action === 'done');

    // Обновляем список
    return this._updateList(ctx, true);
  }

  async clear(ctx: SamometerContext) {
    // Меняем статус deleted
    await dealRepository.setDeleted(ctx.session.listId);

    // Обновляем список
    return this._updateList(ctx, true);
  }

  async _updateList(ctx: SamometerContext, notifyOthers = false) {
    // Послать комманду на обновление списка всем остальным владельцам
    // todo: вынести отсюда в метод
    // if (typeof notifyOthers === 'boolean' && notifyOthers) {
    //   // Получить список владельцев списка
    //   const userIds = await listRepository.getListOwners(ctx.session.listId);

    //   // Отправить сообщение остальным владельцам
    //   userIds
    //     // .filter(id => id !== ctx.from.id)
    //     .forEach(async (id) => {
    //       // todo: Обновить списки всех участников
    //     });
    // }

    const listRender = await dealsView.render(ctx.session.listId);

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

export default new DealsController();
