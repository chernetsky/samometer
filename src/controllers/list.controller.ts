import { Bot, InlineKeyboard } from 'grammy';
import listView from '../views/list.view';
import dealRepository from '../repositories/deal.repository';
import { getCurrentListId } from '../utils';
import { SamometerContext } from '../session/context';
import commandsController from './commands.controller';

class ListController {
  init(bot: Bot) {
    bot.on('message', this.addDeal.bind(this));
    bot.callbackQuery(/^done-(\d+)$/, this.doneDeal.bind(this));
    bot.callbackQuery(/^undone-(\d+)$/, this.undoneDeal.bind(this));
  }

  async addDeal(ctx: SamometerContext) {
    const listId = await getCurrentListId(ctx);
    const { message: { text } } = ctx;

    if (!listId || !text) {
      return ctx.reply('Не выбран список или нет текста...');
    }

    // Добавляем дело в список
    await dealRepository.addDeal({ listId, name: text });

    // Удаляем текущее сообщение
    await ctx.deleteMessage();

    if (ctx.session.messageId) {
      // Обновляем сообщение со списком
      const [, markup] = await listView.render(listId);
      return ctx.api.editMessageReplyMarkup(ctx.chat.id, ctx.session.messageId, markup);
    }

    // Заново отрисовываем список
    return commandsController.list(ctx);
  }

  async doneDeal(ctx: SamometerContext) {
    ctx.answerCallbackQuery();

    const [, dealId] = ctx.match;

    // const listRender = await listView.render(list);

    const keyboard = new InlineKeyboard();
    Array(Math.round(Math.random() * 10)).fill(0).forEach((_, i) => keyboard.text(`done-${i}`, `done-${i}`).row());

    // try {
    //   console.log('!!!');
    //   const resp = await ctx.editMessageReplyMarkup({
    //     reply_markup: keyboard,
    //   });
    //   console.log(resp);
    //   return;
    // } catch (err) {
    //   console.log('catch: ', err);
    // }

    return ctx.reply(`done: ${dealId}`);
  }

  async undoneDeal(ctx: SamometerContext) {
    ctx.answerCallbackQuery();

    const [, dealId] = ctx.match;

    return ctx.reply(`undone: ${dealId}`);
  }
}

export default new ListController();
