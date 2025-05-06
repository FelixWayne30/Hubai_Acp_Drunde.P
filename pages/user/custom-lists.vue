<template>
	<view class="container">
		<!-- 头部 -->
		<view class="header">
			<view class="title">我的自定义列表</view>
			<view class="add-btn" @click="showCreateForm">
				<text class="add-icon">+</text>
				<text>新建列表</text>
			</view>
		</view>
		
		<!-- 列表区域 -->
		<view class="list-container">
			<block v-if="customLists.length > 0">
				<view 
					class="list-item"
					v-for="(item, index) in customLists"
					:key="index"
					@click="viewListDetail(item)"
				>
					<view class="list-icon">
						<text class="iconfont">📁</text>
					</view>
					<view class="list-info">
						<view class="list-name">{{item.name}}</view>
						<view class="list-count">{{item.count}}个图幅</view>
					</view>
					<view class="list-actions">
						<text class="action-icon" @click.stop="showEditForm(item)">✎</text>
						<text class="action-icon delete" @click.stop="confirmDelete(item)">🗑</text>
					</view>
				</view>
			</block>
			<view class="empty-tip" v-else>
				<image class="empty-icon placeholder-image" src="/static/empty.png"></image>
				<view class="empty-text">暂无自定义列表</view>
				<view class="tip-text">创建列表可以更好地整理您收藏的图幅</view>
			</view>
		</view>
		
		<!-- 创建/编辑表单弹窗 -->
		<view class="form-modal" v-if="showModal">
			<view class="modal-content">
				<view class="modal-title">{{isEditing ? '编辑列表' : '创建新列表'}}</view>
				<view class="form-item">
					<view class="form-label">列表名称</view>
					<input 
						class="form-input"
						v-model="formData.name"
						placeholder="请输入列表名称"
						maxlength="20"
					/>
				</view>
				<view class="form-item">
					<view class="form-label">列表描述</view>
					<textarea 
						class="form-textarea"
						v-model="formData.description"
						placeholder="请输入列表描述（选填）"
						maxlength="100"
					></textarea>
				</view>
				<view class="modal-btns">
					<button class="modal-btn cancel-btn" @click="hideModal">取消</button>
					<button class="modal-btn confirm-btn primary-bg" @click="saveList">确定</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 自定义列表
				customLists: [
					{
						id: '1',
						name: '长江流域图集',
						description: '长江流域相关地图资源整理',
						count: 5
					},
					{
						id: '2',
						name: '矿产资源专题',
						description: '湖北省矿产资源相关图幅整理',
						count: 3
					},
					{
						id: '3',
						name: '教学资料',
						description: '地理教学用图',
						count: 8
					}
				],
				// 表单相关
				showModal: false,
				isEditing: false,
				currentListId: '',
				formData: {
					name: '',
					description: ''
				}
			}
		},
		onLoad() {
			this.getCustomLists();
		},
		methods: {
			// 获取自定义列表
			getCustomLists() {
				// API调用代码...
			},
			
			// 查看列表详情
			viewListDetail(item) {
			    uni.navigateTo({
			        url: '/pages/user/list-detail?id=' + item.id + '&name=' + encodeURIComponent(item.name)
			    });
			},
			
			// 显示创建表单
			showCreateForm() {
				this.isEditing = false;
				this.formData = {
					name: '',
					description: ''
				};
				this.showModal = true;
			},
			
			// 显示编辑表单
			showEditForm(item) {
				this.isEditing = true;
				this.currentListId = item.id;
				this.formData = {
					name: item.name,
					description: item.description || ''
				};
				this.showModal = true;
			},
			
			// 隐藏表单
			hideModal() {
				this.showModal = false;
			},
			
			// 保存列表
			saveList() {
				// 验证表单
				if (!this.formData.name.trim()) {
					uni.showToast({
						title: '请输入列表名称',
						icon: 'none'
					});
					return;
				}
				
				// 保存逻辑
				if (this.isEditing) {
					// 编辑现有列表
					const index = this.customLists.findIndex(item => item.id === this.currentListId);
					if (index !== -1) {
						this.customLists[index].name = this.formData.name;
						this.customLists[index].description = this.formData.description;
					}
				} else {
					// 创建新列表
					this.customLists.push({
						id: Date.now().toString(), // 临时ID
						name: this.formData.name,
						description: this.formData.description,
						count: 0
					});
				}
				
				this.hideModal();
				uni.showToast({
					title: this.isEditing ? '编辑成功' : '创建成功',
					icon: 'success'
				});
			},
			
			// 确认删除
			confirmDelete(item) {
				uni.showModal({
					title: '确认删除',
					content: `确定要删除"${item.name}"列表吗？`,
					success: (res) => {
						if (res.confirm) {
							this.deleteList(item.id);
						}
					}
				});
			},
			
			// 删除列表
			deleteList(id) {
				const index = this.customLists.findIndex(item => item.id === id);
				if (index !== -1) {
					this.customLists.splice(index, 1);
					uni.showToast({
						title: '删除成功',
						icon: 'success'
					});
				}
			}
		}
	}
</script>

<style>
	.container {
		padding: 30rpx;
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
	
	.add-btn {
		display: flex;
		align-items: center;
		padding: 10rpx 20rpx;
		background-color: #2E8B57;
		color: #FFFFFF;
		border-radius: 30rpx;
		font-size: 28rpx;
	}
	
	.add-icon {
		margin-right: 10rpx;
		font-size: 32rpx;
	}
	
	/* 列表容器 */
	.list-container {
		background-color: #FFFFFF;
		border-radius: 15rpx;
		padding: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}
	
	.list-item {
		display: flex;
		align-items: center;
		padding: 30rpx 20rpx;
		border-bottom: 1px solid #EEEEEE;
	}
	
	.list-item:last-child {
		border-bottom: none;
	}
	
	.list-icon {
		width: 80rpx;
		height: 80rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 48rpx;
		color: #2E8B57;
	}
	
	.list-info {
		flex: 1;
		margin-left: 20rpx;
	}
	
	.list-name {
		font-size: 32rpx;
		color: #333333;
		margin-bottom: 10rpx;
	}
	
	.list-count {
		font-size: 26rpx;
		color: #999999;
	}
	
	.list-actions {
		display: flex;
		align-items: center;
	}
	
	.action-icon {
		margin-left: 30rpx;
		font-size: 36rpx;
		color: #666666;
	}
	
	.action-icon.delete {
		color: #FF6B6B;
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
		margin-bottom: 15rpx;
	}
	
	.tip-text {
		font-size: 28rpx;
		color: #999999;
	}
	
	/* 表单弹窗 */
	.form-modal {
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