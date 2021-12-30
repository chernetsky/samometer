import { SamometerContext } from '../controllers/session.controller';

export function deleteNotTrackingMessage(ctx: SamometerContext) {
  if (ctx.session.messageId && ctx.msg.message_id !== ctx.session.messageId) {
    return ctx.api.deleteMessage(ctx.chat.id, ctx.msg.message_id)
      .catch((err) => {
        /* Не удаляется */
      });
  }
}
