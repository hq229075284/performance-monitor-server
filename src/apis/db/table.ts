import AJAX from "src/apis/db/tableShape/AJAX";
import FIT from "src/apis/db/tableShape/FIT";
import FPT from "src/apis/db/tableShape/FPT";
import PV from "src/apis/db/tableShape/PV";
import UV from "src/apis/db/tableShape/UV";
import visit from "src/apis/db/tableShape/visit";
import static_source_download_time from "src/apis/db/tableShape/static_source_download_time";
import web_page_stay_time from "src/apis/db/tableShape/web_page_stay_time";
import project from "src/apis/db/tableShape/project";

export interface ITableShape {
  AJAX: AJAX;
  FIT: FIT;
  FPT: FPT;
  PV: PV;
  UV: UV;
  visit: visit;
  static_source_download_time: static_source_download_time;
  web_page_stay_time: web_page_stay_time;
  project: project;
}

// export * as ItableShape from 'src/apis/db/tableShape/tableShape'

export const TABLE_NAMES = {
  PV: "PV",
  UV: "UV",
  VISIT: "visit",
  FPT: "FPT",
  FIT: "FIT",
  AJAX: "AJAX",
  web_page_stay_time: "web_page_stay_time",
  static_source_download_time: "static_source_download_time",
  project: "project",
} as const; // https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-inference

// https://blog.pyrospect.com/2019/01/how-to-manage-remote-servers-and.html
