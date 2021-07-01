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
    port: 3306,
    user: "root",
    password: secret.dbPwd,
    database: "monitor",
    connectionLimit: 1 << 6, // 2^6
  },
};

export const __DEBUG__ = true; // 是否输出自定义的调试信息（系统错误等信息仍会输出，不受此变量影响）
export const PRINT_SQL_BEFORE_EXEC = false; // 是否在执行sql前，将sql输出到终端显示
export const FLAG = {
  SHOW_CONNECTION_POOL_STATUS: false, // 是否输出数据库连接池状态
};
