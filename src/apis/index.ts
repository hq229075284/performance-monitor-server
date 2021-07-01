import type e from "express";
import message from "./message";
import project from "./project";

export default {
  ...message,
  ...project,
} as {
  [key: string]: (app: e.Express) => void;
};
