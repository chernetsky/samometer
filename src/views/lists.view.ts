import { SubMode } from '../controllers/session.controller';
import { InlineKeyboard } from 'grammy';
import listRepository from '../repositories/list.repository';

class ListsView {
  async render(userId: number, subMode: SubMode | null):
    Promise<[string, { reply_markup: InlineKeyboard, parse_mode: string }]> {
    const lists = await listRepository.getListsByUserId(userId);

    const listKeyboard = new InlineKeyboard();

    lists.forEach(l => listKeyboard.text(
      this._renderListText.bind(this)(l.name),
      `mode-deals-${l.id}`,
    ).row());

    this.appendServiceButtons(listKeyboard, subMode);

    return [this._renderTitle(subMode), { reply_markup: listKeyboard, parse_mode: 'MarkdownV2' }];
  }

  appendServiceButtons(keyboard: InlineKeyboard, subMode: SubMode) {
    if (subMode === SubMode.basic) {
      keyboard
        .text('⏹        Удалить', 'submode-delete')
        .text('Поделиться        ↔️', 'submode-share');
    } else {
      keyboard.text('⬅️        Назад', 'submode-basic');
    }

    return keyboard.row();
  }

  _renderTitle(subMode: SubMode | null): string {
    let title;
    switch (subMode) {
      case SubMode.delete:
        title = '*УДАЛИТЬ СПИСОК*❗️\nВыберите список, чтобы его удалить';
        break;
      case SubMode.share:
        title = '*ПОДЕЛИТЬСЯ СПИСКОМ*❕\nВыберите список, чтобы им поделиться';
        break;
      default:
        title = 'Все списки';
    }
    return title;
  }

  _renderListText(text: string): string {
    return text;
  }
}

export default new ListsView();
