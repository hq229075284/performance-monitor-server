import express from "express";
import routeCreators from "./apis/index";
import cros from "./middleware/cors";
import path from "path";
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, "./src/assets"), {}));
app.use(cros);

Object.keys(routeCreators).forEach((creatorUrl) => {
  const registerRoute = routeCreators[creatorUrl];
  registerRoute(app);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

export {};
