<template>
  <!-- 工具栏，独立图层 -->
  <view class="floating-toolbar">
    <image class="control-btn" :style="rotationStyle" src="/static/icons/info.svg" @click="viewDetail" />
    <image class="control-btn" :style="rotationStyle" src="/static/icons/reset.svg" @click="resetTransform" />
    <image class="control-btn" :style="rotationStyle" src="/static/icons/rotate.svg" @click="rotate" />
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
        :disabled="!paintLineMode && !rectMode && !circleMode && !polylineMode && !polygonMode"
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
              'active': currentColor === color && (paintLineMode || rectMode || circleMode || polylineMode || polygonMode),
              'disabled': !paintLineMode && !rectMode && !circleMode && !polylineMode && !polygonMode
            }" 
            @click="selectColor(color)"
          />
        </view>
      </view>
    </view>
  </view>

  <!-- 地图容器 -->
  <view class="map-container" 
        id="map-container"
        :style="containerStyle"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove" 
        @touchend="handleTouchEnd">
    <image 
      class="map-image"
      id="map-image"
      :style="imageStyle"
      :src="currentMapUrl"
      mode="widthFix" 
      @load="onImageLoad"
      @error="onImageError"
      :show-menu-by-longpress="false"
    />
    <canvas 
      v-if="paintLineMode || rectMode || circleMode || polylineMode || polygonMode"
      class="doodle-canvas"
      canvas-id="doodleCanvas"
      @touchstart="handleCanvasTouchStart"
      @touchmove="handleCanvasTouchMove"
      @touchend="handleCanvasTouchEnd"
      :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px', transform: `rotate(${rotation}deg)` }"
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
      type: Array, // [xmin, ymin, xmax, ymax]
      required: false
    }
  },
  data() {
    return {
      scale: 1,
      translateX: 0,
      translateY: 0,
      rotation: 0,
      touching: false,
      touchStartData: null,
      maxScale: 10,
      initialScale: 1,
      lastTap: 0,
      lastTapX: 0,
      lastTapY: 0,
      lastCanvasTapTime: 0, // For double-tap detection in polyline and polygon
      lastRotateTime: 0, // For debouncing rotate button
      isDoodling: false,
      showToast: false,
      paintLineMode: false,
      rectMode: false,
      circleMode: false,
      polylineMode: false,
      polygonMode: false,
      canvasWidth: 0,
      canvasHeight: 0,
      canvasContext: null,
      isDrawing: false,
      currentShape: null,
      shapes: [],
      currentColor: null,
      clearMode: false,
      lineWidth: 2,
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
        transform: `translate3d(${this.translateX}px, ${this.translateY}px, 0)`,
        transition: 'none'
      }
    },
    imageStyle() {
      return {
        transform: `rotate(${this.rotation}deg)  scale(${this.scale})`,
      }
    },
    rotationStyle() {
      return {
        transform: `rotate(${this.rotation}deg)`,
        transition: 'transform 0.5s ease-in-out'
      }
    },
    rotationStyle180() {
      return {
        transform: `rotate(${this.rotation + 180}deg)`,
        transition: 'transform 0.5s ease-in-out'
      }
    },
  },
  methods: {
    async fitToExtent(extent) {
      if (!extent) return;
      let [xmin, ymin, xmax, ymax] = extent;

      const info = await this.getContainerImageGeometries();
      const imageWidth = info.imageInfo.width;
      const imageHeight = info.imageInfo.height;
      const containerWidth = info.containerInfo.width;
      const containerHeight = info.containerInfo.height;

      // 将归一化 extent 转换为像素值
      const left = xmin * imageWidth;
      const right = xmax * imageWidth;
      const top = ymin * imageHeight;
      const bottom = ymax * imageHeight;

      const targetWidth = right - left;
      const targetHeight = bottom - top;

      // 计算缩放比例（保持目标区域完整显示在 container 中）
      const scaleX = containerWidth / targetWidth;
      const scaleY = containerHeight / targetHeight;
      const newScale = Math.min(scaleX, scaleY);

      // 缩放后目标区域大小
      const scaledTargetWidth = targetWidth * newScale;
      const scaledTargetHeight = targetHeight * newScale;

      // 计算偏移：让目标区域居中于 container
      const offsetX = (containerWidth - scaledTargetWidth) / 2;
      const offsetY = (containerHeight - scaledTargetHeight) / 2;

      // 设置变换
      this.scale = newScale;
      this.translateX = -left * newScale + offsetX;
      this.translateY = -top * newScale + offsetY;

      console.log("fitToExtent 完成:", {
        scale: this.scale,
        translateX: this.translateX,
        translateY: this.translateY
      });
    },
    async onImageLoad() {
      console.log('原图显示成功');
      const query = uni.createSelectorQuery().in(this);
      query.select('#map-container').boundingClientRect(data => {
        if (data) {
          this.canvasWidth = data.width;
          this.canvasHeight = data.height;
          console.log('画布尺寸初始化：', { width: this.canvasWidth, height: this.canvasHeight });
          this.canvasContext = uni.createCanvasContext('doodleCanvas', this);
          this.canvasContext.setLineWidth(this.lineWidth);
          if (this.currentColor) {
            this.canvasContext.setStrokeStyle(this.currentColor);
          }
          this.canvasContext.setLineCap('round');
          this.canvasContext.setLineJoin('round');
          this.drawAllShapes();
        } else {
          console.error('无法获取 map-container 尺寸');
        }
      }).exec();

      await this.fitToExtent(this.extends); // test 年平均日照数： [0.048265918,0.277440466,0.48574635,0.655745622]

      this.$emit('image-load');
    },
    onImageError(error) {
      console.error('原图显示失败:', error);
      this.$emit('image-error', error);
    },
    async getCanvasCoordinates(touch) {
      const query = uni.createSelectorQuery().in(this);
      const canvasRect = await new Promise(resolve => {
        query.select('.doodle-canvas').boundingClientRect(resolve).exec();
      });
      if (!canvasRect) {
        console.error('无法获取画布位置');
        return { x: touch.x, y: touch.y };
      }
      const centerX = canvasRect.left + canvasRect.width / 2;
      const centerY = canvasRect.top + canvasRect.height / 2;
      const dx = touch.x - centerX;
      const dy = touch.y - centerY;
      const angle = -this.rotation * Math.PI / 180; // 逆旋转以校正触摸坐标
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const localDx = cos * dx - sin * dy;
      const localDy = sin * dx + cos * dy;
      const canvasX = (localDx + this.canvasWidth / 2) / this.scale;
      const canvasY = (localDy + this.canvasHeight / 2) / this.scale;
      console.log('触摸坐标转换：', { touchX: touch.x, touchY: touch.y, canvasX, canvasY });
      return { x: canvasX, y: canvasY };
    },
    async handleCanvasTouchStart(e) {
      if (!this.paintLineMode && !this.rectMode && !this.circleMode && !this.polylineMode && !this.polygonMode) return;
      const touch = e.touches[0];
      const coords = await this.getCanvasCoordinates(touch);

      if ((this.polylineMode || this.polygonMode) && this.currentShape) {
        const now = Date.now();
        if (now - this.lastCanvasTapTime < 300 && this.currentShape.points.length > 1) {
          if (this.polygonMode) {
            this.currentShape.points.push(this.currentShape.points[0]);
          }
          this.shapes.push(this.currentShape);
          this.currentShape = null;
          this.drawAllShapes();
          this.lastCanvasTapTime = 0;
          return;
        }
        this.lastCanvasTapTime = now;
      }

      this.isDrawing = true;

      if (this.paintLineMode) {
        this.currentShape = {
          type: 'line',
          points: [{ x: coords.x, y: coords.y }],
          color: this.currentColor,
          lineWidth: this.lineWidth
        };
      } else if (this.rectMode) {
        this.currentShape = {
          type: 'rect',
          startX: coords.x,
          startY: coords.y,
          endX: coords.x,
          endY: coords.y,
          color: this.currentColor,
          lineWidth: this.lineWidth
        };
      } else if (this.circleMode) {
        this.currentShape = {
          type: 'circle',
          centerX: coords.x,
          centerY: coords.y,
          radius: 0,
          color: this.currentColor,
          lineWidth: this.lineWidth
        };
      } else if (this.polylineMode) {
        if (!this.currentShape) {
          this.currentShape = {
            type: 'polyline',
            points: [{ x: coords.x, y: coords.y }],
            color: this.currentColor,
            lineWidth: this.lineWidth
          };
        } else {
          this.currentShape.points.push({ x: coords.x, y: coords.y });
        }
      } else if (this.polygonMode) {
        if (!this.currentShape) {
          this.currentShape = {
            type: 'polygon',
            points: [{ x: coords.x, y: coords.y }],
            color: this.currentColor,
            lineWidth: this.lineWidth
          };
        } else {
          this.currentShape.points.push({ x: coords.x, y: coords.y });
        }
      }
      this.drawAllShapes();
    },
    async handleCanvasTouchMove(e) {
      if (!this.isDrawing || (!this.paintLineMode && !this.rectMode && !this.circleMode && !this.polylineMode && !this.polygonMode)) return;
      e.preventDefault();
      const touch = e.touches[0];
      const coords = await this.getCanvasCoordinates(touch);
      const currentX = coords.x;
      const currentY = coords.y;

      if (this.paintLineMode) {
        this.currentShape.points.push({ x: currentX, y: currentY });
        this.drawAllShapes();
      } else if (this.rectMode) {
        this.currentShape.endX = currentX;
        this.currentShape.endY = currentY;
        this.drawAllShapes();
      } else if (this.circleMode) {
        const dx = currentX - this.currentShape.centerX;
        const dy = currentY - this.currentShape.centerY;
        this.currentShape.radius = Math.sqrt(dx * dx + dy * dy);
        this.drawAllShapes();
      } else if (this.polylineMode && this.currentShape) {
        const lastPoint = this.currentShape.points[this.currentShape.points.length - 1];
        lastPoint.x = currentX;
        lastPoint.y = currentY;
        this.drawAllShapes();
      } else if (this.polygonMode && this.currentShape) {
        const lastPoint = this.currentShape.points[this.currentShape.points.length - 1];
        lastPoint.x = currentX;
        lastPoint.y = currentY;
        this.drawAllShapes();
      }
    },
    handleCanvasTouchEnd() {
      if (!this.isDrawing || (!this.paintLineMode && !this.rectMode && !this.circleMode && !this.polylineMode && !this.polygonMode)) return;
      this.isDrawing = false;
      if (this.paintLineMode || this.rectMode || this.circleMode) {
        this.shapes.push(this.currentShape);
        this.currentShape = null;
        this.drawAllShapes();
      }
    },
    drawAllShapes() {
      if (!this.canvasContext) return;
      this.canvasContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.shapes.forEach(shape => this.drawShape(shape));
      if (this.currentShape) this.drawShape(this.currentShape);
      this.canvasContext.draw(true);
    },
    drawShape(shape) {
      this.canvasContext.beginPath();
      this.canvasContext.setStrokeStyle(shape.color);
      this.canvasContext.setLineWidth(shape.lineWidth);
      this.canvasContext.setLineCap('round');
      this.canvasContext.setLineJoin('round');

      if (shape.type === 'line') {
        shape.points.forEach((point, index) => {
          if (index === 0) this.canvasContext.moveTo(point.x, point.y);
          else this.canvasContext.lineTo(point.x, point.y);
        });
        this.canvasContext.stroke();
      } else if (shape.type === 'rect') {
        this.canvasContext.rect(shape.startX, shape.startY, shape.endX - shape.startX, shape.endY - shape.startY);
        this.canvasContext.stroke();
      } else if (shape.type === 'circle') {
        this.canvasContext.arc(shape.centerX, shape.centerY, shape.radius, 0, 2 * Math.PI);
        this.canvasContext.stroke();
      } else if (shape.type === 'polyline') {
        shape.points.forEach((point, index) => {
          if (index === 0) this.canvasContext.moveTo(point.x, point.y);
          else this.canvasContext.lineTo(point.x, point.y);
        });
        this.canvasContext.stroke();
      } else if (shape.type === 'polygon') {
        shape.points.forEach((point, index) => {
          if (index === 0) this.canvasContext.moveTo(point.x, point.y);
          else this.canvasContext.lineTo(point.x, point.y);
        });
        this.canvasContext.closePath();
        this.canvasContext.stroke();
      }
    },
    handleTouchStart(e) {
      if (this.paintLineMode || this.rectMode || this.circleMode || this.polylineMode || this.polygonMode) return;
      this.touching = true;
      const touches = e.touches;
      const x = touches[0].clientX;
      const y = touches[0].clientY;

      this.touchStartData = {
        startX: x,
        startY: y,
        type: touches.length === 2 ? 'zoom' : 'pan',
        moved: false // 标记是否移动过
      };

      // PAN
      if (touches.length === 1) {
        this.touchStartData = {
          ...this.touchStartData,
          startTranslateX: this.translateX,
          startTranslateY: this.translateY
        };
      } else
        // ZOOM
        if (touches.length === 2) {
        const touch1 = touches[0];
        const touch2 = touches[1];
        const distance = this.getDistance(touch1, touch2);
        const center = this.getCenter(touch1, touch2);

        this.touchStartData = {
          ...this.touchStartData,
          startDistance: distance,
          startScale: this.scale,
          centerX: center.x,
          centerY: center.y,
          startTranslateX: this.translateX,
          startTranslateY: this.translateY
        };
      }

      // Double Click
      const now = Date.now();
      const isDoubleTap = now - this.lastTap < 300 && Math.abs(x - this.lastTapX) < 10 && Math.abs(y - this.lastTapY) < 10;
      if (isDoubleTap) {
        clearTimeout(this.singleClickTimeout); // 阻止之前延迟触发的单击
        if (this.scale * 2 <= this.maxScale) {
          this.scale = this.scale * 2;
        }
        this.lastTap = 0;
        this.lastTapX = 0;
        this.lastTapY = 0;
      } else {
        // 设置单击延迟触发逻辑
        this.singleClickTimeout = setTimeout(() => {
          if (!this.touchStartData?.moved) {
            this.handleSingleClick(x,y);
          }
        }, 300);
        this.lastTap = now;
        this.lastTapX = x;
        this.lastTapY = y;
      }
    },
    handleTouchMove(e) {
      if (this.paintLineMode || this.rectMode || this.circleMode || this.polylineMode || this.polygonMode) return;
      if (!this.touching || !this.touchStartData) return;

      e.preventDefault();
      const touches = e.touches;

      this.touchStartData.moved = true;

      if (this.touchStartData.type === 'pan' && touches.length === 1) {
        const deltaX = touches[0].clientX - this.touchStartData.startX;
        const deltaY = touches[0].clientY - this.touchStartData.startY;
        this.translateX = this.touchStartData.startTranslateX + deltaX;
        this.translateY = this.touchStartData.startTranslateY + deltaY;
      } else if (this.touchStartData.type === 'zoom' && touches.length === 2) {
        const touch1 = touches[0];
        const touch2 = touches[1];
        const distance = this.getDistance(touch1, touch2);
        const scaleRatio = distance / this.touchStartData.startDistance;

        let newScale = this.touchStartData.startScale * scaleRatio;
        newScale = Math.max(1, Math.min(this.maxScale, newScale));

        const scaleDiff = newScale - this.scale;
        const center = this.getCenter(touch1, touch2);

        this.scale = newScale;
        this.translateX = this.touchStartData.startTranslateX - (center.x - this.touchStartData.centerX) * scaleDiff;
        this.translateY = this.touchStartData.startTranslateY - (center.y - this.touchStartData.centerY) * scaleDiff;
      }
    },
    handleTouchEnd() {
      if (this.paintLineMode || this.rectMode || this.circleMode || this.polylineMode || this.polygonMode) return;
      this.touching = false;
      this.touchStartData = null;
    },
    handleSingleClick(x,y) {
      console.log("singleClick",x,y)
      console.log('handleSingleClick',this.getImageNormCoordinates(x,y));
      // TODO
    },

    async getImageNormCoordinates(x, y) {
      const position = await this.getContainerImageGeometries()

      console.log('image info:', position.imageInfo);
      console.log('container info:', position.containerInfo);

      // TODO: compute the normalized image coodinates from the args above

    },

    async getContainerImageGeometries() {
      const query1 = uni.createSelectorQuery().in(this);
      const query2 = uni.createSelectorQuery().in(this);
      const imageInfo = new Promise(resolve => {
        query1.select('#map-image').fields({size:true, computedStyle:['transform']},resolve).exec();
      });
      const containerInfo = new Promise(resolve => {
        query2.select('#map-container').fields({size:true, computedStyle:['transform']},resolve).exec();
      });

      const [image, container] = await Promise.all([imageInfo, containerInfo]);
      return {
        imageInfo: image,
        containerInfo: container
      }
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
    resetTransform() {
      this.scale = 1;
      this.translateX = 0;
      this.translateY = 0;
      this.rotation = 0;
      if (this.canvasContext) {
        this.drawAllShapes();
      }
    },
    rotate() {
      const now = Date.now();
      if (now - this.lastRotateTime < 300) return; // 防抖
      this.lastRotateTime = now;
      this.rotation = (this.rotation + 90) % 360;
      console.log('Map rotated to:', this.rotation, 'degrees (clockwise)');
      if (this.canvasContext) {
        this.drawAllShapes();
      }
    },
    switchMap(direction) {
      this.$emit('switch-map', direction);
      if (this.canvasContext) {
        this.drawAllShapes();
      }
    },
    viewDetail() {
      if (!this.allMaps[this.currentMapIndex]) return;
      let url = `/pages/map/detail?id=${this.allMaps[this.currentMapIndex].map_id}&from=browse`;
      if (this.topic) {
        url += `&topic=${this.topic}`;
      } else if (this.topicId) {
        url += `&topic_id=${this.topicId}`;
      }
      uni.navigateTo({ url });
    },
    toggleDoodle() {
      this.isDoodling = !this.isDoodling;
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 1500);
      if (!this.isDoodling) {
        this.paintLineMode = false;
        this.rectMode = false;
        this.circleMode = false;
        this.polylineMode = false;
        this.polygonMode = false;
        this.clearMode = false;
      }
    },
    togglePaintLineMode() {
      this.paintLineMode = !this.paintLineMode;
      this.rectMode = false;
      this.circleMode = false;
      this.polylineMode = false;
      this.polygonMode = false;
      this.clearMode = false;
      if (this.paintLineMode && this.canvasContext) {
        this.currentColor = this.currentColor || '#000000';
        this.canvasContext.setLineWidth(this.lineWidth);
        this.canvasContext.setStrokeStyle(this.currentColor);
        this.canvasContext.setLineCap('round');
        this.canvasContext.setLineJoin('round');
      }
    },
    toggleRectMode() {
      this.rectMode = !this.rectMode;
      this.paintLineMode = false;
      this.circleMode = false;
      this.polylineMode = false;
      this.polygonMode = false;
      this.clearMode = false;
      if (this.rectMode && this.canvasContext) {
        this.currentColor = this.currentColor || '#000000';
        this.canvasContext.setLineWidth(this.lineWidth);
        this.canvasContext.setStrokeStyle(this.currentColor);
        this.canvasContext.setLineCap('round');
        this.canvasContext.setLineJoin('round');
      }
    },
    toggleCircleMode() {
      this.circleMode = !this.circleMode;
      this.paintLineMode = false;
      this.rectMode = false;
      this.polylineMode = false;
      this.polygonMode = false;
      this.clearMode = false;
      if (this.circleMode && this.canvasContext) {
        this.currentColor = this.currentColor || '#000000';
        this.canvasContext.setLineWidth(this.lineWidth);
        this.canvasContext.setStrokeStyle(this.currentColor);
        this.canvasContext.setLineCap('round');
        this.canvasContext.setLineJoin('round');
      }
    },
    togglePolylineMode() {
      this.polylineMode = !this.polylineMode;
      this.paintLineMode = false;
      this.rectMode = false;
      this.circleMode = false;
      this.polygonMode = false;
      this.clearMode = false;
      if (this.polylineMode && this.canvasContext) {
        this.currentColor = this.currentColor || '#000000';
        this.canvasContext.setLineWidth(this.lineWidth);
        this.canvasContext.setStrokeStyle(this.currentColor);
        this.canvasContext.setLineCap('round');
        this.canvasContext.setLineJoin('round');
      }
    },
    togglePolygonMode() {
      this.polygonMode = !this.polygonMode;
      this.paintLineMode = false;
      this.rectMode = false;
      this.circleMode = false;
      this.polylineMode = false;
      this.clearMode = false;
      if (this.polygonMode && this.canvasContext) {
        this.currentColor = this.currentColor || '#000000';
        this.canvasContext.setLineWidth(this.lineWidth);
        this.canvasContext.setStrokeStyle(this.currentColor);
        this.canvasContext.setLineCap('round');
        this.canvasContext.setLineJoin('round');
      }
    },
    selectColor(color) {
      if (this.paintLineMode || this.rectMode || this.circleMode || this.polylineMode || this.polygonMode) {
        this.currentColor = color;
        this.clearMode = false;
        if (this.canvasContext) {
          this.canvasContext.setStrokeStyle(this.currentColor);
          this.drawAllShapes();
        }
      }
    },
    updateLineWidth(e) {
      if ((this.paintLineMode || this.rectMode || this.circleMode || this.polylineMode || this.polygonMode) && this.canvasContext) {
        this.lineWidth = e.detail.value;
        this.canvasContext.setLineWidth(this.lineWidth);
        this.drawAllShapes();
      }
    },
    clearCanvas() {
      if (this.canvasContext) {
        this.shapes = [];
        this.currentShape = null;
        this.canvasContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.canvasContext.draw(true);
        this.paintLineMode = false;
        this.rectMode = false;
        this.circleMode = false;
        this.polylineMode = false;
        this.polygonMode = false;
        this.clearMode = true;
      }
    }
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
  z-index: 1;
}

.doodle-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  background: transparent;
  transform-origin: center;
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
  grid-template-columns: 1fr 1fr;
  grid-auto-flow: row;
  gap: 10rpx;
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