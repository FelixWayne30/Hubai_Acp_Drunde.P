// common/config.js - 统一配置管理
import { envConfig } from '../env.config.js';

// GeoServer配置
export const GEOSERVER_CONFIG = {
  BASE_URL: envConfig.GEOSERVER_BASE_URL,
  WORKSPACE: 'hubei'
};

// API路径常量
export const API = {


  TOPICS: `${envConfig.API_BASE_URL}/mapinfo/topics`,
  MAPS_BY_GROUP: `${envConfig.API_BASE_URL}/mapinfo/maps/`,
  MAP_DETAIL: `${envConfig.API_BASE_URL}/mapinfo/map/`,
  ALL_MAPS: `${envConfig.API_BASE_URL}/mapinfo/maps`,
  SEARCH: `${envConfig.API_BASE_URL || 'http://localhost:8080'}/mapinfo/search`,
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
  MAP_VIEWER_PATH: '/static/map-viewer.html'
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