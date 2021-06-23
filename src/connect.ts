import mysqlSsh from "mysql-ssh";
import { Connection } from "mysql2/typings/mysql";
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
