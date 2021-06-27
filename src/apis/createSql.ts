import type { RowDataPacket } from "mysql2/typings/mysql";
import waitConnect from "../connect";
import { PRINT_SQL_BEFORE_EXEC } from "src/config";
import mysql2 from "mysql2";
import { TABLE_NAMES, ITableShape } from "./db/table";

type TABLE_NAME = typeof TABLE_NAMES[keyof typeof TABLE_NAMES];

function referCreateSql<T extends {} = { sql: string }, P extends any[] = []>(createSql: Function) {
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

function getValueWithQuot(v: string, quot = "`") {
  if (v === "?") return v;
  return `${quot}${v}${quot}`;
}

function getSubStatementOfWhere(whereValue: Object) {
  const keys = Object.keys(whereValue);
  return ` WHERE ${keys.map((key) => `${getValueWithQuot(key)}=${mysql2.escape(whereValue[key])}`).join(" and ")} `;
}

// #region select sql
function setSelectSql(
  this: { sql: string },
  tableName: string,
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
    order = ` ORDER BY ${mysql2.escape(orderBy.orderKeys)} ${orderBy.sort} `;
  }
  this.sql = `SELECT ${fields === "*" ? "*" : mysql2.escape(fields)} FROM ${tableName} ${where} ${order}`;
  return this;
}
// 创建select sql语句
interface typeofCreateSelectSql {
  <T extends TABLE_NAME>(
    tableName: T,
    // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-9.html#example-1
    fields: Extract<keyof ITableShape[T], string>[] | "*",
    whereValue?: Object,
    orderBy?: { orderKeys: string[]; sort: "desc" | "asc" },
    groupBy?: string
  ): { sql: string };
}
let createSelectSql: typeofCreateSelectSql;
if (PRINT_SQL_BEFORE_EXEC) {
  // 等号左侧类型要比右侧类型狭隘，保证函数调用时，参数满足左侧类型时，能兼容右侧类型
  // 比如:
  // var a:(p:string)=>void
  // var b:(p:string|number)=>void
  // a=b √ 受a变量类型约束，能兼容b变量类型
  // b=a x 受b变量类型约束，但不能保证兼容a变量类型
  createSelectSql = referCreateSql<{ sql: string }, Parameters<typeof setSelectSql>>(setSelectSql);
} else {
  createSelectSql = (...args) => setSelectSql.apply({ sql: "" }, args);
}
// #endregion select sql

// #region insert sql
function setInsertSql(this: { sql: string }, tableName: TABLE_NAME, keyValue: Object) {
  const keys = Object.keys(keyValue);
  this.sql = `INSERT INTO ${tableName} (${keys.map((k) => getValueWithQuot(k)).join(",")}) VALUES (${keys
    .map((key) => mysql2.escape(keyValue[key]))
    .join(",")})`;
  return this;
}
// 创建insert sql语句
let createInsertSql: (...args: Parameters<typeof setInsertSql>) => { sql: string };
if (PRINT_SQL_BEFORE_EXEC) {
  createInsertSql = referCreateSql<{ sql: string }, Parameters<typeof setInsertSql>>(setInsertSql);
} else {
  createInsertSql = (...args: Parameters<typeof setInsertSql>) => setInsertSql.apply({ sql: "" }, args);
}
// #endregion insert sql

// #region update sql
function setUpdateSql(this: { sql: string }, tableName: TABLE_NAME, keyValue: Object, whereValue?: Object) {
  // const keys = Object.keys(keyValue);
  let where = "";
  if (whereValue) {
    where = getSubStatementOfWhere(whereValue);
  }
  this.sql = `UPDATE ${tableName} SET ${mysql2.escape(keyValue)} ${where}`;
  return this;
}
// 创建update sql语句
let createUpdateSql: (...args: Parameters<typeof setUpdateSql>) => { sql: string };
if (PRINT_SQL_BEFORE_EXEC) {
  createUpdateSql = referCreateSql<{ sql: string }, Parameters<typeof setUpdateSql>>(setUpdateSql);
} else {
  createUpdateSql = (...args) => setUpdateSql.apply({ sql: "" }, args);
}
// #endregion update sql

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
