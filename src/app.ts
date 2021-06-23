import express from "express";
import routeCreators from "./apis/index";
const app = express();
const port = 3000;

Object.keys(routeCreators).forEach((creatorUrl) => {
  const registerRoute = routeCreators[creatorUrl];
  registerRoute(app);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

export {};
