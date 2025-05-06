<template>
	<view class="container">
		<!-- 图幅展示区域 -->
		<view class="map-container">
			<!-- WMTS地图层 -->
			<web-view v-if="useWmts" :src="wmtsUrl" class="wmts-view"></web-view>
			
			<!-- 静态图片层 -->
			<image
				v-else
				class="map-image placeholder-image"
				:src="currentMap.image"
				:style="{ transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)` }"
				@touchstart="handleTouchStart"
				@touchmove="handleTouchMove"
				@touchend="handleTouchEnd"
				@click="viewMapDetail"
			></image>
			
			<!-- 恢复按钮 -->
			<view class="reset-btn" @click="resetMapView">
				<text class="iconfont">↺</text>
			</view>
			
			<!-- 图层切换按钮 -->
			<view class="layer-toggle" @click="toggleMapLayer">
				<text>{{useWmts ? '静态图' : 'WMTS'}}</text>
			</view>
			
			<!-- 查看详情按钮 -->
			<view class="detail-btn" @click="viewMapDetail">
				<text>查看详情</text>
			</view>
		</view>
		
		<!-- 工具栏 -->
		<view class="toolbar">
			<button 
				class="tool-btn" 
				:disabled="currentIndex <= 0"
				@click="prevMap"
			>上一张</button>
			
			<button 
				class="tool-btn" 
				:disabled="currentIndex >= maps.length - 1"
				@click="nextMap"
			>下一张</button>
			
			<button 
				class="tool-btn download-btn"
				@click="showDownloadForm"
			>下载申请</button>
		</view>
		
		<!-- 下载申请表单弹窗 -->
		<view class="download-modal" v-if="showModal">
			<view class="modal-content">
				<view class="modal-title">下载申请</view>
				<view class="form-item">
					<view class="form-label">邮箱地址</view>
					<input 
						class="form-input"
						v-model="userEmail"
						placeholder="请输入您的邮箱地址"
						type="text"
					/>
				</view>
				<view class="form-item">
					<view class="form-label">申请理由</view>
					<textarea 
						class="form-textarea"
						v-model="downloadReason"
						placeholder="请输入申请理由（50字以内）"
						maxlength="50"
					></textarea>
					<view class="word-count">{{downloadReason.length}}/50</view>
				</view>
				<view class="modal-btns">
					<button class="modal-btn cancel-btn" @click="hideDownloadForm">取消</button>
					<button class="modal-btn confirm-btn primary-bg" @click="submitDownloadRequest">提交</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				topicId: '',
				topicTitle: '地质资源',
				currentIndex: 0,
				// 图幅数据（示例数据）
				maps: [
					{
						id: '1',
						title: '湖北省地质图',
						image: '/static/placeholder.png',
						wmtsUrl: 'https://map.service.com/wmts/1' // WMTS服务URL
					},
					{
						id: '2',
						title: '湖北省矿产分布图',
						image: '/static/placeholder.png',
						wmtsUrl: 'https://map.service.com/wmts/2'
					},
					{
						id: '3',
						title: '湖北省地貌类型图',
						image: '/static/placeholder.png',
						wmtsUrl: 'https://map.service.com/wmts/3'
					}
				],
				// WMTS配置
				useWmts: false,
				wmtsUrl: '',
				// 图片缩放和平移状态
				scale: 1,
				translateX: 0,
				translateY: 0,
				// 触摸事件相关变量
				lastTouchDistance: 0,
				lastTouchX: 0,
				lastTouchY: 0,
				// 下载申请表单
				showModal: false,
				downloadReason: '',
				userEmail: ''
			}
		},
		computed: {
			currentMap() {
				return this.maps[this.currentIndex] || {};
			}
		},
		onLoad(options) {
		  this.topicId = options.topic_id || '';
		  this.mapId = options.id || ''; // 添加mapId的获取
		  this.getMaps();
		  
		  // 初始化WMTS配置
		  if (this.currentMap && this.currentMap.wmtsUrl) {
		    this.wmtsUrl = this.currentMap.wmtsUrl;
		  }
		  
		  // 添加自定义返回按钮处理
		  const pages = getCurrentPages();
		  if (pages.length > 1) {
		    // 获取上一个页面的路径
		    const prevPage = pages[pages.length - 2];
		    this.fromPage = prevPage.route;
		    
		    // 如果上一页不是专题介绍页，则修改为正确路径
		    if (!this.fromPage.includes('topic-intro')) {
		      this.fromPage = 'pages/map/topic-intro';
		    }
		  }
		},
		
		// 添加自定义返回方法
		goBack() {
		  if (this.fromPage && this.fromPage.includes('topic-intro')) {
		    uni.navigateTo({
		      url: `/${this.fromPage}?topic_id=${this.topicId}`
		    });
		  } else {
		    uni.navigateBack();
		  }
		},
		methods: {
			// 获取当前专题的所有图幅
			getMaps() {
				console.log('获取图幅列表，专题ID:', this.topicId);
				// API调用代码...
			},
			
			// 切换地图图层显示模式
			toggleMapLayer() {
				this.useWmts = !this.useWmts;
				if (this.useWmts && this.currentMap.wmtsUrl) {
					this.wmtsUrl = this.currentMap.wmtsUrl;
				}
			},
			
			// 上一张图
			prevMap() {
				if (this.currentIndex > 0) {
					this.currentIndex--;
					this.resetMapView();
					if (this.useWmts && this.currentMap.wmtsUrl) {
						this.wmtsUrl = this.currentMap.wmtsUrl;
					}
				}
			},
			
			// 下一张图
			nextMap() {
				if (this.currentIndex < this.maps.length - 1) {
					this.currentIndex++;
					this.resetMapView();
					if (this.useWmts && this.currentMap.wmtsUrl) {
						this.wmtsUrl = this.currentMap.wmtsUrl;
					}
				}
			},
			
			// 重置图片视图
			resetMapView() {
				this.scale = 1;
				this.translateX = 0;
				this.translateY = 0;
			},
			
			// 查看地图详情
			viewMapDetail() {
				// 如果正在缩放或移动，不触发详情页
				if (this.scale !== 1 || this.translateX !== 0 || this.translateY !== 0) {
					return;
				}
				
				uni.navigateTo({
					url: `/pages/map/detail?id=${this.currentMap.id}`
				});
			},
			
			// 处理触摸开始事件
			handleTouchStart(e) {
				// 触摸事件处理代码...
			},
			
			// 处理触摸移动事件
			handleTouchMove(e) {
				// 触摸事件处理代码...
			},
			
			// 处理触摸结束事件
			handleTouchEnd() {
				this.lastTouchDistance = 0;
			},
			
			// 显示下载申请表单
			showDownloadForm() {
				this.showModal = true;
				this.downloadReason = '';
				this.userEmail = '';
			},
			
			// 隐藏下载申请表单
			hideDownloadForm() {
				this.showModal = false;
			},
			
			// 提交下载申请
			submitDownloadRequest() {
			}
		}
	}
</script>

<style>
	.container {
		display: flex;
		flex-direction: column;
		height: 100vh;
	}
	
	/* 图幅展示区域 */
	.map-container {
		position: relative;
		width: 100%;
		height: 80vh;
		background-color: #F8F8F8;
		overflow: hidden;
	}
	
	.map-image {
		width: 100%;
		height: 100%;
		transition: transform 0.05s ease;
		transform-origin: center;
	}
	
	.wmts-view {
		width: 100%;
		height: 100%;
	}
	
	.reset-btn {
		position: absolute;
		top: 20rpx;
		right: 20rpx;
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background-color: rgba(46, 139, 87, 0.8);
		color: #FFFFFF;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 40rpx;
		z-index: 10;
	}
	
	.layer-toggle {
		position: absolute;
		top: 20rpx;
		left: 20rpx;
		padding: 10rpx 20rpx;
		background-color: rgba(46, 139, 87, 0.8);
		color: #FFFFFF;
		border-radius: 30rpx;
		font-size: 28rpx;
		z-index: 10;
	}
	
	.detail-btn {
		position: absolute;
		bottom: 30rpx;
		right: 30rpx;
		padding: 10rpx 30rpx;
		background-color: rgba(46, 139, 87, 0.8);
		color: #FFFFFF;
		border-radius: 30rpx;
		font-size: 28rpx;
		z-index: 10;
	}
	
	/* 工具栏 */
	.toolbar {
		display: flex;
		justify-content: space-around;
		padding: 20rpx;
		background-color: #FFFFFF;
		border-top: 1px solid #EEEEEE;
	}
	
	.tool-btn {
		width: 30%;
		height: 80rpx;
		line-height: 80rpx;
		font-size: 28rpx;
		border-radius: 10rpx;
		color: #2E8B57;
		border: 1px solid #2E8B57;
		background-color: #FFFFFF;
	}
	
	.tool-btn[disabled] {
		color: #CCCCCC;
		border-color: #EEEEEE;
		background-color: #F8F8F8;
	}
	
	.tool-btn.download-btn {
		color: #FFFFFF;
		background-color: #2E8B57;
		font-size: 28rpx;
	}
	
	.download-modal {
	  position: fixed;
	  top: 0;
	  left: 0;
	  right: 0;
	  bottom: 0;
	  background-color: rgba(0, 0, 0, 0.5);
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  z-index: 999;
	}
	
	.modal-content {
	  width: 80%;
	  background-color: #FFFFFF;
	  border-radius: 15rpx;
	  padding: 40rpx 30rpx;
	}
	
	.modal-title {
	  font-size: 36rpx;
	  font-weight: bold;
	  color: #333333;
	  text-align: center;
	  margin-bottom: 40rpx;
	}
	
	.form-item {
	  margin-bottom: 30rpx;
	}
	
	.form-label {
	  font-size: 30rpx;
	  color: #666666;
	  margin-bottom: 15rpx;
	}
	
	.form-input {
	  width: 100%;
	  height: 80rpx;
	  border: 1px solid #EEEEEE;
	  border-radius: 8rpx;
	  padding: 0 20rpx;
	  font-size: 28rpx;
	}
	
	.form-textarea {
	  width: 100%;
	  height: 200rpx;
	  border: 1px solid #EEEEEE;
	  border-radius: 8rpx;
	  padding: 20rpx;
	  font-size: 28rpx;
	}
	
	.word-count {
	  text-align: right;
	  font-size: 24rpx;
	  color: #999999;
	  margin-top: 10rpx;
	}
	
	.modal-btns {
	  display: flex;
	  justify-content: space-between;
	  margin-top: 40rpx;
	}
	
	.modal-btn {
	  width: 45%;
	  height: 80rpx;
	  line-height: 80rpx;
	  text-align: center;
	  border-radius: 8rpx;
	  font-size: 30rpx;
	}
	
	.cancel-btn {
	  background-color: #F5F5F5;
	  color: #666666;
	}
	
	.confirm-btn {
	  color: #FFFFFF;
	}
</style>