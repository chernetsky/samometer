import { SubMode } from '../controllers/session.controller';
import { InlineKeyboard } from 'grammy';
import listRepository, { WithUsersCount } from '../repositories/list.repository';
import { BUTTON_SPACE_SEPARATOR } from '../constants';
import { List } from '@prisma/client';

class ListsView {
  async render(userId: number, subMode: SubMode | null):
    Promise<[string, { reply_markup: InlineKeyboard, parse_mode: string }]> {
    const lists = await listRepository.getListsByUserId(userId);

    const listKeyboard = new InlineKeyboard();

    lists.forEach(list =>
      listKeyboard.text.apply(listKeyboard, this._renderListButton(subMode, list))
        .switchInline('share', `share-${list.id}`)
        .row());

    this.appendServiceButtons(listKeyboard, subMode);

    return [this._renderTitle(subMode), { reply_markup: listKeyboard, parse_mode: 'MarkdownV2' }];
  }

  appendServiceButtons(keyboard: InlineKeyboard, subMode: SubMode) {
    if (subMode === SubMode.basic) {
      keyboard
        .text(`🚮${BUTTON_SPACE_SEPARATOR}Удалить`, 'submode-delete')
        .text(`Поделиться${BUTTON_SPACE_SEPARATOR}🔁`, 'submode-share');
    } else {
      keyboard.text(`⬅️${BUTTON_SPACE_SEPARATOR}Назад`, 'submode-basic');
    }

    return keyboard.row();
  }

  _renderTitle(subMode: SubMode | null): string {
    let title;
    switch (subMode) {
      case SubMode.delete:
        title = '*УДАЛИТЬ СПИСОК*';
        break;
      case SubMode.share:
        title = '*ПОДЕЛИТЬСЯ СПИСКОМ*';
        break;
      default:
        title = '*ВЫБРАТЬ СПИСОК*';
    }
    return title;
  }

  _renderListButton(subMode: SubMode, list: WithUsersCount<List>): [string, string] {
    // todo: Добавить тип
    const { id, name, _count: { users } } = list;

    const shared = `${users > 1 ? '🌐 ' : ''}`;

    let renderedTitle;
    let callbackQueryStr;
    switch (subMode) {
      case SubMode.delete:
        renderedTitle = `${shared}${name}${BUTTON_SPACE_SEPARATOR}❌`;
        callbackQueryStr = `lists-delete-${id}`;
        break;
      case SubMode.share:
        renderedTitle = `${shared}${name}${BUTTON_SPACE_SEPARATOR}🔁`;
        callbackQueryStr = `lists-share-${id}`;
        break;
      default:
        renderedTitle = `${shared}${name}`;
        callbackQueryStr = `mode-deals-${id}`;
    }

    return [renderedTitle, callbackQueryStr];
  }
}

export default new ListsView();
