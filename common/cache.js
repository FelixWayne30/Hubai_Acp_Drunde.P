class ImageCache {
  constructor() {
    this.cache = new Map();
    this.currentTopicId = null;
  }

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
   * 存储地图图片URL
   * @param {string} title 地图标题
   * @param {string} imageUrl 图片URL
   * @param {object} mapInfo 地图基础信息
   */
  setImage(title, imageUrl, mapInfo = {}) {
    if (!title || !imageUrl) {
      console.warn('缓存管理：title或imageUrl为空，跳过缓存');
      return;
    }

    const cacheData = {
      url: imageUrl,
      mapInfo: mapInfo,
      timestamp: Date.now(),
      topicId: this.currentTopicId
    };

    this.cache.set(title, cacheData);
    console.log(`缓存管理：已缓存地图 ${title} 的图片`);
    console.log('当前缓存大小:', this.cache.size);
  }

  /**
   * 获取地图图片URL
   * @param {string} title 地图标题
   * @returns {string|null} 缓存的图片URL或null
   */
  getImage(title) {
    if (!title) {
      console.warn('缓存管理：title为空');
      return null;
    }

    const cacheData = this.cache.get(title);
    if (cacheData) {
      console.log(`缓存管理：命中缓存，地图标题: ${title}`);
      console.log('缓存的URL:', cacheData.url);
      return cacheData.url;
    }

    console.log(`缓存管理：未命中缓存，地图标题: ${title}`);
    return null;
  }

  hasImage(title) {
    return this.cache.has(title);
  }

  /**
   * 获取缓存的地图信息
   * @param {string} title 地图标题
   * @returns {object|null}
   */
  getMapInfo(title) {
    const cacheData = this.cache.get(title);
    return cacheData ? cacheData.mapInfo : null;
  }

  clear() {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`缓存管理：已清空 ${size} 个缓存项`);
  }

  getStats() {
    return {
      size: this.cache.size,
      currentTopicId: this.currentTopicId,
      titles: Array.from(this.cache.keys())
    };
  }

  clearExpired(maxAge = 30 * 60 * 1000) {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [title, cacheData] of this.cache.entries()) {
      if (now - cacheData.timestamp > maxAge) {
        this.cache.delete(title);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`缓存管理：清理了 ${cleanedCount} 个过期缓存项`);
    }
  }
}

const imageCache = new ImageCache();

export default imageCache;