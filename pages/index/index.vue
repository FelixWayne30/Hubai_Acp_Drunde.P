<template>
	<view class="container">
		<!-- 背景图层 -->
		<image class="background-image" src="/static/background/hubei-landscape.png" mode="aspectFill"></image>
		
		<!-- 四大图组区域 -->
		<view class="topic-grid">
			<view 
				class="topic-item" 
				v-for="(item, index) in topicList" 
				:key="index" 
				@click="navigateToTopic(item.id)"
			>
				<image class="topic-image" :src="item.image"></image>
				<view class="topic-title">{{item.title}}</view>
			</view>
		</view>
		
		<!-- 地图轮播区 -->
		<view class="map-showcase">
			<image class="map-preview" src="/static/maps/hubei-season-map.png" mode="widthFix"></image>
			<view class="map-caption">湖北省季平均日照时数</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				topicList: [
					{
						id: "1",
						title: "极目楚天",
						image: "/static/icons/topic-landscape.png"
					},
					{
						id: "2",
						title: "富饶资源",
						image: "/static/icons/topic-resources.png"
					},
					{
						id: "3",
						title: "绿色发展",
						image: "/static/icons/topic-green.png"
					},
					{
						id: "4",
						title: "城市新篇",
						image: "/static/icons/topic-city.png"
					}
				]
			}
		},
		methods: {
			navigateToTopic(topicId) {
				uni.navigateTo({
					url: '/pages/map/browse?topic_id=' + topicId
				});
			}
		}
	}
</script>

<style>
	.container {
		position: relative;
		height: 100vh;
		padding: 0;
		overflow: hidden;
	}
	
	.background-image {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: -1;
	}
	
	.topic-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		padding: 40rpx 20rpx;
		margin-top: 150rpx;
	}
	
	.topic-item {
		width: 42%;
		margin: 15rpx;
		background-color: rgba(255, 255, 255, 0.85);
		border-radius: 20rpx;
		overflow: hidden;
		box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.1);
		transition: transform 0.3s;
	}
	
	.topic-item:nth-child(1) {
		background-color: rgba(173, 216, 230, 0.85); /* 天青蓝 */
	}
	
	.topic-item:nth-child(2) {
		background-color: rgba(218, 165, 32, 0.85); /* 琥珀金 */
	}
	
	.topic-item:nth-child(3) {
		background-color: rgba(144, 238, 144, 0.85); /* 鲜绿色 */
	}
	
	.topic-item:nth-child(4) {
		background-color: rgba(70, 130, 180, 0.85); /* 靛蓝色 */
	}
	
	.topic-image {
		width: 100rpx;
		height: 100rpx;
		margin: 20rpx auto 10rpx;
		display: block;
	}
	
	.topic-title {
		text-align: center;
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		padding: 15rpx 0 20rpx;
	}
	
	.map-showcase {
		width: 90%;
		margin: 30rpx auto;
		background-color: rgba(255, 255, 255, 0.9);
		border-radius: 15rpx;
		padding: 20rpx;
		box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.1);
	}
	
	.map-preview {
		width: 100%;
		border-radius: 10rpx;
	}
	
	.map-caption {
		text-align: center;
		font-size: 28rpx;
		color: #666;
		padding: 15rpx 0;
	}
</style>