import mysql from "mysql";
// https://github.com/sidorares/node-mysql2/blob/master/documentation/Extras.md#connecting-using-custom-stream
// https://github.com/grrr-amsterdam/mysql-ssh
var connection = mysql.createConnection({
  host: "localhost",
  user: "me",
  password: "secret",
  database: "my_db",
});
