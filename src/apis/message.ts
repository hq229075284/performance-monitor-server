import e from "express";
import { PV_URL } from "./urls";
import mysql from "mysql";
export default {
  [PV_URL](app: e.Express) {
    app.get(PV_URL, (req, res) => {
      res.send("Hello World!");
    });
  },
};
