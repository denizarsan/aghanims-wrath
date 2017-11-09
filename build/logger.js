const chalk = require('chalk');
const log = console.log;

class Logger {
  constructor () {
    this.timers = {};
  }

  wait(message, id) {
    this.timers[id] = Date.now();
    log(chalk.bgBlue.black(' WAIT '), chalk.blue(message));
    log();
  }
  info(message) {
    log(chalk.bgWhite.black(' INFO '), chalk.white(message));
    log();
  }
  done(message, id) {
    const duration = Date.now() - this.timers[id];
    log(chalk.bgGreen.black(' DONE '), chalk.green(`${message} in ${duration}ms`));
    log();
    delete this.timers[id];
  }
  error(message) {
    log(chalk.bgRed.black(' ERROR '), chalk.red(message));
    log();
  }
}

module.exports = new Logger();
