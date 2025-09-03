import { API } from '@/common/config.js';

class CacheManager {
    constructor() {
        // 内存缓存
        this.memoryCache = new Map();
        this.currentTopicId = null;

        // 缓存配置
        this.config = {
            refreshInterval: 5 * 60 * 1000, // 5分钟自动刷新
            maxMemoryItems: 100, // 内存缓存最大数量
            keys: {
                maps: 'maps',
                catalogs: 'catalogs',
                thumbnails: 'thumbnails'
            }
        };

        // 刷新定时器
        this.refreshTimer = null;
    }

    // 初始化缓存（应用启动时调用）
    async initialize() {
        console.log('[缓存管理] 开始初始化...');

        try {
            // 并行加载所有数据
            await Promise.all([
                this.loadMaps(),
                this.loadCatalogs()
            ]);

            // 启动自动刷新
            this.startAutoRefresh();

            console.log('[缓存管理] 初始化完成');
            return true;
        } catch (error) {
            console.error('[缓存管理] 初始化失败:', error);
            return false;
        }
    }

    // 加载地图数据
    loadMaps() {
        return new Promise((resolve, reject) => {
            uni.request({
                url: API.ALL_MAPS,
                success: (res) => {
                    if (res.statusCode === 200 && res.data.code === 200) {
                        uni.setStorage({
                            key: this.config.keys.maps,
                            data: res.data.data,
                            success: () => {
                                console.log('[缓存管理] 地图数据已缓存');
                                resolve(res.data.data);
                            },
                            fail: reject
                        });
                    } else {
                        reject(new Error('获取地图数据失败'));
                    }
                },
                fail: reject
            });
        });
    }

    // 加载目录数据
    loadCatalogs() {
        return new Promise((resolve, reject) => {
            uni.request({
                url: API.CATALOGS,
                success: (res) => {
                    if (res.statusCode === 200 && res.data.code === 200) {
                        uni.setStorage({
                            key: this.config.keys.catalogs,
                            data: res.data.data,
                            success: () => {
                                console.log('[缓存管理] 目录数据已缓存');
                                resolve(res.data.data);
                            },
                            fail: reject
                        });
                    } else {
                        reject(new Error('获取目录数据失败'));
                    }
                },
                fail: reject
            });
        });
    }

    // 获取地图数据
    async getMaps() {
        return new Promise((resolve, reject) => {
            uni.getStorage({
                key: this.config.keys.maps,
                success: (res) => resolve(res.data),
                fail: async () => {
                    // 缓存不存在，重新加载
                    console.log('[缓存管理] 本地缓存不存在，重新加载地图数据');
                    const data = await this.loadMaps();
                    resolve(data);
                }
            });
        });
    }

    // 获取目录数据
    async getCatalogs() {
        return new Promise((resolve, reject) => {
            uni.getStorage({
                key: this.config.keys.catalogs,
                success: (res) => resolve(res.data),
                fail: async () => {
                    console.log('[缓存管理] 本地缓存不存在，重新加载目录数据');
                    const data = await this.loadCatalogs();
                    resolve(data);
                }
            });
        });
    }

    // 设置/获取缩略图URL（内存缓存）
    setThumbnail(title, url, mapInfo = {}) {
        if (!title || !url) return;

        const cacheData = {
            url: url,
            mapInfo: mapInfo,
            timestamp: Date.now(),
            topicId: this.currentTopicId
        };

        this.memoryCache.set(`thumb_${title}`, cacheData);
        console.log(`[缓存管理] 缓存缩略图: ${title}`);

        // 控制内存缓存大小
        if (this.memoryCache.size > this.config.maxMemoryItems) {
            this.cleanOldestMemoryCache();
        }
    }

    getThumbnail(title) {
        const cacheData = this.memoryCache.get(`thumb_${title}`);
        return cacheData ? cacheData.url : null;
    }

    // 设置当前专题
    setCurrentTopic(topicId) {
        if (this.currentTopicId !== topicId) {
            console.log('[缓存管理] 切换专题，清理内存缓存');
            this.clearMemoryCache();
            this.currentTopicId = topicId;
        }
    }

    // 清理最旧的内存缓存
    cleanOldestMemoryCache() {
        const entries = Array.from(this.memoryCache.entries());
        entries.sort((a, b) => (a[1].timestamp || 0) - (b[1].timestamp || 0));

        const toRemove = entries.slice(0, 10); // 移除最旧的10个
        toRemove.forEach(([key]) => this.memoryCache.delete(key));
    }

    // 清理内存缓存
    clearMemoryCache() {
        const size = this.memoryCache.size;
        this.memoryCache.clear();
        console.log(`[缓存管理] 已清理 ${size} 个内存缓存项`);
    }

    // 清理所有缓存并重新加载（用户手动触发）
    async clearAndReload() {
        console.log('[缓存管理] 开始清理并重新加载所有缓存...');

        // 显示加载提示
        uni.showLoading({
            title: '正在刷新数据...',
            mask: true
        });

        try {
            // 1. 清理内存缓存
            this.clearMemoryCache();

            // 2. 清理本地存储
            await this.clearLocalStorage();

            // 3. 重新加载数据
            await Promise.all([
                this.loadMaps(),
                this.loadCatalogs()
            ]);

            uni.hideLoading();
            uni.showToast({
                title: '缓存已更新',
                icon: 'success'
            });

            console.log('[缓存管理] 缓存清理并重新加载完成');
            return true;
        } catch (error) {
            console.error('[缓存管理] 清理重载失败:', error);
            uni.hideLoading();
            uni.showToast({
                title: '刷新失败',
                icon: 'none'
            });
            return false;
        }
    }

    // 清理本地存储
    clearLocalStorage() {
        return new Promise((resolve) => {
            let completed = 0;
            const keys = Object.values(this.config.keys);

            keys.forEach(key => {
                uni.removeStorage({
                    key,
                    complete: () => {
                        completed++;
                        if (completed === keys.length) {
                            resolve();
                        }
                    }
                });
            });
        });
    }

    // 启动自动刷新
    startAutoRefresh() {
        this.stopAutoRefresh();
        this.refreshTimer = setInterval(() => {
            console.log('[缓存管理] 执行自动刷新');
            this.clearAndReload();
        }, this.config.refreshInterval);
    }

    // 停止自动刷新
    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    // 获取缓存统计信息
    async getStats() {
        const storageInfo = await uni.getStorageInfo();

        return {
            memoryItems: this.memoryCache.size,
            storageSize: storageInfo.currentSize,
            storageLimit: storageInfo.limitSize,
            currentTopicId: this.currentTopicId
        };
    }

    // 销毁（应用关闭时调用）
    destroy() {
        this.stopAutoRefresh();
        this.clearMemoryCache();
        console.log('[缓存管理] 已销毁');
    }
}

// 导出单例
const cacheManager = new CacheManager();
export default cacheManager;