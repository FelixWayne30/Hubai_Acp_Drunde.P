<template>
  <view class="container">
    <!-- 插画背景层 -->
    <view class="background-image">
      <image class="bg-illustration" src="/static/background/main-bg.png" mode="aspectFill"></image>
    </view>
    
    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 搜索框 -->
      <view class="search-container">
        <view class="search-inputbox">
          <image class="search-icon" src="/static/icons/search.png" mode="aspectFit"></image>
          <input
              class="search-input"
              placeholder="试试搜索“武汉市降水量”"
              placeholder-class="search-placeholder"
              confirm-type="search"
              @confirm="performSearch"
              @input="onSearchInput"
              v-model="searchQuery"
          />
          <view v-if="searchQuery" class="clear-button" @click="clearSearch">
            <text class="clear-icon">×</text>
          </view>
        </view>
        <view class="search-tag">
          已接入阿里巴巴千问大模型
        </view>
      </view>
      
      <!-- 目录卡片 -->
      <view class="catalog-card" style="background-image: linear-gradient(to right, #ebf4fb, #ffffff 20%);">
        <view class="card-content" style="color: #95bbce;">极目楚天</view>
        <view class="card-indicator" style="background-color: #95bbce;" @click="toggleDropdown">
          <text class="dropdown-icon">▼</text>
        </view>
      </view>
      <view class="catalog-card" style="background-image: linear-gradient(to right, #f7f8e0, #ffffff 20%);">
        <view class="card-content" style="color: #cbc77c;">富饶资源</view>
        <view class="card-indicator" style="background-color: #cbc77c;" @click="toggleDropdown">
          <text class="dropdown-icon">▼</text>
        </view>
      </view>
      <view class="catalog-card" style="background-image: linear-gradient(to right, #e6f2e9, #ffffff 20%);">
        <view class="card-content" style="color: #9bb38d;">绿色发展</view>
        <view class="card-indicator" style="background-color: #9bb38d;" @click="toggleDropdown">
          <text class="dropdown-icon">▼</text>
        </view>
      </view>
      <view class="catalog-card" style="background-image: linear-gradient(to right, #f5f2f8, #ffffff 20%);">
        <view class="card-content" style="color: #b7aabf;">城市新篇</view>
        <view class="card-indicator" style="background-color: #b7aabf;" @click="toggleDropdown">
          <text class="dropdown-icon">▼</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      searchQuery: ''
    }
  },
  methods: {
    onSearchInput(e) {
      this.searchQuery = e.detail.value;
    },
    
    performSearch() {
      if (!this.searchQuery.trim()) {
        uni.showToast({ title: '请输入搜索内容', icon: 'none' });
        return;
      }
      
      uni.navigateTo({
        url: `/pages/map/search?query=${encodeURIComponent(this.searchQuery)}`
      });
    },
    
    clearSearch() {
      this.searchQuery = '';
    },
    
    toggleDropdown() {
      // 这里可以添加下拉逻辑，暂为空
    }
  }
}
</script>

<style>
.container {
  position: relative;
  min-height: 100vh;
  background: #F0F2F5;
}

.background-image {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.bg-illustration {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.main-content {
  position: relative;
  z-index: 2;
  padding: 30rpx;
}

/* 搜索框 */
.search-container {
  height: 120rpx;
  background: rgba(245, 245, 245, 0.7);
  border-radius: 10rpx;
  margin-bottom: 1vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4rpx 20rpx rgba(46, 139, 87, 0.08);
  padding: 10rpx;
}

.search-inputbox {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 8rpx;
  margin-bottom: 10rpx;
}

.search-icon {
  width: 40rpx;
  height: 40rpx;
  margin-left: 20rpx;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  height: 65rpx;
  line-height: 65rpx;
  font-size: 30rpx;
  color: #333333;
  padding-left: 12rpx;
  background: transparent;
}

.search-tag {
  color: rgba(51, 51, 51, 0.7);
  font-size: 20rpx;
  margin-bottom: 10rpx;
  padding: 10rpx;
}

.clear-button {
  width: 45rpx;
  height: 45rpx;
  margin-right: 10rpx;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.clear-button:active {
  background: rgba(0, 0, 0, 0.1);
  transform: scale(0.95);
}

.clear-icon {
  font-size: 32rpx;
  color: #666666;
  font-weight: normal;
  line-height: 1;
}

/* 目录卡片 */
.catalog-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-top: 35rpx;
  height: 80rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  position: relative;
}

.card-content {
  font-size: 32rpx;
  font-weight: bold;
  flex: 1;
  padding-left: 20rpx;
}

.card-indicator {
  width: 25%; 
  height: 100%;
  border-top-right-radius: 10rpx;
  border-bottom-right-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 0;
  top: 0;
}

.dropdown-icon {
  font-size: 24rpx;
  color: #ffffff;
}
</style>