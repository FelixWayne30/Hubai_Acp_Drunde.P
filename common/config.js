import { envConfig } from '../env.config.js';
// API路径常量
export const API = {
  // 用户相关API
  USER_LOGIN: `${envConfig.API_BASE_URL}/user/wechatLogin`,
  COMMENT_ADD: `${envConfig.API_BASE_URL}/comment/addcomment`, 
  COMMENT_LIST: `${envConfig.API_BASE_URL}/comment/comments`,
  DOWNLOAD_ADD_REQUEST: `${envConfig.API_BASE_URL}/download/addRequest`,
 
  // 目录相关API
  CATALOGS: `${envConfig.API_BASE_URL}/catalogs`,
  
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
  MAPS_BY_GROUP: `${envConfig.API_BASE_URL}/mapinfo/getMapsByTopic`,
  MAP_DETAIL: `${envConfig.API_BASE_URL}/mapinfo/map/`,
  ALL_MAPS: `${envConfig.API_BASE_URL}/mapinfo/maps`,
  SEARCH: `${envConfig.API_BASE_URL}/mapinfo/search`, 
  SEARCH_SUGGESTIONS: `${envConfig.API_BASE_URL}/mapinfo/search-suggestions`,
  BANNER_MAPS: `${envConfig.API_BASE_URL}/mapinfo/bannerMaps`,
  GET_MAP_TOPIC: `${envConfig.API_BASE_URL}/mapinfo/getTopicByMapId/`, 
  SUBITEM_BOUNDS: `${envConfig.API_BASE_URL}/mapinfo/subitem/bounds/`,
  
  // 交互相关API
  COLLECTION_TOGGLE: `${envConfig.API_BASE_URL}/interaction/collection/toggle`,
  COLLECTION_CHECK: `${envConfig.API_BASE_URL}/interaction/collection/check`,
  COLLECTION_LIST: `${envConfig.API_BASE_URL}/interaction/collection/list`,
  LIKE_TOGGLE: `${envConfig.API_BASE_URL}/interaction/like/toggle`,
  LIKE_CHECK: `${envConfig.API_BASE_URL}/interaction/like/check`,

  // 地图图片API
  ORIGIN_MAP: `${envConfig.API_BASE_URL}/image/`,
  THUMBNAIL_MAP: `${envConfig.API_BASE_URL}/subimage/`,

  // 风格迁移API
  STYLETRANSFORM: `${envConfig.API_BASE_URL}/styletransfer/transform`
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

export function errorLog(message, error = null) {
  if (APP_CONFIG.LOG_LEVEL === 'debug' || APP_CONFIG.LOG_LEVEL === 'info' || APP_CONFIG.LOG_LEVEL === 'error') {
    console.error(`[ERROR] ${message}`, error);
  }
}

// 导出环境配置供其他模块使用
export { envConfig };