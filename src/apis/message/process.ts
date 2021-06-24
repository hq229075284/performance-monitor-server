import { TABLE_NAMES } from "../../constant";
import { createInsertSql, createSelectSql, createUpdateSql, execSqlUsePromise } from "../createSql";
import type { IRequest, IResult } from "../type";

export interface IMessage<TPayload = any> {
  key: string;
  clientInfo: {
    device: string;
    version: string;
    userAgent: string;
    language: string;
    platform: string;
  };
  payload: TPayload;
  userInfo: any;
}

function getDate(timestamp: number) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}/${month}/${day}`;
}

async function processPV(params: IMessage<string>) {
  //   type Results = IResult<{ times: number }>[];
  //   sql = createSelectSql(TABLE_NAMES.PV, ["times"], { url: params.payload }).sql;
  //   const results = await execSqlUsePromise<Results>(sql);
  const sql = createInsertSql(TABLE_NAMES.PV, {
    url: params.payload,
    deviceName: params.clientInfo.device,
    deviceVersion: params.clientInfo.version,
    timestamp: Date.now(),
  }).sql;
  await execSqlUsePromise(sql);
}

async function processUV(params: IMessage<{ url: string; userInfo: { username: string } }>, req: IRequest) {
  let sql = "";
  sql = createSelectSql(TABLE_NAMES.UV, "*", { username: params.userInfo.username }, { orderKeys: ["timestamp"], sort: "asc" }).sql;
  type Results = IResult<{ timestamp: number }>[];
  const results = await execSqlUsePromise<Results>(sql);
  const now = Date.now();
  if (results.length > 0) {
    const lastone = results[results.length - 1];
    if (getDate(lastone.timestamp) === getDate(now)) {
      throw new Error("UV重复采集");
    }
  }
  const [ipv6, ipv4] = req.ip.split(/(?<=[^:]):/);
  sql = createInsertSql(TABLE_NAMES.UV, {
    username: params.payload.userInfo.username,
    ipv4,
    ipv6,
    url: params.payload.url,
    timestamp: now,
  }).sql;
  await execSqlUsePromise(sql);
}

export { processPV, processUV };
