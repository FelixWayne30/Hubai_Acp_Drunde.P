<template>
	<view class="container">
		<!-- 图幅预览区域 -->
		<view class="preview-container">
			<image class="preview-image placeholder-image" :src="mapInfo.image" @click="backToBrowse"></image>
			<!-- 图幅标题 -->
			<view class="map-title">{{mapInfo.title}}</view>
		</view>
		
		<!-- 交互区域 -->
		<view class="interaction-bar">
			<view class="action-btn" @click="likeMap">
				<image 
					class="action-icon"
					:src="isLiked ? '/static/icons/like-active.png' : '/static/icons/like.png'"
				></image>
				<text class="count">{{likeCount}}</text>
			</view>
			
			<view class="action-btn" @click="collectMap">
				<image 
					class="action-icon" 
					:src="isCollected ? '/static/icons/collect-active.png' : '/static/icons/collect.png'"
				></image>
				<text class="count">收藏</text>
			</view>
					
			<view class="action-btn" @click="showListsModal">
				<image class="action-icon" src="/static/icons/add.png"></image>
				<text class="count">添加至</text>
			</view>
		</view>
		
		<!-- 图幅描述区域 -->
		<view class="description-section">
			<view class="section-title">图幅描述</view>
			<view class="description-content">
				{{mapInfo.description}}
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
							:key="item.list_id" 
						>
							<checkbox 
								:checked="isMapInList(item.list_id)" 
								@click="toggleListSelection(item.list_id)"
							></checkbox>
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

	</view>
</template>

<!-- 专题详情页的关键部分更新 -->
<script>
import { API } from '@/common/config.js'
import imageCache from '@/common/cache.js'

export default {
  data() {
    return {
      mapId: '',
      topicId: '',
	  subitemName: '', //地图子图名称
      //自定义列表有关
      showListsSelector: false,
      customLists: [],
      selectedLists: [],
      // 地图信息
      mapInfo: {
        id: '',
        title: '加载中...',
        image: '',
        description: '正在加载地图描述...',
        type: '',
        width: 0,
        height: 0,
        createTime: '',
        viewCount: 0,
        likeCount: 0,
        commentCount: 0
      },
      // 交互数据
      isLiked: false,
      isCollected: false,
      likeCount: 0,
      commentCount: 0,
      userId: null,
      // 评论相关
      comments: [],
      commentContent: '',
      inputFocus: false,
      // 来源页面
      fromBrowse: false
    }
  },

  onLoad(options) {
	  
   console.log('详情页接收到的参数:', options);
     this.mapId = options.id || '';
     this.topicId = options.topic_id || '';
     this.topic = options.topic ? decodeURIComponent(options.topic) : '';  
	 this.subitemName = options.subitem_name ? decodeURIComponent(options.subitem_name) : ''; 
     
     console.log('设置后的参数:', {
       mapId: this.mapId,
       topicId: this.topicId,
       topic: this.topic  ,
	   subitemName: this.subitemName  
        });
        
        if (options.from === 'browse') {
          this.fromBrowse = true;
        }
        
        if (this.mapId) {
          this.getMapDetail();
          this.getComments();
        } else {
          console.error('mapId为空，无法获取详情');
          uni.showToast({
            title: '参数错误',
            icon: 'none'
      });
    }
    
    // 获取用户ID
    const userInfo = uni.getStorageSync('userInfo');
    if (userInfo) {
      try {
        const userObj = JSON.parse(userInfo);
        this.userId = userObj.user_id;
        // 获取是否已点赞和收藏
        if(this.userId && this.mapId) {
          this.checkLikeStatus();
          this.checkCollectionStatus();
        }
      } catch (e) {
        console.error('解析用户信息失败', e);
      }
    }
  },
  onShareAppMessage(res) {

     const { title, image } = this.mapInfo;
     const shareTitle = title || '图幅详情';
     const shareImage = image || '/static/images/default-share.jpg'; 
     const sharePath = `/pages/map/detail?id=${this.mapId}${this.topicId ? `&topic_id=${this.topicId}` : ''}${this.subitemName ? `&subitem_name=${encodeURIComponent(this.subitemName)}` : ''}${this.topic ? `&topic=${encodeURIComponent(this.topic)}` : ''}`;
 
     return {
       title: shareTitle,
       path: sharePath,
       imageUrl: shareImage,
       success: () => {
         uni.showToast({
           title: '分享成功',
           icon: 'success'
         });
       },
       fail: (err) => {
         console.error('分享失败:', err);
         uni.showToast({
           title: '分享失败',
           icon: 'none'
         });
       }
     };
   },
 
   // 分享到朋友圈
   onShareTimeline() {
     const { title, image } = this.mapInfo;
     const shareTitle = title || '图幅详情';
     const shareImage = image || '/static/images/default-share.jpg';
     const query = `id=${this.mapId}${this.topicId ? `&topic_id=${this.topicId}` : ''}${this.subitemName ? `&subitem_name=${encodeURIComponent(this.subitemName)}` : ''}${this.topic ? `&topic=${encodeURIComponent(this.topic)}` : ''}`;
 
     return {
       title: shareTitle, 
       query: query,
       imageUrl: shareImage,
       success: () => {
         uni.showToast({
           title: '分享到朋友圈成功',
           icon: 'success'
         });
       },
       fail: (err) => {
         console.error('分享到朋友圈失败:', err);
         uni.showToast({
           title: '分享失败',
           icon: 'none'
         });
       }
     };
   },
  methods: {
      
	  getTopicInfo() {
	    if (!this.mapId) {
	      uni.hideLoading();
	      return;
	    }
	    
	    console.log('=== 开始获取专题信息 ===');
	    console.log('地图ID:', this.mapId);
	    
	    uni.request({
	      url: API.GET_MAP_TOPIC + this.mapId,
	      method: 'GET',
	      success: (res) => {
	        console.log('专题信息API响应:', res);
	        
	        if (res.statusCode === 200 && res.data.code === 200 && res.data.data) {
	          const topicData = res.data.data;
	          console.log('获取到专题信息:', topicData);
	          
	          // 设置专题信息
	          this.topicId = topicData.topic_id;
	          this.topic = topicData.title;
	          
	          // 设置缓存的当前专题
	          imageCache.setCurrentTopic(this.topicId);
	          
	          console.log('专题信息设置成功:', {
	            topicId: this.topicId,
	            topic: this.topic
	          });
	        } else {
	          console.log('该地图没有关联专题信息');
	        }
	      },
	      fail: (err) => {
	        console.error('获取专题信息失败:', err);
	      },
	      complete: () => {
	        uni.hideLoading();
	        console.log('=== 专题信息查询完成 ===');
	      }
	    });
	  },
	  
	  
    // 获取地图详情
    getMapDetail() {
      // 显示加载状态
      uni.showLoading({
        title: '加载中...'
      });
      
      console.log('=== 地图详情获取开始 ===');
      console.log('请求地图ID:', this.mapId);
      console.log('请求URL:', API.MAP_DETAIL + this.mapId);
      
      // 调用后端API获取地图详情
      uni.request({
        url: API.MAP_DETAIL + this.mapId,
        method: 'GET',
        success: (res) => {
          console.log('API响应成功:', res);
          if (res.statusCode === 200 && res.data.code === 200) {
            const mapData = res.data.data[0];
            console.log('原始地图数据:', mapData);
            
            if (mapData) {
              console.log('=== 开始处理详情页地图图片 ===');
              console.log('地图标题:', mapData.title);
              
              // 基于title获取或生成图片URL
              let imageUrl = imageCache.getImage(mapData.title);
              
              if (imageUrl) {
                console.log('缓存命中！使用缓存的图片:', imageUrl);
              } else {
                console.log('缓存未命中，生成新的图片URL');
                imageUrl = API.THUMBNAIL_MAP + mapData.title +".jpg";
                imageCache.setImage(mapData.title, imageUrl, mapData);
                console.log('生成的图片URL:', imageUrl);
              }
              
              // 更新地图信息
              const newMapInfo = {
                id: mapData.map_id,
                title: mapData.title,
                description: mapData.description || '暂无描述',
                image: imageUrl,
                type: mapData.type,
                width: mapData.width,
                height: mapData.height,
                createTime: mapData.create_time,
                viewCount: mapData.view_count || 0,
                likeCount: mapData.like_count || 0,
                commentCount: mapData.comment_count || 0,
                origin_topic: mapData.origin_topic 
              };
              
              this.mapInfo = newMapInfo;
              this.likeCount = mapData.like_count || 0;
              this.commentCount = mapData.comment_count || 0;
              
              console.log('=== 详情页地图图片处理完成 ===');
              
              this.$forceUpdate();
              
              // 如果没有专题信息，主动查询
              if (!this.topic && !this.topicId) {
                console.log('缺少专题信息，开始主动查询...');
                this.getTopicInfo();
              } else {
                console.log('已有专题信息，无需查询');
                uni.hideLoading();
              }
              
            } else {
              console.error('地图数据为空');
              uni.showToast({
                title: '地图数据不存在',
                icon: 'none'
              });
              uni.hideLoading();
            }
          } else {
            console.error('API返回错误:', res.data);
            uni.showToast({
              title: '获取地图详情失败',
              icon: 'none'
            });
            uni.hideLoading();
          }
        },
        fail: (err) => {
          console.error('网络请求失败:', err);
          uni.showToast({
            title: '网络错误，请稍后重试',
            icon: 'none'
          });
          uni.hideLoading();
        }
      });
    },
	
    // 获取评论列表
    getComments() {
      if (!this.mapId) return;
      
      uni.showLoading({
        title: '加载评论...'
      });
      
      uni.request({
        url: API.COMMENT_LIST,
        method: 'GET',
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 200) {
            // 筛选当前地图的评论
            const allComments = res.data.data || [];
            this.comments = allComments.filter(item => {
              return item.mapid === this.mapId && item.status === 1; // 只显示审核通过的评论
            }).map(item => {
              return {
                id: item.comment_id,
                userName: item.username || '匿名用户',
                content: item.content,
                time: item.commentTime || new Date(item.create_time).toLocaleString()
              };
            });
            
            // 更新评论计数
            this.commentCount = this.comments.length;
          } else {
            console.error('获取评论失败:', res.data);
          }
        },
        fail: (err) => {
          console.error('请求评论接口失败:', err);
        },
        complete: () => {
          uni.hideLoading();
        }
      });
    },
	
	backToBrowse() {
	  if (this.fromBrowse) {
	
	    uni.navigateBack();
	  } else {

	    if (this.topic || this.topicId) {

	      this.navigateToBrowsePage();
	    } else if (this.mapInfo && this.mapInfo.origin_topic) {
	      // 没有专题关联，但有原始专题信息，使用origin_topic
	      console.log('使用原始专题信息:', this.mapInfo.origin_topic);
	      this.topic = this.mapInfo.origin_topic;
	      this.navigateToBrowsePage();
	    } else {

	      uni.showModal({
	        title: '提示',
	        content: '该地图暂无专题分类，是否返回搜索页继续浏览？',
	        confirmText: '返回搜索',
	        cancelText: '返回首页',
	        success: (res) => {
	          if (res.confirm) {
	            uni.navigateTo({
	              url: '/pages/map/search'
	            });
	          } else {
	            uni.switchTab({
	              url: '/pages/index/index'
	            });
	          }
	        }
	      });
	    }
	  }
	},
    
    // 检查点赞状态
    checkLikeStatus() {
      if (!this.userId || !this.mapId) return;
      
      uni.request({
        url: API.LIKE_CHECK,
        method: 'GET',
        data: {
          userId: this.userId,
          mapId: this.mapId
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 200) {
            this.isLiked = res.data.data.liked;
          }
        }
      });
    },
    
    // 检查收藏状态
    checkCollectionStatus() {
      if (!this.userId || !this.mapId) return;
      
      uni.request({
        url: API.COLLECTION_CHECK,
        method: 'GET',
        data: {
          userId: this.userId,
          mapId: this.mapId
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 200) {
            this.isCollected = res.data.data.collected;
          }
        }
      });
    },
    
    // 点赞地图
    likeMap() {
      if (!this.userId) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }
      
      uni.request({
        url: API.LIKE_TOGGLE,
        method: 'POST',
        data: {
          userId: this.userId,
          mapId: this.mapId
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 200) {
            this.isLiked = res.data.data.liked;
            // 更新点赞数
            this.likeCount += this.isLiked ? 1 : -1;
            
            uni.showToast({
              title: this.isLiked ? '点赞成功' : '已取消点赞',
              icon: 'none'
            });
          }
        }
      });
    },
    
    // 收藏地图
    collectMap() {
      if (!this.userId) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }
      
      uni.request({
        url: API.COLLECTION_TOGGLE,
        method: 'POST',
        data: {
          userId: this.userId,
          mapId: this.mapId
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 200) {
            this.isCollected = res.data.data.collected;
            
            uni.showToast({
              title: this.isCollected ? '收藏成功' : '已取消收藏',
              icon: 'none'
            });
          }
        }
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
      
      // 检查用户是否登录
      if (!this.userId) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }
      
      uni.showLoading({
        title: '提交中...'
      });
      
      uni.request({
        url: API.COMMENT_ADD,
        method: 'GET', // 
        data: {
          userId: this.userId,
          mapId: this.mapId,
          comment: this.commentContent
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 200) {
            uni.showToast({
              title: '评论已提交，等待审核',
              icon: 'success'
            });
            
            // 清空评论内容
            this.commentContent = '';
            this.inputFocus = false;
            
            // 由于评论需要审核，暂不立即添加到列表,但可以显示一个临时的评论提示
            uni.showModal({
              title: '提示',
              content: '您的评论已提交，将在审核通过后显示',
              showCancel: false
            });
          } else {
            uni.showToast({
              title: '评论提交失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          console.error('评论提交失败:', err);
          uni.showToast({
            title: '网络错误，请稍后重试',
            icon: 'none'
          });
        },
        complete: () => {
          uni.hideLoading();
        }
      });
    },
    
    // 显示自定义列表选择器
    showListsModal() {
      if (!this.userId) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }
      
      // 获取用户的自定义列表
      this.fetchCustomLists();
      this.showListsSelector = true;
    },
    
    // 获取用户的自定义列表
    fetchCustomLists() {
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
              // 确保数据结构是正确的
              this.customLists = (res.data.data || []).map(list => {
                return {
                  list_id: list.list_id,
                  name: list.name,
                  description: list.description
                };
              });
              
              // 重置选择状态
              this.selectedLists = [];
              
              // 如果有列表，检查当前地图是否已在列表中
              if (this.customLists.length > 0) {
                this.checkMapInLists();
              }
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
          }
        });
      } catch (e) {
        uni.hideLoading();
        console.error('获取列表异常', e);
      }
    },
    
    // 检查地图是否已在列表中
    checkMapInLists() {
      const promises = this.customLists.map(list => {
        return new Promise((resolve) => {
          uni.request({
            url: API.CUSTOM_LIST_CHECK_MAP,
            method: 'GET',
            data: {
              listId: list.list_id,
              mapId: this.mapId
            },
            success: (res) => {
              if (res.statusCode === 200 && res.data.code === 200) {
                if (res.data.data.inList) {
                  // 如果地图在列表中，添加到已选择列表
                  this.selectedLists.push(list.list_id);
                }
              }
              resolve();
            },
            fail: () => {
              resolve();
            }
          });
        });
      });
      
      // 等待所有检查完成
      Promise.all(promises).then(() => {
        // 更新UI状态
        this.$forceUpdate();
      });
    },
    
    // 检查地图是否已在列表中
    isMapInList(listId) {
      return this.selectedLists.includes(listId);
    },

    // 切换列表选择状态
    toggleListSelection(listId) {
      console.log('Toggle list:', listId); // 调试用
      const index = this.selectedLists.indexOf(listId);
      if (index > -1) {
        this.selectedLists.splice(index, 1);
      } else {
        this.selectedLists.push(listId);
      }
      console.log('Selected lists:', this.selectedLists); // 调试用
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
      
      uni.showLoading({
        title: '添加中...'
      });
      
      // 对每个选中的列表，添加当前地图
      const promises = this.selectedLists.map(listId => {
        return new Promise((resolve) => {
          uni.request({
            url: API.CUSTOM_LIST_ADD_MAP,
            method: 'POST',
            data: {
              listId: listId,
              mapId: this.mapId,
              userId: this.userId
            },
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success: () => {
              resolve(true);
            },
            fail: () => {
              resolve(false);
            }
          });
        });
      });
      
      // 等待所有请求完成
      Promise.all(promises).then((results) => {
        uni.hideLoading();
        
        const successCount = results.filter(r => r).length;
        if (successCount > 0) {
          uni.showToast({
            title: `成功添加到${successCount}个列表`,
            icon: 'success'
          });
          this.hideListsModal();
        } else {
          uni.showToast({
            title: '添加失败',
            icon: 'none'
          });
        }
      });
    },
    
    hideListsModal() {
      console.log('隐藏列表选择器');
      this.showListsSelector = false;
      this.selectedLists = [];
    },
    
    // 显示自定义列表选择器
    showListsModal() {
      if (!this.userId) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }
      
      console.log('显示列表选择器');
      // 获取用户的自定义列表
      this.fetchCustomLists();
      this.showListsSelector = true;
    },
    
    // 跳转到创建列表页面
    navigateToCreateList() {
      this.hideListsModal();
      uni.navigateTo({
        url: '/pages/user/custom-lists'
      });
    },
    

   navigateToBrowsePage() {
     // 构建跳转URL
     let url = `/pages/map/browse?id=${this.mapId}`;
     
     // 根据可用参数添加专题信息，优先使用专题名称
     if (this.topic) {
       url += `&topic=${encodeURIComponent(this.topic)}`;
       console.log('使用专题名称跳转到浏览页:', this.topic);
     } else if (this.topicId) {
       url += `&topic_id=${this.topicId}`;
       console.log('使用专题ID跳转到浏览页:', this.topicId);
     }
	 
	  if (this.subitemName) {
	       url += `&subitem_name=${encodeURIComponent(this.subitemName)}`;
	       console.log('传递子图名称到浏览页:', this.subitemName);
	     } 
     
     console.log('跳转到浏览页URL:', url);
     
     uni.navigateTo({
       url: url
     });
   },

}}
</script>
<style>
	/* 全局绿色主题类 */
	.primary-bg {
		background-color: #7AA26F; /* 浅绿，用于按钮 */
	}
	
	.container {
		padding-bottom: 100rpx;
		background: linear-gradient(to bottom, #D9E8D9, #F5F8F5); /* 保持现有背景 */
	}
	
	/* 图幅预览区域 */
	.preview-container {
		position: relative;
		width: 100vw;
		height: 70vw;
		margin-bottom: 30rpx; /* 统一间距 */
    background-color: #f1f1f1;
	}
	
	.preview-image {
		width: 100%;
		height: 100%;
		object-fit: contain;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
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
		justify-content: space-around; /* 按钮均匀分布 */
		padding: 20rpx;
		background-color: #FFFFFF; /* 纯白背景 */
		border: 1rpx solid #D9E8D9; /* 浅绿色边框 */
		border-radius: 10rpx; /* 圆角 */
		box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05); /* 轻微阴影 */
		margin: 0 20rpx 30rpx 20rpx; /* 统一间距，左右边距 */
	}
	
	.action-btn {
		display: flex;
		flex-direction: row; /* 水平排列 */
		align-items: center;
		padding: 10rpx 15rpx; /* 紧凑内边距 */
	}
	
	.action-icon {
		width: 48rpx;
		height: 48rpx;
		margin-right: 10rpx; /* 图标与文字间距 */
	}
	
	.count {
		font-size: 24rpx;
		color: #666666;
	}
	
	/* 描述区域 */
	.description-section {
		background-color: #FFFFFF; /* 纯白背景 */
		padding: 25rpx 20rpx; /* 优化内边距 */
		margin: 0 20rpx 30rpx 20rpx; /* 统一间距，左右边距 */
		border: 1rpx solid #D9E8D9; /* 浅绿色边框 */
		border-radius: 10rpx; /* 圆角 */
		box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05); /* 轻微阴影 */
	}
	
	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
		color: #7AA26F; /* 浅绿标题 */
	}
	
	.description-content {
		font-size: 28rpx;
		color: #666666;
		line-height: 1.6;
	}
	
	/* 评论区 */
	.comment-section {
		background-color: #FFFFFF; /* 纯白背景 */
		padding: 25rpx 20rpx; /* 优化内边距 */
		margin: 0 20rpx 30rpx 20rpx; /* 统一间距，左右边距 */
		border: 1rpx solid #D9E8D9; /* 浅绿色边框 */
		border-radius: 10rpx; /* 圆角 */
		box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05); /* 轻微阴影 */
	}
	
	.comment-list {
		padding-bottom: 20rpx; /* 减少底部填充 */
	}
	
	.comment-item {
		padding: 15rpx 0; /* 优化评论项内边距 */
		border-bottom: 1rpx solid #D9E8D9; /* 浅绿色分隔线 */
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
		padding: 10rpx;
    padding-bottom: calc(25rpx + env(safe-area-inset-bottom));
		background-color: #E6F3E6;
		border-top: 1rpx solid #D9E8D9;
		display: flex;
		align-items: center;
	}
	
	.comment-input {
		flex: 1;
		height: 80rpx;
		border: 1rpx solid #D9E8D9;
		border-radius: 40rpx;
		padding: 0 20rpx;
		font-size: 28rpx;
		background-color: #F8FAF8;
		max-width: 550rpx;
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
		border: 1rpx solid #D9E8D9;
	}
	
	.modal-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #7AA26F;
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
		border-bottom: 1rpx solid #D9E8D9;
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
		background-color: #F8FAF8;
		color: #666666;
		border: 1rpx solid #D9E8D9;
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
		background-color: #FFFFFF;
		border: 2rpx solid #7AA26F;
		color: #7AA26F;
		border-radius: 50rpx;
		font-size: 28rpx;
		z-index: 99;
		box-shadow: 0 4rpx 12rpx rgba(122, 162, 111, 0.2);
	}
</style>