<template>
	<view class="container">
		<!-- 头部 -->
		<view class="header">
			<view class="title">我的自定义列表</view>
			<view class="add-btn" @click="showCreateForm">
				<text class="add-icon">+</text>
				<text>新建列表</text>
			</view>
		</view>
		
		<!-- 列表区域 -->
		<view class="list-container">
			<block v-if="customLists.length > 0">
				<view 
					class="list-item"
					v-for="(item, index) in customLists"
					:key="index"
					@click="viewListDetail(item)"
				>
					<view class="list-icon">
						<text class="iconfont">📁</text>
					</view>
					<view class="list-info">
						<view class="list-name">{{item.name}}</view>
						<view class="list-count">{{item.count}}个图幅</view>
					</view>
					<view class="list-actions">
						<text class="action-icon" @click.stop="showEditForm(item)">✎</text>
						<text class="action-icon delete" @click.stop="confirmDelete(item)">🗑</text>
					</view>
				</view>
			</block>
			<view class="empty-tip" v-else>
				<image class="empty-icon placeholder-image" src="/static/empty.png"></image>
				<view class="empty-text">暂无自定义列表</view>
				<view class="tip-text">创建列表可以更好地整理您收藏的图幅</view>
			</view>
		</view>
		
		<!-- 创建/编辑表单弹窗 -->
		<view class="form-modal" v-if="showModal">
			<view class="modal-content">
				<view class="modal-title">{{isEditing ? '编辑列表' : '创建新列表'}}</view>
				<view class="form-item">
					<view class="form-label">列表名称</view>
					<input 
						class="form-input"
						v-model="formData.name"
						placeholder="请输入列表名称"
						maxlength="20"
					/>
				</view>
				<view class="form-item">
					<view class="form-label">列表描述</view>
					<textarea 
						class="form-textarea"
						v-model="formData.description"
						placeholder="请输入列表描述（选填）"
						maxlength="100"
					></textarea>
				</view>
				<view class="modal-btns">
					<button class="modal-btn cancel-btn" @click="hideModal">取消</button>
					<button class="modal-btn confirm-btn primary-bg" @click="saveList">确定</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { API } from '@/common/config.js';
import authManager from '@/common/auth.js';

export default {
  data() {
    return {
      // 自定义列表
      customLists: [],
      // 表单相关
      showModal: false,
      isEditing: false,
      currentListId: '',
      formData: {
        name: '',
        description: ''
      },
      // 用户信息
      userId: '',
      isLoading: false
    }
  },
  onLoad() {
    // 获取用户ID
    const userInfo = authManager.getUserInfo();
    if (userInfo) {
      this.userId = userInfo.user_id;
      // 获取用户的自定义列表
      this.getCustomLists();
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
  onShow() {
    // 页面重新显示时刷新列表数据
    if (this.userId) {
      this.getCustomLists();
    }
  },
  methods: {
    // 获取自定义列表
getCustomLists() {
  if (!this.userId) return;
  
  this.isLoading = true;
  uni.showLoading({
    title: '加载中...'
  });
  
  try {
    uni.request({
      url: API.CUSTOM_LIST_GET,
      method: 'GET',
      data: {
        userId: this.userId
      },
      success: (res) => {
        uni.hideLoading();
        if (res.statusCode === 200 && res.data.code === 200) {
          this.customLists = res.data.data || [];
        } else {
          uni.showToast({
            title: '获取列表失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        uni.hideLoading();
        console.error('请求失败', err);
        uni.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  } catch (e) {
    uni.hideLoading();
    this.isLoading = false;
    console.error('获取列表异常', e);
  }
},
	
    // 查看列表详情
    viewListDetail(item) {
      uni.navigateTo({
        url: '/pages/user/list-detail?id=' + item.id + '&name=' + encodeURIComponent(item.name)
      });
    },
    
    // 显示创建表单
    showCreateForm() {
      this.isEditing = false;
      this.formData = {
        name: '',
        description: ''
      };
      this.showModal = true;
    },
    
    // 显示编辑表单
    showEditForm(item) {
      this.isEditing = true;
      this.currentListId = item.id;
      this.formData = {
        name: item.name,
        description: item.description || ''
      };
      this.showModal = true;
    },
    
    // 隐藏表单
    hideModal() {
      this.showModal = false;
    },
    
    // 保存列表
  // 保存列表方法的修改
  saveList() {
    // 验证表单
    if (!this.formData.name.trim()) {
      uni.showToast({
        title: '请输入列表名称',
        icon: 'none'
      });
      return;
    }
    
    // 显示加载中
    uni.showLoading({
      title: this.isEditing ? '更新中...' : '创建中...'
    });
    
    try {
      if (this.isEditing) {
        // 更新现有列表
        uni.request({
          url: API.CUSTOM_LIST_UPDATE,
          method: 'POST',
          data: {
            listId: this.currentListId,
            userId: this.userId,
            name: this.formData.name,
            description: this.formData.description || ''
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: (res) => {
            if (res.statusCode === 200 && res.data.code === 200) {
              uni.hideLoading(); // 确保这里调用hideLoading
              this.hideModal();
              uni.showToast({
                title: '更新成功',
                icon: 'success'
              });
              this.getCustomLists(); // 刷新列表
            } else {
              uni.hideLoading(); // 失败时也要hideLoading
              uni.showToast({
                title: res.data.msg || '更新失败',
                icon: 'none'
              });
            }
          },
          fail: (err) => {
            uni.hideLoading(); // 请求失败时hideLoading
            console.error('请求失败', err);
            uni.showToast({
              title: '网络错误，请稍后重试',
              icon: 'none'
            });
          }
        });
      } else {
        // 创建新列表
        uni.request({
          url: API.CUSTOM_LIST_CREATE,
          method: 'POST',
          data: {
            userId: this.userId,
            name: this.formData.name,
            description: this.formData.description || ''
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: (res) => {
            uni.hideLoading(); // 确保这里调用hideLoading
            if (res.statusCode === 200 && res.data.code === 200) {
              this.hideModal();
              uni.showToast({
                title: '创建成功',
                icon: 'success'
              });
              this.getCustomLists(); // 刷新列表
            } else {
              uni.showToast({
                title: res.data.msg || '创建失败',
                icon: 'none'
              });
            }
          },
          fail: (err) => {
            uni.hideLoading(); // 请求失败时hideLoading
            console.error('请求失败', err);
            uni.showToast({
              title: '网络错误，请稍后重试',
              icon: 'none'
            });
          }
        });
      }
    } catch (e) {
      uni.hideLoading(); // 确保任何异常情况下都会hideLoading
      console.error('保存列表异常', e);
      uni.showToast({
        title: '操作异常，请稍后重试',
        icon: 'none'
      });
    }
  },
  
  // 隐藏表单方法修改
  hideModal() {
    this.showModal = false;
    this.formData = { name: '', description: '' }; // 重置表单
    this.isEditing = false;
    this.currentListId = '';
  },
  
    // 确认删除
    confirmDelete(item) {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除"${item.name}"列表吗？`,
        success: (res) => {
          if (res.confirm) {
            this.deleteList(item.id);
          }
        }
      });
    },
    
    // 删除列表
    deleteList(id) {
      uni.showLoading({
        title: '删除中...'
      });
      
      uni.request({
        url: API.CUSTOM_LIST_DELETE,
        method: 'POST',
        data: {
          listId: id,
          userId: this.userId
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 200) {
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            });
            this.getCustomLists(); // 刷新列表
          } else {
            uni.showToast({
              title: res.data.msg || '删除失败',
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
          uni.hideLoading();
        }
      });
    }
  }
}
</script>

<style>
	.container {
		padding: 30rpx;
	}
	
	/* 头部 */
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;
	}
	
	.title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333333;
	}
	
	.add-btn {
		display: flex;
		align-items: center;
		padding: 10rpx 20rpx;
		background-color: #2E8B57;
		color: #FFFFFF;
		border-radius: 30rpx;
		font-size: 28rpx;
	}
	
	.add-icon {
		margin-right: 10rpx;
		font-size: 32rpx;
	}
	
	/* 列表容器 */
	.list-container {
		background-color: #FFFFFF;
		border-radius: 15rpx;
		padding: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}
	
	.list-item {
		display: flex;
		align-items: center;
		padding: 30rpx 20rpx;
		border-bottom: 1px solid #EEEEEE;
	}
	
	.list-item:last-child {
		border-bottom: none;
	}
	
	.list-icon {
		width: 80rpx;
		height: 80rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 48rpx;
		color: #2E8B57;
	}
	
	.list-info {
		flex: 1;
		margin-left: 20rpx;
	}
	
	.list-name {
		font-size: 32rpx;
		color: #333333;
		margin-bottom: 10rpx;
	}
	
	.list-count {
		font-size: 26rpx;
		color: #999999;
	}
	
	.list-actions {
		display: flex;
		align-items: center;
	}
	
	.action-icon {
		margin-left: 30rpx;
		font-size: 36rpx;
		color: #666666;
	}
	
	.action-icon.delete {
		color: #FF6B6B;
	}
	
	/* 空提示 */
	.empty-tip {
		padding: 60rpx 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	
	.empty-icon {
		width: 200rpx;
		height: 200rpx;
		margin-bottom: 30rpx;
	}
	
	.empty-text {
		font-size: 32rpx;
		color: #666666;
		margin-bottom: 15rpx;
	}
	
	.tip-text {
		font-size: 28rpx;
		color: #999999;
	}
	
	/* 表单弹窗 */
	.form-modal {
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
	
	.form-item {
		margin-bottom: 30rpx;
	}
	
	.form-label {
		font-size: 30rpx;
		color: #666666;
		margin-bottom: 15rpx;
	}
	
	.form-input {
		width: 100%;
		height: 80rpx;
		border: 1px solid #EEEEEE;
		border-radius: 8rpx;
		padding: 0 20rpx;
		font-size: 28rpx;
	}
	
	.form-textarea {
		width: 100%;
		height: 200rpx;
		border: 1px solid #EEEEEE;
		border-radius: 8rpx;
		padding: 20rpx;
		font-size: 28rpx;
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
</style>