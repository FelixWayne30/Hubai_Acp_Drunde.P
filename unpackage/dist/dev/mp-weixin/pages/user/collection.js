"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      // 收藏列表（示例数据）
      collections: [
        {
          id: "1",
          title: "湖北省地质图",
          image: "/static/placeholder.png",
          time: "2025-04-05 10:23",
          selected: false
        },
        {
          id: "2",
          title: "湖北省水域图",
          image: "/static/placeholder.png",
          time: "2025-04-03 16:45",
          selected: false
        },
        {
          id: "3",
          title: "湖北省土地利用图",
          image: "/static/placeholder.png",
          time: "2025-04-01 09:12",
          selected: false
        },
        {
          id: "4",
          title: "湖北省矿产分布图",
          image: "/static/placeholder.png",
          time: "2025-03-28 14:37",
          selected: false
        },
        {
          id: "5",
          title: "湖北省自然保护区分布图",
          image: "/static/placeholder.png",
          time: "2025-03-25 20:18",
          selected: false
        }
      ],
      // 批量操作模式
      batchMode: false,
      allSelected: false
    };
  },
  onLoad() {
    this.getCollections();
  },
  methods: {
    // 获取收藏列表
    getCollections() {
      common_vendor.index.__f__("log", "at pages/user/collection.vue:104", "获取收藏列表");
    },
    // 查看地图详情
    viewMap(item) {
      if (this.batchMode) {
        this.toggleSelect(this.collections.findIndex((c) => c.id === item.id));
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/map/detail?id=${item.id}`
      });
    },
    // 取消收藏
    uncollectMap(id, index) {
      common_vendor.index.showModal({
        title: "提示",
        content: "确认取消收藏该地图？",
        success: (res) => {
          if (res.confirm) {
            this.collections.splice(index, 1);
            common_vendor.index.showToast({
              title: "已取消收藏",
              icon: "success"
            });
          }
        }
      });
    },
    // 进入批量操作模式
    enterBatchMode() {
      this.batchMode = true;
      this.allSelected = false;
      this.collections.forEach((item) => {
        item.selected = false;
      });
    },
    // 切换选择状态
    toggleSelect(index) {
      this.collections[index].selected = !this.collections[index].selected;
      this.updateAllSelectedState();
    },
    // 更新全选状态
    updateAllSelectedState() {
      this.allSelected = this.collections.every((item) => item.selected);
    },
    // 切换全选
    toggleSelectAll() {
      this.allSelected = !this.allSelected;
      this.collections.forEach((item) => {
        item.selected = this.allSelected;
      });
    },
    // 删除选中项
    deleteSelected() {
      const selectedIds = this.collections.filter((item) => item.selected).map((item) => item.id);
      if (selectedIds.length === 0) {
        common_vendor.index.showToast({
          title: "请选择要删除的项",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showModal({
        title: "提示",
        content: `确认删除${selectedIds.length}项收藏？`,
        success: (res) => {
          if (res.confirm) {
            this.collections = this.collections.filter((item) => !item.selected);
            this.batchMode = false;
            common_vendor.index.showToast({
              title: "删除成功",
              icon: "success"
            });
          }
        }
      });
    },
    // 导航到首页
    navigateToHome() {
      common_vendor.index.switchTab({
        url: "/pages/index/index"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.batchMode
  }, $data.batchMode ? {
    b: common_vendor.t($data.allSelected ? "取消全选" : "全选"),
    c: $data.allSelected ? 1 : "",
    d: common_vendor.o((...args) => $options.toggleSelectAll && $options.toggleSelectAll(...args)),
    e: common_vendor.o((...args) => $options.deleteSelected && $options.deleteSelected(...args))
  } : {}, {
    f: $data.collections.length > 0
  }, $data.collections.length > 0 ? {
    g: common_vendor.f($data.collections, (item, index, i0) => {
      return common_vendor.e($data.batchMode ? {
        a: common_vendor.t(item.selected ? "✓" : ""),
        b: item.selected ? 1 : "",
        c: common_vendor.o(($event) => $options.toggleSelect(index), index)
      } : {}, {
        d: item.image,
        e: common_vendor.t(item.title),
        f: common_vendor.t(item.time),
        g: common_vendor.o(($event) => $options.uncollectMap(item.id, index), index),
        h: index,
        i: common_vendor.o(($event) => $options.viewMap(item), index),
        j: common_vendor.o((...args) => $options.enterBatchMode && $options.enterBatchMode(...args), index)
      });
    }),
    h: $data.batchMode
  } : {
    i: common_assets._imports_0,
    j: common_vendor.o((...args) => $options.navigateToHome && $options.navigateToHome(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/collection.js.map
