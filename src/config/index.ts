import secret from "../../secret";
export const connectDBConfig = {
  useSSH: true,
  sshConfig: {
    host: "107.173.137.156",
    username: "root",
    pwd: secret.sshPwd,
  },
  dbConfig: {
    host: "localhost",
    port: "3306",
    username: "root",
    pwd: secret.dbPwd,
    db: "monitor",
  },
};

export const __DEBUG__ = true; // 是否输出自定义的调试信息（系统错误等信息仍会输出，不受此变量影响）
export const PRINT_SQL_BEFORE_EXEC = false; // 是否在执行sql前，将sql输出到终端显示
