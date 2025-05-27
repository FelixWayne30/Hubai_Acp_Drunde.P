// common/preload.js
import thumbnailCache from '@/common/cache.js';

/**
 * WebView 管理器
 * 仅负责WebView实例的预热和管理，不进行预加载
 */
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
      console.log('更新WebView URL:', newUrl);
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
const webViewManager = new SingleWebViewManager();

// 重新导出 thumbnailCache，确保其他组件可以使用
export { webViewManager, thumbnailCache };