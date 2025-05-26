// 后端服务基础URL，使用局域网IP地址(测试)
export const BASE_URL = 'http://192.168.50.133:8088'; 

// API路径常量
export const API = {
  // 地图信息相关接口
  TOPICS: `${BASE_URL}/mapinfo/topics`,
  MAPS_BY_GROUP: `${BASE_URL}/mapinfo/maps/`,
  MAP_DETAIL: `${BASE_URL}/mapinfo/map/`,
  
  // GeoServer WMS服务地址
  WMS_URL: 'http://192.168.50.133:8080/geoserver/hubei/wms'
};