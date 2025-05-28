// common/preload.js - WebView预加载管理
import thumbnailCache from '@/common/cache.js';
import { WEBVIEW_CONFIG, debugLog, envConfig } from '@/common/config.js';

class SingleWebViewManager {
  constructor() {
    this.isInitialized = false;
    this.currentUrl = '';
  }

  /**
   * 初始化WebView管理器
   * 执行预热操作以提升后续加载性能
   */
  init() {
    if (this.isInitialized) {
      debugLog('WebView已初始化，跳过重复初始化');
      return;
    }
    
    // 传递环境配置到预热URL
    const envParams = this.buildEnvParams();
    const simpleUrl = `${WEBVIEW_CONFIG.BASE_URL}${WEBVIEW_CONFIG.MAP_VIEWER_PATH}?init=true&${envParams}`;
    this.currentUrl = simpleUrl;
    this.isInitialized = true;
    debugLog('WebView预热完成 (轻量模式)', simpleUrl);
  }

  /**
   * 构建环境配置参数字符串
   * 将当前环境的配置信息编码为URL参数
   * @returns {string} URL参数字符串
   */
  buildEnvParams() {
    // 手动构建参数字符串，兼容小程序环境
    const params = [];
    
    if (envConfig.GEOSERVER_BASE_URL) {
      params.push(`geoserver_url=${encodeURIComponent(envConfig.GEOSERVER_BASE_URL)}`);
    }
    
    if (envConfig.API_BASE_URL) {
      params.push(`api_url=${encodeURIComponent(envConfig.API_BASE_URL)}`);
    }
    
    return params.join('&');
  }

  /**
   * 生成完整的地图查看器URL
   * 包含地图数据和环境配置信息
   * @param {Object} data 地图数据对象
   * @param {Object} data.currentMap 当前地图信息
   * @param {string} data.topicId 专题ID
   * @param {number} data.currentIndex 当前地图索引
   * @param {Array} data.allMaps 所有地图数据
   * @returns {string} 完整的WebView URL
   */
  generateViewerUrl(data) {
    // 构建最小化的地图数据，减少URL长度
    const minimalData = {
      mapId: data.currentMap.id,
      topicId: data.topicId,
      mapIndex: data.currentIndex,
      totalMaps: data.allMaps.length
    };
    
    // 编码地图数据
    const encodedData = encodeURIComponent(JSON.stringify(minimalData));
    
    // 构建环境配置参数
    const envParams = this.buildEnvParams();
    
    // 组装完整URL
    const fullUrl = `${WEBVIEW_CONFIG.BASE_URL}${WEBVIEW_CONFIG.MAP_VIEWER_PATH}?data=${encodedData}&${envParams}`;
    
    debugLog('生成WebView URL', {
      baseUrl: WEBVIEW_CONFIG.BASE_URL,
      mapId: data.currentMap.id,
      topicId: data.topicId,
      urlLength: fullUrl.length
    });
    
    return fullUrl;
  }

  /**
   * 获取WebView管理器当前状态
   * @returns {Object} 状态信息对象
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      currentUrl: this.currentUrl,
      baseUrl: WEBVIEW_CONFIG.BASE_URL,
      envConfig: {
        geoserverUrl: envConfig.GEOSERVER_BASE_URL,
        apiUrl: envConfig.API_BASE_URL
      }
    };
  }

  /**
   * 重置WebView管理器状态
   * 清除当前配置，强制重新初始化
   */
  reset() {
    debugLog('重置WebView实例');
    this.isInitialized = false;
    this.currentUrl = '';
  }

  /**
   * 验证环境配置完整性
   * 检查必要的配置项是否已正确设置
   * @returns {boolean} 配置是否有效
   */
  validateEnvConfig() {
    const isValid = !!(envConfig.GEOSERVER_BASE_URL && 
                      envConfig.API_BASE_URL && 
                      WEBVIEW_CONFIG.BASE_URL);
    
    if (!isValid) {
      debugLog('环境配置验证失败', {
        geoserverUrl: !!envConfig.GEOSERVER_BASE_URL,
        apiUrl: !!envConfig.API_BASE_URL,
        webviewUrl: !!WEBVIEW_CONFIG.BASE_URL
      });
    }
    
    return isValid;
  }

  /**
   * 生成预热URL
   * 用于WebView预加载，不包含具体地图数据
   * @returns {string} 预热URL
   */
  generatePrewarmUrl() {
    if (!this.validateEnvConfig()) {
      throw new Error('环境配置不完整，无法生成预热URL');
    }
    
    const envParams = this.buildEnvParams();
    return `${WEBVIEW_CONFIG.BASE_URL}${WEBVIEW_CONFIG.MAP_VIEWER_PATH}?init=true&${envParams}`;
  }

  /**
   * 检查URL是否过长
   * 防止URL超出浏览器限制
   * @param {string} url 待检查的URL
   * @returns {boolean} URL长度是否合理
   */
  isUrlLengthValid(url) {
    const maxLength = 2048; // 大多数浏览器支持的安全长度
    const isValid = url.length <= maxLength;
    
    if (!isValid) {
      debugLog('URL长度超出限制', {
        currentLength: url.length,
        maxLength: maxLength,
        url: url.substring(0, 100) + '...'
      });
    }
    
    return isValid;
  }
}

// 创建全局WebView管理器实例
const webViewManager = new SingleWebViewManager();

// 重新导出缩略图缓存管理器，确保其他组件可以正常使用
export { webViewManager, thumbnailCache };