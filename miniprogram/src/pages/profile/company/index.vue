<template>
  <view class="company-page">
    <CfNavBar title="企业信息" :showBack="true" backText="返回" />

    <!-- 加载骨架屏 -->
    <view v-if="loading" class="skeleton">
      <view class="card skeleton-head" />
      <view class="card skeleton-card">
        <view class="skeleton-line" style="width: 40%; margin-bottom: 28rpx;" />
        <view class="skeleton-line skeleton-line--sm" style="width: 80%;" />
        <view class="skeleton-line skeleton-line--sm" style="width: 70%; margin-top: 12rpx;" />
      </view>
    </view>

    <template v-else>
      <!-- 企业头部卡片 -->
      <view class="company-page__header card">
        <image :src="company.logo" mode="aspectFill" class="company-page__logo" />
        <view class="company-page__header-info">
          <view class="company-page__name-row">
            <text class="company-page__name">{{ company.name }}</text>
            <view class="company-page__verify" :class="company.verified ? 'company-page__verify--ok' : 'company-page__verify--no'">
              <text>{{ company.verified ? '已认证' : '未认证' }}</text>
            </view>
          </view>
          <text class="company-page__short">{{ company.shortName }}</text>
        </view>
      </view>

      <!-- 详情 -->
      <view class="card company-page__detail">
        <view class="company-page__row">
          <text class="company-page__label">企业名称</text>
          <text class="company-page__value" v-if="!editing">{{ company.name }}</text>
          <input v-else class="company-page__input" v-model="company.name" placeholder="请输入企业名称" />
        </view>
        <view class="company-page__row">
          <text class="company-page__label">企业简称</text>
          <text class="company-page__value" v-if="!editing">{{ company.shortName }}</text>
          <input v-else class="company-page__input" v-model="company.shortName" placeholder="请输入简称" />
        </view>
        <view class="company-page__row">
          <text class="company-page__label">联系人</text>
          <text class="company-page__value" v-if="!editing">{{ company.contact }}</text>
          <input v-else class="company-page__input" v-model="company.contact" placeholder="请输入联系人" />
        </view>
        <view class="company-page__row">
          <text class="company-page__label">联系电话</text>
          <text class="company-page__value" v-if="!editing">{{ company.phone }}</text>
          <input v-else class="company-page__input" v-model="company.phone" placeholder="请输入联系电话" type="number" />
        </view>
      </view>

      <!-- 底部编辑按钮 -->
      <view class="company-page__footer">
        <view
          class="company-page__btn"
          :class="editing ? 'company-page__btn--primary' : 'company-page__btn--outline'"
          @tap="onEditToggle"
        >
          <text>{{ editing ? '保存资料' : '编辑资料' }}</text>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CfNavBar from '@/components/CfNavBar.vue'

const loading = ref(true)
const editing = ref(false)
const company = ref({
  name: '演立方文化传媒有限公司',
  shortName: '演立方',
  contact: '李豪',
  phone: '138****6688',
  logo: '/static/images/company-logo.png',
  verified: true,
})

function onEditToggle() {
  if (editing.value) {
    editing.value = false
    uni.showToast({ title: '资料已保存', icon: 'success' })
  } else {
    editing.value = true
  }
}

onMounted(() => {
  setTimeout(() => { loading.value = false }, 500)
})
</script>

<style lang="scss" scoped>
.company-page {
  min-height: 100vh;
  background: $color-bg-page;

  &__header {
    display: flex;
    align-items: center;
    gap: $space-md;
    margin: 24rpx $space-base 0;
  }

  &__logo {
    width: 120rpx;
    height: 120rpx;
    border-radius: $radius-md;
    background: $color-bg-input;
    flex-shrink: 0;
  }

  &__header-info { flex: 1; min-width: 0; }
  &__name-row { display: flex; align-items: center; gap: $space-sm; }
  &__name { font-size: $text-xl; font-weight: 700; color: $color-text-primary; }
  &__verify {
    padding: 4rpx 14rpx;
    border-radius: $radius-full;
    font-size: $text-xs;
    font-weight: 600;

    &--ok { background: rgba($color-success, 0.1); color: $color-success; }
    &--no { background: rgba($color-warning, 0.1); color: $color-warning; }
  }
  &__short { display: block; margin-top: 8rpx; font-size: $text-sm; color: $color-text-secondary; }

  &__detail { margin: 24rpx $space-base 0; }
  &__row {
    display: flex;
    align-items: center;
    padding: $space-md 0;

    & + & { border-top: 1rpx solid $color-divider; }
  }

  &__label { width: 160rpx; font-size: $text-base; color: $color-text-secondary; flex-shrink: 0; }
  &__value { flex: 1; font-size: $text-base; color: $color-text-primary; text-align: right; }
  &__input {
    flex: 1;
    text-align: right;
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

  &__btn {
    height: 88rpx;
    border-radius: $radius-full;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $text-base;
    font-weight: 600;

    &--outline { border: 2rpx solid $color-primary; color: $color-primary; background: $color-primary-subtle; }
    &--primary { background: $color-primary; color: $color-text-inverse; }

    &:active { opacity: 0.85; }
  }
}

// 骨架屏
.skeleton { padding: 24rpx $space-base; }
.skeleton-head { height: 170rpx; margin-bottom: 24rpx; }
.skeleton-card { height: 360rpx; }
.skeleton-line {
  height: 28rpx;
  border-radius: $radius-sm;
  background: linear-gradient(90deg, $color-bg-input 25%, darken($color-bg-input, 3%) 50%, $color-bg-input 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;

  &--sm { height: 22rpx; }
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
