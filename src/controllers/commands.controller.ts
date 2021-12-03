import { Bot } from 'grammy';
import listRepository from '../repositories/list.repository';
import { LIST_SPECIAL } from '../constants';
import listView from '../views/list.view';
import { getCurrentListId } from '../utils';
import { SamometerContext } from 'session/context';

class CommandsController {
  init(bot: Bot) {
    bot.command('start', this.start.bind(this));
    bot.command('list', this.list.bind(this));
    bot.command('deb', this.deb.bind(this));
  }

  async start(ctx: SamometerContext) {
    const result = await listRepository.createSpecialList(ctx.from.id, LIST_SPECIAL.TODAY);

    return ctx.reply(result ? 'Создан список Сегодня' : 'Что делаем сегодня?');
  }

  async list(ctx: SamometerContext) {
    const listId = await getCurrentListId(ctx);

    ctx.session.listId = listId;

    const listRender = await listView.render(listId);

    const response = await ctx.reply.apply(ctx, listRender);

    const { message_id } = response;
    if (message_id) {
      ctx.session.messageId = message_id;
    }
  }

  async deb(ctx: SamometerContext) {
    return ctx.reply(`listId: ${ctx.session.listId}, messageId: ${ctx.session.messageId}`);
  }
}

export default new CommandsController();
