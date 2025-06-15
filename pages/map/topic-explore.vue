<template>
  <view class="container">
    <!-- Background using main-bg.png consistent with index.vue -->
    <view class="background">
      <image class="background-image" src="/static/background/main-bg.png" mode="aspectFill"></image>
    </view>
    
    <!-- Main content area -->
    <view class="content">
      <!-- Translucent container wrapping all topic cards -->
      <view class="topics-container">
        <!-- Card 1 -->
        <view class="topics-card">
          <view class="card-title">千湖织锦</view>
          <view class="card-subtitle">长江沿岸湿地生态矩阵</view>
          <view class="card-content">
            <text>探索长江沿岸湿地生态系统的多样性与保护</text>
          </view>
        </view>
        
        <!-- Card 2 -->
        <view class="topics-card">
          <view class="card-title">青铜楚韵</view>
          <view class="card-subtitle">鄂东矿产资源开发史话</view>
          <view class="card-content">
            <text>追溯鄂东矿产开发的历史与文化传承</text>
          </view>
        </view>
        
        <!-- Card 3 -->
        <view class="topics-card">
          <view class="card-title">鄂西地脉</view>
          <view class="card-subtitle">山地灾害风险智能预警图谱</view>
          <view class="card-content">
            <text>了解山地灾害风险的智能监测与预警技术</text>
          </view>
        </view>
        
        <!-- Card 4 -->
        <view class="topics-card">
          <view class="card-title">荆楚田赋</view>
          <view class="card-subtitle">历史农业资源与现代区划</view>
          <view class="card-content">
            <text>研究历史农业资源与现代区域规划的结合</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Page',
  data() {
    return {
      // Add your data properties here
    }
  },
  methods: {
    // Add your methods here
  }
}
</script>

<style scoped>
.container {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
}

.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.background-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* For web compatibility */
}

.content {
  position: relative;
  z-index: 1;
  padding: 40rpx;
  display: flex;
  justify-content: center;
}

.topics-container {
  background: rgba(241, 241, 241, 0.6);
  border-radius: 24rpx;
  padding: 40rpx;
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 1200rpx; /* Larger than cards for wrapping effect */
  display: flex;
  flex-direction: column;
  gap: 30rpx; /* Space between cards */
}

.topics-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  min-height: 400rpx;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
}

.topics-card:hover {
  transform: translateY(-4rpx);
}

.card-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 10rpx;
}

.card-subtitle {
  font-size: 28rpx;
  color: #7f8c8d;
  margin-bottom: 20rpx;
}

.card-content {
  font-size: 24rpx;
  color: #34495e;
  flex-grow: 1;
  line-height: 1.6;
}
</style>