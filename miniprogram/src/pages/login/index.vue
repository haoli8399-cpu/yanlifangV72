<template>
  <view class="login-page">
    <!-- Purple gradient brand area -->
    <view class="login-page__brand">
      <image class="login-page__brand-bg" src="/static/images/login-bg.jpg" mode="aspectFill" />
      <view class="login-page__brand-overlay">
        <text class="login-page__title">演立方</text>
        <text class="login-page__subtitle">商演找演立方</text>
      </view>
    </view>

    <!-- White card area -->
    <view class="login-page__card">
      <view class="login-page__role-switch">
        <button
          class="login-page__role-btn"
          :class="{ 'login-page__role-btn--active': selectedRole === 'company' }"
          @tap="selectRole('company')"
        >
          🎪 活动公司
        </button>
        <button
          class="login-page__role-btn"
          :class="{ 'login-page__role-btn--active': selectedRole === 'performer' && selectedActor === 'indie' }"
          @tap="selectRole('performer', 'indie')"
        >
          🎭 独立艺人
        </button>
        <button
          class="login-page__role-btn"
          :class="{ 'login-page__role-btn--active': selectedRole === 'performer' && selectedActor === 'agency' }"
          @tap="selectRole('performer', 'agency')"
        >
          🏢 经纪公司
        </button>
        <button
          class="login-page__role-btn"
          :class="{ 'login-page__role-btn--active': selectedRole === 'client' }"
          @tap="selectRole('client')"
        >
          🎫 甲方/散客
        </button>
      </view>
      <button
        class="login-page__wechat-btn"
        open-type="getPhoneNumber"
        @getphonenumber="handleWechatLogin"
      >
        <text class="login-page__wechat-icon">&#x1F4F1;</text>
        <text>微信一键登录</text>
      </button>
      <view class="login-page__agreement">
        <text class="login-page__agreement-text">
          登录即表示同意
          <text class="login-page__link" @tap="openAgreement('user')">《用户协议》</text>
          和
          <text class="login-page__link" @tap="openAgreement('privacy')">《隐私政策》</text>
        </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import type { UserRole, PerformerType } from '@/types'

const userStore = useUserStore()
const selectedRole = ref<UserRole>('company')
const selectedActor = ref<PerformerType>('indie')

function selectRole(role: UserRole, actor?: PerformerType) {
  selectedRole.value = role
  if (role === 'performer') {
    selectedActor.value = actor || 'indie'
  }
}

function handleWechatLogin() {
  // TODO: implement WeChat phone number login
  uni.showToast({ title: '登录中...', icon: 'loading' })
  setTimeout(() => {
    userStore.setToken('mock_token_123')
    userStore.setRole(selectedRole.value, selectedActor.value)
    uni.setStorageSync('user_role', selectedRole.value)
    uni.setStorageSync('user_actor_type', selectedActor.value)

    if (selectedRole.value === 'performer') {
      // 经纪公司跳专属落地页，独立艺人跳工作台
      const target = selectedActor.value === 'agency'
        ? '/pages/agency/index'
        : '/pages/user/performer/index'
      uni.redirectTo({ url: target })
      return
    }

    uni.switchTab({ url: '/pages/discover/index' })
  }, 1500)
}

function openAgreement(type: string) {
  // TODO: open agreement page
  uni.showToast({ title: type === 'user' ? '用户协议' : '隐私政策', icon: 'none' })
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background-color: $color-bg-page;

  &__brand {
    position: relative;
    height: 50vh;
    background: linear-gradient(135deg, $color-primary, $color-primary-active);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    .login-page__brand-bg {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      opacity: 0.15;
    }
  }

  &__brand-overlay {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__title {
    font-size: 64rpx;
    font-weight: 700;
    color: $color-text-inverse;
    letter-spacing: 4rpx;
    margin-bottom: $space-sm;
  }

  &__subtitle {
    font-size: $text-md;
    color: rgba(255, 255, 255, 0.7);
  }

  &__card {
    background-color: $color-bg-card;
    border-radius: $radius-lg $radius-lg 0 0;
    margin-top: -40rpx;
    position: relative;
    z-index: 2;
    padding: 64rpx $space-2xl;
    padding-bottom: calc(64rpx + env(safe-area-inset-bottom));
  }

  &__role-switch {
    display: flex;
    align-items: center;
    gap: $space-sm;
    margin-bottom: $space-xl;
  }

  &__role-btn {
    flex: 1;
    height: 72rpx;
    line-height: 72rpx;
    padding: 0 $space-md;
    border-radius: $radius-full;
    background-color: #f3f4f6;
    color: #6b7280;
    font-size: $text-sm;
    font-weight: 600;
    text-align: center;
    border: none;

    &::after { border: none; }

    &:active { opacity: 0.85; }
  }

  &__role-btn--active {
    background-color: $brand-primary;
    color: #ffffff;
  }

  &__wechat-btn {
    width: 100%;
    height: 96rpx;
    background-color: #07C160;
    color: $color-text-inverse;
    border-radius: $radius-full;
    font-size: $text-lg;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $space-sm;
    border: none;

    &::after { border: none; }

    &:active { opacity: 0.85; }
  }

  &__wechat-icon {
    font-size: 40rpx;
  }

  &__agreement {
    margin-top: $space-xl;
    text-align: center;
  }

  &__agreement-text {
    font-size: $text-sm;
    color: $color-text-tertiary;
  }

  &__link {
    color: $color-text-link;
  }
}
</style>
