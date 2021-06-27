// tsconfig.json的esModuleInterop为false时
// import ... from ... or import ... require ..., 影响编译后的调用结果
// import mysqlSsh = require("mysql-ssh"); => var mysqlSsh = require("mysql-ssh");mysqlSsh.connect
// import mysqlSsh from "mysql-ssh" => var mysql_ssh_1 = require("mysql-ssh");mysql_ssh_1["default"].connect
// import * as mysqlSsh from "mysql-ssh"; => var mysqlSsh = require("mysql-ssh");mysqlSsh.connect

import type { Connection } from "mysql2";

import mysqlSsh from "mysql-ssh";
import mysql2 from "mysql2";
import * as config from "src/config";
import log from "src/log";

let readyToConnectDB: Promise<Connection>;
const { dbConfig } = config.connectDBConfig;
if (config.connectDBConfig.useSSH) {
  // https://github.com/sidorares/node-mysql2/blob/master/documentation/Extras.md#connecting-using-custom-stream
  // https://github.com/grrr-amsterdam/mysql-ssh
  const { sshConfig } = config.connectDBConfig;
  readyToConnectDB = mysqlSsh.connect(
    {
      host: sshConfig.host,
      username: sshConfig.username,
      password: sshConfig.pwd,
    },
    {
      host: dbConfig.host,
      user: dbConfig.username,
      port: dbConfig.port,
      password: dbConfig.pwd,
      database: dbConfig.db,
    }
  );
} else {
  readyToConnectDB = new Promise((resolve) => {
    resolve(
      mysql2.createConnection({
        host: dbConfig.host,
        user: dbConfig.username,
        password: dbConfig.pwd,
        database: dbConfig.db,
      })
    );
  });
}

export default readyToConnectDB
  .then((connect) => {
    return new Promise<Connection>((resolve) => {
      // 主动连接
      connect.connect((err) => {
        if (err) throw err;
        log.success("database connect success");
        resolve(connect);
      });
    });
  })
  .catch((err): Promise<never> => {
    log.error(err);
    return new Promise(() => {});
  });
// .then((connect) => {
//   log.success("connect success");
//   return connect;
// });
