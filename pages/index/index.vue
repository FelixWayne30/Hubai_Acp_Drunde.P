<template>
  <view class="container">
    <!-- 渐变背景层 -->
    <view class="gradient-background">
      <view class="gradient-layer-1"></view>
      <view class="gradient-layer-2"></view>
    </view>
    
    <!-- 顶部插画区域 -->
    <view class="illustration-section">
      <view class="illustration-container">
        <image class="header-illustration" src="/static/illustrations/header-bg.png" mode="aspectFill"></image>
        <view class="illustration-overlay"></view>
      </view>
      
      <view class="header-content">
        <view class="app-title">
          <text class="title-sub">探索荆楚大地·记录自然之美</text>
        </view>
      </view>
    </view>
    
    <!-- 搜索区域 -->
    <view class="search-section">
      <view class="search-wrapper">
        <view class="search-container">
          <view class="search-icon-wrapper">
            <text class="search-icon"></text>
          </view>
          <input 
            class="search-input" 
            placeholder="搜索地图、专题..." 
            placeholder-class="search-placeholder"
            confirm-type="search"
            @confirm="performSearch"
            @input="onSearchInput"
            v-model="searchQuery"
          />
          <view 
            v-if="searchQuery" 
            class="clear-button" 
            @click="clearSearch"
          >
            <text class="clear-icon">×</text>
          </view>
        </view>
        <view class="search-shadow"></view>
      </view>
    </view>
    
    <!-- 专题探索区域 -->
    <scroll-view class="topics-scroll" scroll-y :show-scrollbar="false">
      <view class="topics-section">
        <view class="section-header">
          <view class="section-title-wrapper">
            <text class="section-title">专题探索</text>
            <view class="section-subtitle">发现湖北自然资源的多样魅力</view>
          </view>
        </view>
        
        <!-- 固定不规则拼贴布局 -->
        <view class="irregular-masonry">
          <view 
            class="masonry-row" 
            v-for="(row, rowIndex) in irregularLayout" 
            :key="rowIndex"
            :style="{ height: row.height + 'rpx' }"
          >
            <view 
              class="topic-card"
              v-for="(card, cardIndex) in row.cards"
              :key="cardIndex"
              :class="[card.sizeClass, card.colorClass]"
              :style="{ 
                width: card.width,
                height: '100%',
                marginRight: cardIndex < row.cards.length - 1 ? '12rpx' : '0'
              }"
              @click="navigateToTopic(card.topic.id)"
            >
              <!-- 汉字编号 -->
              <view class="card-number">{{card.chineseNumber}}</view>
              
              <!-- 简洁卡片内容 -->
              <view class="card-content">
                <text class="card-title">{{card.topic.title}}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { API } from '@/common/config.js'
import { generateThumbnailUrl } from '@/common/utils.js' 
import thumbnailCache from '@/common/cache.js' 

export default {
  data() {
    return {
      searchQuery: '',
      topicList: [],
      irregularLayout: [], // 不规则布局数据
    }
  },
  watch: {
    topicList: {
      handler() {
        this.generateIrregularLayout();
      },
      immediate: true
    }
  },
  onLoad() {
    this.getTopics()
  },
  methods: {
    // 生成固定不规则拼贴布局
    generateIrregularLayout() {
      if (this.topicList.length === 0) return;
      
      const topics = [...this.topicList];
      const layout = [];
      
      // 固定的不规则布局方案 - 有设计感的尺寸组合
      const layoutPatterns = [
        // 方案1: 宽 + 窄 + 窄
        {
          cards: [
            { width: '60%', sizeClass: 'card-wide' },
            { width: '19%', sizeClass: 'card-narrow' },
            { width: '19%', sizeClass: 'card-narrow' }
          ],
          height: 220
        },
        // 方案2: 方 + 方 + 方
        {
          cards: [
            { width: '32%', sizeClass: 'card-square' },
            { width: '32%', sizeClass: 'card-square' },
            { width: '32%', sizeClass: 'card-square' }
          ],
          height: 180
        },
        // 方案3: 超宽
        {
          cards: [
            { width: '100%', sizeClass: 'card-ultra-wide' }
          ],
          height: 160
        },
        // 方案4: 窄 + 超宽
        {
          cards: [
            { width: '25%', sizeClass: 'card-narrow' },
            { width: '73%', sizeClass: 'card-wide' }
          ],
          height: 200
        },
        // 方案5: 中 + 中
        {
          cards: [
            { width: '48%', sizeClass: 'card-medium' },
            { width: '48%', sizeClass: 'card-medium' }
          ],
          height: 190
        },
        // 方案6: 窄 + 方 + 窄
        {
          cards: [
            { width: '23%', sizeClass: 'card-narrow' },
            { width: '46%', sizeClass: 'card-square' },
            { width: '23%', sizeClass: 'card-narrow' }
          ],
          height: 170
        },
        // 方案7: 超宽 + 窄
        {
          cards: [
            { width: '75%', sizeClass: 'card-wide' },
            { width: '23%', sizeClass: 'card-narrow' }
          ],
          height: 180
        }
      ];
      
      // 汉字编号
      const chineseNumbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十'];
      
      // 淡色配色方案
      const colorSchemes = [
        'color-mint',      // 薄荷绿
        'color-lavender',  // 薰衣草紫
        'color-peach',     // 桃粉色
        'color-sky',       // 天空蓝
        'color-cream',     // 奶油色
        'color-sage',      // 鼠尾草绿
        'color-coral',     // 珊瑚色
        'color-vanilla'    // 香草色
      ];
      
      let topicIndex = 0;
      let patternIndex = 0;
      
      while (topicIndex < topics.length) {
        const pattern = layoutPatterns[patternIndex % layoutPatterns.length];
        const rowCards = [];
        
        for (let i = 0; i < pattern.cards.length && topicIndex < topics.length; i++) {
          const topic = topics[topicIndex];
          const cardConfig = pattern.cards[i];
          
          rowCards.push({
            topic: topic,
            width: cardConfig.width,
            sizeClass: cardConfig.sizeClass,
            colorClass: colorSchemes[topicIndex % colorSchemes.length],
            chineseNumber: chineseNumbers[topicIndex % chineseNumbers.length]
          });
          
          topicIndex++;
        }
        
        layout.push({
          height: pattern.height,
          cards: rowCards
        });
        
        patternIndex++;
      }
      
      this.irregularLayout = layout;
    },

    getTopics() {
      uni.showLoading({
        title: '加载中...'
      })
      
      uni.request({
        url: API.TOPICS,
        method: 'GET',
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 200) {
            this.topicList = res.data.data.map(item => ({
              id: item.topic_id,
              title: item.title,
              image: item.image || "/static/icons/topic-default.png"
            }))
          } else {
            uni.showToast({
              title: '获取专题数据失败',
              icon: 'none'
            })
          }
        },
        fail: (err) => {
          uni.showToast({
            title: '网络错误，请稍后重试',
            icon: 'none'
          })
        },
        complete: () => {
          uni.hideLoading()
        }
      })
    },

    onSearchInput(e) {
      this.searchQuery = e.detail.value;
    },
       
    navigateToTopic(topicId) {
      if (!topicId) return;
      uni.navigateTo({
        url: '/pages/map/topic-intro?topic_id=' + topicId
      });
    },
    
    performSearch() {
      if (!this.searchQuery.trim()) {
        uni.showToast({
          title: '请输入搜索内容',
          icon: 'none'
        });
        return;
      }
      
      uni.navigateTo({
        url: `/pages/map/search?query=${encodeURIComponent(this.searchQuery)}`
      });
    },
    
    clearSearch() {
      this.searchQuery = '';
    }
  }
}
</script>

<style>
.container {
  position: relative;
  min-height: 100vh;
  background: #F8F6F0;
}

/* ========== 简洁渐变背景 ========== */
.gradient-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -2;
}

.gradient-layer-1 {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #F8F6F0 0%, #F2EFE7 50%, #EDE8DB 100%);
}

.gradient-layer-2 {
  position: absolute;
  width: 100%;
  height: 50%;
  top: 0;
  background: linear-gradient(180deg, rgba(220,210,190,0.2) 0%, transparent 100%);
}

/* ========== 插画区域 ========== */
.illustration-section {
  position: relative;
  height: 360rpx;
  overflow: hidden;
}

.illustration-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.header-illustration {
  width: 100%;
  height: 100%;
  opacity: 0.9;
}

.illustration-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 50%, transparent 100%);
}

.header-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.app-title {
  text-align: center;
  padding: 0 40rpx;
}

.title-main {
  display: block;
  font-size: 46rpx;
  font-weight: 800;
  color: #FFFFFF;
  text-shadow: 0 3rpx 10rpx rgba(0,0,0,0.4);
  margin-bottom: 12rpx;
  letter-spacing: 1rpx;
}

.title-sub {
  display: block;
  font-size: 28rpx;
  color: rgba(255,255,255,0.95);
  letter-spacing: 3rpx;
  font-weight: 300;
}

/* ========== 搜索区域 ========== */
.search-section {
  padding: 40rpx 30rpx 30rpx;
  position: relative;
  z-index: 3;
}

.search-wrapper {
  position: relative;
}

.search-container {
  position: relative;
  height: 88rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  border: 2rpx solid rgba(139,115,85,0.15);
  backdrop-filter: blur(10rpx);
  z-index: 2;
}

.search-shadow {
  position: absolute;
  top: 8rpx;
  left: 4rpx;
  right: 4rpx;
  height: 88rpx;
  background: rgba(139,115,85,0.1);
  border-radius: 44rpx;
  z-index: 1;
}


.search-icon {
  font-size: 28rpx;
  color: #FFFFFF;
}

.search-input {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 30rpx;
  color: #333333;
  padding: 0 20rpx;
  margin: 0;
}

.search-placeholder {
  color: #AAAAAA;
  font-size: 30rpx;
}

.clear-button {
  width: 60rpx;
  height: 60rpx;
  margin-right: 14rpx;
  background: #F5F5F5;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-icon {
  font-size: 36rpx;
  color: #999999;
  font-weight: normal;
  line-height: 1;
}

/* ========== 专题区域 ========== */
.topics-scroll {
  height: calc(100vh - 518rpx);
  position: relative;
  z-index: 2;
}

.topics-section {
  padding: 0 30rpx 80rpx;
}

.section-header {
  padding: 20rpx 0 40rpx;
}

.section-title-wrapper {
  flex: 1;
}

.section-title {
  font-size: 38rpx;
  font-weight: 700;
  color: #8B7355;
  margin-bottom: 8rpx;
  letter-spacing: 1rpx;
}

.section-subtitle {
  font-size: 24rpx;
  color: #A68B5B;
  opacity: 0.8;
}

/* ========== 不规则拼贴布局 ========== */
.irregular-masonry {
  width: 100%;
}

.masonry-row {
  display: flex;
  margin-bottom: 12rpx;
  width: 100%;
}

/* ========== 卡片基础样式 ========== */
.topic-card {
  border-radius: 16rpx;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
}

.topic-card:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
}

/* ========== 淡色配色方案 ========== */
.color-mint {
  background: #dcf9ec;
}

.color-lavender {
  background: #F7F3FF;
}

.color-peach {
  background: #efd9cf;
}

.color-sky {
  background: #e5eef3;
}

.color-cream {
  background: #f8f8ed;
}

.color-sage {
  background: #F6F8F0;
}

.color-coral {
  background: #FFF5F5;
}

.color-vanilla {
  background: #FFFBF0;
}

/* ========== 卡片编号 ========== */
.card-number {
  position: absolute;
  top: 16rpx;
  right: 20rpx;
  font-size: 48rpx;
  font-weight: 600;
  color: rgba(0,0,0,0.1);
  z-index: 1;
  font-family: "Chillkai","PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif;
  line-height: 1;
}

/* ========== 卡片内容区域 ========== */
.card-content {
  position: relative;
  z-index: 2;
  padding: 32rpx 28rpx;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-title {
  font-size: 40rpx;
  font-weight: 900;
  color: #2D3748;
  line-height: 1.5;
  text-align: center;
  font-family: "ChillKai","PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif;
  letter-spacing: 0.5rpx;
}

/* ========== 不同尺寸适配 ========== */
.card-narrow .card-content {
  padding: 20rpx 16rpx;
}

.card-narrow .card-title {
  font-size: 40rpx;
  font-weight: 900;
  line-height: 1.4;
}

.card-narrow .card-number {
  font-size: 48rpx;
  font-weight: 600;
  color: rgba(0,0,0,0.1);
  top: 12rpx;
  right: 14rpx;
}

.card-ultra-wide .card-title {
  font-size: 45rpx;
  font-weight: 900;
}

.card-wide .card-title {
  font-size: 40rpx;
  font-weight: 900;
}
</style>