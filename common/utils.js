import { GEOSERVER_CONFIG, API } from './config.js'

/**
 * 手动构建查询字符串（小程序环境兼容）
 * @param {Object} params - 参数对象
 * @returns {string} 查询字符串
 */
function buildQueryString(params) {
  const queryParts = [];
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined) {
      queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  }
  return queryParts.join('&');
}

/**
 * 生成地图缩略图URL
 * @param {string} mapId - 地图ID
 * @param {number} width - 地图原始宽度
 * @param {number} height - 地图原始高度
 * @param {number} thumbnailWidth - 缩略图宽度，默认400
 * @param {number} thumbnailHeight - 缩略图高度，默认300
 * @returns {string} WMS缩略图URL
 */
export function generateThumbnailUrl(mapId, width = 6213, height = 4500, thumbnailWidth = 400, thumbnailHeight = 300) {
  console.log('=== 生成缩略图URL开始 ===');
  console.log('参数 - mapId:', mapId);
  console.log('参数 - width:', width);
  console.log('参数 - height:', height);
  
  if (!mapId) {
    console.warn('mapId为空，返回默认占位图');
    return '/static/placeholder.png';
  }
  
  const baseUrl = API.WMS_URL;
  console.log('WMS基础URL:', baseUrl);
  
  // 计算宽高比，避免除以0
  const aspectRatio = (height && width) ? (height / width) : 0.724;
  console.log('计算的宽高比:', aspectRatio);
  
  const layers = `${GEOSERVER_CONFIG.WORKSPACE}:${mapId}`;
  console.log('图层名称:', layers);
  
  // 使用手动构建查询字符串的方式（小程序兼容）
  const params = {
    SERVICE: 'WMS',
    VERSION: '1.1.1',
    REQUEST: 'GetMap',
    FORMAT: 'image/png',
    TRANSPARENT: 'true',
    LAYERS: layers,
    STYLES: '',
    SRS: 'EPSG:4326',
    BBOX: `0,0,1,${aspectRatio}`,
    WIDTH: thumbnailWidth.toString(),
    HEIGHT: thumbnailHeight.toString(),
  };
  
  console.log('WMS参数:', params);
  
  const queryString = buildQueryString(params);
  console.log('生成的查询字符串:', queryString);
  
  const finalUrl = `${baseUrl}?${queryString}`;
  console.log('最终生成的URL:', finalUrl);
  console.log('=== 生成缩略图URL结束 ===');
  
  return finalUrl;
}

/**
 * 生成地图完整图片URL
 * @param {string} mapId - 地图ID  
 * @param {number} width - 地图原始宽度
 * @param {number} height - 地图原始高度
 * @returns {string} WMS完整图片URL
 */
export function generateFullImageUrl(mapId, width = 6213, height = 4500) {
  console.log('=== 生成完整图片URL开始 ===');
  console.log('参数 - mapId:', mapId);
  
  if (!mapId) {
    console.warn('mapId为空，返回默认占位图');
    return '/static/placeholder.png';  
  }
  
  const baseUrl = API.WMS_URL;
  const aspectRatio = (height && width) ? (height / width) : 0.724;
  const layers = `${GEOSERVER_CONFIG.WORKSPACE}:${mapId}`;
  
  // 使用手动构建查询字符串的方式（小程序兼容）
  const params = {
    SERVICE: 'WMS',
    VERSION: '1.1.1', 
    REQUEST: 'GetMap',
    FORMAT: 'image/png',
    TRANSPARENT: 'true',
    LAYERS: layers,
    STYLES: '',
    SRS: 'EPSG:4326',
    BBOX: `0,0,1,${aspectRatio}`,
    WIDTH: width.toString(),
    HEIGHT: height.toString(),
  };
  
  const queryString = buildQueryString(params);
  const finalUrl = `${baseUrl}?${queryString}`;
  
  console.log('生成完整图片URL:', finalUrl);
  console.log('=== 生成完整图片URL结束 ===');
  
  return finalUrl;
}