export default interface UV {
  // UV id
  uv_id: number;
  // 用户code
  usercode: string;
  // 用户name
  username: string;
  // ip v4
  ipv4: string;
  // ip v6
  ipv6: string;
  // UV采集时的时间戳(ms)
  timestamp: number;
  // UV采集的网页路径
  url: string;
}
