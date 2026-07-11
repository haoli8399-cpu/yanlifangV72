<template>
  <view class="feedback-page">
    <CfNavBar title="意见反馈" :showBack="true" backText="返回" />

    <!-- 提交成功 -->
    <view v-if="submitted" class="done-state">
      <text class="done-state__icon">✅</text>
      <text class="done-state__title">感谢反馈</text>
      <text class="done-state__desc">我们已收到你的建议，会尽快跟进优化</text>
      <view class="done-state__btn" @tap="back"><text>返回</text></view>
    </view>

    <template v-else>
      <view class="card feedback-page__card">
        <text class="feedback-page__label">问题描述</text>
        <textarea
          class="feedback-page__textarea"
          v-model="content"
          :maxlength="500"
          placeholder="请描述你遇到的问题或改进建议…"
          placeholder-class="feedback-page__placeholder"
        />
        <text class="feedback-page__count">{{ content.length }}/500</text>
      </view>

      <view class="card feedback-page__card">
        <text class="feedback-page__label">联系方式（选填）</text>
        <input
          class="feedback-page__input"
          v-model="contact"
          placeholder="手机号 / 微信，方便我们回访"
          placeholder-class="feedback-page__placeholder"
        />
      </view>

      <view class="feedback-page__footer">
        <view class="feedback-page__submit" :class="{ 'feedback-page__submit--disabled': !content.trim() }" @tap="submit">
          <text>提交反馈</text>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CfNavBar from '@/components/CfNavBar.vue'

const content = ref('')
const contact = ref('')
const submitted = ref(false)

function submit() {
  if (!content.value.trim()) {
    uni.showToast({ title: '请先填写反馈内容', icon: 'none' })
    return
  }
  submitted.value = true
}

function back() {
  uni.navigateBack({ delta: 1 })
}
</script>

<style lang="scss" scoped>
.feedback-page {
  min-height: 100vh;
  background: $color-bg-page;

  &__card { margin: 24rpx $space-base 0; }
  &__label { display: block; font-size: $text-base; font-weight: 600; color: $color-text-primary; margin-bottom: $space-sm; }

  &__textarea {
    width: 100%;
    height: 280rpx;
    font-size: $text-base;
    color: $color-text-primary;
    line-height: 1.6;
  }
  &__placeholder { color: $color-text-placeholder; }
  &__count { display: block; text-align: right; font-size: $text-sm; color: $color-text-tertiary; margin-top: $space-xs; }

  &__input {
    width: 100%;
    height: 80rpx;
    font-size: $text-base;
    color: $color-text-primary;
  }

  &__footer {
    position: fixed;
    left: 0; right: 0; bottom: 0;
    padding: 24rpx 32rpx calc(24rpx + env(safe-area-inset-bottom));
    background: $color-bg-card;
    border-top: 1rpx solid $color-border;
  }

  &__submit {
    height: 88rpx;
    border-radius: $radius-full;
    background: $color-primary;
    color: $color-text-inverse;
    font-size: $text-base;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;

    &--disabled { background: $color-gray-300; }
    &:active { opacity: 0.85; }
  }
}

// 提交成功
.done-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx $space-base;

  &__icon { font-size: 120rpx; margin-bottom: $space-lg; }
  &__title { font-size: $text-2xl; font-weight: 700; color: $color-text-primary; margin-bottom: $space-sm; }
  &__desc { font-size: $text-base; color: $color-text-secondary; text-align: center; margin-bottom: $space-xl; }
  &__btn {
    height: 80rpx;
    padding: 0 56rpx;
    border-radius: $radius-full;
    background: $color-primary;
    color: $color-text-inverse;
    font-size: $text-base;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;

    &:active { opacity: 0.8; }
  }
}
</style>
