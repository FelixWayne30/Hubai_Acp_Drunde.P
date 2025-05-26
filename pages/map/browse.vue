<template>
  <view class="container">
    <web-view :src="webViewUrl" @message="handleMessage"></web-view>
  </view>
</template>

<script>
import { API } from '@/common/config.js'
import { generateThumbnailUrl } from '@/common/utils.js'
import thumbnailCache from '@/common/cache.js'

export default {
  data() {
    return {
      topicId: '',
      mapId: '',
      webViewUrl: '',
      allMaps: [], // 存储当前专题的所有地图
      currentMapIndex: 0, // 当前地图在数组中的索引
      currentMapData: null
    }
  },
  onLoad(options) {
    this.topicId = options.topic_id || '';
    this.mapId = options.id || '';
    
    console.log('地图浏览页加载，参数:', options);
    console.log('topicId:', this.topicId);
    console.log('mapId:', this.mapId);
    
    if (this.mapId && this.topicId) {
      this.getAllMapsInTopic();
    } else {
      console.error('mapId或topicId为空，无法加载地图');
    }
  },
  methods: {
    // 获取当前专题下的所有地图
    getAllMapsInTopic() {
      console.log('=== 开始获取专题下所有地图 ===');
      uni.showLoading({
        title: '加载地图数据...'
      });
      
      uni.request({
        url: API.MAPS_BY_GROUP + this.topicId,
        method: 'GET',
        success: (res) => {
          console.log('获取专题地图数据成功:', res);
          if (res.statusCode === 200 && res.data.code === 200) {
            // 处理地图数据
            this.allMaps = res.data.data.map(item => ({
              id: item.map_id,
              title: item.title,
              description: item.description || '暂无描述',
              type: item.type,
              width: item.width,
              height: item.height,
              create_time: item.create_time
            }));
            
            console.log('处理后的所有地图:', this.allMaps);
            
            // 找到当前地图的索引
            this.currentMapIndex = this.allMaps.findIndex(map => map.id === this.mapId);
            
            if (this.currentMapIndex === -1) {
              console.error('未找到当前地图ID对应的地图');
              this.currentMapIndex = 0;
              this.mapId = this.allMaps[0]?.id || '';
            }
            
            console.log('当前地图索引:', this.currentMapIndex);
            console.log('当前地图ID:', this.mapId);
            
            // 设置当前地图数据
            this.currentMapData = this.allMaps[this.currentMapIndex];
            
            // 初始化WebView
            this.initWebView();
            
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
    
    // 初始化WebView
    initWebView() {
      if (!this.currentMapData) {
        console.error('当前地图数据为空');
        return;
      }
      
      // 构建传递给WebView的数据
      const webViewData = {
        currentMap: this.currentMapData,
        allMaps: this.allMaps,
        currentIndex: this.currentMapIndex,
        topicId: this.topicId
      };
      
      const encodedData = encodeURIComponent(JSON.stringify(webViewData));
      
      // 使用nginx代理地址
      this.webViewUrl = `http://localhost:2180/static/map-viewer.html?data=${encodedData}`;
      
      console.log('WebView URL:', this.webViewUrl);
    },
    
    // 切换地图
    switchMap(direction) {
      if (direction === 'next' && this.currentMapIndex < this.allMaps.length - 1) {
        this.currentMapIndex++;
      } else if (direction === 'prev' && this.currentMapIndex > 0) {
        this.currentMapIndex--;
      } else {
        return; // 无法切换
      }
      
      // 更新当前地图数据和ID
      this.currentMapData = this.allMaps[this.currentMapIndex];
      this.mapId = this.currentMapData.id;
      
      console.log('切换地图:', this.currentMapData.title);
      console.log('新的地图ID:', this.mapId);
      
      // 重新初始化WebView
      this.initWebView();
    },
    
    handleMessage(event) {
      console.log('收到web-view消息:', event);
      
      try {
        const data = event.detail && event.detail.data;
        console.log('解析后的消息数据:', data);
        
        if (data && data.action === 'switchMap') {
          // 处理地图切换
          this.switchMap(data.direction);
          
        } else if (data && data.action === 'viewDetail') {
          console.log('准备跳转到详情页:', this.mapId); // 使用当前的mapId
          
          setTimeout(() => {
            uni.navigateTo({
              url: `/pages/map/detail?id=${this.mapId}&from=browse`,
              success: () => {
                console.log('跳转成功');
              },
              fail: (err) => {
                console.error('跳转失败:', err);
              }
            });
          }, 100);
          
        } else if (data && data.action === 'downloadRequest') {
          uni.showLoading({
            title: '提交中...'
          });
          
          setTimeout(() => {
            uni.hideLoading();
            uni.showToast({
              title: '申请已提交',
              icon: 'success'
            });
          }, 1000);
        }
      } catch (e) {
        console.error('处理消息时出错:', e);
      }
    }
  }
}
</script>

<style>
.container {
  width: 100%;
  height: 100vh;
}
</style>