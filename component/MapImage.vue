<template>
  <view class="map-container"
        :style="containerStyle"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove" 
        @touchend="handleTouchEnd">
    <image 
      class="map-image"
      :style="imageStyle"
      :src="currentMapUrl"
      mode="aspectFit"
      @load="onImageLoad"
      @error="onImageError"
      :show-menu-by-longpress="false"
    />
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

      touching: false,
      touchStartData: null,

      maxScale: 10,
      initialScale: 2,

      lastTap: 0,
      lastTapX: 0,
      lastTapY: 0
    }
  },
  computed: {
    containerStyle() {
      return {
        transform: `translate3d(${this.translateX}px, ${this.translateY}px, 0) scale(${this.scale})`,
        transition: this.touching ? 'none' : 'transform 0.3s ease-out'
      }
    },
    imageStyle() {
      return `transform: rotate(${this.rotation + 90}deg); transition: transform 0.5s ease-in-out;`;
    }
  },
  methods: {
    fitToExtent(extent) {
      const [xmin, ymin, xmax, ymax] = extent;
      const targetWidth = xmax - xmin;
      const targetHeight = ymax - ymin;

      //FIXME: 找不到 getElementsByClassName
      const container = document.getElementsByClassName('map-container')[0];
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      const scaleX = containerWidth / targetWidth;
      const scaleY = containerHeight / targetHeight;

      const newScale = Math.min(scaleX, scaleY); // 保证完全显示

     this.$emit('update:scale', newScale);
     this.$emit('update:translate-x', -xmin * newScale + (containerWidth - targetWidth * newScale) / 2);
     this.$emit('update:translate-y', -ymin * newScale + (containerHeight - targetHeight * newScale) / 2);
    },

    handleTouchStart(e) {
      this.touching = true;
      const touches = e.touches;
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;

      const now = Date.now();
      if (now - this.lastTap < 300 &&
          Math.abs(x - this.lastTapX) < 10 &&
          Math.abs(y - this.lastTapY) < 10) {
        if (this.scale * 2 < this.maxScale) this.$emit('update:scale', this.scale * 2);
        this.lastTap = 0;
      } else {
        this.lastTap = now;
        this.lastTapX = x;
        this.lastTapY = y;
      }

      if (touches.length === 1) {
        this.touchStartData = {
          type: 'pan',
          startX: x,
          startY: y,
          startTranslateX: this.translateX,
          startTranslateY: this.translateY
        };
      } else if (touches.length === 2) {
        const touch1 = touches[0];
        const touch2 = touches[1];
        const distance = this.getDistance(touch1, touch2);
        const center = this.getCenter(touch1, touch2);

        this.touchStartData = {
          type: 'zoom',
          startDistance: distance,
          startScale: this.scale,
          centerX: center.x,
          centerY: center.y,
          startTranslateX: this.translateX,
          startTranslateY: this.translateY
        };
      }
    },
    handleTouchMove(e) {
      if (!this.touching || !this.touchStartData) return;

      e.preventDefault();
      const touches = e.touches;

      if (this.touchStartData.type === 'pan' && touches.length === 1) {
        const deltaX = touches[0].clientX - this.touchStartData.startX;
        const deltaY = touches[0].clientY - this.touchStartData.startY;

     this.$emit('update:translate-x', this.touchStartData.startTranslateX + deltaX);
     this.$emit('update:translate-y', this.touchStartData.startTranslateY + deltaY);
      } else if (this.touchStartData.type === 'zoom' && touches.length === 2) {
        const touch1 = touches[0];
        const touch2 = touches[1];
        const distance = this.getDistance(touch1, touch2);
        const scaleRatio = distance / this.touchStartData.startDistance;

        let newScale = this.touchStartData.startScale * scaleRatio;
        newScale = Math.max(0.5, Math.min(this.maxScale, newScale));

        const scaleDiff = newScale - this.scale;
        const center = this.getCenter(touch1, touch2);

        this.$emit('update:scale', newScale);
        this.$emit('update:translate-x', this.touchStartData.startTranslateX - (center.x - this.touchStartData.centerX) * scaleDiff);
        this.$emit('update:translate-y', this.touchStartData.startTranslateY - (center.y - this.touchStartData.centerY) * scaleDiff);
      }
    },
    handleTouchEnd() {
      this.touching = false;
      this.touchStartData = null;
    },
    getDistance(touch1, touch2) {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    },
    getCenter(touch1, touch2) {
      return {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
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
}

.map-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
</style>