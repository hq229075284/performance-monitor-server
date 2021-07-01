// tsconfig.json的esModuleInterop为false时
// import ... from ... or import ... require ..., 影响编译后的调用结果
// import mysqlSsh = require("mysql-ssh"); => var mysqlSsh = require("mysql-ssh");mysqlSsh.connect
// import mysqlSsh from "mysql-ssh" => var mysql_ssh_1 = require("mysql-ssh");mysql_ssh_1["default"].connect
// import * as mysqlSsh from "mysql-ssh"; => var mysqlSsh = require("mysql-ssh");mysqlSsh.connect

import mysql2 from "mysql2";
import * as config from "src/config";
import log from "src/log";
import { Client, ClientChannel } from "ssh2";

const { dbConfig, sshConfig } = config.connectDBConfig;

export const sshClientReady = new Promise<Client>((resolve) => {
  const client = new Client();
  client
    .on("ready", function () {
      resolve(client);
    })
    .connect({
      host: sshConfig.host,
      password: sshConfig.pwd,
      username: sshConfig.username,
    });
});

let createdConnection = 0;
let freeConnection = 0;
export const connectionStatus = Object.defineProperties({} as { createdConnection: number; freeConnection: number }, {
  createdConnection: {
    get() {
      return createdConnection;
    },
  },
  freeConnection: {
    get() {
      return freeConnection;
    },
  },
});

let sshStreams: ClientChannel[] = [];
export function getSSHStream() {
  return sshClientReady.then((client) => {
    return new Promise<ClientChannel>((resolve, reject) => {
      client.forwardOut("127.0.0.1", 12345, dbConfig.host, dbConfig.port, (err, stream) => {
        if (err) {
          log.error("SSH ERROR :: forwardOut error: " + err);
          reject(err);
          return;
        }
        resolve(stream);
      });
    });
  });
}
// @ts-ignore
// global.sshStreams = sshStreams;

export function pushStream(stream: ClientChannel) {
  sshStreams.push(stream);
}

// https://github.com/sidorares/node-mysql2/blob/master/documentation/Extras.md#connecting-using-custom-stream
// https://github.com/grrr-amsterdam/mysql-ssh

let pool: mysql2.Pool;
if (config.connectDBConfig.useSSH) {
  const _dbConfig = {
    ...dbConfig,
    host: "localhost",
    // 关于stream的讨论：https://github.com/sidorares/node-mysql2/issues/653#issuecomment-338945668
    // stream为函数时，是同步的且无callback可调用：https://github.com/sidorares/node-mysql2/blob/07a429d9765dcbb24af4264654e973847236e0de/lib/connection.js#L45
    stream() {
      return sshStreams.shift();
    },
  };
  pool = mysql2.createPool(_dbConfig);
} else {
  pool = mysql2.createPool(dbConfig);
}

pool.on("acquire", function () {
  if (config.FLAG.SHOW_CONNECTION_POOL_STATUS) log.log("从连接池中获取到一个连接");
  freeConnection--;
});
pool.on("connection", function () {
  if (config.FLAG.SHOW_CONNECTION_POOL_STATUS) log.log("新连接被创建");
  createdConnection++;
  freeConnection++; // 后面会马上执行`acquire`的回调
});
pool.on("enqueue", function () {
  if (config.FLAG.SHOW_CONNECTION_POOL_STATUS) log.log("有查询事务正在等待连接池分配连接");
});
pool.on("release", function () {
  if (config.FLAG.SHOW_CONNECTION_POOL_STATUS) log.log("连接已释放回连接池");
  freeConnection++;
});

export default pool;

// .then((connect) => {
//   return new Promise<mysql2.Pool>((resolve) => {
//     // 主动连接
//     connect.connect((err) => {
//       if (err) throw err;
//       log.success("database connect success");
//       resolve(connect);
//     });
//   });
// })
// .catch((err): Promise<never> => {
//   log.error(err);
//   return new Promise(() => {});
// });
// .then((connect) => {
//   log.success("connect success");
//   return connect;
// });
