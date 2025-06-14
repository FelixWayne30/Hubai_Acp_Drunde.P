const IMAGE_BASE_URL = 'http://1.92.85.165:8088/image/';
const AUTH_HEADER = 'Telecarto@501502511';

export function generateImageUrl(title) {
  console.log('=== 生成图片URL ===');
  console.log('参数 - title:', title);
  
  if (!title) {
    console.warn('title为空，返回默认占位图');
    return '/static/placeholder.png';
  }
  
  const finalUrl = `${IMAGE_BASE_URL}${title}.jpg`;
  console.log('生成的图片URL:', finalUrl);
  
  return finalUrl;
}

export function loadImageWithAuth(imageUrl) {
  return new Promise((resolve, reject) => {
    console.log('开始下载图片:', imageUrl);
    
    uni.downloadFile({
      url: imageUrl,
      header: {
        'Authorization': AUTH_HEADER
      },
      success: (res) => {
        console.log('图片下载响应状态:', res.statusCode);
        if (res.statusCode === 200) {
          console.log('图片下载成功，临时路径:', res.tempFilePath);
          resolve(res.tempFilePath);
        } else {
          const error = new Error(`下载失败，状态码: ${res.statusCode}`);
          console.error('图片下载失败:', error);
          reject(error);
        }
      },
      fail: (err) => {
        console.error('图片下载网络错误:', err);
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