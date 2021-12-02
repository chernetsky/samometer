import { List } from '@prisma/client';
import dealRepository from '../repositories/dealRepository';
import { InlineKeyboard } from 'grammy';

class ListView {
  async render(list: List): Promise<[string, { reply_markup: InlineKeyboard }]> {
    const listButtons = new InlineKeyboard();
    const deals = await dealRepository.getDealsByListId(list.id);

    deals.forEach(d => listButtons.text(
      String(d.name),
      `${d.doneAt ? 'undone' : 'done'}-${d.id}`,
    ).row());

    return [list.name, { reply_markup: listButtons }];
  }
}

export default new ListView();
