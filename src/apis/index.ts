import type e from "express";
import message from "./message";

export default {
  ...message,
} as {
  [key: string]: (app: e.Express) => void;
};
