# 记录

依赖:

- [mysql2](https://github.com/sidorares/node-mysql2#readme)
- [express](https://expressjs.com/en/4x/api.html)
- [typescript-search](https://www.typescriptlang.org/dt/search?search=)

问题解决方案:

- [tsconfig-paths](https://www.npmjs.com/package/tsconfig-paths)使 tsconfig 的 paths 属性在执行时也有效
- [mysql-ssh](https://www.npmjs.com/package/mysql-ssh)解决 ssh 连接数据库服务的问题
- [ts 3.9 `keyof` break change](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-9.html#example-1)
- [log4js](https://www.npmjs.com/package/log4js)解决日志记录问题

## TODO

不同用户，不同机型和不同系统下

- 数据监控
- [x] PV/UV
- [x] 页面的停留时间
- [x] 访问入口途径
- [ ] 页面中触发的行为

- 性能监控
- [x] 首屏加载时间
- [x] 页面第一次可交互时间
- [-] http 等请求的响应时间
- [-] 静态资源整体下载时间

- 异常监控
- [ ] Javascript

- 埋点
