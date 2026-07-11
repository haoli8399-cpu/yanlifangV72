<template>
  <view class="user-page page-with-tabbar">
    <!-- 加载骨架屏 -->
    <template v-if="loading">
      <view class="skeleton-header">
        <view class="skeleton-avatar-lg" />
        <view class="skeleton-header-info">
          <view class="skeleton-line" style="width: 200rpx; margin-bottom: 16rpx;" />
          <view class="skeleton-badges">
            <view class="skeleton-badge" />
            <view class="skeleton-badge" style="width: 120rpx;" />
          </view>
        </view>
      </view>
      <view class="skeleton-overview card" style="margin-top: -48rpx; position: relative; z-index: 1;">
        <view v-for="i in 3" :key="i" class="skeleton-overview-item">
          <view class="skeleton-line" style="width: 60rpx; height: 48rpx; margin: 0 auto 8rpx;" />
          <view class="skeleton-line skeleton-line--sm" style="width: 80rpx; margin: 0 auto;" />
        </view>
      </view>
      <view class="skeleton-menu card" v-for="g in 2" :key="g">
        <view v-for="i in 4" :key="i" class="skeleton-menu-item">
          <view class="skeleton-menu-icon" />
          <view class="skeleton-line" style="width: 140rpx;" />
        </view>
      </view>
    </template>

    <!-- 错误状态 -->
    <view v-else-if="error" class="error-state">
      <text class="error-state__icon">😵</text>
      <text class="error-state__title">加载失败</text>
      <text class="error-state__desc">网络不给力，请检查网络后重试</text>
      <view class="error-state__btn" @tap="loadUserData">
        <text>重新加载</text>
      </view>
    </view>

    <!-- 正常内容 -->
    <template v-else>
      <!-- Profile Header -->
      <view class="user-page__header user-header-purple">
        <view class="user-page__profile">
          <image src="/static/images/performer-avatar.jpg" mode="aspectFill" class="user-page__avatar" />
          <view class="user-page__info">
            <text class="user-page__name">星辰文化传媒</text>
            <view class="user-page__badges">
              <view class="user-page__badge user-page__badge--role"><text>活动公司</text></view>
              <view class="user-page__badge user-page__badge--verified"><text>认证企业</text></view>
            </view>
          </view>
        </view>
      </view>

      <!-- Data Overview -->
      <view class="user-page__overview card">
        <view class="user-page__overview-item">
          <text class="user-page__overview-num">12</text>
          <text class="user-page__overview-label">本月需求</text>
        </view>
        <view class="user-page__overview-divider" />
        <view class="user-page__overview-item">
          <text class="user-page__overview-num user-page__overview-num--pending">5</text>
          <text class="user-page__overview-label">进行中</text>
        </view>
        <view class="user-page__overview-divider" />
        <view class="user-page__overview-item">
          <text class="user-page__overview-num user-page__overview-num--confirmed">7</text>
          <text class="user-page__overview-label">已签约</text>
        </view>
      </view>

      <!-- Menu Group 1 -->
      <view class="user-page__menu card">
        <view v-for="item in menuGroup1" :key="item.label" class="user-page__menu-item" @tap="handleMenuTap(item)">
          <view class="user-page__menu-icon" :style="{ backgroundColor: item.iconBg }">
            <text>{{ item.icon }}</text>
          </view>
          <text class="user-page__menu-text">{{ item.label }}</text>
          <text class="user-page__menu-arrow">></text>
        </view>
      </view>

      <!-- Menu Group 2 -->
      <view class="user-page__menu card">
        <view v-for="item in menuGroup2" :key="item.label" class="user-page__menu-item" @tap="handleMenuTap(item)">
          <view class="user-page__menu-icon" :style="{ backgroundColor: item.iconBg }">
            <text>{{ item.icon }}</text>
          </view>
          <text class="user-page__menu-text">{{ item.label }}</text>
          <text class="user-page__menu-arrow">></text>
        </view>
      </view>
  
      <!-- 最近订单 -->
      <view class="orders-section">
        <view class="section-title-bar">
          <text class="section-title">最近订单</text>
          <text class="section-link" @click="goOrders">查看全部 →</text>
        </view>
        <view class="order-tabs">
          <text class="order-tab" :class="{ active: orderTab === 'all' }" @click="orderTab = 'all'">全部</text>
          <text class="order-tab" :class="{ active: orderTab === 'pending' }" @click="orderTab = 'pending'">进行中</text>
          <text class="order-tab" :class="{ active: orderTab === 'done' }" @click="orderTab = 'done'">已完成</text>
        </view>
        <!-- 订单空状态 -->
        <view v-if="recentOrders.length === 0" class="empty-state-mini">
          <text class="empty-state-mini__text">暂无订单记录</text>
        </view>
        <view class="order-card" v-for="o in recentOrders" :key="o.id" @click="goOrderDetail(o.id)">
          <view class="order-card-header">
            <text class="order-name">{{ o.name }}</text>
            <text class="order-status" :class="'status-' + o.statusColor">{{ o.status }}</text>
          </view>
          <text class="order-meta">{{ o.date }} · {{ o.sku }}</text>
          <view class="order-card-footer">
            <text class="order-amount">{{ o.amount }}</text>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const loading = ref(true)
const error = ref(false)

// 订单 tab 状态
const orderTab = ref<'all' | 'pending' | 'done'>('all')

// 最近订单 mock 数据
interface OrderItem {
  id: string
  name: string
  date: string
  sku: string
  amount: string
  status: string
  statusColor: 'purple' | 'green' | 'orange'
}

const allOrders: OrderItem[] = [
  { id: '1', name: '脱口秀年会专场', date: '2026-07-05', sku: '脱口秀·T3·60min', amount: '¥6,000', status: '已签约', statusColor: 'green' },
  { id: '2', name: '企业团建喜剧秀', date: '2026-06-28', sku: '脱口秀·T4·45min', amount: '¥4,500', status: '已完成', statusColor: 'gray' },
  { id: '3', name: '品牌发布会', date: '2026-06-20', sku: '魔术脱口秀·T2·90min', amount: '¥9,000', status: '进行中', statusColor: 'orange' },
]

const recentOrders = computed(() => {
  if (orderTab.value === 'all') return allOrders
  if (orderTab.value === 'pending') return allOrders.filter(o => o.status === '进行中')
  if (orderTab.value === 'done') return allOrders.filter(o => o.status === '已完成' || o.status === '已签约')
  return allOrders
})

async function loadUserData() {
  loading.value = true
  error.value = false
  try {
    // 模拟数据加载（后续接入真实 API）
    await new Promise(resolve => setTimeout(resolve, 600))
    // TODO: 调用真实 API 获取用户信息
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}

function goOrders() {
  uni.navigateTo({ url: '/pages/user/orders/index' })
}

function goOrderDetail(id: string) {
  uni.navigateTo({ url: `/pages/user/orders/index?id=${id}` })
}

const menuGroup1 = [
  { label: '我的需求', icon: '📋', iconBg: '#f5f3ff' },
  { label: '我的收藏', icon: '❤️', iconBg: '#fef2f2' },
  { label: '历史订单', icon: '🕐', iconBg: '#eff6ff' },
  { label: '企业信息', icon: '🏢', iconBg: '#f0fdf4' },
  { label: '发票管理', icon: '🧾', iconBg: '#fffbeb' },
]

const menuGroup2 = [
  { label: '联系客服', icon: '🎧', iconBg: '#eef2ff' },
  { label: '意见反馈', icon: '✉️', iconBg: '#f0fdf4' },
  { label: '关于我们', icon: 'ℹ️', iconBg: '#f5f3ff' },
  { label: '设置', icon: '⚙️', iconBg: '#f5f5f7' },
]

function handleMenuTap(item: typeof menuGroup1[0]) {
  if (item.label === '我的需求') {
    uni.navigateTo({ url: '/pages/profile/demand/index' })
    return
  }
  if (item.label === '我的收藏') {
    uni.navigateTo({ url: '/pages/profile/favorites/index' })
    return
  }
  if (item.label === '历史订单') {
    uni.navigateTo({ url: '/pages/user/orders/index' })
    return
  }
  if (item.label === '企业信息') {
    uni.navigateTo({ url: '/pages/profile/company/index' })
    return
  }
  if (item.label === '发票管理') {
    uni.navigateTo({ url: '/pages/profile/invoice/index' })
    return
  }
  if (item.label === '联系客服') {
    uni.navigateTo({ url: '/pages/profile/contact/index' })
    return
  }
  if (item.label === '意见反馈') {
    uni.navigateTo({ url: '/pages/profile/feedback/index' })
    return
  }
  if (item.label === '关于我们') {
    uni.navigateTo({ url: '/pages/profile/about/index' })
    return
  }
  if (item.label === '设置') {
    uni.navigateTo({ url: '/pages/profile/settings/index' })
    return
  }
}

onMounted(() => {
  loadUserData()
})
</script>

<style lang="scss" scoped>
.user-page {
  &__header {
    background: linear-gradient(135deg, $color-primary, $color-primary-active);
    padding: $space-xl $space-base 80rpx;
  }

  &__profile { display: flex; align-items: center; }

  &__avatar {
    width: 112rpx;
    height: 112rpx;
    border-radius: 50%;
    border: 4rpx solid #fff;
    margin-right: $space-lg;
  }

  &__name { font-size: $text-xl; font-weight: 600; color: #fff; display: block; margin-bottom: $space-xs; }

  &__badges { display: flex; gap: $space-sm; }
  &__badge { padding: 4rpx 16rpx; border-radius: $radius-full; font-size: $text-xs; }
  &__badge--role { background: rgba(255,255,255,0.2); color: #fff; }
  &__badge--verified { background: #fbbf24; color: $color-text-primary; }

  &__overview {
    margin-top: -48rpx;
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
  }

  &__overview-item { flex: 1; text-align: center; }
  &__overview-num { font-size: $text-3xl; font-weight: 700; color: $color-text-primary; display: block; }
  &__overview-num--pending { color: $state-pending; }
  &__overview-num--confirmed { color: $state-confirmed; }
  &__overview-label { font-size: $text-xs; color: $color-text-tertiary; margin-top: 4rpx; display: block; }
  &__overview-divider { width: 1rpx; height: 48rpx; background-color: $color-divider; }

  &__menu {
    padding: 0 !important;
    overflow: hidden;
  }

  &__menu-item {
    display: flex;
    align-items: center;
    padding: $space-lg $space-lg;
    border-bottom: 1rpx solid $color-divider;
    &:last-child { border-bottom: none; }
    &:active { background-color: $color-bg-page; }
  }

  &__menu-icon {
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    margin-right: $space-md;
  }

  &__menu-text { flex: 1; font-size: $text-md; color: $color-text-primary; }
  &__menu-arrow { color: $color-text-placeholder; font-size: $text-sm; }
}
</style>

.user-header-purple {
  background: $color-primary;
  color: $color-text-inverse;
  padding: 32rpx;
}
.user-header-purple .user-page__name { color: #fff; }
.user-header-purple .user-page__badge--role { background: rgba(255,255,255,0.2); color: rgba(255,255,255,0.9); }
.user-header-purple .user-page__badge--verified { background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.9); }

.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0rpx;
  background: $color-border;
  margin: 24rpx 0;
  border-radius: $radius-md;
  overflow: hidden;
}
.quick-grid-item {
  background: $color-bg-card;
  padding: 32rpx 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}
.quick-grid-item:active { background: $color-bg-hover; }
.quick-grid-icon { font-size: 40rpx; }
.quick-grid-label { font-size: 22rpx; color: $color-text-secondary; }

.user-stats-row {
  display: flex;
  padding: 24rpx 0;
  border-bottom: 2rpx solid $color-border;
}
.user-stat-item {
  flex: 1; text-align: center;
}
.user-stat-value {
  font-size: 36rpx; font-weight: 700; color: $color-primary;
  font-family: 'JetBrains Mono', monospace;
}
.user-stat-label { font-size: 22rpx; color: $color-text-secondary; margin-top: 8rpx; }

.orders-section { margin-top: 32rpx; padding: 24rpx $space-base; background: $color-bg-page; border-radius: $radius-md; }
.section-title-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx; }
.section-link { font-size: $text-xs; color: $color-primary; }
.order-tabs { display: flex; gap: 16rpx; margin-bottom: 24rpx; }
.order-tab { font-size: $text-sm; color: $color-text-secondary; padding: 4rpx 0; }
.order-tab.active { color: $color-primary; font-weight: 600; border-bottom: 4rpx solid $color-primary; }
.order-card { cursor: pointer; 
  padding: 24rpx 24rpx; background: $color-bg-card;
  border-radius: $radius-md; border: 2rpx solid $color-border; margin-bottom: 16rpx;
}
.order-card:active { opacity: 0.8; }
.order-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx; }
.order-name { font-size: $text-base; font-weight: 600; color: $color-text-primary; }
.order-status { font-size: $text-xs; font-weight: 600; padding: 4rpx 12rpx; border-radius: $radius-full; }
.status-purple { background: $color-primary-subtle; color: $color-primary; }
.status-green { background: #f0fdf4; color: $color-success; }
.status-orange { background: #fffbeb; color: #f59e0b; }
.status-gray { background: $color-bg-input; color: $color-text-tertiary; }
.order-meta { font-size: $text-xs; color: $color-text-secondary; }
.order-card-footer { margin-top: 8rpx; }
.order-amount { font-size: $text-lg; font-weight: 800; color: $color-primary; font-family: 'JetBrains Mono', monospace; }
.order-card:active,.quick-grid-item:active{opacity:.7;transform:scale(.98)}

// ===== 加载骨架屏 =====
.skeleton-header {
  background: linear-gradient(135deg, $color-primary, $color-primary-active);
  padding: $space-xl $space-base 80rpx;
  display: flex;
  align-items: center;
}

.skeleton-avatar-lg {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255,255,255,0.3);
  margin-right: $space-lg;
  background: rgba(255,255,255,0.2);
  animation: shimmer-light 1.5s ease-in-out infinite;
}

.skeleton-header-info {
  flex: 1;
}

.skeleton-badges {
  display: flex;
  gap: $space-sm;
}

.skeleton-badge {
  width: 100rpx;
  height: 32rpx;
  border-radius: $radius-full;
  background: rgba(255,255,255,0.2);
  animation: shimmer-light 1.5s ease-in-out infinite;
}

.skeleton-overview {
  display: flex;
  align-items: center;
}

.skeleton-overview-item {
  flex: 1;
  text-align: center;
}

.skeleton-menu {
  padding: 0 !important;
  overflow: hidden;
}

.skeleton-menu-item {
  display: flex;
  align-items: center;
  padding: $space-lg $space-lg;
  border-bottom: 1rpx solid $color-divider;

  &:last-child {
    border-bottom: none;
  }
}

.skeleton-menu-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  margin-right: $space-md;
  background: linear-gradient(90deg, $color-bg-input 25%, darken($color-bg-input, 3%) 50%, $color-bg-input 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-line {
  height: 28rpx;
  border-radius: $radius-sm;
  background: linear-gradient(90deg, $color-bg-input 25%, darken($color-bg-input, 3%) 50%, $color-bg-input 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;

  &--sm {
    height: 22rpx;
  }
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@keyframes shimmer-light {
  0% { opacity: 0.4; }
  50% { opacity: 0.8; }
  100% { opacity: 0.4; }
}

// ===== 错误状态 =====
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx $space-base 120rpx;

  &__icon {
    font-size: 96rpx;
    margin-bottom: $space-lg;
  }

  &__title {
    font-size: $text-xl;
    font-weight: 600;
    color: $color-text-primary;
    margin-bottom: $space-sm;
  }

  &__desc {
    font-size: $text-sm;
    color: $color-text-secondary;
    margin-bottom: $space-xl;
  }

  &__btn {
    height: 80rpx;
    padding: 0 48rpx;
    border-radius: $radius-full;
    background: $color-primary;
    color: $color-text-inverse;
    font-size: $text-base;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;

    &:active {
      opacity: 0.8;
    }
  }
}

// ===== 订单空状态 =====
.empty-state-mini {
  padding: 48rpx 0;
  text-align: center;

  &__text {
    font-size: $text-sm;
    color: $color-text-tertiary;
  }
}