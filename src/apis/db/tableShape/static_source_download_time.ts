export default interface static_source_download_time {
  /**
   * 静态资源加载用时记录id
   */
  static_source_download_time_id?: number;
  /**
   * 静态资源路径
   */
  source_url?: string;
  /**
   * 静态资源类型
   */
  source_type?: string;
  /**
   * 下载时间(ms)
   */
  source_download_time?: number;
  /**
   * 当前静态资源所在页面的url地址
   */
  ownerUrl?: string;
  /**
   * 采集时的时间戳(ms)
   */
  timestamp?: number;
  /**
   * 监控项目的key
   */
  project_key: string;
}
