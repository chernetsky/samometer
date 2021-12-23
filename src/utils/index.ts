import { fromPairs } from 'ramda';

interface HCommands {
  c: string;          // command
  u: number | string; // userId
  v1?: string;        // value1
  v2?: string;        // value2
}

export function getHashtagCommands(text: string, entities: { offset: number, length: number }[]): HCommands {
  return fromPairs(entities
    .map(({ offset, length }) => text.substring(offset + 1, (offset + length)).split('_')));
}
