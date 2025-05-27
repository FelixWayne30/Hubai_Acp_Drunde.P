/**
 * 统一预加载管理器
 * 激进策略：一次性预加载整个图组
 */
import { generateFullImageUrl } from './utils.js'

class UnifiedPreloader {
  constructor() {
    this.cache = new Map(); // 图片缓存
    this.loadingTasks = new Map(); // 正在加载的任务
    this.isPreloading = false;
    this.currentTopicId = null;
    this.preloadProgress = {
      total: 0,
      completed: 0,
      failed: 0
    };
  }

  /**
   * 激进预加载：一次性加载整个图组
   * @param {Array} allMaps 所有地图数据
   * @param {number} currentIndex 当前地图索引
   * @param {string} topicId 专题ID
   */
  async startAggressivePreload(allMaps, currentIndex, topicId) {
    if (this.isPreloading && this.currentTopicId === topicId) {
      console.log('预加载已在进行中，跳过重复启动');
      return;
    }

    console.log('=== 启动激进预加载策略 ===');
    console.log(`图组总数: ${allMaps.length}`);
    console.log(`当前索引: ${currentIndex}`);
    console.log(`专题ID: ${topicId}`);

    this.isPreloading = true;
    this.currentTopicId = topicId;
    this.preloadProgress = {
      total: allMaps.length,
      completed: 0,
      failed: 0
    };

    // 构建预加载队列：当前图 + 后续图 + 前置图
    const preloadQueue = this.buildPreloadQueue(allMaps, currentIndex);
    
    console.log(`预加载队列构建完成，共${preloadQueue.length}个任务`);
    
    // 开始预加载
    await this.executePreloadQueue(preloadQueue);
    
    console.log('=== 激进预加载完成 ===');
    console.log(`成功: ${this.preloadProgress.completed}, 失败: ${this.preloadProgress.failed}`);
  }

  /**
   * 构建预加载队列
   * 优先级：当前图 → 下一张 → 上一张 → 继续向后 → 继续向前
   */
  buildPreloadQueue(allMaps, currentIndex) {
    const queue = [];
    
    // 1. 当前图（最高优先级）
    if (allMaps[currentIndex]) {
      queue.push({
        map: allMaps[currentIndex],
        priority: 100,
        reason: '当前图'
      });
    }

    // 2. 交替向前向后添加
    let forward = currentIndex + 1;
    let backward = currentIndex - 1;
    let priority = 90;

    while (forward < allMaps.length || backward >= 0) {
      // 先添加向后的图
      if (forward < allMaps.length) {
        queue.push({
          map: allMaps[forward],
          priority: priority,
          reason: `后${forward - currentIndex}张`
        });
        forward++;
      }

      // 再添加向前的图
      if (backward >= 0) {
        queue.push({
          map: allMaps[backward],
          priority: priority - 1,
          reason: `前${currentIndex - backward}张`
        });
        backward--;
      }

      priority = Math.max(priority - 2, 10); // 逐渐降低优先级
    }

    return queue;
  }

  /**
   * 执行预加载队列
   */
  async executePreloadQueue(queue) {
    console.log('开始执行预加载队列');
    
    // 并发控制：同时预加载3个图片
    const concurrentLimit = 3;
    const chunks = this.chunkArray(queue, concurrentLimit);
    
    for (const chunk of chunks) {
      const promises = chunk.map(item => this.preloadSingleMap(item));
      await Promise.allSettled(promises);
      
      // 每批次完成后输出进度
      console.log(`预加载进度: ${this.preloadProgress.completed}/${this.preloadProgress.total}`);
    }
  }

  /**
   * 将数组分块
   */
  chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * 预加载单个地图
   */
  async preloadSingleMap(item) {
    const { map, priority, reason } = item;
    const mapId = map.id;

    // 检查是否已缓存
    if (this.cache.has(mapId)) {
      console.log(`跳过已缓存: ${map.title}`);
      this.preloadProgress.completed++;
      return;
    }

    // 检查是否正在加载
    if (this.loadingTasks.has(mapId)) {
      console.log(`等待加载中: ${map.title}`);
      return await this.loadingTasks.get(mapId);
    }

    console.log(`开始预加载: ${map.title} (${reason}, 优先级: ${priority})`);

    const loadPromise = this.loadMapImage(map);
    this.loadingTasks.set(mapId, loadPromise);

    try {
      const result = await loadPromise;
      this.preloadProgress.completed++;
      console.log(`预加载成功: ${map.title}`);
      return result;
    } catch (error) {
      this.preloadProgress.failed++;
      console.error(`预加载失败: ${map.title}`, error);
    } finally {
      this.loadingTasks.delete(mapId);
    }
  }

  /**
   * 加载地图图片
   */
  async loadMapImage(map) {
    const imageUrl = generateFullImageUrl(map.id, map.width, map.height);
    
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const cacheData = {
      url: objectUrl,
      blob: blob,
      timestamp: Date.now(),
      mapId: map.id,
      mapTitle: map.title
    };

    this.cache.set(map.id, cacheData);
    return cacheData;
  }

  /**
   * 获取缓存的图片
   */
  getCachedImage(mapId) {
    const cached = this.cache.get(mapId);
    if (cached) {
      console.log(`缓存命中: ${cached.mapTitle}`);
      return cached;
    }
    console.log(`缓存未命中: ${mapId}`);
    return null;
  }

  /**
   * 检查是否已缓存
   */
  isCached(mapId) {
    return this.cache.has(mapId);
  }

  /**
   * 获取预加载进度
   */
  getProgress() {
    return {
      ...this.preloadProgress,
      percentage: this.preloadProgress.total > 0 
        ? Math.round((this.preloadProgress.completed / this.preloadProgress.total) * 100)
        : 0
    };
  }

  /**
   * 获取缓存统计
   */
  getStats() {
    return {
      cached: this.cache.size,
      loading: this.loadingTasks.size,
      progress: this.getProgress(),
      isPreloading: this.isPreloading
    };
  }

  /**
   * 清理过期缓存
   */
  cleanExpiredCache(maxAge = 30 * 60 * 1000) { // 30分钟
    const now = Date.now();
    let cleanedCount = 0;

    for (const [mapId, cached] of this.cache) {
      if (now - cached.timestamp > maxAge) {
        URL.revokeObjectURL(cached.url);
        this.cache.delete(mapId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`清理过期缓存: ${cleanedCount}个`);
    }
  }

  /**
   * 清空所有缓存
   */
  clearAllCache() {
    console.log(`清空所有缓存: ${this.cache.size}个`);
    
    for (const [mapId, cached] of this.cache) {
      URL.revokeObjectURL(cached.url);
    }
    
    this.cache.clear();
    this.loadingTasks.clear();
    this.isPreloading = false;
    this.currentTopicId = null;
  }

  /**
   * 切换专题时重置
   */
  switchTopic(newTopicId) {
    if (this.currentTopicId !== newTopicId) {
      console.log(`切换专题: ${this.currentTopicId} → ${newTopicId}`);
      this.clearAllCache();
      this.currentTopicId = newTopicId;
    }
  }
}

// 单实例WebView管理器
class SingleWebViewManager {
  constructor() {
    this.isInitialized = false;
    this.currentUrl = '';
  }

  /**
   * 初始化单个WebView实例
   */
  init() {
    if (this.isInitialized) {
      console.log('WebView已初始化，跳过重复初始化');
      return;
    }
    
    console.log('初始化单个WebView实例');
    this.isInitialized = true;
  }

  /**
   * 更新WebView URL
   */
  updateUrl(newUrl) {
    if (this.currentUrl !== newUrl) {
      console.log('更新WebView URL');
      this.currentUrl = newUrl;
      return newUrl;
    }
    return this.currentUrl;
  }

  /**
   * 获取状态
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      currentUrl: this.currentUrl
    };
  }

  /**
   * 重置WebView
   */
  reset() {
    console.log('重置WebView实例');
    this.isInitialized = false;
    this.currentUrl = '';
  }
}

// 创建全局实例
const preloader = new UnifiedPreloader();
const webViewManager = new SingleWebViewManager();

export { preloader, webViewManager };