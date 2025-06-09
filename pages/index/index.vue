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
      
      <!-- 搜索容器 -->
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
              <!-- 特殊布局：左侧双层+右侧单个 -->
              <template v-if="row.isSpecialLayout">
                <view class="special-layout-container">
                  <!-- 左侧双层容器 -->
                  <view class="left-double-container">
                    <view 
                      class="topic-card half-height-card"
                      :class="row.cards[0].colorClass"
                      @click="navigateToTopic(row.cards[0].topic.id)"
                    >
                      <view class="card-number">{{row.cards[0].chineseNumber}}</view>
                      <view class="card-content">
                        <text class="card-title">{{row.cards[0].topic.title}}</text>
                      </view>
                    </view>
                    
                    <view 
                      class="topic-card half-height-card"
                      :class="row.cards[1].colorClass"
                      @click="navigateToTopic(row.cards[1].topic.id)"
                    >
                      <view class="card-number">{{row.cards[1].chineseNumber}}</view>
                      <view class="card-content">
                        <text class="card-title">{{row.cards[1].topic.title}}</text>
                      </view>
                    </view>
                  </view>
                  
                  <!-- 右侧单个容器 -->
                  <view class="right-single-container">
                    <view 
                      class="topic-card full-height-card"
                      :class="row.cards[2].colorClass"
                      @click="navigateToTopic(row.cards[2].topic.id)"
                    >
                      <view class="card-number">{{row.cards[2].chineseNumber}}</view>
                      <view class="card-content">
                        <text class="card-title">{{row.cards[2].topic.title}}</text>
                      </view>
                    </view>
                  </view>
                </view>
              </template>
              
              <!-- 普通布局 -->
              <template v-else>
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
                  <view class="card-number">{{card.chineseNumber}}</view>
                  <view class="card-content">
                    <text class="card-title">{{card.topic.title}}</text>
                  </view>
                </view>
              </template>
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
      
      // 汉字编号
      const chineseNumbers = ['壹','贰','叁','肆','伍','陆','柒','捌','玖','拾'];
      
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
      
      // 专门为4个专题设计的特殊组合布局方案
      if (topics.length === 4) {
        // 第一行：左侧双层卡片 + 右侧高卡片
        layout.push({
          height: 240,
          isSpecialLayout: true,
          cards: [
            // 左侧垂直叠放的两个卡片
            {
              topic: topics[0],
              width: '48%',
              sizeClass: 'card-half-height-top',
              colorClass: colorSchemes[0],
              chineseNumber: chineseNumbers[0],
              isTopHalf: true
            },
            {
              topic: topics[1], 
              width: '48%',
              sizeClass: 'card-half-height-bottom',
              colorClass: colorSchemes[1],
              chineseNumber: chineseNumbers[1],
              isBottomHalf: true
            },
            // 右侧正常高度卡片
            {
              topic: topics[2],
              width: '48%',
              sizeClass: 'card-full-height',
              colorClass: colorSchemes[2],
              chineseNumber: chineseNumbers[2],
              isRightSide: true
            }
          ]
        });
        
        // 第二行：全宽卡片 (专题4)
        layout.push({
          height: 180,
          cards: [{
            topic: topics[3],
            width: '100%',
            sizeClass: 'card-ultra-wide',
            colorClass: colorSchemes[3],
            chineseNumber: chineseNumbers[3]
          }]
        });
      } 
      // 通用布局方案（适用于其他数量的专题）
      else {
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
          // 方案4: 中 + 中
          {
            cards: [
              { width: '48%', sizeClass: 'card-medium' },
              { width: '48%', sizeClass: 'card-medium' }
            ],
            height: 190
          }
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
      }
      
      this.irregularLayout = layout;
      
      // 调试信息
      console.log('生成的布局数据:', this.irregularLayout);
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
  font-family: "ChillKai";
}

/* ========== 搜索容器 ========== */
.search-container {
  position: relative;
  height: 80rpx;
  background: rgba(245, 245, 245, 0.9);
  border-radius: 10rpx;
  margin-bottom: 60rpx;
  margin-top: 40rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(46, 139, 87, 0.08);
  border: 1rpx solid rgba(255, 255, 255, 0.6);
}

.search-input {
  flex: 1;
  height: 65rpx;
  line-height: 65rpx;
  font-size: 30rpx;
  color: #333333;
  padding: 0 24rpx;
  margin: 0;
  background: transparent;
}

.search-placeholder {
  color: #999999;
  font-size: 30rpx;
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
  font-size: 35rpx;
  font-weight: 400;
  font-family: 'ChillKai';
  color: #3a485e;
  margin-bottom: 8rpx;
  letter-spacing: 2rpx;
}

.section-subtitle {
  font-size: 24rpx;
  font-family: 'ChillKai';
  color: #718096;
  opacity: 0.8;
}

.topics-scroll-content {
  flex: 1;
  overflow: hidden;
}

/* ========== 特殊布局样式 ========== */
.special-layout-container {
  display: flex;
  width: 100%;
  height: 100%;
  gap: 12rpx;
}

/* 左侧双层容器 - 关键：垂直排列 */
.left-double-container {
  width: calc(50% - 6rpx);
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

/* 右侧单个容器 */
.right-single-container {
  width: calc(50% - 6rpx);
  height: 100%;
}

/* 半高卡片 - 占据左侧容器的一半高度 */
.half-height-card {
  height: calc(50% - 6rpx) !important;
  width: 100% !important;
}

/* 全高卡片 - 占据右侧容器的全部高度 */
.full-height-card {
  height: 100% !important;
  width: 100% !important;
}

/* 半高卡片内容调整 */
.half-height-card .card-content {
  padding: 20rpx 20rpx !important;
}

.half-height-card .card-title {
  font-size: 32rpx !important;
  line-height: 1.3 !important;
}

.half-height-card .card-number {
  font-size: 40rpx !important;
  top: 10rpx !important;
  right: 16rpx !important;
}

/* 全高卡片内容调整 */
.full-height-card .card-content {
  padding: 28rpx 24rpx !important;
}

.full-height-card .card-title {
  font-size: 36rpx !important;
  line-height: 1.4 !important;
}

.full-height-card .card-number {
  font-size: 50rpx !important;
  top: 16rpx !important;
  right: 20rpx !important;
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