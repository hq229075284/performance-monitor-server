import type e from "express";
import { MESSAGE_URL } from "../urls";
import { IRequest, IResponse } from "../type";
import { PV_KEY, UV_KEY } from "../../constant";
import path = require("path");
import fs = require("fs");
import type { IMessage } from "./process";
import { processUV, processPV } from "./process";

async function receiveMessage(req: IRequest, res: IResponse) {
  const search = req.url.split("?")[1];
  let params: IMessage<string>;
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

  switch (params.key) {
    case PV_KEY: {
      await processPV(params);
      break;
    }
    case UV_KEY: {
      await processUV(params);
      break;
    }
    default:
      res.send("not match case");
      return;
  }
  console.log("采集成功");
  const fileBuffer = await new Promise<Buffer>((resolve) => {
    fs.readFile(path.join(__dirname, "../assets/1.png"), {}, (err, f) => {
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
