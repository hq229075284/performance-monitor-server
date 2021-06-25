import chalk = require("chalk");
import log4js = require("log4js");

const LOG_OUTPUT = "log_output";
log4js.configure({
  appenders: {
    [LOG_OUTPUT]: {
      type: "file",
      filename: LOG_OUTPUT + ".log",
    },
  },
  categories: {
    default: {
      appenders: [LOG_OUTPUT],
      level: "warn",
    },
  },
});
const logger = log4js.getLogger();

class Log {
  log(message: string) {
    console.log(message);
  }
  success(message: string) {
    console.log(chalk.green(message));
  }
  warn(message: string) {
    console.log(chalk.yellowBright(message));
    logger.warn(message);
  }
  error(message: string) {
    console.log(chalk.redBright(message));
    logger.error(message);
  }
}

export default new Log();
