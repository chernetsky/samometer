import { Bot, InlineKeyboard, NextFunction } from 'grammy';
import dealsView from '../views/deals.view';
import dealRepository from '../repositories/deal.repository';
import commandsController from './commands.controller';
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

    // Манипуляции с делами
    bot.on('message', this.add.bind(this));
    bot.callbackQuery(/^done-(\d+)$/, this.check.bind(this));
    bot.callbackQuery(/^undone-(\d+)$/, this.uncheck.bind(this));

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
    return this._updateList(ctx);
  }

  async check(ctx: SamometerContext) {
    const [, dealId] = ctx.match;

    // Меняем статус done на true
    await dealRepository.changeDone(Number(dealId), true);

    // Обновляем список
    return this._updateList(ctx);
  }

  async uncheck(ctx: SamometerContext) {
    const [, dealId] = ctx.match;

    // Меняем статус done на false
    await dealRepository.changeDone(Number(dealId), false);

    // Обновляем список
    return this._updateList(ctx);
  }

  async clear(ctx: SamometerContext) {
    // Меняем статус deleted
    await dealRepository.setDeleted(ctx.session.listId);

    // Обновляем список
    return this._updateList(ctx);
  }

  async _updateList(ctx: SamometerContext) {
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
