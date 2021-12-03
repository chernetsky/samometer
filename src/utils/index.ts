import listRepository from '../repositories/list.repository';
import { PINGS } from '../constants';
import { List } from '@prisma/client';
import { SamometerContext } from 'session/context';

export function getPong(rawPing: string): string | null {
  const ping: symbol = Symbol.for(rawPing.toLocaleLowerCase());

  return PINGS[ping] || null;
}

export async function getCurrentListId(ctx: SamometerContext): Promise<number> {
  return ctx.session.listId || listRepository.getCurrentListId(ctx.from.id);
}
