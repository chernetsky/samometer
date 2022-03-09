import { SamometerContext } from '../controllers/session.controller';

export function deleteNotTrackingMessage(ctx: SamometerContext) {
  if (ctx.session.messageId && ctx.msg.message_id !== ctx.session.messageId) {
    console.log('try to delete message ', ctx.msg.message_id);
    return ctx.api.deleteMessage(ctx.chat.id, ctx.msg.message_id)
      .catch((err) => {
        console.log('catch delete message', err);
        /* Не удаляется */
      });
  }
}
