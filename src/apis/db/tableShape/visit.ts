export default interface visit {
  // 访问入口id
  visit_from_id: number;
  // 当前访问的url
  url: string;
  // 当前访问网页的上一个网页的url
  from: string;
  // 采集时的时间戳(ms)
  timestamp: number;
}
