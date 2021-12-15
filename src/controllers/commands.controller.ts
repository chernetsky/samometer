import { Bot } from 'grammy';
import listRepository from '../repositories/list.repository';
import { LIST_SPECIAL } from '../constants';
import dealsView from '../views/deals.view';
import { SamometerContext } from './session.controller';

class CommandsController {
  init(bot: Bot) {
    bot.command('start', this.start.bind(this));
  }

  /**
   * Создание дефолтных списков при старте
   */
  async start(ctx: SamometerContext) {
    const result = await listRepository.createSpecialList(ctx.from.id, LIST_SPECIAL.TODAY);

    return ctx.reply(result ? 'Создан список Сегодня' : 'Что сегодня делаем?');
  }
}

export default new CommandsController();
