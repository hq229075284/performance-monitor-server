import type e from "express";
import { MESSAGE_URL } from "../urls";
import { IRequest, IResponse } from "../type";
import { PV_KEY, UV_KEY } from "../../constant";
import path = require("path");
import fs = require("fs");
// import type { IMessage } from "./process";
import { processUV, processPV } from "./process";

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
        console.log("pv采集成功");
        break;
      }
      case UV_KEY: {
        await processUV(params, req);
        console.log("uv采集成功");
        break;
      }
      default:
        res.send("not match case");
        return;
    }
  } catch (e) {
    console.warn(`采集失败 => ${e.message}`);
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
