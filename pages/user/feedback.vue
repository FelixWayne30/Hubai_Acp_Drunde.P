<template>
	<view class="container">
		<!-- 标题 -->
		<view class="header">
			<view class="title">意见反馈</view>
			<view class="sub-title">您的反馈是我们前进的动力</view>
		</view>
		
		<!-- 反馈表单 -->
		<view class="feedback-form">
			<!-- 反馈类型 -->
			<view class="form-item">
				<view class="form-label">反馈类型</view>
				<view class="type-selector">
					<view 
						class="type-item" 
						:class="{'active': feedbackType === 'bug'}"
						@click="setFeedbackType('bug')"
					>问题反馈</view>
					<view 
						class="type-item" 
						:class="{'active': feedbackType === 'suggestion'}"
						@click="setFeedbackType('suggestion')"
					>功能建议</view>
					<view 
						class="type-item" 
						:class="{'active': feedbackType === 'content'}"
						@click="setFeedbackType('content')"
					>内容纠错</view>
					<view 
						class="type-item" 
						:class="{'active': feedbackType === 'other'}"
						@click="setFeedbackType('other')"
					>其他</view>
				</view>
			</view>
			
			<!-- 反馈内容 -->
			<view class="form-item">
				<view class="form-label">反馈内容</view>
				<textarea 
					class="feedback-textarea"
					v-model="feedbackContent"
					placeholder="请详细描述您遇到的问题或建议（10-500字）"
					maxlength="500"
				></textarea>
				<view class="word-count">{{feedbackContent.length}}/500</view>
			</view>
			
			<!-- 联系方式 -->
			<view class="form-item">
				<view class="form-label">联系方式（选填）</view>
				<input 
					class="contact-input"
					v-model="contactInfo"
					placeholder="邮箱/手机号，方便我们与您联系"
					type="text"
				/>
			</view>
			
			<!-- 图片上传 -->
			<view class="form-item">
				<view class="form-label">上传截图（选填，最多3张）</view>
				<view class="image-uploader">
					<view class="image-list">
						<view 
							class="image-item" 
							v-for="(item, index) in uploadedImages" 
							:key="index"
						>
							<image class="uploaded-image" :src="item"></image>
							<view class="delete-icon" @click="deleteImage(index)">×</view>
						</view>
						
						<view class="upload-btn" @click="chooseImage" v-if="uploadedImages.length < 3">
							<text class="upload-icon">+</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 提交按钮 -->
		<button class="submit-btn primary-bg" @click="submitFeedback">提交反馈</button>
		
		<!-- 提交成功弹窗 -->
		<view class="success-modal" v-if="showSuccessModal">
			<view class="modal-content">
				<view class="success-icon">✓</view>
				<view class="success-text">感谢您的反馈</view>
				<view class="success-desc">我们会认真处理您的反馈意见</view>
				<button class="confirm-btn primary-bg" @click="closeSuccessModal">确定</button>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 反馈类型
				feedbackType: 'bug',
				// 反馈内容
				feedbackContent: '',
				// 联系方式
				contactInfo: '',
				// 上传的图片
				uploadedImages: [],
				// 成功弹窗
				showSuccessModal: false
			}
		},
		methods: {
			// 设置反馈类型
			setFeedbackType(type) {
				this.feedbackType = type;
			},
			
			// 选择图片
			chooseImage() {
				uni.chooseImage({
					count: 3 - this.uploadedImages.length,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						// 合并现有图片和新选择的图片
						this.uploadedImages = [...this.uploadedImages, ...res.tempFilePaths];
					}
				});
			},
			
			// 删除图片
			deleteImage(index) {
				this.uploadedImages.splice(index, 1);
			},
			
			// 提交反馈
			submitFeedback() {
				// 内容验证
				if (!this.feedbackContent.trim()) {
					uni.showToast({
						title: '请输入反馈内容',
						icon: 'none'
					});
					return;
				}
				
				if (this.feedbackContent.length < 10) {
					uni.showToast({
						title: '反馈内容至少10个字',
						icon: 'none'
					});
					return;
				}
				
				// 验证联系方式格式（如果填写了）
				if (this.contactInfo.trim()) {
					const emailRegex = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;
					const phoneRegex = /^1[3-9]\d{9}$/;
					
					if (!emailRegex.test(this.contactInfo) && !phoneRegex.test(this.contactInfo)) {
						uni.showToast({
							title: '请输入正确的邮箱或手机号',
							icon: 'none'
						});
						return;
					}
				}
				
				// 显示加载中
				uni.showLoading({
					title: '提交中...'
				});
				
				// 模拟API调用
				// 首先上传图片
				// const uploadPromises = this.uploadedImages.map(image => {
				//   return new Promise((resolve, reject) => {
				//     uni.uploadFile({
				//       url: '/api/upload',
				//       filePath: image,
				//       name: 'image',
				//       success: (res) => {
				//         const data = JSON.parse(res.data);
				//         resolve(data.url);
				//       },
				//       fail: (err) => {
				//         reject(err);
				//       }
				//     });
				//   });
				// });
				
				// Promise.all(uploadPromises).then(imageUrls => {
				//   // 提交反馈
				//   uni.request({
				//     url: '/api/feedback',
				//     method: 'POST',
				//     data: {
				//       type: this.feedbackType,
				//       content: this.feedbackContent,
				//       contact: this.contactInfo,
				//       images: imageUrls
				//     },
				//     success: () => {
				//       uni.hideLoading();
				//       this.showSuccessModal = true;
				//     },
				//     fail: () => {
				//       uni.hideLoading();
				//       uni.showToast({
				//         title: '提交失败，请重试',
				//         icon: 'none'
				//       });
				//     }
				//   });
				// }).catch(() => {
				//   uni.hideLoading();
				//   uni.showToast({
				//     title: '图片上传失败，请重试',
				//     icon: 'none'
				//   });
				// });
				
				// 模拟成功
				setTimeout(() => {
					uni.hideLoading();
					this.showSuccessModal = true;
				}, 1500);
			},
			
			// 关闭成功弹窗
			closeSuccessModal() {
				this.showSuccessModal = false;
				
				// 重置表单
				this.feedbackType = 'bug';
				this.feedbackContent = '';
				this.contactInfo = '';
				this.uploadedImages = [];
				
				// 返回上一页
				uni.navigateBack();
			}
		}
	}
</script>

<style>
	.container {
		padding: 30rpx;
		padding-bottom: 100rpx;
		background-color: #F8F8F8;
	}
	
	/* 标题 */
	.header {
		margin-bottom: 40rpx;
	}
	
	.title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333333;
		margin-bottom: 10rpx;
	}
	
	.sub-title {
		font-size: 28rpx;
		color: #999999;
	}
	
	/* 表单样式 */
	.feedback-form {
		background-color: #FFFFFF;
		border-radius: 10rpx;
		padding: 30rpx;
		margin-bottom: 40rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}
	
	.form-item {
		margin-bottom: 30rpx;
	}
	
	.form-label {
		font-size: 30rpx;
		color: #333333;
		margin-bottom: 20rpx;
	}
	
	/* 反馈类型选择器 */
	.type-selector {
		display: flex;
		flex-wrap: wrap;
	}
	
	.type-item {
		padding: 15rpx 30rpx;
		background-color: #F8F8F8;
		border-radius: 30rpx;
		margin-right: 20rpx;
		margin-bottom: 20rpx;
		font-size: 28rpx;
		color: #666666;
	}
	
	.type-item.active {
		background-color: rgba(46, 139, 87, 0.1);
		color: #2E8B57;
		border: 1px solid #2E8B57;
	}
	
	/* 反馈内容输入框 */
	.feedback-textarea {
		width: 100%;
		height: 300rpx;
		border: 1px solid #EEEEEE;
		border-radius: 10rpx;
		padding: 20rpx;
		font-size: 28rpx;
		margin-bottom: 10rpx;
	}
	
	.word-count {
		text-align: right;
		font-size: 24rpx;
		color: #999999;
	}
	
	/* 联系方式输入框 */
	.contact-input {
		width: 100%;
		height: 80rpx;
		border: 1px solid #EEEEEE;
		border-radius: 10rpx;
		padding: 0 20rpx;
		font-size: 28rpx;
	}
	
	/* 图片上传 */
	.image-uploader {
		width: 100%;
	}
	
	.image-list {
		display: flex;
		flex-wrap: wrap;
	}
	
	.image-item {
		width: 200rpx;
		height: 200rpx;
		margin-right: 20rpx;
		margin-bottom: 20rpx;
		position: relative;
		border-radius: 10rpx;
		overflow: hidden;
	}
	
	.uploaded-image {
		width: 100%;
		height: 100%;
	}
	
	.delete-icon {
		position: absolute;
		top: 10rpx;
		right: 10rpx;
		width: 40rpx;
		height: 40rpx;
		border-radius: 50%;
		background-color: rgba(0, 0, 0, 0.5);
		color: #FFFFFF;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 30rpx;
	}
	
	.upload-btn {
		width: 200rpx;
		height: 200rpx;
		border: 1px dashed #CCCCCC;
		border-radius: 10rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 20rpx;
	}
	
	.upload-icon {
		font-size: 60rpx;
		color: #CCCCCC;
	}
	
	/* 提交按钮 */
	.submit-btn {
		width: 100%;
		height: 90rpx;
		line-height: 90rpx;
		color: #FFFFFF;
		font-size: 32rpx;
		border-radius: 10rpx;
	}
	
	/* 提交成功弹窗 */
	.success-modal {
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
		border-radius: 20rpx;
		padding: 50rpx 30rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	
	.success-icon {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		background-color: #2E8B57;
		color: #FFFFFF;
		font-size: 80rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 30rpx;
	}
	
	.success-text {
		font-size: 36rpx;
		font-weight: bold;
		color: #333333;
		margin-bottom: 20rpx;
	}
	
	.success-desc {
		font-size: 28rpx;
		color: #999999;
		margin-bottom: 40rpx;
	}
	
	.confirm-btn {
		width: 80%;
		height: 90rpx;
		line-height: 90rpx;
		color: #FFFFFF;
		font-size: 32rpx;
		border-radius: 45rpx;
	}
</style>