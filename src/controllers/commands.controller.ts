import { Bot, InlineKeyboard, NextFunction } from 'grammy';
import { InlineQueryResultArticle } from '@grammyjs/types';
import listRepository from '../repositories/list.repository';
import userRepository from '../repositories/user.repository';
import { HELP_TEXT, LIST_SPECIAL } from '../constants';
import { SamometerContext } from './session.controller';

const shareListAnswer = {
  type: 'article',
  id: 'share-1',
  title: 'Поделиться списком Таким-то',
  input_message_content: {
    message_text: 'С вами хотят поделиться списком *Таким\\-то* через бот @SamometerBot\nПримите приглашение и установите @SamometerBot\\, чтобы начать им пользоваться\\. Либо просто отклоните приглашение\\.',
    parse_mode: 'MarkdownV2',
  },
  reply_markup: (new InlineKeyboard()).text('Принять', 'share-accept-10').text('Отклонить', 'share-decline-10').row(),
} as InlineQueryResultArticle;

class CommandsController {
  init(bot: Bot) {
    bot.use(this.filter.bind(this));

    bot.command('start', this.start.bind(this));
    bot.command('help', this.help.bind(this));

    // todo: Эксперименты

    bot.inlineQuery(/^share-(\d+)$/, ctx => {
      // console.log('Processing inline query', ctx.match, ctx.update?.inline_query);
      return ctx.answerInlineQuery([shareListAnswer]);
    });

    bot.callbackQuery(/^share-(accept|decline)-(\d+)$/, (ctx) => {
      const [, action, id] = ctx.match;
      // console.log();

      // console.log(ctx, ctx.from.id, ctx.update.callback_query.from.id);
      return ctx.api.sendMessage(ctx.from.id, action);

      console.log(action === 'accept' ? 'Вы приняли приглашение' : 'Сорян');
      return ctx.answerCallbackQuery();
    });

    // bot.on('inline_query', ctx => {
    //   console.log('Processing inline query', ctx.match, ctx.update.inline_query);
    //   return ctx.answerInlineQuery([answer1]);
    // });
  }

  filter(ctx: SamometerContext, next: NextFunction) {
    // console.log('FILTER', ctx);

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

    const result = await listRepository.createSpecialList(ctx.from.id, LIST_SPECIAL.TODAY);

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
