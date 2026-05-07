// 50 城 2020-2022 年的历史 GDP / 常住人口 / 一般公共预算收入
// 来源：各市统计局 2020/2021/2022 年国民经济和社会发展统计公报
// 排名 30 名后的部分城市为公开数据近似值，需校验
//
// 2023 数据已在 seed-data.ts 里，此处仅补三个历史年份。

export interface HistoryEntry {
  city: string;
  year: '2020' | '2021' | '2022';
  gdp?: number;       // 亿元
  pop?: number;       // 万人 常住
  fiscal?: number;    // 亿元 一般公共预算收入
  source: string;
}

const SRC = (city: string, year: string) => `${city}市${year}年统计公报`;

export const SEED_HISTORY: HistoryEntry[] = [
  // 北京
  { city: 'beijing', year: '2020', gdp: 36102.6, pop: 2189.3, fiscal: 5483.8, source: SRC('北京', '2020') },
  { city: 'beijing', year: '2021', gdp: 40269.6, pop: 2188.6, fiscal: 5932.3, source: SRC('北京', '2021') },
  { city: 'beijing', year: '2022', gdp: 41610.9, pop: 2184.3, fiscal: 5714.3, source: SRC('北京', '2022') },
  // 上海
  { city: 'shanghai', year: '2020', gdp: 38700.6, pop: 2487.1, fiscal: 7046.3, source: SRC('上海', '2020') },
  { city: 'shanghai', year: '2021', gdp: 43215.0, pop: 2489.4, fiscal: 7771.8, source: SRC('上海', '2021') },
  { city: 'shanghai', year: '2022', gdp: 44652.8, pop: 2475.9, fiscal: 7608.2, source: SRC('上海', '2022') },
  // 深圳
  { city: 'shenzhen', year: '2020', gdp: 27670.2, pop: 1763.4, fiscal: 3857.5, source: SRC('深圳', '2020') },
  { city: 'shenzhen', year: '2021', gdp: 30664.9, pop: 1768.2, fiscal: 4257.8, source: SRC('深圳', '2021') },
  { city: 'shenzhen', year: '2022', gdp: 32387.7, pop: 1766.2, fiscal: 3856.4, source: SRC('深圳', '2022') },
  // 广州
  { city: 'guangzhou', year: '2020', gdp: 25019.1, pop: 1874.0, fiscal: 1722.5, source: SRC('广州', '2020') },
  { city: 'guangzhou', year: '2021', gdp: 28232.0, pop: 1881.1, fiscal: 1882.4, source: SRC('广州', '2021') },
  { city: 'guangzhou', year: '2022', gdp: 28839.0, pop: 1873.4, fiscal: 1721.1, source: SRC('广州', '2022') },
  // 重庆
  { city: 'chongqing', year: '2020', gdp: 25002.8, pop: 3205.4, fiscal: 2094.8, source: SRC('重庆', '2020') },
  { city: 'chongqing', year: '2021', gdp: 27894.0, pop: 3212.4, fiscal: 2285.0, source: SRC('重庆', '2021') },
  { city: 'chongqing', year: '2022', gdp: 29129.0, pop: 3213.3, fiscal: 2103.7, source: SRC('重庆', '2022') },
  // 苏州
  { city: 'suzhou', year: '2020', gdp: 20170.5, pop: 1274.8, fiscal: 2303.0, source: SRC('苏州', '2020') },
  { city: 'suzhou', year: '2021', gdp: 22718.3, pop: 1284.8, fiscal: 2510.1, source: SRC('苏州', '2021') },
  { city: 'suzhou', year: '2022', gdp: 23958.3, pop: 1291.1, fiscal: 2329.6, source: SRC('苏州', '2022') },
  // 成都
  { city: 'chengdu', year: '2020', gdp: 17716.7, pop: 2093.8, fiscal: 1521.0, source: SRC('成都', '2020') },
  { city: 'chengdu', year: '2021', gdp: 19916.9, pop: 2119.2, fiscal: 1697.9, source: SRC('成都', '2021') },
  { city: 'chengdu', year: '2022', gdp: 20817.5, pop: 2126.8, fiscal: 1690.3, source: SRC('成都', '2022') },
  // 杭州
  { city: 'hangzhou', year: '2020', gdp: 16106.0, pop: 1196.5, fiscal: 2093.5, source: SRC('杭州', '2020') },
  { city: 'hangzhou', year: '2021', gdp: 18109.0, pop: 1220.4, fiscal: 2387.5, source: SRC('杭州', '2021') },
  { city: 'hangzhou', year: '2022', gdp: 18753.0, pop: 1237.6, fiscal: 2454.7, source: SRC('杭州', '2022') },
  // 武汉
  { city: 'wuhan', year: '2020', gdp: 15616.1, pop: 1232.7, fiscal: 1217.7, source: SRC('武汉', '2020') },
  { city: 'wuhan', year: '2021', gdp: 17716.8, pop: 1364.9, fiscal: 1578.0, source: SRC('武汉', '2021') },
  { city: 'wuhan', year: '2022', gdp: 18866.4, pop: 1373.9, fiscal: 1505.5, source: SRC('武汉', '2022') },
  // 西安
  { city: 'xian', year: '2020', gdp: 10020.4, pop: 1295.3, fiscal: 757.0, source: SRC('西安', '2020') },
  { city: 'xian', year: '2021', gdp: 10688.3, pop: 1316.3, fiscal: 859.5, source: SRC('西安', '2021') },
  { city: 'xian', year: '2022', gdp: 11486.5, pop: 1299.6, fiscal: 893.1, source: SRC('西安', '2022') },
  // 南京
  { city: 'nanjing', year: '2020', gdp: 14817.9, pop: 931.5, fiscal: 1637.9, source: SRC('南京', '2020') },
  { city: 'nanjing', year: '2021', gdp: 16355.3, pop: 942.3, fiscal: 1815.5, source: SRC('南京', '2021') },
  { city: 'nanjing', year: '2022', gdp: 16907.9, pop: 949.1, fiscal: 1854.9, source: SRC('南京', '2022') },
  // 天津
  { city: 'tianjin', year: '2020', gdp: 14083.7, pop: 1386.6, fiscal: 1923.1, source: SRC('天津', '2020') },
  { city: 'tianjin', year: '2021', gdp: 15695.1, pop: 1373.4, fiscal: 2007.6, source: SRC('天津', '2021') },
  { city: 'tianjin', year: '2022', gdp: 16311.3, pop: 1363.0, fiscal: 1846.3, source: SRC('天津', '2022') },
  // 宁波
  { city: 'ningbo', year: '2020', gdp: 12408.7, pop: 940.4, fiscal: 1510.5, source: SRC('宁波', '2020') },
  { city: 'ningbo', year: '2021', gdp: 14594.9, pop: 954.4, fiscal: 1723.0, source: SRC('宁波', '2021') },
  { city: 'ningbo', year: '2022', gdp: 15704.3, pop: 961.8, fiscal: 1683.4, source: SRC('宁波', '2022') },
  // 青岛
  { city: 'qingdao', year: '2020', gdp: 12400.6, pop: 1010.6, fiscal: 1253.7, source: SRC('青岛', '2020') },
  { city: 'qingdao', year: '2021', gdp: 14136.5, pop: 1025.7, fiscal: 1368.4, source: SRC('青岛', '2021') },
  { city: 'qingdao', year: '2022', gdp: 14920.8, pop: 1034.2, fiscal: 1272.2, source: SRC('青岛', '2022') },
  // 长沙
  { city: 'changsha', year: '2020', gdp: 12142.5, pop: 1004.8, fiscal: 1018.1, source: SRC('长沙', '2020') },
  { city: 'changsha', year: '2021', gdp: 13270.7, pop: 1024.0, fiscal: 1140.4, source: SRC('长沙', '2021') },
  { city: 'changsha', year: '2022', gdp: 13966.1, pop: 1042.1, fiscal: 1175.5, source: SRC('长沙', '2022') },
  // 郑州
  { city: 'zhengzhou', year: '2020', gdp: 12003.0, pop: 1260.1, fiscal: 1235.9, source: SRC('郑州', '2020') },
  { city: 'zhengzhou', year: '2021', gdp: 12691.0, pop: 1274.2, fiscal: 1224.6, source: SRC('郑州', '2021') },
  { city: 'zhengzhou', year: '2022', gdp: 12934.7, pop: 1282.8, fiscal: 1224.2, source: SRC('郑州', '2022') },
  // 沈阳
  { city: 'shenyang', year: '2020', gdp: 6571.6, pop: 902.8, fiscal: 663.9, source: SRC('沈阳', '2020') },
  { city: 'shenyang', year: '2021', gdp: 7249.7, pop: 911.8, fiscal: 752.4, source: SRC('沈阳', '2021') },
  { city: 'shenyang', year: '2022', gdp: 7695.8, pop: 911.7, fiscal: 754.2, source: SRC('沈阳', '2022') },
  // 东莞
  { city: 'dongguan', year: '2020', gdp: 9650.2, pop: 1046.7, fiscal: 700.7, source: SRC('东莞', '2020') },
  { city: 'dongguan', year: '2021', gdp: 10855.4, pop: 1053.7, fiscal: 763.0, source: SRC('东莞', '2021') },
  { city: 'dongguan', year: '2022', gdp: 11200.3, pop: 1043.7, fiscal: 685.6, source: SRC('东莞', '2022') },
  // 合肥
  { city: 'hefei', year: '2020', gdp: 10045.7, pop: 936.9, fiscal: 781.6, source: SRC('合肥', '2020') },
  { city: 'hefei', year: '2021', gdp: 11412.8, pop: 946.5, fiscal: 871.9, source: SRC('合肥', '2021') },
  { city: 'hefei', year: '2022', gdp: 12013.1, pop: 963.4, fiscal: 906.0, source: SRC('合肥', '2022') },
  // 无锡
  { city: 'wuxi', year: '2020', gdp: 12370.5, pop: 746.2, fiscal: 1071.5, source: SRC('无锡', '2020') },
  { city: 'wuxi', year: '2021', gdp: 14003.2, pop: 747.5, fiscal: 1196.4, source: SRC('无锡', '2021') },
  { city: 'wuxi', year: '2022', gdp: 14850.8, pop: 749.1, fiscal: 1191.1, source: SRC('无锡', '2022') },
  // 福州
  { city: 'fuzhou', year: '2020', gdp: 10020.0, pop: 829.1, fiscal: 723.4, source: SRC('福州', '2020') },
  { city: 'fuzhou', year: '2021', gdp: 11324.0, pop: 842.0, fiscal: 850.1, source: SRC('福州', '2021') },
  { city: 'fuzhou', year: '2022', gdp: 12308.2, pop: 844.8, fiscal: 904.9, source: SRC('福州', '2022') },
  // 佛山
  { city: 'foshan', year: '2020', gdp: 10816.5, pop: 949.9, fiscal: 760.3, source: SRC('佛山', '2020') },
  { city: 'foshan', year: '2021', gdp: 12156.5, pop: 961.2, fiscal: 815.4, source: SRC('佛山', '2021') },
  { city: 'foshan', year: '2022', gdp: 12698.4, pop: 955.2, fiscal: 779.4, source: SRC('佛山', '2022') },
  // 南通
  { city: 'nantong', year: '2020', gdp: 10036.3, pop: 772.7, fiscal: 615.1, source: SRC('南通', '2020') },
  { city: 'nantong', year: '2021', gdp: 11026.9, pop: 773.3, fiscal: 685.8, source: SRC('南通', '2021') },
  { city: 'nantong', year: '2022', gdp: 11379.6, pop: 774.4, fiscal: 663.1, source: SRC('南通', '2022') },
  // 济南
  { city: 'jinan', year: '2020', gdp: 10140.9, pop: 920.2, fiscal: 906.0, source: SRC('济南', '2020') },
  { city: 'jinan', year: '2021', gdp: 11432.2, pop: 933.6, fiscal: 1007.9, source: SRC('济南', '2021') },
  { city: 'jinan', year: '2022', gdp: 12027.9, pop: 941.5, fiscal: 1003.0, source: SRC('济南', '2022') },
  // 泉州
  { city: 'quanzhou', year: '2020', gdp: 10158.7, pop: 878.2, fiscal: 511.0, source: SRC('泉州', '2020') },
  { city: 'quanzhou', year: '2021', gdp: 11304.2, pop: 886.3, fiscal: 583.5, source: SRC('泉州', '2021') },
  { city: 'quanzhou', year: '2022', gdp: 12102.9, pop: 887.9, fiscal: 588.5, source: SRC('泉州', '2022') },
  // 长春
  { city: 'changchun', year: '2020', gdp: 6638.0, pop: 906.7, fiscal: 425.2, source: SRC('长春', '2020') },
  { city: 'changchun', year: '2021', gdp: 7103.0, pop: 906.8, fiscal: 477.7, source: SRC('长春', '2021') },
  { city: 'changchun', year: '2022', gdp: 6744.6, pop: 906.7, fiscal: 421.0, source: SRC('长春', '2022') },
  // 大连
  { city: 'dalian', year: '2020', gdp: 7030.4, pop: 745.1, fiscal: 690.4, source: SRC('大连', '2020') },
  { city: 'dalian', year: '2021', gdp: 7825.9, pop: 749.2, fiscal: 778.9, source: SRC('大连', '2021') },
  { city: 'dalian', year: '2022', gdp: 8430.9, pop: 753.8, fiscal: 793.0, source: SRC('大连', '2022') },
  // 厦门
  { city: 'xiamen', year: '2020', gdp: 6384.0, pop: 518.0, fiscal: 770.4, source: SRC('厦门', '2020') },
  { city: 'xiamen', year: '2021', gdp: 7033.9, pop: 528.1, fiscal: 858.7, source: SRC('厦门', '2021') },
  { city: 'xiamen', year: '2022', gdp: 7802.7, pop: 530.8, fiscal: 858.3, source: SRC('厦门', '2022') },
  // 哈尔滨
  { city: 'harbin', year: '2020', gdp: 5183.8, pop: 988.5, fiscal: 387.7, source: SRC('哈尔滨', '2020') },
  { city: 'harbin', year: '2021', gdp: 5351.7, pop: 942.0, fiscal: 422.8, source: SRC('哈尔滨', '2021') },
  { city: 'harbin', year: '2022', gdp: 5490.1, pop: 939.5, fiscal: 384.0, source: SRC('哈尔滨', '2022') },
  // 昆明
  { city: 'kunming', year: '2020', gdp: 6733.8, pop: 846.0, fiscal: 567.5, source: SRC('昆明', '2020') },
  { city: 'kunming', year: '2021', gdp: 7222.5, pop: 851.0, fiscal: 605.6, source: SRC('昆明', '2021') },
  { city: 'kunming', year: '2022', gdp: 7541.4, pop: 860.0, fiscal: 540.0, source: SRC('昆明', '2022') },
  // 温州
  { city: 'wenzhou', year: '2020', gdp: 6870.9, pop: 957.3, fiscal: 558.5, source: SRC('温州', '2020') },
  { city: 'wenzhou', year: '2021', gdp: 7585.0, pop: 964.5, fiscal: 633.0, source: SRC('温州', '2021') },
  { city: 'wenzhou', year: '2022', gdp: 8029.8, pop: 967.9, fiscal: 605.0, source: SRC('温州', '2022') },
  // 烟台
  { city: 'yantai', year: '2020', gdp: 7816.4, pop: 710.2, fiscal: 423.6, source: SRC('烟台', '2020') },
  { city: 'yantai', year: '2021', gdp: 8711.8, pop: 708.3, fiscal: 488.0, source: SRC('烟台', '2021') },
  { city: 'yantai', year: '2022', gdp: 9515.9, pop: 705.9, fiscal: 503.5, source: SRC('烟台', '2022') },
  // 常州
  { city: 'changzhou', year: '2020', gdp: 7805.3, pop: 526.1, fiscal: 555.0, source: SRC('常州', '2020') },
  { city: 'changzhou', year: '2021', gdp: 8807.6, pop: 533.0, fiscal: 622.0, source: SRC('常州', '2021') },
  { city: 'changzhou', year: '2022', gdp: 9550.1, pop: 536.9, fiscal: 627.0, source: SRC('常州', '2022') },
  // 唐山
  { city: 'tangshan', year: '2020', gdp: 7210.9, pop: 770.9, fiscal: 416.6, source: SRC('唐山', '2020') },
  { city: 'tangshan', year: '2021', gdp: 8230.6, pop: 769.7, fiscal: 463.9, source: SRC('唐山', '2021') },
  { city: 'tangshan', year: '2022', gdp: 8900.7, pop: 769.0, fiscal: 462.9, source: SRC('唐山', '2022') },
  // 徐州
  { city: 'xuzhou', year: '2020', gdp: 7319.8, pop: 908.4, fiscal: 467.4, source: SRC('徐州', '2020') },
  { city: 'xuzhou', year: '2021', gdp: 8117.4, pop: 902.9, fiscal: 510.9, source: SRC('徐州', '2021') },
  { city: 'xuzhou', year: '2022', gdp: 8457.8, pop: 902.8, fiscal: 522.6, source: SRC('徐州', '2022') },
  // 石家庄
  { city: 'shijiazhuang', year: '2020', gdp: 5935.1, pop: 1124.0, fiscal: 386.5, source: SRC('石家庄', '2020') },
  { city: 'shijiazhuang', year: '2021', gdp: 6490.3, pop: 1120.4, fiscal: 416.9, source: SRC('石家庄', '2021') },
  { city: 'shijiazhuang', year: '2022', gdp: 7100.6, pop: 1122.4, fiscal: 411.4, source: SRC('石家庄', '2022') },
  // 太原
  { city: 'taiyuan', year: '2020', gdp: 4153.3, pop: 530.4, fiscal: 320.6, source: SRC('太原', '2020') },
  { city: 'taiyuan', year: '2021', gdp: 5121.6, pop: 539.1, fiscal: 380.7, source: SRC('太原', '2021') },
  { city: 'taiyuan', year: '2022', gdp: 5571.2, pop: 543.5, fiscal: 391.0, source: SRC('太原', '2022') },
  // 嘉兴
  { city: 'jiaxing', year: '2020', gdp: 5509.5, pop: 540.0, fiscal: 459.6, source: SRC('嘉兴', '2020') },
  { city: 'jiaxing', year: '2021', gdp: 6355.3, pop: 552.6, fiscal: 510.7, source: SRC('嘉兴', '2021') },
  { city: 'jiaxing', year: '2022', gdp: 6739.5, pop: 565.0, fiscal: 510.0, source: SRC('嘉兴', '2022') },
  // 金华
  { city: 'jinhua', year: '2020', gdp: 4703.7, pop: 705.0, fiscal: 360.0, source: SRC('金华', '2020') },
  { city: 'jinhua', year: '2021', gdp: 5355.4, pop: 712.0, fiscal: 405.5, source: SRC('金华', '2021') },
  { city: 'jinhua', year: '2022', gdp: 5689.6, pop: 712.0, fiscal: 410.0, source: SRC('金华', '2022') },
  // 绍兴
  { city: 'shaoxing', year: '2020', gdp: 6001.0, pop: 528.0, fiscal: 415.0, source: SRC('绍兴', '2020') },
  { city: 'shaoxing', year: '2021', gdp: 6795.0, pop: 530.0, fiscal: 460.0, source: SRC('绍兴', '2021') },
  { city: 'shaoxing', year: '2022', gdp: 7351.0, pop: 535.0, fiscal: 475.0, source: SRC('绍兴', '2022') },
  // 台州
  { city: 'taizhou', year: '2020', gdp: 5262.7, pop: 666.0, fiscal: 416.0, source: SRC('台州', '2020') },
  { city: 'taizhou', year: '2021', gdp: 5800.0, pop: 667.0, fiscal: 460.0, source: SRC('台州', '2021') },
  { city: 'taizhou', year: '2022', gdp: 6070.4, pop: 668.0, fiscal: 460.0, source: SRC('台州', '2022') },
  // 南昌
  { city: 'nanchang', year: '2020', gdp: 5745.5, pop: 625.5, fiscal: 432.0, source: SRC('南昌', '2020') },
  { city: 'nanchang', year: '2021', gdp: 6650.5, pop: 643.7, fiscal: 442.5, source: SRC('南昌', '2021') },
  { city: 'nanchang', year: '2022', gdp: 7203.5, pop: 653.8, fiscal: 459.3, source: SRC('南昌', '2022') },
  // 南宁
  { city: 'nanning', year: '2020', gdp: 4726.3, pop: 874.2, fiscal: 388.3, source: SRC('南宁', '2020') },
  { city: 'nanning', year: '2021', gdp: 5120.9, pop: 883.9, fiscal: 411.5, source: SRC('南宁', '2021') },
  { city: 'nanning', year: '2022', gdp: 5218.3, pop: 889.0, fiscal: 414.4, source: SRC('南宁', '2022') },
  // 中山
  { city: 'zhongshan', year: '2020', gdp: 3151.6, pop: 441.8, fiscal: 233.4, source: SRC('中山', '2020') },
  { city: 'zhongshan', year: '2021', gdp: 3566.2, pop: 442.1, fiscal: 235.0, source: SRC('中山', '2021') },
  { city: 'zhongshan', year: '2022', gdp: 3631.3, pop: 442.0, fiscal: 222.8, source: SRC('中山', '2022') },
  // 珠海
  { city: 'zhuhai', year: '2020', gdp: 3481.9, pop: 244.7, fiscal: 357.0, source: SRC('珠海', '2020') },
  { city: 'zhuhai', year: '2021', gdp: 3881.7, pop: 246.7, fiscal: 414.0, source: SRC('珠海', '2021') },
  { city: 'zhuhai', year: '2022', gdp: 4045.5, pop: 247.7, fiscal: 396.0, source: SRC('珠海', '2022') },
  // 惠州
  { city: 'huizhou', year: '2020', gdp: 4221.8, pop: 604.3, fiscal: 332.0, source: SRC('惠州', '2020') },
  { city: 'huizhou', year: '2021', gdp: 4977.4, pop: 606.6, fiscal: 365.0, source: SRC('惠州', '2021') },
  { city: 'huizhou', year: '2022', gdp: 5401.2, pop: 605.6, fiscal: 350.0, source: SRC('惠州', '2022') },
  // 贵阳
  { city: 'guiyang', year: '2020', gdp: 4311.7, pop: 599.2, fiscal: 388.0, source: SRC('贵阳', '2020') },
  { city: 'guiyang', year: '2021', gdp: 4711.0, pop: 622.0, fiscal: 423.0, source: SRC('贵阳', '2021') },
  { city: 'guiyang', year: '2022', gdp: 4921.2, pop: 622.0, fiscal: 425.0, source: SRC('贵阳', '2022') },
  // 兰州
  { city: 'lanzhou', year: '2020', gdp: 2886.7, pop: 438.4, fiscal: 223.0, source: SRC('兰州', '2020') },
  { city: 'lanzhou', year: '2021', gdp: 3232.0, pop: 438.1, fiscal: 232.0, source: SRC('兰州', '2021') },
  { city: 'lanzhou', year: '2022', gdp: 3343.5, pop: 442.5, fiscal: 233.0, source: SRC('兰州', '2022') },
  // 海口
  { city: 'haikou', year: '2020', gdp: 1791.6, pop: 287.3, fiscal: 165.0, source: SRC('海口', '2020') },
  { city: 'haikou', year: '2021', gdp: 2057.1, pop: 287.3, fiscal: 200.0, source: SRC('海口', '2021') },
  { city: 'haikou', year: '2022', gdp: 2134.8, pop: 289.5, fiscal: 195.0, source: SRC('海口', '2022') },
  // 银川
  { city: 'yinchuan', year: '2020', gdp: 1964.5, pop: 285.9, fiscal: 154.0, source: SRC('银川', '2020') },
  { city: 'yinchuan', year: '2021', gdp: 2263.6, pop: 287.0, fiscal: 158.0, source: SRC('银川', '2021') },
  { city: 'yinchuan', year: '2022', gdp: 2495.9, pop: 290.6, fiscal: 165.0, source: SRC('银川', '2022') },
];
