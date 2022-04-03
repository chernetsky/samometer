import { Bot, Context, NextFunction, session, SessionFlavor } from 'grammy';
import db from '../providers/db';
import { PrismaAdapter } from '../utils/PrismaAdapter';
import listRepository from '../repositories/list.repository';
import { deleteNotTrackingMessage } from '../utils';

export enum Mode {
  deals = 'deals',
  lists = 'lists',
}

export enum SubMode {
  basic = 'basic',
  delete = 'delete',
  invite = 'invite',
}

interface SessionData {
  listId: number;
  messageId: number;
  mode: Mode;
  subMode: SubMode;
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
            subMode: SubMode.basic,
          };
        },
        storage: new PrismaAdapter(db.client),
      }),
    );

    bot.use(this.setListId.bind(this));

    bot.on('callback_query:data', this.buttonMiddleware.bind(this));

    bot.callbackQuery(/^mode-(deals|lists)(-(\d+))?$/, this.setMode.bind(this));

    bot.callbackQuery(/^submode-(\w+)$/, this.setSubMode.bind(this));

    bot.command('list', this.listCmd.bind(this));

    bot.command('deb', this.debCmd.bind(this));
  }

  /**
   * Если действия производятся со старым сообщением в чате,
   * то это сообщение удаляется, и действия передаются актуальному сообщению.
   */
  async buttonMiddleware(ctx: SamometerContext, next: NextFunction) {
    console.log('FIRST BUTTON MIDDLEWARE');
    await ctx.answerCallbackQuery();

    if (!ctx.update.inline_query) {
      await deleteNotTrackingMessage(ctx).catch((err) => {
        // Может упасть при inline_query, т.к. там нет сессии
      });
    }

    return next();
  }

  /**
   * Заполнение session.listId
   */
  async setListId(ctx: SamometerContext, next: NextFunction) {
    try {
      if (!ctx.update.inline_query && !ctx.session.listId) {
        const listId = await listRepository.getCurrentListId(ctx.from.id);
        if (!listId) {
          return ctx.reply('У вас нет ни одного списка. Нажмите /start, чтобы начать.');
        }

        ctx.session.listId = listId;
      }
    } catch (err) {
      // При inline_query сессии нет. Может ещё при каких-то типах запросов.
      console.log('Error session processing', ctx);
    }

    return next();
  }

  /**
   * Команда /list
   * - переключение в режим отображения списка deals
   * - и передаёт управления дальше
   */
  async listCmd(ctx: SamometerContext, next: NextFunction) {
    await this._changeMode(ctx, Mode.deals);

    return next();
  }

  /**
   * Переключение между режимами по кнопке
   * - получает режим из контекста команды
   * - сохраняет режим в сессию
   * - передаёт управление дальше
   */
  async setMode(ctx: SamometerContext, next: NextFunction) {
    const [, ctxMode, , listId] = ctx.match;

    await this._changeMode(ctx, (ctxMode as Mode), listId);

    return next();
  }

  /**
   * Переключение между суб-режимами
   */
  async setSubMode(ctx: SamometerContext, next: NextFunction) {
    const [, ctxSubMode] = ctx.match;

    ctx.session.subMode = (ctxSubMode as SubMode);

    return next();
  }

  /**
   * Смена режима
   * - сохраняет в сессии режим
   * - заполняет в сессии listId
   * - удаляет старое сообщение по session.messageId
   */
  async _changeMode(ctx: SamometerContext, mode: Mode, listId?: string) {
    ctx.session.mode = mode;
    ctx.session.subMode = SubMode.basic;

    if (!isNaN(Number(listId))) {
      ctx.session.listId = Number(listId);
    }

    /*
     * Удаляем старое сообщение:
     * - если это команда /list, то хотят новый список - либо нет сообщения, либо оно уехало наверх
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
