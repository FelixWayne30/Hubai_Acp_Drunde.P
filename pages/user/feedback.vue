<template>
  <view class="container">
    <view class="background">
      <image class="background-image" :src=StaticAssets.BG_DOWNLOAD mode="aspectFill"></image>
    </view>

    <view class="content">
      <view class="feedback-form">
        <view class="feedback-type">
          <view class="type-label">反馈类型</view>
          <view class="type-options">
            <view
              v-for="(type, index) in feedbackTypes"
              :key="index"
              class="type-option"
              :class="{ 'selected': selectedType === type.value }"
              @click="selectType(type.value)"
            >
              {{ type.label }}
            </view>
          </view>
        </view>

        <view class="feedback-content">
          <view class="content-label">反馈内容</view>
          <textarea
            class="feedback-input"
            v-model="feedbackContent"
            placeholder="请填写您的意见或建议，我们会认真改进😊"
            auto-height
          ></textarea>
        </view>

        <view class="contact-info">
          <view class="contact-label">联系方式</view>
          <input
            class="contact-input"
            v-model="contact"
            placeholder="联系方式（选填，方便我们给您回访）"
            type="text"
          />
        </view>

        <button
          class="submit-btn btn-primary"
          :disabled="isSubmitting || !feedbackContent.trim() || !selectedType"
          @click="submitFeedback"
        >
          {{ isSubmitting ? '提交中...' : '提交反馈' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { API } from '@/common/config.js';
import {StaticAssets} from "@/env.config";

export default {
  data() {
    return {
      feedbackContent: '',
      contact: '',
      isSubmitting: false,
      userId: null,
      selectedType: '',
      feedbackTypes: [
        { label: '问题反馈', value: 'problem' },
        { label: '功能建议', value: 'suggestion' },
        { label: '内容纠错', value: 'correction' },
        { label: '其他', value: 'other' }
      ],
      StaticAssets
    }
  },
  onLoad() {
    // 获取用户ID（可选，如果需要关联用户）
    const userInfo = uni.getStorageSync('userInfo');
    if (userInfo) {
      try {
        const userObj = JSON.parse(userInfo);
        this.userId = userObj.user_id;
      } catch (e) {
        console.error('解析用户信息失败', e);
      }
    }
  },
  methods: {
    // Select feedback type
    selectType(type) {
      this.selectedType = type;
    },
    // Submit feedback
    submitFeedback() {
      if (!this.feedbackContent.trim()) {
        uni.showToast({
          title: '请输入反馈内容',
          icon: 'none'
        });
        return;
      }
      if (!this.selectedType) {
        uni.showToast({
          title: '请选择反馈类型',
          icon: 'none'
        });
        return;
      }

      this.isSubmitting = true;
      uni.showLoading({
        title: '提交中...'
      });

      uni.request({
        url: API.FEEDBACK_SUBMIT,
        method: 'POST',
        data: {
          userId: this.userId || '',
          type: this.selectedType,
          content: this.feedbackContent.trim(),
          contact: this.contact.trim()
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 200) {
            uni.showToast({
              title: '反馈提交成功',
              icon: 'success'
            });
            // 清空表单
            this.feedbackContent = '';
            this.contact = '';
            this.selectedType = '';
          } else {
            uni.showToast({
              title: res.data.msg || '提交失败，请重试',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          console.error('请求失败', err);
          uni.showToast({
            title: '网络错误，请稍后重试',
            icon: 'none'
          });
        },
        complete: () => {
          this.isSubmitting = false;
          uni.hideLoading();
        }
      });
    }
  }
}
</script>

<style>
.container {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  padding-bottom: 30rpx;
}

.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.background-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.content {
  position: relative;
  z-index: 1;
  padding: 20rpx;
}

/* Feedback form */
.feedback-form {
  background-color: #FFFFFF;
  border-radius: 10rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

/* Feedback type selection */
.feedback-type {
  margin-bottom: 30rpx;
}

.type-label {
  font-size: 30rpx;
  color: #333333;
  margin-bottom: 20rpx;
}

.type-options {
  display: flex;
  flex-wrap: wrap;
  gap: 40rpx;
}

.type-option {
  padding: 15rpx 30rpx;
  font-size: 28rpx;
  color: #333333;
  background-color: #F8F8F8;
  border-radius: 40rpx;
  border: 1px solid #CCCCCC;
}

.type-option.selected {
  background-color: #7aa26f;
  color: #FFFFFF;
  border-color: #7aa26f;
}

/* Feedback content */
.feedback-content {
  margin-bottom: 30rpx;
}

.content-label {
  font-size: 30rpx;
  color: #333333;
  margin-bottom: 20rpx;
}

.feedback-input {
  width: 95%;
  min-height: 500rpx;
  padding: 20rpx;
  background-color: #F8F8F8;
  border-radius: 10rpx;
  font-size: 28rpx;
  color: #333333;
}

/* Contact information */
.contact-info {
  margin-bottom: 40rpx;
}

.contact-label {
  font-size: 30rpx;
  color: #333333;
  margin-bottom: 20rpx;
}

.contact-input {
  width: 95%;
  height: 80rpx;
  padding: 0 20rpx;
  background-color: #F8F8F8;
  border-radius: 10rpx;
  font-size: 28rpx;
  color: #333333;
}

/* Submit button */
.submit-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 28rpx;
  color: #FFFFFF;
  background-color: #7aa26f;
  border-radius: 10rpx;
}

.submit-btn:disabled {
  background-color: #CCCCCC;
}
</style>