import { Bot, Context } from 'grammy';
import listView from '../views/list.view';
import dealRepository from '../repositories/deal.repository';
import { getCurrentList } from '../utils';

class ListController {
  init(bot: Bot) {
    bot.on('message', this.addDeal.bind(this));
    bot.callbackQuery(/^done-(\d+)$/, this.doneDeal.bind(this));
    bot.callbackQuery(/^undone-(\d+)$/, this.undoneDeal.bind(this));
  }

  async addDeal(ctx: Context) {
    const list = await getCurrentList(ctx.from.id);

    const { message: { text } } = ctx;
    if (text) {
      await dealRepository.addDeal({ name: text, listId: list.id });
      return ctx.reply(`Новое дело '${text}'`);
    }

    return ctx.reply('Не понял...');
  }

  async doneDeal(ctx: Context) {
    ctx.answerCallbackQuery();

    const [, dealId] = ctx.match;

    // const listRender = await listView.render(list);

    return ctx.reply(`done: ${dealId}`);
  }

  async undoneDeal(ctx: Context) {
    ctx.answerCallbackQuery();

    const [, dealId] = ctx.match;

    return ctx.reply(`undone: ${dealId}`);
  }
}

export default new ListController();
