import { Bot, NextFunction } from 'grammy';
import listRepository from '../repositories/list.repository';
import userRepository from '../repositories/user.repository';
import { HELP_TEXT, LIST_SPECIAL } from '../constants';
import { SamometerContext } from './session.controller';

class CommandsController {
  init(bot: Bot) {
    bot.use(this.filter.bind(this));

    bot.command('start', this.start.bind(this));
    bot.command('help', this.help.bind(this));
  }

  filter(ctx: SamometerContext, next: NextFunction) {
    if (ctx.from.is_bot) {
      return ctx.reply('No bots allowed!');
    }
    return next();
  }

  /**
   * Создание дефолтных списков при старте
   */
  async start(ctx: SamometerContext) {
    const { id, username } = ctx.from;

    await userRepository.upsert({ id, username });

    const result = await listRepository.createSpecial(ctx.from.id, LIST_SPECIAL.TODAY);

    return ctx.reply(result ? 'Создан список Сегодня' : 'Что сегодня делаем?');
  }

  /**
   * Help
   */
  async help(ctx: SamometerContext) {
    return ctx.reply(HELP_TEXT, { parse_mode: 'MarkdownV2' });
  }
}

export default new CommandsController();
