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
      this.userInfo = JSON.parse(userInfo);
      this.isLoggedIn = true;
      return true;
    }
    
    this.isLoggedIn = false;
    this.userInfo = null;
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
            reject(new Error('用户取消登录'));
          }
        }
      });
    });
  }

  // 微信授权登录
  showWechatLogin() {
    return new Promise((resolve, reject) => {
      // 获取用户信息授权
      uni.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          console.log('获取用户信息成功:', res.userInfo);
          
          // 获取登录凭证
          uni.login({
            success: (loginRes) => {
              if (loginRes.code) {
                // 发送到后端处理
                this.sendLoginToBackend(loginRes.code, res.userInfo)
                  .then(resolve)
                  .catch(reject);
              } else {
                reject(new Error('获取登录凭证失败'));
              }
            },
            fail: () => {
              reject(new Error('微信登录失败'));
            }
          });
        },
        fail: () => {
          reject(new Error('用户拒绝授权'));
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
      
      uni.request({
        url: 'http://192.168.50.133:8088/user/wechatLogin',
        method: 'POST',
        data: {
          openid: mockOpenid,
          nickname: userInfo.nickName,
          avatar: userInfo.avatarUrl
        },
        success: (res) => {
          uni.hideLoading();
          
          if (res.data.code === 200) {
            // 保存登录信息
            const userData = res.data.data;
            uni.setStorageSync('userId', userData.user_id);
            uni.setStorageSync('userInfo', JSON.stringify(userData));
            
            this.userInfo = userData;
            this.isLoggedIn = true;
            
            uni.showToast({
              title: '登录成功',
              icon: 'success'
            });
            
            resolve(userData);
          } else {
            reject(new Error(res.data.msg || '登录失败'));
          }
        },
        fail: (err) => {
          uni.hideLoading();
          reject(new Error('网络错误'));
        }
      });
    });
  }

  // 退出登录
  logout() {
    uni.removeStorageSync('userId');
    uni.removeStorageSync('userInfo');
    this.userInfo = null;
    this.isLoggedIn = false;
  }
}

// 创建全局实例
const authManager = new AuthManager();

export default authManager;