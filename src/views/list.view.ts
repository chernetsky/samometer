// import { List } from '@prisma/client';
import { InlineKeyboard } from 'grammy';
import dealRepository from '../repositories/deal.repository';
import listRepository from '../repositories/list.repository';

class ListView {
  async render(listId: number): Promise<[string, { reply_markup: InlineKeyboard }]> {
    const list = await listRepository.getListById(listId);

    if (list) {
      const listKeyboard = new InlineKeyboard();
      const deals = await dealRepository.getDealsByListId(listId);

      deals.forEach(d => listKeyboard.text(
        `${d.doneAt ? 'V ' : '  '}${d.name}`,
        `${d.doneAt ? 'undone' : 'done'}-${d.id}`,
      ).row());

      this.appendServiceButtons(listKeyboard);

      return [list.name, { reply_markup: listKeyboard }];
    }
  }

  appendServiceButtons(keyboard: InlineKeyboard) {
    return keyboard.text('🗑    Очистить список    🗑', 'clear-list').row();
  }
}

export default new ListView();
