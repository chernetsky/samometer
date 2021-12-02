import { Context } from 'grammy';
import listRepository from '../repositories/listRepository';
import { LIST_SPECIAL } from '../constants';
import listView from '../views/list.view';
import { getCurrentList } from '../utils';

class CommandController {
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

export default new CommandController();
