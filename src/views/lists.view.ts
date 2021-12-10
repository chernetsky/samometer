// import { List } from '@prisma/client';
import { InlineKeyboard } from 'grammy';
import dealRepository from '../repositories/deal.repository';
import listRepository from '../repositories/list.repository';

class ListsView {
  async render(): Promise<[string, { reply_markup: InlineKeyboard, parse_mode: string }]> {
    // const list = await listRepository.getLists(listId);

    // if (list) {
    const listKeyboard = new InlineKeyboard();
    // const deals = await dealRepository.getDealsByListId(listId);

    // deals.forEach(d => listKeyboard.text(
    //   this._renderDealText.bind(this)(d.name, d.doneAt),
    //   `${d.doneAt ? 'undone' : 'done'}-${d.id}`,
    // ).row());

    this.appendServiceButtons(listKeyboard);

    return [this._renderTitle(), { reply_markup: listKeyboard, parse_mode: 'MarkdownV2' }];
  }

  appendServiceButtons(keyboard: InlineKeyboard) {
    return keyboard
      .text('Создать список', 'create-list')
      .text('Вернутсья в Сегодня', 'mode-deals')
      .row();
  }

  _renderTitle(): string {
    return 'Все списки:';
  }
}

export default new ListsView();
