<template>
  <view class="floating-toolbar">
    <view class="tool-btn" @click="viewDetail">
      <image src="/static/icons/info.svg" class="tool-icon" />
    </view>
    <view class="tool-btn" @click="resetTransform">
      <image src="/static/icons/reset.svg" class="tool-icon" />
    </view>
    <view class="tool-btn" @click="switchMap('next')">
      <image :src="nextArrowIcon" class="tool-icon" />
    </view>
    <view class="tool-btn" @click="switchMap('prev')">
      <image :src="prevArrowIcon" class="tool-icon arrow-prev" />
    </view>
    <view class="tool-btn" @click="toggleDoodle">
      <image src="/static/icons/paint.svg" class="tool-icon" />
    </view>
  </view>

  <!-- 涂鸦工具栏 -->
  <view v-if="isDoodling" class="doodle-toolbar">
    <view class="doodle-tools">
      <view class="tool-btn" :class="{ 'active': paintLineMode }" @click="togglePaintLineMode">
        <image src="/static/icons/qianbi.svg" class="tool-icon" />
      </view>
      <view class="tool-btn" :class="{ 'active': rectMode }" @click="toggleRectMode">
        <image src="/static/icons/juxing.svg" class="tool-icon" />
      </view>
      <view class="tool-btn" :class="{ 'active': circleMode }" @click="toggleCircleMode">
        <image src="/static/icons/yuanxing.svg" class="tool-icon" />
      </view>
      <view class="tool-btn" :class="{ 'active': polylineMode }" @click="togglePolylineMode">
        <image src="/static/icons/zhexian.svg" class="tool-icon" />
      </view>
      <view class="tool-btn" :class="{ 'active': polygonMode }" @click="togglePolygonMode">
        <image src="/static/icons/duobianxing.svg" class="tool-icon" />
      </view>
      <view class="tool-btn" @click="clearCanvas">
        <image src="/static/icons/qingchu.svg" class="tool-icon" />
      </view>
    </view>

    <view class="doodle-controls">
      <view class="control-group">
        <text class="control-label">线宽</text>
        <slider
            class="line-width-slider"
            :value="lineWidth"
            @changing="updateLineWidth"
            :min="1"
            :max="10"
            :step="1"
        />
        <text class="control-value">{{lineWidth}}px</text>
      </view>

      <view class="color-palette">
        <view
            v-for="(color, index) in colors"
            :key="index"
            class="color-dot"
            :style="{ backgroundColor: color }"
            :class="{ 'active': currentColor === color }"
            @click="selectColor(color)"
        />
      </view>
    </view>
  </view>

  <!-- 图片容器  -->
  <view class="image-container"
        :style="containerStyle"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd">
    <image
        class="map-image"
        :src="currentMapUrl"
        mode="aspectFit"
        @load="onImageLoad"
        @error="onImageError"
        :show-menu-by-longpress="false"
    />

    <!-- 涂鸦画布 -->
    <canvas
        v-if="isDoodling"
        class="doodle-canvas"
        canvas-id="doodleCanvas"
        @touchstart="handleCanvasTouchStart"
        @touchmove="handleCanvasTouchMove"
        @touchend="handleCanvasTouchEnd"
    />
  </view>

  <!-- 提示信息 -->
  <view v-if="showToast" class="toast">
    {{ isDoodling ? '进入涂鸦模式' : '退出涂鸦模式' }}
  </view>
</template>

<script>
export default {
  name: 'MapImage',
  props: {
    currentMapUrl: {
      type: String,
      required: true
    },
    allMaps: {
      type: Array,
      required: true
    },
    currentMapIndex: {
      type: Number,
      required: true
    },
    topic: {
      type: String,
      default: ''
    },
    topicId: {
      type: String,
      default: ''
    },
    extends: {
      type: Array,
      required: false
    }
  },

  data() {
    return {
      // 简化的变换参数
      scale: 1,
      translateX: 0,
      translateY: 0,

      // 触摸控制
      touching: false,
      touchStartData: null,
      maxScale: 5,
      minScale: 0.5,

      // 涂鸦功能
      isDoodling: false,
      showToast: false,
      paintLineMode: false,
      rectMode: false,
      circleMode: false,
      polylineMode: false,
      polygonMode: false,
      canvasContext: null,
      isDrawing: false,
      currentShape: null,
      shapes: [],
      currentColor: '#000000',
      lineWidth: 2,
      colors: [
        '#000000', '#FF0000', '#2aa515', '#17abe3', '#f4ea29',
        '#bd8cbb', '#1aaba8', '#FFA500', '#13227a', '#e89abe'
      ]
    }
  },

  computed: {
    containerStyle() {
      return {
        transform: `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`,
        transformOrigin: 'center',
        transition: 'none'
      }
    },

    nextArrowIcon() {
      return this.currentMapIndex === this.allMaps.length - 1
          ? '/static/icons/arrow.svg'
          : '/static/icons/arrow-active.svg'
    },

    prevArrowIcon() {
      return this.currentMapIndex === 0
          ? '/static/icons/arrow.svg'
          : '/static/icons/arrow-active.svg'
    }
  },

  methods: {
    // 初始化
    onImageLoad() {
      console.log('图片加载成功')
      this.initCanvas()
      this.$emit('image-load')
    },

    onImageError(error) {
      console.error('图片加载失败:', error)
      this.$emit('image-error', error)
    },

    // 初始化画布
    initCanvas() {
      if (this.isDoodling) {
        this.canvasContext = uni.createCanvasContext('doodleCanvas', this)
        this.canvasContext.setLineWidth(this.lineWidth)
        this.canvasContext.setStrokeStyle(this.currentColor)
        this.canvasContext.setLineCap('round')
        this.canvasContext.setLineJoin('round')
      }
    },

    // 触摸事件处理
    handleTouchStart(e) {
      if (this.isDoodling) return

      const touch = e.touches[0]
      this.touching = true
      this.touchStartData = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTranslateX: this.translateX,
        startTranslateY: this.translateY,
        startScale: this.scale
      }
    },

    handleTouchMove(e) {
      if (!this.touching || this.isDoodling) return

      e.preventDefault()
      const touch = e.touches[0]

      if (e.touches.length === 1) {
        // 单指拖拽
        const deltaX = touch.clientX - this.touchStartData.startX
        const deltaY = touch.clientY - this.touchStartData.startY
        this.translateX = this.touchStartData.startTranslateX + deltaX
        this.translateY = this.touchStartData.startTranslateY + deltaY
      } else if (e.touches.length === 2) {
        // 双指缩放
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const distance = Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        )

        if (!this.touchStartData.startDistance) {
          this.touchStartData.startDistance = distance
        } else {
          const scaleChange = distance / this.touchStartData.startDistance
          this.scale = Math.max(this.minScale, Math.min(this.maxScale,
              this.touchStartData.startScale * scaleChange))
        }
      }
    },

    handleTouchEnd() {
      this.touching = false
      this.touchStartData = null
    },

    // 工具栏功能
    viewDetail() {
      if (!this.allMaps[this.currentMapIndex]) return

      const currentMap = this.allMaps[this.currentMapIndex]
      let url = `/pages/map/detail?id=${currentMap.map_id}&from=browse`

      if (this.topic) {
        url += `&topic=${encodeURIComponent(this.topic)}`
      } else if (this.topicId) {
        url += `&topic_id=${this.topicId}`
      }

      uni.navigateTo({ url })
    },

    resetTransform() {
      this.scale = 1
      this.translateX = 0
      this.translateY = 0
    },

    switchMap(direction) {
      this.$emit('switch-map', direction)
    },

    // 涂鸦功能
    toggleDoodle() {
      this.isDoodling = !this.isDoodling
      this.showToast = true
      setTimeout(() => {
        this.showToast = false
      }, 1500)

      if (this.isDoodling) {
        this.$nextTick(() => {
          this.initCanvas()
        })
      }
    },

    togglePaintLineMode() {
      this.paintLineMode = !this.paintLineMode
      this.resetOtherModes(['rectMode', 'circleMode', 'polylineMode', 'polygonMode'])
    },

    toggleRectMode() {
      this.rectMode = !this.rectMode
      this.resetOtherModes(['paintLineMode', 'circleMode', 'polylineMode', 'polygonMode'])
    },

    toggleCircleMode() {
      this.circleMode = !this.circleMode
      this.resetOtherModes(['paintLineMode', 'rectMode', 'polylineMode', 'polygonMode'])
    },

    togglePolylineMode() {
      this.polylineMode = !this.polylineMode
      this.resetOtherModes(['paintLineMode', 'rectMode', 'circleMode', 'polygonMode'])
    },

    togglePolygonMode() {
      this.polygonMode = !this.polygonMode
      this.resetOtherModes(['paintLineMode', 'rectMode', 'circleMode', 'polylineMode'])
    },

    resetOtherModes(modes) {
      modes.forEach(mode => {
        this[mode] = false
      })
    },

    updateLineWidth(e) {
      this.lineWidth = e.detail.value
      if (this.canvasContext) {
        this.canvasContext.setLineWidth(this.lineWidth)
      }
    },

    selectColor(color) {
      this.currentColor = color
      if (this.canvasContext) {
        this.canvasContext.setStrokeStyle(this.currentColor)
      }
    },

    clearCanvas() {
      if (this.canvasContext) {
        this.shapes = []
        this.currentShape = null
        this.canvasContext.clearRect(0, 0, 1000, 1000) // 临时尺寸
        this.canvasContext.draw(true)
      }
    },

    // 涂鸦触摸事件
    handleCanvasTouchStart(e) {
      if (!this.paintLineMode && !this.rectMode && !this.circleMode &&
          !this.polylineMode && !this.polygonMode) return

      const touch = e.touches[0]
      const x = touch.x
      const y = touch.y

      this.isDrawing = true

      if (this.paintLineMode) {
        this.currentShape = {
          type: 'line',
          points: [{ x, y }],
          color: this.currentColor,
          lineWidth: this.lineWidth
        }
      }
      // TODO: 其他绘制模式
    },

    handleCanvasTouchMove(e) {
      if (!this.isDrawing || !this.paintLineMode) return

      const touch = e.touches[0]
      const x = touch.x
      const y = touch.y

      if (this.currentShape) {
        this.currentShape.points.push({ x, y })
        this.drawCurrentShape()
      }
    },

    handleCanvasTouchEnd() {
      if (!this.isDrawing) return

      this.isDrawing = false
      if (this.currentShape) {
        this.shapes.push(this.currentShape)
        this.currentShape = null
      }
    },

    drawCurrentShape() {
      if (!this.canvasContext || !this.currentShape) return

      this.canvasContext.clearRect(0, 0, 1000, 1000)

      // 绘制已有图形
      this.shapes.forEach(shape => {
        this.drawShape(shape)
      })

      // 绘制当前图形
      this.drawShape(this.currentShape)

      this.canvasContext.draw()
    },

    drawShape(shape) {
      if (!shape || !this.canvasContext) return

      this.canvasContext.setStrokeStyle(shape.color)
      this.canvasContext.setLineWidth(shape.lineWidth)

      if (shape.type === 'line' && shape.points.length > 1) {
        this.canvasContext.beginPath()
        this.canvasContext.moveTo(shape.points[0].x, shape.points[0].y)
        for (let i = 1; i < shape.points.length; i++) {
          this.canvasContext.lineTo(shape.points[i].x, shape.points[i].y)
        }
        this.canvasContext.stroke()
      }
    }
  }
}
</script>

<style scoped>

.floating-toolbar {
  position: fixed;
  top: 20rpx;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 15rpx;
  padding: 10rpx 15rpx;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.doodle-toolbar {
  position: fixed;
  top: 80rpx;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 15rpx;
  padding: 15rpx;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 15rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.doodle-tools {
  display: flex;
  gap: 10rpx;
}

.tool-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border-radius: 12rpx;
  transition: all 0.2s;
}

.tool-btn.active {
  background-color: #7aa26f;
}

.tool-btn.active .tool-icon {
  filter: brightness(0) invert(1);
}

.tool-icon {
  width: 36rpx;
  height: 36rpx;
  transform: rotate(90deg);
  transform-origin: center;
}

.arrow-prev {
  transform: rotate(180deg);
}

.image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.map-image {
  width: 100%;
  height: 100%;
  transform: rotate(90deg);
  transform-origin: center;
}

.doodle-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
}

.doodle-controls {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.control-label {
  font-size: 24rpx;
  color: #666;
  min-width: 60rpx;
}

.line-width-slider {
  flex: 1;
  height: 40rpx;
}

.control-value {
  font-size: 22rpx;
  color: #999;
  min-width: 60rpx;
  text-align: center;
}

.color-palette {
  display: flex;
  gap: 8rpx;
  flex-wrap: wrap;
}

.color-dot {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 3rpx solid transparent;
  transition: all 0.2s;
}

.color-dot.active {
  border-color: #333;
  transform: scale(1.1);
}

.toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  padding: 20rpx 40rpx;
  border-radius: 25rpx;
  font-size: 28rpx;
  z-index: 2000;
}
</style>