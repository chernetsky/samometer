// import { List } from '@prisma/client';
import { InlineKeyboard } from 'grammy';
import dealRepository from '../repositories/deal.repository';
import listRepository from '../repositories/list.repository';

class ListView {
  async render(listId: number): Promise<[string, { reply_markup: InlineKeyboard }]> {
    const list = await listRepository.getListById(listId);

    if (list) {
      const listButtons = new InlineKeyboard();
      const deals = await dealRepository.getDealsByListId(listId);

      deals.forEach(d => listButtons.text(
        String(d.name),
        `${d.doneAt ? 'undone' : 'done'}-${d.id}`,
      ).row());

      return [list.name, { reply_markup: listButtons }];
    }
  }
}

export default new ListView();
