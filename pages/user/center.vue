<template>
	<view class="container">
		<!-- Base solid color background -->
		<view class="background-solid"></view>
		
		<!-- Top decorative background with gradient fade -->
		<view class="background-image-container">
			<image class="background-image-top" src="/static/background/main-bg.png" mode="aspectFill"></image>
			<view class="gradient-overlay"></view>
		</view>
		
		<!-- 用户信息区域 -->
		<view class="user-info-section">
			<view class="avatar-container" @click="handleUserInfoClick">
				<image
					class="avatar"
					:src="userInfo.avatar"
				></image>
				<view class="edit-icon" v-if="isLoggedIn">+</view>
			</view>
			<view class="user-name" @click="handleUserInfoClick">
				{{userInfo.nickName}}
				<text class="edit-name" v-if="isLoggedIn" @click.stop="editNickname">✎</text>
			</view>
		</view>
		
		<!-- 功能列表 -->
		<view class="function-list">
			<view class="function-card" @click="navigateWithLogin('/pages/user/collection')">
				<view class="function-title">我的收藏</view>
				<view class="function-arrow">></view>
			</view>
			
			<view class="function-card" @click="navigateWithLogin('/pages/user/custom-lists')">
				<view class="function-title">自定义列表</view>
				<view class="function-arrow">></view>
			</view>
			
			<view class="function-card" @click="navigateWithLogin('/pages/user/downloads')">
				<view class="function-title">下载记录</view>
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
import authManager from '@/common/auth.js';

export default {
	data() {
		return {
			// 用户信息显示
			userInfo: {
				nickName: '点击登录',
				avatar: ''
			},
			// 登录状态
			isLoggedIn: false,
			// 编辑昵称
			showEditModal: false,
			newNickname: ''
		}
	},
	onLoad() {
		this.initUserInfo();
	},
	onShow() {
		// 每次显示页面时检查登录状态
		this.updateUserInfoDisplay();
	},
	methods: {
		// 初始化用户信息
		initUserInfo() {
			this.updateUserInfoDisplay();
		},
		
		// 更新用户信息显示
		updateUserInfoDisplay() {
			const userData = authManager.getUserInfo();
			if (userData) {
				this.isLoggedIn = true;
				this.userInfo = {
					nickName: userData.nickname || '用户',
					avatar: userData.avatar || ''
				};
			} else {
				this.isLoggedIn = false;
				this.userInfo = {
					nickName: '点击登录',
					avatar: ''
				};
			}
		},
		
		// 处理用户信息点击（头像或昵称）
		handleUserInfoClick() {
			if (!this.isLoggedIn) {
				// 未登录，触发登录
				this.triggerLogin();
			} else {
				// 已登录，可以上传头像
				this.uploadAvatar();
			}
		},
		
		// 触发登录
		triggerLogin() {
			authManager.requireLogin()
				.then(() => {
					this.updateUserInfoDisplay();
					uni.showToast({
						title: '登录成功',
						icon: 'success'
					});
				})
				.catch((err) => {
					console.log('登录失败或取消:', err.message);
				});
		},
		
		// 上传头像
		uploadAvatar() {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					const tempFilePath = res.tempFilePaths[0];
					
					// 临时更新显示
					this.userInfo.avatar = tempFilePath;
					
					// TODO: 这里应该上传到服务器
					// 现在只是本地模拟
					const userInfo = authManager.getUserInfo();
					userInfo.avatar = tempFilePath;
					uni.setStorageSync('userInfo', JSON.stringify(userInfo));
					
					uni.showToast({
						title: '头像更新成功',
						icon: 'success'
					});
				}
			});
		},
		
		// 编辑昵称
		editNickname() {
			if (!this.isLoggedIn) return;
			
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
			
			// 更新显示
			this.userInfo.nickName = this.newNickname;
			
			// 更新本地存储
			const userInfo = authManager.getUserInfo();
			userInfo.nickname = this.newNickname;
			uni.setStorageSync('userInfo', JSON.stringify(userInfo));
			
			this.showEditModal = false;
			
			// TODO: 这里应该同步到服务器
			
			uni.showToast({
				title: '修改成功',
				icon: 'success'
			});
		},
		
		// 需要登录的导航
		navigateWithLogin(url) {
			authManager.requireLogin()
				.then(() => {
					uni.navigateTo({ url });
				})
				.catch(() => {
					// 用户取消登录，不跳转
				});
		},
		
		// 退出登录
		handleLogout() {
			uni.showModal({
				title: '确认退出',
				content: '确定要退出登录吗？',
				success: (res) => {
					if (res.confirm) {
						authManager.logout();
						this.updateUserInfoDisplay();
						uni.showToast({
							title: '已退出登录',
							icon: 'success'
						});
					}
				}
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
		position: relative;
		min-height: 100vh;
		padding-bottom: 30rpx;
	}
	
	/* Base solid background color */
	.background-solid {
	  position: absolute;
	  top: 0;
	  left: 0;
	  width: 100%;
	  height: 100%;
	  background-color: #E8F4F0;
	  z-index: -2;
	}
	
	/* Background image container - now at bottom */
	.background-image-container {
	  position: absolute;
	  bottom: 0;
	  left: 0;
	  width: 100%;
	  height: 45%;
	  z-index: -1;
	  overflow: hidden;
	}
	
	/* Background image */
	.background-image-top {
	  width: 100%;
	  height: 100%;
	  object-fit: cover;
	}
	
	/* Gradient overlay - now fades upward */
	.gradient-overlay {
	  position: absolute;
	  top: 0;
	  left: 0;
	  width: 100%;
	  height: 60%;
	  background: linear-gradient(to top, transparent 0%, #E8F4F0 100%);
	  z-index: 1;
	}
	
	/* 用户信息区域 */
	.user-info-section {
	  padding: 50rpx 30rpx;
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
		border: 4rpx solid #FFFFFF;
		cursor: pointer;
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
	  color: #333333; 
	  display: flex;
	  align-items: center;
	  cursor: pointer;
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
		background-color: rgba(255, 255, 255, 0.9);
		border-radius: 15rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		cursor: pointer;
	}
	
	.function-title {
		font-size: 30rpx;
		color: #333333;
	}
	
	.function-arrow {
		font-size: 30rpx;
		color: #999999;
	}
	
	/* 退出登录特殊样式 */
	.logout-card {
		margin-top: 40rpx;
		border: 1rpx solid #FF6B6B;
	}
	
	.logout-text {
		color: #FF6B6B;
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