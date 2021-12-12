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
    bot.callbackQuery(/^mode-deals(-\d+)?/, this.changeMode.bind(this));

    bot.on('message', this.add.bind(this));
    bot.callbackQuery(/^done-(\d+)$/, this.isOld.bind(this), this.doneDeal.bind(this));
    bot.callbackQuery(/^undone-(\d+)$/, this.isOld.bind(this), this.undoneDeal.bind(this));
    bot.callbackQuery('clear-list', this.isOld.bind(this), this.clear.bind(this));
  }

  async changeMode(ctx: SamometerContext) {
    // Рисуем список, потому что переключились на Список дел
    return this._updateList(ctx);
  }

  async add(ctx: SamometerContext, next: NextFunction) {
    if (!this._checkMode(ctx)) {
      return next();
    }

    const { message: { text } } = ctx;
    if (!text) {
      return ctx.reply('Нет текста...');
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

  _checkMode(ctx: SamometerContext) {
    return ctx.session.mode === this.mode;
  }

  /**
   * Если действия производятся со старым сообщением в чате,
   * то это сообщение удаляется, и действия передаются актуальному сообщению.
   */
  async isOld(ctx: SamometerContext, next: NextFunction) {
    if (ctx.msg.message_id !== ctx.session.messageId) {
      await ctx.api.deleteMessage(ctx.chat.id, ctx.msg.message_id)
        .catch((err) => {
          /* Не удаляется */
        });
    }

    next();
  }

  async doneDeal(ctx: SamometerContext) {
    ctx.answerCallbackQuery();

    const [, dealId] = ctx.match;

    // Меняем статус
    await dealRepository.changeDone(Number(dealId), true);

    // Обновляем список
    return this._updateList(ctx);
  }

  async undoneDeal(ctx: SamometerContext) {
    ctx.answerCallbackQuery();

    const [, dealId] = ctx.match;

    // Меняем статус
    await dealRepository.changeDone(Number(dealId), false);

    // Обновляем список
    return this._updateList(ctx);
  }

  async clear(ctx: SamometerContext) {
    ctx.answerCallbackQuery();

    // Меняем статус
    await dealRepository.setDeleted(ctx.session.listId);

    // Обновляем список
    return this._updateList(ctx);
  }

  async _updateList(ctx: SamometerContext) {
    if (ctx.session.messageId) {
      // Обновляем сообщение со списком
      const [, markup] = await dealsView.render(ctx.session.listId);
      await ctx.api.editMessageReplyMarkup(ctx.chat.id, ctx.session.messageId, markup)
        .catch((err) => {
          /* Список не поменялся */
        });

      return;
    }

    // Заново отрисовываем список
    return commandsController.list(ctx);
  }
}

export default new DealsController();
