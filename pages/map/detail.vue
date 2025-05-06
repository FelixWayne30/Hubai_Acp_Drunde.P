<template>
	<view class="container">
		<!-- 图幅预览区域 -->
		<view class="preview-container">
			<image class="preview-image placeholder-image" :src="mapInfo.image"></image>
			
			<!-- 图幅标题 -->
			<view class="map-title">{{mapInfo.title}}</view>
		</view>
		
		<!-- 交互区域 -->
		<view class="interaction-bar">
			<view class="action-btn" @click="likeMap">
				<text class="iconfont" :class="{'active': isLiked}">♥</text>
				<text class="count">{{likeCount}}</text>
			</view>
			
			<view class="action-btn" @click="collectMap">
				<text class="iconfont" :class="{'active': isCollected}">★</text>
				<text class="count">收藏</text>
			</view>
					
			<view class="action-btn" @click="showListsModal">
				<text class="iconfont">+</text>
				<text class="count">添加至</text>
			</view>
		</view>
		
		<!-- 图幅描述区域 -->
		<view class="description-section">
			<view class="section-title">图幅描述</view>
			<view class="description-content">
				{{mapInfo.description || '暂无描述'}}
			</view>
		</view>
		
		<!-- 评论区 -->
		<view class="comment-section">
			<view class="section-title">评论区 ({{commentCount}}条评论)</view>
			
			<!-- 评论列表 -->
			<view class="comment-list">
				<block v-if="comments.length > 0">
					<view class="comment-item" v-for="(item, index) in comments" :key="index">
						<view class="comment-user">{{item.userName}}</view>
						<view class="comment-content">{{item.content}}</view>
						<view class="comment-time">{{item.time}}</view>
					</view>
				</block>
				<view class="no-comment" v-else>
					暂无评论
				</view>
			</view>
		</view>
		
		<!-- 评论输入框 -->
		<view class="comment-input-container">
			<input 
				class="comment-input"
				v-model="commentContent"
				placeholder="写下你的评论..."
				confirm-type="send"
				:focus="inputFocus"
				@confirm="submitComment"
			/>
			<button class="send-btn primary-bg" @click="submitComment">发送</button>
		</view>
		
		<!-- Custom Lists Modal -->
		<view class="lists-modal" v-if="showListsSelector">
			<view class="modal-content">
				<view class="modal-title">添加到自定义列表</view>
				<view class="lists-container">
					<view v-if="customLists.length === 0" class="empty-lists">
						<text>暂无自定义列表</text>
						<button class="create-list-btn primary-bg" @click="navigateToCreateList">创建列表</button>
					</view>
					<view v-else class="lists-scroll">
						<view 
							class="list-item"
							v-for="(item, index) in customLists"
							:key="item.id"
						>
							<checkbox :checked="isMapInList(item.id)" @click="toggleListSelection(item.id)"></checkbox>
							<text class="list-name">{{item.name}}</text>
						</view>
					</view>
				</view>
				<view class="modal-btns">
					<button class="modal-btn cancel-btn" @click="hideListsModal">取消</button>
					<button class="modal-btn confirm-btn primary-bg" @click="addToSelectedLists">确定</button>
				</view>
			</view>
		</view>
		
		<!-- 返回浏览按钮 -->
		<view class="back-to-browse" @click="backToBrowse">
			<text>返回浏览页</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				mapId: '',
				// 地图信息（示例数据）
				mapInfo: {
					id: '',
					title: '湖北省地质图',
					image: '/static/placeholder.png',
					description: '展示湖北省地质结构分布'
				},
				// 交互数据
				isLiked: false,
				isCollected: false,
				likeCount: 123,
				commentCount: 5,
				// 评论相关
				comments: [
					{
						id: '1',
						userName: '地图爱好者',
						content: '这张地图非常详细，对我的研究很有帮助！',
						time: '2025-04-05 10:23'
					},
					{
						id: '2',
						userName: '资源研究员',
						content: '色彩搭配很合理，易于识别不同地质类型。',
						time: '2025-04-03 16:45'
					},
					{
						id: '3',
						userName: '湖北游客',
						content: '终于找到了家乡的详细地质信息，感谢提供！',
						time: '2025-04-01 09:12'
					},
					{
						id: '4',
						userName: '地理老师',
						content: '已经下载用于教学，学生们都很喜欢这个地图。',
						time: '2025-03-28 14:37'
					},
					{
						id: '5',
						userName: '自然爱好者',
						content: '图例清晰，内容全面，非常专业的一份地图。',
						time: '2025-03-25 20:18'
					}
				],
				commentContent: '',
				inputFocus: false,
				// 自定义列表相关
				showListsSelector: false,
				customLists: [],
				selectedLists: [],
				// 来源页面
				fromBrowse: false
			}
		},
		onLoad(options) {
			this.mapId = options.id || '';
			// 检查是否从浏览页跳转过来
			if (options.from === 'browse') {
				this.fromBrowse = true;
			}
			this.getMapDetail();
		},
		onShareAppMessage() {
			return {
				title: this.mapInfo.title,
				path: `/pages/map/detail?id=${this.mapId}`
			}
		},
		methods: {
			// 获取地图详情
			getMapDetail() {
				// 这里应该是从API获取数据
				console.log('获取地图详情，地图ID:', this.mapId);
				// 模拟API调用
				// uni.request({
				//   url: `/api/maps/${this.mapId}`,
				//   success: (res) => {
				//     this.mapInfo = res.data;
				//     this.isLiked = res.data.isLiked;
				//     this.isCollected = res.data.isCollected;
				//     this.likeCount = res.data.likeCount;
				//     this.commentCount = res.data.commentCount;
				//     this.getComments();
				//   }
				// });
				
				// 假设我们已经获取到了详情
				this.mapInfo.id = this.mapId;
			},
			
			// 获取评论列表
			getComments() {
				// 这里应该是从API获取数据
				console.log('获取评论列表，地图ID:', this.mapId);
				// 模拟API调用
				// uni.request({
				//   url: `/api/maps/${this.mapId}/comments`,
				//   success: (res) => {
				//     this.comments = res.data.comments;
				//   }
				// });
			},
			
			// 点赞地图
			likeMap() {
				// 模拟状态切换
				this.isLiked = !this.isLiked;
				this.likeCount += (this.isLiked ? 1 : -1);
				
				// 模拟API调用
				// uni.request({
				//   url: `/api/maps/${this.mapId}/like`,
				//   method: 'POST',
				//   data: {
				//     liked: this.isLiked
				//   }
				// });
			},
			
			// 收藏地图
			collectMap() {
				// 模拟状态切换
				this.isCollected = !this.isCollected;
				
				// 模拟API调用
				// uni.request({
				//   url: `/api/maps/${this.mapId}/collect`,
				//   method: 'POST',
				//   data: {
				//     collected: this.isCollected
				//   }
				// });
				
				uni.showToast({
					title: this.isCollected ? '已收藏' : '已取消收藏',
					icon: 'none'
				});
			},
			
			// 聚焦评论输入框
			focusCommentInput() {
				this.inputFocus = true;
			},
			
			// 提交评论
			submitComment() {
				if (!this.commentContent.trim()) {
					uni.showToast({
						title: '评论内容不能为空',
						icon: 'none'
					});
					return;
				}
				
				// 模拟API调用
				// uni.request({
				//   url: `/api/maps/${this.mapId}/comment`,
				//   method: 'POST',
				//   data: {
				//     content: this.commentContent
				//   },
				//   success: () => {
				//     this.commentContent = '';
				//     uni.showToast({
				//       title: '评论提交成功，待审核',
				//       icon: 'none'
				//     });
				//   }
				// });
				
				// 模拟成功
				this.commentContent = '';
				this.inputFocus = false;
				uni.showToast({
					title: '评论提交成功，待审核',
					icon: 'none'
				});
			},
			
			// 显示自定义列表选择器
			showListsModal() {
				// 获取用户的自定义列表
				this.fetchCustomLists();
				this.showListsSelector = true;
			},
			
			// 隐藏自定义列表选择器
			hideListsModal() {
				this.showListsSelector = false;
			},
			
			// 获取用户的自定义列表
			fetchCustomLists() {
				// 模拟API调用
				// uni.request({
				//   url: '/api/user/lists',
				//   success: (res) => {
				//     this.customLists = res.data.lists;
				//   }
				// });
				
				// 模拟数据
				this.customLists = [
					{ id: '1', name: '长江流域图集' },
					{ id: '2', name: '矿产资源专题' },
					{ id: '3', name: '教学资料' }
				];
				
				// 重置选择状态
				this.selectedLists = [];
			},
			
			// 检查地图是否已在列表中
			isMapInList(listId) {
				return this.selectedLists.includes(listId);
			},
			
			// 切换列表选择状态
			toggleListSelection(listId) {
				const index = this.selectedLists.indexOf(listId);
				if (index > -1) {
					this.selectedLists.splice(index, 1);
				} else {
					this.selectedLists.push(listId);
				}
			},
			
			// 添加到已选择的列表
			addToSelectedLists() {
				if (this.selectedLists.length === 0) {
					uni.showToast({
						title: '请选择至少一个列表',
						icon: 'none'
					});
					return;
				}
				
				// 模拟API调用
				uni.showLoading({ title: '添加中...' });
				
				// 模拟请求
				// uni.request({
				//   url: '/api/user/lists/add-map',
				//   method: 'POST',
				//   data: {
				//     mapId: this.mapId,
				//     listIds: this.selectedLists
				//   },
				//   success: () => {
				//     uni.hideLoading();
				//     uni.showToast({
				//       title: '添加成功',
				//       icon: 'success'
				//     });
				//     this.hideListsModal();
				//   }
				// });
				
				// 模拟成功
				setTimeout(() => {
					uni.hideLoading();
					uni.showToast({
						title: '添加成功',
						icon: 'success'
					});
					this.hideListsModal();
				}, 1000);
			},
			
			// 跳转到创建列表页面
			navigateToCreateList() {
				this.hideListsModal();
				uni.navigateTo({
					url: '/pages/user/custom-lists'
				});
			},
			
			// 返回浏览页
			backToBrowse() {
				if (this.fromBrowse) {
					uni.navigateBack();
				} else {
					uni.navigateTo({
						url: `/pages/map/browse?id=${this.mapId}`
					});
				}
			}
		}
	}
</script>

<style>
	.container {
		padding-bottom: 100rpx;
	}
	
	/* 图幅预览区域 */
	.preview-container {
		position: relative;
		width: 100%;
		height: 450rpx;
		margin-bottom: 20rpx;
	}
	
	.preview-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	
	.map-title {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		padding: 20rpx;
		background-color: rgba(0, 0, 0, 0.5);
		color: #FFFFFF;
		font-size: 32rpx;
	}
	
	/* 交互区域 */
	.interaction-bar {
		display: flex;
		padding: 20rpx;
		background-color: #FFFFFF;
		border-bottom: 1px solid #EEEEEE;
	}
	
	.action-btn {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	
	.iconfont {
		font-size: 48rpx;
		line-height: 1;
		color: #999999;
	}
	
	.iconfont.active {
		color: #2E8B57;
	}
	
	.count {
		font-size: 24rpx;
		color: #666666;
		margin-top: 10rpx;
	}
	
	/* 描述区域 */
	.description-section {
		background-color: #FFFFFF;
		padding: 20rpx;
		margin-bottom: 20rpx;
	}
	
	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
		color: #333333;
	}
	
	.description-content {
		font-size: 28rpx;
		color: #666666;
		line-height: 1.6;
	}
	
	/* 评论区 */
	.comment-section {
		background-color: #FFFFFF;
		padding: 20rpx;
		margin-bottom: 20rpx;
	}
	
	.comment-list {
		padding-bottom: 30rpx;
	}
	
	.comment-item {
		padding: 20rpx 0;
		border-bottom: 1px solid #EEEEEE;
	}
	
	.comment-user {
		font-size: 28rpx;
		font-weight: bold;
		color: #333333;
		margin-bottom: 10rpx;
	}
	
	.comment-content {
		font-size: 28rpx;
		color: #666666;
		line-height: 1.5;
		margin-bottom: 10rpx;
	}
	
	.comment-time {
		font-size: 24rpx;
		color: #999999;
	}
	
	.no-comment {
		text-align: center;
		padding: 30rpx 0;
		color: #999999;
	}
	
	/* 评论输入框 */
	.comment-input-container {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		padding: 20rpx;
		background-color: #FFFFFF;
		border-top: 1px solid #EEEEEE;
		display: flex;
		align-items: center;
	}
	
	.comment-input {
		flex: 1;
		height: 80rpx;
		border: 1px solid #EEEEEE;
		border-radius: 40rpx;
		padding: 0 20rpx;
		font-size: 28rpx;
		background-color: #F8F8F8;
	}
	
	.send-btn {
		width: 120rpx;
		height: 80rpx;
		line-height: 80rpx;
		font-size: 28rpx;
		color: #FFFFFF;
		margin-left: 20rpx;
		border-radius: 40rpx;
	}
	
	/* Custom Lists Modal */
	.lists-modal {
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
	
	.lists-container {
		max-height: 60vh;
		overflow-y: auto;
		margin: 20rpx 0;
	}
	
	.empty-lists {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 40rpx 0;
	}
	
	.create-list-btn {
		margin-top: 20rpx;
		color: #FFFFFF;
		font-size: 28rpx;
		padding: 10rpx 30rpx;
		border-radius: 30rpx;
	}
	
	.list-item {
		display: flex;
		align-items: center;
		padding: 20rpx 0;
		border-bottom: 1px solid #EEEEEE;
	}
	
	.list-name {
		margin-left: 20rpx;
		font-size: 30rpx;
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
	
	/* 返回浏览按钮 */
	.back-to-browse {
		position: fixed;
		right: 30rpx;
		bottom: 130rpx;
		padding: 15rpx 30rpx;
		background-color: rgba(46, 139, 87, 0.8);
		color: #FFFFFF;
		border-radius: 50rpx;
		font-size: 28rpx;
		z-index: 99;
		box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
	}
</style>