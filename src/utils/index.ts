import { SamometerContext } from '../controllers/session.controller';

export function deleteNotTrackingMessage(ctx: SamometerContext) {
  console.log('del message', ctx.session.messageId, ctx.msg.message_id)
  if (ctx.session.messageId && ctx.msg.message_id !== ctx.session.messageId) {
    return ctx.api.deleteMessage(ctx.chat.id, ctx.msg.message_id)
      .catch((err) => {
        console.log('catch delete message', err);
        /* Не удаляется */
      });
  }
}
