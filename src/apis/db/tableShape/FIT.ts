export default interface FIT {
  // 首次可交互记录id
  FIT_id: number;
  // 交互的网页地址
  url: string;
  // 到第一次可交互时使用的时间(ms)
  duration: number;
  // 采集时的时间戳(ms)
  timestamp: number;
}
