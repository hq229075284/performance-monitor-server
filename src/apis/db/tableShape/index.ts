import AJAX from "./AJAX";
import FIT from "./FIT";
import FPT from "./FPT";
import PV from "./PV";
import UV from "./UV";
import visit from "./visit";
import static_source_download_time from "./static_source_download_time";
import web_page_stay_time from "./web_page_stay_time";

export interface ITableShape {
  AJAX: AJAX;
  FIT: FIT;
  FPT: FPT;
  PV: PV;
  UV: UV;
  visit: visit;
  static_source_download_time: static_source_download_time;
  web_page_stay_time: web_page_stay_time;
}
