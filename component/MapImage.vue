<template>
  <view class="map-container" 
        :style="mapTransformStyle"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove" 
        @touchend="handleTouchEnd">
    <image 
      class="map-image"
      :style="rotationStyle"
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
    scale: {
      type: Number,
      default: 1
    },
    translateX: {
      type: Number,
      default: 0
    },
    translateY: {
      type: Number,
      default: 0
    },
    rotation: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
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
    mapTransformStyle() {
      return {
        transform: `translate3d(${this.translateX}px, ${this.translateY}px, 0) scale(${this.scale})`,
        transition: this.touching ? 'none' : 'transform 0.3s ease-out'
      }
    },
    rotationStyle() {
      return `transform: rotate(${this.rotation}deg); transition: transform 0.5s ease-in-out;`;
    }
  },
  methods: {
    handleTouchStart(e) {
      this.touching = true;
      const touches = e.touches;
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;

      const now = Date.now();
      if (now - this.lastTap < 300 &&
          Math.abs(x - this.lastTapX) < 10 &&
          Math.abs(y - this.lastTapY) < 10) {
        if (this.scale * 2 < this.maxScale) this.scale = this.scale * 2;
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

        this.$emit('update:translateX', this.touchStartData.startTranslateX + deltaX);
        this.$emit('update:translateY', this.touchStartData.startTranslateY + deltaY);
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
        this.$emit('update:translateX', this.touchStartData.startTranslateX - (center.x - this.touchStartData.centerX) * scaleDiff);
        this.$emit('update:translateY', this.touchStartData.startTranslateY - (center.y - this.touchStartData.centerY) * scaleDiff);
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
      this.$emit('image-load');
    },
    onImageError(error) {
      this.$emit('image-error', error);
    },
    resetTransform() {
      this.$emit('update:scale', this.initialScale);
      this.$emit('update:translateX', 0);
      this.$emit('update:translateY', 0);
    },
    rotate() {
      this.$emit('update:rotation', (this.rotation + 90) % 360);
    }
  }
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