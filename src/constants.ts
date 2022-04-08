
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

export const HELP_TEXT_ = 'Привет\\!';
export const HELP_TEXT =
  `Всем привет\\!\n
Это SamometerBot, с помощью которого вы можете:\n
\\* Управлять своими делами, создавая списки дел с возможностью добавлять дела, отмечать сделанные дела, очищать списки от выполненных дел\n
\\* Делиться с другими пользователями своими списками дел, таким образом создавать общие списки\n\n
Бот постоянно развивается, и новый функционал будет регулярно добавляться\\. Пожелания по работе бота можно писать [сюда](tg://user?id=160746560)\\.
`;

export const BUTTON_SPACE_SEPARATOR = '        ';

export const UUID_REGEX = '[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}';

export const INVITE_TTL = 1000 * 60 * 60; // 1 hour
