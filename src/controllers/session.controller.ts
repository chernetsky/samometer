import { Bot, Context, NextFunction, session, SessionFlavor } from 'grammy';
import db from '../providers/db';
import { PrismaAdapter } from '../utils/PrismaAdapter';
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
        storage: new PrismaAdapter(db.client),
      }),
    );

    bot.use(this.setListId.bind(this));

    bot.on('callback_query:data', this.buttonMiddleware.bind(this));

    bot.callbackQuery(/^mode-(deals|lists)(-(\d+))?$/, this.setMode.bind(this));

    bot.command('list', this.listCmd.bind(this));

    bot.command('deb', this.debCmd.bind(this));
  }

  /**
   * Если действия производятся со старым сообщением в чате,
   * то это сообщение удаляется, и действия передаются актуальному сообщению.
   */
  async buttonMiddleware(ctx: SamometerContext, next: NextFunction) {
    await ctx.answerCallbackQuery();

    if (ctx.session.messageId && ctx.msg.message_id !== ctx.session.messageId) {
      await ctx.api.deleteMessage(ctx.chat.id, ctx.msg.message_id)
        .catch((err) => {
          /* Не удаляется */
        });
    }

    return next();
  }

  /**
   * Заполнение session.listId
   */
  async setListId(ctx: SamometerContext, next: NextFunction) {
    if (!ctx.session.listId) {
      const listId = await listRepository.getCurrentListId(ctx.from.id);
      if (!listId) {
        return ctx.reply('У вас нет ни одного списка. Нажмите /start, чтобы начать.');
      }

      ctx.session.listId = listId;
    }

    return next();
  }

  /**
   * Переключение в режим deals и передача управления дальше
   */
  async listCmd(ctx: SamometerContext, next: NextFunction) {
    await this._changeMode(ctx, Mode.deals);

    return next();
  }

  /**
   * Переключение между режимами
   */
  async setMode(ctx: SamometerContext, next: NextFunction) {
    const [, ctxMode, , listId] = ctx.match;

    await this._changeMode(ctx, (Mode as any)[ctxMode], listId);

    return next();
  }

  async _changeMode(ctx: SamometerContext, mode: Mode, listId?: string) {
    ctx.session.mode = mode;

    if (!isNaN(Number(listId))) {
      ctx.session.listId = Number(listId);
    }
    /*
     * Удаляем старое сообщение:
     * - если это команда /list, то хотят новый список - либо нет сообщение, либо оно уехало наверх
     * - если это смена режима, то проще удалить и создать заново, чем редактировать текст и кнопки
     */
    if (ctx.session.messageId) {
      await ctx.api.deleteMessage(ctx.chat.id, ctx.session.messageId).catch(() => { /* Ошибка удаления */ });
      ctx.session.messageId = null;
    }
  }

  async debCmd(ctx: SamometerContext) {
    return ctx.reply(`listId: ${ctx.session.listId}, messageId: ${ctx.session.messageId}`);
  }
}

export default new SessionController();
