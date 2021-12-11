// import { List } from '@prisma/client';
import { InlineKeyboard } from 'grammy';
import dealRepository from '../repositories/deal.repository';
import listRepository from '../repositories/list.repository';

class ListsView {
  async render(userId: number): Promise<[string, { reply_markup: InlineKeyboard, parse_mode: string }]> {
    const lists = await listRepository.getListsByUserId(userId);

    const listKeyboard = new InlineKeyboard();

    lists.forEach(l => listKeyboard.text(
      this._renderListText.bind(this)(l.name),
      `mode-deals-${l.id}`,
    ).row());

    // this.appendServiceButtons(listKeyboard);

    return [this._renderTitle(), { reply_markup: listKeyboard, parse_mode: 'MarkdownV2' }];
  }

  // appendServiceButtons(keyboard: InlineKeyboard) {
  //   return keyboard
  //     .text('🆕        Создать список', 'create-list').row();
  // }

  _renderTitle(): string {
    return 'Управление списками';
  }

  _renderListText(text: string): string {
    return text;
  }
}

export default new ListsView();
