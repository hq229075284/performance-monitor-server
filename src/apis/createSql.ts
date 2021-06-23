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
  tableName: string,
  fields: string[],
  whereValue?: Object,
  orderBy?: "desc" | "asc",
  groupBy?: string
) {
  let where = "";
  if (whereValue) {
    where = getSubStatementOfWhere(whereValue);
  }
  this.sql = `SELECT ${fields.join(",")} FROM ${tableName} ${where}`;
  return this;
}
// 创建select sql语句
const createSelectSql = referCreateSql<{ sql: string }, Parameters<typeof setSelectSql>>(setSelectSql);

function setInsertSql(this: { sql: string }, tableName: string, keyValue: Object) {
  const keys = Object.keys(keyValue);
  this.sql = `INSERT INTO ${tableName} (${keys.join(",")}) VALUES (${keys
    .map((key) => getPropertyValueWithQuot(keyValue[key]))
    .join(",")})`;
  return this;
}
// 创建insert sql语句
const createInsertSql = referCreateSql<{ sql: string }, Parameters<typeof setInsertSql>>(setInsertSql);

function setUpdateSql(this: { sql: string }, tableName: string, keyValue: Object, whereValue?: Object) {
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

export { createSelectSql, createInsertSql, createUpdateSql };
