import type e from "express";
import { PV_URL } from "./urls";
import waitConnect from "../connect";
import { IRequest, IResponse } from "./type";

export default {
  [PV_URL](app: e.Express) {
    app.get(PV_URL, (req: IRequest<{ a: string }>, res: IResponse<{ user: string }>) => {
      req.params["a1"] = "asd";
      console.log(req.body.a);
      res.send({ user: req.url });
      // waitConnect.then((connect) => {
      //   connect.query("SELECT * FROM `users`", function (err, results, fields) {
      //     if (err) throw err;
      //     console.log(results);
      //   });
      // });
    });
  },
};
