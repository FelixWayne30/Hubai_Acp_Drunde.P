<template>
  <view class="container">
    <view class="background">
      <image class="background-image" :src=StaticAssets.BG_MAIN mode="aspectFill"></image>
    </view>
    <view class="content">
      <view class="topics-container">
       <view class="topics-card" @click="navigateToTopicCustom">
         <image class="card-background" :src=StaticAssets.BG_ENTRY_CUSTOM mode="aspectFill"></image>
         <view class="card-content">
           <view class="card-title1">图组自定义</view>
           <view class="card-subtitle1">支持个性化的图组重组</view>
         </view>
       </view>
        <view class="topics-card" @click="navigateToStyleTransfer">
          <image class="card-background" :src=StaticAssets.BG_ENTRY_TRANSFER mode="aspectFill"></image>
          <view class="card-content">
            <view class="card-title2">风格迁移</view>
            <view class="card-subtitle2">实现同一图幅不同风格的转换</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { StaticAssets } from '@/env.config.js';
export default {
  data(){
    return {
      StaticAssets
    }
  },
  methods: {
    navigateToTopicCustom() {
      // 跳转到图组自定义页面
      uni.navigateTo({
        url: '/pages/map/topic-custom' // 根据实际路径调整
      });
    },
    navigateToStyleTransfer() {
      // 跳转到风格迁移页面
      uni.navigateTo({
        url: '/pages/map/styletransfer' // 根据实际路径调整
      });
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
  object-fit: cover;
}

.content {
  position: relative;
  z-index: 1;
  padding: 40rpx;
  display: flex;
  justify-content: center;
}

.topics-container {
  background: transparent; /* 移除灰色半透明背景 */
  border-radius: 24rpx;
  padding: 0; /* 移除内边距 */
  box-shadow: none; /* 移除阴影 */
  width: 100%;
  max-width: 1200rpx;
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.topics-card {
  background: transparent; /* 移除白色背景 */
  border-radius: 16rpx;
  padding: 0; /* 移除内边距 */
  box-shadow: none; /* 移除阴影 */
  min-height: 250rpx;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  position: relative;
  overflow: hidden;
  /* 添加点击效果 */
  cursor: pointer;
}

.topics-card:active {
  transform: scale(0.98); /* 点击时轻微缩小效果 */
}

.card-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  object-fit: cover;
}

.card-content {
  position: relative;
  z-index: 1;
  padding: 30rpx; /* 将内边距移到内容区域 */
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end; /* 让文字内容在底部对齐 */
}

.card-title1 {
  font-size: 36rpx;
  font-weight: bold;
  color: #588e32; /* 改为绿色文字 */
  margin-bottom: 10rpx;
}

.card-subtitle1 {
  font-size: 28rpx;
  color: #728e5c; /* 改为浅色文字 */
  margin-bottom: 0;
}

.card-title2 {
  font-size: 36rpx;
  font-weight: bold;
  color: #b68c02; /* 改为橙色文字 */
  margin-bottom: 10rpx;
}

.card-subtitle2 {
  font-size: 28rpx;
  color: #b69d49; /* 改为浅色文字 */
  margin-bottom: 0;
}
</style>