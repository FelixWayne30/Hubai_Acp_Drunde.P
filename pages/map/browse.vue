<template>
	<view class="container">
		<!-- 图幅展示区域 -->
		<view class="map-container">
			<!-- 使用原生地图组件 -->
			<map 
				id="mapView"
				class="map-view"
				:latitude="centerLatitude"
				:longitude="centerLongitude"
				:scale="mapScale"
				:markers="markers"
				:polyline="polyline"
				:polygons="polygons"
				:show-location="true"
				:enable-zoom="true"
				:enable-scroll="true"
				@regionchange="onRegionChange"
				@updated="onMapUpdated"
			>
				<!-- 叠加一个图层，显示GeoServer生成的地图图片 -->
				<cover-image 
					v-if="coverImageUrl" 
					class="map-overlay" 
					:src="coverImageUrl"
				></cover-image>
				
				<!-- 重置按钮 -->
				<cover-view class="control-btn reset-btn" @tap="resetMapView">
					<cover-view class="reset-icon">↺</cover-view>
				</cover-view>
				
				<!-- 查看详情按钮 -->
				<cover-view class="detail-btn" @tap="viewMapDetail">
					<cover-view class="detail-text">查看详情</cover-view>
				</cover-view>
			</map>
		</view>
		
		<!-- 工具栏 -->
		<view class="toolbar">
			<button 
				class="tool-btn" 
				:disabled="currentIndex <= 0"
				@tap="prevMap"
			>上一张</button>
			
			<view class="map-title">
				{{currentMap.title || '地图图幅'}}
			</view>
			
			<button 
				class="tool-btn" 
				:disabled="currentIndex >= maps.length - 1"
				@tap="nextMap"
			>下一张</button>
		</view>
		
		<!-- 下载工具栏 -->
		<view class="download-bar">
			<button 
				class="download-btn primary-bg"
				@tap="showDownloadForm"
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
					<button class="modal-btn cancel-btn" @tap="hideDownloadForm">取消</button>
					<button class="modal-btn confirm-btn primary-bg" @tap="submitDownloadRequest">提交</button>
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
				currentIndex: 0,
				// 地图控制参数
				centerLatitude: 30.5928, // 湖北省中心点纬度（大约）
				centerLongitude: 114.3055, // 湖北省中心点经度（大约）
				mapScale: 5, // 地图缩放级别，值越大越详细
				initialScale: 5, // 保存初始缩放级别
				// 地图元素
				markers: [],
				polyline: [],
				polygons: [],
				// 图幅数据（示例数据）
				maps: [
					{
						id: '1',
						title: '湖北省地质图',
						layerName: 'hubei:1-1春夏秋冬0331',
						// 定义每个地图的边界范围，实际应从GeoServer获取
						bounds: {
							north: 33.2698, // 北纬
							south: 29.0500, // 南纬
							east: 116.1221, // 东经
							west: 108.3838 // 西经
						}
					},
					{
						id: '2',
						title: '湖北省矿产分布图',
						layerName: 'hubei:矿产分布图',
						bounds: {
							north: 33.2698,
							south: 29.0500,
							east: 116.1221,
							west: 108.3838
						}
					},
					{
						id: '3',
						title: '湖北省地貌类型图',
						layerName: 'hubei:地貌类型图',
						bounds: {
							north: 33.2698,
							south: 29.0500,
							east: 116.1221,
							west: 108.3838
						}
					}
				],
				// GeoServer配置
				geoserverUrl: 'http://192.168.50.133:8080/geoserver/hubei/wms',
				// 覆盖图片URL
				coverImageUrl: '',
				// 地图状态
				isMapLoaded: false,
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
			this.mapId = options.id || '';
			
			// 如果指定了特定mapId，则定位到该图幅
			if (this.mapId) {
				const index = this.maps.findIndex(map => map.id === this.mapId);
				if (index !== -1) {
					this.currentIndex = index;
					// 设置地图初始中心点和边界范围
					this.setMapBounds();
				}
			}
			
			this.getMaps();
			this.updateCoverImage();
		},
		onReady() {
			// 地图组件准备就绪后的处理
			this.isMapLoaded = true;
			// 创建地图上下文
			this.mapContext = uni.createMapContext('mapView', this);
			// 设置初始边界
			this.setMapBounds();
		},
		methods: {
			// 获取当前专题的所有图幅
			getMaps() {
				console.log('获取图幅列表，专题ID:', this.topicId);
				// API调用代码...
				// 这里添加实际API调用逻辑
			},
			
			// 根据当前选中的地图设置地图视图范围
			setMapBounds() {
				if (!this.currentMap || !this.currentMap.bounds) return;
				
				const bounds = this.currentMap.bounds;
				// 计算中心点
				this.centerLatitude = (bounds.north + bounds.south) / 2;
				this.centerLongitude = (bounds.east + bounds.west) / 2;
				
				// 根据边界计算合适的缩放级别
				// 这是一个简单的算法，实际可能需要调整
				const latDiff = bounds.north - bounds.south;
				const lngDiff = bounds.east - bounds.west;
				const maxDiff = Math.max(latDiff, lngDiff);
				
				// 缩放级别反比于边界大小
				this.mapScale = Math.max(5, Math.min(18, Math.round(14 - Math.log2(maxDiff * 10))));
				this.initialScale = this.mapScale;
				
				// 如果地图已加载，调用地图方法进行缩放
				if (this.isMapLoaded && this.mapContext) {
					this.mapContext.includePoints({
						points: [
							{ latitude: bounds.north, longitude: bounds.west },
							{ latitude: bounds.north, longitude: bounds.east },
							{ latitude: bounds.south, longitude: bounds.west },
							{ latitude: bounds.south, longitude: bounds.east }
						],
						padding: [50, 50, 50, 50]
					});
				}
			},
			
			// 更新覆盖图片URL
			updateCoverImage() {
				if (!this.currentMap || !this.currentMap.layerName) {
					this.coverImageUrl = '';
					return;
				}
				
				// 构建WMS请求URL，获取当前图层的图像
				// 注意：由于不能动态调整覆盖图片大小，这种方式可能会有显示问题
				// 实际应用中可能需要更复杂的方案
				const width = 1000; // 足够大的宽度以保持清晰度
				const height = 800; // 足够大的高度以保持清晰度
				
				if (this.currentMap && this.currentMap.bounds) {
					const bounds = this.currentMap.bounds;
					const bbox = `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`;
					
					this.coverImageUrl = `${this.geoserverUrl}?service=WMS&version=1.1.0&request=GetMap&layers=${this.currentMap.layerName}&bbox=${bbox}&width=${width}&height=${height}&srs=EPSG:4326&styles=&format=image/png&transparent=false`;
				}
			},
			
			// 地图区域变化事件
			onRegionChange(e) {
				console.log('地图区域变化:', e);
			},
			
			// 地图更新事件
			onMapUpdated(e) {
				console.log('地图已更新:', e);
			},
			
			// 重置地图视图
			resetMapView() {
				if (!this.mapContext) return;
				
				// 重置到初始状态
				this.setMapBounds();
			},
			
			// 上一张图
			prevMap() {
				if (this.currentIndex > 0) {
					this.currentIndex--;
					this.setMapBounds();
					this.updateCoverImage();
				}
			},
			
			// 下一张图
			nextMap() {
				if (this.currentIndex < this.maps.length - 1) {
					this.currentIndex++;
					this.setMapBounds();
					this.updateCoverImage();
				}
			},
			
			// 查看地图详情
			viewMapDetail() {
				uni.navigateTo({
					url: `/pages/map/detail?id=${this.currentMap.id}`
				});
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
	}
	
	.map-view {
		width: 100%;
		height: 100%;
	}
	
	/* 地图覆盖层图像 */
	.map-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		opacity: 0.7; /* 设置透明度便于看到底图 */
		pointer-events: none; /* 确保覆盖层不阻挡交互 */
	}
	
	/* 控制按钮 */
	.control-btn {
		position: absolute;
		top: 20rpx;
		right: 20rpx;
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background-color: rgba(46, 139, 87, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10;
	}
	
	.reset-icon {
		color: white;
		font-size: 40rpx;
		text-align: center;
		line-height: 80rpx;
	}
	
	.detail-btn {
		position: absolute;
		bottom: 30rpx;
		right: 30rpx;
		padding: 15rpx 30rpx;
		background-color: rgba(46, 139, 87, 0.9);
		border-radius: 30rpx;
		z-index: 10;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.2);
	}
	
	.detail-text {
		color: white;
		font-size: 28rpx;
		text-align: center;
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