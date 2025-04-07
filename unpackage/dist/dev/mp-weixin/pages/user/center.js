"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      // 用户信息（示例数据）
      userInfo: {
        nickName: "地图爱好者",
        avatar: ""
      },
      // 编辑昵称
      showEditModal: false,
      newNickname: ""
    };
  },
  onLoad() {
    this.getUserInfo();
  },
  methods: {
    // 获取用户信息
    getUserInfo() {
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      if (userInfo) {
        this.userInfo = JSON.parse(userInfo);
      } else {
        this.userInfo = {
          nickName: "点击登录",
          avatar: ""
        };
      }
    },
    // 上传头像
    uploadAvatar() {
      if (!this.checkLogin())
        return;
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          this.userInfo.avatar = tempFilePath;
          common_vendor.index.setStorageSync("userInfo", JSON.stringify(this.userInfo));
        }
      });
    },
    // 编辑昵称
    editNickname() {
      if (!this.checkLogin())
        return;
      this.newNickname = this.userInfo.nickName;
      this.showEditModal = true;
    },
    // 取消编辑
    cancelEdit() {
      this.showEditModal = false;
      this.newNickname = "";
    },
    // 保存昵称
    saveNickname() {
      if (!this.newNickname.trim()) {
        common_vendor.index.showToast({
          title: "昵称不能为空",
          icon: "none"
        });
        return;
      }
      this.userInfo.nickName = this.newNickname;
      common_vendor.index.setStorageSync("userInfo", JSON.stringify(this.userInfo));
      this.showEditModal = false;
      common_vendor.index.showToast({
        title: "修改成功",
        icon: "success"
      });
    },
    // 检查是否已登录
    checkLogin() {
      if (this.userInfo.nickName === "点击登录") {
        common_vendor.index.showModal({
          title: "提示",
          content: "请先登录",
          showCancel: false
        });
        this.userInfo = {
          nickName: "地图爱好者",
          avatar: ""
        };
        common_vendor.index.setStorageSync("userInfo", JSON.stringify(this.userInfo));
        return true;
      }
      return true;
    },
    // 导航到收藏页面
    navigateToCollection() {
      if (!this.checkLogin())
        return;
      common_vendor.index.__f__("log", "at pages/user/center.vue:205", "正在导航到收藏页面");
      setTimeout(() => {
        common_vendor.index.navigateTo({
          url: "/pages/user/collection",
          fail: (err) => {
            common_vendor.index.__f__("error", "at pages/user/center.vue:211", "导航失败:", err);
            common_vendor.wx$1.navigateTo({
              url: "/pages/user/collection"
            });
          }
        });
      }, 100);
    },
    // 导航到下载记录
    navigateToDownloads() {
      if (!this.checkLogin())
        return;
      common_vendor.index.navigateTo({
        url: "/pages/user/downloads"
      });
    },
    // 导航到反馈页面
    navigateToFeedback() {
      common_vendor.index.navigateTo({
        url: "/pages/user/feedback"
      });
    },
    // 显示关于我们
    showAbout() {
      common_vendor.index.showModal({
        title: "关于我们",
        content: "《湖北省自然资源地图集》小程序由湖北省自然资源厅与远图实验室提供支持。版本：0.0.0",
        showCancel: false
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.userInfo.avatar || "/static/avatar-placeholder.png",
    b: common_vendor.o((...args) => $options.uploadAvatar && $options.uploadAvatar(...args)),
    c: common_vendor.t($data.userInfo.nickName || "点击登录"),
    d: common_vendor.o((...args) => $options.editNickname && $options.editNickname(...args)),
    e: common_vendor.o((...args) => $options.navigateToCollection && $options.navigateToCollection(...args)),
    f: common_vendor.o((...args) => $options.navigateToDownloads && $options.navigateToDownloads(...args)),
    g: common_vendor.o((...args) => $options.navigateToFeedback && $options.navigateToFeedback(...args)),
    h: common_vendor.o((...args) => $options.showAbout && $options.showAbout(...args)),
    i: $data.showEditModal
  }, $data.showEditModal ? {
    j: $data.newNickname,
    k: common_vendor.o(($event) => $data.newNickname = $event.detail.value),
    l: common_vendor.o((...args) => $options.cancelEdit && $options.cancelEdit(...args)),
    m: common_vendor.o((...args) => $options.saveNickname && $options.saveNickname(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/center.js.map
