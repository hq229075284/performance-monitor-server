import type e from "express";
import { MESSAGE_URL } from "../urls";
import { IRequest, IResponse } from "../type";
import { ENTRY_KEY, FIRST_PAINT_KEY, PAGE_STAY_TIME_KEY, PV_KEY, UV_KEY } from "../../constant";
import path = require("path");
import fs = require("fs");
// import type { IMessage } from "./process";
import { processUV, processPV, processEntry, processPageStayTime, processFPT } from "./process";
import log from "src/log";

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
    switch (params.key) {
      case PV_KEY: {
        await processPV(params);
        log.success("pv采集成功");
        break;
      }
      case UV_KEY: {
        await processUV(params, req);
        log.success("uv采集成功");
        break;
      }
      case ENTRY_KEY: {
        await processEntry(params);
        log.success("网页访问入口采集成功");
        break;
      }
      case PAGE_STAY_TIME_KEY: {
        await processPageStayTime(params);
        log.success("网页停留时间采集成功");
        break;
      }
      case FIRST_PAINT_KEY: {
        await processFPT(params);
        log.success("网页第一次渲染时间采集成功");
        break;
      }
      default:
        res.send("not match case");
        return;
    }
  } catch (e) {
    log.error(`采集失败 => ${e.message}`);
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
};
