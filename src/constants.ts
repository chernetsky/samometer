
export const PINGS = {
  [Symbol.for('ping')]: 'pong',
  [Symbol.for('пинг')]: 'понг',
  [Symbol.for('king')]: 'kong',
  [Symbol.for('кинг')]: 'конг',
  // [Symbol.for('42')]: 42,
};

export enum LIST_SPECIAL {
  TODAY = 'today',
}

export const LIST_SPECIAL_DESCRIPTORS = {
  [LIST_SPECIAL.TODAY]: { name: 'Сегодня' },
};
