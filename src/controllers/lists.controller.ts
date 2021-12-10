import { Bot, InlineKeyboard, NextFunction } from 'grammy';
import dealsView from '../views/deals.view';
import dealRepository from '../repositories/deal.repository';
import commandsController from './commands.controller';
import { SamometerContext } from './session.controller';

class ListsController {
  init(bot: Bot) {
    bot.use(this.checkSwitchMode.bind(this));
  }

  checkSwitchMode(ctx: SamometerContext, next: NextFunction) {
    if (ctx.switchMode && ctx.session.mode === 'lists') {
      // Рисуем список, потому что переключились на Список дел
      return this.updateList(ctx);
    }

    next();
  }

}

export default new ListsController();
