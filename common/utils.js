const IMAGE_BASE_URL = 'http://1.92.85.165:8088/image/';
const SUBIMAGE_BASE_URL = 'http://1.92.85.165:8088/subimage/'; // 新增缩略图基础URL
const AUTH_HEADER = 'Telecarto@501502511';

// 生成原图URL（用于浏览页等需要高清图的场景）
export function generateImageUrl(title) {
  console.log('=== 生成原图URL ===');
  console.log('参数 - title:', title);
  
  if (!title) {
    console.warn('title为空，返回默认占位图');
    return '/static/placeholder.png';
  }
  
  const finalUrl = `${IMAGE_BASE_URL}${title}.jpg`;
  console.log('生成的原图URL:', finalUrl);
  
  return finalUrl;
}

// 生成缩略图URL（用于列表页等需要快速加载的场景）
export function generateSubimageUrl(title) {
  console.log('=== 生成缩略图URL ===');
  console.log('参数 - title:', title);
  
  if (!title) {
    console.warn('title为空，返回默认占位图');
    return '/static/placeholder.png';
  }
  
  const finalUrl = `${SUBIMAGE_BASE_URL}${title}.jpg`;
  console.log('生成的缩略图URL:', finalUrl);
  
  return finalUrl;
}

// 原图加载函数（保持不变）
export function loadImageWithAuth(imageUrl) {
  return new Promise((resolve, reject) => {
    console.log('开始下载原图:', imageUrl);
    
    uni.downloadFile({
      url: imageUrl,
      header: {
        'Authorization': AUTH_HEADER
      },
      success: (res) => {
        console.log('原图下载响应状态:', res.statusCode);
        if (res.statusCode === 200) {
          console.log('原图下载成功，临时路径:', res.tempFilePath);
          resolve(res.tempFilePath);
        } else {
          const error = new Error(`下载失败，状态码: ${res.statusCode}`);
          console.error('原图下载失败:', error);
          reject(error);
        }
      },
      fail: (err) => {
        console.error('原图下载网络错误:', err);
        reject(err);
      }
    });
  });
}

// 缩略图加载函数
export function loadSubimageWithAuth(subimageUrl) {
  return new Promise((resolve, reject) => {
    console.log('开始下载缩略图:', subimageUrl);
    
    uni.downloadFile({
      url: subimageUrl,
      header: {
        'Authorization': AUTH_HEADER
      },
      success: (res) => {
        console.log('缩略图下载响应状态:', res.statusCode);
        if (res.statusCode === 200) {
          console.log('缩略图下载成功，临时路径:', res.tempFilePath);
          resolve(res.tempFilePath);
        } else {
          const error = new Error(`缩略图下载失败，状态码: ${res.statusCode}`);
          console.error('缩略图下载失败:', error);
          reject(error);
        }
      },
      fail: (err) => {
        console.error('缩略图下载网络错误:', err);
        reject(err);
      }
    });
  });
}

export function getAuthHeader() {
  return {
    'Authorization': AUTH_HEADER
  };
}