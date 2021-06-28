import chalk = require("chalk");
import log4js = require("log4js");
import { __DEBUG__ } from "src/config";

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
  split() {
    if (!__DEBUG__) return;
    console.log("---- split line ----");
  }
  log(message: string) {
    if (!__DEBUG__) return;
    console.log(message);
  }
  success(message: string) {
    if (!__DEBUG__) return;
    console.log(chalk.green(message));
  }
  warn(message: string) {
    if (!__DEBUG__) return;
    console.log(chalk.yellowBright(message));
    logger.warn(message);
  }
  error(message: string) {
    // 1. debug模式下输出
    // 2. 非debug模式下，非中文信息输出（输出系统报错信息）
    if (__DEBUG__ || !/[\u4e00-\u9fa5]/.test(message)) {
      console.log(chalk.redBright(message));
    }
    logger.error(message);
  }
  trace(e) {
    console.trace(e);
  }
}

export default new Log();
