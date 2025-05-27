<template>
  <view class="container">
    <!-- 和个人中心一致的背景设计 -->
    <view class="background-solid"></view>
    
    <view class="background-image-container">
      <image class="background-image-top" src="/static/background/center-bg.png" mode="aspectFill"></image>
      <view class="gradient-overlay"></view>
    </view>
    
    <!-- 简化的搜索区域 -->
    <view class="search-section">
      <view class="search-container">
        <input 
          class="search-input" 
          placeholder="搜索地图、专题..." 
          placeholder-class="search-placeholder"
          confirm-type="search"
          @confirm="performSearch"
          @input="onSearchInput"
          v-model="searchQuery"
        />
        <view 
          v-if="searchQuery" 
          class="clear-button" 
          @click="clearSearch"
        >
          <text class="clear-icon">×</text>
        </view>
      </view>
    </view>
    
    <!-- 轮播图区域 -->
    <view class="swiper-container">
      <swiper 
        class="swiper" 
        circular 
        autoplay 
        interval="5000" 
        duration="500" 
        indicator-dots 
        indicator-active-color="#2E8B57"
      >
        <swiper-item v-for="(item, index) in carouselItems" :key="index" @click="navigateToMap(item.id)">
          <view class="swiper-item">
            <image class="swiper-image" :src="item.image" mode="aspectFill"></image>
            <view class="swiper-title">{{item.title}}</view>
          </view>
        </swiper-item>
      </swiper>
    </view>
    
    <!-- 专题分类区域 -->
    <scroll-view class="topic-scroll" scroll-y>
      <view class="section-header">图组列表</view>
      <view class="topic-grid">
        <view 
          class="topic-item" 
          v-for="(item, index) in topicList" 
          :key="index" 
          @click="navigateToTopic(item.id)"
        >
          <image class="topic-image" :src="item.image"></image>
          <view class="topic-title">{{item.title}}</view>
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
      searchQuery: '',
      topicList: [],
      carouselItems: [
        {
          id: "map1",
          title: "江河湖库",
          image: "/static/maps/map-demo1.png"
        },
        {
          id: "map2",
          title: "水资源概况",
          image: "/static/maps/map-demo2.png"
        },
        {
          id: "map3",
          title: "地表水",
          image: "/static/maps/map-demo3.png"
        }
      ]
    }
  },
  onLoad() {
    this.getTopics()
  },
  methods: {
    getTopics() {
      uni.showLoading({
        title: '加载中...'
      })
      
      uni.request({
        url: API.TOPICS,
        method: 'GET',
        success: (res) => {
          console.log('获取专题数据成功:', res)
          if (res.statusCode === 200 && res.data.code === 200) {
            this.topicList = res.data.data.map(item => ({
              id: item.topic_id,
              title: item.title,
              image: item.image || "/static/icons/topic-default.png"
            }))
            console.log('处理后的专题数据:', this.topicList)
          } else {
            console.error('接口返回错误:', res.data)
            uni.showToast({
              title: '获取专题数据失败',
              icon: 'none'
            })
          }
        },
        fail: (err) => {
          console.error('获取专题数据失败:', err)
          uni.showToast({
            title: '网络错误，请稍后重试',
            icon: 'none'
          })
        },
        complete: () => {
          uni.hideLoading()
        }
      })
    },

    onSearchInput(e) {
      this.searchQuery = e.detail.value;
    },
	   
    navigateToTopic(topicId) {
      uni.navigateTo({
        url: '/pages/map/topic-intro?topic_id=' + topicId
      });
    },
    navigateToMap(mapId) {
      uni.navigateTo({
        url: '/pages/map/detail?id=' + mapId
      });
    },
    performSearch() {
      if (!this.searchQuery.trim()) {
        uni.showToast({
          title: '请输入搜索内容',
          icon: 'none'
        });
        return;
      }
      
      uni.navigateTo({
        url: `/pages/map/search?query=${encodeURIComponent(this.searchQuery)}`
      });
    },
    clearSearch() {
      this.searchQuery = '';
    }
  }
}
</script>

<style>
.container {
  position: relative;
  height: 100vh;
  padding: 0;
  overflow: hidden;
}

/* ========== 背景设计 ========== */
.background-solid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #E8F4F0;
  z-index: -2;
}

.background-image-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 45%;
  z-index: -1;
  overflow: hidden;
}

.background-image-top {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 60%;
  background: linear-gradient(to top, transparent 0%, #E8F4F0 100%);
  z-index: 1;
}

/* ========== 简化的搜索区域样式 ========== */
.search-section {
  padding: 30rpx 30rpx;
  position: relative;
  z-index: 2;
}

.search-container {
  position: relative;
  height: 88rpx;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 2rpx 16rpx rgba(46, 139, 87, 0.08);
  border: 2rpx solid rgba(255, 255, 255, 0.3);
}

.search-input {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 30rpx;
  color: #333333;
  padding: 0 30rpx;
  margin: 0;
}

.search-placeholder {
  color: #CCCCCC;
  font-size: 30rpx;
}

.clear-button {
  width: 60rpx;
  height: 60rpx;
  margin-right: 14rpx;
  background-color: #F5F5F5;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.clear-icon {
  font-size: 36rpx;
  color: #999999;
  font-weight: normal;
  line-height: 1;
}

/* ========== 轮播图样式 ========== */
.swiper-container {
  width: 90%;
  height: 350rpx;
  margin: 10rpx auto 30rpx;
  border-radius: 15rpx;
  overflow: hidden;
  box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.1);
}

.swiper {
  width: 100%;
  height: 100%;
}

.swiper-item {
  position: relative;
  width: 100%;
  height: 100%;
}

.swiper-image {
  width: 100%;
  height: 100%;
}

.swiper-title {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 20rpx;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  color: #FFFFFF;
  font-size: 28rpx;
}

/* ========== 专题分类区域样式 ========== */
.section-header {
  font-size: 40rpx;
  font-weight: 900;
  color: #0c0c0c;
  padding: 20rpx 30rpx 10rpx;
  margin-bottom: 10rpx;
  text-align: center;
}

.topic-scroll {
  height: calc(100vh - 530rpx);
  position: relative;
  z-index: 1;
  padding: 0 20rpx 30rpx;
}

.topic-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 10rpx 0;
}

/* ========== 专题卡片 ========== */
.topic-item {
  width: 42%;
  margin: 15rpx;
  border-radius: 20rpx;
  overflow: hidden;
  background-color: rgba(227, 244, 240, 1.0);
  box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  opacity: 0.85;
}

.topic-item:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.12);
}

.topic-image {
  width: 155.4rpx;
  height: 112.5rpx;
  margin: 30rpx auto 15rpx;
  display: block;
}

.topic-title {
  text-align: center;
  font-size: 30rpx;
  font-weight: 800;
  color: #333;
  padding: 0 20rpx 30rpx;
  line-height: 1.3;
  opacity: 1;
}
</style>