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


</style>