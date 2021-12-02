import { Context } from 'grammy';
import listRepository from '../repositories/listRepository';
import dealRepository from '../repositories/dealRepository';
import logger from '../utils/logger';

const log = logger.log;

class TextController {
  async message(ctx: Context) {
    // todo: Брать список из сессии
    const list = await listRepository.getCurrentList(ctx.from.id);

    const { message: { text } } = ctx;
    if (text) {
      await dealRepository.addDeal({ name: text, listId: list.id });
      return ctx.reply(`Новое дело '${text}'`);
    }

    return ctx.reply('Не понял...');
  }
}

export default new TextController();
