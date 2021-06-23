import type e from "express";
import type { RowDataPacket } from "mysql2/typings/mysql";

export type IRequest<reqBody> = e.Request<{}, {}, reqBody>;
export type IResponse<resBody> = e.Response<resBody>;
export type IResult<T = any> = T & RowDataPacket;
