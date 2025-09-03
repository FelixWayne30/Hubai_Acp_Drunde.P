<template>
  <view class="browse-page">
    <!-- 添加纸质图集封面图 -->
    <view class="cover-image-section">
      <image class="cover-image" mode="aspectFit"  :src="StaticAssets.BG_COVER"></image>
    </view>

    <view class="top-area">
      <!-- 预留工具栏位置，由MapImage组件内部渲染 -->
    </view>

    <view class="map-container-wrapper">
      <view class="map-container" id="map-container">
        <MapImage
            :currentMapUrl="currentMapUrl"
            :allMaps="allMaps"
            :currentMapIndex="currentMapIndex"
            :topic="topic"
            :topicId="topicId"
            :extends="extendsData"
            @switch-map="handleSwitchMap"
            @image-load="handleImageLoad"
            @image-error="handleImageError"
        />
      </view>
    </view>
    <view class="bottom-area">
      <!-- 预留底部区域 -->
    </view>
  </view>
</template>

<script>
import {StaticAssets} from '@/env.config.js';
import MapImage from '../../component/MapImage.vue'
import { API } from '@/common/config.js'

export default {
  components: {
    MapImage
  },

  data() {
    return {
      // 地图数据
      allMaps: [],
      currentMapIndex: 0,

      // 路由参数
      mapId: '',
      topic: '',
      topicId: '',
      extendsData: null,
      StaticAssets,

      // 内部状态
      currentMapUrlCache: ''
    }
  },

  computed: {
    currentMapUrl() {
      if (this.allMaps.length === 0 || this.currentMapIndex < 0) {
        return ''
      }
      const currentMap = this.allMaps[this.currentMapIndex]
      if (!currentMap) {
        return ''
      }

      // 生成原图URL
      return API.ORIGIN_MAP + currentMap.title + ".jpg"
    }
  },

  onLoad(options) {
    console.log('browse页面加载参数:', options)

    // 解析路由参数
    if (options.topic) {
      this.topic = decodeURIComponent(options.topic)
    }
    if (options.topicId) {
      this.topicId = options.topicId
    }
    if (options.id) {
      this.mapId = options.id
    }
    if (options.index) {
      this.currentMapIndex = parseInt(options.index)
    }
    if (options.extends) {
      try {
        this.extendsData = JSON.parse(decodeURIComponent(options.extends))
      } catch (e) {
        console.error('解析extends参数失败:', e)
        this.extendsData = null
      }
    }

    // 加载地图数据
    this.loadMapData()
  },
    // 添加分享功能
    onShareAppMessage() {
      const currentMap = this.allMaps[this.currentMapIndex] || {}
      const shareTitle = this.topic ? `${this.topic} - ${currentMap.title || '地图'}` : '湖北省自然资源地图集'
      const sharePath = `/pages/map/browse?topic=${encodeURIComponent(this.topic)}&topicId=${this.topicId}&id=${currentMap.map_id || ''}&index=${this.currentMapIndex}`
  
      return {
        title: shareTitle, 
        path: sharePath,
        imageUrl: this.currentMapUrl || ShareAssets.BG_COVER,
      }
    },
	onShareTimeline() {
	    const currentMap = this.allMaps[this.currentMapIndex] || {}
	    const shareTitle = this.topic ? `${this.topic} - ${currentMap.title || '地图'}` : '湖北省自然资源地图集'
	    const shareQuery = `topic=${encodeURIComponent(this.topic)}&topicId=${this.topicId}&id=${currentMap.map_id || ''}&index=${this.currentMapIndex}`
	
	    return {
	      title: shareTitle,
	      query: shareQuery,
	      imageUrl: this.currentMapUrl || ShareAssets.BG_COVER
	    }
	  },

  methods: {
    // 加载地图数据
    async loadMapData() {
      try {
        console.log('开始加载地图数据...')

        if (!this.topic && !this.topicId) {
          throw new Error('缺少专题参数')
        }

        const res = await this.requestMapsData()

        if (res.statusCode === 200 && res.data.code === 200) {
          this.allMaps = (res.data.data || []).map(item => ({
            map_id: item.map_id,
            title: item.title,
            description: item.description,
            type: item.type,
            create_time: item.create_time
          }))

          console.log('获取到地图数据:', this.allMaps.length, '个地图')

          // 如果有指定的mapId，找到对应的索引
          if (this.mapId) {
            const foundIndex = this.allMaps.findIndex(map => map.map_id === this.mapId)
            if (foundIndex !== -1) {
              this.currentMapIndex = foundIndex
            }
          }

          // 确保索引有效
          if (this.currentMapIndex >= this.allMaps.length) {
            this.currentMapIndex = 0
          }

          this.loadCurrentMap()
        } else {
          throw new Error('API返回错误')
        }
      } catch (error) {
        console.error('加载地图数据失败:', error)
        uni.showToast({
          title: '地图加载失败',
          icon: 'none'
        })
      }
    },

    // 请求地图数据
    requestMapsData() {
      return new Promise((resolve, reject) => {
        let requestData = {}

        if (this.topic) {
          requestData.group = this.topic
          console.log('使用专题名称请求:', this.topic)
        } else if (this.topicId) {
          requestData.groupid = this.topicId
          console.log('使用专题ID请求:', this.topicId)
        } else {
          reject(new Error('缺少专题参数'))
          return
        }

        uni.request({
          url: API.MAPS_BY_GROUP,
          method: 'GET',
          data: requestData,
          success: resolve,
          fail: reject
        })
      })
    },

    // 加载当前地图
    loadCurrentMap() {
      if (!this.allMaps.length) {
        console.error('没有可显示的地图')
        return
      }

      const currentMap = this.allMaps[this.currentMapIndex]
      if (!currentMap) {
        console.error('地图数据错误')
        return
      }

      console.log('=== 当前地图信息 ===')
      console.log('地图标题:', currentMap.title)
      console.log('地图ID:', currentMap.map_id)
      console.log('当前索引:', this.currentMapIndex)
    },

    // 地图切换事件处理
    handleSwitchMap(direction) {
      if (direction === 'next' && this.currentMapIndex < this.allMaps.length - 1) {
        this.currentMapIndex++
      } else if (direction === 'prev' && this.currentMapIndex > 0) {
        this.currentMapIndex--
      }
    },

    // 图片加载完成
    handleImageLoad() {
      console.log('图片加载完成')
    },

    // 图片加载失败
    handleImageError(error) {
      console.error('图片加载失败:', error)
      uni.showToast({
        title: '图片加载失败',
        icon: 'none'
      })
    }
  }
}
</script>

<style scoped>

.cover-image-section {
  position: relative;
  z-index: 0;
  width: 100%;
  height: 100%;
  margin-top: 50rpx;
}

.cover-image {

  background-size: contain;
  background-position: center;
  width: 390%;
  height: 390%;
  position: absolute;
  top: 70%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(90deg);
}


.browse-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #007c52;
  position: fixed;
}

.top-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  position: relative;
}

.map-container-wrapper {
  flex: 0 0 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 20rpx 200rpx;
}

.map-container {
  width: 100%;
  height: 76%;
  background-color: #e5e5e5;
  border-radius: 15rpx;
  overflow: hidden;
  position: relative;
}

.bottom-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

</style>