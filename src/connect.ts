// import ... from ... or import ... require ..., 影响编译后的调用结果
// import mysqlSsh = require("mysql-ssh"); => var mysqlSsh = require("mysql-ssh");mysqlSsh.connect
// import mysqlSsh from "mysql-ssh" => var mysql_ssh_1 = require("mysql-ssh");mysql_ssh_1["default"].connect
import mysqlSsh = require("mysql-ssh");
import secret from "../secret";
// https://github.com/sidorares/node-mysql2/blob/master/documentation/Extras.md#connecting-using-custom-stream
// https://github.com/grrr-amsterdam/mysql-ssh
export default mysqlSsh
  .connect(
    {
      host: "107.173.137.156",
      username: "root",
      password: secret.sshPwd,
    },
    {
      host: "localhost",
      user: "root",
      password: secret.dbPwd,
      database: "monitor",
    }
  )
  .catch((err): Promise<never> => {
    console.log(err);
    return new Promise(() => {});
  })
  .then((connect) => {
    console.log("connect success");
    return connect;
  });
