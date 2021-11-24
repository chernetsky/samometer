import { PINGS } from './constants';

export function getPong(rawPing: string): string | null {
  const ping: symbol = Symbol.for(rawPing.toLocaleLowerCase());

  return PINGS[ping] || null;
}
