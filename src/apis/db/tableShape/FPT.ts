export default interface FPT {
  // 第一次渲染记录id
  FPT_id: number;
  // 渲染页面的url地址
  url: string;
  // 第一次渲染用时(ms)
  duration: number;
  // 采集时的时间戳(ms)
  timestamp: number;
}
