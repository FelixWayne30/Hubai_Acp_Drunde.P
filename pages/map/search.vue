<template>
  <view class="container">
    <!-- 背景设计 -->
    <view class="background-solid"></view>
    
    <view class="background-image-container">
      <image class="background-image-top" src="/static/background/center-bg.png" mode="aspectFill"></image>
      <view class="gradient-overlay"></view>
    </view>
    
    <!-- 搜索区域 -->
    <view class="search-section">
      <view class="search-container">
        <input 
          class="search-input" 
          placeholder="搜索地图、专题..." 
          placeholder-class="search-placeholder"
          confirm-type="search"
          @confirm="performSearch"
          v-model="searchQuery"
          auto-focus
        />
        <view 
          v-if="searchQuery" 
          class="clear-button" 
          @click="clearSearch"
        >
          <text class="clear-icon">×</text>
        </view>
      </view>
    </view>
    
    <!-- 搜索结果 -->
    <scroll-view class="results-scroll" scroll-y :show-scrollbar="false" @scrolltolower="loadMoreResults">
      <view class="results-container">
        <view class="results-header">
          <text class="results-title">搜索结果</text>
          <text class="results-count">找到 {{searchResults.length}} 个结果</text>
        </view>
        
        <view class="no-results" v-if="searchResults.length === 0 && !isLoading">
          <image class="empty-icon" src="/static/empty.png"></image>
          <view class="empty-text">未找到相关结果</view>
          <view class="empty-tips">请尝试其他关键词</view>
        </view>
        
        <view class="loading-indicator" v-if="isLoading">
          <view class="loading-spinner"></view>
          <view class="loading-text">搜索中...</view>
        </view>
        
        <!-- 搜索结果列表 -->
        <view 
          class="result-item"
          v-for="(item, index) in searchResults"
          :key="index"
          @click="navigateToDetail(item.id)"
        >
          <!-- 缩略图 -->
          <image class="result-thumb" :src="item.thumbnail" mode="aspectFill"></image>
          
          <!-- 地图信息 -->
          <view class="result-info">
            <view class="result-title">{{item.title}}</view>
            <view class="result-description">{{truncateDescription(item.description)}}</view>
            
            <view class="result-meta">
              <text class="result-type">{{item.type}}</text>
              <text class="result-date">{{formatDate(item.create_time)}}</text>
            </view>
          </view>
        </view>
        
        <!-- 加载更多 -->
        <view class="load-more" v-if="hasMore && searchResults.length > 0">
          <text class="load-more-text">上拉加载更多</text>
        </view>
        
        <!-- 没有更多 -->
        <view class="no-more" v-if="!hasMore && searchResults.length > 0">
          <text class="no-more-text">已显示全部结果</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { API } from '@/common/config.js';
import { generateThumbnailUrl } from '@/common/utils.js';
import thumbnailCache from '@/common/cache.js';

export default {
  data() {
    return {
      searchQuery: '',
      isLoading: false,
      searchResults: [],
      page: 1,
      pageSize: 10,
      hasMore: true
    };
  },
  
  onLoad(options) {
    // 如果从首页带查询参数过来
    if (options.query) {
      this.searchQuery = decodeURIComponent(options.query);
      this.performSearch();
    }
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    this.page = 1;
    this.searchResults = [];
    this.hasMore = true;
    this.performSearch();
  },
  
  methods: {
    // 执行搜索
    performSearch() {
      if (!this.searchQuery.trim()) {
        uni.showToast({
          title: '请输入搜索内容',
          icon: 'none'
        });
        return;
      }
      
      this.isLoading = true;
      this.searchResults = [];
      this.page = 1;
      this.hasMore = true;
      
      this.fetchSearchResults();
    },
    
    // 从API获取搜索结果
    fetchSearchResults() {
      // 构建查询参数
      const queryParams = {
        query: this.searchQuery,
        page: this.page,
        size: this.pageSize
      };
      
      // 调用搜索API
      uni.request({
        url: API.SEARCH,
        method: 'GET',
        data: queryParams,
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 200) {
            const results = res.data.data || [];
            
            // 处理结果，生成缩略图
            const processedResults = results.map(item => {
              // 检查缓存中是否有缩略图
              let thumbnail = thumbnailCache.getThumbnail(item.map_id);
              
              // 如果缓存中没有，则生成新的缩略图URL
              if (!thumbnail) {
                thumbnail = generateThumbnailUrl(item.map_id, item.width, item.height);
                // 缓存缩略图
                thumbnailCache.setThumbnail(item.map_id, thumbnail, item);
              }
              
              return {
                id: item.map_id,
                title: item.title,
                description: item.description || '暂无描述',
                type: item.type || '未分类',
                create_time: item.create_time,
                thumbnail: thumbnail || '/static/placeholder.png'
              };
            });
            
            // 更新结果列表
            if (this.page === 1) {
              this.searchResults = processedResults;
            } else {
              this.searchResults = [...this.searchResults, ...processedResults];
            }
            
            // 判断是否还有更多结果
            this.hasMore = results.length === this.pageSize;
          } else {
            uni.showToast({
              title: '搜索失败',
              icon: 'none'
            });
            console.error('搜索API返回错误:', res.data);
          }
        },
        fail: (err) => {
          uni.showToast({
            title: '网络错误，请稍后重试',
            icon: 'none'
          });
          console.error('搜索请求失败:', err);
        },
        complete: () => {
          this.isLoading = false;
          uni.stopPullDownRefresh();
        }
      });
    },
    
    // 加载更多结果
    loadMoreResults() {
      if (!this.hasMore || this.isLoading) return;
      
      this.page++;
      this.isLoading = true;
      this.fetchSearchResults();
    },
    
    // 清空搜索
    clearSearch() {
      this.searchQuery = '';
      this.searchResults = [];
    },
    
    // 跳转到详情页
    navigateToDetail(mapId) {
      uni.navigateTo({
        url: `/pages/map/detail?id=${mapId}`
      });
    },
    
    // 截断描述文本
    truncateDescription(text) {
      if (!text) return '暂无描述';
      return text.length > 60 ? text.substring(0, 60) + '...' : text;
    },
    
    // 格式化日期
    formatDate(dateStr) {
      if (!dateStr) return '';
      
      try {
        const date = new Date(dateStr);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      } catch (e) {
        return dateStr;
      }
    }
  }
};
</script>

<style>
.container {
  position: relative;
  min-height: 100vh;
  padding-bottom: 30rpx;
}

/* 背景设计 */
.background-solid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #E8F4F0;
  z-index: -2;
}

.background-image-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 45%;
  z-index: -1;
  overflow: hidden;
}

.background-image-top {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 60%;
  background: linear-gradient(to top, transparent 0%, #E8F4F0 100%);
  z-index: 1;
}

/* 搜索区域 */
.search-section {
  padding: 30rpx 30rpx;
  position: relative;
  z-index: 2;
}

.search-container {
  position: relative;
  height: 88rpx;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 2rpx 16rpx rgba(46, 139, 87, 0.08);
  border: 2rpx solid rgba(255, 255, 255, 0.3);
}

.search-input {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 30rpx;
  color: #333333;
  padding: 0 30rpx;
  margin: 0;
}

.search-placeholder {
  color: #CCCCCC;
  font-size: 30rpx;
}

.clear-button {
  width: 60rpx;
  height: 60rpx;
  margin-right: 14rpx;
  background-color: #F5F5F5;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.clear-icon {
  font-size: 36rpx;
  color: #999999;
  font-weight: normal;
  line-height: 1;
}

/* 搜索结果区域 */
.results-scroll {
  height: calc(100vh - 150rpx);
  position: relative;
  z-index: 2;
}

.results-container {
  padding: 0 30rpx 50rpx;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  margin-bottom: 20rpx;
}

.results-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
}

.results-count {
  font-size: 28rpx;
  color: #999999;
}

/* 搜索结果项 */
.result-item {
  display: flex;
  padding: 30rpx;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(46, 139, 87, 0.06);
}

.result-thumb {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
  background-color: #f0f0f0;
}

.result-info {
  flex: 1;
  margin-left: 30rpx;
  display: flex;
  flex-direction: column;
}

.result-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 16rpx;
}

.result-description {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.5;
  flex: 1;
}

.result-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 20rpx;
}

.result-type {
  font-size: 24rpx;
  color: #2E8B57;
  background-color: rgba(46, 139, 87, 0.1);
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}

.result-date {
  font-size: 24rpx;
  color: #999999;
}

/* 空结果 */
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #666666;
  margin-bottom: 16rpx;
}

.empty-tips {
  font-size: 28rpx;
  color: #999999;
}

/* 加载指示器 */
.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
}

.loading-spinner {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 20rpx;
  border: 6rpx solid rgba(46, 139, 87, 0.1);
  border-top: 6rpx solid #2E8B57;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 28rpx;
  color: #666666;
}

/* 加载更多和没有更多 */
.load-more, .no-more {
  text-align: center;
  padding: 30rpx 0;
}

.load-more-text, .no-more-text {
  font-size: 26rpx;
  color: #999999;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>