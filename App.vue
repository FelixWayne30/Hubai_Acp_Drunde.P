<script>
import cacheManager from './common/cacheManager';

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

    // 初始化缓存管理器
    cacheManager.initialize();
  },

  onShow: function() {
    console.log('App Show');
  },

  onHide: function() {
    console.log('App Hide');
    // 应用切到后台时停止自动刷新
    cacheManager.stopAutoRefresh();
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