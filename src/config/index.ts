import secret from "../../secret";
export const connectDBConfig = {
  useSSH: true,
  sshConfig: {
    host: "107.173.137.156",
    username: "root",
    pwd: secret.sshPwd,
  },
  dbConfig: {
    host: "127.0.0.1",
    port: "3306",
    username: "root",
    pwd: secret.dbPwd,
    db: "monitor",
  },
};
