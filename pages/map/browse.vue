<template>
  <view class="container">
    <web-view :src="webViewUrl" @message="handleMessage"></web-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      topicId: '',
      mapId: '',
      webViewUrl: ''
    }
  },
  onLoad(options) {
    this.topicId = options.topic_id || '';
    this.mapId = options.id || '';
    
    // Use your server's IP address instead of localhost for mini-program access
    this.webViewUrl = `http://localhost:2080/static/map-viewer.html?topic_id=${this.topicId}&map_id=${this.mapId}`;
    console.log('Loading web-view URL:', this.webViewUrl);
  },
  methods: {
    handleMessage(event) {
      const data = event.detail;
      
      switch (data.action) {
        case 'viewDetail':
          uni.navigateTo({
            url: `/pages/map/detail?id=${data.mapId}&from=browse`
          });
          break;
          
        case 'downloadRequest':
          uni.showLoading({
            title: '提交中...'
          });
          
          setTimeout(() => {
            uni.hideLoading();
            uni.showToast({
              title: '申请已提交',
              icon: 'success'
            });
          }, 1500);
          break;
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