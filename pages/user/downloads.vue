<template>
	<view class="container">
		<!-- 标题栏 -->
		<view class="header">
			<view class="title">下载记录</view>
		</view>
		
		<!-- 筛选栏 -->
		<view class="filter-bar">
			<view 
				class="filter-item" 
				:class="{'active': activeFilter === 'all'}"
				@click="setFilter('all')"
			>全部</view>
			<view 
				class="filter-item" 
				:class="{'active': activeFilter === 'pending'}"
				@click="setFilter('pending')"
			>待处理</view>
			<view 
				class="filter-item" 
				:class="{'active': activeFilter === 'completed'}"
				@click="setFilter('completed')"
			>已完成</view>
		</view>
		
		<!-- 下载列表 -->
		<view class="download-list">
			<block v-if="filteredDownloads.length > 0">
				<view 
					class="download-item"
					v-for="(item, index) in filteredDownloads"
					:key="index"
				>
					<!-- 地图预览图 -->
					<image class="map-thumb placeholder-image" :src="item.image"></image>
					
					<!-- 下载信息 -->
					<view class="download-info">
						<view class="map-title">{{item.title}}</view>
						<view class="download-time">申请时间：{{item.applyTime}}</view>
						<view class="download-status">
							<text :class="getStatusClass(item.status)">{{getStatusText(item.status)}}</text>
						</view>
					</view>
					
					<!-- 操作按钮 -->
					<view class="action-btn" v-if="item.status === 'completed'">
						<button class="download-btn primary-bg" @click="downloadAgain(item)">重新下载</button>
					</view>
					<view class="action-btn" v-else-if="item.status === 'pending'">
						<text class="pending-text">处理中</text>
					</view>
					<view class="action-btn" v-else>
						<button class="reapply-btn" @click="reapplyDownload(item)">重新申请</button>
					</view>
				</view>
			</block>
			<view class="empty-list" v-else>
				<image class="empty-icon placeholder-image" src="/static/empty.png"></image>
				<view class="empty-text">暂无下载记录</view>
				<button class="browse-btn btn-primary" @click="navigateToHome">去浏览</button>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 筛选条件
				activeFilter: 'all',
				// 下载记录（示例数据）
				downloads: [
					{
						id: '1',
						title: '湖北省地质图',
						image: '/static/placeholder.png',
						applyTime: '2025-04-05 10:23',
						status: 'completed',
						downloadUrl: '#'
					},
					{
						id: '2',
						title: '湖北省水域图',
						image: '/static/placeholder.png',
						applyTime: '2025-04-03 16:45',
						status: 'pending',
						downloadUrl: ''
					},
					{
						id: '3',
						title: '湖北省土地利用图',
						image: '/static/placeholder.png',
						applyTime: '2025-04-01 09:12',
						status: 'rejected',
						reason: '申请理由不充分',
						downloadUrl: ''
					},
					{
						id: '4',
						title: '湖北省矿产分布图',
						image: '/static/placeholder.png',
						applyTime: '2025-03-28 14:37',
						status: 'expired',
						downloadUrl: ''
					},
					{
						id: '5',
						title: '湖北省自然保护区分布图',
						image: '/static/placeholder.png',
						applyTime: '2025-03-25 20:18',
						status: 'completed',
						downloadUrl: '#'
					}
				]
			}
		},
		computed: {
			// 根据筛选条件过滤下载记录
			filteredDownloads() {
				if (this.activeFilter === 'all') {
					return this.downloads;
				} else if (this.activeFilter === 'pending') {
					return this.downloads.filter(item => item.status === 'pending');
				} else if (this.activeFilter === 'completed') {
					return this.downloads.filter(item => item.status === 'completed');
				}
				return this.downloads;
			}
		},
		onLoad() {
			this.getDownloadHistory();
		},
		methods: {
			// 获取下载记录
			getDownloadHistory() {
				// 这里应该是从API获取数据
				console.log('获取下载记录');
				// 模拟API调用
				// uni.request({
				//   url: '/api/user/downloads',
				//   success: (res) => {
				//     this.downloads = res.data.downloads;
				//   }
				// });
			},
			
			// 设置筛选条件
			setFilter(filter) {
				this.activeFilter = filter;
			},
			
			// 获取状态显示文本
			getStatusText(status) {
				switch (status) {
					case 'completed':
						return '已完成';
					case 'pending':
						return '处理中';
					case 'rejected':
						return '已拒绝';
					case 'expired':
						return '已过期';
					default:
						return '未知状态';
				}
			},
			
			// 获取状态样式类
			getStatusClass(status) {
				switch (status) {
					case 'completed':
						return 'status-completed';
					case 'pending':
						return 'status-pending';
					case 'rejected':
						return 'status-rejected';
					case 'expired':
						return 'status-expired';
					default:
						return '';
				}
			},
			
			// 重新下载
			downloadAgain(item) {
				// 模拟下载操作
				uni.showLoading({
					title: '准备下载...'
				});
				
				// 模拟API调用
				// uni.downloadFile({
				//   url: item.downloadUrl,
				//   success: (res) => {
				//     if (res.statusCode === 200) {
				//       uni.saveFile({
				//         tempFilePath: res.tempFilePath,
				//         success: () => {
				//           uni.hideLoading();
				//           uni.showToast({
				//             title: '下载成功',
				//             icon: 'success'
				//           });
				//         }
				//       });
				//     }
				//   },
				//   fail: () => {
				//     uni.hideLoading();
				//     uni.showToast({
				//       title: '下载失败',
				//       icon: 'none'
				//     });
				//   }
				// });
				
				// 模拟成功
				setTimeout(() => {
					uni.hideLoading();
					uni.showToast({
						title: '下载成功',
						icon: 'success'
					});
				}, 1500);
			},
			
			// 重新申请下载
			reapplyDownload(item) {
				uni.navigateTo({
					url: `/pages/map/detail?id=${item.id}`
				});
			},
			
			// 导航到首页
			navigateToHome() {
				uni.switchTab({
					url: '/pages/index/index'
				});
			}
		}
	}
</script>

<style>
	.container {
		padding-bottom: 30rpx;
	}
	
	/* 标题栏 */
	.header {
		padding: 20rpx 30rpx;
		background-color: #FFFFFF;
		border-bottom: 1px solid #EEEEEE;
	}
	
	.title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333333;
	}
	
	/* 筛选栏 */
	.filter-bar {
		display: flex;
		background-color: #FFFFFF;
		padding: 20rpx 0;
		margin-bottom: 20rpx;
		border-bottom: 1px solid #EEEEEE;
	}
	
	.filter-item {
		flex: 1;
		text-align: center;
		font-size: 28rpx;
		color: #666666;
		position: relative;
	}
	
	.filter-item.active {
		color: #2E8B57;
		font-weight: bold;
	}
	
	.filter-item.active::after {
		content: '';
		position: absolute;
		bottom: -20rpx;
		left: 50%;
		transform: translateX(-50%);
		width: 40rpx;
		height: 4rpx;
		background-color: #2E8B57;
	}
	
	/* 下载列表 */
	.download-list {
		padding: 0 20rpx;
	}
	
	.download-item {
		display: flex;
		padding: 20rpx;
		background-color: #FFFFFF;
		border-radius: 10rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}
	
	.map-thumb {
		width: 120rpx;
		height: 120rpx;
		border-radius: 10rpx;
	}
	
	.download-info {
		flex: 1;
		margin-left: 20rpx;
		overflow: hidden;
	}
	
	.map-title {
		font-size: 28rpx;
		color: #333333;
		margin-bottom: 10rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	
	.download-time {
		font-size: 24rpx;
		color: #999999;
		margin-bottom: 10rpx;
	}
	
	.download-status {
		font-size: 24rpx;
	}
	
	.status-completed {
		color: #2E8B57;
	}
	
	.status-pending {
		color: #FFA500;
	}
	
	.status-rejected {
		color: #FF0000;
	}
	
	.status-expired {
		color: #999999;
	}
	
	/* 操作按钮 */
	.action-btn {
		display: flex;
		align-items: center;
		padding-left: 20rpx;
	}
	
	.download-btn, .reapply-btn {
		width: 160rpx;
		height: 60rpx;
		line-height: 60rpx;
		font-size: 24rpx;
		border-radius: 30rpx;
		text-align: center;
	}
	
	.download-btn {
		color: #FFFFFF;
	}
	
	.reapply-btn {
		color: #2E8B57;
		border: 1px solid #2E8B57;
		background-color: #FFFFFF;
	}
	
	.pending-text {
		font-size: 24rpx;
		color: #FFA500;
	}
	
	/* 空列表 */
	.empty-list {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 0;
	}
	
	.empty-icon {
		width: 200rpx;
		height: 200rpx;
		margin-bottom: 30rpx;
	}
	
	.empty-text {
		font-size: 30rpx;
		color: #999999;
		margin-bottom: 30rpx;
	}
	
	.browse-btn {
		width: 200rpx;
		height: 80rpx;
		line-height: 80rpx;
		font-size: 28rpx;
		color: #FFFFFF;
		border-radius: 10rpx;
	}
</style>