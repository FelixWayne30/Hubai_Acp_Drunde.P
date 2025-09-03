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
  CS_FONT:  `${STATIC_BASE}/css/font.css`,
  ICON_ADD: `${STATIC_BASE}/icons/add.png`,
  ICON_ARROW: `${STATIC_BASE}/icons/arrow.svg`,
  ICON_ARROW_ACTIVE: `${STATIC_BASE}/icons/arrow-active.svg`,
  ICON_CATALOG: `${STATIC_BASE}/icons/catalog.png`,
  ICON_CATALOG_ACTIVE: `${STATIC_BASE}/icons/catalog-active.png`,
  ICON_COLLECT: `${STATIC_BASE}/icons/collect.png`,
  ICON_COLLECT_ACTIVE: `${STATIC_BASE}/icons/collect-active.png`,
  ICON_DOWNLOAD: `${STATIC_BASE}/icons/download.png`,
  ICON_DUOBIANXING: `${STATIC_BASE}/icons/duobianxing.svg`,
  ICON_EXPLORE: `${STATIC_BASE}/icons/explore.png`,
  ICON_EXPLORE_ACTIVE: `${STATIC_BASE}/icons/explore-active.png`,
  ICON_HOME: `${STATIC_BASE}/icons/home.png`,
  ICON_HOME_ACTIVE: `${STATIC_BASE}/icons/home-active.png`,
  ICON_INFO: `${STATIC_BASE}/icons/info.svg`,
  ICON_JUXING: `${STATIC_BASE}/icons/juxing.svg`,
  ICON_LIKE: `${STATIC_BASE}/icons/like.png`,
  ICON_LIKE_ACTIVE: `${STATIC_BASE}/icons/like-active.png`,
  ICON_PAINT: `${STATIC_BASE}/icons/paint.svg`,
  ICON_QIANBI: `${STATIC_BASE}/icons/qianbi.svg`,
  ICON_QINGCHU: `${STATIC_BASE}/icons/qingchu.svg`,
  ICON_RESET: `${STATIC_BASE}/icons/reset.svg`,
  ICON_ROTATE: `${STATIC_BASE}/icons/rotate.svg`,
  ICON_SEARCH: `${STATIC_BASE}/icons/search.png`,
  ICON_SHARE: `${STATIC_BASE}/icons/share.svg`,
  ICON_USER: `${STATIC_BASE}/icons/user.png`,
  ICON_USER_ACTIVE: `${STATIC_BASE}/icons/user-active.png`,
  ICON_YUANXING: `${STATIC_BASE}/icons/yuanxing.svg`,
  ICON_ZHEXIAN: `${STATIC_BASE}/icons/zhexian.svg`
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
