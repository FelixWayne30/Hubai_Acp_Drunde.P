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
      
      <!-- 动态渲染目录卡片 -->
            <block v-for="(catalog, index) in catalogs" :key="index">
              <view class="catalog-card" :style="getCardStyle(index)">
                <view class="card-content" :style="getCardContentStyle(index)">{{ catalog.group }}</view>
                <view class="card-indicator" :style="getCardIndicatorStyle(index)" @click="toggleDropdown(index)">
                  <text class="dropdown-icon">{{ dropdownStates[index] ? '▲' : '▼' }}</text>
                </view>
              </view>
              <view v-if="dropdownStates[index]" class="dropdown-content" :style="getDropdownStyle(index)">
                <view class="dropdown-item" v-for="(subgroup, subIndex) in catalog.subgroups" :key="subIndex">
                  <view class="dropdown-item-content" @click="toggleSecondaryDropdown(index, subIndex)">
                    <text class="secondary-toggle-icon">{{ secondaryDropdownStates[index][subIndex] ? '▼' : '▶' }}</text>
                    <text>{{ subgroup.subgroup }}</text>
                  </view>
                  <view v-if="secondaryDropdownStates[index][subIndex]" class="secondary-dropdown-content">
                    <view class="secondary-dropdown-item" v-for="(map, mapIndex) in subgroup.maps" :key="mapIndex">
                      {{ map }}
                    </view>
                  </view>
                </view>
              </view>
            </block>
          </view>
        </view>
</template>

<script>
import { API } from '@/common/config.js';

export default {
  data() {
    return {
      searchQuery: '',
      dropdownStates: [],
      secondaryDropdownStates: [],
      catalogs: [] // 存储目录数据
    }
  },
  
  methods: {
	getCatalogs() {
	    uni.request({
	      url: API.CATALOGS, // 从 config.js 导入
	      method: 'GET',
	      success: (res) => {
	        if (res.statusCode === 200 && res.data.code === 200) {
	          this.catalogs = res.data.data;
	          // 初始化状态数组
	          this.dropdownStates = new Array(this.catalogs.length).fill(false);
	          this.secondaryDropdownStates = this.catalogs.map(group => 
	            new Array(group.subgroups.length).fill(false)
	          );
	        } else {
	          uni.showToast({
	            title: '获取目录失败',
	            icon: 'none'
	          });
	        }
	      },
	      fail: () => {
	        uni.showToast({
	          title: '网络错误',
	          icon: 'none'
	        });
	      }
	    });
	  },
	  
	getCardStyle(index) {
	    const colors = ['#ebf4fb', '#f7f8e0', '#e6f2e9', '#f5f2f8'];
	    return `background-image: linear-gradient(to right, ${colors[index % colors.length]}, #ffffff 20%);`;
	  },
	  getCardContentStyle(index) {
	    const colors = ['#95bbce', '#cbc77c', '#9bb38d', '#b7aabf'];
	    return `color: ${colors[index % colors.length]};`;
	  },
	  getCardIndicatorStyle(index) {
	    const colors = ['#95bbce', '#cbc77c', '#9bb38d', '#b7aabf'];
	    return `background-color: ${colors[index % colors.length]};`;
	  },
	  getDropdownStyle(index) {
	    const colors = ['#ebf4fb', '#f7f8e0', '#e6f2e9', '#f5f2f8'];
	    const borderColors = ['#95bbce', '#cbc77c', '#9bb38d', '#b7aabf'];
	    return `background-color: ${colors[index % colors.length]}; border: 2rpx solid ${borderColors[index % borderColors.length]};`;
	  },
	  
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
    
    toggleDropdown(index) {
      this.dropdownStates[index] = !this.dropdownStates[index];
      // Close all secondary dropdowns when primary dropdown is toggled
      if (!this.dropdownStates[index]) {
        this.secondaryDropdownStates[index] = [false, false, false];
      }
      this.$forceUpdate(); // Ensure UI updates
    },
    
    toggleSecondaryDropdown(cardIndex, itemIndex) {
      this.secondaryDropdownStates[cardIndex][itemIndex] = !this.secondaryDropdownStates[cardIndex][itemIndex];
      this.$forceUpdate(); // Ensure UI updates
    }
  },
  
  onLoad() {
    this.getCatalogs();
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

/* 主要下拉栏目 */
.dropdown-content {
  border-radius: 10rpx;
  margin-top: 10rpx;
  padding: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  z-index: 3;
}

.dropdown-item {
  padding: 15rpx 20rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.1);
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item-content {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  color: #333333;
}

.secondary-toggle-icon {
  font-size: 24rpx;
  color: #666666;
  margin-right: 10rpx;
}

/* 次级下拉栏目 */
.secondary-dropdown-content {
  background-color: #ffffff;
  border-radius: 8rpx;
  margin-top: 10rpx;
  margin-left: 30rpx;
  padding: 15rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  z-index: 4;
}

.secondary-dropdown-item {
  font-size: 26rpx;
  color: #333333;
  padding: 10rpx 15rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
}

.secondary-dropdown-item:last-child {
  border-bottom: none;
}
</style>