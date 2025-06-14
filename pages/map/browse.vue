<template>
  <view class="container">
    <!-- 加载指示器 -->
    <view class="loading-overlay" v-if="isLoading">
      <view class="loading-content">
        <view class="loading-spinner"></view>
        <view class="loading-text">{{ loadingText }}</view>
      </view>
    </view>
    
    <!-- 顶部信息栏 -->
    <view class="top-header">
      <view class="map-info">
        <view class="map-title">{{ currentMap?.title || '加载中...' }}</view>
        <view class="map-counter">{{ currentMapIndex + 1 }} / {{ allMaps.length }}</view>
      </view>
    </view>
    
    <!-- 地图显示区域 -->
    <view class="map-display-area" 
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove" 
          @touchend="handleTouchEnd">
      <view class="map-container" 
            :style="mapTransformStyle">
        <image 
          class="map-image"
          :src="currentMapUrl"
          mode="aspectFit"
          @load="onImageLoad"
          @error="onImageError"
          :show-menu-by-longpress="false"
        />
      </view>
    </view>
    
    <!-- 底部控制栏 -->
    <view class="bottom-controls">
      <button 
        class="nav-btn prev-btn" 
        :disabled="currentMapIndex === 0"
        @click="switchMap('prev')"
      >
        <text class="nav-icon">‹</text>
      </button>
      
      <button class="detail-btn" @click="viewDetail">
        <text class="detail-text">查看详情</text>
      </button>
      
      <button 
        class="nav-btn next-btn" 
        :disabled="currentMapIndex === allMaps.length - 1"
        @click="switchMap('next')"
      >
        <text class="nav-icon">›</text>
      </button>
    </view>
  </view>
</template>

<script>
import { API } from '@/common/config.js'
import { generateImageUrl, loadImageWithAuth } from '@/common/utils.js'
import imageCache from '@/common/cache.js'

export default {
  data() {
    return {
      topicId: '',
      topic: '', // 专题名称
      mapId: '',
      currentMapIndex: 0,
      allMaps: [],
      currentMap: null,
      currentMapUrl: '',
      isLoading: true,
      loadingText: '加载中...',
      
      // Transform 相关状态
      scale: 1,
      translateX: 0,
      translateY: 0,
      
      // 手势操作状态
      touching: false,
      touchStartData: null,
      
      // 图片服务器配置
      imageBaseUrl: 'http://1.92.85.165:8088/image/'
    }
  },
  
  computed: {
    mapTransformStyle() {
      return {
        transform: `translate3d(${this.translateX}px, ${this.translateY}px, 0) scale(${this.scale})`,
        transition: this.touching ? 'none' : 'transform 0.3s ease-out'
      }
    }
  },
  
  onLoad(options) {
    // 正确解码URL参数
    this.topicId = options.topic_id || '';
    this.topic = options.topic ? decodeURIComponent(options.topic) : '';
    this.mapId = options.id || '';
    this.currentMapIndex = parseInt(options.index || '0');
    
    console.log('地图浏览页加载参数:', {
      topicId: this.topicId,
      topic: this.topic,
      mapId: this.mapId,
      mapIndex: this.currentMapIndex
    });
    
    if (this.topic || this.topicId) {
      this.loadMapsData();
    } else {
      this.showError('缺少专题参数');
    }
  },
  
  methods: {
    // ===== 数据加载相关 =====
    async loadMapsData() {
      try {
        this.isLoading = true;
        this.loadingText = '获取地图数据...';
        
        const res = await this.requestMapsData();
        
        if (res.statusCode === 200 && res.data.code === 200) {
          // 处理地图数据
          this.allMaps = (res.data.data || []).map(item => ({
            map_id: item.map_id,
            title: item.title,
            description: item.description,
            type: item.type,
            width: item.width || 6000,
            height: item.height || 4000,
            create_time: item.create_time
          }));
          
          console.log('获取到地图数据:', this.allMaps.length, '个地图');
          
          if (this.mapId) {
            const foundIndex = this.allMaps.findIndex(map => map.map_id === this.mapId);
            if (foundIndex !== -1) {
              this.currentMapIndex = foundIndex;
            }
          }
          
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
    
    requestMapsData() {
      return new Promise((resolve, reject) => {
        // 根据参数类型选择不同的请求方式
        let requestData = {};
        
        if (this.topic) {
          // 如果有专题名称，使用 group 参数
          requestData.group = this.topic;
          console.log('使用专题名称请求:', this.topic);
        } else if (this.topicId) {
          // 如果有专题ID，使用 groupid 参数  
          requestData.groupid = this.topicId;
          console.log('使用专题ID请求:', this.topicId);
        } else {
          reject(new Error('缺少专题参数'));
          return;
        }
        
        uni.request({
          url: API.MAPS_BY_GROUP,
          method: 'GET',
          data: requestData,
          success: resolve,
          fail: reject
        });
      });
    },
    
    // 加载当前地图，使用title构建图片URL
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
        this.loadingText = '加载中...';
        
        console.log('=== 开始加载地图图片 ===');
        console.log('当前地图标题:', this.currentMap.title);
        
        // 检查缓存
        let imageUrl = imageCache.getImage(this.currentMap.title);
        
        if (imageUrl) {
          console.log('缓存命中，使用缓存图片:', imageUrl);
          this.currentMapUrl = imageUrl;
          this.isLoading = false;
        } else {
          console.log('缓存未命中，生成新的图片URL');
          // 基于title生成图片URL
          const generatedUrl = generateImageUrl(this.currentMap.title);
          
          // 使用认证方式加载图片
          const tempFilePath = await loadImageWithAuth(generatedUrl);
          
          // 缓存图片URL
          imageCache.setImage(this.currentMap.title, tempFilePath, this.currentMap);
          
          this.currentMapUrl = tempFilePath;
          console.log('图片加载成功:', tempFilePath);
        }
        
        // 重置变换状态
        this.resetTransform();
        
      } catch (error) {
        console.error('加载地图失败:', error);
        this.showError(`加载失败: ${error.message || '未知错误'}`);
      } finally {
        this.isLoading = false;
      }
    },
    
    // ===== 手势操作相关 =====
    handleTouchStart(e) {
      this.touching = true;
      const touches = e.touches;
      
      if (touches.length === 1) {
        // 单指拖拽
        this.touchStartData = {
          type: 'pan',
          startX: touches[0].clientX,
          startY: touches[0].clientY,
          startTranslateX: this.translateX,
          startTranslateY: this.translateY
        };
      } else if (touches.length === 2) {
        // 双指缩放
        const touch1 = touches[0];
        const touch2 = touches[1];
        const distance = this.getDistance(touch1, touch2);
        const center = this.getCenter(touch1, touch2);
        
        this.touchStartData = {
          type: 'zoom',
          startDistance: distance,
          startScale: this.scale,
          centerX: center.x,
          centerY: center.y,
          startTranslateX: this.translateX,
          startTranslateY: this.translateY
        };
      }
    },
    
    handleTouchMove(e) {
      if (!this.touching || !this.touchStartData) return;
      
      e.preventDefault();
      const touches = e.touches;
      
      if (this.touchStartData.type === 'pan' && touches.length === 1) {
        // 单指拖拽
        const deltaX = touches[0].clientX - this.touchStartData.startX;
        const deltaY = touches[0].clientY - this.touchStartData.startY;
        
        this.translateX = this.touchStartData.startTranslateX + deltaX;
        this.translateY = this.touchStartData.startTranslateY + deltaY;
        
      } else if (this.touchStartData.type === 'zoom' && touches.length === 2) {
        // 双指缩放
        const touch1 = touches[0];
        const touch2 = touches[1];
        const distance = this.getDistance(touch1, touch2);
        const scaleRatio = distance / this.touchStartData.startDistance;
        
        let newScale = this.touchStartData.startScale * scaleRatio;
        newScale = Math.max(0.5, Math.min(3, newScale)); // 限制缩放范围
        
        // 以触摸中心点为基准进行缩放
        const scaleDiff = newScale - this.scale;
        const center = this.getCenter(touch1, touch2);
        
        this.scale = newScale;
        this.translateX = this.touchStartData.startTranslateX - (center.x - this.touchStartData.centerX) * scaleDiff;
        this.translateY = this.touchStartData.startTranslateY - (center.y - this.touchStartData.centerY) * scaleDiff;
      }
    },
    
    handleTouchEnd(e) {
      this.touching = false;
      this.touchStartData = null;
    },
    
    getDistance(touch1, touch2) {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    },
    
    getCenter(touch1, touch2) {
      return {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
      };
    },
    
    resetTransform() {
      this.scale = 1;
      this.translateX = 0;
      this.translateY = 0;
    },
    
    // ===== 导航相关 =====
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
      this.loadCurrentMap();
    },
    
    viewDetail() {
      if (!this.currentMap) return;
      
      let url = `/pages/map/detail?id=${this.currentMap.map_id}&from=browse`;
      
      // 根据可用参数添加专题信息
      if (this.topic) {
        url += `&topic=${this.topic}`;
      } else if (this.topicId) {
        url += `&topic_id=${this.topicId}`;
      }
      
      uni.navigateTo({ url });
    },
    
    // ===== 事件处理 =====
    onImageLoad() {
      console.log('图片显示成功');
      this.isLoading = false;
    },
    
    onImageError(error) {
      console.error('图片显示失败:', error);
      this.showError('图片显示失败，请检查网络连接');
    },
    
    showError(message) {
      this.isLoading = false;
      this.loadingText = message;
      
      uni.showToast({
        title: message,
        icon: 'none',
        duration: 3000
      });
      
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
  background-color: #f8f8f8;
  display: flex;
  flex-direction: column;
}

/* ===== 加载指示器 ===== */
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
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  margin: 0 auto 20rpx;
  border: 4rpx solid #e8e8e8;
  border-top: 4rpx solid #7aa26f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

/* ===== 顶部信息栏 ===== */
.top-header {
  background-color: #7aa26f;
  padding: 20rpx 30rpx;
  border-bottom: 1px solid #689963;
  height: 55rpx;
}

.map-info {
  text-align: center;
}

.map-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8rpx;
  line-height: 1.4;
}

.map-counter {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
}

/* ===== 地图显示区域 ===== */
.map-display-area {
  flex: 1;
  background-color: #ffffff;
  margin: 20rpx;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
  position: relative;
}

.map-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transform-origin: center;
}

.map-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* ===== 底部控制栏 ===== */
.bottom-controls {
  background-color: #ffffff;
  padding: 25rpx 30rpx;
  padding-bottom: calc(25rpx + env(safe-area-inset-bottom));
  border-top: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-btn {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50rpx;
  background-color: #7aa26f;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2rpx 8rpx rgba(122, 162, 111, 0.3);
}

.nav-btn:active {
  transform: scale(0.95);
  box-shadow: 0 1rpx 4rpx rgba(122, 162, 111, 0.4);
}

.nav-btn:disabled {
  background-color: #e8e8e8;
  box-shadow: none;
}

.nav-btn:disabled .nav-icon {
  color: #bbb;
}

.nav-icon {
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  line-height: 1;
}

.detail-btn {
  flex: 1;
  height: 80rpx;
  background-color: #ffffff;
  border: 2rpx solid #7aa26f;
  border-radius: 40rpx;
  margin: 0 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.detail-btn:active {
  transform: scale(0.98);
  background-color: #f8f9fa;
}

.detail-text {
  font-size: 30rpx;
  font-weight: 500;
  color: #7aa26f;
}

/* ===== 动画 ===== */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ===== 响应式适配 ===== */
@media screen and (max-width: 480px) {
  .map-display-area {
    margin: 15rpx;
  }
  
  .nav-btn {
    width: 90rpx;
    height: 90rpx;
  }
  
  .nav-icon {
    font-size: 44rpx;
  }
  
  .detail-btn {
    margin: 0 25rpx;
  }
}
</style>