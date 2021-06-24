import type e from "express";
import type { RowDataPacket } from "mysql2/typings/mysql";

export type IRequest<reqBody = any> = e.Request<{}, {}, reqBody>;
export type IResponse<resBody = any> = e.Response<resBody>;
export type IResult<T = any> = T & RowDataPacket;
