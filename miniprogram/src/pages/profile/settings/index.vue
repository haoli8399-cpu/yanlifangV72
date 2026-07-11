<template>
  <view class="settings-page">
    <CfNavBar title="设置" :showBack="true" backText="返回" />

    <!-- 角色切换 -->
    <text class="settings-page__section">账户</text>
    <view class="card settings-page__card">
      <view class="settings-page__row" @tap="switchRole">
        <text class="settings-page__label">当前角色</text>
        <view class="settings-page__role">
          <text class="settings-page__role-text">{{ roleLabel }}</text>
          <text class="settings-page__arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 通用 -->
    <text class="settings-page__section">通用</text>
    <view class="card settings-page__card">
      <view class="settings-page__row" @tap="clearCache">
        <text class="settings-page__label">清理缓存</text>
        <view class="settings-page__role">
          <text class="settings-page__role-text">{{ cacheSize }}</text>
          <text class="settings-page__arrow">›</text>
        </view>
      </view>
      <view class="settings-page__row settings-page__row--last" @tap="checkUpdate">
        <text class="settings-page__label">检查更新</text>
        <view class="settings-page__role">
          <text class="settings-page__role-text">v1.0.0</text>
          <text class="settings-page__arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="settings-page__logout" @tap="logout">
      <text>退出登录</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CfNavBar from '@/components/CfNavBar.vue'
import type { UserRole, PerformerType } from '@/types'

const role = ref<UserRole>('company')
const cacheSize = ref('12.4 MB')

const roleLabelMap: Record<UserRole, string> = {
  company: '活动公司',
  performer: '独立艺人',
  client: '甲方企业',
}
const roleLabel = ref(roleLabelMap[role.value])

function getRoleLabel(r: UserRole, actor: PerformerType): string {
  if (r === 'performer') return actor === 'agency' ? '经纪公司' : '独立艺人'
  return roleLabelMap[r]
}

function switchRole() {
  uni.showToast({ title: '角色切换开发中', icon: 'none' })
}
function clearCache() {
  uni.showToast({ title: '缓存已清理', icon: 'success' })
  cacheSize.value = '0 MB'
}
function checkUpdate() {
  uni.showToast({ title: '已是最新版本', icon: 'none' })
}
function logout() {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出当前账号吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '已退出', icon: 'success' })
      }
    },
  })
}

onMounted(() => {
  role.value = (uni.getStorageSync('user_role') as UserRole) || 'company'
  const actor = (uni.getStorageSync('user_actor_type') as PerformerType) || 'indie'
  roleLabel.value = getRoleLabel(role.value, actor)
})
</script>

<style lang="scss" scoped>
.settings-page {
  min-height: 100vh;
  background: $color-bg-page;

  &__section {
    display: block;
    margin: $space-lg $space-base $space-sm;
    font-size: $text-sm;
    color: $color-text-tertiary;
  }

  &__card { margin: 0 $space-base; padding: 0 $space-lg; }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $space-md 0;

    & + & { border-top: 1rpx solid $color-divider; }
    &--last { border-bottom: none; }
    &:active { opacity: 0.7; }
  }

  &__label { font-size: $text-base; color: $color-text-primary; }
  &__role { display: flex; align-items: center; gap: $space-sm; }
  &__role-text { font-size: $text-base; color: $color-text-secondary; }
  &__arrow { font-size: $text-xl; color: $color-text-tertiary; }

  &__logout {
    margin: $space-2xl $space-base 0;
    height: 88rpx;
    border-radius: $radius-full;
    background: $color-bg-card;
    color: $color-danger;
    font-size: $text-base;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2rpx solid rgba($color-danger, 0.3);

    &:active { background: rgba($color-danger, 0.06); }
  }
}
</style>
