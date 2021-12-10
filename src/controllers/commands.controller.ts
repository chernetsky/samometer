import { Bot } from 'grammy';
import listRepository from '../repositories/list.repository';
import { LIST_SPECIAL } from '../constants';
import dealsView from '../views/deals.view';
import { SamometerContext } from './session.controller';

class CommandsController {
  init(bot: Bot) {
    bot.command('start', this.start.bind(this));
    bot.command('list', this.list.bind(this));
  }

  /**
   * Создание дефолтных списков при старте
   */
  async start(ctx: SamometerContext) {
    const result = await listRepository.createSpecialList(ctx.from.id, LIST_SPECIAL.TODAY);

    return ctx.reply(result ? 'Создан список Сегодня' : 'Что сегодня делаем?');
  }

  async list(ctx: SamometerContext) {
    const listRender = await dealsView.render(ctx.session.listId);

    const response = await ctx.reply.apply(ctx, listRender);

    const { message_id } = response;

    if (message_id) {
      ctx.session.messageId = message_id;
    }
  }
}

export default new CommandsController();
