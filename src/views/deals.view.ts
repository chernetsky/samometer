// import { List } from '@prisma/client';
import { InlineKeyboard } from 'grammy';
import type { ParseMode } from '@grammyjs/types';
import dealRepository from '../repositories/deal.repository';
import listRepository from '../repositories/list.repository';

class DealsView {
  maxDealLength: number;
  maxTextName: number;

  constructor() {
    this.maxTextName = 50;
    this.maxDealLength = 100; // ;115;
  }

  async render(listId: number): Promise<[string, { reply_markup: InlineKeyboard, parse_mode: ParseMode }]> {
    const list = await listRepository.getListById(listId);

    if (list) {
      const listKeyboard = new InlineKeyboard();
      const deals = await dealRepository.getDealsByListId(listId);

      deals.forEach(d => listKeyboard.text(
        this._renderDealText.bind(this)(d.name, d.doneAt),
        `${d.doneAt ? 'undone' : 'done'}-${d.id}`,
      ).row());

      this.appendServiceButtons(listKeyboard);

      // tslint:disable-next-line: max-line-length
      return [this._renderTitle(list.name), { reply_markup: listKeyboard, parse_mode: 'MarkdownV2' }];
    }
  }

  appendServiceButtons(keyboard: InlineKeyboard) {
    return keyboard
      .text('🆗        Очистить', 'clear-list')
      .text('Списки        ⤴️', 'mode-lists')
      .row();
  }

  _renderTitle(listName: string): string {
    return `Список дел: *${listName}*`;
  }

  _renderDealText(text: string, done: boolean): string {
    // let result = done ? 'V' : ' . '; // '☑️'
    const separator = done ? '✅' : '';

    const shortText = text.length > this.maxTextName ?
      `${text.slice(0, this.maxTextName)}` :
      `${text}`;

    const result = `${separator} ${shortText} ${separator}`;

    return result;
  }
}

export default new DealsView();
