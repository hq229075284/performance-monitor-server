import type e from "express";
import { MESSAGE_URL } from "./urls";
import waitConnect from "../connect";
import { IResult } from "./type";
import { PV_KEY } from "../constant";
import { createInsertSql, createSelectSql, createUpdateSql } from "./createSql";

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

export default {
  [MESSAGE_URL](app: e.Express) {
    app.get(MESSAGE_URL, async (req, res) => {
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

      const connect = await waitConnect;
      switch (params.key) {
        case PV_KEY: {
          type Results = IResult<{ url: string; times: number; device: string; version: string }>[];
          const results = await new Promise<Results>((resolve) => {
            connect.query<Results>(createSelectSql("pv", ["times"], { url: params.payload }).sql, function (err, results, fields) {
              if (err) throw err;
              resolve(results);
            });
          });

          await new Promise<void>((resolve) => {
            let sql;
            if (results.length === 0) {
              // results.push({
              //   url: params.payload,
              //   times: 1,
              //   device: params.clientInfo.device,
              //   version: params.clientInfo.version,
              // } as Results[0]);
              ({ sql } = createInsertSql("pv", {
                url: params.payload,
                times: 1,
                device: params.clientInfo.device,
                version: params.clientInfo.version,
              }));
            } else {
              ({ sql } = createUpdateSql("pv", { times: results[0].times + 1 }, { url: params.payload }));
            }
            connect.query(sql, function (err, results, fields) {
              if (err) throw err;
              resolve();
            });
          });
          console.log("采集成功");
          res.send("采集成功");
          break;
        }
        default:
          res.send("not match case");
      }
      res.end();
    });
  },
};
