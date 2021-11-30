import logger from '../utils/logger';

const log = logger.log;

class CommandController {
  start(ctx) {
    log(ctx);
    return ctx.reply('Up and running from commands controller.');
  }
}

export default new CommandController();
