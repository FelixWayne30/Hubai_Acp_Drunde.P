<template>
	<view class="container">
		<!-- 头部操作栏 -->
		<view class="header-bar" v-if="batchMode">
			<view class="select-all" @click="toggleSelectAll">
				<text :class="{'selected': allSelected}">{{allSelected ? '取消全选' : '全选'}}</text>
			</view>
			<view class="delete-btn" @click="deleteSelected">删除</view>
		</view>
		
		<!-- 收藏列表 -->
		<view class="collection-list">
			<block v-if="collections.length > 0">
				<view 
					class="collection-item"
					v-for="(item, index) in collections"
					:key="index"
					@click="viewMap(item)"
					@longpress="enterBatchMode"
				>
					<!-- 多选勾选框 -->
					<view class="checkbox" v-if="batchMode" @click.stop="toggleSelect(index)">
						<text :class="{'selected': item.selected}">{{item.selected ? '✓' : ''}}</text>
					</view>
					
					<!-- 缩略图 -->
					<image class="thumbnail placeholder-image" :src="item.image"></image>
					
					<!-- 地图信息 -->
					<view class="map-info">
						<view class="map-title">{{item.title}}</view>
						<view class="collect-time">{{item.time}}</view>
					</view>
					
					<!-- 取消收藏按钮 -->
					<view class="uncollect-btn" @click.stop="uncollectMap(item.id, index)">
						<text class="iconfont">🗑</text>
					</view>
				</view>
			</block>
			<view class="empty-list" v-else>
				<image class="empty-icon placeholder-image" src="/static/empty.png"></image>
				<view class="empty-text">暂无收藏</view>
				<button class="browse-btn btn-primary" @click="navigateToHome">去浏览</button>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 收藏列表（示例数据）
				collections: [
					{
						id: '1',
						title: '湖北省地质图',
						image: '/static/placeholder.png',
						time: '2025-04-05 10:23',
						selected: false
					},
					{
						id: '2',
						title: '湖北省水域图',
						image: '/static/placeholder.png',
						time: '2025-04-03 16:45',
						selected: false
					},
					{
						id: '3',
						title: '湖北省土地利用图',
						image: '/static/placeholder.png',
						time: '2025-04-01 09:12',
						selected: false
					},
					{
						id: '4',
						title: '湖北省矿产分布图',
						image: '/static/placeholder.png',
						time: '2025-03-28 14:37',
						selected: false
					},
					{
						id: '5',
						title: '湖北省自然保护区分布图',
						image: '/static/placeholder.png',
						time: '2025-03-25 20:18',
						selected: false
					}
				],
				// 批量操作模式
				batchMode: false,
				allSelected: false
			}
		},
		onLoad() {
			this.getCollections();
		},
		methods: {
			// 获取收藏列表
			getCollections() {
				// 这里应该是从API获取数据
				console.log('获取收藏列表');
				// 模拟API调用
				// uni.request({
				//   url: '/api/user/collections',
				//   success: (res) => {
				//     this.collections = res.data.collections.map(item => ({
				//       ...item,
				//       selected: false
				//     }));
				//   }
				// });
			},
			
			// 查看地图详情
			viewMap(item) {
				if (this.batchMode) {
					this.toggleSelect(this.collections.findIndex(c => c.id === item.id));
					return;
				}
				
				uni.navigateTo({
					url: `/pages/map/detail?id=${item.id}`
				});
			},
			
			// 取消收藏
			uncollectMap(id, index) {
				uni.showModal({
					title: '提示',
					content: '确认取消收藏该地图？',
					success: (res) => {
						if (res.confirm) {
							// 模拟API调用
							// uni.request({
							//   url: `/api/maps/${id}/collect`,
							//   method: 'POST',
							//   data: {
							//     collected: false
							//   },
							//   success: () => {
							//     this.collections.splice(index, 1);
							//   }
							// });
							
							// 模拟成功
							this.collections.splice(index, 1);
							
							uni.showToast({
								title: '已取消收藏',
								icon: 'success'
							});
						}
					}
				});
			},
			
			// 进入批量操作模式
			enterBatchMode() {
				this.batchMode = true;
				this.allSelected = false;
				this.collections.forEach(item => {
					item.selected = false;
				});
			},
			
			// 切换选择状态
			toggleSelect(index) {
				this.collections[index].selected = !this.collections[index].selected;
				
				// 更新全选状态
				this.updateAllSelectedState();
			},
			
			// 更新全选状态
			updateAllSelectedState() {
				this.allSelected = this.collections.every(item => item.selected);
			},
			
			// 切换全选
			toggleSelectAll() {
				this.allSelected = !this.allSelected;
				
				this.collections.forEach(item => {
					item.selected = this.allSelected;
				});
			},
			
			// 删除选中项
			deleteSelected() {
				const selectedIds = this.collections
					.filter(item => item.selected)
					.map(item => item.id);
				
				if (selectedIds.length === 0) {
					uni.showToast({
						title: '请选择要删除的项',
						icon: 'none'
					});
					return;
				}
				
				uni.showModal({
					title: '提示',
					content: `确认删除${selectedIds.length}项收藏？`,
					success: (res) => {
						if (res.confirm) {
							// 模拟API调用
							// uni.request({
							//   url: '/api/user/collections/batch-delete',
							//   method: 'POST',
							//   data: {
							//     ids: selectedIds
							//   },
							//   success: () => {
							//     this.collections = this.collections.filter(item => !item.selected);
							//     this.batchMode = false;
							//   }
							// });
							
							// 模拟成功
							this.collections = this.collections.filter(item => !item.selected);
							this.batchMode = false;
							
							uni.showToast({
								title: '删除成功',
								icon: 'success'
							});
						}
					}
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
	
	/* 头部操作栏 */
	.header-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 30rpx;
		background-color: #FFFFFF;
		border-bottom: 1px solid #EEEEEE;
		position: sticky;
		top: 0;
		z-index: 10;
	}
	
	.select-all {
		font-size: 28rpx;
		color: #666666;
	}
	
	.delete-btn {
		font-size: 28rpx;
		color: #FF0000;
	}
	
	/* 收藏列表 */
	.collection-list {
		padding: 20rpx;
	}
	
	.collection-item {
		display: flex;
		align-items: center;
		padding: 20rpx;
		background-color: #FFFFFF;
		border-radius: 10rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}
	
	.checkbox {
		width: 40rpx;
		height: 40rpx;
		border-radius: 50%;
		border: 1px solid #CCCCCC;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20rpx;
		color: #FFFFFF;
	}
	
	.checkbox .selected {
		background-color: #2E8B57;
		border-color: #2E8B57;
	}
	
	.thumbnail {
		width: 120rpx;
		height: 120rpx;
		border-radius: 10rpx;
	}
	
	.map-info {
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
	
	.collect-time {
		font-size: 24rpx;
		color: #999999;
	}
	
	.uncollect-btn {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.iconfont {
		font-size: 40rpx;
		color: #FF0000;
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