<template>
  <view class="container">
    <!-- 基础纯色背景 -->
    <view class="background-solid"></view>
    
    <!-- 顶部装饰背景带渐变过渡效果 -->
    <view class="background-image-container">
      <image class="background-image-top" src="/static/background/hubei-landscape.png" mode="aspectFill"></image>
      <view class="gradient-overlay"></view>
    </view>
    
    <!-- 地图列表 -->
    <scroll-view class="maps-list" scroll-y>
      <view 
        class="map-item" 
        v-for="(item, index) in maps" 
        :key="index"
      >
        <view class="map-name">{{item.title}}</view>
        <view class="map-content">
          <image 
            class="map-thumbnail" 
            :src="item.thumbnail" 
            mode="aspectFill"
            @click="navigateToMap(item.id)"
          ></image>
          <view class="map-description">
            <text>{{item.description}}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      topicId: '',
      topicInfo: {
        id: '',
        title: '加载中...'
      },
      maps: []
    }
  },
  onLoad(options) {
    this.topicId = options.topic_id || '';
    this.getTopicInfo();
    this.getTopicMaps();
    
    // 设置导航栏标题
    uni.getStorage({
      key: 'topicInfo_' + this.topicId,
      success: (res) => {
        // 使用缓存数据
        uni.setNavigationBarTitle({
          title: res.data.title
        });
      },
      fail: () => {
        // 如果没有缓存数据，则在获取后设置
        this.getTopicInfoForTitle();
      }
    });
  },
  methods: {
    // 获取专题信息并设置标题
    getTopicInfoForTitle() {
      // 模拟数据
      const topicData = {
        '1': { id: '1', title: '极目楚天' },
        '2': { id: '2', title: '富饶资源' },
        '3': { id: '3', title: '绿色发展' },
        '4': { id: '4', title: '四水同治' }
      };
      
      if (topicData[this.topicId]) {
        uni.setNavigationBarTitle({
          title: topicData[this.topicId].title
        });
        
        // 缓存数据
        uni.setStorage({
          key: 'topicInfo_' + this.topicId,
          data: topicData[this.topicId]
        });
      }
    },
    // 获取专题信息
    getTopicInfo() {
      // 这里应该是从API获取数据
      // 模拟数据
      const topicData = {
        '1': { id: '1', title: '极目楚天' },
        '2': { id: '2', title: '富饶资源' },
        '3': { id: '3', title: '绿色发展' },
        '4': { id: '4', title: '四水同治' }
      };
      
      if (topicData[this.topicId]) {
        this.topicInfo = topicData[this.topicId];
      }
    },
    
    // 获取该专题下的所有地图
    getTopicMaps() {
      // 这里应该是从API获取数据
      // 模拟数据
      const mapsData = {
        '1': [
          {
            id: 'map1-1',
            title: '湖北省水系概况图',
            thumbnail: '/static/maps/hubei-water-map.png',
            description: '本图以湖北省域为基础，详细展示了湖北省境内的江河湖泊水系分布情况。图中标识了主要河流如长江、汉江、清江等，以及重要湖泊如洪湖、梁子湖、东湖等。通过颜色深浅区分了不同水系的汇集范围，并标注了主要支流及水文站点位置。'
          },
          {
            id: 'map1-2',
            title: '湖北省水资源分布图',
            thumbnail: '/static/maps/hubei-water-resource.png',
            description: '本图展示湖北省水资源空间分布特征，采用等值线与色带结合的方式表达年均降水量分布，通过统计柱状图反映各市州水资源总量与人均占有量。图中还标注了重点水源地与水资源保护区域，提供了2025年湖北省水资源总量与结构的权威数据。'
          },
          {
            id: 'map1-3',
            title: '长江中游流域综合治理图',
            thumbnail: '/static/maps/yangtze-management.png',
            description: '本图描绘了长江中游流域湖北段的综合治理工程，包括防洪设施、生态修复点、水质监测站等关键基础设施分布。图中以专题符号标记了不同类型的治理项目，展示了2020-2025年间实施的重点工程位置与规模，并通过颜色变化展示治理前后水质改善程度。'
          }
        ],
        '2': [
          {
            id: 'map2-1',
            title: '湖北省国土绿化图',
            thumbnail: '/static/maps/hubei-green.png',
            description: '本图全面展示湖北省国土绿化成果，采用多时相遥感影像分析，对比2015-2025年间林地覆盖变化。图中标识了主要造林区、生态公益林与商品林分布，以及重点林区的树种构成，同时以饼图形式展示全省各类林地面积占比与碳汇能力分析。'
          },
          {
            id: 'map2-2',
            title: '林下经济发展布局图',
            thumbnail: '/static/maps/forest-economy.png',
            description: '此图详细描绘了湖北省林下经济发展现状，标识了各类林下产业基地位置与规模，包括食用菌、中药材、森林养殖等典型产业。图中采用符号注记了重点林下经济示范基地，并以统计图表展示了2025年各市州林下经济产值与结构，展现"绿水青山"转化为"金山银山"的生动实践。'
          }
        ],
        '3': [
          {
            id: 'map3-1',
            title: '湖北省矿产资源分布图',
            thumbnail: '/static/maps/hubei-mineral-map.png',
            description: '本图全面呈现湖北省矿产资源空间分布特征，标注了煤、铁、磷、盐等主要矿产的分布区域与储量等级。图中采用各类专题符号区分不同矿种，同时标注了重点矿区与矿业开发园区位置，结合饼图展示全省矿产资源结构与产值构成，为资源综合利用规划提供空间参考。'
          }
        ],
        '4': [
          {
            id: 'map4-1',
            title: '江河湖库概况',
            thumbnail: '/static/maps/map-demo1.png',
            description: '详细展示湖北省境内的江河湖库水系分布情况，包括长江、汉江等主要河流流域范围，以及洪湖、梁子湖等重要湖泊水域面积与分布。图中标注了各流域之间的水系联系，主要水利枢纽工程位置，以及湖北省水资源总量与结构等关键数据。'
          },
          {
            id: 'map4-2',
            title: '水资源概况',
            thumbnail: '/static/maps/map-demo2.png',
            description: '展示湖北省水资源的分布特征与变化趋势，包括年均降水量分布、地表水资源量、地下水资源量以及可利用水资源总量等。图中以图表形式展示了近十年湖北省水资源变化情况，水资源开发利用现状以及各行业用水结构与效率分析。'
          },
          {
            id: 'map4-3',
            title: '地表水',
            thumbnail: '/static/maps/map-demo3.png',
            description: '详细呈现湖北省地表水空间分布与丰枯变化特征，通过等值线与色带结合的方式表达各区域地表水资源丰富程度。图中标注了主要河流的流量监测站点与历史数据，重点水源地分布，以及地表水水质分区与保护区域划分，为水资源合理配置与利用提供参考。'
          }
        ]
      };
      
      if (mapsData[this.topicId]) {
        this.maps = mapsData[this.topicId];
      }
    },
    
    // 导航到地图浏览页
    navigateToMap(mapId) {
      uni.navigateTo({
        url: `/pages/map/browse?id=${mapId}&topic_id=${this.topicId}`
      });
    }
  }
}
</script>

<style>
.container {
  position: relative;
  min-height: 100vh;
  padding: 0;
  padding-bottom: 30rpx;
}

/* 基础纯色背景 - 淡米色 */
.background-solid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #F9F7F2; /* 淡米色背景 */
  z-index: -2;
}

/* 顶部背景图容器 */
.background-image-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 35%; /* 控制图片覆盖屏幕的比例 */
  z-index: -1;
  overflow: hidden;
}

/* 实际背景图 */
.background-image-top {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 渐变覆盖层用于平滑过渡 */
.gradient-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40%; /* 渐变过渡的高度 */
  background: linear-gradient(to bottom, rgba(249, 247, 242, 0) 0%, rgba(249, 247, 242, 1) 100%);
  z-index: 1;
}

/* 专题标题区域 */
.topic-header {
  padding: 40rpx 30rpx;
  margin-top: 120rpx;
  position: relative;
  z-index: 1;
}

.topic-title {
  font-size: 44rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
  margin-bottom: 20rpx;
}

/* 地图列表 */
.maps-list {
  height: calc(100vh - 120rpx); /* 调整高度，因为移除了标题区域 */
  padding: 160rpx 30rpx 30rpx 30rpx; /* 增加顶部内边距，补偿移除的标题区域 */
  position: relative;
  z-index: 1;
  box-sizing: border-box; /* 确保padding不会增加元素实际尺寸 */
  width: 100%;
}

.map-item {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 20rpx;
  margin-bottom: 40rpx;
  padding: 30rpx;
  box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.08);
  width: 100%;
  box-sizing: border-box; /* 确保内边距计入宽度计算 */
  overflow: hidden; /* 防止内容溢出 */
}

.map-name {
  font-size: 34rpx;
  font-weight: bold;
  color: #2E8B57; /* 与应用中使用的主色调匹配 */
  margin-bottom: 20rpx;
  border-bottom: 1px solid rgba(46, 139, 87, 0.2);
  padding-bottom: 15rpx;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis; /* 文字过长时显示省略号 */
  white-space: nowrap;
}

.map-content {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.map-thumbnail {
  width: 100%;
  height: 300rpx;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
  object-fit: cover; /* 确保图片比例合适 */
}

.map-description {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  width: 100%;
  overflow-wrap: break-word; /* 确保长单词自动换行 */
  word-wrap: break-word;
}

/* 针对不同设备的响应式设计 */
@media screen and (min-width: 768px) {
  .map-content {
    flex-direction: row;
    flex-wrap: wrap; /* 允许在需要时换行 */
    justify-content: space-between;
  }
  
  .map-thumbnail {
    width: 40%;
    height: 250rpx;
    margin-right: 20rpx;
    margin-bottom: 0;
    flex-shrink: 0; /* 防止图片被挤压 */
  }
  
  .map-description {
    width: calc(60% - 20rpx); /* 计算正确的宽度，考虑到margin */
    flex-grow: 1;
  }
}
</style>