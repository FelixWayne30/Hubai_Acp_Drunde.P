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
			></image>
			
			<!-- 操作按钮组 -->
			<view class="map-controls">
				<!-- 恢复按钮 -->
				<view class="control-btn reset-btn" @click="resetMapView">
					<text class="iconfont">↺</text>
				</view>
				
				<!-- 放大按钮 -->
				<view class="control-btn" @click="zoomIn">
					<text class="iconfont">+</text>
				</view>
				
				<!-- 缩小按钮 -->
				<view class="control-btn" @click="zoomOut">
					<text class="iconfont">-</text>
				</view>
				
				<!-- 图层切换按钮 -->
				<view class="control-btn layer-toggle" @click="toggleMapLayer">
					<text>{{useWmts ? '静态图' : 'WMTS'}}</text>
				</view>
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
			
			<view class="map-title">
				{{currentMap.title || '地图图幅'}}
			</view>
			
			<button 
				class="tool-btn" 
				:disabled="currentIndex >= maps.length - 1"
				@click="nextMap"
			>下一张</button>
		</view>
		
		<!-- 下载工具栏 -->
		<view class="download-bar">
			<button 
				class="download-btn primary-bg"
				@click="showDownloadForm"
			>申请下载此图</button>
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
						image: '/static/maps/hubei-geology.png',
						wmtsUrl: 'https://map.service.com/wmts/geology'
					},
					{
						id: '2',
						title: '湖北省矿产分布图',
						image: '/static/maps/hubei-mineral-map.png',
						wmtsUrl: 'https://map.service.com/wmts/mineral'
					},
					{
						id: '3',
						title: '湖北省地貌类型图',
						image: '/static/maps/hubei-terrain.png',
						wmtsUrl: 'https://map.service.com/wmts/terrain'
					}
				],
				// WMTS配置
				useWmts: false,
				wmtsUrl: '',
				// 图片缩放和平移状态
				scale: 1,
				minScale: 0.5,
				maxScale: 3,
				scaleStep: 0.2,
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
			
			// 如果指定了特定mapId，则定位到该图幅
			if (this.mapId) {
				const index = this.maps.findIndex(map => map.id === this.mapId);
				if (index !== -1) {
					this.currentIndex = index;
				}
			}
			
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
		methods: {
			// 获取当前专题的所有图幅
			getMaps() {
				console.log('获取图幅列表，专题ID:', this.topicId);
				// API调用代码...
				// uni.request({
				//   url: `/api/topics/${this.topicId}/maps`,
				//   success: (res) => {
				//     this.maps = res.data.maps;
				//     if (this.mapId) {
				//       const index = this.maps.findIndex(map => map.id === this.mapId);
				//       if (index !== -1) {
				//         this.currentIndex = index;
				//       }
				//     }
				//     if (this.useWmts && this.currentMap && this.currentMap.wmtsUrl) {
				//       this.wmtsUrl = this.currentMap.wmtsUrl;
				//     }
				//   }
				// });
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
			
			// 缩放控制
			zoomIn() {
				if (this.scale < this.maxScale) {
					this.scale = Math.min(this.maxScale, this.scale + this.scaleStep);
				}
			},
			
			zoomOut() {
				if (this.scale > this.minScale) {
					this.scale = Math.max(this.minScale, this.scale - this.scaleStep);
				}
			},
			
			// 查看地图详情
			viewMapDetail() {
				uni.navigateTo({
					url: `/pages/map/detail?id=${this.currentMap.id}`
				});
			},
			
			// 处理触摸开始事件
			handleTouchStart(e) {
				const touches = e.touches;
				
				// 双指缩放
				if (touches.length === 2) {
					const touch1 = touches[0];
					const touch2 = touches[1];
					this.lastTouchDistance = Math.sqrt(
						Math.pow(touch2.pageX - touch1.pageX, 2) +
						Math.pow(touch2.pageY - touch1.pageY, 2)
					);
				} 
				// 单指平移
				else if (touches.length === 1) {
					this.lastTouchX = touches[0].pageX;
					this.lastTouchY = touches[0].pageY;
				}
			},
			
			// 处理触摸移动事件
			handleTouchMove(e) {
				const touches = e.touches;
				
				// 双指缩放
				if (touches.length === 2) {
					const touch1 = touches[0];
					const touch2 = touches[1];
					const currentDistance = Math.sqrt(
						Math.pow(touch2.pageX - touch1.pageX, 2) +
						Math.pow(touch2.pageY - touch1.pageY, 2)
					);
					
					if (this.lastTouchDistance > 0) {
						// 计算新的缩放比例
						let newScale = this.scale * (currentDistance / this.lastTouchDistance);
						
						// 限制缩放范围
						newScale = Math.max(this.minScale, Math.min(this.maxScale, newScale));
						this.scale = newScale;
					}
					
					this.lastTouchDistance = currentDistance;
				} 
				// 单指平移 - 仅在图片放大状态下允许平移
				else if (touches.length === 1 && this.scale > 1) {
					const currentX = touches[0].pageX;
					const currentY = touches[0].pageY;
					
					// 计算新的平移位置
					const deltaX = (currentX - this.lastTouchX) / this.scale;
					const deltaY = (currentY - this.lastTouchY) / this.scale;
					
					// 限制平移范围 - 根据缩放比例计算最大平移距离
					const maxTranslateX = 100 * (this.scale - 1); // 这个值可以根据实际情况调整
					const maxTranslateY = 100 * (this.scale - 1);
					
					this.translateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, this.translateX + deltaX));
					this.translateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, this.translateY + deltaY));
					
					this.lastTouchX = currentX;
					this.lastTouchY = currentY;
				}
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
				// 验证邮箱
				if (!this.userEmail.trim() || !/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(this.userEmail)) {
					uni.showToast({
						title: '请输入有效的邮箱地址',
						icon: 'none'
					});
					return;
				}
				
				// 验证理由
				if (!this.downloadReason.trim()) {
					uni.showToast({
						title: '请输入申请理由',
						icon: 'none'
					});
					return;
				}
				
				// 提交请求
				uni.showLoading({
					title: '提交中...'
				});
				
				// 模拟API调用
				// uni.request({
				//   url: '/api/maps/download-request',
				//   method: 'POST',
				//   data: {
				//     mapId: this.currentMap.id,
				//     email: this.userEmail,
				//     reason: this.downloadReason
				//   },
				//   success: () => {
				//     uni.hideLoading();
				//     uni.showToast({
				//       title: '申请已提交',
				//       icon: 'success'
				//     });
				//     this.hideDownloadForm();
				//   },
				//   fail: () => {
				//     uni.hideLoading();
				//     uni.showToast({
				//       title: '提交失败，请重试',
				//       icon: 'none'
				//     });
				//   }
				// });
				
				// 模拟API响应
				setTimeout(() => {
					uni.hideLoading();
					uni.showToast({
						title: '申请已提交',
						icon: 'success'
					});
					this.hideDownloadForm();
				}, 1500);
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
		flex: 1;
		background-color: #F8F8F8;
		overflow: hidden;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	
	.map-image {
		max-width: 100%;
		max-height: 100%;
		width: auto;
		height: auto;
		transition: transform 0.05s ease;
		transform-origin: center;
	}
	
	.wmts-view {
		width: 100%;
		height: 100%;
	}
	
	/* 控制按钮组 */
	.map-controls {
		position: absolute;
		top: 20rpx;
		right: 20rpx;
		display: flex;
		flex-direction: column;
		gap: 15rpx;
		z-index: 10;
	}
	
	.control-btn {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background-color: rgba(46, 139, 87, 0.8);
		color: #FFFFFF;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 40rpx;
	}
	
	.layer-toggle {
		font-size: 24rpx;
		width: auto;
		padding: 0 15rpx;
		border-radius: 30rpx;
	}
	
	.detail-btn {
		position: absolute;
		bottom: 30rpx;
		right: 30rpx;
		padding: 15rpx 30rpx;
		background-color: rgba(46, 139, 87, 0.9);
		color: #FFFFFF;
		border-radius: 30rpx;
		font-size: 28rpx;
		z-index: 10;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.2);
	}
	
	/* 工具栏 */
	.toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx;
		background-color: #FFFFFF;
		border-top: 1px solid #EEEEEE;
	}
	
	.tool-btn {
		width: 160rpx;
		height: 70rpx;
		line-height: 70rpx;
		font-size: 28rpx;
		border-radius: 10rpx;
		color: #2E8B57;
		border: 1px solid #2E8B57;
		background-color: #FFFFFF;
		padding: 0;
	}
	
	.tool-btn[disabled] {
		color: #CCCCCC;
		border-color: #EEEEEE;
		background-color: #F8F8F8;
	}
	
	.map-title {
		flex: 1;
		text-align: center;
		font-size: 30rpx;
		font-weight: bold;
		color: #333333;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		padding: 0 20rpx;
	}
	
	/* 下载栏 */
	.download-bar {
		padding: 20rpx 30rpx;
		background-color: #FFFFFF;
		border-top: 1px solid #EEEEEE;
		display: flex;
		justify-content: center;
	}
	
	.download-btn {
		width: 100%;
		height: 80rpx;
		line-height: 80rpx;
		font-size: 30rpx;
		color: #FFFFFF;
		border-radius: 40rpx;
		text-align: center;
	}
	
	/* 下载模态框 */
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