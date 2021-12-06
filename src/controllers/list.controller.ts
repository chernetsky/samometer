import { Bot, InlineKeyboard } from 'grammy';
import listView from '../views/list.view';
import dealRepository from '../repositories/deal.repository';
import commandsController from './commands.controller';
import { SamometerContext } from './session.controller';

class ListController {
  init(bot: Bot) {
    bot.on('message', this.addDeal.bind(this));
    bot.callbackQuery(/^done-(\d+)$/, this.doneDeal.bind(this));
    bot.callbackQuery(/^undone-(\d+)$/, this.undoneDeal.bind(this));
    bot.callbackQuery('clear-list', this.clear.bind(this));
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
      return ctx.api.editMessageReplyMarkup(ctx.chat.id, ctx.session.messageId, markup);
    }

    // Заново отрисовываем список
    return commandsController.list(ctx);
  }
}

export default new ListController();
