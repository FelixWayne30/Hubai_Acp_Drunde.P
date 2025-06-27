<template>
<<<<<<< HEAD
  <!-- 工具栏，独立图层 -->
  <view class="floating-toolbar">
    <image class="control-btn" :style="rotationStyle90" src="/static/icons/info.svg" @click="viewDetail" />
    <image class="control-btn" :style="rotationStyle" src="/static/icons/reset.svg" @click="resetTransform" />
    <image class="control-btn" :style="rotationStyle90" src="/static/icons/rotate.svg" @click="rotate" />
    <image class="control-btn" :style="rotationStyle" :src="currentMapIndex === allMaps.length - 1 ? '/static/icons/arrow.svg' : '/static/icons/arrow-active.svg'" @click="switchMap('next')" />
    <image class="control-btn" :style="rotationStyle180" :src="currentMapIndex === 0 ? '/static/icons/arrow.svg' : '/static/icons/arrow-active.svg'" @click="switchMap('prev')" />
    <image class="control-btn doodle-btn" :style="rotationStyle" src="/static/icons/paint.svg" @click="toggleDoodle" />
  </view>

  <!-- 涂鸦工具栏 -->
  <view v-if="isDoodling" class="doodle-toolbar">
    <view class="tool-column">
      <image 
        class="doodle-tool-btn" 
        :class="{ 'active': paintLineMode }" 
        src="/static/icons/qianbi.svg" 
        @click="togglePaintLineMode" 
      />
      <image 
        class="doodle-tool-btn" 
        :class="{ 'active': rectMode }" 
        src="/static/icons/juxing.svg" 
        @click="toggleRectMode" 
      />
      <image 
        class="doodle-tool-btn" 
        :class="{ 'active': circleMode }" 
        src="/static/icons/yuanxing.svg" 
        @click="toggleCircleMode" 
      />
      <image 
        class="doodle-tool-btn" 
        :class="{ 'active': polylineMode }" 
        src="/static/icons/zhexian.svg" 
        @click="togglePolylineMode" 
      />
	  <image
	    class="doodle-tool-btn" 
	    :class="{ 'active': polygonMode }" 
	    src="/static/icons/duobianxing.svg" 
	    @click="togglePolygonMode" 
	  />
      <image 
        class="doodle-tool-btn clear-btn" 
        :class="{ 'active': clearMode }" 
        src="/static/icons/qingchu.svg" 
        @click="clearCanvas" 
      />
    </view>
    <view class="slider-column">
      <slider 
        class="thickness-slider" 
        :value="lineWidth" 
        @changing="updateLineWidth" 
        vertical 
        :min="1" 
        :max="10" 
        :step="1" 
        :disabled="!paintLineMode && !rectMode && !circleMode && !polylineMode"
      />
      <text class="slider-value">{{ lineWidth }}px</text>
      <view class="color-column-container">
        <view class="color-picker">
          <view 
            v-for="(color, index) in colors" 
            :key="index" 
            class="color-block" 
            :style="{ backgroundColor: color }" 
            :class="{
              'active': currentColor === color && (paintLineMode || rectMode || circleMode || polylineMode),
              'disabled': !paintLineMode && !rectMode && !circleMode && !polylineMode
            }" 
            @click="selectColor(color)"
          />
        </view>
      </view>
    </view>
  </view>

  <!-- 地图容器 -->
  <view class="map-container" 
        :style="mapTransformStyle"
=======
  <view class="map-container"
        id="map-container"
        :style="containerStyle"
>>>>>>> c913cf43993a8965996175c05cc6e5bc753eea07
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove" 
        @touchend="handleTouchEnd">
    <image 
      class="map-image"
      :style="imageStyle"
      :src="currentMapUrl"
      mode="widthFix" 
      @load="onImageLoad"
      @error="onImageError"
      :show-menu-by-longpress="false"
    />
    <canvas 
      v-if="paintLineMode || rectMode || circleMode || polylineMode"
      class="doodle-canvas"
      canvas-id="doodleCanvas"
      @touchstart="handleCanvasTouchStart"
      @touchmove="handleCanvasTouchMove"
      @touchend="handleCanvasTouchEnd"
      :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
    />
  </view>

  <!-- 涂鸦模式提示 -->
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
<<<<<<< HEAD
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
    }
  },
  data() {
    return {
      scale: 1,
      translateX: 0,
      translateY: 0,
      rotation: 0,
=======
    extends: {
      type: Array, //[xmin, ymin, xmax, ymax]
      required: false,
    },
	 scale: {
	    type: Number,
	    default: 2
	  },
	  translateX: {
	    type: Number,
	    default: 0
	  },
	  translateY: {
	    type: Number,
	    default: 0
	  }
  },
  data() {
    return {
      rotation: 0,

>>>>>>> c913cf43993a8965996175c05cc6e5bc753eea07
      touching: false,
      touchStartData: null,

      maxScale: 10,
<<<<<<< HEAD
      initialScale: 1,
=======
      initialScale: 2,

>>>>>>> c913cf43993a8965996175c05cc6e5bc753eea07
      lastTap: 0,
      lastTapX: 0,
      lastTapY: 0,
      isDoodling: false,
      showToast: false,
      paintLineMode: false,
      rectMode: false,
      canvasWidth: 0,
      canvasHeight: 0,
      canvasContext: null,
      isDrawing: false,
      lastX: 0,
      lastY: 0,
      startX: 0,
      startY: 0,
      currentColor: null,
      clearMode: false,
      lineWidth: 2, // 默认画笔粗细
      colors: [
        '#000000', '#FF0000', '#2aa515', '#17abe3', '#f4ea29',
        '#bd8cbb', '#1aaba8', '#FFA500', '#13227a', '#e89abe'
      ],
      arrow_img: {
        active: "/static/icons/arrow-active.svg",
        disabled: "/static/icons/arrow.svg"
      }
    }
  },
  computed: {
    containerStyle() {
      return {
        transform: `translate3d(${this.translateX}px, ${this.translateY}px, 0) scale(${this.scale})`,
        transition: 'none'
      }
    },
<<<<<<< HEAD
    rotationStyle() {
      return `transform: rotate(${this.rotation}deg);`
    },
    rotationStyle90() {
      return `transform: rotate(${this.rotation + 90}deg);`
    },
    rotationStyle180() {
      return `transform: rotate(${this.rotation + 180}deg);`
    }
  },
  methods: {
    onImageLoad(e) {
      const query = uni.createSelectorQuery().in(this)
      query.select('.map-image').boundingClientRect(data => {
        if (data) {
          this.canvasWidth = data.width
          this.canvasHeight = data.height
          this.canvasContext = uni.createCanvasContext('doodleCanvas', this)
          this.canvasContext.setLineWidth(this.lineWidth)
          if (this.currentColor) {
            this.canvasContext.setStrokeStyle(this.currentColor)
          }
          this.canvasContext.setLineCap('round')
          this.canvasContext.setLineJoin('round')
        }
      }).exec()
      this.$emit('image-load')
    },
    onImageError(e) {
      console.error('Image load failed:', e)
      this.$emit('image-error', e)
    },
=======
    imageStyle() {
      return `transform: rotate(${this.rotation + 90}deg); transition: transform 0.5s ease-in-out;`;
    }
  },
  methods: {
    fitToExtent(extent) {
      const [xmin, ymin, xmax, ymax] = [0.048265918,0.277440466,0.48574635,0.655745622];

      const targetWidth = xmax - xmin;
      const targetHeight = ymax - ymin;

      const container = uni.createSelectorQuery().in(this).select('#map-container');
      container.boundingClientRect((data) => {

            const containerWidth = data.width;
            const containerHeight = data.height;

            const scaleX = containerWidth / targetWidth;
            const scaleY = containerHeight / targetHeight;

            const newScale = Math.min(scaleX, scaleY); // 保证完全显示

            this.$emit('update:scale', newScale);
            this.$emit('update:translate-x', -xmin * newScale + (containerWidth - targetWidth * newScale) / 2);
            this.$emit('update:translate-y', -ymin * newScale + (containerHeight - targetHeight * newScale) / 2);
          }).exec()

    },

>>>>>>> c913cf43993a8965996175c05cc6e5bc753eea07
    handleTouchStart(e) {
      if (this.paintLineMode || this.rectMode) return

      this.touching = true
      const touches = e.touches
      const x = touches[0].clientX
      const y = touches[0].clientY

      const now = Date.now()
      if (now - this.lastTap < 300 &&
          Math.abs(x - this.lastTapX) < 10 &&
          Math.abs(y - this.lastTapY) < 10) {
<<<<<<< HEAD
        if (this.scale * 2 <= this.maxScale) {
          this.scale = this.scale * 2
        }
        this.lastTap = 0
=======
        if (this.scale * 2 < this.maxScale) this.$emit('update:scale', this.scale * 2);
        this.lastTap = 0;
>>>>>>> c913cf43993a8965996175c05cc6e5bc753eea07
      } else {
        this.lastTap = now
        this.lastTapX = x
        this.lastTapY = y
      }

      if (touches.length === 1) {
        this.touchStartData = {
          type: 'pan',
          startX: x,
          startY: y,
          startTranslateX: this.translateX,
          startTranslateY: this.translateY
        }
      } else if (touches.length === 2) {
        const touch1 = touches[0]
        const touch2 = touches[1]
        const distance = this.getDistance(touch1, touch2)
        const center = this.getCenter(touch1, touch2)

        this.touchStartData = {
          type: 'zoom',
          startDistance: distance,
          startScale: this.scale,
          centerX: center.x,
          centerY: center.y,
          startTranslateX: this.translateX,
          startTranslateY: this.translateY
        }
      }
    },
    handleTouchMove(e) {
      if (this.paintLineMode || this.rectMode) return

      if (!this.touching || !this.touchStartData) return

      e.preventDefault()
      const touches = e.touches

      if (this.touchStartData.type === 'pan' && touches.length === 1) {
        const deltaX = touches[0].clientX - this.touchStartData.startX
        const deltaY = touches[0].clientY - this.touchStartData.startY

<<<<<<< HEAD
        this.translateX = this.touchStartData.startTranslateX + deltaX
        this.translateY = this.touchStartData.startTranslateY + deltaY
=======
     this.$emit('update:translate-x', this.touchStartData.startTranslateX + deltaX);
     this.$emit('update:translate-y', this.touchStartData.startTranslateY + deltaY);
>>>>>>> c913cf43993a8965996175c05cc6e5bc753eea07
      } else if (this.touchStartData.type === 'zoom' && touches.length === 2) {
        const touch1 = touches[0]
        const touch2 = touches[1]
        const distance = this.getDistance(touch1, touch2)
        const scaleRatio = distance / this.touchStartData.startDistance

        let newScale = this.touchStartData.startScale * scaleRatio
        newScale = Math.max(1, Math.min(this.maxScale, newScale))

        const scaleDiff = newScale - this.scale
        const center = this.getCenter(touch1, touch2)

<<<<<<< HEAD
        this.scale = newScale
        this.translateX = this.touchStartData.startTranslateX - (center.x - this.touchStartData.centerX) * scaleDiff
        this.translateY = this.touchStartData.startTranslateY - (center.y - this.touchStartData.centerY) * scaleDiff
=======
        this.$emit('update:scale', newScale);
        this.$emit('update:translate-x', this.touchStartData.startTranslateX - (center.x - this.touchStartData.centerX) * scaleDiff);
        this.$emit('update:translate-y', this.touchStartData.startTranslateY - (center.y - this.touchStartData.centerY) * scaleDiff);
>>>>>>> c913cf43993a8965996175c05cc6e5bc753eea07
      }
    },
    handleTouchEnd() {
      if (this.paintLineMode || this.rectMode) return

      this.touching = false
      this.touchStartData = null
    },
    handleCanvasTouchStart(e) {
      if (!this.paintLineMode && !this.rectMode) return

      this.isDrawing = true
      const touch = e.touches[0]
      this.startX = touch.x
      this.startY = touch.y
      this.lastX = touch.x
      this.lastY = touch.y

      this.canvasContext.beginPath()
      if (this.rectMode) {
        this.canvasContext.rect(this.startX, this.startY, 0, 0)
      } else {
        this.canvasContext.moveTo(this.lastX, this.lastY)
      }
    },
    handleCanvasTouchMove(e) {
      if (!this.paintLineMode && !this.rectMode || !this.isDrawing) return

      e.preventDefault()
      const touch = e.touches[0]
      const currentX = touch.x
      const currentY = touch.y

      if (this.rectMode) {
        this.canvasContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
        this.canvasContext.beginPath()
        this.canvasContext.rect(this.startX, this.startY, currentX - this.startX, currentY - this.startY)
        this.canvasContext.stroke()
      } else {
        this.canvasContext.lineTo(currentX, currentY)
        this.canvasContext.stroke()
      }

      this.lastX = currentX
      this.lastY = currentY
    },
    handleCanvasTouchEnd() {
      if (!this.paintLineMode && !this.rectMode) return

      this.isDrawing = false
      if (this.rectMode) {
        this.canvasContext.stroke()
      }
      this.canvasContext.closePath()
      this.canvasContext.draw(true)
    },
    getDistance(touch1, touch2) {
      const dx = touch1.clientX - touch2.clientX
      const dy = touch1.clientY - touch2.clientY
      return Math.sqrt(dx * dx + dy * dy)
    },
    getCenter(touch1, touch2) {
      return {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
<<<<<<< HEAD
      }
    },
    resetTransform() {
      this.scale = 1
      this.translateX = 0
      this.translateY = 0
      this.rotation = 0
      if (this.canvasContext) {
        this.canvasContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
        this.canvasContext.draw()
      }
    },
    rotate() {
      this.rotation = (this.rotation + 90) % 360
      if (this.canvasContext) {
        this.canvasContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
        this.canvasContext.draw()
      }
    },
    switchMap(direction) {
      this.$emit('switch-map', direction)
      if (this.canvasContext) {
        this.canvasContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
        this.canvasContext.draw()
      }
    },
    viewDetail() {
      if (!this.allMaps[this.currentMapIndex]) return
      
      let url = `/pages/map/detail?id=${this.allMaps[this.currentMapIndex].map_id}&from=browse`
      
      if (this.topic) {
        url += `&topic=${this.topic}`
      } else if (this.topicId) {
        url += `&topic_id=${this.topicId}`
      }
      
      uni.navigateTo({ url })
    },
    toggleDoodle() {
      this.isDoodling = !this.isDoodling
      this.showToast = true
      console.log('Toggled doodling:', this.isDoodling)
      setTimeout(() => {
        this.showToast = false
      }, 1500)
      if (!this.isDoodling) {
        this.paintLineMode = false
        this.rectMode = false
        this.clearMode = false
      }
    },
    togglePaintLineMode() {
      this.paintLineMode = !this.paintLineMode
      this.rectMode = false
      this.clearMode = false
      console.log('Paint line mode:', this.paintLineMode)
      if (this.paintLineMode && this.canvasContext) {
        this.currentColor = this.currentColor || '#000000'
        this.canvasContext.setLineWidth(this.lineWidth)
        this.canvasContext.setStrokeStyle(this.currentColor)
        this.canvasContext.setLineCap('round')
        this.canvasContext.setLineJoin('round')
      }
    },
    toggleRectMode() {
      this.rectMode = !this.rectMode
      this.paintLineMode = false
      this.clearMode = false
      console.log('Rect mode:', this.rectMode)
      if (this.rectMode && this.canvasContext) {
        this.currentColor = this.currentColor || '#000000'
        this.canvasContext.setLineWidth(this.lineWidth)
        this.canvasContext.setStrokeStyle(this.currentColor)
        this.canvasContext.setLineCap('round')
        this.canvasContext.setLineJoin('round')
      }
    },
    selectColor(color) {
      if (this.paintLineMode || this.rectMode) {
        this.currentColor = color
        this.clearMode = false
        if (this.canvasContext) {
          this.canvasContext.setStrokeStyle(this.currentColor)
          this.canvasContext.draw(true)
        }
      }
    },
    updateLineWidth(e) {
      if ((this.paintLineMode || this.rectMode) && this.canvasContext) {
        this.lineWidth = e.detail.value
        this.canvasContext.setLineWidth(this.lineWidth)
        this.canvasContext.draw(true)
      }
    },
    clearCanvas() {
      if (this.canvasContext) {
        this.canvasContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
        this.canvasContext.draw(true)
        this.paintLineMode = false
        this.rectMode = false
        this.clearMode = true
      }
=======
      };
    },
    onImageLoad() {
      console.log('原图显示成功');
      this.isLoading = false;
    },
    onImageError(error) {
      console.error('原图显示失败:', error);
      this.showError('图片显示失败，请检查网络连接');
    },
    showError(message) {
      this.isLoading = false;
      this.loadingText = message;

      uni.showToast({
        title: message,
        icon: 'none',
        duration: 3000
      });

      setTimeout(() => {
        if (this.loadingText === message) {
          this.loadingText = '';
        }
      }, 3000);
    },
    resetTransform() {
      this.$emit('update:scale', 2);
      this.$emit('update:translate-x', 0);
      this.$emit('update:translate-y', 0);
    },
    rotate() {
      this.rotation = (this.rotation + 90) % 360;
>>>>>>> c913cf43993a8965996175c05cc6e5bc753eea07
    }
  },
  mounted() {
    this.fitToExtent(this.extends)
  },
}
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transform-origin: center;
  position: relative;
}

.map-image {
  width: 100%;
  height: auto;
  object-fit: contain;
  display: block;
}

.doodle-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  background: transparent;
}

.floating-toolbar {
  position: fixed;
  top: 20rpx;
  left: 20rpx;
  background-color: #f6f7f7;
  border-radius: 12rpx;
  padding: 10rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1000;
}

.control-btn {
  width: 50rpx;
  height: 50rpx;
  margin: 10rpx 0;
  object-fit: contain;
}

.doodle-btn {
  background-color: #f6f7f7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.doodle-toolbar {
  position: fixed;
  top: 20rpx;
  left: 100rpx;
  background-color: #f6f7f7;
  border-radius: 12rpx;
  padding: 10rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  z-index: 1000;
}

.tool-column {
  display: flex;
  flex-direction: column;
  margin-right: 20rpx;
}

.doodle-tool-btn {
  width: 50rpx;
  height: 50rpx;
  margin: 5rpx 0;
  object-fit: contain;
  background-color: #f6f7f7;
  border-radius: 8rpx;
  padding: 5rpx;
}

.doodle-tool-btn.active {
  background-color: #e6f3ff;
}

.clear-btn {
  width: 50rpx;
  height: 50rpx;
  margin: 10rpx 0;
  object-fit: contain;
  background-color: #f6f7f7;
  border-radius: 8rpx;
  padding: 5rpx;
}

.clear-btn.active {
  background-color: #e6f3ff;
}

.slider-column {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.thickness-slider {
  width: 100rpx;
  height: 20rpx;
  background-color: #ddd;
  border-radius: 10rpx;
}

.slider-value {
  font-size: 20rpx;
  color: #333;
  margin-top: 5rpx;
  margin-bottom: 10rpx;
}

.color-column-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.color-picker {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 两列布局 */
  grid-auto-flow: row; /* 按行填充 */
  gap: 10rpx; /* 控制颜色块之间的间距 */
}

.color-block {
  width: 40rpx;
  height: 40rpx;
  margin: 5rpx;
  border: 2rpx solid #ccc;
  border-radius: 4rpx;
  cursor: pointer;
}

.color-block.active {
  border: 5rpx solid #dbdbdb;
  box-shadow: 0 0 15rpx #e6e6e6;
}

.color-block.disabled {
  cursor: not-allowed;
  opacity: 0.5;
  pointer-events: none;
}

.toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: #ffffff;
  padding: 20rpx 30rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
  z-index: 2000;
}
</style>