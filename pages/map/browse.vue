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
      <MapImage
          ref="map"
          :current-map-url="currentMapUrl"
          :extends="[299.9244146,1248.482095,3018.427816,2950.8553]"
      />
    </view>
    
    <!-- 底部控制栏 -->
    <view class="bottom-controls">
      <image
        class="control-btn"
        :style="rotationStyle90"
        src="../../static/icons/info.svg"
        @click="viewDetail"
      />

      <image
        class="control-btn"
        :style="rotationStyle"
        src="../../static/icons/reset.svg"
        @click="resetTransform"
      />

      <image
        class="control-btn"
        :style="rotationStyle90"
        src="../../static/icons/rotate.svg"
        @click="rotate"
      />

      <image
        class="control-btn"
        :style="rotationStyle"
        :src="currentMapIndex === allMaps.length - 1 ? arrow_img.disabled : arrow_img.active"
        @click="switchMap('next')"
      />

      <image
        class="control-btn"
        :style="rotationStyle180"
        :src="currentMapIndex === 0 ? arrow_img.disabled : arrow_img.active"
        @click="switchMap('prev')"
      />
    </view>
  </view>
</template>

<script>
import { API } from '@/common/config.js'
import MapImage from '../../component/MapImage.vue'

export default {
  components: {
    MapImage
  },
  data() {
    return {
      topicId: '',
      topic: '',
      mapId: '',
      currentMapIndex: 0,
      allMaps: [],
      currentMap: null,
      currentMapUrl: '',
      isLoading: true,
      loadingText: '加载中...',
      rotation: 0,
      arrow_img: {
        active: "../../static/icons/arrow-active.svg",
        disabled: "../../static/icons/arrow.svg",
      }
    }
  },
  computed: {
    rotationStyle() {
      return `transform: rotate(${this.rotation}deg); transition: transform 0.5s ease-in-out;`;
    },
    rotationStyle90() {
      return `transform: rotate(${this.rotation + 90}deg); transition: transform 0.5s ease-in-out;`;
    },
    rotationStyle180() {
      return `transform: rotate(${this.rotation + 180}deg); transition: transform 0.5s ease-in-out;`;
    }
  },
  onLoad(options) {
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
    async loadMapsData() {
      try {
        this.isLoading = true;
        this.loadingText = '获取地图数据...';
        
        const res = await this.requestMapsData();
        
        if (res.statusCode === 200 && res.data.code === 200) {
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
        let requestData = {};
        
        if (this.topic) {
          requestData.group = this.topic;
          console.log('使用专题名称请求:', this.topic);
        } else if (this.topicId) {
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
      
      const originalImageUrl = API.ORIGIN_MAP + this.currentMap.title + ".jpg";
      console.log('生成的原图URL:', originalImageUrl);
      
      this.currentMapUrl = originalImageUrl;
      
      this.isLoading = false;
    },
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
      
      if (this.topic) {
        url += `&topic=${this.topic}`;
      } else if (this.topicId) {
        url += `&topic_id=${this.topicId}`;
      }
      
      uni.navigateTo({ url });
    },
    resetTransform() {
      this.$refs.map.resetTransform()
    },
    rotate() {
      this.rotation = (this.rotation + 90) % 360;
      this.$refs.map.rotate()
    }
  }
}
</script>

<style>
/* 保持原有样式不变 */
.container {
  width: 100%;
  height: 100vh;
  background-color: #f8f8f8;
  display: flex;
  flex-direction: column;
}

/* 加载指示器 */
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

/* 地图显示区域 */
.map-display-area {
  flex: 1;
  background-color: #ffffff;
  margin: 20rpx;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
  position: relative;
}

/* 底部控制栏 */
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

/* 动画 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式适配 */
@media screen and (max-width: 480px) {
  .map-display-area {
    margin: 15rpx;
  }
  
  .control-btn {
    width: 90rpx;
    height: 90rpx;
  }
}
</style>