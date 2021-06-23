import type e from "express";
import { MESSAGE_URL } from "./urls";
import waitConnect from "../connect";
import { IRequest, IResponse } from "./type";
import { PV_KEY } from "../constant";
import { RowDataPacket } from "mysql2/typings/mysql";

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

type IResult<T = any> = T & RowDataPacket;

export default {
  [MESSAGE_URL](app: e.Express) {
    app.get(MESSAGE_URL, async (req, res: IResponse<{ user: string }>) => {
      const params: IMessage<string> = JSON.parse(decodeURIComponent(req.url.split("?")[1]));

      const connect = await waitConnect;
      switch (params.key) {
        case PV_KEY: {
          type Results = IResult<{ url: string; times: number; device: string; version: string }>[];
          const results = await new Promise<Results>((resolve) => {
            connect.query<Results>(`SELECT times FROM \`pv\` where url='${params.payload}'`, function (err, results, fields) {
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
              sql = `
                INSERT INTO pv (url, times, device, version)  
                VALUES ('${params.payload}','1','${params.clientInfo.device}','${params.clientInfo.version}')
              `;
            } else {
              sql = `UPDATE pv SET times = '${results[0].times + 1}' WHERE url = '${params.payload}'`;
            }
            console.log("sql=>", sql);
            connect.query(sql, function (err, results, fields) {
              if (err) throw err;
              resolve();
            });
          });
          console.log("采集成功");
          res.end("采集成功");
          break;
        }
        default:
          res.end();
      }
      // res.send({ user: req.url });
      // waitConnect.then((connect) => {
      //   connect.query("SELECT * FROM `users`", function (err, results, fields) {
      //     if (err) throw err;
      //     console.log(results);
      //   });
      // });
    });
  },
};
