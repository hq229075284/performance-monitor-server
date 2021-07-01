import * as config from "./src/config";
import { execSqlUsePromise } from "./src/apis/db/createSql";
import fs from "fs";
import path from "path";
import pool, { sshClientReady } from "./src/connect";

function reflectType(t) {
  switch (true) {
    case ["int", "bigint"].includes(t):
      return "number";
    case ["double"].includes(t):
      return "number | string";
    case ["varchar"].includes(t):
      return "string";
    default:
      return "any";
  }
}

function isOptional(field) {
  return field.IS_NULLABLE === "YES" || !!field.EXTRA;
}

(async function () {
  const tableNames = ["AJAX", "FIT", "FPT", "project", "PV", "UV", "visit", "web_page_stay_time", "static_source_download_time"];
  for (const tableName of tableNames) {
    const sql = `
      select * from information_schema.columns
      where table_schema = '${config.connectDBConfig.dbConfig.database}'
      and table_name = '${tableName}'
      `;
    const fields = await execSqlUsePromise(sql);
    const str = `export default interface ${tableName} {${fields
      .map(
        (field) => `
  /**
   * ${field.COLUMN_COMMENT}
   */
  ${field.COLUMN_NAME}${isOptional(field) ? "?" : ""}: ${reflectType(field.DATA_TYPE)};`
      )
      .join("")}
}
`;
    const destPath = path.join(__dirname, `./src/apis/db/tableShape/${tableName}.ts`);
    fs.writeFileSync(destPath, str);
    console.log(`create ${destPath}`);
  }
  console.log("complete");
  pool.end(); // 可省略
  sshClientReady.then((client) => client.end());
})();

// console.log(fields);
