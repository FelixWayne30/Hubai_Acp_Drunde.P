<template>
  <view class="container">
    <view class="background">
      <image class="background-image" :src=StaticAssets.BG_MAIN mode="aspectFill"></image>
    </view>
    <view class="content">
      <view class="topics-container">
       <view class="topics-card">
         <image class="card-background" :src=StaticAssets.BG_EXPLORE1 mode="aspectFill"></image>
         <view class="card-title">千湖织锦</view>
         <view class="card-subtitle">长江沿岸湿地生态矩阵</view>
       </view>
        <view class="topics-card">
          <image class="card-background" :src=StaticAssets.BG_EXPLORE2 mode="aspectFill"></image>
          <view class="card-title">青铜楚韵</view>
          <view class="card-subtitle">鄂东矿产资源开发史话</view>
        </view>
        <view class="topics-card">
          <image class="card-background" :src=StaticAssets.BG_EXPLORE3 mode="aspectFill"></image>
          <view class="card-title">鄂西地脉</view>
          <view class="card-subtitle">山地灾害风险智能预警图谱</view>
        </view>
		<view class="topics-card">
		  <image class="card-background" :src=StaticAssets.BG_EXPLORE4 mode="aspectFill"></image>
		  <view class="card-title">荆楚田赋</view>
		  <view class="card-subtitle">历史农业资源与现代区划</view>
		</view>
      </view>
    </view>
  </view>
</template>

<script>
import {StaticAssets} from "@/env.config";

export default {
  data() {
    return {
      StaticAssets
    }
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
  padding: 30rpx; 
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  min-height: 250rpx; 
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  position: relative; 
  overflow: hidden; /* 确保背景图片不溢出 */
}

.topics-card:hover {
  transform: translateY(-4rpx);
}

.card-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0; /* 确保背景图片在文字下方 */
  object-fit: cover; /* 确保图片填满容器 */
}

.card-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #464740;
  margin-bottom: 10rpx;
  position: relative; /* Ensure text is above background */
  z-index: 1; /* Bring text to front */
}

.card-subtitle {
  font-size: 28rpx;
  color: #515151;
  margin-bottom: 20rpx;
  position: relative;
  z-index: 1;
}
</style>