// import { SamometerContext } from "../";

import { SamometerContext } from "controllers/session.controller";

export async function deleteSessionMessage(ctx: SamometerContext) {
  if (ctx.session.messageId) {
    await ctx.api
      .deleteMessage(ctx.chat.id, ctx.session.messageId)
      .catch((err) => {
        console.log("delete session message error", err);
        /* Не удаляется */
      });

    ctx.session.messageId = null;
  }
}

export async function deleteNotTrackingMessage(ctx: SamometerContext) {
  if (ctx.session.messageId && ctx.msg.message_id !== ctx.session.messageId) {
    await ctx.api
      .deleteMessage(ctx.chat.id, ctx.msg.message_id)
      .catch((err) => {
        console.log("delete not tracking message error", err);
        /* Не удаляется */
      });
  }
}

export function escapeMarkdown(rawStr: string) {
  const symbolsToEscape = [
    "_",
    "*",
    "[",
    "]",
    "(",
    ")",
    "~",
    "`",
    ">",
    "#",
    "+",
    "-",
    "=",
    "|",
    "{",
    "}",
    ".",
    "!",
  ];

  let escapedStr = rawStr;
  symbolsToEscape.forEach(
    (ch) => (escapedStr = escapedStr.replace(ch, `\\${ch}`))
  );

  return escapedStr;
}
