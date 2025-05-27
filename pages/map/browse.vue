<!-- pages/map/browse.vue -->
<template>
  <view class="container">
    <!-- 美观的加载指示器 -->
    <view class="loading-overlay" v-if="isLoading">
      <view class="loading-content">
        <view class="loading-spinner"></view>
        <view class="loading-text">{{ loadingText }}</view>
        <view class="loading-progress" v-if="showProgress">
          <view class="progress-track">
            <view class="progress-bar" :style="{ width: progressWidth + '%' }"></view>
          </view>
          <view class="progress-text">{{ progressWidth }}%</view>
        </view>
      </view>
    </view>
    
    <web-view 
      :src="webViewUrl" 
      @message="handleMessage"
      :webview-styles="webviewStyles"
    ></web-view>
  </view>
</template>

<script>
import { API } from '@/common/config.js'
import { webViewManager } from '@/common/preload.js'

export default {
  data() {
    return {
      topicId: '',
      mapId: '',
      mapIndex: 0,
      webViewUrl: '',
      allMaps: [],
      isLoading: true,
      loadingText: '准备加载地图...',
      showProgress: false,
      progressWidth: 0,
      webviewStyles: {
        progress: false // 隐藏默认进度条
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
      this.isLoading = false;
      uni.showToast({
        title: '参数错误',
        icon: 'none'
      });
    }
  },
  
  methods: {
    // 获取当前专题下的所有地图
    getAllMapsInTopic() {
      this.loadingText = '获取地图数据...';
      
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
              width: item.width || 6000, // 设置默认值
              height: item.height || 4000, // 设置默认值
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
            
            this.loadingText = '初始化地图浏览器...';
            this.initWebView();
          } else {
            console.error('获取地图数据失败:', res.data);
            uni.showToast({
              title: '获取地图数据失败',
              icon: 'none'
            });
            this.isLoading = false;
          }
        },
        fail: (err) => {
          console.error('网络请求失败:', err);
          uni.showToast({
            title: '网络错误，请稍后重试',
            icon: 'none'
          });
          this.isLoading = false;
        }
      });
    },
    
    // 初始化WebView
    initWebView() {
      // 预热WebView
      webViewManager.init();
      
      // 构建WebView数据
      const webViewData = {
        currentMap: this.allMaps[this.mapIndex],
        allMaps: this.allMaps,
        currentIndex: this.mapIndex,
        topicId: this.topicId
      };
      
      const encodedData = encodeURIComponent(JSON.stringify(webViewData));
      const newUrl = `http://localhost:2180/static/map-viewer.html?data=${encodedData}`;
      
      // 更新WebView URL
      this.webViewUrl = webViewManager.updateUrl(newUrl);
      
      console.log('WebView初始化完成:', this.webViewUrl);
    },
    
    // 处理WebView消息
    handleMessage(event) {
      console.log('收到WebView消息:', event);
      
      try {
        const data = event.detail && event.detail.data;
        if (!data) return;
        
        console.log('处理消息:', data.action);
        
        switch (data.action) {
          case 'viewDetail':
            this.handleViewDetail(data.mapId);
            break;
            
          case 'downloadRequest':
            this.handleDownloadRequest(data);
            break;
            
          case 'loadingStatus':
            // 处理加载状态更新
            this.updateLoadingStatus(data);
            break;
            
          case 'loadingProgress':
            // 处理加载进度更新
            this.updateLoadingProgress(data.progress);
            break;
            
          default:
            console.log('未处理的消息类型:', data.action);
        }
        
      } catch (e) {
        console.error('处理消息时出错:', e);
      }
    },
    
    // 更新加载状态
    updateLoadingStatus(data) {
      console.log('更新加载状态:', data);
      
      if (data.status === 'start') {
        this.isLoading = true;
        this.loadingText = data.message || '加载中...';
        
        if (data.showProgress) {
          this.showProgress = true;
          this.progressWidth = data.progress || 0;
        }
      } 
      else if (data.status === 'progress') {
        this.showProgress = true;
        this.progressWidth = data.progress || 0;
      }
      else if (data.status === 'complete') {
        // 完成后延迟关闭加载提示，给用户更好的视觉体验
        setTimeout(() => {
          this.isLoading = false;
          this.showProgress = false;
        }, 500);
      }
      else if (data.status === 'error') {
        this.loadingText = data.message || '加载失败';
        // 错误状态保持显示，让用户看到
        setTimeout(() => {
          this.isLoading = false;
          this.showProgress = false;
        }, 2000);
      }
    },
    
    // 更新加载进度
    updateLoadingProgress(progress) {
      if (typeof progress === 'number') {
        this.progressWidth = Math.min(Math.round(progress * 100), 100);
      }
    },
    
    // 处理查看详情
    handleViewDetail(mapId) {
      console.log('跳转到详情页', mapId);
      
      // 使用实际接收到的mapId
      const targetMapId = mapId || this.mapId;
      
      setTimeout(() => {
        uni.navigateTo({
          url: `/pages/map/detail?id=${targetMapId}&from=browse`,
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
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.loading-content {
  text-align: center;
  padding: 40rpx;
  border-radius: 16rpx;
  background-color: #fff;
  box-shadow: 0 0 30rpx rgba(0, 0, 0, 0.1);
  width: 80%;
  max-width: 600rpx;
}

.loading-spinner {
  width: 80rpx;
  height: 80rpx;
  margin: 0 auto 30rpx;
  border: 6rpx solid rgba(46, 139, 87, 0.2);
  border-top: 6rpx solid #2E8B57;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 30rpx;
  font-weight: bold;
}

.loading-progress {
  margin-top: 20rpx;
}

.progress-track {
  height: 8rpx;
  background-color: #f0f0f0;
  border-radius: 4rpx;
  margin-bottom: 10rpx;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #2E8B57;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 24rpx;
  color: #666;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>