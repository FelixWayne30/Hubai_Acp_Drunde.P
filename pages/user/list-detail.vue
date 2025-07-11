<template>
	<view class="container">
		<!-- Background using user-download.png -->
		<view class="background">
		  <image class="background-image" src="/static/background/user-download.png" mode="aspectFill"></image>
		</view>
		<!-- 头部信息 -->
		<view class="header">
			<view class="title">{{listName}}</view>
			<view class="action-bar">
				<view class="edit-mode-btn" @click="toggleEditMode">
					{{isEditMode ? '完成' : '编辑'}}
				</view>
			</view>
		</view>
		
		<!-- 批量操作栏 -->
		<view class="batch-bar" v-if="isEditMode">
			<view class="select-all" @click="toggleSelectAll">
				<text :class="{'selected': allSelected}">{{allSelected ? '取消全选' : '全选'}}</text>
			</view>
			<view class="batch-actions">
				<button class="batch-btn" @click="batchDownload" :disabled="!hasSelected">批量下载</button>
				<button class="batch-btn delete-btn" @click="batchDelete" :disabled="!hasSelected">删除</button>
			</view>
		</view>
		
		<!-- 图幅列表 -->
		<view class="map-list">
			<block v-if="mapItems.length > 0">
				<view 
					class="map-item"
					v-for="(item, index) in mapItems"
					:key="index"
					@click="viewMapDetail(item)"
				>
					<!-- 选择框 -->
					<view class="select-box" v-if="isEditMode" @click.stop="toggleSelect(index)">
						<view class="checkbox" :class="{'checked': item.selected}"></view>
					</view>
					
					<!-- 图幅缩略图 -->
					<image class="map-thumb placeholder-image" :src="item.image"></image>
					
					<!-- 图幅信息 -->
					<view class="map-info">
						<view class="map-title">{{item.title}}</view>
						<view class="map-category">{{item.category}}</view>
					</view>
				</view>
			</block>
			<view class="empty-tip" v-else>
				<image class="empty-icon placeholder-image" src="/static/empty.png"></image>
				<view class="empty-text">暂无图幅</view>
				<button class="browse-btn primary-bg" @click="navigateToHome">去浏览</button>
			</view>
		</view>
		
		<!-- 批量下载弹窗 -->
		<view class="download-modal" v-if="showDownloadModal">
			<view class="modal-content">
				<view class="modal-title">批量下载申请</view>
				<view class="form-item">
					<view class="form-label">已选择 {{selectedCount}} 个图幅</view>
				</view>
				<view class="form-item">
					<view class="form-label">邮箱地址</view>
					<input 
						class="form-input"
						v-model="downloadEmail"
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
					<button class="modal-btn cancel-btn" @click="hideDownloadModal">取消</button>
					<button class="modal-btn confirm-btn primary-bg" @click="submitBatchDownload">提交</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { API } from '@/common/config.js';
import authManager from '@/common/auth.js';
import imageCache from '@/common/cache.js';

export default {
	data() {
		return {
			listId: '',
			listName: '',
			// 编辑模式
			isEditMode: false,
			allSelected: false,
			// 图幅列表
			mapItems: [],
			// 批量下载
			showDownloadModal: false,
			downloadEmail: '',
			downloadReason: '',
			// 用户信息
			userId: '',
			isLoading: false
		}
	},
	computed: {
		// 是否有选中项
		hasSelected() {
			return this.mapItems.some(item => item.selected);
		},
		// 选中数量
		selectedCount() {
			return this.mapItems.filter(item => item.selected).length;
		}
	},
	onLoad(options) {
		this.listId = options.id || '';
		this.listName = decodeURIComponent(options.name || '自定义列表');
		
		// 获取用户ID
		const userInfo = authManager.getUserInfo();
		if (userInfo) {
			this.userId = userInfo.user_id;
			// 获取列表详情
			this.getListDetail();
		} else {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			});
			setTimeout(() => {
				uni.switchTab({
					url: '/pages/user/center'
				});
			}, 1500);
		}
	},
	methods: {
		// 获取列表详情
		getListDetail() {
			if (!this.listId || !this.userId) return;
			
			this.isLoading = true;
			uni.showLoading({
				title: '加载中...'
			});
			
			uni.request({
				url: API.CUSTOM_LIST_DETAIL + this.listId,
				method: 'GET',
				success: (res) => {
					if (res.statusCode === 200 && res.data.code === 200) {
						const listData = res.data.data;
						if (listData) {
							// 更新列表名称
							this.listName = listData.name;
							
							// 处理地图数据
							const maps = listData.maps || [];
							this.mapItems = maps.map(item => {
								// 生成缩略图URL
								let imageUrl = imageCache.getImage(item.title);
								if (!imageUrl) {
								    imageUrl = API.THUMBNAIL_MAP + item.title +".jpg";
								    imageCache.setImage(item.title, imageUrl, item);
								}
								
								return {
									 id: item.map_id,
									    title: item.title,
									    category: item.type || '未分类',
									    image: imageUrl || '/static/placeholder.png',
									    selected: false
								};
							});
						}
					} else {
						uni.showToast({
							title: '获取列表详情失败',
							icon: 'none'
						});
					}
				},
				fail: (err) => {
					console.error('请求失败', err);
					uni.showToast({
						title: '网络错误，请稍后重试',
						icon: 'none'
					});
				},
				complete: () => {
					this.isLoading = false;
					uni.hideLoading();
				}
			});
		},
		
		// 切换编辑模式
		toggleEditMode() {
			this.isEditMode = !this.isEditMode;
			if (!this.isEditMode) {
				// 退出编辑模式时重置选择状态
				this.allSelected = false;
				this.mapItems.forEach(item => {
					item.selected = false;
				});
			}
		},
		
		// 切换全选
		toggleSelectAll() {
			this.allSelected = !this.allSelected;
			this.mapItems.forEach(item => {
				item.selected = this.allSelected;
			});
		},
		
		// 切换选择
		toggleSelect(index) {
			this.mapItems[index].selected = !this.mapItems[index].selected;
			// 更新全选状态
			this.updateAllSelectedState();
		},
		
		// 更新全选状态
		updateAllSelectedState() {
			this.allSelected = this.mapItems.length > 0 && this.mapItems.every(item => item.selected);
		},
		
		// 批量下载
		batchDownload() {
			if (!this.hasSelected) {
				uni.showToast({
					title: '请先选择图幅',
					icon: 'none'
				});
				return;
			}
			
			this.downloadEmail = '';
			this.downloadReason = '';
			this.showDownloadModal = true;
		},
		
		// 隐藏下载弹窗
		hideDownloadModal() {
			this.showDownloadModal = false;
		},
		
		// 提交批量下载申请
		submitBatchDownload() {
			// 表单验证
			if (!this.downloadEmail.trim()) {
				uni.showToast({
					title: '请输入邮箱地址',
					icon: 'none'
				});
				return;
			}
			
			// 验证邮箱格式
			const emailRegex = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;
			if (!emailRegex.test(this.downloadEmail)) {
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
			
			// 获取选中的图幅ID
			const selectedIds = this.mapItems
				.filter(item => item.selected)
				.map(item => item.id);
			
			// 模拟API调用
			// 这里应该是调用后端的批量下载申请API
			uni.showLoading({
				title: '提交中...'
			});
			
			setTimeout(() => {
				uni.hideLoading();
				uni.showToast({
					title: '申请已提交',
					icon: 'success'
				});
				this.hideDownloadModal();
				this.toggleEditMode(); // 退出编辑模式
			}, 1500);
		},
		
		// 批量删除
		batchDelete() {
			if (!this.hasSelected) {
				uni.showToast({
					title: '请先选择图幅',
					icon: 'none'
				});
				return;
			}
			
			uni.showModal({
				title: '确认删除',
				content: `确定从该列表中移除已选择的${this.selectedCount}个图幅吗？`,
				success: (res) => {
					if (res.confirm) {
						// 获取选中的地图ID
						const selectedIds = this.mapItems
							.filter(item => item.selected)
							.map(item => item.id);
						
						uni.showLoading({
							title: '删除中...'
						});
						
						// 调用批量删除API
						uni.request({
							url: API.CUSTOM_LIST_REMOVE_MAPS,
							method: 'POST',
							data: {
								listId: this.listId,
								mapIds: selectedIds,
								userId: this.userId
							},
							header: {
								'content-type': 'application/x-www-form-urlencoded'
							},
							success: (res) => {
								if (res.statusCode === 200 && res.data.code === 200) {
									// 删除成功，更新列表
									this.mapItems = this.mapItems.filter(item => !item.selected);
									uni.showToast({
										title: '删除成功',
										icon: 'success'
									});
									this.toggleEditMode(); // 退出编辑模式
								} else {
									uni.showToast({
										title: res.data.msg || '删除失败',
										icon: 'none'
									});
								}
							},
							fail: (err) => {
								console.error('请求失败', err);
								uni.showToast({
									title: '网络错误，请稍后重试',
									icon: 'none'
								});
							},
							complete: () => {
								uni.hideLoading();
							}
						});
					}
				}
			});
		},
		
		// 查看图幅详情
		viewMapDetail(item) {
			if (this.isEditMode) {
				this.toggleSelect(this.mapItems.findIndex(i => i.id === item.id));
				return;
			}
			
			uni.navigateTo({
				url: '/pages/map/detail?id=' + item.id
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
		padding: 30rpx;
	}
	.background {
	  position: fixed;
	  top: 0;
	  left: 0;
	  width: 100%;
	  height: 100%;
	  z-index: -1;
	}
	
	.background-image {
	  width: 100%;
	  height: 100%;
	  object-fit: cover; /* For web compatibility */
	}
	
	.content {
	  position: relative;
	  z-index: 1;
	}
	
	/* 头部 */
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;
	}
	
	.title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333333;
	}
	
	.edit-mode-btn {
		padding: 10rpx 30rpx;
		color: #7aa26f;
		font-size: 30rpx;
	}
	
	/* 批量操作栏 */
	.batch-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 0;
		margin-bottom: 20rpx;
		border-bottom: 1px solid #666666;
	}
	
	.select-all {
		font-size: 30rpx;
		color: #666666;
	}
	
	.select-all .selected {
		color: #7aa26f;
	}
	
	.batch-actions {
		display: flex;
	}
	
	.batch-btn {
		margin-left: 20rpx;
		padding: 10rpx 25rpx;
		font-size: 28rpx;
		color: #7aa26f;
		background-color: #FFFFFF;
		border: 1px solid #7aa26f;
		border-radius: 30rpx;
	}
	
	.batch-btn.delete-btn {
		color: #FF6B6B;
		border-color: #FF6B6B;
	}
	
	.batch-btn[disabled] {
		color: #CCCCCC;
		border-color: #EEEEEE;
		background-color: #F8F8F8;
	}
	
	/* 图幅列表 */
	.map-list {
		background-color: #FFFFFF;
		border-radius: 15rpx;
		padding: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}
	
	.map-item {
		display: flex;
		align-items: center;
		padding: 20rpx;
		border-bottom: 1px solid #EEEEEE;
	}
	
	.map-item:last-child {
		border-bottom: none;
	}
	
	.select-box {
		margin-right: 20rpx;
	}
	
	.checkbox {
		width: 40rpx;
		height: 40rpx;
		border: 2rpx solid #CCCCCC;
		border-radius: 50%;
		position: relative;
	}
	
	.checkbox.checked {
		background-color: #7aa26f;
		border-color: #7aa26f;
	}
	
	.checkbox.checked::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -60%) rotate(-45deg);
		width: 20rpx;
		height: 10rpx;
		border-left: 4rpx solid #FFFFFF;
		border-bottom: 4rpx solid #FFFFFF;
	}
	
	.map-thumb {
		width: 150rpx;
		height: 150rpx;
		border-radius: 10rpx;
	}
	
	.map-info {
		flex: 1;
		margin-left: 20rpx;
	}
	
	.map-title {
		font-size: 32rpx;
		color: #333333;
		margin-bottom: 10rpx;
	}
	
	.map-category {
		font-size: 28rpx;
		color: #999999;
	}
	
	/* 空提示 */
	.empty-tip {
		padding: 60rpx 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	
	.empty-icon {
		width: 200rpx;
		height: 200rpx;
		margin-bottom: 30rpx;
	}
	
	.empty-text {
		font-size: 32rpx;
		color: #666666;
		margin-bottom: 30rpx;
	}
	
	.browse-btn {
		width: 200rpx;
		height: 80rpx;
		line-height: 80rpx;
		font-size: 30rpx;
		color: #FFFFFF;
		background-color: #7aa26f; /* Updated to #7aa26f */
		border-radius: 10rpx;
	}
	
	/* 下载弹窗 */
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