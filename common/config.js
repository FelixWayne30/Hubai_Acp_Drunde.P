// common/config.js - 统一配置管理
import { envConfig } from '../env.config.js';

// GeoServer配置
export const GEOSERVER_CONFIG = {
  BASE_URL: envConfig.GEOSERVER_BASE_URL,
  WORKSPACE: 'hubei'
};

// API路径常量
export const API = {
  // 用户相关API
  USER_LOGIN: `${envConfig.API_BASE_URL}/user/wechatLogin`,
  
  // 自定义列表相关API
  CUSTOM_LIST_GET: `${envConfig.API_BASE_URL}/customlist/list`,
  CUSTOM_LIST_DETAIL: `${envConfig.API_BASE_URL}/customlist/detail/`,
  CUSTOM_LIST_CREATE: `${envConfig.API_BASE_URL}/customlist/create`,
  CUSTOM_LIST_UPDATE: `${envConfig.API_BASE_URL}/customlist/update`,
  CUSTOM_LIST_DELETE: `${envConfig.API_BASE_URL}/customlist/delete`,
  CUSTOM_LIST_ADD_MAP: `${envConfig.API_BASE_URL}/customlist/addMap`,
  CUSTOM_LIST_REMOVE_MAP: `${envConfig.API_BASE_URL}/customlist/removeMap`,
  CUSTOM_LIST_ADD_MAPS: `${envConfig.API_BASE_URL}/customlist/addMaps`,
  CUSTOM_LIST_REMOVE_MAPS: `${envConfig.API_BASE_URL}/customlist/removeMaps`,
  CUSTOM_LIST_CHECK_MAP: `${envConfig.API_BASE_URL}/customlist/checkMap`,

  // 地图信息API
  TOPICS: `${envConfig.API_BASE_URL}/mapinfo/topics`,
  MAPS_BY_GROUP: `${envConfig.API_BASE_URL}/mapinfo/maps/`,
  MAP_DETAIL: `${envConfig.API_BASE_URL}/mapinfo/map/`,
  ALL_MAPS: `${envConfig.API_BASE_URL}/mapinfo/maps`,
  SEARCH: `${envConfig.API_BASE_URL || 'http://localhost:8080'}/mapinfo/search`,
  
  // 交互相关API
  COLLECTION_TOGGLE: `${envConfig.API_BASE_URL}/interaction/collection/toggle`,
  COLLECTION_CHECK: `${envConfig.API_BASE_URL}/interaction/collection/check`,
  COLLECTION_LIST: `${envConfig.API_BASE_URL}/interaction/collection/list`,
  LIKE_TOGGLE: `${envConfig.API_BASE_URL}/interaction/like/toggle`,
  LIKE_CHECK: `${envConfig.API_BASE_URL}/interaction/like/check`,
  
  // GeoServer WMS服务地址
  WMS_URL: `${GEOSERVER_CONFIG.BASE_URL}/${GEOSERVER_CONFIG.WORKSPACE}/wms`
};

// WebView相关配置
export const WEBVIEW_CONFIG = {
  BASE_URL: envConfig.WEBVIEW_BASE_URL,
  MAP_VIEWER_PATH: '/frontend/map-viewer.html'
};

// 应用配置
export const APP_CONFIG = {
  DEBUG: envConfig.DEBUG,
  LOG_LEVEL: envConfig.LOG_LEVEL
};

// 调试日志功能
export function debugLog(message, data = null) {
  if (APP_CONFIG.DEBUG) {
    console.log(`[DEBUG] ${message}`, data);
  }
}

// 错误日志功能
export function errorLog(message, error = null) {
  if (APP_CONFIG.LOG_LEVEL === 'debug' || APP_CONFIG.LOG_LEVEL === 'info' || APP_CONFIG.LOG_LEVEL === 'error') {
    console.error(`[ERROR] ${message}`, error);
  }
}

// 导出环境配置供其他模块使用
export { envConfig };