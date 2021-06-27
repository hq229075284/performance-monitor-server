export default interface AJAX {
  // ajax请求记录id
  ajax_id: number;
  // ajax请求的接口路径
  url: string;
  // 请求耗时(ms)
  duration: number;
  // 发起ajax请求的网页url地址
  ownerUrl: string;
  // 采集时的时间戳(ms)
  timestamp: number;
}
