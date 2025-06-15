<template>
	<view class="container">
		<!-- 头部操作栏 -->
		<view class="header-bar" v-if="batchMode">
			<view class="select-all" @click="toggleSelectAll">
				<text :class="{'selected': allSelected}">{{allSelected ? '取消全选' : '全选'}}</text>
			</view>
			<view class="delete-btn" @click="deleteSelected">删除</view>
		</view>
		
		<!-- 收藏列表 -->
		<view class="collection-list">
			<block v-if="collections.length > 0">
				<view 
					class="collection-item"
					v-for="(item, index) in collections"
					:key="index"
					@click="viewMap(item)"
					@longpress="enterBatchMode"
				>
					<!-- 多选勾选框 -->
					<view class="checkbox" v-if="batchMode" @click.stop="toggleSelect(index)">
						<text :class="{'selected': item.selected}">{{item.selected ? '✓' : ''}}</text>
					</view>
					
					<!-- 缩略图 -->
					<image class="thumbnail placeholder-image" :src="item.image || '/static/placeholder.png'"></image>
					
					<!-- 地图信息 -->
					<view class="map-info">
						<view class="map-title">{{item.title}}</view>
						<view class="collect-time">{{formatDate(item.create_time)}}</view>
					</view>
					
					<!-- 取消收藏按钮 -->
					<view class="uncollect-btn" @click.stop="uncollectMap(item.map_id, index)">
						<text class="iconfont">🗑</text>
					</view>
				</view>
			</block>
			<view class="empty-list" v-else>
				<image class="empty-icon placeholder-image" src="/static/empty.png"></image>
				<view class="empty-text">暂无收藏</view>
				<button class="browse-btn btn-primary" @click="navigateToHome">去浏览</button>
			</view>
		</view>
	</view>
</template>

<script>
import { API } from '@/common/config.js';
import imageCache from '@/common/cache.js';

export default {
  data() {
    return {
      // 收藏列表
      collections: [],
      // 批量操作模式
      batchMode: false,
      allSelected: false,
      // 用户ID
      userId: null,
      // 加载状态
      isLoading: false
    }
  },
  onLoad() {
    // 获取用户ID
    const userInfo = uni.getStorageSync('userInfo');
    if (userInfo) {
      try {
        const userObj = JSON.parse(userInfo);
        this.userId = userObj.user_id;
        // 获取收藏列表
        this.getCollections();
      } catch (e) {
        console.error('解析用户信息失败', e);
        uni.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        });
      }
    } else {
      uni.showToast({
        title: '请先登录',
        icon: 'none'
      });
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/user/center'
        });
      }, 1500);
    }
  },
  methods: {
    // 获取收藏列表 - 重构图片处理逻辑
    getCollections() {
      if (!this.userId) return;
      
      this.isLoading = true;
      uni.showLoading({
        title: '加载中...'
      });
      
      uni.request({
        url: API.COLLECTION_LIST,
        method: 'GET',
        data: {
          userId: this.userId
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 200) {
            // 处理收藏数据
            const collections = res.data.data || [];
            this.collections = collections.map(item => {
              console.log(`处理收藏项: ${item.title}`);
              
              // 基于title生成图片URL，优先使用缓存
              let imageUrl = imageCache.getImage(item.title);
              
              if (imageUrl) {
                console.log(`缓存命中，使用缓存图片: ${imageUrl}`);
              } else {
                console.log('缓存未命中，生成新的图片URL');
                imageUrl = API.THUMBNAIL_MAP + item.title +".jpg";
                imageCache.setImage(item.title, imageUrl, item);
                console.log(`生成新图片URL: ${imageUrl}`);
              }
              
              return {
                ...item,
                image: imageUrl,
                selected: false
              };
            });
          } else {
            uni.showToast({
              title: '获取收藏列表失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          console.error('请求失败', err);
          uni.showToast({
            title: '网络错误，请稍后重试',
            icon: 'none'
          });
        },
        complete: () => {
          this.isLoading = false;
          uni.hideLoading();
        }
      });
    },
    
    // 查看地图详情
    viewMap(item) {
      if (this.batchMode) {
        this.toggleSelect(this.collections.findIndex(c => c.map_id === item.map_id));
        return;
      }
      
      uni.navigateTo({
        url: `/pages/map/detail?id=${item.map_id}`
      });
    },
    
    // 取消收藏
    uncollectMap(mapId, index) {
      uni.showModal({
        title: '提示',
        content: '确认取消收藏该地图？',
        success: (res) => {
          if (res.confirm) {
            uni.request({
              url: API.COLLECTION_TOGGLE,
              method: 'POST',
              data: {
                userId: this.userId,
                mapId: mapId
              },
              header: {
                'content-type': 'application/x-www-form-urlencoded'
              },
              success: (res) => {
                if (res.statusCode === 200 && res.data.code === 200) {
                  // 从列表中移除
                  this.collections.splice(index, 1);
                  
                  uni.showToast({
                    title: '已取消收藏',
                    icon: 'success'
                  });
                } else {
                  uni.showToast({
                    title: '操作失败',
                    icon: 'none'
                  });
                }
              },
              fail: (err) => {
                console.error('请求失败', err);
                uni.showToast({
                  title: '网络错误，请稍后重试',
                  icon: 'none'
                });
              }
            });
          }
        }
      });
    },
    
    // 进入批量操作模式
    enterBatchMode() {
      this.batchMode = true;
      this.allSelected = false;
      this.collections.forEach(item => {
        item.selected = false;
      });
    },
    
    // 切换选择状态
    toggleSelect(index) {
      this.collections[index].selected = !this.collections[index].selected;
      
      // 更新全选状态
      this.updateAllSelectedState();
    },
    
    // 更新全选状态
    updateAllSelectedState() {
      this.allSelected = this.collections.every(item => item.selected);
    },
    
    // 切换全选
    toggleSelectAll() {
      this.allSelected = !this.allSelected;
      
      this.collections.forEach(item => {
        item.selected = this.allSelected;
      });
    },
    
    // 删除选中项
    deleteSelected() {
      const selectedItems = this.collections.filter(item => item.selected);
      
      if (selectedItems.length === 0) {
        uni.showToast({
          title: '请选择要删除的项',
          icon: 'none'
        });
        return;
      }
      
      uni.showModal({
        title: '提示',
        content: `确认删除${selectedItems.length}项收藏？`,
        success: (res) => {
          if (res.confirm) {
            let completedCount = 0;
            let successCount = 0;
            
            const totalCount = selectedItems.length;
            
            // 显示加载中
            uni.showLoading({
              title: '处理中...'
            });
            
            // 逐个取消收藏
            selectedItems.forEach(item => {
              uni.request({
                url: API.COLLECTION_TOGGLE,
                method: 'POST',
                data: {
                  userId: this.userId,
                  mapId: item.map_id
                },
                header: {
                  'content-type': 'application/x-www-form-urlencoded'
                },
                complete: (res) => {
                  completedCount++;
                  
                  if (res.statusCode === 200 && res.data.code === 200) {
                    successCount++;
                  }
                  
                  // 全部处理完成
                  if (completedCount === totalCount) {
                    // 更新列表
                    this.collections = this.collections.filter(item => !item.selected);
                    this.batchMode = false;
                    
                    uni.hideLoading();
                    uni.showToast({
                      title: successCount === totalCount ? '删除成功' : `成功${successCount}项，失败${totalCount - successCount}项`,
                      icon: successCount === totalCount ? 'success' : 'none'
                    });
                  }
                }
              });
            });
          }
        }
      });
    },
    
    // 导航到首页
    navigateToHome() {
      uni.switchTab({
        url: '/pages/index/index'
      });
    },
    
    // 格式化日期
    formatDate(dateStr) {
      if (!dateStr) return '';
      
      try {
        const date = new Date(dateStr);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      } catch (e) {
        return dateStr;
      }
    }
  }
}
</script>
<style>
	.container {
		padding-bottom: 30rpx;
	}
	
	/* 头部操作栏 */
	.header-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 30rpx;
		background-color: #FFFFFF;
		border-bottom: 1px solid #EEEEEE;
		position: sticky;
		top: 0;
		z-index: 10;
	}
	
	.select-all {
		font-size: 28rpx;
		color: #666666;
	}
	
	.delete-btn {
		font-size: 28rpx;
		color: #FF0000;
	}
	
	/* 收藏列表 */
	.collection-list {
		padding: 20rpx;
	}
	
	.collection-item {
		display: flex;
		align-items: center;
		padding: 20rpx;
		background-color: #FFFFFF;
		border-radius: 10rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}
	
	.checkbox {
		width: 40rpx;
		height: 40rpx;
		border-radius: 50%;
		border: 1px solid #CCCCCC;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20rpx;
		color: #FFFFFF;
	}
	
	.checkbox .selected {
		background-color: #2E8B57;
		border-color: #2E8B57;
	}
	
	.thumbnail {
		width: 120rpx;
		height: 120rpx;
		border-radius: 10rpx;
	}
	
	.map-info {
		flex: 1;
		margin-left: 20rpx;
		overflow: hidden;
	}
	
	.map-title {
		font-size: 28rpx;
		color: #333333;
		margin-bottom: 10rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	
	.collect-time {
		font-size: 24rpx;
		color: #999999;
	}
	
	.uncollect-btn {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.iconfont {
		font-size: 40rpx;
		color: #FF0000;
	}
	
	/* 空列表 */
	.empty-list {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 0;
	}
	
	.empty-icon {
		width: 200rpx;
		height: 200rpx;
		margin-bottom: 30rpx;
	}
	
	.empty-text {
		font-size: 30rpx;
		color: #999999;
		margin-bottom: 30rpx;
	}
	
	.browse-btn {
		width: 200rpx;
		height: 80rpx;
		line-height: 80rpx;
		font-size: 28rpx;
		color: #FFFFFF;
		border-radius: 10rpx;
	}
</style>