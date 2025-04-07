<template>
	<view class="container">
		<!-- 用户信息区域 -->
		<view class="user-info-section">
			<view class="avatar-container" @click="uploadAvatar">
				<image
					class="avatar placeholder-image"
					:src="userInfo.avatar || '/static/avatar-placeholder.png'"
				></image>
				<view class="edit-icon">+</view>
			</view>
			<view class="user-name">
				{{userInfo.nickName || '点击登录'}}
				<text class="edit-name" @click="editNickname">✎</text>
			</view>
		</view>
		
		<!-- 功能列表 -->
		<view class="function-list">
			<view class="function-card" @click="navigateToCollection">
				<view class="function-title">我的收藏</view>
				<view class="function-arrow">></view>
			</view>
			
			<view class="function-card" @click="navigateToDownloads">
				<view class="function-title">下载记录</view>
				<view class="function-arrow">></view>
			</view>
			
			<view class="function-card" @click="navigateToFeedback">
				<view class="function-title">意见反馈</view>
				<view class="function-arrow">></view>
			</view>
			
			<view class="function-card" @click="showAbout">
				<view class="function-title">关于我们</view>
				<view class="function-arrow">></view>
			</view>
		</view>
		
		<!-- 编辑昵称弹窗 -->
		<view class="edit-modal" v-if="showEditModal">
			<view class="modal-content">
				<view class="modal-title">修改昵称</view>
				<input 
					class="nickname-input"
					v-model="newNickname"
					placeholder="请输入新昵称"
					maxlength="20"
				/>
				<view class="modal-btns">
					<button class="modal-btn cancel-btn" @click="cancelEdit">取消</button>
					<button class="modal-btn confirm-btn primary-bg" @click="saveNickname">保存</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 用户信息（示例数据）
				userInfo: {
					nickName: '地图爱好者',
					avatar: ''
				},
				// 编辑昵称
				showEditModal: false,
				newNickname: ''
			}
		},
		onLoad() {
			this.getUserInfo();
		},
		methods: {
			// 获取用户信息
			getUserInfo() {
				// 检查是否已登录
				const userInfo = uni.getStorageSync('userInfo');
				if (userInfo) {
					this.userInfo = JSON.parse(userInfo);
				} else {
					// 未登录，显示默认状态
					this.userInfo = {
						nickName: '点击登录',
						avatar: ''
					};
				}
			},
			
			// 上传头像
			uploadAvatar() {
				// 检查是否已登录
				if (!this.checkLogin()) return;
				
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						const tempFilePath = res.tempFilePaths[0];
						
						// 模拟上传头像
						// uni.uploadFile({
						//   url: '/api/user/avatar',
						//   filePath: tempFilePath,
						//   name: 'avatar',
						//   success: (uploadRes) => {
						//     const data = JSON.parse(uploadRes.data);
						//     this.userInfo.avatar = data.avatar;
						//     // 更新本地存储
						//     uni.setStorageSync('userInfo', JSON.stringify(this.userInfo));
						//   }
						// });
						
						// 模拟成功
						this.userInfo.avatar = tempFilePath;
						// 更新本地存储
						uni.setStorageSync('userInfo', JSON.stringify(this.userInfo));
					}
				});
			},
			
			// 编辑昵称
			editNickname() {
				// 检查是否已登录
				if (!this.checkLogin()) return;
				
				this.newNickname = this.userInfo.nickName;
				this.showEditModal = true;
			},
			
			// 取消编辑
			cancelEdit() {
				this.showEditModal = false;
				this.newNickname = '';
			},
			
			// 保存昵称
			saveNickname() {
				if (!this.newNickname.trim()) {
					uni.showToast({
						title: '昵称不能为空',
						icon: 'none'
					});
					return;
				}
				
				// 模拟API调用
				// uni.request({
				//   url: '/api/user/nickname',
				//   method: 'POST',
				//   data: {
				//     nickname: this.newNickname
				//   },
				//   success: () => {
				//     this.userInfo.nickName = this.newNickname;
				//     // 更新本地存储
				//     uni.setStorageSync('userInfo', JSON.stringify(this.userInfo));
				//     this.showEditModal = false;
				//   }
				// });
				
				// 模拟成功
				this.userInfo.nickName = this.newNickname;
				// 更新本地存储
				uni.setStorageSync('userInfo', JSON.stringify(this.userInfo));
				this.showEditModal = false;
				
				uni.showToast({
					title: '修改成功',
					icon: 'success'
				});
			},
			
			// 检查是否已登录
			checkLogin() {
				if (this.userInfo.nickName === '点击登录') {
					// 不跳转到登录页面，而是显示提示
					uni.showModal({
						title: '提示',
						content: '请先登录',
						showCancel: false
					});
					
					// 临时设置模拟登录信息(仅用于演示)
					this.userInfo = {
						nickName: '地图爱好者',
						avatar: ''
					};
					// 更新本地存储
					uni.setStorageSync('userInfo', JSON.stringify(this.userInfo));
					
					return true; // 临时返回true以允许继续操作
				}
				return true;
			},
			
			// 导航到收藏页面
			navigateToCollection() {
				if (!this.checkLogin()) return;
				
				console.log('正在导航到收藏页面');
				// 确保路径正确，并且使用通用的导航API
				setTimeout(() => {
					uni.navigateTo({
						url: '/pages/user/collection',
						fail: (err) => {
							console.error('导航失败:', err);
							// 尝试备用导航方法
							wx.navigateTo({
								url: '/pages/user/collection'
							});
						}
					});
				}, 100); // 添加延迟以确保UI已更新
			},
			
			// 导航到下载记录
			navigateToDownloads() {
				if (!this.checkLogin()) return;
				
				uni.navigateTo({
					url: '/pages/user/downloads'
				});
			},
			
			// 导航到反馈页面
			navigateToFeedback() {
				uni.navigateTo({
					url: '/pages/user/feedback'
				});
			},
			
			// 显示关于我们
			showAbout() {
				uni.showModal({
					title: '关于我们',
					content: '《湖北省自然资源地图集》小程序由湖北省自然资源厅与远图实验室提供支持。版本：0.0.0',
					showCancel: false
				});
			}
		}
	}
</script>

<style>
	.container {
		padding-bottom: 30rpx;
	}
	
	/* 用户信息区域 */
	.user-info-section {
		padding: 50rpx 30rpx;
		background: linear-gradient(to bottom, #2E8B57, #3CB371);
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	
	.avatar-container {
		position: relative;
		width: 150rpx;
		height: 150rpx;
		border-radius: 50%;
		overflow: hidden;
		margin-bottom: 20rpx;
	}
	
	.avatar {
		width: 100%;
		height: 100%;
	}
	
	.edit-icon {
		position: absolute;
		bottom: 0;
		right: 0;
		width: 50rpx;
		height: 50rpx;
		background-color: rgba(0, 0, 0, 0.5);
		color: #FFFFFF;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 30rpx;
	}
	
	.user-name {
		font-size: 32rpx;
		color: #FFFFFF;
		display: flex;
		align-items: center;
	}
	
	.edit-name {
		margin-left: 10rpx;
		font-size: 24rpx;
	}
	
	/* 功能列表 */
	.function-list {
		padding: 20rpx;
	}
	
	.function-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx 20rpx;
		background-color: #FFFFFF;
		border-radius: 10rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}
	
	.function-title {
		font-size: 30rpx;
		color: #333333;
	}
	
	.function-arrow {
		font-size: 30rpx;
		color: #999999;
	}
	
	/* 编辑昵称弹窗 */
	.edit-modal {
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
	
	.nickname-input {
		width: 100%;
		height: 80rpx;
		border: 1px solid #EEEEEE;
		border-radius: 5rpx;
		padding: 0 20rpx;
		font-size: 28rpx;
		margin-bottom: 30rpx;
	}
	
	.modal-btns {
		display: flex;
		justify-content: space-between;
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