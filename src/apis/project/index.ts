import e from "express";
import { formatResponseMessage } from "src/utils";
import { createDeleteSql, createInsertSql, createSelectSql, createUpdateSql, execSqlUsePromise } from "../db/createSql";
import { TABLE_NAMES } from "../db/table";
import { IRequest, IResponse } from "../type";
import { ADD_PROJECT_URL, DELETE_PROJECT_URL, UPDATE_PROJECT_URL } from "../urls";

async function addProject(req: IRequest<{ name: string }>, res: IResponse) {
  const { name } = req.body;
  let { sql } = createSelectSql(TABLE_NAMES.project, "*", { name });
  const results = await execSqlUsePromise(sql);
  if (results.length) {
    res.send(formatResponseMessage("已存在同名的监控项目名称"));
    return;
  }
  sql = createInsertSql(TABLE_NAMES.project, { project_key: "1" }).sql;
  await execSqlUsePromise(sql);
  res.send(formatResponseMessage("监控项目添加成功"));
}

async function updateProject(req: IRequest<{ name: string; project_key: string }>, res: IResponse) {
  const { name, project_key } = req.body;
  let { sql } = createUpdateSql(TABLE_NAMES.project, { name }, { project_key });
  await execSqlUsePromise(sql);
  res.send(formatResponseMessage("监控项目修改成功"));
}

async function deleteProject(req: IRequest<{ project_key: string }>, res: IResponse) {
  const { project_key } = req.body;
  let { sql } = createDeleteSql(TABLE_NAMES.project, { project_key });
  await execSqlUsePromise(sql);
  res.send(formatResponseMessage("监控项目删除成功"));
}

export default {
  [ADD_PROJECT_URL](app: e.Express) {
    app.post(ADD_PROJECT_URL, addProject);
  },
  [UPDATE_PROJECT_URL](app: e.Express) {
    app.post(UPDATE_PROJECT_URL, updateProject);
  },
  [DELETE_PROJECT_URL](app: e.Express) {
    app.post(DELETE_PROJECT_URL, deleteProject);
  },
};
