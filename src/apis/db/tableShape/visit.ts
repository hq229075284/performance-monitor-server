export default interface visit {
  /**
   * 访问入口id
   */
  visit_from_id?: number;
  /**
   * 当前访问的url
   */
  _deprecated_url?: string;
  /**
   * 当前访问网页的上一个网页的url
   */
  from?: string;
  /**
   * 采集时的时间戳(ms)
   */
  timestamp?: number;
  /**
   * 监控项目的key
   */
  project_key: string;
}
