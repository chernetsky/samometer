import { Bot, Context, NextFunction, session, SessionFlavor } from 'grammy';
import listRepository from '../repositories/list.repository';

enum Mode {
  deals = 'deals',
  lists = 'lists',
}
interface SessionData {
  listId: number;
  messageId: number;
  mode: Mode;
}

export type SamometerContext = Context & SessionFlavor<SessionData>;

class SessionController {
  init(bot: Bot) {
    bot.use(
      session({
        initial(): SessionData {
          return {
            listId: null,
            messageId: null,
            mode: Mode.deals,
          };
        },
      }),
    );

    bot.callbackQuery(/^mode-(deals|lists)(-(\d)+)?$/, this.changeMode.bind(this));

    bot.use(this.getListId.bind(this));

    bot.command('deb', this.deb.bind(this));
  }

  async getListId(ctx: SamometerContext, next) {
    if (!ctx.session.listId) {
      const listId = await listRepository.getCurrentListId(ctx.from.id);
      if (!listId) {
        return ctx.reply('У вас нет ни одного списка. Нажмите /start, чтобы начать.');
      }

      ctx.session.listId = listId;
    }

    next();
  }

  /**
   * Переключение между режимами
   */
  async changeMode(ctx: SamometerContext, next: NextFunction) {
    ctx.answerCallbackQuery();

    const [, ctxMode, _, listId] = ctx.match;

    if (!isNaN(Number(listId))) {
      ctx.session.listId = Number(listId);
    }

    const mode: Mode = (Mode as any)[ctxMode];

    ctx.session.mode = mode;

    if (ctx.msg.message_id !== ctx.session.messageId) {
      await ctx.api.deleteMessage(ctx.chat.id, ctx.msg.message_id).catch(() => { /* Ошибка удаления */ });
    }

    if (ctx.session.messageId) {
      await ctx.api.deleteMessage(ctx.chat.id, ctx.session.messageId).catch(() => { /* Ошибка удаления */ });
      ctx.session.messageId = null;
    }

    next();
  }

  async deb(ctx: SamometerContext) {
    return ctx.reply(`listId: ${ctx.session.listId}, messageId: ${ctx.session.messageId}`);
  }
}

export default new SessionController();
