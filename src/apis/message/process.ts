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
  return {
    sql,
    message: "pv采集成功",
  };
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
  return {
    sql,
    message: "uv采集成功",
  };
}

// 处理网站入口采集
async function processEntry(params: IMessage<{ url: string; entryUrl: string }>) {
  const sql = createInsertSql(TABLE_NAMES.VISIT, {
    url: params.url,
    from: params.payload.entryUrl,
    timestamp: Date.now(),
  }).sql;
  await execSqlUsePromise(sql);
  return {
    sql,
    message: "网页访问入口采集成功",
  };
}

// 页面停留时间采集
async function processPageStayTime(params: Omit<IMessage<number>, "userInfo"> & { userInfo?: { usercode: number } }) {
  const sql = createInsertSql(TABLE_NAMES.web_page_stay_time, {
    url: params.url,
    usercode: params.userInfo?.usercode,
    duration: params.payload.toFixed(4),
    timestamp: Date.now(),
  }).sql;
  await execSqlUsePromise(sql);
  return {
    sql,
    message: "网页停留时间采集成功",
  };
}

// 首屏加载时间
async function processFPT(params: IMessage<number>) {
  const sql = createInsertSql(TABLE_NAMES.FPT, {
    url: params.url,
    duration: params.payload.toFixed(4),
    timestamp: Date.now(),
  }).sql;
  await execSqlUsePromise(sql);
  return {
    sql,
    message: "网页第一次渲染时间采集成功",
  };
}

async function processFIT(params: IMessage<number>) {
  const sql = createInsertSql(TABLE_NAMES.FIT, {
    url: params.url,
    duration: params.payload.toFixed(4),
    timestamp: Date.now(),
  }).sql;
  await execSqlUsePromise(sql);
  return {
    sql,
    message: "网页第一次可交互时间采集成功",
  };
}

async function processStaticSourceLoaded(
  params: IMessage<{ [key: string]: { initiatorType: string; duration: number; name: string } }>
) {
  const now = Date.now();
  const sqls: string[] = [];
  await Promise.all(
    Object.keys(params.payload).map(async (key) => {
      const sql = createInsertSql(TABLE_NAMES.static_source_download_time, {
        source_url: params.payload[key].name,
        source_type: params.payload[key].initiatorType,
        source_download_time: params.payload[key].duration,
        ownerUrl: params.url,
        timestamp: now,
      }).sql;
      await execSqlUsePromise(sql);
      sqls.push(sql);
    })
  );
  return {
    sql: sqls,
    message: "网页静态资源下载时间采集成功",
  };
}

async function processAjax(params: IMessage<{ url: string; body: any; startTime: number; endTime: number; duration: number }>) {
  const sql = createInsertSql(TABLE_NAMES.AJAX, {
    url: params.payload.url,
    duration: params.payload.duration,
    ownerUrl: params.url,
    timestamp: Date.now(),
  }).sql;
  await execSqlUsePromise(sql);
  return {
    sql,
    message: "ajax请求时间采集成功",
  };
}

export { processPV, processUV, processEntry, processPageStayTime, processFPT, processFIT, processStaticSourceLoaded, processAjax };
