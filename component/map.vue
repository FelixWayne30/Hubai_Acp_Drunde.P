<script>
export default {
  name: "MapItem",
  props:{
    item:{
      type: Object,
      required:true
    },
    index:{
      type:Number,
      required:true
    }
  },
  data(){
    return {

    }
  },
  methods:{
    navigateToMap(id, index) {
      this.$emit("navigateToMap", { id, index });
    },
    navigateToDetail(id) {
      this.$emit("navigateToDetail", { id });
    },
    handleImageError(e) {
      this.$emit("handleImageError", e);
    },
  }
}
</script>

<template>
    <view class="map-item">
      <view class="map-header">
        <view class="map-name">{{item.title}}</view>
      </view>

      <view class="map-content">
        <view class="map-thumbnail-wrapper">
          <image
              class="map-thumbnail"
              :src="item.thumbnail"
              mode="aspectFill"
              @click="navigateToMap(item.id, index)"
              @error="handleImageError"
          ></image>
        </view>

        <view class="map-info">
          <view class="map-description" v-if="item.description">
            <text>{{item.description}}</text>
          </view>
          <view class="action-buttons">
            <button class="detail-btn primary-bg" @click="navigateToDetail(item.id)">查看详情</button>
          </view>
        </view>
      </view>
    </view>
</template>

<style scoped>
/* ========== 优化后的地图卡片 ========== */
.map-item {
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 24rpx;
  margin-bottom: 32rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(46, 139, 87, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.map-item:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 16rpx rgba(46, 139, 87, 0.12);
}

.map-header {
  padding: 32rpx 32rpx 10rpx;
  border-bottom: 2rpx solid #F5F7FA;
}

.map-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #3c3c3c;
}

.map-content {
  padding: 10rpx 32rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.map-thumbnail-wrapper {
  width: 100%;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.map-thumbnail {
  width: 100%;
  height: 360rpx;
  object-fit: cover;
  display: block;
}

.map-info {
  flex: 1;
}

.map-description {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.6;
  margin-bottom: 24rpx;
  text-align: justify;
}

/* ========== 按钮样式优化 ========== */
.action-buttons {
  display: flex;
  gap: 20rpx;
}

.detail-btn, .browse-btn {
  flex: 1;
  height: 70rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 30rpx;
  font-size: 30rpx;
  font-weight: 500;
  transition: all 0.2s;
}

.detail-btn {
  color: #FFFFFF;
  border: none;
  background-color: rgba(94, 146, 118);
}

.detail-btn:active {
  background-color: rgba(94, 146, 118, 0.6) !important;
}

.browse-btn {
  background-color: #FFFFFF;
  color: #2E8B57;
  border: 2rpx solid #2E8B57;
}

.browse-btn:active {
  background-color: #F0F8F4;
  transform: scale(0.98);
}

/* ========== 适配不同屏幕 ========== */
@media screen and (min-width: 768px) {
  .map-content {
    flex-direction: row;
    align-items: flex-start;
  }

  .map-thumbnail-wrapper {
    width: 300rpx;
    flex-shrink: 0;
  }

  .map-thumbnail {
    height: 240rpx;
  }

  .map-info {
    margin-left: 24rpx;
  }

  .action-buttons {
    justify-content: flex-start;
  }

  .detail-btn, .browse-btn {
    flex: none;
    width: 180rpx;
  }
}
</style>