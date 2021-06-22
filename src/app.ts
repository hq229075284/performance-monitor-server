import express from "express";
import * as routeCreators from "./apis/index";
const app = express();
const port = 3000;

routeCreators.forEach((creator) => {
  creator(app);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
