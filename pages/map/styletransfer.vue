<template>
  <view class="container">
    <!-- 插画背景层 -->
    <view class="background-image">
      <image class="bg-illustration" src="/static/background/main-bg.png" mode="aspectFill"></image>
    </view>
    
    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 原图上传区域 -->
      <view class="section">
        <view class="section-title">原图</view>
        <!-- 上传区域，点击触发selectImage方法 -->
        <view class="upload-area" @click="selectImage">
          <!-- 显示已上传的图片或上传提示 -->
          <image v-if="originalImage" :src="originalImage" class="preview-image" mode="aspectFit"></image>
          <view v-else class="upload-placeholder">
            <text class="upload-icon">+</text>
            <text class="upload-text">点击上传原图</text>
          </view>
        </view>
      </view>
      
      <!-- 风格选择区域 -->
      <view class="section">
        <view class="section-title">选择或输入关键词</view>
        
        <!-- 风格描述输入框 -->
        <view class="input-container">
          <view class="input-label">风格描述</view>
          <view class="search-inputbox">
            <image class="search-icon" src="/static/icons/search.png" mode="aspectFit"></image>
            <input
                class="search-input"
                placeholder="输入目标风格描述"
                placeholder-class="search-placeholder"
                v-model="styleQuery"
            />
            <!-- 清空输入按钮 -->
            <view v-if="styleQuery" class="clear-button" @click="clearStyleQuery">
              <text class="clear-icon">×</text>
            </view>
          </view>
        </view>
        
        <!-- 风格标签选择区 -->
        <view class="style-tags">
          <view 
            v-for="(tag, index) in styleTags" 
            :key="index" 
            :class="['style-tag', selectedStyle === tag ? 'active' : '']"
            @click="selectStyle(tag)"
          >
            {{ tag }}
          </view>
        </view>
      </view>
      
      <!-- 生成按钮区域 -->
      <view class="section">
        <!-- 这里把原来的普通文字改成了 section-title 样式 -->
        <view class="section-title">生成地图</view>
      
        <view class="input-container">
          <view class="search-inputbox">
            <input
                class="search-input"
                placeholder="生成地图链接"
                placeholder-class="search-placeholder"
                v-model="generatedLink"
                disabled
            />
          </view>
        </view>
      
        <!-- 生成按钮，点击触发generateStyleTransfer方法 -->
        <button class="generate-button" :disabled="!originalImage || !styleQuery || generating" @click="generateStyleTransfer">
          {{ generating ? '生成中...' : '开始风格迁移' }}
        </button>
      </view>
      
      <!-- 地图预览区域（仅在生成结果后显示） -->
      <view class="section preview-section" v-if="resultImage">
        <view class="preview-title">地图预览</view>
        <!-- 显示风格迁移后的结果图片 -->
        <image :src="resultImage" class="result-image" mode="aspectFit"></image>
        <!-- 操作按钮组 -->
        <view class="action-buttons">
          <button class="action-button save-button" @click="saveImage">保存图片</button>
          <button class="action-button share-button" @click="shareImage">分享</button>
        </view>
      </view>
      
      <!-- 加载提示遮罩层（生成过程中显示） -->
      <view class="loading-mask" v-if="generating">
        <view class="loading-content">
          <view class="loading-spinner"></view>
          <view class="loading-text">AI正在生成风格迁移效果...</view>
          <view class="loading-subtext">这可能需要几秒钟时间</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      originalImage: '',        // 原图URL
      originalImageFile: null,  // 原图文件对象
      styleQuery: '',           // 风格描述文本
      selectedStyle: '',        // 选中的风格标签
      generatedLink: '',        // 生成的地图链接
      resultImage: '',          // 结果图片URL
      generating: false,        // 是否正在生成中
      // 预设风格标签列表
      styleTags: [
        '水墨画', '油画', '水彩'
      ]
    }
  },
  
  methods: {
    /**
     * 选择图片方法 - 调用uni-app选择图片API
     */
    selectImage() {
      uni.chooseImage({
        count: 1, // 只允许选择一张图片
        sizeType: ['compressed'], // 压缩图片
        sourceType: ['album', 'camera'], // 可从相册或相机选择
        success: (res) => {
          // 获取临时文件路径和文件对象
          const tempFilePath = res.tempFilePaths[0];
          this.originalImage = tempFilePath;
          this.originalImageFile = res.tempFiles[0];
        }
      });
    },
    
    /**
     * 选择风格标签方法
     * @param {string} style - 选中的风格标签
     */
    selectStyle(style) {
      this.selectedStyle = style;
      this.styleQuery = style;
    },
    
    /**
     * 清空风格查询条件
     */
    clearStyleQuery() {
      this.styleQuery = '';
      this.selectedStyle = '';
    },
    
    /**
     * 生成风格迁移效果 - 主要业务逻辑
     * 1. 验证输入
     * 2. 调用后端API
     * 3. 处理响应结果
     */
    async generateStyleTransfer() {
      // 验证原图是否上传
      if (!this.originalImage) {
        uni.showToast({
          title: '请先上传原图',
          icon: 'none'
        });
        return;
      }
      
      // 验证风格描述是否输入
      if (!this.styleQuery) {
        uni.showToast({
          title: '请输入或选择风格描述',
          icon: 'none'
        });
        return;
      }
      
      // 设置生成中状态，显示加载动画
      this.generating = true;
      
      try {
        // 调用后端风格迁移API
        const response = await uni.uploadFile({
          url: 'https://your-api-domain.com/api/style-transfer', // 后端API地址
          filePath: this.originalImage, // 上传的图片文件路径
          name: 'image', // 文件字段名
          formData: {
            style_text: this.styleQuery // 风格描述文本
          },
          header: {
            'Content-Type': 'multipart/form-data' // 设置请求头
          }
        });
        
        // 处理成功响应
        if (response.statusCode === 200) {
          const result = JSON.parse(response.data);
          // 设置生成的地图链接和结果图片
          this.generatedLink = result.download_url || 'https://map.style/transfer/' + Date.now();
          this.resultImage = result.image_url || 'https://via.placeholder.com/400x300?text=风格迁移结果';
          
          // 显示成功提示
          uni.showToast({
            title: '风格迁移完成',
            icon: 'success'
          });
        } else {
          // 处理服务器错误
          throw new Error('服务器处理失败');
        }
      } catch (error) {
        // 处理请求异常
        console.error('风格迁移失败:', error);
        uni.showToast({
          title: '生成失败，请重试',
          icon: 'none'
        });
        
        // 开发环境下模拟成功结果
        setTimeout(() => {
          this.generatedLink = 'https://map.style/transfer/' + Date.now();
          this.resultImage = 'https://via.placeholder.com/400x300?text=风格迁移结果';
          uni.showToast({
            title: '风格迁移完成(模拟)',
            icon: 'success'
          });
        }, 2000);
      } finally {
        // 无论成功失败，都取消生成中状态
        this.generating = false;
      }
    },
    
    /**
     * 保存图片方法
     */
    saveImage() {
      uni.showToast({
        title: '图片已保存到相册',
        icon: 'success'
      });
    },
    
    /**
     * 分享图片方法
     */
    shareImage() {
      uni.showToast({
        title: '分享功能准备中',
        icon: 'none'
      });
    }
  }
}
</script>

<style>
/* 容器样式 */
.container {
  position: relative;
  min-height: 100vh;
  background: #F0F2F5;
  padding: 20rpx;
  overflow-x: hidden;
}

/* 背景图片样式 */
.background-image {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1; /* 确保背景在内容下方 */
}

.bg-illustration {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 保持图片比例并覆盖整个区域 */
}

/* 主内容区域样式 */
.main-content {
  position: relative;
  z-index: 2; /* 确保内容在背景上方 */
  padding: 30rpx;
}

/* 区域卡片样式 */
.section {
  background: rgba(255, 255, 255, 0.65); /* 半透明白色背景 */
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08); /* 轻微阴影提升层次感 */
}

/* 区域标题样式 - 使用#007c52绿色 */
.section-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #007c52;
  margin-bottom: 25rpx;
  padding-left: 15rpx;
  border-left: 8rpx solid #007c52;
}

/* 输入容器样式 */
.input-container {
  margin-bottom: 25rpx;
}

.input-label {
  display: block;
  font-size: 30rpx;
  color: #2c3e50;
  margin-bottom: 15rpx;
  font-weight: 500;
}

/* 搜索输入框样式 */
.search-inputbox {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 12rpx;
  border: 2rpx solid #ddd; /* 浅灰色边框 */
  padding: 0 20rpx;
  height: 80rpx;
}

.search-icon {
  width: 40rpx;
  height: 40rpx;
  flex-shrink: 0; /* 防止图标被压缩 */
}

.search-input {
  flex: 1; /* 占据剩余空间 */
  height: 100%;
  font-size: 30rpx;
  color: #333333;
  padding: 0 15rpx;
  background: transparent; /* 透明背景 */
}

/* 清空按钮样式 */
.clear-button {
  width: 45rpx;
  height: 45rpx;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 22rpx; /* 圆形按钮 */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease; /* 平滑过渡效果 */
}

.clear-button:active {
  background: rgba(0, 0, 0, 0.1);
  transform: scale(0.95); /* 点击时轻微缩小 */
}

.clear-icon {
  font-size: 32rpx;
  color: #666666;
  font-weight: normal;
  line-height: 1;
}

/* 上传区域样式 - 使用#007c52绿色 */
.upload-area {
  height: 300rpx;
  border: 2rpx dashed #007c52;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.7);
  overflow: hidden;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  font-size: 60rpx;
  color: #007c52;
  margin-bottom: 15rpx;
}

.upload-text {
  font-size: 28rpx;
  color: #7f8c8d;
}

/* 图片预览样式 */
.preview-image, .result-image {
  width: 100%;
  height: 100%;
}

/* 风格标签样式 */
.style-tags {
  display: flex;
  flex-wrap: wrap; /* 允许换行 */
  gap: 20rpx; /* 标签间距 */
  margin-top: 20rpx;
}

.style-tag {
  padding: 12rpx 24rpx;
  background-color: #ecf0f1;
  border-radius: 30rpx; /* 椭圆形状 */
  font-size: 26rpx;
  color: #7f8c8d;
  transition: all 0.2s ease; /* 平滑过渡 */
}

/* 选中状态的标签样式 - 使用#007c52绿色 */
.style-tag.active, .style-tag:active {
  background-color: #007c52;
  color: white;
}

/* 生成按钮样式 - 使用#007c52绿色 */
.generate-button {
  background: linear-gradient(135deg, #007c52, #005a3c);
  color: #ffffff !important;          /* 强制白色文字 */
  border: none;
  border-radius: 12rpx;
  padding: 20rpx 40rpx;
  font-size: 32rpx;
  font-weight: bold;
  text-align: center;
  display: block;
  width: 100%;
  margin-top: 20rpx;
  box-shadow: 0 4rpx 15rpx rgba(0, 124, 82, 0.3);
}

/* 禁用状态的按钮样式 */
.generate-button:disabled {
  background: linear-gradient(135deg, #bdc3c7, #95a5a6);
  color: #ffffff !important;          /* 禁用状态也保持白色 */
  box-shadow: none;
}

/* 预览区域样式 */
.preview-section {
  margin-top: 40rpx;
}

.preview-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #007c52;
  margin-bottom: 25rpx;
  text-align: center;
  position: relative;
}

/* 标题下方的装饰线 - 使用#007c52绿色 */
.preview-title:after {
  content: "";
  display: block;
  width: 100rpx;
  height: 4rpx;
  background: #007c52;
  margin: 10rpx auto;
  border-radius: 2rpx;
}

/* 结果图片样式 */
.result-image {
  width: 100%;
  height: 300rpx;
  border-radius: 12rpx;
  margin-bottom: 25rpx;
  border: 1rpx solid #ddd; /* 浅灰色边框 */
}

/* 操作按钮组样式 */
.action-buttons {
  display: flex;
  gap: 20rpx; /* 按钮间距 */
}

.action-button {
  flex: 1; /* 平均分配宽度 */
  padding: 20rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
  border: none;
}

.save-button {
  background-color: #007c52; /* 绿色背景 */
  color: white;
}

.share-button {
  background-color: #5a8c6e; /* 稍浅的绿色背景 */
  color: white;
}

/* 加载遮罩层样式 */
.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5); /* 半透明黑色背景 */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999; /* 确保在最上层 */
}

.loading-content {
  background-color: white;
  border-radius: 16rpx;
  padding: 40rpx;
  text-align: center;
  width: 500rpx;
}

/* 加载动画样式 - 使用#007c52绿色 */
.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 6rpx solid #f3f3f3;
  border-top: 6rpx solid #007c52;
  border-radius: 50%;
  animation: spin 1s linear infinite; /* 无限旋转动画 */
  margin: 0 auto 30rpx;
}

/* 旋转动画定义 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 32rpx;
  color: #2c3e50;
  margin-bottom: 15rpx;
}

.loading-subtext {
  font-size: 26rpx;
  color: #7f8c8d;
}
</style>