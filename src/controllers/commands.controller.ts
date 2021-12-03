import { Bot, Context } from 'grammy';
import listRepository from '../repositories/list.repository';
import { LIST_SPECIAL } from '../constants';
import listView from '../views/list.view';
import { getCurrentList } from '../utils';

class CommandsController {
  init(bot: Bot) {
    bot.command('start', this.start.bind(this));

    bot.command('list', this.list.bind(this));
  }

  async start(ctx: Context) {
    const result = await listRepository.createSpecialList(ctx.from.id, LIST_SPECIAL.TODAY);

    return ctx.reply(result ? 'Создан список Сегодня' : 'Что делаем сегодня?');
  }

  async list(ctx: Context) {
    const list = await getCurrentList(ctx.from.id);
    const listRender = await listView.render(list);

    return ctx.reply.apply(ctx, listRender);
  }
}

export default new CommandsController();
