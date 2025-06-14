<template>
  <view class="container">
    <!-- 保持原有背景设计不变 -->
    <view class="background-solid"></view>
    
    <view class="background-image-container">
      <image class="background-image-top" src="/static/background/main-bg.png" mode="aspectFill"></image>
      <view class="gradient-overlay"></view>
    </view>
    
    <!-- 优化后的地图列表区域 -->
    <scroll-view class="maps-scroll" scroll-y enhanced :show-scrollbar="false">
      <view class="maps-container">
        <MapItem
          class="map-item" 
          v-for="(item, index) in maps" 
          :key="index"
          :item="item"
          :index="index"
          @navigateToMap="navigateToMap"
          @handleImageError="handleImageError"
          @navigateToDetail="navigateToDetail"
        />
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { API } from '@/common/config.js';
import { generateSubimageUrl } from '@/common/utils.js'
import imageCache from '@/common/cache.js';
import MapItem from '@/component/map.vue';


export default {
  components: {MapItem},
  data() {
    return {
      topic: '',
      maps: []
    };
  },
  onLoad(options) {
      this.topic = options.topic || '';
      
      imageCache.setCurrentTopic(this.topic);
  
      this.getTopicMaps();
    },
  
  methods: {
    // 图片加载错误处理
    handleImageError(e) {
      console.log('图片加载失败，使用默认图片');
      e.target.src = '/static/placeholder.png';
    },
    
    // 获取该专题下的所有地图
    getTopicMaps() {
      console.log('=== 开始获取专题地图数据 ===');
      
      uni.showLoading({
        title: '加载地图数据...'
      });
      
      uni.request({
        url: API.MAPS_BY_GROUP,
        method: 'GET',
        data:{
          group: this.topic
        },
        success: (res) => {
          console.log('获取地图数据响应:', res);
          if (res.statusCode === 200 && res.data.code === 200) {
            // 处理地图数据
            this.maps = res.data.data.map((item, index) => {
              console.log(`处理地图项 ${index}: ${item.title}`);
              
              // 基于中文标题生成图片URL
              const imageUrl = generateSubimageUrl(item.title);
              
              // 缓存图片URL，供其他页面使用
              imageCache.setImage(item.title, imageUrl, item);
              
              return {
                id: item.map_id,
                title: item.title,
                description: item.description,
                thumbnail: imageUrl,
                width: item.width,
                height: item.height
              };
            });
            
            console.log(`地图数据处理完成，共${this.maps.length}个地图`);
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
    
    // 导航到地图浏览页
        navigateToMap(mapId, index = 0) {
            console.log(`跳转到地图浏览页: ${mapId}, 索引: ${index}`);
            
            uni.navigateTo({
              url: `/pages/map/browse?id=${mapId}&topic=${this.topic}&index=${index}`
            });
          },
          
          // 导航到地图详情页 - 修复URL编码
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
              url: `/pages/map/detail?id=${mapId}&topic=${this.topic}`
          });
        }
      }
};
</script>

<style>
/* 样式保持不变 */
.container {
  position: relative;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

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

.maps-scroll {
  position: relative;
  z-index: 2;
  height: 100vh;
  width: 100%;
}

.maps-container {
  padding: 40rpx 30rpx 60rpx;
  min-height: calc(100vh + 100rpx);
}
</style>