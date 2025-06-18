<template>
	<view class="container">
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
			</view>
			
			<view class="function-card" @click="navigateWithLogin('/pages/user/custom-lists')">
				<view class="function-title">自定义列表</view>
			</view>
			
			<view class="function-card" @click="navigateWithLogin('/pages/user/downloads')">
				<view class="function-title">下载记录</view>
			</view>

      <view class="function-card" @click="manageCache">
        <view class="function-title">本地缓存</view>
      </view>
			
			<view class="function-card" @click="showAbout">
				<view class="function-title">关于我们</view>
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
		},

    manageCache(){
      uni.getStorageInfo({
        success:(res)=>{
          uni.showModal({
            title:'缓存管理',
            content:`本地缓存大小为：${res.currentSize}KB/${res.limitSize}KB`,
            confirmText:'清除',
            success:(res)=>{
              if (res.confirm) {
                console.log("清除地图缓存")
                uni.removeStorage({key:"maps"})
              }
            }
          })
        },
        fail:()=>{
          uni.showModal({
            title: '缓存管理',
            content:'获取缓存失败'
          })
        }
      })

    }
	}
}
</script>

<style>
	.container {
    position: relative;
    display: flex;
    flex-direction: column;
		min-height: 100vh;
    justify-content: start;
	}
	
	.background-image-container {
	  position: absolute;
	  bottom: 0;
	  left: 0;
	  width: 100%;
	  height: 100%;
	  z-index: -1;
	  overflow: hidden;
	}
	
	.background-image-top {
	  width: 100%;
	  height: 100%;
	  object-fit: cover;
	}
	
	.user-info-section {
	  margin-top: 80rpx;
	  padding: 50rpx 30rpx 60rpx;
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
  border: 6rpx solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;
}

.avatar-container:active {
  transform: scale(0.95);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
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
	  font-weight: 600;
	  color: #333333; 
	  display: flex;
	  align-items: center;
	  cursor: pointer;
	  margin-bottom: 8rpx;
	  letter-spacing: 1rpx;
	}
	
	.edit-name {
		margin-left: 10rpx;
		font-size: 24rpx;
	}
	
	/* 功能列表 */
	.function-list {
	  padding: 20rpx 30rpx;
	  display: flex;
	  flex-direction: column;
	  gap: 12rpx;
	}
	
	.function-card {
	  display: flex;
	  align-items: center;
	  padding: 32rpx 30rpx;
	  background-color: rgba(255, 255, 255, 0.75);
	  border-radius: 16rpx;
	  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	  backdrop-filter: blur(10rpx);
	  border: 1rpx solid rgba(255, 255, 255, 0.2);
	}	
	
	.function-title {
	  font-size: 32rpx;
	  font-weight: 500;
	  color: #333333;
	  letter-spacing: 0.5rpx;
	}
	
	.function-arrow {
		font-size: 30rpx;
		color: rgba(51, 51, 51, 0.6);
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