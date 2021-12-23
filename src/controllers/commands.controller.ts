import { Bot, NextFunction } from 'grammy';
import listRepository from '../repositories/list.repository';
import userRepository from '../repositories/user.repository';
import { LIST_SPECIAL } from '../constants';
import { SamometerContext } from './session.controller';
import { getHashtagCommands } from '../utils';

class CommandsController {
  init(bot: Bot) {
    bot.use(this.filter.bind(this));

    bot.command('start', this.start.bind(this));
    // bot.command('share').on(':entities:mention', this.share.bind(this));

    bot.on('msg:entities:hashtag', (ctx) => {

      const hCommands = getHashtagCommands(ctx.msg.text, ctx.msg.entities);

      if (!hCommands.text) {
        return ctx.reply('to, text');
      }

      if (hCommands.to === 'lena') {
        return bot.api.sendMessage(111787421, hCommands.text);
      }

      return bot.api.sendMessage(160746560, hCommands.text);
    });
  }

  filter(ctx: SamometerContext, next: NextFunction) {
    // console.log(ctx.msg);
    console.log(ctx.chat);
    console.log(ctx.from);

    if (ctx.from.is_bot) {
      return ctx.reply('No bots allowed!');
    }

    next();
  }

  /**
   * Создание дефолтных списков при старте
   */
  async start(ctx: SamometerContext) {
    const { id, username } = ctx.from;
    const userResult = await userRepository.upsert({ id, username });

    const result = await listRepository.createSpecialList(ctx.from.id, LIST_SPECIAL.TODAY);

    return ctx.reply(result ? 'Создан список Сегодня' : 'Что сегодня делаем?');
  }

  // async share(ctx: SamometerContext) {
  //   // const result = await listRepository.createSpecialList(ctx.from.id, LIST_SPECIAL.TODAY);

  //   console.log(ctx.msg.entities);
  //   return ctx.reply('share');
  // }
}

export default new CommandsController();
