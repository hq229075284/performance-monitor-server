import type { NextFunction, Request, Response } from "express";

export default function cors(req: Request, res: Response, next: NextFunction) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
}
