import listRepository from '../repositories/list.repository';
import { PINGS } from '../constants';
import { List } from '@prisma/client';

export function getPong(rawPing: string): string | null {
  const ping: symbol = Symbol.for(rawPing.toLocaleLowerCase());

  return PINGS[ping] || null;
}

/**
 * todo: Заглушка. Потом будет из сессии.
 */
export function getCurrentList(userId: number): Promise<List> {
  return listRepository.getCurrentList(userId);
}
