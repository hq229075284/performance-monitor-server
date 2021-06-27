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
  url: string;
  payload: TPayload;
  userInfo: { usercode: string; username: string };
}

function getDate(timestamp: number) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}/${month}/${day}`;
}

// 处理pv采集
async function processPV(params: IMessage<string>) {
  //   type Results = IResult<{ times: number }>[];
  //   sql = createSelectSql(TABLE_NAMES.PV, ["times"], { url: params.payload }).sql;
  //   const results = await execSqlUsePromise<Results>(sql);
  const sql = createInsertSql(TABLE_NAMES.PV, {
    url: params.url,
    deviceName: params.clientInfo.device,
    deviceVersion: params.clientInfo.version,
    timestamp: Date.now(),
  }).sql;
  await execSqlUsePromise(sql);
}

// 处理uv采集
async function processUV(params: IMessage<{ url: string }>, req: IRequest) {
  let sql = "";
  sql = createSelectSql(
    TABLE_NAMES.UV,
    "*",
    { usercode: params.userInfo.usercode, url: params.url },
    { orderKeys: ["timestamp"], sort: "desc" }
  ).sql;
  type Results = IResult<{ timestamp: number }>[];
  const results = await execSqlUsePromise<Results>(sql);
  const now = Date.now();
  if (results.length > 0) {
    const newest = results[0];
    if (getDate(newest.timestamp) === getDate(now)) {
      throw new Error("UV重复采集");
    }
  }
  const [ipv6, ipv4] = req.ip.split(/(?<=[^:]):/);
  sql = createInsertSql(TABLE_NAMES.UV, {
    usercode: params.userInfo.usercode,
    username: params.userInfo.username,
    ipv4,
    ipv6,
    url: params.url,
    timestamp: now,
  }).sql;
  await execSqlUsePromise(sql);
}

// 处理网站入口采集
async function processEntry(params: IMessage<{ url: string; entryUrl: string }>) {
  const sql = createInsertSql(TABLE_NAMES.VISIT, {
    url: params.url,
    from: params.payload.entryUrl,
  }).sql;
  await execSqlUsePromise(sql);
}

// 页面停留时间采集
async function processPageStayTime(params: Omit<IMessage<number>, "userInfo"> & { userInfo?: { usercode: number } }) {
  const sql = createInsertSql(TABLE_NAMES.web_page_stay_time, {
    url: params.url,
    usercode: params.userInfo?.usercode,
    duration: params.payload,
  }).sql;
  await execSqlUsePromise(sql);
}

// 首屏加载时间
async function processFPT(params: IMessage<{ number }>) {
  const sql = createInsertSql(TABLE_NAMES.FPT, {
    url: params.url,
    duration: params.payload,
  }).sql;
  await execSqlUsePromise(sql);
}

export { processPV, processUV, processEntry, processPageStayTime, processFPT };
