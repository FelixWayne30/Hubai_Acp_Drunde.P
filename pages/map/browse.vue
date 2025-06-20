<!-- pages/map/browse.vue -->
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
    <view class="map-display-area" 
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove" 
          @touchend="handleTouchEnd">
      <view class="map-container" 
            :style="mapTransformStyle">
        <image 
          class="map-image"
          :style="rotationStyle90"
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
      <image
          class="control-btn"
          :style="rotationStyle90"
          src="../../static/icons/info.svg"
          @click="viewDetail">
      </image>

      <image
          class="control-btn"
          :style="rotationStyle"
          src="../../static/icons/reset.svg"
          @click="resetTransform">
      </image>

      <image
          class="control-btn"
          :style="rotationStyle90"
          src="../../static/icons/rotate.svg"
          @click="rotate">
      </image>

      <image
          class="control-btn"
          :style="rotationStyle"
          :src="currentMapIndex === allMaps.length - 1? arrow_img.disabled: arrow_img.active"
          @click="switchMap('next')">
      </image>

      <image
        class="control-btn"
        :style="rotationStyle180"
        :src="currentMapIndex === 0? arrow_img.disabled: arrow_img.active"
        @click="switchMap('prev')">
      </image>

    </view>
  </view>
</template>

<script>
import { API } from '@/common/config.js'

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
      maxscale: 10,
      initialscale: 2,
      
      // 手势操作状态
      touching: false,
      touchStartData: null,

      arrow_img:{
        active: "../../static/icons/arrow-active.svg",
        disabled: "../../static/icons/arrow.svg",
      },

      rotation: 0
    }
  },
  
  computed: {
    mapTransformStyle() {
      return {
        transform: `translate3d(${this.translateX}px, ${this.translateY}px, 0) scale(${this.scale})`,
        transition: this.touching ? 'none' : 'transform 0.3s ease-out'
      }
    },
    rotationStyle() {
      return `transform: rotate(${this.rotation}deg);
              transition: transform 0.5s ease-in-out;`;
    },
    rotationStyle90() {
      return `transform: rotate(${this.rotation+90}deg);
              transition: transform 0.5s ease-in-out;`;
    },
    rotationStyle180() {
      return `transform: rotate(${this.rotation+180}deg);
              transition: transform 0.5s ease-in-out;`;
    },
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
    
    // 加载当前地图，直接使用原图URL
    loadCurrentMap() {
      if (!this.allMaps.length) {
        this.showError('没有可显示的地图');
        return;
      }
      
      this.currentMap = this.allMaps[this.currentMapIndex];
      if (!this.currentMap) {
        this.showError('地图数据错误');
        return;
      }
      
      console.log('=== 开始加载原图 ===');
      console.log('当前地图标题:', this.currentMap.title);
      
      // 直接生成原图URL
      const originalImageUrl = API.ORIGIN_MAP + this.currentMap.title + ".jpg";
      console.log('生成的原图URL:', originalImageUrl);
      
      // 直接设置图片URL，不需要下载
      this.currentMapUrl = originalImageUrl;
      
      // 重置变换状态
      this.resetTransform();
      
      // 由于不需要下载，直接关闭加载状态
      this.isLoading = false;
    },
    
    // ===== 手势操作相关 =====
    handleTouchStart(e) {

      this.touching = true;
      const touches = e.touches;
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;

      // 发生双击时进行放大
      const now = Date.now();
      if (now - this.lastTap < 300 &&
          Math.abs(x - this.lastTapX) < 10 &&
          Math.abs(y - this.lastTapY) < 10) {
        // 发生双击时进行放大
        if(this.scale*2 < this.maxscale)
          this.scale = this.scale*2
        this.lastTap = 0;
      } else {
        this.lastTap = now;
        this.lastTapX = x;
        this.lastTapY = y;
      };

      // 单指拖拽
      if (touches.length === 1) {
        this.touchStartData = {
          type: 'pan',
          startX: x,
          startY: y,
          startTranslateX: this.translateX,
          startTranslateY: this.translateY
        };
      }

      // 双指缩放
      else if (touches.length === 2) {
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
        newScale = Math.max(0.5, Math.min(this.maxscale, newScale)); // 限制缩放范围
        
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
      this.scale = this.initialscale;
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
      console.log('原图显示成功');
      this.isLoading = false;
    },
    
    onImageError(error) {
      console.error('原图显示失败:', error);
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
    },

    rotate() {
      this.rotation = (this.rotation + 90) % 360;
    },
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
  padding: 20rpx 30rpx calc(-20rpx + env(safe-area-inset-bottom)) 30rpx;
  border-top: 1px solid #e8e8e8;
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  justify-content: space-around;
  height: 7vh;
}

.control-btn {
  width: 80rpx;
  height: 80rpx;
  border: none;
  background: none;
  padding: 0;
  object-fit: contain;
  transition: transform 0.5s ease-in-out;
}

.rotate-180-btn{
  transform: rotate(180deg);
}

.rotate-90-btn{
  transform: rotate(90deg);
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
}
</style>