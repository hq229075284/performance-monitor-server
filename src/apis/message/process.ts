import { TABLE_NAMES } from "../../constant";
import { createInsertSql, createSelectSql, createUpdateSql, execSqlUsePromise } from "../createSql";
import type { IResult } from "../type";

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

async function processPV(params: IMessage<string>) {
  let sql: string;
  type Results = IResult<{ times: number }>[];
  sql = createSelectSql(TABLE_NAMES.PV, ["times"], { url: params.payload }).sql;
  const results = await execSqlUsePromise<Results>(sql);

  if (results.length === 0) {
    ({ sql } = createInsertSql(TABLE_NAMES.PV, { url: params.payload, times: 1 }));
    await execSqlUsePromise(sql);
  } else {
    ({ sql } = createUpdateSql(TABLE_NAMES.PV, { times: results[0].times + 1 }, { url: params.payload }));
    await execSqlUsePromise(sql);
  }

  ({ sql } = createInsertSql(TABLE_NAMES.DEVICE, {
    deviceName: params.clientInfo.device,
    deviceVersion: params.clientInfo.version,
    timestamp: Date.now(),
    refId: `${TABLE_NAMES.PV}_${params.payload}`,
  }));
  await execSqlUsePromise(sql);
}

async function processUV(params: IMessage<{ url: string; userInfo: any }>) {}

export { processPV, processUV };
