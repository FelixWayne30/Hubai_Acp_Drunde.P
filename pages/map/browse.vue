<template>
	<view class="container">
		<!-- 图幅展示区域 -->
		<view class="map-container">
			<image
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
						image: '/static/placeholder.png'
					},
					{
						id: '2',
						title: '湖北省矿产分布图',
						image: '/static/placeholder.png'
					},
					{
						id: '3',
						title: '湖北省地貌类型图',
						image: '/static/placeholder.png'
					}
				],
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
			this.getMaps();
		},
		methods: {
			// 获取当前专题的所有图幅
			getMaps() {
				// 这里应该是从API获取数据
				console.log('获取图幅列表，专题ID:', this.topicId);
				// 模拟API调用
				// uni.request({
				//   url: `/api/maps/${this.topicId}`,
				//   success: (res) => {
				//     this.maps = res.data.maps;
				//     this.topicTitle = res.data.title;
				//   }
				// });
			},
			
			// 上一张图
			prevMap() {
				if (this.currentIndex > 0) {
					this.currentIndex--;
					this.resetMapView();
				}
			},
			
			// 下一张图
			nextMap() {
				if (this.currentIndex < this.maps.length - 1) {
					this.currentIndex++;
					this.resetMapView();
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
						
						// 限制缩放范围 (1.0 到 3.0)
						newScale = Math.max(1, Math.min(3, newScale));
						this.scale = newScale;
					}
					
					this.lastTouchDistance = currentDistance;
				} 
				// 单指平移
				else if (touches.length === 1 && this.scale > 1) {
					const currentX = touches[0].pageX;
					const currentY = touches[0].pageY;
					
					// 计算新的平移位置
					this.translateX += (currentX - this.lastTouchX) / this.scale;
					this.translateY += (currentY - this.lastTouchY) / this.scale;
					
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
				if (!this.userEmail.trim()) {
					uni.showToast({
						title: '请输入邮箱地址',
						icon: 'none'
					});
					return;
				}
				
				// 验证邮箱格式
				const emailRegex = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;
				if (!emailRegex.test(this.userEmail)) {
					uni.showToast({
						title: '请输入有效的邮箱地址',
						icon: 'none'
					});
					return;
				}
				
				if (!this.downloadReason.trim()) {
					uni.showToast({
						title: '请输入申请理由',
						icon: 'none'
					});
					return;
				}
				
				// 模拟API调用
				// uni.request({
				//   url: '/api/download/request',
				//   method: 'POST',
				//   data: {
				//     map_id: this.currentMap.id,
				//     email: this.userEmail,
				//     reason: this.downloadReason
				//   },
				//   success: () => {
				//     this.hideDownloadForm();
				//     uni.showToast({
				//       title: '申请已提交',
				//       icon: 'success'
				//     });
				//   }
				// });
				
				// 模拟成功
				this.hideDownloadForm();
				uni.showToast({
					title: '申请已提交',
					icon: 'success'
				});
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
	
	/* 下载申请表单弹窗 */
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
		border-radius: 10rpx;
		padding: 30rpx;
	}
	
	.modal-title {
		font-size: 32rpx;
		font-weight: bold;
		text-align: center;
		margin-bottom: 30rpx;
	}
	
	.form-item {
		margin-bottom: 20rpx;
	}
	
	.form-label {
		font-size: 28rpx;
		margin-bottom: 10rpx;
	}
	
	.form-input {
		width: 100%;
		height: 80rpx;
		border: 1px solid #EEEEEE;
		border-radius: 5rpx;
		padding: 0 20rpx;
		font-size: 28rpx;
		margin-bottom: 20rpx;
	}
	
	.form-textarea {
		width: 100%;
		height: 200rpx;
		border: 1px solid #EEEEEE;
		border-radius: 5rpx;
		padding: 10rpx;
		font-size: 28rpx;
	}
	
	.word-count {
		text-align: right;
		font-size: 24rpx;
		color: #999999;
		margin-top: 5rpx;
	}
	
	.modal-btns {
		display: flex;
		justify-content: space-between;
		margin-top: 30rpx;
	}
	
	.modal-btn {
		width: 45%;
		height: 80rpx;
		line-height: 80rpx;
		font-size: 28rpx;
		border-radius: 10rpx;
	}
	
	.cancel-btn {
		background-color: #F8F8F8;
		color: #666666;
	}
	
	.confirm-btn {
		color: #FFFFFF;
	}
</style>