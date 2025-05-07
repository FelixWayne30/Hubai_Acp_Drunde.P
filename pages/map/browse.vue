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
    
    this.webViewUrl = `http://localhost:2080/static/map-viewer.html?topic_id=${this.topicId}&map_id=${this.mapId}`;
    console.log('加载web-view URL:', this.webViewUrl);
  },
  methods: {
    handleMessage(event) {
      console.log('收到web-view消息:', event);
      
      try {
        // 获取消息数据。
        const data = event.detail && event.detail.data;
        console.log('解析后的消息数据:', data);
        
        if (data && data.action === 'viewDetail') {
          console.log('准备跳转到详情页:', data.mapId);
          
          // 设置延迟确保消息处理完成
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