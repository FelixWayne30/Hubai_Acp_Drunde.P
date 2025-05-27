<template>
  <view class="container">
    <web-view 
      :src="webViewUrl" 
      @message="handleMessage"
      :webview-styles="webviewStyles"
    ></web-view>
  </view>
</template>

<script>
import { API } from '@/common/config.js'
import { preloader, webViewManager } from '@/common/preload.js'

export default {
  data() {
    return {
      topicId: '',
      mapId: '',
      mapIndex: 0,
      webViewUrl: '',
      allMaps: [],
      currentMapData: null,
      webviewStyles: {
        progress: false
      }
    }
  },
  onLoad(options) {
    this.topicId = options.topic_id || '';
    this.mapId = options.id || '';
    this.mapIndex = parseInt(options.index || '0');
    
    console.log('地图浏览页加载参数:', {
      topicId: this.topicId,
      mapId: this.mapId,
      mapIndex: this.mapIndex
    });
    
    if (this.mapId && this.topicId) {
      this.getAllMapsInTopic();
    } else {
      console.error('缺少必要参数');
    }
  },
  
  methods: {
    // 获取当前专题下的所有地图
    getAllMapsInTopic() {
      console.log('获取专题下所有地图');
      
      uni.showLoading({
        title: '准备中...'
      });
      
      uni.request({
        url: API.MAPS_BY_GROUP + this.topicId,
        method: 'GET',
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 200) {
            // 处理地图数据
            this.allMaps = res.data.data.map(item => ({
              id: item.map_id,
              title: item.title,
              description: item.description || '暂无描述',
              type: item.type,
              width: item.width,
              height: item.height,
              create_time: item.create_time
            }));
            
            console.log(`获取到${this.allMaps.length}个地图`);
            
            // 验证和修正当前地图索引
            if (this.mapIndex >= this.allMaps.length) {
              this.mapIndex = 0;
            }
            
            // 如果通过mapId进入，需要找到对应的索引
            if (this.mapId) {
              const foundIndex = this.allMaps.findIndex(map => map.id === this.mapId);
              if (foundIndex !== -1) {
                this.mapIndex = foundIndex;
              }
            }
            
            this.currentMapData = this.allMaps[this.mapIndex];
            console.log(`当前地图: ${this.currentMapData.title}, 索引: ${this.mapIndex}`);
            
            // 初始化WebView
            this.initWebView();
            
            // 如果预加载器还没开始预加载，在这里启动
            this.ensurePreloadStarted();
            
          } else {
            console.error('获取地图数据失败:', res.data);
            uni.showToast({
              title: '获取地图数据失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          console.error('网络请求失败:', err);
          uni.showToast({
            title: '网络错误，请稍后重试',
            icon: 'none'
          });
        },
        complete: () => {
          uni.hideLoading();
        }
      });
    },
    
    // 确保预加载已启动
    ensurePreloadStarted() {
      const stats = preloader.getStats();
      if (!stats.isPreloading && stats.cached === 0) {
        console.log('预加载器未启动，现在启动激进预加载');
        preloader.startAggressivePreload(this.allMaps, this.mapIndex, this.topicId);
      } else {
        console.log('预加载器已运行或已有缓存，跳过启动');
      }
    },
    
    // 初始化WebView
    initWebView() {
      if (!this.currentMapData) {
        console.error('当前地图数据为空');
        return;
      }
      
      console.log('初始化单个WebView实例');
      
      // 初始化单实例WebView管理器
      webViewManager.init();
      
      // 构建WebView数据
      const webViewData = {
        currentMap: this.currentMapData,
        allMaps: this.allMaps,
        currentIndex: this.mapIndex,
        topicId: this.topicId
      };
      
      const encodedData = encodeURIComponent(JSON.stringify(webViewData));
      const newUrl = `http://localhost:2180/static/map-viewer.html?data=${encodedData}`;
      
      // 更新WebView URL
      this.webViewUrl = webViewManager.updateUrl(newUrl);
      
      console.log('WebView初始化完成');
      console.log('WebView状态:', webViewManager.getStatus());
    },
    
    handleMessage(event) {
      console.log('收到WebView消息:', event);
      
      try {
        const data = event.detail && event.detail.data;
        if (!data) return;
        
        console.log('处理消息:', data.action);
        
        switch (data.action) {
          case 'viewDetail':
            this.handleViewDetail();
            break;
            
          case 'downloadRequest':
            this.handleDownloadRequest(data);
            break;
            
          default:
            console.log('未处理的消息类型:', data.action);
        }
        
      } catch (e) {
        console.error('处理消息时出错:', e);
      }
    },
    
    // 处理查看详情
    handleViewDetail() {
      console.log('跳转到详情页');
      
      setTimeout(() => {
        uni.navigateTo({
          url: `/pages/map/detail?id=${this.currentMapData.id}&from=browse`,
          success: () => {
            console.log('跳转成功');
          },
          fail: (err) => {
            console.error('跳转失败:', err);
          }
        });
      }, 100);
    },
    
    // 处理下载请求
    handleDownloadRequest(data) {
      console.log('处理下载请求:', data);
      
      uni.showLoading({
        title: '提交中...'
      });
      
      // 模拟API调用
      setTimeout(() => {
        uni.hideLoading();
        uni.showToast({
          title: '申请已提交',
          icon: 'success'
        });
      }, 1000);
    }
  }
}
</script>

<style>
.container {
  width: 100%;
  height: 100vh;
}
</style>