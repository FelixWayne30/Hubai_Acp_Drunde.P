"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      mapId: "",
      // 地图信息（示例数据）
      mapInfo: {
        id: "",
        title: "湖北省地质图",
        image: "/static/placeholder.png",
        description: "展示湖北省地质结构分布"
      },
      // 交互数据
      isLiked: false,
      isCollected: false,
      likeCount: 123,
      commentCount: 5,
      // 评论相关
      comments: [
        {
          id: "1",
          userName: "地图爱好者",
          content: "这张地图非常详细，对我的研究很有帮助！",
          time: "2025-04-05 10:23"
        },
        {
          id: "2",
          userName: "资源研究员",
          content: "色彩搭配很合理，易于识别不同地质类型。",
          time: "2025-04-03 16:45"
        },
        {
          id: "3",
          userName: "湖北游客",
          content: "终于找到了家乡的详细地质信息，感谢提供！",
          time: "2025-04-01 09:12"
        },
        {
          id: "4",
          userName: "地理老师",
          content: "已经下载用于教学，学生们都很喜欢这个地图。",
          time: "2025-03-28 14:37"
        },
        {
          id: "5",
          userName: "自然爱好者",
          content: "图例清晰，内容全面，非常专业的一份地图。",
          time: "2025-03-25 20:18"
        }
      ],
      commentContent: "",
      inputFocus: false,
      // 全屏预览
      showFullscreenPreview: false,
      fullscreenScale: 1,
      fullscreenTranslateX: 0,
      fullscreenTranslateY: 0,
      // 触摸事件相关变量
      lastTouchDistance: 0,
      lastTouchX: 0,
      lastTouchY: 0
    };
  },
  onLoad(options) {
    this.mapId = options.id || "";
    this.getMapDetail();
  },
  onShareAppMessage() {
    return {
      title: this.mapInfo.title,
      path: `/pages/map/detail?id=${this.mapId}`
    };
  },
  methods: {
    // 获取地图详情
    getMapDetail() {
      common_vendor.index.__f__("log", "at pages/map/detail.vue:154", "获取地图详情，地图ID:", this.mapId);
      this.mapInfo.id = this.mapId;
    },
    // 获取评论列表
    getComments() {
      common_vendor.index.__f__("log", "at pages/map/detail.vue:175", "获取评论列表，地图ID:", this.mapId);
    },
    // 点赞地图
    likeMap() {
      this.isLiked = !this.isLiked;
      this.likeCount += this.isLiked ? 1 : -1;
    },
    // 收藏地图
    collectMap() {
      this.isCollected = !this.isCollected;
      common_vendor.index.showToast({
        title: this.isCollected ? "已收藏" : "已取消收藏",
        icon: "none"
      });
    },
    // 聚焦评论输入框
    focusCommentInput() {
      this.inputFocus = true;
    },
    // 提交评论
    submitComment() {
      if (!this.commentContent.trim()) {
        common_vendor.index.showToast({
          title: "评论内容不能为空",
          icon: "none"
        });
        return;
      }
      this.commentContent = "";
      this.inputFocus = false;
      common_vendor.index.showToast({
        title: "评论提交成功，待审核",
        icon: "none"
      });
    },
    // 显示全屏预览
    showFullscreen() {
      this.showFullscreenPreview = true;
      this.fullscreenScale = 1;
      this.fullscreenTranslateX = 0;
      this.fullscreenTranslateY = 0;
    },
    // 隐藏全屏预览
    hideFullscreen() {
      this.showFullscreenPreview = false;
    },
    // 以下三个方法处理全屏模式下的缩放和平移
    handleFullscreenTouchStart(e) {
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
    handleFullscreenTouchMove(e) {
      const touches = e.touches;
      if (touches.length === 2) {
        const touch1 = touches[0];
        const touch2 = touches[1];
        const currentDistance = Math.sqrt(
          Math.pow(touch2.pageX - touch1.pageX, 2) + Math.pow(touch2.pageY - touch1.pageY, 2)
        );
        if (this.lastTouchDistance > 0) {
          let newScale = this.fullscreenScale * (currentDistance / this.lastTouchDistance);
          newScale = Math.max(1, Math.min(5, newScale));
          this.fullscreenScale = newScale;
        }
        this.lastTouchDistance = currentDistance;
      } else if (touches.length === 1 && this.fullscreenScale > 1) {
        const currentX = touches[0].pageX;
        const currentY = touches[0].pageY;
        this.fullscreenTranslateX += (currentX - this.lastTouchX) / this.fullscreenScale;
        this.fullscreenTranslateY += (currentY - this.lastTouchY) / this.fullscreenScale;
        this.lastTouchX = currentX;
        this.lastTouchY = currentY;
      }
    },
    handleFullscreenTouchEnd() {
      this.lastTouchDistance = 0;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.mapInfo.image,
    b: common_vendor.t($data.mapInfo.title),
    c: common_vendor.o((...args) => $options.showFullscreen && $options.showFullscreen(...args)),
    d: $data.isLiked ? 1 : "",
    e: common_vendor.t($data.likeCount),
    f: common_vendor.o((...args) => $options.likeMap && $options.likeMap(...args)),
    g: $data.isCollected ? 1 : "",
    h: common_vendor.o((...args) => $options.collectMap && $options.collectMap(...args)),
    i: common_vendor.t($data.commentCount),
    j: common_vendor.o((...args) => $options.focusCommentInput && $options.focusCommentInput(...args)),
    k: $data.comments.length > 0
  }, $data.comments.length > 0 ? {
    l: common_vendor.f($data.comments, (item, index, i0) => {
      return {
        a: common_vendor.t(item.userName),
        b: common_vendor.t(item.content),
        c: common_vendor.t(item.time),
        d: index
      };
    })
  } : {}, {
    m: $data.inputFocus,
    n: common_vendor.o((...args) => $options.submitComment && $options.submitComment(...args)),
    o: $data.commentContent,
    p: common_vendor.o(($event) => $data.commentContent = $event.detail.value),
    q: common_vendor.o((...args) => $options.submitComment && $options.submitComment(...args)),
    r: $data.showFullscreenPreview
  }, $data.showFullscreenPreview ? {
    s: $data.mapInfo.image,
    t: `scale(${$data.fullscreenScale}) translate(${$data.fullscreenTranslateX}px, ${$data.fullscreenTranslateY}px)`,
    v: common_vendor.o((...args) => $options.handleFullscreenTouchStart && $options.handleFullscreenTouchStart(...args)),
    w: common_vendor.o((...args) => $options.handleFullscreenTouchMove && $options.handleFullscreenTouchMove(...args)),
    x: common_vendor.o((...args) => $options.handleFullscreenTouchEnd && $options.handleFullscreenTouchEnd(...args)),
    y: common_vendor.o((...args) => $options.hideFullscreen && $options.hideFullscreen(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/map/detail.js.map
