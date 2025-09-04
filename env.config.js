// 环境配置管理
const ENV_TYPE = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
};

// 当前环境配置
const CURRENT_ENV = ENV_TYPE.DEVELOPMENT;

// 静态资源路径设置
const STATIC_BASE_URLS = {
  [ENV_TYPE.DEVELOPMENT]: 'http://1.92.85.165:8888/static',
  [ENV_TYPE.PRODUCTION]: 'http://xxxx:8888/static'
};

//  静态资源路径选择
const STATIC_BASE = STATIC_BASE_URLS[CURRENT_ENV];


// 环境配置定义
const ENV_CONFIG = {
  [ENV_TYPE.DEVELOPMENT]: {
    // 开发环境配置————华为云服务：1.92.85.165
    API_BASE_URL: 'http://1.92.85.165:8088',
    DEBUG: true,
    LOG_LEVEL: 'debug'
  },


  [ENV_TYPE.PRODUCTION]: {
    // 生产环境配置
    API_BASE_URL: 'https://api.hubei-atlas.com',
    DEBUG: false,
    LOG_LEVEL: 'error'
  }
};

// 获取当前环境配置
function getCurrentEnvConfig() {
  const config = ENV_CONFIG[CURRENT_ENV];
  if (!config) {
    console.error(`Environment configuration not found for: ${CURRENT_ENV}`);
    return ENV_CONFIG[ENV_TYPE.DEVELOPMENT];
  }
  return config;
}

  // 静态资源注册
const StaticAssets = {
  BG_APP_COVER: `${STATIC_BASE}/background/app_cover.png`,
  BG_COVER: `${STATIC_BASE}/background/cover.png`,
  BG_MAIN: `${STATIC_BASE}/background/main-bg.png`,
  BG_ENTRY_CUSTOM: `${STATIC_BASE}/background/entry-custom.png`,
  BG_ENTRY_TRANSFER: `${STATIC_BASE}/background/entry-transfer.png`,
  BG_EXPLORE1: `${STATIC_BASE}/background/explore1.png`,
  BG_EXPLORE2: `${STATIC_BASE}/background/explore2.png`,
  BG_EXPLORE3: `${STATIC_BASE}/background/explore3.png`,
  BG_EXPLORE4: `${STATIC_BASE}/background/explore4.png`,
  BG_EXPLORE5: `${STATIC_BASE}/background/explore5.png`,
  BG_DOWNLOAD: `${STATIC_BASE}/background/user-download.png`,
};

// 导出配置
const envConfig = getCurrentEnvConfig();

export {
  ENV_TYPE,
  CURRENT_ENV,
  envConfig,
  STATIC_BASE_URLS,
  StaticAssets,
  getCurrentEnvConfig
};
