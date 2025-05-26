// 后端服务基础URL
export const BASE_URL = 'http://192.168.50.133:8088';

// GeoServer配置
export const GEOSERVER_CONFIG = {
  BASE_URL: 'http://192.168.50.133:8080/geoserver',
  WORKSPACE: 'hubei'
};

// API路径常量
export const API = {
  // 地图信息相关接口
  TOPICS: `${BASE_URL}/mapinfo/topics`,
  MAPS_BY_GROUP: `${BASE_URL}/mapinfo/maps/`,
  MAP_DETAIL: `${BASE_URL}/mapinfo/map/`,
  ALL_MAPS: `${BASE_URL}/mapinfo/maps`,
  
  // GeoServer WMS服务地址
  WMS_URL: `${GEOSERVER_CONFIG.BASE_URL}/${GEOSERVER_CONFIG.WORKSPACE}/wms`
};