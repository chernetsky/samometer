// import { List } from '@prisma/client';
import { InlineKeyboard } from 'grammy';
import type { ParseMode } from '@grammyjs/types';
import dealRepository from '../repositories/deal.repository';
import listRepository from '../repositories/list.repository';

class DealsView {
  // spaceSign: string;
  // spaceSignWidth: number;
  doneSign: string;
  undoneSign: string;
  // maxWidth: number;

  constructor() {
    this.doneSign = 'V';
    this.undoneSign = '. ';
    // this.spaceSign = '.';
    // this.spaceSignWidth = getWidth(this.spaceSign);
    // this.maxWidth = 500;
  }

  async render(listId: number): Promise<[string, { reply_markup: InlineKeyboard, parse_mode: ParseMode }]> {
    const list = await listRepository.getListById(listId);

    if (list) {
      const listKeyboard = new InlineKeyboard();
      const deals = await dealRepository.getDealsByListId(listId);

      deals.forEach((d) => {
        const callbackStr = `${d.doneAt ? 'undone' : 'done'}-${d.id}`;
        listKeyboard
          .text(`${d.doneAt ? this.doneSign : this.undoneSign}`, callbackStr)
          .text(d.name, callbackStr)
          .row();
      });

      this.appendGridButtons(listKeyboard);
      this.appendServiceButtons(listKeyboard);

      // tslint:disable-next-line: max-line-length
      return [this._renderTitle(list.name), { reply_markup: listKeyboard, parse_mode: 'MarkdownV2' }];
    }
  }

  appendGridButtons(keyboard: InlineKeyboard) {
    return keyboard
      .text('.')
      .text('.')
      .text('.')
      .text('.')
      .text('.')
      .text('.')
      .text('.')
      .row();
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
    // let result = done ? this.doneSign : this.undoneSign;

    // result += `${this.spaceSign.repeat(numSpaceSigns)}${text}`;

    return text;
  }
}

export default new DealsView();
