import type e from "express";
import { MESSAGE_URL } from "../urls";
import { IRequest, IResponse } from "../type";
import {
  AJAX_KEY,
  ENTRY_KEY,
  FIRST_INTERACTIVE_KEY,
  FIRST_PAINT_KEY,
  PAGE_STAY_TIME_KEY,
  PV_KEY,
  STATIC_SOURCE_LOADED_KEY,
  UV_KEY,
} from "../../constant";
import path = require("path");
import fs = require("fs");
import { connectDBConfig } from "src/config";

// import type { IMessage } from "./process";
import {
  processUV,
  processPV,
  processEntry,
  processPageStayTime,
  processFPT,
  processFIT,
  processStaticSourceLoaded,
  processAjax,
} from "./process";
import log from "src/log";
import { execSqlUsePromise } from "../createSql";

async function receiveMessage(req: IRequest, res: IResponse) {
  const search = req.url.split("?")[1];
  let params;
  if (search) {
    try {
      params = JSON.parse(decodeURIComponent(search));
    } catch {
      res.send("cannot parse params");
      return;
    }
  } else {
    res.send("not find params");
    return;
  }
  try {
    let completeInfo: { sql: string | string[]; message: string };
    switch (params.key) {
      case PV_KEY: {
        completeInfo = await processPV(params);
        break;
      }
      case UV_KEY: {
        completeInfo = await processUV(params, req);
        log.success("uv采集成功");
        break;
      }
      case ENTRY_KEY: {
        completeInfo = await processEntry(params);
        break;
      }
      case PAGE_STAY_TIME_KEY: {
        completeInfo = await processPageStayTime(params);
        break;
      }
      case FIRST_PAINT_KEY: {
        completeInfo = await processFPT(params);
        break;
      }
      case FIRST_INTERACTIVE_KEY: {
        completeInfo = await processFIT(params);
        break;
      }
      case STATIC_SOURCE_LOADED_KEY: {
        completeInfo = await processStaticSourceLoaded(params);
        break;
      }
      case AJAX_KEY: {
        completeInfo = await processAjax(params);
        break;
      }
      default:
        res.send("not match case");
        return;
    }

    // 输出sql和结果，供调试
    log.split();
    if (typeof completeInfo.sql === "string") {
      completeInfo.sql = [completeInfo.sql];
    }
    if (completeInfo.sql.length) {
      completeInfo.sql.forEach((sql) => {
        log.log(sql);
      });
    } else {
      log.log("无sql语句生成");
    }
    log.success(completeInfo.message);
  } catch (e) {
    log.split();
    let message, sql;
    try {
      ({ sql, message } = JSON.parse(e.message));
    } catch {
      message = e.message;
    }
    if (!/[\u4e00-\u9fa5]/.test(message)) {
      // 无中文为系统报错
      log.trace(e);
    }
    if (sql) {
      log.log(`${sql}`);
    }
    log.error(`采集失败 => ${message}`);
    res.end();
    return;
  }

  const fileBuffer = await new Promise<Buffer>((resolve) => {
    fs.readFile(path.join(__dirname, "../../assets/1.png"), {}, (err, f) => {
      if (err) throw err;
      resolve(f);
    });
  });
  res.status(200).send(fileBuffer);
}

export default {
  [MESSAGE_URL](app: e.Express) {
    app.get(MESSAGE_URL, receiveMessage);
  },
  createTableShape(app: e.Express) {
    app.get("/createTableShape", async function (req, res: IResponse) {
      const tableName = req.url.split("?")[1];
      const sql = `
      select * from information_schema.columns
      where table_schema = '${connectDBConfig.dbConfig.db}'
      and table_name = '${tableName}'
      `;
      const fields = await execSqlUsePromise(sql);
      console.log(fields);
      function reflectType(t) {
        switch (true) {
          case ["int", "bigint"].includes(t):
            return "number";
          case ["double"].includes(t):
            return "number|string";
          case ["varchar"].includes(t):
            return "string";
          default:
            return "any";
        }
      }
      const str = `export default interface ${tableName} {${fields
        .map(
          (field) => `
  // ${field.COLUMN_COMMENT}
  ${field.COLUMN_NAME}:${reflectType(field.DATA_TYPE)};`
        )
        .join("")}
}`;
      fs.writeFileSync(path.join(__dirname, `../db/tableShape/${tableName}.ts`), str);
      res.send("create " + path.join(__dirname, `../db/tableShape/${tableName}.ts`));
    });
  },
};
