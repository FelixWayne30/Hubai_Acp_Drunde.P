import { GEOSERVER_CONFIG, API } from './config.js'

/**
 * 生成地图缩略图URL
 * @param {string} mapId - 地图ID
 * @param {number} width - 地图原始宽度
 * @param {number} height - 地图原始高度
 * @param {number} thumbnailWidth - 缩略图宽度，默认768
 * @param {number} thumbnailHeight - 缩略图高度，默认556
 * @returns {string} WMS缩略图URL
 */
export function generateThumbnailUrl(mapId, width = 1, height = 1, thumbnailWidth = 768, thumbnailHeight = 556) {
  if (!mapId) {
    console.warn('mapId为空，返回默认占位图');
    return '/static/placeholder.png';
  }
  
  const baseUrl = API.WMS_URL;
  const aspectRatio = height / width;
  
  const params = new URLSearchParams({
    SERVICE: 'WMS',
    VERSION: '1.1.1',
    REQUEST: 'GetMap',
    FORMAT: 'image/png',
    TRANSPARENT: 'true',
    LAYERS: `${GEOSERVER_CONFIG.WORKSPACE}:${mapId}`,
    STYLES: '',
    SRS: 'EPSG:4326',
    BBOX: `0,0,1,${aspectRatio}`,
    WIDTH: thumbnailWidth.toString(),
    HEIGHT: thumbnailHeight.toString(),
  });
  
  const url = `${baseUrl}?${params.toString()}`;
  console.log('生成缩略图URL:', url);
  return url;
}

/**
 * 生成地图完整图片URL
 * @param {string} mapId - 地图ID  
 * @param {number} width - 地图原始宽度
 * @param {number} height - 地图原始高度
 * @returns {string} WMS完整图片URL
 */
export function generateFullImageUrl(mapId, width = 6213, height = 4500) {
  if (!mapId) {
    console.warn('mapId为空，返回默认占位图');
    return '/static/placeholder.png';  
  }
  
  const baseUrl = API.WMS_URL;
  const aspectRatio = height / width;
  
  const params = new URLSearchParams({
    SERVICE: 'WMS',
    VERSION: '1.1.1', 
    REQUEST: 'GetMap',
    FORMAT: 'image/png',
    TRANSPARENT: 'true',
    LAYERS: `${GEOSERVER_CONFIG.WORKSPACE}:${mapId}`,
    STYLES: '',
    SRS: 'EPSG:4326',
    BBOX: `0,0,1,${aspectRatio}`,
    WIDTH: width.toString(),
    HEIGHT: height.toString(),
  });
  
  const url = `${baseUrl}?${params.toString()}`;
  console.log('生成完整图片URL:', url);
  return url;
}