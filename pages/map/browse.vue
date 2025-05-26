<template>
  <view class="container">
    <web-view :src="webViewUrl" @message="handleMessage"></web-view>
  </view>
</template>

<script>
import { API } from '@/common/config.js'

export default {
  data() {
    return {
      topicId: '',
      mapId: '',
      webViewUrl: '',
      mapData: null
    }
  },
  onLoad(options) {
    this.topicId = options.topic_id || '';
    this.mapId = options.id || '';
    
    console.log('地图浏览页加载，参数:', options);
    console.log('topicId:', this.topicId);
    console.log('mapId:', this.mapId);
    
    if (this.mapId) {
      this.getMapData();
    } else {
      console.error('mapId为空，无法加载地图');
    }
  },
  methods: {
    // 获取地图数据
    getMapData() {
      console.log('=== 开始获取地图数据 ===');
      uni.showLoading({
        title: '加载地图数据...'
      });
      
      uni.request({
        url: API.MAP_DETAIL + this.mapId,
        method: 'GET',
        success: (res) => {
          console.log('获取地图数据成功:', res);
          if (res.statusCode === 200 && res.data.code === 200) {
            const mapData = res.data.data[0];
            if (mapData) {
              this.mapData = mapData;
              console.log('地图数据:', this.mapData);
              this.initWebView();
            } else {
              uni.showToast({
                title: '地图数据不存在',
                icon: 'none'
              });
            }
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
    
    // 初始化WebView
    initWebView() {
      // 将地图数据编码后传递给web-view
      const encodedMapData = encodeURIComponent(JSON.stringify(this.mapData));
      
      // 使用nginx代理地址
      this.webViewUrl = `http://localhost:2180/static/map-viewer.html?mapData=${encodedMapData}&topicId=${this.topicId}`;
      
      console.log('WebView URL:', this.webViewUrl);
    },
    
    handleMessage(event) {
      console.log('收到web-view消息:', event);
      
      try {
        const data = event.detail && event.detail.data;
        console.log('解析后的消息数据:', data);
        
        if (data && data.action === 'viewDetail') {
          console.log('准备跳转到详情页:', data.mapId);
          
          setTimeout(() => {
            uni.navigateTo({
              url: `/pages/map/detail?id=${data.mapId}&from=browse`,
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