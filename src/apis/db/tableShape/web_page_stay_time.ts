export default interface web_page_stay_time {
  /**
   * 页面停留时间记录id
   */
  web_page_stay_time_id?: number;
  /**
   * 停留的页面url
   */
  url?: string;
  /**
   * 停留在页面的用户
   */
  usercode?: string;
  /**
   * 停留时间(ms)
   */
  duration?: number | string;
  /**
   * 采集时的时间戳(ms)
   */
  timestamp?: number;
  /**
   * 监控项目的key
   */
  project_key: string;
}
