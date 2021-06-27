declare module "mysql-ssh" {
  // to find document
  // https://stackoverflow.com/a/48846446
  import { Connection } from "mysql2/index";
  function connect(sshConfig: any, dbConfig: any): Promise<Connection>;
  function close(): void;
}
