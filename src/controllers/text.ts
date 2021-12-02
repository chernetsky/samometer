import { Context } from 'grammy';
import dealRepository from '../repositories/dealRepository';
import { getCurrentList } from '../utils';

class TextController {
  async message(ctx: Context) {
    const list = await getCurrentList(ctx.from.id);

    const { message: { text } } = ctx;
    if (text) {
      await dealRepository.addDeal({ name: text, listId: list.id });
      return ctx.reply(`Новое дело '${text}'`);
    }

    return ctx.reply('Не понял...');
  }
}

export default new TextController();
