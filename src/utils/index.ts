import { SamometerContext } from '../controllers/session.controller';

export async function deleteNotTrackingMessage(ctx: SamometerContext) {
  if (ctx.session.messageId && ctx.msg.message_id !== ctx.session.messageId) {
    return ctx.api.deleteMessage(ctx.chat.id, ctx.msg.message_id)
      .catch((err) => {
        console.log('catch delete message', err);
        /* Не удаляется */
      });
  }
}

export function escapeMarkdown(rawStr: string) {
  const symbolsToEscape = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];

  let escapedStr = rawStr;
  symbolsToEscape.forEach(ch => escapedStr = escapedStr.replace(ch, `\\${ch}`));

  return escapedStr;
}
