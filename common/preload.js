// common/preload.js
import thumbnailCache from '@/common/cache.js';

class SingleWebViewManager {
  constructor() {
    this.isInitialized = false;
    this.currentUrl = '';
  }

  init() {
    if (this.isInitialized) {
      console.log('WebView已初始化，跳过重复初始化');
      return;
    }
    
    // 使用简单的URL进行预热，不包含复杂数据
    const simpleUrl = 'http://localhost:2180/static/map-viewer.html?init=true';
    this.currentUrl = simpleUrl;
    this.isInitialized = true;
    console.log('WebView预热完成 (轻量模式)');
  }

  /**
   * 更新WebView URL
   * @param {object} data 需要传递的数据
   */
  generateViewerUrl(data) {
    // 只传递最基本信息：当前地图ID和专题ID
    const minimalData = {
      mapId: data.currentMap.id,
      topicId: data.topicId,
      mapIndex: data.currentIndex,
      totalMaps: data.allMaps.length
    };
    
    const encodedData = encodeURIComponent(JSON.stringify(minimalData));
    return `http://localhost:2180/static/map-viewer.html?data=${encodedData}`;
  }

  getStatus() {
    return {
      initialized: this.isInitialized,
      currentUrl: this.currentUrl
    };
  }

  reset() {
    console.log('重置WebView实例');
    this.isInitialized = false;
    this.currentUrl = '';
  }
}

const webViewManager = new SingleWebViewManager();

// 重新导出 thumbnailCache，确保其他组件可以使用
export { webViewManager, thumbnailCache };