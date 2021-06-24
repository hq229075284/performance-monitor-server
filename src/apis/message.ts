import type e from "express";
import { MESSAGE_URL } from "./urls";
import { IRequest, IResponse, IResult } from "./type";
import { PV_KEY, TABLE_NAMES } from "../constant";
import { createInsertSql, createSelectSql, createUpdateSql, execSqlUsePromise } from "./createSql";
import path = require("path");
import fs = require("fs");
interface IMessage<TPayload = any> {
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

async function receiveMessage(req: IRequest, res: IResponse) {
  const search = req.url.split("?")[1];
  let params: IMessage<string>;
  if (search) {
    try {
      params = JSON.parse(decodeURIComponent(search));
    } catch {
      res.send("cannot parse params");
      res.end();
      return;
    }
  } else {
    res.send("not find params");
    res.end();
    return;
  }

  let sql: string;
  switch (params.key) {
    case PV_KEY: {
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

      console.log("采集成功");
      const fileBuffer = await new Promise<Buffer>((resolve) => {
        fs.readFile(path.join(__dirname, "../assets/1.png"), {}, (err, f) => {
          if (err) throw err;
          resolve(f);
        });
      });
      res.status(200).send(fileBuffer);
      break;
    }
    default:
      res.send("not match case");
  }
  res.end();
}

export default {
  [MESSAGE_URL](app: e.Express) {
    app.get(MESSAGE_URL, receiveMessage);
  },
};
