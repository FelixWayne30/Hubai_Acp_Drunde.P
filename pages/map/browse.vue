<template>
  <view class="container">
    <!-- 加载指示器 -->
    <view class="loading-overlay" v-if="isLoading">
      <view class="loading-content">
        <view class="loading-spinner"></view>
        <view class="loading-text">{{ loadingText }}</view>
      </view>
    </view>
    
    <!-- 地图显示区域 -->
    <view class="map-display-area">
      <movable-area class="movable-area">
        <movable-view 
          class="movable-view"
          direction="all"
          :scale="true"
          :scale-min="0.5"
          :scale-max="3"
          :scale-value="scaleValue"
          @scale="onScale"
          @change="onChange"
        >
          <image 
            class="map-image"
            :src="currentMapUrl"
            mode="aspectFit"
            @load="onImageLoad"
            @error="onImageError"
            :show-menu-by-longpress="true"
          />
        </movable-view>
      </movable-area>
    </view>
    
    <!-- 底部工具栏 -->
    <view class="bottom-toolbar">
      <button 
        class="nav-btn" 
        :disabled="currentMapIndex === 0"
        @click="switchMap('prev')"
      >
        ‹ 上一张
      </button>
      
      <view class="center-info">
        <view class="map-title">{{ currentMap?.title || '加载中...' }}</view>
        <view class="map-counter">{{ currentMapIndex + 1 }} / {{ allMaps.length }}</view>
      </view>
      
      <button 
        class="nav-btn" 
        :disabled="currentMapIndex === allMaps.length - 1"
        @click="switchMap('next')"
      >
        下一张 ›
      </button>
      
      <button class="detail-btn" @click="viewDetail">详情</button>
      <button class="reset-btn" @click="resetScale">重置</button>
    </view>
  </view>
</template>

<script>
import { API } from '@/common/config.js'

export default {
  data() {
    return {
      topicId: '',
      mapId: '',
      currentMapIndex: 0,
      allMaps: [],
      currentMap: null,
      currentMapUrl: '',
      isLoading: true,
      loadingText: '加载地图数据...',
      
      // 缩放和移动相关
      scaleValue: 1,
      
      // 图片服务器配置
      imageBaseUrl: 'http://1.92.85.165:8088/image/'
    }
  },
  
  onLoad(options) {
    this.topicId = options.topic_id || '';
    this.mapId = options.id || '';
    this.currentMapIndex = parseInt(options.index || '0');
    
    console.log('地图浏览页加载参数:', {
      topicId: this.topicId,
      mapId: this.mapId,
      mapIndex: this.currentMapIndex
    });
    
    if (this.topicId) {
      this.loadMapsData();
    } else {
      this.showError('缺少专题ID参数');
    }
  },
  
  methods: {
    // 加载地图数据
    async loadMapsData() {
      try {
        this.isLoading = true;
        this.loadingText = '获取地图数据...';
        
        const res = await this.requestMapsData();
        
        if (res.statusCode === 200 && res.data.code === 200) {
          this.allMaps = res.data.data || [];
          
          // 如果有mapId，找到对应的索引
          if (this.mapId) {
            const foundIndex = this.allMaps.findIndex(map => map.map_id === this.mapId);
            if (foundIndex !== -1) {
              this.currentMapIndex = foundIndex;
            }
          }
          
          // 确保索引有效
          if (this.currentMapIndex >= this.allMaps.length) {
            this.currentMapIndex = 0;
          }
          
          this.loadCurrentMap();
        } else {
          this.showError('获取地图数据失败');
        }
      } catch (error) {
        console.error('加载地图数据失败:', error);
        this.showError('网络错误，请稍后重试');
      }
    },
    
    // 请求地图数据
    requestMapsData() {
      return new Promise((resolve, reject) => {
        uni.request({
          url: API.MAPS_BY_GROUP + this.topicId,
          method: 'GET',
          success: resolve,
          fail: reject
        });
      });
    },
    
    // 加载当前地图
    async loadCurrentMap() {
      if (!this.allMaps.length) {
        this.showError('没有可显示的地图');
        return;
      }
      
      this.currentMap = this.allMaps[this.currentMapIndex];
      if (!this.currentMap) {
        this.showError('地图数据错误');
        return;
      }
      
      try {
        this.isLoading = true;
        this.loadingText = `正在下载: ${this.currentMap.title}`;
        
        // 生成图片URL
        const imageUrl = this.generateImageUrl(this.currentMap.title);
        console.log('图片URL:', imageUrl);
        
        // 下载图片获取本地临时路径
        const tempFilePath = await this.loadImageWithAuth(imageUrl);
        
        // 设置本地临时路径给图片组件
        this.currentMapUrl = tempFilePath;
        
        console.log('当前地图信息:', {
          title: this.currentMap.title,
          originalUrl: imageUrl,
          localPath: tempFilePath,
          index: this.currentMapIndex
        });
        
        // 图片路径设置完成，等待图片组件加载
        this.loadingText = `加载图片: ${this.currentMap.title}`;
        
      } catch (error) {
        console.error('加载地图失败:', error);
        this.showError(`加载失败: ${error.message || '未知错误'}`);
      }
    },
    
    // 生成图片URL
    generateImageUrl(title) {
      if (!title) {
        console.error('地图标题为空');
        return '';
      }
      
      // 直接使用中文标题，不进行编码
      return `${this.imageBaseUrl}${title}.jpg`;
    },
    
    // 下载并加载图片
    async loadImageWithAuth(imageUrl) {
      try {
        console.log('开始下载图片:', imageUrl);
        
        // 使用uni.downloadFile下载图片，显式设置Authorization头
        const downloadResult = await new Promise((resolve, reject) => {
          uni.downloadFile({
            url: imageUrl,
            header: {
              'Authorization': 'Telecarto@501502511'
            },
            success: resolve,
            fail: reject
          });
        });
        
        if (downloadResult.statusCode === 200) {
          console.log('图片下载成功:', downloadResult.tempFilePath);
          return downloadResult.tempFilePath;
        } else {
          throw new Error(`下载失败，状态码: ${downloadResult.statusCode}`);
        }
      } catch (error) {
        console.error('图片下载失败:', error);
        throw error;
      }
    },
    
    // 图片加载成功
    onImageLoad() {
      console.log('图片显示成功');
      this.isLoading = false;
      this.resetScale();
    },
    
    // 图片加载失败
    onImageError(error) {
      console.error('图片显示失败:', error);
      this.showError('图片显示失败，请检查网络连接');
    },
    
    // 切换地图
    switchMap(direction) {
      let newIndex = this.currentMapIndex;
      
      if (direction === 'next' && this.currentMapIndex < this.allMaps.length - 1) {
        newIndex = this.currentMapIndex + 1;
      } else if (direction === 'prev' && this.currentMapIndex > 0) {
        newIndex = this.currentMapIndex - 1;
      } else {
        return;
      }
      
      this.currentMapIndex = newIndex;
      this.isLoading = true;
      this.loadCurrentMap();
    },
    
    // 查看详情
    viewDetail() {
      if (!this.currentMap) return;
      
      uni.navigateTo({
        url: `/pages/map/detail?id=${this.currentMap.map_id}&topic_id=${this.topicId}&from=browse`
      });
    },
    
    // 重置缩放
    resetScale() {
      this.scaleValue = 1;
    },
    
    // 缩放事件
    onScale(e) {
      console.log('缩放:', e.detail.scale);
    },
    
    // 移动事件
    onChange(e) {
      console.log('移动:', e.detail);
    },
    
    // 显示错误信息
    showError(message) {
      this.isLoading = false;
      this.loadingText = message;
      
      uni.showToast({
        title: message,
        icon: 'none',
        duration: 3000
      });
      
      // 3秒后隐藏错误提示
      setTimeout(() => {
        if (this.loadingText === message) {
          this.loadingText = '';
        }
      }, 3000);
    }
  }
}
</script>

<style>
.container {
  width: 100%;
  height: 100vh;
  position: relative;
  background-color: #f0f0f0;
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
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.map-display-area {
  width: 100%;
  height: calc(100vh - 120rpx);
  background-color: #fff;
  position: relative;
  z-index: 1;
}

.movable-area {
  width: 100%;
  height: 100%;
}

.movable-view {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.map-image {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
}

.bottom-toolbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10rpx);
  border-top: 1px solid #eee;
  padding: 20rpx 20rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10rpx;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.nav-btn {
  height: 64rpx;
  line-height: 64rpx;
  padding: 0 24rpx;
  font-size: 26rpx;
  border-radius: 32rpx;
  color: #7aa26f;
  border: 1px solid #7aa26f;
  background-color: #fff;
  text-align: center;
  min-width: 120rpx;
}

.nav-btn:disabled {
  color: #ccc;
  border-color: #eee;
  background-color: #f8f8f8;
}

.center-info {
  flex: 1;
  text-align: center;
  margin: 0 20rpx;
  min-width: 0;
}

.map-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 4rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.map-counter {
  font-size: 22rpx;
  color: #999;
}

.detail-btn, .reset-btn {
  height: 64rpx;
  line-height: 64rpx;
  padding: 0 20rpx;
  font-size: 24rpx;
  border-radius: 32rpx;
  text-align: center;
  min-width: 80rpx;
}

.detail-btn {
  background-color: #7aa26f;
  color: #fff;
  border: 1px solid #7aa26f;
}

.reset-btn {
  background-color: #fff;
  color: #7aa26f;
  border: 1px solid #7aa26f;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>