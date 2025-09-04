<template>
  <view class="container">
    <!-- 背景设计 -->
    <view class="background-solid"></view>
    
    <view class="background-image-container">
      <image class="background-image-top" :src="StaticAssets.BG_MAIN" mode="aspectFill"></image>
      <view class="gradient-overlay"></view>
    </view>
    
    <!-- 搜索区域 -->
    <view class="search-section">
      <view class="search-container">
        <input 
          class="search-input" 
          placeholder="试试智能搜索：武汉市降水量分布" 
          placeholder-class="search-placeholder"
          confirm-type="search"
          @confirm="performSearch"
          @input="onSearchInput"
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
      
      <!-- 搜索建议 -->
      <view class="suggestions-container" v-if="suggestions.length > 0 && searchQuery">
        <view class="suggestions-title">搜索建议</view>
        <view class="suggestions-list">
          <view 
            class="suggestion-item"
            v-for="(suggestion, index) in suggestions"
            :key="index"
            @click="selectSuggestion(suggestion)"
          >
            {{ suggestion }}
          </view>
        </view>
      </view>
    </view>
    
    <!-- 搜索结果 -->
    <scroll-view class="results-scroll" scroll-y :show-scrollbar="false" @scrolltolower="loadMoreResults">
      <view class="results-container">
        <view class="results-header" v-if="hasSearched">
          <text class="results-title">搜索结果</text>
          <text class="results-count">找到 {{totalResults}} 个相关结果</text>
        </view>
        
        <view class="no-results" v-if="searchResults.length === 0 && !isLoading && hasSearched">
          <view class="empty-text">未找到相关结果</view>
          <view class="empty-tips">请尝试其他关键词或换个描述方式</view>
        </view>
        
        <view class="loading-indicator" v-if="isLoading">
          <view class="loading-spinner"></view>
          <view class="loading-text">AI分析中...</view>
        </view>
        
        <!-- 搜索结果列表 -->
        <view 
          class="result-item"
          v-for="(item, index) in searchResults"
          :key="index"
          @click="navigateToDetail(item.map_id)"
        >
          <!-- 缩略图 -->
          <view class="result-thumb-container">
            <image 
              class="result-thumb" 
              :src="item.thumbnail" 
              mode="aspectFill"
            ></image>
            <!-- 加载状态指示器 -->
            <view 
              class="image-loading" 
              v-if="getImageLoadingState(item.map_id).loading"
            >
              <view class="loading-spinner-small"></view>
            </view>
          </view>
          
          <!-- 地图信息 -->
          <view class="result-info">
            <view class="result-title">{{item.title}}</view>
            <view class="result-description">{{truncateDescription(item.description)}}</view>
            
            <view class="result-meta">
              <text class="result-type">{{item.type}}</text>
              <view class="result-badges">
                <text class="relevance-score">匹配度 {{item.relevance_score}}/10</text>
                <text class="subitem-badge" v-if="item.subitem_name">{{item.subitem_name}}</text>
              </view>
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
import { StaticAssets } from '@/env.config.js';
import { API } from '@/common/config.js';
import cacheManager from '@/common/cacheManager.js';
import { generateSubimageUrl } from '@/common/utils';

export default {
  data() {
    return {
      searchQuery: '',
      isLoading: false,
      searchResults: [],
      suggestions: [],
      page: 1,
      pageSize: 10,
      hasMore: true,
      hasSearched: false,
      totalResults: 0,
      suggestionTimer: null,
      imageLoadingStates: new Map(),
      StaticAssets
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
	 
	  getImageLoadingState(mapId) {
	       if (!this.imageLoadingStates.has(mapId)) {
	         this.imageLoadingStates.set(mapId, { loading: false });
	       }
	       return this.imageLoadingStates.get(mapId);
	     },
	     
	     // 设置图片加载状态
	     setImageLoadingState(mapId, loading) {
	       if (!this.imageLoadingStates.has(mapId)) {
	         this.imageLoadingStates.set(mapId, {});
	       }
	       this.imageLoadingStates.get(mapId).loading = loading;
	     }, 
	  
	  
    // 输入监听，获取搜索建议
    onSearchInput(e) {
      this.searchQuery = e.detail.value;
      
      // 清除之前的定时器
      if (this.suggestionTimer) {
        clearTimeout(this.suggestionTimer);
      }
      
      // 设置新的定时器，防抖处理
      if (this.searchQuery.trim() && this.searchQuery.length >= 2) {
        this.suggestionTimer = setTimeout(() => {
          this.getSearchSuggestions();
        }, 300);
      } else {
        this.suggestions = [];
      }
    },
    
    // 获取搜索建议
    getSearchSuggestions() {
      if (!this.searchQuery.trim()) return;
      
      uni.request({
        url: API.SEARCH_SUGGESTIONS,
        method: 'GET',
        data: {
          query: this.searchQuery,
          limit: 5
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 200) {
            this.suggestions = res.data.data || [];
          }
        },
        fail: (err) => {
          console.error('获取搜索建议失败:', err);
        }
      });
    },
    
    // 选择搜索建议
    selectSuggestion(suggestion) {
      this.searchQuery = suggestion;
      this.suggestions = [];
      this.performSearch();
    },
    
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
      this.suggestions = [];
      this.page = 1;
      this.hasMore = true;
      this.hasSearched = true;
      
      this.fetchSearchResults();
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
      this.suggestions = [];
      this.hasSearched = false;
    },
    
    // 跳转到详情页
    navigateToDetail(mapId) {
        // 找到对应的搜索结果项，获取专题信息
        const resultItem = this.searchResults.find(item => item.map_id === mapId);
        
        let url = `/pages/map/detail?id=${mapId}&from=search`;
        
        // 如果有专题信息，添加到URL参数中
        if (resultItem) {
          if (resultItem.topic_id) {
            url += `&topic_id=${resultItem.topic_id}`;
          }
          if (resultItem.topic_name) {
            url += `&topic=${encodeURIComponent(resultItem.topic_name)}`;
          }
		  if (resultItem.subitem_name) {
		        url += `&subitem_name=${encodeURIComponent(resultItem.subitem_name)}`;
		      }
        }
        
        console.log('从搜索页跳转到详情页:', url);
        
        uni.navigateTo({
          url: url
        });
      },
    
      // 从API获取搜索结果 - 保持原有逻辑，确保包含专题信息
      fetchSearchResults() {
        const queryParams = {
          query: this.searchQuery,
          page: this.page,
          size: this.pageSize
        };
        
        uni.request({
          url: API.SEARCH,
          method: 'GET',
          data: queryParams,
          success: (res) => {
            if (res.statusCode === 200 && res.data.code === 200) {
              const data = res.data.data;
              const results = data.results || [];
              const total = data.total || 0;
              
              // 处理结果，生成图片URL，保留专题信息
              const processedResults = results.map(item => {
                console.log(`处理搜索结果: ${item.title}`, {
                  topic_id: item.topic_id,
                  topic_name: item.topic_name
                });
                
                // 设置图片加载状态
                this.setImageLoadingState(item.map_id, true);
                
                // 检查缓存中是否有图片
                let thumbnail = cacheManager.getThumbnail(item.title);
                
                // 如果缓存中没有，则生成新的图片URL
                if (!thumbnail) {
                  thumbnail = generateSubimageUrl(item.title);
                  cacheManager.setThumbnail(item.title, thumbnail, item);
                  console.log(`生成新图片URL: ${thumbnail}`);
                } else {
                  console.log(`使用缓存图片URL: ${thumbnail}`);
                }
                
                // 图片加载完成后更新状态
                setTimeout(() => {
                  this.setImageLoadingState(item.map_id, false);
                }, 1000);
                
                return {
                  map_id: item.map_id,
                  title: item.title,
                  description: item.description || '暂无描述',
                  type: item.type || '未分类',
                  thumbnail: thumbnail ,
                  relevance_score: item.relevance_score || 5,
                  subitem_name: item.subitem_name || '',
                  topic_id: item.topic_id,
                  topic_name: item.topic_name
                };
              });
              
              // 更新结果列表
              if (this.page === 1) {
                this.searchResults = processedResults;
              } else {
                this.searchResults = [...this.searchResults, ...processedResults];
              }
              
              this.totalResults = total;
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
	
    // 截断描述文本
    truncateDescription(text) {
      if (!text) return '暂无描述';
      return text.length > 60 ? text.substring(0, 60) + '...' : text;
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
  padding: 30rpx 30rpx 20rpx;
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
  margin-bottom: 20rpx;
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

/* 搜索建议 */
.suggestions-container {
  margin-bottom: 20rpx;
}

.suggestions-title {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.suggestions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.suggestion-item {
  padding: 8rpx 16rpx;
  background-color: rgba(46, 139, 87, 0.1);
  color: #2E8B57;
  border-radius: 20rpx;
  font-size: 24rpx;
}

/* 搜索结果区域 */
.results-scroll {
  height: calc(100vh - 180rpx);
  position: relative;
  z-index: 2;
}

.results-container {
  padding: 0 30rpx 50rpx;
}

.results-header {
  padding: 20rpx 0;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.result-thumb-container {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  flex-shrink: 0;
}

.result-thumb {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
  background-color: #f0f0f0;
}

.image-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner-small {
  width: 40rpx;
  height: 40rpx;
  border: 3rpx solid rgba(46, 139, 87, 0.1);
  border-top: 3rpx solid #2E8B57;
  border-radius: 50%;
  animation: spin 1s linear infinite;
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
  margin-bottom: 16rpx;
}

.result-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.result-type {
  font-size: 24rpx;
  color: #2E8B57;
  background-color: rgba(46, 139, 87, 0.1);
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}

.result-badges {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
}

.relevance-score {
  font-size: 20rpx;
  padding: 4rpx 10rpx;
  border-radius: 10rpx;
  color: #fff;
  background-color: #ff6b6b;
}

.subitem-badge {
  font-size: 20rpx;
  color: #666;
  background-color: #f0f0f0;
  padding: 4rpx 10rpx;
  border-radius: 10rpx;
}

/* 空结果 */
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
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