/**
 * 地图缩略图缓存管理器
 */
class ThumbnailCache {
  constructor() {
    this.cache = new Map();
    this.currentTopicId = null;
  }

  /**
   * 设置当前专题ID
   * @param {string} topicId 
   */
  setCurrentTopic(topicId) {
    console.log('缓存管理：设置当前专题ID:', topicId);
    // 如果切换了专题，清空之前的缓存
    if (this.currentTopicId && this.currentTopicId !== topicId) {
      console.log('缓存管理：检测到专题切换，清空缓存');
      this.clear();
    }
    this.currentTopicId = topicId;
  }

  /**
   * 存储地图缩略图URL
   * @param {string} mapId 地图ID
   * @param {string} thumbnailUrl 缩略图URL
   * @param {object} mapInfo 地图基础信息
   */
  setThumbnail(mapId, thumbnailUrl, mapInfo = {}) {
    if (!mapId || !thumbnailUrl) {
      console.warn('缓存管理：mapId或thumbnailUrl为空，跳过缓存');
      return;
    }

    const cacheData = {
      url: thumbnailUrl,
      mapInfo: mapInfo,
      timestamp: Date.now(),
      topicId: this.currentTopicId
    };

    this.cache.set(mapId, cacheData);
    console.log(`缓存管理：已缓存地图 ${mapId} 的缩略图`);
    console.log('当前缓存大小:', this.cache.size);
  }

  /**
   * 获取地图缩略图URL
   * @param {string} mapId 地图ID
   * @returns {string|null} 缓存的缩略图URL或null
   */
  getThumbnail(mapId) {
    if (!mapId) {
      console.warn('缓存管理：mapId为空');
      return null;
    }

    const cacheData = this.cache.get(mapId);
    if (cacheData) {
      console.log(`缓存管理：命中缓存，地图ID: ${mapId}`);
      console.log('缓存的URL:', cacheData.url);
      return cacheData.url;
    }

    console.log(`缓存管理：未命中缓存，地图ID: ${mapId}`);
    return null;
  }

  /**
   * 检查是否有缓存
   * @param {string} mapId 地图ID
   * @returns {boolean}
   */
  hasThumbnail(mapId) {
    return this.cache.has(mapId);
  }

  /**
   * 获取缓存的地图信息
   * @param {string} mapId 地图ID
   * @returns {object|null}
   */
  getMapInfo(mapId) {
    const cacheData = this.cache.get(mapId);
    return cacheData ? cacheData.mapInfo : null;
  }

  /**
   * 清空所有缓存
   */
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`缓存管理：已清空 ${size} 个缓存项`);
  }

  /**
   * 获取缓存统计信息
   * @returns {object}
   */
  getStats() {
    return {
      size: this.cache.size,
      currentTopicId: this.currentTopicId,
      mapIds: Array.from(this.cache.keys())
    };
  }

  /**
   * 清理过期缓存（可选，用于内存管理）
   * @param {number} maxAge 最大缓存时间（毫秒），默认30分钟
   */
  clearExpired(maxAge = 30 * 60 * 1000) {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [mapId, cacheData] of this.cache.entries()) {
      if (now - cacheData.timestamp > maxAge) {
        this.cache.delete(mapId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`缓存管理：清理了 ${cleanedCount} 个过期缓存项`);
    }
  }
}

// 创建全局缓存实例
const thumbnailCache = new ThumbnailCache();

export default thumbnailCache;