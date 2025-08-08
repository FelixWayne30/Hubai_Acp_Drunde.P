<template>
  <view class="map-image-wrapper">
    <!-- 工具栏 -->
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

    <!-- 图片容器 -->
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
          :style="{ width: '100%', height: '100%' }"
          @touchstart="handleCanvasTouchStart"
          @touchmove="handleCanvasTouchMove"
          @touchend="handleCanvasTouchEnd"
      />
    </view>

    <!-- 提示信息 -->
    <view v-if="showToast" class="toast">
      {{ isDoodling ? '进入涂鸦模式' : '退出涂鸦模式' }}
    </view>
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
      // 统一的变换参数
      scale: 1,
      translateX: 0,
      translateY: 0,

      // 容器信息
      containerInfo: {
        width: 0,
        height: 0,
        left: 0,
        top: 0
      },

      // 触摸控制
      touching: false,
      touchStartData: null,
      pinchStartDistance: 0,
      pinchCenter: null,
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
        transformOrigin: '0 0' //设置为左上角
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

    async initContainer() {
      const query = uni.createSelectorQuery().in(this)
      query.select('.image-container').boundingClientRect(res => {
        if (res) {
          this.containerInfo = {
            width: res.width,
            height: res.height,
            left: res.left,
            top: res.top
          }
        }
      }).exec()
    },

    onImageLoad() {
      console.log('图片加载成功')
      this.initContainer()
      if (this.isDoodling) {
        this.$nextTick(() => {
          this.initCanvas()
        })
      }
      this.$emit('image-load')
    },

    onImageError(error) {
      console.error('图片加载失败:', error)
      this.$emit('image-error', error)
    },

    // 初始化画布
    initCanvas() {
      this.canvasContext = uni.createCanvasContext('doodleCanvas', this)
      this.canvasContext.setLineWidth(this.lineWidth)
      this.canvasContext.setStrokeStyle(this.currentColor)
      this.canvasContext.setLineCap('round')
      this.canvasContext.setLineJoin('round')
    },

    // 屏幕坐标转画布坐标
    screenToCanvas(screenX, screenY) {
      // 获取相对于容器的坐标，先减去平移量，再除以缩放比例
      const x = (screenX - this.containerInfo.left - this.translateX) / this.scale;
      const y = (screenY - this.containerInfo.top - this.translateY) / this.scale;

      const centerX = this.containerInfo.height / 2; // 高度作为宽度
      const centerY = this.containerInfo.width / 2;  // 宽度作为高度

      // 转换到中心坐标系（考虑旋转后的尺寸）
      const relX = x - centerY; // centerY，因为x轴现在对应原来的y轴
      const relY = y - centerX; // centerX，因为y轴现在对应原来的-x轴

      // 旋转-90度（因为图片旋转了90度），旋转后不需要再次考虑缩放因素
      const rotatedX = relY;
      const rotatedY = -relX;

      // 最后转回画布坐标系（左上角为原点），注意这里的centerX和centerY已经考虑了旋转
      return {
        x: rotatedX + centerX,
        y: rotatedY + centerY
      };
    },

    // 触摸事件处理 - 缩放和拖拽
    handleTouchStart(e) {
      if (this.isDoodling) return

      const touches = e.touches
      this.touching = true

      if (touches.length === 1) {
        // 单指拖拽
        const touch = touches[0]
        this.touchStartData = {
          mode: 'drag',
          startX: touch.clientX,
          startY: touch.clientY,
          startTranslateX: this.translateX,
          startTranslateY: this.translateY
        }
      } else if (touches.length === 2) {
        // 双指缩放
        const touch1 = touches[0]
        const touch2 = touches[1]

        // 计算两指距离
        const dx = touch2.clientX - touch1.clientX
        const dy = touch2.clientY - touch1.clientY
        this.pinchStartDistance = Math.sqrt(dx * dx + dy * dy)

        // 计算两指中心点（相对于容器）
        this.pinchCenter = {
          x: (touch1.clientX + touch2.clientX) / 2 - this.containerInfo.left,
          y: (touch1.clientY + touch2.clientY) / 2 - this.containerInfo.top
        }

        this.touchStartData = {
          mode: 'pinch',
          startScale: this.scale,
          startTranslateX: this.translateX,
          startTranslateY: this.translateY
        }
      }
    },

    handleTouchMove(e) {
      if (!this.touching || this.isDoodling) return
      e.preventDefault()

      const touches = e.touches

      if (this.touchStartData.mode === 'drag' && touches.length === 1) {
        // 单指拖拽
        const touch = touches[0]
        const deltaX = touch.clientX - this.touchStartData.startX
        const deltaY = touch.clientY - this.touchStartData.startY

        this.translateX = this.touchStartData.startTranslateX + deltaX
        this.translateY = this.touchStartData.startTranslateY + deltaY

      } else if (touches.length === 2) {
        // 双指缩放
        const touch1 = touches[0]
        const touch2 = touches[1]

        // 计算当前两指距离
        const dx = touch2.clientX - touch1.clientX
        const dy = touch2.clientY - touch1.clientY
        const currentDistance = Math.sqrt(dx * dx + dy * dy)

        // 计算缩放比例
        const scaleRatio = currentDistance / this.pinchStartDistance
        const newScale = Math.max(this.minScale,
            Math.min(this.maxScale, this.touchStartData.startScale * scaleRatio))

        // 计算当前两指中心
        const currentCenter = {
          x: (touch1.clientX + touch2.clientX) / 2 - this.containerInfo.left,
          y: (touch1.clientY + touch2.clientY) / 2 - this.containerInfo.top
        }

        // 调整translate使中心点在缩放前后保持在相同位置
        const scaleDiff = newScale / this.touchStartData.startScale

        this.scale = newScale
        this.translateX = currentCenter.x - (this.pinchCenter.x - this.touchStartData.startTranslateX) * scaleDiff
        this.translateY = currentCenter.y - (this.pinchCenter.y - this.touchStartData.startTranslateY) * scaleDiff
      }
    },

    handleTouchEnd() {
      this.touching = false
      this.touchStartData = null
      this.pinchStartDistance = 0
      this.pinchCenter = null
    },

    // 涂鸦触摸事件
    handleCanvasTouchStart(e) {
      if (!this.paintLineMode && !this.rectMode && !this.circleMode &&
          !this.polylineMode && !this.polygonMode) return

      const touch = e.touches[0]
      const canvasPos = this.screenToCanvas(touch.clientX, touch.clientY)

      this.isDrawing = true

      if (this.paintLineMode) {
        this.currentShape = {
          type: 'line',
          points: [canvasPos],
          color: this.currentColor,
          lineWidth: this.lineWidth
        }
      } else if (this.rectMode) {
        this.currentShape = {
          type: 'rect',
          startPoint: canvasPos,
          endPoint: canvasPos,
          color: this.currentColor,
          lineWidth: this.lineWidth
        }
      } else if (this.circleMode) {
        this.currentShape = {
          type: 'circle',
          center: canvasPos,
          radius: 0,
          color: this.currentColor,
          lineWidth: this.lineWidth
        }
      } else if (this.polylineMode || this.polygonMode) {
        this.currentShape = {
          type: this.polylineMode ? 'polyline' : 'polygon',
          points: [canvasPos],
          color: this.currentColor,
          lineWidth: this.lineWidth
        }
      }
    },

    handleCanvasTouchMove(e) {
      if (!this.isDrawing || !this.currentShape) return

      const touch = e.touches[0]
      const canvasPos = this.screenToCanvas(touch.clientX, touch.clientY)

      if (this.currentShape.type === 'line') {
        this.currentShape.points.push(canvasPos)
      } else if (this.currentShape.type === 'rect') {
        this.currentShape.endPoint = canvasPos
      } else if (this.currentShape.type === 'circle') {
        const dx = canvasPos.x - this.currentShape.center.x
        const dy = canvasPos.y - this.currentShape.center.y
        this.currentShape.radius = Math.sqrt(dx * dx + dy * dy)
      }

      this.drawCurrentShape()
    },

    handleCanvasTouchEnd() {
      if (!this.isDrawing) return

      this.isDrawing = false
      if (this.currentShape) {
        this.shapes.push(this.currentShape)
        this.currentShape = null
      }
    },

    // 绘制当前图形
    drawCurrentShape() {
      if (!this.canvasContext) return

      // 清空画布
      const width = this.containerInfo.width
      const height = this.containerInfo.height
      this.canvasContext.clearRect(0, 0, width, height)

      // 保存当前状态
      this.canvasContext.save()

      // 应用90度旋转变换
      this.canvasContext.translate(width / 2, height / 2)
      this.canvasContext.rotate(Math.PI / 2)
      this.canvasContext.translate(-height / 2, -width / 2)

      // 绘制所有已保存的图形
      this.shapes.forEach(shape => {
        this.drawShape(shape)
      })

      // 绘制当前图形
      if (this.currentShape) {
        this.drawShape(this.currentShape)
      }

      // 恢复状态
      this.canvasContext.restore()

      // 绘制到画布
      this.canvasContext.draw()
    },

    // 绘制单个图形
    drawShape(shape) {
      if (!shape || !this.canvasContext) return

      this.canvasContext.setStrokeStyle(shape.color)
      this.canvasContext.setLineWidth(shape.lineWidth)

      switch (shape.type) {
        case 'line':
          if (shape.points && shape.points.length > 1) {
            this.canvasContext.beginPath()
            this.canvasContext.moveTo(shape.points[0].x, shape.points[0].y)
            for (let i = 1; i < shape.points.length; i++) {
              this.canvasContext.lineTo(shape.points[i].x, shape.points[i].y)
            }
            this.canvasContext.stroke()
          }
          break

        case 'rect':
          if (shape.startPoint && shape.endPoint) {
            const x = Math.min(shape.startPoint.x, shape.endPoint.x)
            const y = Math.min(shape.startPoint.y, shape.endPoint.y)
            const width = Math.abs(shape.endPoint.x - shape.startPoint.x)
            const height = Math.abs(shape.endPoint.y - shape.startPoint.y)
            this.canvasContext.strokeRect(x, y, width, height)
          }
          break

        case 'circle':
          if (shape.center && shape.radius > 0) {
            this.canvasContext.beginPath()
            this.canvasContext.arc(shape.center.x, shape.center.y, shape.radius, 0, 2 * Math.PI)
            this.canvasContext.stroke()
          }
          break

        case 'polyline':
        case 'polygon':
          if (shape.points && shape.points.length > 1) {
            this.canvasContext.beginPath()
            this.canvasContext.moveTo(shape.points[0].x, shape.points[0].y)
            for (let i = 1; i < shape.points.length; i++) {
              this.canvasContext.lineTo(shape.points[i].x, shape.points[i].y)
            }
            if (shape.type === 'polygon' && shape.points.length > 2) {
              this.canvasContext.closePath()
            }
            this.canvasContext.stroke()
          }
          break
      }
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
        const width = this.containerInfo.width
        const height = this.containerInfo.height
        this.canvasContext.clearRect(0, 0, width, height)
        this.canvasContext.draw()
      }
    }
  },

  mounted() {
    // 初始化容器信息
    this.$nextTick(() => {
      this.initContainer()
    })
  }
}
</script>

<style scoped>

.map-image-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.floating-toolbar {
  position: fixed;
  bottom: 80rpx;
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
  transform: rotate(-90deg);
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
  pointer-events: auto;
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