import type { RowDataPacket } from "mysql2/typings/mysql";
import waitConnect from "../connect";
import { TABLE_NAMES } from "../constant";

type TABLE_NAME = typeof TABLE_NAMES[keyof typeof TABLE_NAMES];

function referCreateSql<T extends {} = { sql: string }, P extends any[] = []>(createSql) {
  return function createProxy(...rest: P) {
    const proxy = new Proxy<T>({} as T, {
      get(target, propKey) {
        if (typeof propKey === "string") {
          console.log(`${propKey}=>${target[propKey]}`);
        }
        return target[propKey];
      },
      set(target, propKey, value) {
        target[propKey] = value;
        return true;
      },
    });
    createSql.apply(proxy, rest);
    return proxy;
  };
}

function getPropertyValueWithQuot(v: string) {
  if (v === "?") return v;
  return `'${v}'`;
}

function getSubStatementOfWhere(whereValue: Object) {
  const keys = Object.keys(whereValue);
  return ` WHERE ${keys.map((key) => `${key}=${getPropertyValueWithQuot(whereValue[key])}`).join(" and ")} `;
}

function setSelectSql(
  this: { sql: string },
  tableName: TABLE_NAME,
  fields: string[] | "*",
  whereValue?: Object,
  orderBy?: { orderKeys: string[]; sort: "desc" | "asc" },
  groupBy?: string
) {
  let where = "";
  if (whereValue) {
    where = getSubStatementOfWhere(whereValue);
  }
  let order = "";
  if (orderBy) {
    order = ` ORDER BY ${orderBy.orderKeys.join(",")} ${orderBy.sort}`;
  }
  this.sql = `SELECT ${fields === "*" ? "*" : fields.join(",")} FROM ${tableName} ${where} ${order}`;
  return this;
}
// 创建select sql语句
const createSelectSql = referCreateSql<{ sql: string }, Parameters<typeof setSelectSql>>(setSelectSql);

function setInsertSql(this: { sql: string }, tableName: TABLE_NAME, keyValue: Object) {
  const keys = Object.keys(keyValue);
  this.sql = `INSERT INTO ${tableName} (${keys.join(",")}) VALUES (${keys
    .map((key) => getPropertyValueWithQuot(keyValue[key]))
    .join(",")})`;
  return this;
}
// 创建insert sql语句
const createInsertSql = referCreateSql<{ sql: string }, Parameters<typeof setInsertSql>>(setInsertSql);

function setUpdateSql(this: { sql: string }, tableName: TABLE_NAME, keyValue: Object, whereValue?: Object) {
  const keys = Object.keys(keyValue);
  let where = "";
  if (whereValue) {
    where = getSubStatementOfWhere(whereValue);
  }
  this.sql = `UPDATE ${tableName} SET ${keys.map((key) => `${key}=${getPropertyValueWithQuot(keyValue[key])}`).join(",")} ${where}`;
  return this;
}
// 创建update sql语句
const createUpdateSql = referCreateSql<{ sql: string }, Parameters<typeof setUpdateSql>>(setUpdateSql);

// ts编译会报错
// function execSqlUsePromise<T extends RowDataPacket[] = any[]>(sql: string) {
//   return new Promise<T>((resolve) => {
//     waitConnect.then((connect) => {
//       connect.query<T>(sql, function (err, results, fields) {
//         if (err) throw err;
//         resolve(results);
//       });
//     });
//   });
// }

async function execSqlUsePromise<T extends RowDataPacket[] = any[]>(sql: string) {
  const connect = await waitConnect;
  const results = await new Promise<T>((resolve) => {
    connect.query<T>(sql, function (err, results, fields) {
      if (err) throw err;
      resolve(results);
    });
  });
  return results;
}

export { createSelectSql, createInsertSql, createUpdateSql, execSqlUsePromise };
