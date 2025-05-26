<template>
  <view class="container">
    <!-- Base solid color background -->
    <view class="background-solid"></view>
    
    <!-- Top decorative background with gradient fade -->
    <view class="background-image-container">
      <image class="background-image-top" src="/static/background/hubei-landscape.png" mode="aspectFill"></image>
      <view class="gradient-overlay"></view>
    </view>
    
    <!-- Search Bar -->
    <view class="search-container">
      <view class="search-box">
        <input 
          class="search-input" 
          placeholder="搜索" 
          confirm-type="search"
          @confirm="performSearch"
          v-model="searchQuery"
        />
        <text v-if="searchQuery" class="clear-icon" @click="clearSearch">×</text>
      </view>
    </view>
    
    <!-- 轮播图区域 - MOVED UP -->
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
    
    <!-- 四大图组区域 - MOVED DOWN -->
    <scroll-view class="topic-scroll" scroll-y>
      <view class="section-header">专题分类</view>
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
      topicList: [], // 改为空数组，将从API获取数据
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
    // 页面加载时获取专题数据
    this.getTopics()
  },
  methods: {
    // 获取专题数据的方法
   // 获取专题数据的方法
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
               // 处理返回的数据 - 注意后端返回的字段名
               this.topicList = res.data.data.map(item => ({
                 id: item.topic_id, // 后端返回的是topic_id
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
	   
    // 保留原有的方法
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

/* Base solid background color */
.background-solid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #E8F4F0;
  z-index: -2;
}

/* Background image container - positioned at bottom */
.background-image-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 45%;
  z-index: -1;
  overflow: hidden;
}

/* Background image */
.background-image-top {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Gradient overlay - fades upward */
.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 60%;
  background: linear-gradient(to top, transparent 0%, #E8F4F0 100%);
  z-index: 1;
}

/* Search Bar Styling */
.search-container {
  position: relative;
  padding: 30rpx 20rpx;
  z-index: 2;
  width: 100%;
  box-sizing: border-box;
}

.search-box {
  height: 80rpx;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.search-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
  color: #666;
}

.search-input {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 28rpx;
  color: #333;
}

.clear-icon {
  font-size: 36rpx;
  color: #999;
  padding: 0 10rpx;
}

/* Carousel/Swiper styling */
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

/* Section header for topic grid */
.section-header {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  padding: 0 30rpx 10rpx;
  margin-bottom: 10rpx;
}

/* Scrollable container for topic grid */
.topic-scroll {
  height: calc(100vh - 530rpx);
  position: relative;
  z-index: 1;
  padding: 0 20rpx 30rpx;
}

/* Topic grid styling */
.topic-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 10rpx 0;
}

.topic-item {
  width: 42%;
  margin: 15rpx;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.topic-item:nth-child(1) {
  background-color: rgba(173, 216, 230, 0.85); /* 天青蓝 */
}

.topic-item:nth-child(2) {
  background-color: rgba(218, 165, 32, 0.85); /* 琥珀金 */
}

.topic-item:nth-child(3) {
  background-color: rgba(144, 238, 144, 0.85); /* 鲜绿色 */
}

.topic-item:nth-child(4) {
  background-color: rgba(70, 130, 180, 0.85); /* 靛蓝色 */
}

.topic-image {
  width: 100rpx;
  height: 100rpx;
  margin: 20rpx auto 10rpx;
  display: block;
}

.topic-title {
  text-align: center;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  padding: 15rpx 0 20rpx;
}
</style>