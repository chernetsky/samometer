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

interface SamometerFlavor {
  switchMode: boolean;
}

export type SamometerContext = Context & SessionFlavor<SessionData> & SamometerFlavor;

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

    bot.use(this.getListId.bind(this));
    bot.callbackQuery(/^mode-(deals|lists)$/, this.changeMode.bind(this));

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

  async changeMode(ctx: SamometerContext, next: NextFunction) {
    console.log(ctx.match);
    const [, ctxMode] = ctx.match;

    const mode: Mode = (Mode as any)[ctxMode];

    ctx.session.mode = mode;

    ctx.switchMode = true;

    next();
  }

  async deb(ctx: SamometerContext) {
    return ctx.reply(`listId: ${ctx.session.listId}, messageId: ${ctx.session.messageId}`);
  }
}

export default new SessionController();
