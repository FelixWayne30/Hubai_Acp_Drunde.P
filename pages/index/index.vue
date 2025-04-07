<template>
	<view class="container">
		<!-- 轮播图区域 -->
		<swiper class="banner" indicator-dots autoplay interval="3000" duration="500" circular>
			<swiper-item v-for="(item, index) in bannerList" :key="index" @click="navigateToTopic(item.id)">
				<view class="banner-item">
					<!-- 轮播图图片 (灰色占位) -->
					<image class="banner-image placeholder-image" :src="item.image"></image>
					<view class="banner-title">{{item.title}}</view>
				</view>
			</swiper-item>
		</swiper>
		
		<!-- 专题列表区域 -->
		<view class="topic-grid">
			<view 
				class="topic-item" 
				v-for="(item, index) in topicList" 
				:key="index" 
				@click="navigateToTopic(item.id)"
			>
				<!-- 专题封面图 (灰色占位) -->
				<image class="topic-image placeholder-image" :src="item.image"></image>
				<view class="topic-title">{{item.title}}</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 轮播图数据（示例数据）
				bannerList: [
					{
						id: "1",
						title: "湖北省地质资源概览",
						image: "/static/placeholder.png"
					},
					{
						id: "2",
						title: "湖北省水资源分布",
						image: "/static/placeholder.png"
					},
					{
						id: "3",
						title: "湖北省土地利用现状",
						image: "/static/placeholder.png"
					}
				],
				// 专题列表数据（示例数据）
				topicList: [
					{
						id: "1",
						title: "地质资源",
						image: "/static/placeholder.png"
					},
					{
						id: "2",
						title: "水资源",
						image: "/static/placeholder.png"
					},
					{
						id: "3",
						title: "土地资源",
						image: "/static/placeholder.png"
					},
					{
						id: "4",
						title: "生态保护",
						image: "/static/placeholder.png"
					},
					{
						id: "5",
						title: "矿产资源",
						image: "/static/placeholder.png"
					},
					{
						id: "6",
						title: "自然保护区",
						image: "/static/placeholder.png"
					}
				]
			}
		},
		onLoad() {
			// 页面加载时获取数据
			this.getTopicList();
		},
		onPullDownRefresh() {
			// 下拉刷新
			this.getTopicList();
			setTimeout(() => {
				uni.stopPullDownRefresh();
			}, 1000);
		},
		methods: {
			// 获取专题列表
			getTopicList() {
				// 这里应该是从API获取数据
				console.log('获取专题列表');
				// 模拟API调用
				// uni.request({
				//   url: '/api/topics',
				//   success: (res) => {
				//     this.topicList = res.data.topics;
				//     this.bannerList = res.data.banners;
				//   }
				// });
			},
			
			// 导航到专题浏览页
			navigateToTopic(topicId) {
				uni.navigateTo({
					url: `/pages/map/browse?topic_id=${topicId}`
				});
			}
		}
	}
</script>

<style>
	.container {
		padding-bottom: 30rpx;
	}
	
	/* 轮播图样式 */
	.banner {
		width: 100%;
		height: 350rpx;
	}
	
	.banner-item {
		position: relative;
		width: 100%;
		height: 100%;
	}
	
	.banner-image {
		width: 100%;
		height: 100%;
	}
	
	.banner-title {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		padding: 15rpx;
		background-color: rgba(0, 0, 0, 0.5);
		color: #FFFFFF;
		font-size: 28rpx;
	}
	
	/* 专题列表样式 */
	.topic-grid {
		display: flex;
		flex-wrap: wrap;
		padding: 20rpx;
	}
	
	.topic-item {
		width: 48%;
		margin: 1%;
		background-color: #FFFFFF;
		border-radius: 10rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
		margin-bottom: 20rpx;
	}
	
	.topic-image {
		width: 100%;
		height: 200rpx;
	}
	
	.topic-title {
		padding: 15rpx;
		font-size: 28rpx;
		text-align: center;
		color: #333333;
	}
</style>