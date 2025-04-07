"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      // 轮播图数据（示例数据）
      bannerList: [
        {
          id: "1",
          title: "湖北省地质资源概览",
          image: "/static/placeholder.png"
        },
        {
          id: "2",
          title: "湖北省水资源分布",
          image: "/static/placeholder.png"
        },
        {
          id: "3",
          title: "湖北省土地利用现状",
          image: "/static/placeholder.png"
        }
      ],
      // 专题列表数据（示例数据）
      topicList: [
        {
          id: "1",
          title: "地质资源",
          image: "/static/placeholder.png"
        },
        {
          id: "2",
          title: "水资源",
          image: "/static/placeholder.png"
        },
        {
          id: "3",
          title: "土地资源",
          image: "/static/placeholder.png"
        },
        {
          id: "4",
          title: "生态保护",
          image: "/static/placeholder.png"
        },
        {
          id: "5",
          title: "矿产资源",
          image: "/static/placeholder.png"
        },
        {
          id: "6",
          title: "自然保护区",
          image: "/static/placeholder.png"
        }
      ]
    };
  },
  onLoad() {
    this.getTopicList();
  },
  onPullDownRefresh() {
    this.getTopicList();
    setTimeout(() => {
      common_vendor.index.stopPullDownRefresh();
    }, 1e3);
  },
  methods: {
    // 获取专题列表
    getTopicList() {
      common_vendor.index.__f__("log", "at pages/index/index.vue:102", "获取专题列表");
    },
    // 导航到专题浏览页
    navigateToTopic(topicId) {
      common_vendor.index.navigateTo({
        url: `/pages/map/browse?topic_id=${topicId}`
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.bannerList, (item, index, i0) => {
      return {
        a: item.image,
        b: common_vendor.t(item.title),
        c: index,
        d: common_vendor.o(($event) => $options.navigateToTopic(item.id), index)
      };
    }),
    b: common_vendor.f($data.topicList, (item, index, i0) => {
      return {
        a: item.image,
        b: common_vendor.t(item.title),
        c: index,
        d: common_vendor.o(($event) => $options.navigateToTopic(item.id), index)
      };
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
