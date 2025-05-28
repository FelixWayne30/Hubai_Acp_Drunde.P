// common/auth.js - 登录状态管理
import { API, debugLog, errorLog } from '@/common/config.js';

// 登录状态管理
class AuthManager {
  constructor() {
    this.userInfo = null;
    this.isLoggedIn = false;
  }

  // 检查登录状态
  checkLoginStatus() {
    const userId = uni.getStorageSync('userId');
    const userInfo = uni.getStorageSync('userInfo');
    
    if (userId && userInfo) {
      try {
        this.userInfo = JSON.parse(userInfo);
        this.isLoggedIn = true;
        debugLog('用户已登录', this.userInfo);
        return true;
      } catch (e) {
        errorLog('解析用户信息失败', e);
        // 清除损坏的数据
        this.logout();
        return false;
      }
    }
    
    this.isLoggedIn = false;
    this.userInfo = null;
    debugLog('用户未登录');
    return false;
  }

  // 获取用户信息
  getUserInfo() {
    if (!this.checkLoginStatus()) {
      return null;
    }
    return this.userInfo;
  }

  // 需要登录时的处理
  requireLogin() {
    return new Promise((resolve, reject) => {
      if (this.checkLoginStatus()) {
        resolve(this.userInfo);
        return;
      }

      // 弹出登录确认
      uni.showModal({
        title: '需要登录',
        content: '该功能需要登录后使用，是否立即登录？',
        success: (res) => {
          if (res.confirm) {
            this.showWechatLogin().then(resolve).catch(reject);
          } else {
            const cancelError = new Error('用户取消登录');
            debugLog('用户取消登录操作');
            reject(cancelError);
          }
        },
        fail: (err) => {
          const modalError = new Error('显示登录对话框失败');
          errorLog('显示登录对话框失败', err);
          reject(modalError);
        }
      });
    });
  }

  // 微信授权登录
  showWechatLogin() {
    return new Promise((resolve, reject) => {
      debugLog('开始微信授权登录流程');
      
      // 获取用户信息授权
      uni.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          debugLog('获取用户信息成功', {
            nickName: res.userInfo.nickName,
            avatarUrl: res.userInfo.avatarUrl
          });
          
          // 获取登录凭证
          uni.login({
            success: (loginRes) => {
              if (loginRes.code) {
                debugLog('获取微信登录凭证成功', { code: loginRes.code });
                // 发送到后端处理
                this.sendLoginToBackend(loginRes.code, res.userInfo)
                  .then(resolve)
                  .catch(reject);
              } else {
                const error = new Error('获取登录凭证失败');
                errorLog('微信登录失败 - 无法获取code', loginRes);
                reject(error);
              }
            },
            fail: (error) => {
              const authError = new Error('微信登录失败');
              errorLog('微信登录失败', error);
              reject(authError);
            }
          });
        },
        fail: (error) => {
          const authError = new Error('用户拒绝授权');
          errorLog('用户拒绝授权', error);
          reject(authError);
        }
      });
    });
  }

  // 发送登录信息到后端
  sendLoginToBackend(code, userInfo) {
    return new Promise((resolve, reject) => {
      uni.showLoading({ title: '登录中...' });
      
      // 这里需要先通过code获取openid（通常在后端处理）
      // 暂时模拟处理
      const mockOpenid = 'mock_openid_' + Date.now();
      
      const loginData = {
        openid: mockOpenid,
        nickname: userInfo.nickName,
        avatar: userInfo.avatarUrl,
        code: code
      };
      
      debugLog('发送登录请求到后端', {
        url: API.USER_LOGIN,
        data: { ...loginData, code: '***' } // 隐藏敏感信息
      });
      
      uni.request({
        url: API.USER_LOGIN,
        method: 'POST',
        data: loginData,
        header: {
          'content-type': 'application/json'
        },
        success: (res) => {
          uni.hideLoading();
          
          debugLog('后端登录响应', {
            statusCode: res.statusCode,
            code: res.data?.code,
            hasData: !!res.data?.data
          });
          
          if (res.statusCode === 200 && res.data.code === 200) {
            // 保存登录信息
            const userData = res.data.data;
            
            try {
              uni.setStorageSync('userId', userData.user_id);
              uni.setStorageSync('userInfo', JSON.stringify(userData));
              
              this.userInfo = userData;
              this.isLoggedIn = true;
              
              debugLog('登录信息保存成功', {
                userId: userData.user_id,
                nickname: userData.nickname
              });
              
              uni.showToast({
                title: '登录成功',
                icon: 'success'
              });
              
              resolve(userData);
            } catch (storageError) {
              errorLog('保存登录信息失败', storageError);
              reject(new Error('保存登录信息失败'));
            }
          } else {
            const error = new Error(res.data?.msg || '登录失败');
            errorLog('后端登录失败', {
              statusCode: res.statusCode,
              response: res.data
            });
            
            uni.showToast({
              title: error.message,
              icon: 'none'
            });
            
            reject(error);
          }
        },
        fail: (err) => {
          uni.hideLoading();
          const error = new Error('网络错误，请检查网络连接');
          errorLog('登录网络请求失败', {
            url: API.USER_LOGIN,
            error: err
          });
          
          uni.showToast({
            title: '网络错误，请稍后重试',
            icon: 'none'
          });
          
          reject(error);
        }
      });
    });
  }

  // 退出登录
  logout() {
    debugLog('用户执行退出登录操作');
    
    try {
      uni.removeStorageSync('userId');
      uni.removeStorageSync('userInfo');
      this.userInfo = null;
      this.isLoggedIn = false;
      
      debugLog('退出登录成功');
      
      // 可以在这里添加退出登录的后端通知
      // this.notifyLogoutToBackend();
      
    } catch (error) {
      errorLog('清除本地登录信息失败', error);
    }
  }

  // 更新用户信息
  updateUserInfo(newUserInfo) {
    if (!this.isLoggedIn) {
      errorLog('用户未登录，无法更新用户信息');
      return false;
    }
    
    try {
      // 合并新的用户信息
      const updatedInfo = { ...this.userInfo, ...newUserInfo };
      
      // 保存到本地存储
      uni.setStorageSync('userInfo', JSON.stringify(updatedInfo));
      this.userInfo = updatedInfo;
      
      debugLog('用户信息更新成功', newUserInfo);
      return true;
    } catch (error) {
      errorLog('更新用户信息失败', error);
      return false;
    }
  }

  // 检查token是否有效（如果后端使用token机制）
  async checkTokenValidity() {
    if (!this.isLoggedIn) {
      return false;
    }
    
    // 这里可以添加token验证逻辑
    // 现在只是简单的本地状态检查
    return this.checkLoginStatus();
  }

  // 获取用户ID
  getUserId() {
    return this.isLoggedIn ? this.userInfo?.user_id : null;
  }

  // 获取用户昵称
  getUserNickname() {
    return this.isLoggedIn ? this.userInfo?.nickname : '未登录';
  }

  // 获取用户头像
  getUserAvatar() {
    return this.isLoggedIn ? this.userInfo?.avatar : '';
  }
}

// 创建全局实例
const authManager = new AuthManager();

export default authManager;