import { Bot, InlineKeyboard, NextFunction } from 'grammy';
import listView from '../views/list.view';
import dealRepository from '../repositories/deal.repository';
import commandsController from './commands.controller';
import { SamometerContext } from './session.controller';

class ListController {
  init(bot: Bot) {
    bot.on('message', this.addDeal.bind(this));
    bot.callbackQuery(/^done-(\d+)$/, this.isOld.bind(this), this.doneDeal.bind(this));
    bot.callbackQuery(/^undone-(\d+)$/, this.isOld.bind(this), this.undoneDeal.bind(this));
    bot.callbackQuery('clear-list', this.isOld.bind(this), this.clear.bind(this));
  }

  async addDeal(ctx: SamometerContext) {
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
    return this.updateList(ctx);
  }

  /**
   * Если действия производятся со старым сообщением в чате,
   * то это сообщение удаляется, и действия передаются актуальному сообщению.
   */
  isOld(ctx: SamometerContext, next: NextFunction) {
    if (ctx.msg.message_id !== ctx.session.messageId) {
      // console.log('old message', ctx.msg.message_id, ctx.session.messageId);
      ctx.api.deleteMessage(ctx.chat.id, ctx.msg.message_id).catch(() => { /* Не удаляется */ });
    }
    next();
  }

  async doneDeal(ctx: SamometerContext) {
    ctx.answerCallbackQuery();

    const [, dealId] = ctx.match;

    // Меняем статус
    await dealRepository.changeDone(Number(dealId), true);

    // Обновляем список
    return this.updateList(ctx);
  }

  async undoneDeal(ctx: SamometerContext) {
    ctx.answerCallbackQuery();

    const [, dealId] = ctx.match;

    // Меняем статус
    await dealRepository.changeDone(Number(dealId), false);

    // Обновляем список
    return this.updateList(ctx);
  }

  async clear(ctx: SamometerContext) {
    ctx.answerCallbackQuery();

    // Меняем статус
    await dealRepository.setDeleted(ctx.session.listId);

    // Обновляем список
    return this.updateList(ctx);
  }

  async updateList(ctx: SamometerContext) {
    if (ctx.session.messageId) {
      // Обновляем сообщение со списком
      const [, markup] = await listView.render(ctx.session.listId);
      return ctx.api.editMessageReplyMarkup(ctx.chat.id, ctx.session.messageId, markup)
        .catch(() => { /* Список не поменялся */ });
    }

    // Заново отрисовываем список
    return commandsController.list(ctx);
  }
}

export default new ListController();
