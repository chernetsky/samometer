import { Bot, Context, session, SessionFlavor } from 'grammy';
import listRepository from '../repositories/list.repository';

interface SessionData {
  listId: number;
  messageId: number;
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
          };
        },
      }),
    );

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

  async deb(ctx: SamometerContext) {
    return ctx.reply(`listId: ${ctx.session.listId}, messageId: ${ctx.session.messageId}`);
  }
}

export default new SessionController();
