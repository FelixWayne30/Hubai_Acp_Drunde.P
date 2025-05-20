<template>
  <view class="container">
    <!-- 基础纯色背景 -->
    <view class="background-solid"></view>
    
    <!-- 顶部装饰背景带渐变过渡效果 -->
    <view class="background-image-container">
      <image class="background-image-top" src="/static/background/hubei-landscape.png" mode="aspectFill"></image>
      <view class="gradient-overlay"></view>
    </view>
    
    <!-- 地图列表 -->
    <scroll-view class="maps-list" scroll-y>
      <view 
        class="map-item" 
        v-for="(item, index) in maps" 
        :key="index"
      >
        <view class="map-name">{{item.title}}</view>
        <view class="map-content">
          <image 
            class="map-thumbnail" 
            :src="item.thumbnail" 
            mode="aspectFill"
            @click="navigateToMap(item.id)"
          ></image>
          <view class="map-description">
            <text>{{item.description}}</text>
            <view class="action-buttons">
              <button class="detail-btn primary-bg" @click="navigateToDetail(item.id)">查看详情</button>
              <button class="browse-btn" @click="navigateToMap(item.id)">浏览地图</button>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { API } from '@/common/config.js'

export default {
  data() {
    return {
      topicId: '',
      topicInfo: {
        id: '',
        title: '加载中...'
      },
      maps: []  // 改为空数组，将从API获取数据
    }
  },
  onLoad(options) {
    this.topicId = options.topic_id || '';
    // 获取专题信息和地图列表
    this.getTopicInfo();
    this.getTopicMaps();
  },
  methods: {
    // 获取专题基本信息
    getTopicInfo() {
      // 可以通过API获取单个专题详情，或者从缓存中获取
      uni.request({
        url: API.TOPICS,
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 200) {
            // 在列表中找到当前专题
            const topic = res.data.data.find(item => item.id === this.topicId);
            if (topic) {
              this.topicInfo = topic;
              // 设置导航栏标题
              uni.setNavigationBarTitle({
                title: topic.title
              });
            }
          }
        }
      });
    },
    
    // 获取该专题下的所有地图
    getTopicMaps() {
      uni.showLoading({
        title: '加载地图数据...'
      });
      
      uni.request({
        url: API.MAPS_BY_GROUP + this.topicId,
        method: 'GET',
        success: (res) => {
          console.log('获取地图数据成功:', res);
          if (res.statusCode === 200 && res.data.code === 200) {
            // 处理地图数据
            this.maps = res.data.data;
          } else {
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
    
    // 导航到地图浏览页
    navigateToMap(mapId) {
      uni.navigateTo({
        url: `/pages/map/browse?id=${mapId}&topic_id=${this.topicId}`
      });
    },
    
    // 导航到地图详情页
    navigateToDetail(mapId) {
      uni.navigateTo({
        url: `/pages/map/detail?id=${mapId}`
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

/* 基础纯色背景 - 淡米色 */
/* Base solid background color - modified to match other pages */
.background-solid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #E8F4F0; /* Updated to light mint green */
  z-index: -2;
}

/* Background image container - repositioned to bottom */
.background-image-container {
  position: absolute;
  bottom: 0; /* Changed from top to bottom */
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
  top: 0; /* Changed from bottom to top */
  left: 0;
  width: 100%;
  height: 60%; /* Increased fade height */
  background: linear-gradient(to top, transparent 0%, #E8F4F0 100%);
  z-index: 1;
}

/* 专题标题区域 */
.topic-header {
  padding: 40rpx 30rpx;
  margin-top: 120rpx;
  position: relative;
  z-index: 1;
}

.topic-title {
  font-size: 44rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
  margin-bottom: 20rpx;
}

/* 地图列表 */
.maps-list {
  height: calc(100vh - 120rpx); 
  padding: 160rpx 30rpx 30rpx 30rpx; /* 增加顶部内边距，补偿移除的标题区域 */
  position: relative;
  z-index: 1;
  box-sizing: border-box; /* 确保padding不会增加元素实际尺寸 */
  width: 100%;
}

.map-item {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 20rpx;
  margin-bottom: 40rpx;
  padding: 30rpx;
  box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.08);
  width: 100%;
  box-sizing: border-box; /* 确保内边距计入宽度计算 */
  overflow: hidden; /* 防止内容溢出 */
}

.map-name {
  font-size: 34rpx;
  font-weight: bold;
  color: #2E8B57; /* 与应用中使用的主色调匹配 */
  margin-bottom: 20rpx;
  border-bottom: 1px solid rgba(46, 139, 87, 0.2);
  padding-bottom: 15rpx;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis; /* 文字过长时显示省略号 */
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
  object-fit: cover; /* 确保图片比例合适 */
}

.map-description {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  width: 100%;
  overflow-wrap: break-word; /* 确保长单词自动换行 */
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
    flex-wrap: wrap; /* 允许在需要时换行 */
    justify-content: space-between;
  }
  
  .map-thumbnail {
    width: 40%;
    height: 250rpx;
    margin-right: 20rpx;
    margin-bottom: 0;
    flex-shrink: 0; /* 防止图片被挤压 */
  }
  
  .map-description {
    width: calc(60% - 20rpx); /* 计算正确的宽度，考虑到margin */
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