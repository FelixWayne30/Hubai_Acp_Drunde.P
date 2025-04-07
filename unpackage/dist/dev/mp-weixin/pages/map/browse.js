"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      topicId: "",
      topicTitle: "地质资源",
      currentIndex: 0,
      // 图幅数据（示例数据）
      maps: [
        {
          id: "1",
          title: "湖北省地质图",
          image: "/static/placeholder.png"
        },
        {
          id: "2",
          title: "湖北省矿产分布图",
          image: "/static/placeholder.png"
        },
        {
          id: "3",
          title: "湖北省地貌类型图",
          image: "/static/placeholder.png"
        }
      ],
      // 图片缩放和平移状态
      scale: 1,
      translateX: 0,
      translateY: 0,
      // 触摸事件相关变量
      lastTouchDistance: 0,
      lastTouchX: 0,
      lastTouchY: 0,
      // 下载申请表单
      showModal: false,
      downloadReason: "",
      userEmail: ""
    };
  },
  computed: {
    currentMap() {
      return this.maps[this.currentIndex] || {};
    }
  },
  onLoad(options) {
    this.topicId = options.topic_id || "";
    this.getMaps();
  },
  methods: {
    // 获取当前专题的所有图幅
    getMaps() {
      common_vendor.index.__f__("log", "at pages/map/browse.vue:130", "获取图幅列表，专题ID:", this.topicId);
    },
    // 上一张图
    prevMap() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.resetMapView();
      }
    },
    // 下一张图
    nextMap() {
      if (this.currentIndex < this.maps.length - 1) {
        this.currentIndex++;
        this.resetMapView();
      }
    },
    // 重置图片视图
    resetMapView() {
      this.scale = 1;
      this.translateX = 0;
      this.translateY = 0;
    },
    // 查看地图详情
    viewMapDetail() {
      if (this.scale !== 1 || this.translateX !== 0 || this.translateY !== 0) {
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/map/detail?id=${this.currentMap.id}`
      });
    },
    // 处理触摸开始事件
    handleTouchStart(e) {
      const touches = e.touches;
      if (touches.length === 2) {
        const touch1 = touches[0];
        const touch2 = touches[1];
        this.lastTouchDistance = Math.sqrt(
          Math.pow(touch2.pageX - touch1.pageX, 2) + Math.pow(touch2.pageY - touch1.pageY, 2)
        );
      } else if (touches.length === 1) {
        this.lastTouchX = touches[0].pageX;
        this.lastTouchY = touches[0].pageY;
      }
    },
    // 处理触摸移动事件
    handleTouchMove(e) {
      const touches = e.touches;
      if (touches.length === 2) {
        const touch1 = touches[0];
        const touch2 = touches[1];
        const currentDistance = Math.sqrt(
          Math.pow(touch2.pageX - touch1.pageX, 2) + Math.pow(touch2.pageY - touch1.pageY, 2)
        );
        if (this.lastTouchDistance > 0) {
          let newScale = this.scale * (currentDistance / this.lastTouchDistance);
          newScale = Math.max(1, Math.min(3, newScale));
          this.scale = newScale;
        }
        this.lastTouchDistance = currentDistance;
      } else if (touches.length === 1 && this.scale > 1) {
        const currentX = touches[0].pageX;
        const currentY = touches[0].pageY;
        this.translateX += (currentX - this.lastTouchX) / this.scale;
        this.translateY += (currentY - this.lastTouchY) / this.scale;
        this.lastTouchX = currentX;
        this.lastTouchY = currentY;
      }
    },
    // 处理触摸结束事件
    handleTouchEnd() {
      this.lastTouchDistance = 0;
    },
    // 显示下载申请表单
    showDownloadForm() {
      this.showModal = true;
      this.downloadReason = "";
      this.userEmail = "";
    },
    // 隐藏下载申请表单
    hideDownloadForm() {
      this.showModal = false;
    },
    // 提交下载申请
    submitDownloadRequest() {
      if (!this.userEmail.trim()) {
        common_vendor.index.showToast({
          title: "请输入邮箱地址",
          icon: "none"
        });
        return;
      }
      const emailRegex = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;
      if (!emailRegex.test(this.userEmail)) {
        common_vendor.index.showToast({
          title: "请输入有效的邮箱地址",
          icon: "none"
        });
        return;
      }
      if (!this.downloadReason.trim()) {
        common_vendor.index.showToast({
          title: "请输入申请理由",
          icon: "none"
        });
        return;
      }
      this.hideDownloadForm();
      common_vendor.index.showToast({
        title: "申请已提交",
        icon: "success"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $options.currentMap.image,
    b: `scale(${$data.scale}) translate(${$data.translateX}px, ${$data.translateY}px)`,
    c: common_vendor.o((...args) => $options.handleTouchStart && $options.handleTouchStart(...args)),
    d: common_vendor.o((...args) => $options.handleTouchMove && $options.handleTouchMove(...args)),
    e: common_vendor.o((...args) => $options.handleTouchEnd && $options.handleTouchEnd(...args)),
    f: common_vendor.o((...args) => $options.viewMapDetail && $options.viewMapDetail(...args)),
    g: common_vendor.o((...args) => $options.resetMapView && $options.resetMapView(...args)),
    h: common_vendor.o((...args) => $options.viewMapDetail && $options.viewMapDetail(...args)),
    i: $data.currentIndex <= 0,
    j: common_vendor.o((...args) => $options.prevMap && $options.prevMap(...args)),
    k: $data.currentIndex >= $data.maps.length - 1,
    l: common_vendor.o((...args) => $options.nextMap && $options.nextMap(...args)),
    m: common_vendor.o((...args) => $options.showDownloadForm && $options.showDownloadForm(...args)),
    n: $data.showModal
  }, $data.showModal ? {
    o: $data.userEmail,
    p: common_vendor.o(($event) => $data.userEmail = $event.detail.value),
    q: $data.downloadReason,
    r: common_vendor.o(($event) => $data.downloadReason = $event.detail.value),
    s: common_vendor.t($data.downloadReason.length),
    t: common_vendor.o((...args) => $options.hideDownloadForm && $options.hideDownloadForm(...args)),
    v: common_vendor.o((...args) => $options.submitDownloadRequest && $options.submitDownloadRequest(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/map/browse.js.map
