<template>
  <view class="container">
    <!-- 基础纯色背景 -->
    <view class="background-solid"></view>
    
    <!-- 顶部装饰背景带渐变过渡效果 -->
    <view class="background-image-container">
      <image class="background-image-top" src="/static/background/center-bg.png" mode="aspectFill"></image>
      <view class="gradient-overlay"></view>
    </view>
    
    <!-- 地图列表 -->
    <scroll-view class="maps-list" scroll-y>
      <view 
        class="map-item" 
        v-for="(item, index) in maps" 
        :key="index"
        :data-map-id="item.id"
        :data-index="index"
      >
        <view class="map-name">{{item.title}}</view>
        <view class="map-content">
          <image 
            class="map-thumbnail" 
            :src="item.thumbnail" 
            mode="aspectFill"
            @click="navigateToMap(item.id, index)"
            @error="handleImageError"
          ></image>
          <view class="map-description">
            <text>{{item.description}}</text>
            <view class="action-buttons">
              <button class="detail-btn primary-bg" @click="navigateToDetail(item.id)">查看详情</button>
              <button class="browse-btn" @click="navigateToMap(item.id, index)">浏览地图</button>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { API } from '@/common/config.js'
import { generateThumbnailUrl } from '@/common/utils.js'
import { preloader } from '@/common/preload.js'

export default {
  data() {
    return {
      topicId: '',
      topicInfo: {
        id: '',
        title: '加载中...'
      },
      maps: []
    }
  },
  onLoad(options) {
    console.log('专题介绍页面加载，接收参数:', options);
    this.topicId = options.topic_id || '';
    console.log('设置的topicId:', this.topicId);
    
    // 切换专题时重置预加载器
    preloader.switchTopic(this.topicId);
    
    // 获取专题信息和地图列表
    this.getTopicInfo();
    this.getTopicMaps();
  },
  
  onUnload() {
    // 页面卸载时清理过期缓存
    preloader.cleanExpiredCache();
  },
  
  methods: {
    // 图片加载错误处理
    handleImageError(e) {
      console.log('缩略图加载失败，使用默认图片');
      e.target.src = '/static/placeholder.png';
    },
    
    // 获取专题基本信息
    getTopicInfo() {
      uni.request({
        url: API.TOPICS,
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 200) {
            const topic = res.data.data.find(item => item.topic_id === this.topicId);
            if (topic) {
              this.topicInfo = {
                id: topic.topic_id,
                title: topic.title,
                description: topic.description
              };
              uni.setNavigationBarTitle({
                title: topic.title
              });
            }
          }
        },
        fail: (err) => {
          console.error('获取专题信息失败:', err);
        }
      });
    },
    
    // 获取该专题下的所有地图
    getTopicMaps() {
      console.log('=== 开始获取专题地图数据 ===');
      
      uni.showLoading({
        title: '加载地图数据...'
      });
      
      uni.request({
        url: API.MAPS_BY_GROUP + this.topicId,
        method: 'GET',
        success: (res) => {
          console.log('获取地图数据成功');
          if (res.statusCode === 200 && res.data.code === 200) {
            // 处理地图数据
            this.maps = res.data.data.map((item, index) => {
              console.log(`处理地图项 ${index}: ${item.title}`);
              
              // 生成缩略图URL
              const thumbnailUrl = generateThumbnailUrl(item.map_id, item.width, item.height);
              
              return {
                id: item.map_id,
                title: item.title,
                description: item.description || '暂无描述',
                thumbnail: thumbnailUrl,
                width: item.width,
                height: item.height
              };
            });
            
            console.log(`地图数据处理完成，共${this.maps.length}个地图`);
            
            // 延迟启动激进预加载，避免影响页面渲染
            setTimeout(() => {
              this.startAggressivePreload();
            }, 500);
            
          } else {
            console.error('获取地图数据失败:', res.data);
            uni.showToast({
              title: '获取地图数据失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          console.error('获取地图数据失败:', err);
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
    
    // 启动激进预加载策略
    startAggressivePreload() {
      if (this.maps.length === 0) {
        console.log('没有地图数据，跳过预加载');
        return;
      }
      
      console.log('=== 启动激进预加载策略 ===');
      
      // 从第一个地图开始激进预加载整个图组
      preloader.startAggressivePreload(this.maps, 0, this.topicId);
      
      // 定期输出预加载进度（仅控制台）
      const progressTimer = setInterval(() => {
        const progress = preloader.getProgress();
        console.log(`预加载进度: ${progress.completed}/${progress.total} (${progress.percentage}%)`);
        
        if (progress.completed === progress.total) {
          console.log('=== 所有地图预加载完成 ===');
          clearInterval(progressTimer);
        }
      }, 2000);
      
      // 10秒后清理定时器（防止内存泄漏）
      setTimeout(() => {
        clearInterval(progressTimer);
      }, 10000);
    },
    
    // 导航到地图浏览页
    navigateToMap(mapId, index = 0) {
      console.log(`跳转到地图浏览页: ${mapId}, 索引: ${index}`);
      
      // 检查是否有预加载缓存
      const isCached = preloader.isCached(mapId);
      console.log(`地图缓存状态: ${isCached ? '已缓存' : '未缓存'}`);
      
      uni.navigateTo({
        url: `/pages/map/browse?id=${mapId}&topic_id=${this.topicId}&index=${index}`
      });
    },
    
    // 导航到地图详情页
    navigateToDetail(mapId) {
      console.log(`跳转到地图详情页: ${mapId}`);
      
      if (!mapId) {
        console.error('mapId为空，无法跳转');
        uni.showToast({
          title: 'mapId参数错误',
          icon: 'none'
        });
        return;
      }
      
      uni.navigateTo({
        url: `/pages/map/detail?id=${mapId}&topic_id=${this.topicId}`
      });
    }
  }
}
</script>

<style>
.container {
  position: relative;
  min-height: 100vh;
  padding: 0;
  padding-bottom: 30rpx;
}

/* 基础纯色背景 */
.background-solid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #E8F4F0;
  z-index: -2;
}

/* Background image container - repositioned to bottom */
.background-image-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 45%;
  z-index: -1;
  overflow: hidden;
}

/* The actual background image */
.background-image-top {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Gradient overlay - direction reversed */
.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 60%;
  background: linear-gradient(to top, transparent 0%, #E8F4F0 100%);
  z-index: 1;
}

/* 地图列表 */
.maps-list {
  height: calc(100vh - 120rpx); 
  padding: 160rpx 30rpx 30rpx 30rpx;
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  width: 100%;
}

.map-item {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 20rpx;
  margin-bottom: 40rpx;
  padding: 30rpx;
  box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.08);
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.map-name {
  font-size: 34rpx;
  font-weight: bold;
  color: #2E8B57;
  margin-bottom: 20rpx;
  border-bottom: 1px solid rgba(46, 139, 87, 0.2);
  padding-bottom: 15rpx;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.map-content {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.map-thumbnail {
  width: 100%;
  height: 300rpx;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
  object-fit: cover;
}

.map-description {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  width: 100%;
  overflow-wrap: break-word;
  word-wrap: break-word;
}

/* 按钮样式 */
.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20rpx;
}

.detail-btn, .browse-btn {
  width: 48%;
  height: 70rpx;
  line-height: 70rpx;
  text-align: center;
  border-radius: 35rpx;
  font-size: 28rpx;
}

.detail-btn {
  color: #FFFFFF;
}

.browse-btn {
  background-color: #FFFFFF;
  color: #2E8B57;
  border: 1px solid #2E8B57;
}

/* 针对不同设备的响应式设计 */
@media screen and (min-width: 768px) {
  .map-content {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
  }
  
  .map-thumbnail {
    width: 40%;
    height: 250rpx;
    margin-right: 20rpx;
    margin-bottom: 0;
    flex-shrink: 0;
  }
  
  .map-description {
    width: calc(60% - 20rpx);
    flex-grow: 1;
  }
  
  .action-buttons {
    margin-top: 20rpx;
    justify-content: flex-start;
  }
  
  .detail-btn, .browse-btn {
    width: 180rpx;
    margin-right: 20rpx;
  }
}
</style>