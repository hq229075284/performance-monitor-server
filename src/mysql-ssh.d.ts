declare module "mysql-ssh" {
  // to find document
  // https://stackoverflow.com/a/48846446
  import Connection from "mysql2/typings/mysql/lib/Connection";
  function connect(sshConfig: any, dbConfig: any): Promise<Connection>;
  function close(): void;
}
