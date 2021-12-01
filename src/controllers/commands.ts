import { Context } from 'grammy';
import listRepository from '../repositories/listRepository';
import logger from '../utils/logger';
import { LIST_SPECIAL } from '../constants';

const log = logger.log;

class CommandController {
  async start(ctx: Context) {
    const result = await listRepository.createSpecialList(ctx.from.id, LIST_SPECIAL.TODAY);
    return ctx.reply(result ? 'Создан список Сегодня' : 'Что делаем сегодня?');
  }
}

export default new CommandController();
