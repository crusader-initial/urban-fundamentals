// 50 城在外部数据源中的别名映射。
// - lianjia: 链家二手房子域名前缀（{prefix}.lianjia.com/ershoufang/pgN/）
// - addressKeys: 出现在公司注册地址里的可能写法（用于上市公司归属判定，长串优先匹配）

export interface CityAlias {
  code: string;
  name: string;
  lianjia: string | null;
  addressKeys: string[];
}

export const CITY_ALIASES: CityAlias[] = [
  { code: 'beijing', name: '北京', lianjia: 'bj', addressKeys: ['北京市', '北京'] },
  { code: 'shanghai', name: '上海', lianjia: 'sh', addressKeys: ['上海市', '上海'] },
  { code: 'shenzhen', name: '深圳', lianjia: 'sz', addressKeys: ['深圳市', '深圳'] },
  { code: 'guangzhou', name: '广州', lianjia: 'gz', addressKeys: ['广州市', '广州'] },
  { code: 'hangzhou', name: '杭州', lianjia: 'hz', addressKeys: ['杭州市', '杭州'] },
  { code: 'chengdu', name: '成都', lianjia: 'cd', addressKeys: ['成都市', '成都'] },
  { code: 'wuhan', name: '武汉', lianjia: 'wh', addressKeys: ['武汉市', '武汉'] },
  { code: 'xian', name: '西安', lianjia: 'xa', addressKeys: ['西安市', '西安'] },
  { code: 'suzhou', name: '苏州', lianjia: 'su', addressKeys: ['苏州市', '苏州工业园'] },
  { code: 'chongqing', name: '重庆', lianjia: 'cq', addressKeys: ['重庆市', '重庆'] },
  { code: 'nanjing', name: '南京', lianjia: 'nj', addressKeys: ['南京市', '南京'] },
  { code: 'tianjin', name: '天津', lianjia: 'tj', addressKeys: ['天津市', '天津'] },
  { code: 'ningbo', name: '宁波', lianjia: 'nb', addressKeys: ['宁波市', '宁波'] },
  { code: 'qingdao', name: '青岛', lianjia: 'qd', addressKeys: ['青岛市', '青岛'] },
  { code: 'changsha', name: '长沙', lianjia: 'cs', addressKeys: ['长沙市', '长沙'] },
  { code: 'zhengzhou', name: '郑州', lianjia: 'zz', addressKeys: ['郑州市', '郑州'] },
  { code: 'shenyang', name: '沈阳', lianjia: 'sy', addressKeys: ['沈阳市', '沈阳'] },
  { code: 'dongguan', name: '东莞', lianjia: 'dg', addressKeys: ['东莞市', '东莞'] },
  { code: 'hefei', name: '合肥', lianjia: 'hf', addressKeys: ['合肥市', '合肥'] },
  { code: 'wuxi', name: '无锡', lianjia: 'wx', addressKeys: ['无锡市', '无锡'] },
  { code: 'fuzhou', name: '福州', lianjia: 'fz', addressKeys: ['福州市', '福州'] },
  { code: 'foshan', name: '佛山', lianjia: 'fs', addressKeys: ['佛山市', '佛山'] },
  { code: 'nantong', name: '南通', lianjia: 'nt', addressKeys: ['南通市', '南通'] },
  { code: 'jinan', name: '济南', lianjia: 'jn', addressKeys: ['济南市', '济南'] },
  { code: 'quanzhou', name: '泉州', lianjia: 'quanzhou', addressKeys: ['泉州市', '泉州'] },
  { code: 'changchun', name: '长春', lianjia: 'cc', addressKeys: ['长春市', '长春'] },
  { code: 'dalian', name: '大连', lianjia: 'dl', addressKeys: ['大连市', '大连'] },
  { code: 'xiamen', name: '厦门', lianjia: 'xm', addressKeys: ['厦门市', '厦门'] },
  { code: 'harbin', name: '哈尔滨', lianjia: 'hrb', addressKeys: ['哈尔滨市', '哈尔滨'] },
  { code: 'kunming', name: '昆明', lianjia: 'km', addressKeys: ['昆明市', '昆明'] },
  { code: 'wenzhou', name: '温州', lianjia: 'wz', addressKeys: ['温州市', '温州'] },
  { code: 'yantai', name: '烟台', lianjia: 'yt', addressKeys: ['烟台市', '烟台'] },
  { code: 'changzhou', name: '常州', lianjia: 'changzhou', addressKeys: ['常州市', '常州'] },
  { code: 'tangshan', name: '唐山', lianjia: 'ts', addressKeys: ['唐山市', '唐山'] },
  { code: 'xuzhou', name: '徐州', lianjia: 'xz', addressKeys: ['徐州市', '徐州'] },
  { code: 'shijiazhuang', name: '石家庄', lianjia: 'sjz', addressKeys: ['石家庄市', '石家庄'] },
  { code: 'taiyuan', name: '太原', lianjia: 'ty', addressKeys: ['太原市', '太原'] },
  { code: 'jiaxing', name: '嘉兴', lianjia: 'jx', addressKeys: ['嘉兴市', '嘉兴'] },
  { code: 'jinhua', name: '金华', lianjia: 'jh', addressKeys: ['金华市', '金华'] },
  { code: 'shaoxing', name: '绍兴', lianjia: 'sx', addressKeys: ['绍兴市', '绍兴'] },
  { code: 'taizhou', name: '台州', lianjia: 'taizhou', addressKeys: ['台州市', '台州'] },
  { code: 'nanchang', name: '南昌', lianjia: 'nc', addressKeys: ['南昌市', '南昌'] },
  { code: 'nanning', name: '南宁', lianjia: 'nn', addressKeys: ['南宁市', '南宁'] },
  { code: 'zhongshan', name: '中山', lianjia: 'zs', addressKeys: ['中山市'] },
  { code: 'zhuhai', name: '珠海', lianjia: 'zh', addressKeys: ['珠海市', '珠海'] },
  { code: 'huizhou', name: '惠州', lianjia: 'hui', addressKeys: ['惠州市', '惠州'] },
  { code: 'guiyang', name: '贵阳', lianjia: 'gy', addressKeys: ['贵阳市', '贵阳'] },
  { code: 'lanzhou', name: '兰州', lianjia: 'lz', addressKeys: ['兰州市', '兰州'] },
  { code: 'haikou', name: '海口', lianjia: 'hk', addressKeys: ['海口市', '海口'] },
  { code: 'yinchuan', name: '银川', lianjia: 'yc', addressKeys: ['银川市', '银川'] },
];

export function findCityByAddress(address: string): CityAlias | null {
  if (!address) return null;
  // 长 key 优先（避免"中山"误匹配到含"中山路"的地址）
  const sorted = [...CITY_ALIASES].flatMap(c =>
    c.addressKeys.map(k => ({ city: c, key: k })),
  ).sort((a, b) => b.key.length - a.key.length);
  for (const { city, key } of sorted) {
    if (address.includes(key)) return city;
  }
  return null;
}
