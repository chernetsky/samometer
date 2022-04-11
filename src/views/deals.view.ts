import { InlineKeyboard } from 'grammy';
import type { ParseMode } from '@grammyjs/types';
import dealRepository from '../repositories/deal.repository';
import listRepository from '../repositories/list.repository';
import { BUTTON_SPACE_SEPARATOR } from '../constants';
import { escapeMarkdown } from '../utils';

class DealsView {
  maxTextName: number;

  constructor() {
    this.maxTextName = 50;
  }

  async render(listId: number): Promise<[string, { reply_markup: InlineKeyboard, parse_mode: ParseMode }]> {
    const list = await listRepository.getById(listId);

    if (list) {
      const listKeyboard = new InlineKeyboard();
      const deals = await dealRepository.getAllByListId(listId);

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
      .text(`🆗${BUTTON_SPACE_SEPARATOR}Очистить`, 'clear-list')
      .text(`Списки${BUTTON_SPACE_SEPARATOR}⤴️`, 'mode-lists')
      .row();
  }

  _renderTitle(listName: string): string {
    return `СПИСОК: *${escapeMarkdown(listName)}*`;
  }

  _renderDealText(text: string, done: boolean): string {
    const doneSymbol = done ? '✅' : '';

    // const shortText = text.length > this.maxTextName ?
    //   `${text.slice(0, this.maxTextName)}` :
    //   `${text}`;

    return `${doneSymbol}  ${text}`;
  }
}

export default new DealsView();
