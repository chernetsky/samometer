import { fromPairs } from 'ramda';

export function getHashtagCommands(text: string, entities: { offset: number, length: number }[]): object {
  return fromPairs(entities
    .map(({ offset, length }) => text.substring(offset + 1, (offset + length)).split('_')));
}
