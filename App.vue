<script>
import {clearMapCache, getCatalogsCache, getMapintoCache} from "./common/uniStorage";
	export default {
		onLaunch: function() {
			console.log('App Launch');
			// 添加统一的请求头
			uni.addInterceptor('request', {
			        invoke(args) {
			            args.header = args.header || {};
			            args.header['Authorization'] = 'Telecarto@501502511';
			            return args;
			        }
			    });
			uni.addInterceptor('downloadFile', {
			invoke(args) {
				args.header = args.header || {};
				args.header['Authorization'] = 'Telecarto@501502511';
				return args;
			}
			});
			// 添加路由拦截器用于调试
			uni.addInterceptor('navigateTo', {
				invoke(e) {
					console.log('navigateTo:', e.url);
					return e;
				},
				fail(err) {
					console.error('路由跳转失败:', err);
				}
			});

			getMapintoCache()

			getCatalogsCache()

			setInterval(()=>{
				uni.removeStorage({
				key:"maps",
				success:getMapintoCache
				})
				uni.removeStorage({
				key:"catalogs",
				success:getCatalogsCache
				})
			},1000*60*5)
		},

		onShow: function() {
			console.log('App Show');
		},
		onHide: function() {
			console.log('App Hide');
      clearMapCache()
		}
	}
</script>

<style>
@import '@/static/css/font.css';

	/* 全局CSS样式 */
	page {
		font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, 
			Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei', sans-serif;
		background-color: #F8F8F8;
	}
	
	/* 主题色定义 */
	.primary-bg {
		background-color: #2E8B57;
	}
	
	.primary-text {
		color: #2E8B57;
	}
	
	.primary-border {
		border: 1px solid #2E8B57;
	}
	
	/* 通用按钮样式 */
	.btn {
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
		border-radius: 10rpx;
		font-size: 30rpx;
	}
	
	.btn-primary {
		background-color: #2E8B57;
		color: #FFFFFF;
	}
	
	.btn-outline {
		background-color: #FFFFFF;
		color: #2E8B57;
		border: 1px solid #2E8B57;
	}
	
	/* 卡片样式 */
	.card {
		background-color: #FFFFFF;
		border-radius: 10rpx;
		padding: 20rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}
	
	/* 列表样式 */
	.list-item {
		padding: 20rpx;
		border-bottom: 1px solid #EEEEEE;
	}
	
	.list-item:last-child {
		border-bottom: none;
	}

</style>