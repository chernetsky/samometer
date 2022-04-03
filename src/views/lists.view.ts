import { InlineKeyboard } from 'grammy';
import { List } from '@prisma/client';
import { SamometerContext, SubMode } from '../controllers/session.controller';
import listRepository, { WithUsersCount } from '../repositories/list.repository';
import { BUTTON_SPACE_SEPARATOR } from '../constants';

class ListsView {
  async render(ctx: SamometerContext): Promise<[string, { reply_markup: InlineKeyboard, parse_mode: string }]> {
    const { listId: currentListId, subMode } = ctx.session;
    const keyboard = new InlineKeyboard();

    // Получаем списки юзера
    const lists = await listRepository.getListsByUserId(ctx.from.id);

    // Ренерим кнопки списков
    lists.forEach(this._renderListButton.bind(this, keyboard, subMode, currentListId));

    // Рендерим кнопки управления
    this.appendServiceButtons(keyboard, subMode);

    return [this._renderTitle(subMode), { reply_markup: keyboard, parse_mode: 'MarkdownV2' }];
  }

  appendServiceButtons(keyboard: InlineKeyboard, subMode: SubMode) {
    if (subMode === SubMode.basic) {
      keyboard
        .text(`🚮${BUTTON_SPACE_SEPARATOR}Удалить`, 'submode-delete')
        .text(`Поделиться${BUTTON_SPACE_SEPARATOR}🔁`, 'submode-invite');
    } else {
      keyboard.text(`⬅️${BUTTON_SPACE_SEPARATOR}Назад`, 'submode-basic');
    }

    return keyboard.row();
  }

  _renderTitle(subMode: SubMode): string {
    let title;
    switch (subMode) {
      case SubMode.delete:
        title = '*УДАЛИТЬ СПИСОК*';
        break;
      case SubMode.invite:
        title = '*ПОДЕЛИТЬСЯ СПИСКОМ*';
        break;
      default:
        title = '*ВЫБРАТЬ СПИСОК*';
    }
    return title;
  }

  _renderListButton(keyboard: InlineKeyboard, subMode: SubMode, currentListId: number, list: WithUsersCount<List>) {
    const { id, name, _count: { users } } = list;

    // Иконки списка
    const shared = users > 1 ? '🌐' : '';
    const current = currentListId === id ? '⭐️' : '';
    const icons = `${current}${shared} `;

    let renderedTitle;
    let callbackQueryStr;
    switch (subMode) {
      case SubMode.delete:
        renderedTitle = `${icons}${name}${BUTTON_SPACE_SEPARATOR}❌`;
        callbackQueryStr = `lists-delete-${id}`;
        keyboard.text(renderedTitle, callbackQueryStr);
        break;
      case SubMode.invite:
        renderedTitle = `${icons}${name}`;

        callbackQueryStr = `invite-${id}`;
        keyboard.switchInline(renderedTitle, callbackQueryStr);
        break;
      default:
        renderedTitle = `${icons}${name}`;
        callbackQueryStr = `mode-deals-${id}`;
        keyboard.text(renderedTitle, callbackQueryStr);
    }

    keyboard.row();
  }
}

export default new ListsView();
