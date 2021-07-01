export default interface PV {
  /**
   * PV id
   */
  pv_id?: number;
  /**
   * 访问的前端页面url
   */
  url?: string;
  /**
   * 访问设备的系统名称
   */
  deviceName?: string;
  /**
   * 访问设备的系统版本
   */
  deviceVersion?: string;
  /**
   * 访问时间戳
   */
  timestamp?: number;
  /**
   * 监控项目的key
   */
  project_key: string;
}
