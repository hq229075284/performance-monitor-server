import type { RowDataPacket } from "mysql2/typings/mysql";
import pool, { getSSHStream, pushStream, connectionStatus } from "src/connect";
import { connectDBConfig, PRINT_SQL_BEFORE_EXEC } from "src/config";
import { escape, escapeId } from "sqlstring";
import { TABLE_NAMES, ITableShape } from "./table";

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

// function getValueWithQuot(v: string, quot = "`") {
//   if (v === "?") return v;
//   return `${quot}${v}${quot}`;
// }

function getSubStatementOfWhere(whereValue: IWhereValue) {
  const keys = Object.keys(whereValue);
  return ` WHERE ${keys
    .map(
      (key) =>
        `${escapeId(key)}=${(() => {
          const value = whereValue[key];
          if (typeof value === "object") {
            return value.needEscape ? escape(value.value) : value.value;
          }
          return escape(value);
        })()}`
    )
    .join(" and ")} `;
}

type IWhereValue<T = any> = {
  [key in keyof T]?: string | number | { needEscape: boolean; value: string | number };
};

// #region select sql
function setSelectSql(
  this: { sql: string },
  tableName: string,
  fields: string[] | "*",
  whereValue?: IWhereValue,
  orderBy?: { orderKeys: string[]; sort: "desc" | "asc" },
  groupBy?: string
) {
  let where = "";
  if (whereValue) {
    where = getSubStatementOfWhere(whereValue);
  }
  let order = "";
  if (orderBy) {
    order = ` ORDER BY ${escapeId(orderBy.orderKeys)} ${orderBy.sort} `;
  }
  this.sql = `SELECT ${fields === "*" ? "*" : escapeId(fields)} FROM ${escapeId(tableName)} ${where} ${order}`;
  return this;
}

// 创建select sql语句
interface typeofCreateSelectSql {
  <T extends TABLE_NAME>(
    tableName: T,
    // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-9.html#example-1
    fields: Extract<keyof ITableShape[T], string>[] | "*",
    whereValue?: IWhereValue<ITableShape[T]>,
    orderBy?: { orderKeys: Extract<keyof ITableShape[T], string>[]; sort: "desc" | "asc" },
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
  this.sql = `INSERT INTO ${escapeId(tableName)} (${keys.map((k) => escapeId(k)).join(",")}) VALUES (${keys
    .map((key) => escape(keyValue[key]))
    .join(",")})`;
  return this;
}
// 创建insert sql语句
// type IRequireOrNot<T = any, O = any> = { [K in keyof T]: K extends O ? T[K] | never : T[K] };
// type IRequireOrNot<T, O extends keyof T> = Required<Pick<T, Exclude<keyof T, O>>> & Partial<Pick<T, O>>;
// var a: IRequireOrNot<ITableShape["project"], "project_key">;
// a = {
//   name: "1",
//   project_key: "1",
// };
// var a: IRequireOrNot<ITableShape[TABLE_NAME], keyof ITableShape[TABLE_NAME]>;
// a = {
//   project_key: "1",
// };

let createInsertSql: <T extends TABLE_NAME>(tableName: T, keyValue: ITableShape[T]) => { sql: string };
if (PRINT_SQL_BEFORE_EXEC) {
  createInsertSql = referCreateSql<{ sql: string }, Parameters<typeof setInsertSql>>(setInsertSql);
} else {
  createInsertSql = (...args: Parameters<typeof setInsertSql>) => setInsertSql.apply({ sql: "" }, args);
}
// #endregion insert sql

// #region update sql
function setUpdateSql(this: { sql: string }, tableName: TABLE_NAME, keyValue: Object, whereValue: IWhereValue) {
  // const keys = Object.keys(keyValue);
  let where = getSubStatementOfWhere(whereValue);
  this.sql = `UPDATE ${escapeId(tableName)} SET ${escape(keyValue)} ${where}`;
  return this;
}
// 创建update sql语句
let createUpdateSql: <T extends TABLE_NAME>(
  tableName: T,
  keyValue: Partial<ITableShape[T]>,
  whereValue: IWhereValue<ITableShape[T]>
) => { sql: string };
if (PRINT_SQL_BEFORE_EXEC) {
  createUpdateSql = referCreateSql<{ sql: string }, Parameters<typeof setUpdateSql>>(setUpdateSql);
} else {
  createUpdateSql = (...args) => setUpdateSql.apply({ sql: "" }, args);
}
// #endregion update sql

// #region  delete sql
function setDeleteSql(this: { sql: string }, tableName: TABLE_NAME, whereValue: IWhereValue) {
  this.sql = `DELETE FROM ${escapeId(tableName)} where ${getSubStatementOfWhere(whereValue)} `;
  return this;
}
let createDeleteSql: <T extends TABLE_NAME>(tableName: T, whereValue: IWhereValue<ITableShape[T]>) => { sql: string };
if (PRINT_SQL_BEFORE_EXEC) {
  createDeleteSql = referCreateSql<{ sql: string }, Parameters<typeof setDeleteSql>>(setDeleteSql);
} else {
  createDeleteSql = (...args) => setDeleteSql.apply({ sql: "" }, args);
}
// #endregion delete sql

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
  const results = await new Promise<T>(async (resolve) => {
    // 未达到连接上限
    if (connectionStatus.createdConnection < connectDBConfig.dbConfig.connectionLimit) {
      // stream与connection一一对应：https://github.com/sidorares/node-mysql2/issues/653#issuecomment-338793064
      const stream = await getSSHStream(); // FIXME:尝试不要每个请求都创建stream
      // stream创建过程中，连接池状态可能发生变化，需在stream创建后，判断是否存在空闲的`连接`
      if (connectionStatus.freeConnection === 0) {
        pushStream(stream); // 如无空闲`连接`时，推入一个stream，用于pool.query时创建一个新的`连接`
      }
    }
    pool.query<T>(sql, function (err, results, fields) {
      if (err) throw err;
      resolve(results);
    });
  });
  return results;
}

export { createSelectSql, createInsertSql, createUpdateSql, execSqlUsePromise, createDeleteSql };
