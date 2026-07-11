<template>
  <view class="about-page">
    <CfNavBar title="关于我们" :showBack="true" backText="返回" />

    <!-- 品牌 -->
    <view class="about-page__hero">
      <view class="about-page__logo">
        <text class="about-page__logo-text">演</text>
      </view>
      <text class="about-page__brand">演立方 YANLI</text>
      <text class="about-page__version">v1.0.0</text>
      <text class="about-page__slogan">AI 商演成交机器</text>
    </view>

    <!-- 品牌描述 -->
    <view class="card about-page__desc">
      <text class="about-page__desc-text">演立方是面向活动公司与品牌方的 AI 商演撮合平台。一句话描述需求，小演即可快速匹配演员、生成方案并保障履约，让一场演出高效成交。</text>
    </view>

    <!-- 法律信息 -->
    <view class="card about-page__legal">
      <view class="about-page__legal-item" @tap="placeholder('用户协议')">
        <text class="about-page__legal-label">用户协议</text>
        <text class="about-page__legal-arrow">›</text>
      </view>
      <view class="about-page__legal-item" @tap="placeholder('隐私政策')">
        <text class="about-page__legal-label">隐私政策</text>
        <text class="about-page__legal-arrow">›</text>
      </view>
      <view class="about-page__legal-item about-page__legal-item--last" @tap="placeholder('平台规则')">
        <text class="about-page__legal-label">平台规则</text>
        <text class="about-page__legal-arrow">›</text>
      </view>
    </view>
    <view class="about-page__copyright">
      <text>© 2026 演立方 YANLI · 商演找演立方</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import CfNavBar from '@/components/CfNavBar.vue'

function placeholder(name: string) {
  uni.showToast({ title: `${name}占位中`, icon: 'none' })
}
</script>

<style lang="scss" scoped>
.about-page {
  min-height: 100vh;
  background: $color-bg-page;

  &__hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 80rpx $space-base 60rpx;
  }

  &__logo {
    width: 160rpx;
    height: 160rpx;
    border-radius: $radius-lg;
    background: linear-gradient(135deg, $color-primary, $color-primary-light);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: $shadow-md;
    margin-bottom: $space-lg;
  }
  &__logo-text { font-size: 88rpx; color: #fff; font-weight: 800; }

  &__brand { font-size: $text-2xl; font-weight: 800; color: $color-text-primary; }
  &__version { margin-top: 8rpx; font-size: $text-sm; color: $color-text-tertiary; }
  &__slogan { margin-top: $space-sm; font-size: $text-base; color: $color-primary; font-weight: 600; }

  &__desc { margin: 0 $space-base; }
  &__desc-text { font-size: $text-base; color: $color-text-secondary; line-height: 1.8; }

  &__legal { margin: $space-lg $space-base 0; padding: 0 $space-lg; }
  &__legal-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $space-md 0;

    & + & { border-top: 1rpx solid $color-divider; }
    &--last { border-bottom: none; }
    &:active { opacity: 0.7; }
  }
  &__legal-label { font-size: $text-base; color: $color-text-primary; }
  &__legal-arrow { font-size: $text-xl; color: $color-text-tertiary; }

  &__copyright {
    text-align: center;
    margin-top: $space-xl;
    font-size: $text-sm;
    color: $color-text-tertiary;
  }
}
</style>
