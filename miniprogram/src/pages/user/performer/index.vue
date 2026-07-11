<template>
  <view class="user-performer-page">
    <!-- Profile Header -->
    <view class="user-performer-page__header">
      <view class="user-performer-page__profile">
        <image src="/static/images/performer-avatar.jpg" mode="aspectFill" class="user-performer-page__avatar" />
        <view class="user-performer-page__info">
          <text class="user-performer-page__name">张脱口秀</text>
          <view class="user-performer-page__badges">
            <view class="user-performer-page__badge user-performer-page__badge--role"><text>演员</text></view>
            <view class="user-performer-page__badge user-performer-page__badge--tier"><text>T3</text></view>
            <view class="user-performer-page__badge user-performer-page__badge--verified"><text>已认证</text></view>
          </view>
        </view>
      </view>
    </view>

    <!-- Data Overview -->
    <view class="user-performer-page__overview card">
      <view class="user-performer-page__overview-item">
        <text class="user-performer-page__overview-num">5</text>
        <text class="user-performer-page__overview-label">本月排期</text>
      </view>
      <view class="user-performer-page__overview-divider" />
      <view class="user-performer-page__overview-item">
        <text class="user-performer-page__overview-num user-performer-page__overview-num--income">¥18,500</text>
        <text class="user-performer-page__overview-label">月收入</text>
      </view>
      <view class="user-performer-page__overview-divider" />
      <view class="user-performer-page__overview-item">
        <text class="user-performer-page__overview-num user-performer-page__overview-num--credit">92</text>
        <text class="user-performer-page__overview-label">信誉分</text>
      </view>
    </view>

    <!-- Indie Supplier Workspace -->
    <view v-if="isIndiePerformer" class="user-performer-page__supplier-workspace card">
      <text class="user-performer-page__supplier-title">独立艺人工作台</text>
      <view class="user-performer-page__supplier-grid">
        <view
          v-for="entry in indieSupplierEntries"
          :key="entry.label"
          class="user-performer-page__supplier-card"
          @tap="goIndieSupplierEntry(entry.url)"
        >
          <text class="user-performer-page__supplier-icon">{{ entry.icon }}</text>
          <text class="user-performer-page__supplier-label">{{ entry.label }}</text>
        </view>
      </view>
    </view>

    <!-- Quick Actions -->
    <view class="user-performer-page__actions card">
      <view class="user-performer-page__action" @tap="goAssignment">
        <view class="user-performer-page__action-icon" style="background-color: #f5f3ff;"><text>📅</text></view>
        <text class="user-performer-page__action-label">我的排期</text>
      </view>
      <view class="user-performer-page__action" @tap="goCheckin">
        <view class="user-performer-page__action-icon" style="background-color: #f0fdf4;"><text>✅</text></view>
        <text class="user-performer-page__action-label">签到打卡</text>
      </view>
      <view class="user-performer-page__action" @tap="goCredit">
        <view class="user-performer-page__action-icon" style="background-color: #fffbeb;"><text>⭐</text></view>
        <text class="user-performer-page__action-label">信誉分</text>
      </view>
      <view class="user-performer-page__action" @tap="goOnboarding">
        <view class="user-performer-page__action-icon" style="background-color: #eff6ff;"><text>👤</text></view>
        <text class="user-performer-page__action-label">演员入驻</text>
      </view>
    </view>

    <!-- Menu Group 1 -->
    <view class="user-performer-page__menu card">
      <view v-for="item in menuGroup1" :key="item.label" class="user-performer-page__menu-item" @tap="handleMenuTap(item)">
        <view class="user-performer-page__menu-icon" :style="{ backgroundColor: item.iconBg }"><text>{{ item.icon }}</text></view>
        <text class="user-performer-page__menu-text">{{ item.label }}</text>
        <text class="user-performer-page__menu-arrow">></text>
      </view>
    </view>

    <!-- Menu Group 2 -->
    <view class="user-performer-page__menu card" style="padding-bottom: calc(120rpx + env(safe-area-inset-bottom));">
      <view v-for="item in menuGroup2" :key="item.label" class="user-performer-page__menu-item" @tap="handleMenuTap(item)">
        <view class="user-performer-page__menu-icon" :style="{ backgroundColor: item.iconBg }"><text>{{ item.icon }}</text></view>
        <text class="user-performer-page__menu-text">{{ item.label }}</text>
        <text class="user-performer-page__menu-arrow">></text>
      </view>
    </view>

    <XiaoYanFloat context-type="performer" />

    <CfTabBar currentTab="performer" />
  </view>
</template>

<script setup lang="ts">
import CfTabBar from '@/components/CfTabBar.vue'
import XiaoYanFloat from '@/components/XiaoYanFloat.vue'

const userRole = uni.getStorageSync('user_role')
const isIndiePerformer = userRole === 'performer_indie'

const indieSupplierEntries = [
  { label: '我的SKU', icon: '📋', url: '/pages/request/submit/index' },
  { label: '我的订单', icon: '📦', url: '/pages/user/orders/index' },
  { label: '收入看板', icon: '💰', url: '/pages/profile/demand/index' },
]

const menuGroup1 = [
  { label: '我的作品', icon: '🎬', iconBg: '#f5f3ff' },
  { label: '我的收藏', icon: '❤️', iconBg: '#fef2f2' },
  { label: '收入明细', icon: '💰', iconBg: '#f0fdf4' },
  { label: '结算管理', icon: '🏦', iconBg: '#fffbeb' },
]

const menuGroup2 = [
  { label: '联系客服', icon: '🎧', iconBg: '#eef2ff' },
  { label: '意见反馈', icon: '✉️', iconBg: '#f0fdf4' },
  { label: '关于我们', icon: 'ℹ️', iconBg: '#f5f3ff' },
  { label: '设置', icon: '⚙️', iconBg: '#f5f5f7' },
]

function goAssignment() { uni.redirectTo({ url: '/pages/assignment/list/index' }) }
function goCheckin() { uni.navigateTo({ url: '/pages/checkin/index' }) }
function goCredit() { uni.navigateTo({ url: '/pages/credit/index' }) }
function goOnboarding() { uni.navigateTo({ url: '/pages/onboarding/index' }) }
function goIndieSupplierEntry(url: string) { uni.navigateTo({ url }) }
function handleMenuTap(item: typeof menuGroup1[0]) { uni.showToast({ title: item.label, icon: 'none' }) }
</script>

<style lang="scss" scoped>
.user-performer-page { background-color: $color-bg-page; min-height: 100vh; }

.user-performer-page__header { background: linear-gradient(135deg, $color-primary, $color-primary-active); padding: $space-xl $space-base 80rpx; }
.user-performer-page__profile { display: flex; align-items: center; }
.user-performer-page__avatar { width: 112rpx; height: 112rpx; border-radius: 50%; border: 4rpx solid #fff; margin-right: $space-lg; }
.user-performer-page__name { font-size: $text-xl; font-weight: 600; color: #fff; display: block; margin-bottom: $space-xs; }
.user-performer-page__badges { display: flex; gap: $space-sm; }
.user-performer-page__badge { padding: 4rpx 16rpx; border-radius: $radius-full; font-size: $text-xs; }
.user-performer-page__badge--role { background: rgba(255,255,255,0.2); color: #fff; }
.user-performer-page__badge--tier { background: #fbbf24; color: $color-text-primary; }
.user-performer-page__badge--verified { background: $state-confirmed; color: #fff; }

.user-performer-page__overview { margin-top: -48rpx; position: relative; z-index: 1; display: flex; align-items: center; }
.user-performer-page__overview-item { flex: 1; text-align: center; }
.user-performer-page__overview-num { font-size: $text-3xl; font-weight: 700; color: $color-text-primary; display: block; }
.user-performer-page__overview-num--income { color: $color-primary; }
.user-performer-page__overview-num--credit { color: $state-confirmed; }
.user-performer-page__overview-label { font-size: $text-xs; color: $color-text-tertiary; margin-top: 4rpx; display: block; }
.user-performer-page__overview-divider { width: 1rpx; height: 48rpx; background-color: $color-divider; }

.user-performer-page__supplier-workspace { padding: $space-lg !important; }
.user-performer-page__supplier-title { display: block; font-size: $text-lg; font-weight: 600; color: $color-text-primary; margin-bottom: $space-md; }
.user-performer-page__supplier-grid { display: flex; gap: 16rpx; }
.user-performer-page__supplier-card { flex: 1; min-height: 148rpx; background: #fff; border: 1px solid $brand-primary; border-radius: 16rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; &:active { background-color: #f5f3ff; } }
.user-performer-page__supplier-icon { font-size: 40rpx; line-height: 1; margin-bottom: $space-xs; }
.user-performer-page__supplier-label { font-size: 22rpx; color: #374151; }

.user-performer-page__actions { display: flex; justify-content: space-around; padding: $space-md $space-lg !important; }
.user-performer-page__action { display: flex; flex-direction: column; align-items: center; &:active { opacity: 0.85; } }
.user-performer-page__action-icon { width: 80rpx; height: 80rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36rpx; margin-bottom: $space-xs; }
.user-performer-page__action-label { font-size: $text-sm; color: $color-text-primary; }

.user-performer-page__menu { padding: 0 !important; overflow: hidden; }
.user-performer-page__menu-item { display: flex; align-items: center; padding: $space-lg $space-lg; border-bottom: 1rpx solid $color-divider; &:last-child { border-bottom: none; } &:active { background-color: $color-bg-page; } }
.user-performer-page__menu-icon { width: 72rpx; height: 72rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32rpx; margin-right: $space-md; }
.user-performer-page__menu-text { flex: 1; font-size: $text-md; color: $color-text-primary; }
.user-performer-page__menu-arrow { color: $color-text-placeholder; }
</style>
