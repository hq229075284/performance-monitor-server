import { TABLE_NAMES } from "../db/table";
import { createInsertSql, createSelectSql, createUpdateSql, execSqlUsePromise } from "../db/createSql";
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
  appKey?: string;
  payload: TPayload;
  userInfo?: { usercode: string; username: string };
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
  if (!params.appKey) {
    throw new Error("因无appKey，PV无法采集");
  }
  const sql = createInsertSql(TABLE_NAMES.PV, {
    url: params.payload,
    project_key: params.appKey,
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
  if (!params.userInfo) {
    throw new Error("因无用户信息，UV无法采集");
  }
  if (!params.appKey) {
    throw new Error("因无appKey，UV无法采集");
  }
  let sql = "";
  sql = createSelectSql(
    TABLE_NAMES.UV,
    "*",
    { usercode: params.userInfo.usercode, url: params.payload.url },
    { orderKeys: ["timestamp"], sort: "desc" }
  ).sql;
  type Results = IResult<{ timestamp: number }>[];
  const results = await execSqlUsePromise<Results>(sql);
  const now = Date.now();
  if (results.length > 0) {
    const newest = results[0];
    if (getDate(newest.timestamp) === getDate(now)) {
      throw new Error(JSON.stringify({ sql, message: "UV重复采集" }));
    }
  }
  const [ipv6, ipv4] = req.ip.split(/(?<=[^:]):/);
  sql = createInsertSql(TABLE_NAMES.UV, {
    usercode: params.userInfo.usercode,
    username: params.userInfo.username,
    ipv4,
    ipv6,
    project_key: params.appKey,
    timestamp: now,
  }).sql;
  await execSqlUsePromise(sql);
  return {
    sql,
    message: "uv采集成功",
  };
}

// 处理网站入口采集
async function processEntry(params: IMessage<{ entryUrl: string }>) {
  if (!params.appKey) {
    throw new Error("因无appKey，网站入口无法采集");
  }
  const sql = createInsertSql(TABLE_NAMES.VISIT, {
    project_key: params.appKey,
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
async function processPageStayTime(
  params: Omit<IMessage<{ duration: number; url: string }>, "userInfo"> & { userInfo?: { usercode: string } }
) {
  if (!params.appKey) {
    throw new Error("因无appKey，页面停留时间无法采集");
  }
  const sql = createInsertSql(TABLE_NAMES.web_page_stay_time, {
    project_key: params.appKey,
    url: params.payload.url,
    usercode: params.userInfo?.usercode,
    duration: params.payload.duration.toFixed(4),
    timestamp: Date.now(),
  }).sql;
  await execSqlUsePromise(sql);
  return {
    sql,
    message: "网页停留时间采集成功",
  };
}

// 首屏加载时间
async function processFPT(params: IMessage<{ url: string; duration: number }>) {
  if (!params.appKey) {
    throw new Error("因无appKey，首屏加载时间无法采集");
  }
  const sql = createInsertSql(TABLE_NAMES.FPT, {
    project_key: params.appKey,
    url: params.payload.url,
    duration: params.payload.duration.toFixed(4),
    timestamp: Date.now(),
  }).sql;
  await execSqlUsePromise(sql);
  return {
    sql,
    message: "网页第一次渲染时间采集成功",
  };
}

// 网页第一次可交互时间
async function processFIT(params: IMessage<{ url: string; duration: number }>) {
  if (!params.appKey) {
    throw new Error("因无appKey，网页第一次可交互时间无法采集");
  }
  const sql = createInsertSql(TABLE_NAMES.FIT, {
    project_key: params.appKey,
    url: params.payload.url,
    duration: params.payload.duration.toFixed(4),
    timestamp: Date.now(),
  }).sql;
  await execSqlUsePromise(sql);
  return {
    sql,
    message: "网页第一次可交互时间采集成功",
  };
}

// 网页静态资源下载时间
async function processStaticSourceLoaded(
  params: IMessage<{ url: string; resource: { [key: string]: { initiatorType: string; duration: number; name: string }[] } }>
) {
  if (!params.appKey) {
    throw new Error("因无appKey，网页静态资源下载时间无法采集");
  }
  const project_key = params.appKey;
  const now = Date.now();
  const sqls: string[] = [];
  await Promise.all(
    Object.keys(params.payload.resource).reduce<Promise<void>[]>((prev, key) => {
      return prev.concat(
        params.payload.resource[key].map(async (item) => {
          const sql = createInsertSql(TABLE_NAMES.static_source_download_time, {
            project_key,
            source_url: item.name,
            source_type: item.initiatorType,
            source_download_time: item.duration,
            ownerUrl: params.payload.url,
            timestamp: now,
          }).sql;
          await execSqlUsePromise(sql);
          sqls.push(sql);
        })
      );
    }, [])
  );
  return {
    sql: sqls,
    message: "网页静态资源下载时间采集成功",
  };
}

// ajax请求时间
async function processAjax(
  params: IMessage<{ ownerUrl: string; requestUrl: string; body: any; startTime: number; endTime: number; duration: number }>
) {
  if (!params.appKey) {
    throw new Error("因无appKey，ajax请求时间无法采集");
  }
  const sql = createInsertSql(TABLE_NAMES.AJAX, {
    project_key: params.appKey,
    requestUrl: params.payload.requestUrl,
    duration: params.payload.duration.toFixed(5),
    ownerUrl: params.payload.ownerUrl,
    timestamp: Date.now(),
  }).sql;
  await execSqlUsePromise(sql);
  return {
    sql,
    message: "ajax请求时间采集成功",
  };
}

export { processPV, processUV, processEntry, processPageStayTime, processFPT, processFIT, processStaticSourceLoaded, processAjax };
