class Logger {
  log(ctx, data?: any) {
    if (String(ctx.from.id) === process.env.LOG_USER_ID) {
      console.log(data || ctx);
    }
  }
}

export default new Logger();
