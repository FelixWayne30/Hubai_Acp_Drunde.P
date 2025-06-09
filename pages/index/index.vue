<template>
  <view class="container">
    <!-- 插画背景层 -->
    <view class="background-image">
      <image class="bg-illustration" src="/static/background/main-bg.png" mode="aspectFill"></image>
      <view class="bg-overlay"></view>
    </view>
    
    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 顶部标题区域 -->
      <view class="header-section">
        <view class="app-title">
          <text class="title-sub">探索荆楚大地·记录自然之美</text>
        </view>
      </view>
      
      <!-- 搜索悬浮卡片 -->
      <view class="search-floating-card">
        <view class="search-container">
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
      </view>
      
      <!-- 专题探索悬浮卡片 -->
      <view class="topics-floating-card">
        <view class="card-header">
          <text class="section-title">专题探索</text>
          <view class="section-subtitle">发现湖北自然资源的多样魅力</view>
        </view>
        
        <!-- 专题内容滚动区域 -->
        <scroll-view class="topics-scroll-content" scroll-y :show-scrollbar="false">
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
                
                <!-- 卡片内容 -->
                <view class="card-content">
                  <text class="card-title">{{card.topic.title}}</text>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
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
      irregularLayout: [], 
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
      const chineseNumbers = ['壹','贰','叁','肆','伍','陆','柒','捌','玖','拾','拾壹', '拾贰', '拾叁'];
      
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
  background: #F0F2F5;
}

/* ========== 插画背景层 ========== */
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

.bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.15);
}

/* ========== 主要内容区域 ========== */
.main-content {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding: 0 30rpx;
}

/* ========== 顶部标题区域 ========== */
.header-section {
  padding: 200rpx 0 100rpx;
  text-align: center;
}

.app-title {
  margin-bottom: 20rpx;
}

.title-sub {
  font-size: 50rpx;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 3rpx;
  font-weight: 300;
/*  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3); */
  font-family: "ChillKai";
}

/* ========== 搜索悬浮卡片 ========== */
.search-floating-card {
  background: rgba(241, 241, 241, 0.9);
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 50rpx;
  backdrop-filter: blur(20rpx);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.search-container {
  position: relative;
  height: 88rpx;
/*  background: rgba(241, 241, 241, 0.9); */
  border-radius: 44rpx;
  display: flex;
  align-items: center;
}

.search-input {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 35rpx;
  color: #a8a8a8;
  padding: 0 20rpx;
  margin: 0;
}

.search-placeholder {
  color: #a8a8a8;
  font-size: 35rpx;
}

.clear-button {
  width: 60rpx;
  height: 60rpx;
  margin-right: 14rpx;
  background: #E9ECEF;
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

/* ========== 专题探索悬浮卡片 ========== */
.topics-floating-card {
  background: #f1f1f1;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 60rpx;
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.15);
  max-height: calc(100vh - 460rpx);
  min-height: 500rpx;
  display: flex;
  flex-direction: column;
}

.card-header {
  margin-bottom: 30rpx;
  flex-shrink: 0;
}

.section-title {
  font-size: 38rpx;
  font-weight: 700;
  color: #2D3748;
  margin-bottom: 8rpx;
  letter-spacing: 1rpx;
}

.section-subtitle {
  font-size: 24rpx;
  color: #718096;
  opacity: 0.8;
}

.topics-scroll-content {
  flex: 1;
  overflow: hidden;
}

/* ========== 不规则拼贴布局 ========== */
.irregular-masonry {
  width: 100%;
  padding-bottom: 40rpx;
}

.masonry-row {
  display: flex;
  margin-bottom: 12rpx;
  width: 100%;
}

/* ========== 专题卡片样式 ========== */
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
  background: #bee2e7;
}

.color-lavender {
  background: #f3f0df;
}

.color-peach {
  background: #c7e2cf;
}

.color-sky {
  background: #e5e6f3;
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
  font-size: 50rpx;
  font-weight: normal;
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
  font-size: 36rpx;
  font-weight: normal;
  color: #464740;
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
  font-size: 36rpx;
  font-weight: normal;
  line-height: 1.4;
}

.card-narrow .card-number {
  font-size: 50rpx;
  font-weight: normal;
  color: rgba(0,0,0,0.1);
  top: 12rpx;
  right: 14rpx;
}

.card-ultra-wide .card-title {
  font-size: 36rpx;
  font-weight: normal;
}

.card-wide .card-title {
  font-size: 36rpx;
  font-weight: normal;
}
</style>