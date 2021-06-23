import type e from "express";
export type IRequest<reqBody> = e.Request<{}, {}, reqBody>;
export type IResponse<resBody> = e.Response<resBody>;
