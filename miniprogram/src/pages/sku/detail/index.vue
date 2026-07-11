<template>
  <view class="sku-detail-page page-with-cta">

    <!-- 加载骨架屏 -->
    <view v-if="loading" class="sku-detail-skeleton">
      <view class="skeleton-hero" />
      <view class="card" style="margin-top: -40rpx; position: relative; z-index: 1;">
        <view class="skeleton-line skeleton-line--lg" style="width: 60%; margin-bottom: 24rpx;" />
        <view class="skeleton-tags">
          <view class="skeleton-tag" />
          <view class="skeleton-tag" />
          <view class="skeleton-tag" style="width: 120rpx;" />
        </view>
        <view class="skeleton-line" style="width: 40%; margin-bottom: 16rpx;" />
        <view class="skeleton-line skeleton-line--sm" style="width: 80%;" />
      </view>
      <view class="card">
        <view class="skeleton-line" style="width: 30%; margin-bottom: 32rpx;" />
        <view v-for="i in 2" :key="i" class="skeleton-performer">
          <view class="skeleton-avatar" />
          <view class="skeleton-performer-info">
            <view class="skeleton-line" style="width: 160rpx; margin-bottom: 12rpx;" />
            <view class="skeleton-line skeleton-line--sm" style="width: 240rpx;" />
          </view>
        </view>
      </view>
      <view class="card">
        <view class="skeleton-line" style="width: 30%; margin-bottom: 32rpx;" />
        <view v-for="i in 4" :key="i" class="skeleton-detail-row">
          <view class="skeleton-line skeleton-line--sm" style="width: 140rpx;" />
          <view class="skeleton-line skeleton-line--sm" style="width: 200rpx;" />
        </view>
      </view>
      <view class="card">
        <view class="skeleton-line" style="width: 30%; margin-bottom: 32rpx;" />
        <view class="skeleton-line" style="width: 200rpx; height: 48rpx; margin-bottom: 16rpx;" />
        <view class="skeleton-line skeleton-line--sm" style="width: 70%;" />
      </view>
    </view>

    <!-- 错误状态 -->
    <view v-else-if="error" class="error-state">
      <text class="error-state__icon">😵</text>
      <text class="error-state__title">加载失败</text>
      <text class="error-state__desc">网络不给力，请检查网络后重试</text>
      <view class="error-state__btn" @tap="loadSkuDetail">
        <text>重新加载</text>
      </view>
    </view>

    <!-- 正常内容 -->
    <template v-else>
      <!-- Hero Image -->
      <image :src="sku.coverImage" mode="aspectFill" class="sku-detail-page__hero" />

      <!-- Basic Info Card -->
      <view class="sku-detail-page__info card" style="margin-top: -40rpx; position: relative; z-index: 1;">
        <text class="sku-detail-page__title">{{ sku.title }}</text>
        <view class="sku-detail-page__tags">
          <view v-for="tag in sku.tags" :key="tag" class="status-tag status-tag--signed"><text>{{ tag }}</text></view>
        </view>
        <view class="sku-detail-page__rating">
          <text class="sku-detail-page__rating-score">{{ sku.rating }}分</text>
          <text class="sku-detail-page__rating-count">{{ sku.ratingCount }}条评价</text>
        </view>
        <text class="sku-detail-page__desc">专业脱口秀演员团队，为企业年会和团建活动量身打造喜剧体验。</text>
      </view>

      <!-- Performer Info -->
      <view class="card sku-detail-page__performers">
        <text class="card-title">演出阵容</text>
        <view v-for="(p, i) in sku.performers" :key="p.id" class="sku-detail-page__performer" :class="{ 'sku-detail-page__performer--border': i < sku.performers.length - 1 }">
          <image :src="p.avatar" mode="aspectFill" class="sku-detail-page__avatar" />
          <view class="sku-detail-page__performer-info">
            <view class="sku-detail-page__performer-name-row">
              <text class="sku-detail-page__performer-name">{{ p.name }}</text>
              <view class="status-tag status-tag--signed"><text>{{ p.tierLevel }}</text></view>
            </view>
            <text class="sku-detail-page__performer-exp">{{ p.experience }}</text>
          </view>
        </view>
        <view v-if="!sku.performers.length" class="sku-detail-page__empty-performer">
          <text class="sku-detail-page__empty-text">暂无演出阵容信息</text>
        </view>
      </view>

      <!-- Service Details -->
      <view class="card">
        <text class="card-title">服务详情</text>
        <view class="sku-detail-page__detail-row">
          <text class="sku-detail-page__detail-label">演出时长</text>
          <text class="sku-detail-page__detail-value">{{ sku.duration }}分钟</text>
        </view>
        <view class="sku-detail-page__detail-row">
          <text class="sku-detail-page__detail-label">适合场景</text>
          <text class="sku-detail-page__detail-value">{{ sku.suitableScene }}</text>
        </view>
        <view class="sku-detail-page__detail-row">
          <text class="sku-detail-page__detail-label">服务包含</text>
          <text class="sku-detail-page__detail-value">演员2名、音响设备、互动环节</text>
        </view>
        <view class="sku-detail-page__detail-row">
          <text class="sku-detail-page__detail-label">业务类型</text>
          <text class="sku-detail-page__detail-value">商演包场</text>
        </view>
      </view>

      <!-- Pricing -->
      <view class="card">
        <text class="card-title">价格说明</text>
        <view class="sku-detail-page__price-row">
          <text class="sku-detail-page__price">¥{{ displayPrice.toLocaleString() }}</text>
          <text class="sku-detail-page__price-unit">/场 起</text>
        </view>
        <view class="sku-detail-page__price-tag">
          <text style="font-size: 22rpx; color: #5B4FD6; font-weight: 600;">{{ priceLabel }}</text>
        </view>
        <text class="sku-detail-page__price-note">最终价格根据具体需求确定，含演员差旅费</text>
      </view>
    </template>

  </view>

    <!-- 底部操作栏（非加载/错误时显示） -->
    <view v-if="!loading && !error" class="detail-bottom-bar">
      <view class="bottom-btn outline-btn" style="flex: 1;" @click="onGetQuote">
        <text>获取报价</text>
      </view>
      <view class="bottom-btn primary-btn" style="flex: 2;" @click="onContactAgent">
        <text>联系小演</text>
      </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Sku, Performer, UserRole } from '@/types'

const loading = ref(true)
const error = ref(false)
const userRole = ref<UserRole>('client')

const priceLabel = computed(() => {
  const map: Record<UserRole, string> = { client: '标准价', company: '渠道价', performer: '成本价' }
  return map[userRole.value] || '标准价'
})

const displayPrice = computed(() => {
  const base = sku.value.price
  if (userRole.value === 'company') return Math.round(base * 0.7)
  if (userRole.value === 'performer') return Math.round(base * 0.6)
  return base
})

const sku = ref<Sku>({
  id: '1',
  title: '周末脱口秀之夜',
  showType: 'talkshow',
  coverImage: '/static/images/show-card-1.jpg',
  description: '专业脱口秀演员团队，为企业年会和团建活动量身打造喜剧体验。',
  duration: 90,
  price: 8800,
  priceUnit: '场',
  rating: 4.9,
  ratingCount: 126,
  salesCount: 200,
  suitableScene: '企业年会、团建活动、客户答谢',
  businessType: 'commercial',
  performers: [
    { id: '1', name: '张脱口秀', avatar: '/static/images/performer-avatar.jpg', tierLevel: 'T3', experience: '从业8年 | 500+场演出经验', showCount: 500, yearsActive: 8 },
    { id: '2', name: '李即兴', avatar: '/static/images/performer-avatar.jpg', tierLevel: 'T4', experience: '从业5年 | 200+场演出经验', showCount: 200, yearsActive: 5 },
  ],
  tags: ['脱口秀', '企业年会', '90分钟'],
})

async function loadSkuDetail() {
  loading.value = true
  error.value = false
  try {
    // 模拟数据加载（后续接入真实 API）
    await new Promise(resolve => setTimeout(resolve, 800))
    // TODO: 调用真实 API 获取 SKU 详情
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}

function onGetQuote() {
  uni.showToast({ title: '获取报价功能开发中', icon: 'none' })
}

function onContactAgent() {
  uni.showToast({ title: '小演已接入', icon: 'success' })
}

onMounted(() => {
  userRole.value = (uni.getStorageSync('user_role') as UserRole) || 'client'
  loadSkuDetail()
})
</script>

<style lang="scss" scoped>
.sku-detail-page {
  background-color: $color-bg-page;

  &__hero {
    width: 100%;
    height: 480rpx;
  }

  &__title {
    font-size: $text-2xl;
    font-weight: 600;
    color: $color-text-primary;
    margin-bottom: $space-md;
  }

  &__tags {
    display: flex;
    gap: $space-sm;
    margin-bottom: $space-md;
  }

  &__rating {
    display: flex;
    align-items: center;
    gap: $space-md;
    margin-bottom: $space-md;
  }

  &__rating-score { font-size: $text-md; color: $state-pending; font-weight: 600; }
  &__rating-count { font-size: $text-sm; color: $color-text-tertiary; }

  &__desc {
    font-size: $text-base;
    color: $color-text-secondary;
    line-height: 1.6;
  }

  &__performers { margin-top: 0; }

  &__performer {
    display: flex;
    align-items: center;
    padding: $space-md 0;

    &--border {
      border-top: 1rpx solid $color-divider;
    }
  }

  &__avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: $space-md;
    flex-shrink: 0;
  }

  &__performer-info { flex: 1; }

  &__performer-name-row {
    display: flex;
    align-items: center;
    gap: $space-sm;
    margin-bottom: 8rpx;
  }

  &__performer-name { font-size: $text-md; font-weight: 500; color: $color-text-primary; }
  &__performer-exp { font-size: $text-sm; color: $color-text-secondary; }
  &__empty-performer { padding: $space-lg 0; text-align: center; }
  &__empty-text { font-size: $text-base; color: $color-text-tertiary; }

  &__detail-row {
    display: flex;
    justify-content: space-between;
    padding: $space-sm 0;
  }

  &__detail-label { font-size: $text-base; color: $color-text-secondary; }
  &__detail-value { font-size: $text-base; color: $color-text-primary; text-align: right; }

  &__price-row {
    display: flex;
    align-items: baseline;
    margin-bottom: $space-sm;
  }

  &__price { font-family: 'JetBrains Mono', monospace; font-size: $text-4xl; font-weight: 700; color: $color-primary; }
  &__price-unit { font-size: $text-base; color: $color-text-tertiary; margin-left: 4rpx; }
  &__price-tag { margin-bottom: $space-sm; }
  &__price-note { font-size: $text-sm; color: $color-text-tertiary; }
}

.card-title {
  font-size: $text-xl;
  font-weight: 600;
  color: $color-text-primary;
  margin-bottom: $space-md;
  display: block;
}

// ===== 加载骨架屏 =====
.sku-detail-skeleton {
  padding-bottom: 120rpx;
}

.skeleton-hero {
  width: 100%;
  height: 480rpx;
  background: linear-gradient(90deg, $color-bg-input 25%, darken($color-bg-input, 3%) 50%, $color-bg-input 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-tags {
  display: flex;
  gap: $space-sm;
  margin-bottom: $space-md;
}

.skeleton-tag {
  width: 100rpx;
  height: 36rpx;
  border-radius: $radius-full;
  background: linear-gradient(90deg, $color-bg-input 25%, darken($color-bg-input, 3%) 50%, $color-bg-input 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-performer {
  display: flex;
  align-items: center;
  padding: $space-md 0;

  & + & {
    border-top: 1rpx solid $color-divider;
  }
}

.skeleton-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: $space-md;
  flex-shrink: 0;
  background: linear-gradient(90deg, $color-bg-input 25%, darken($color-bg-input, 3%) 50%, $color-bg-input 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-performer-info {
  flex: 1;
}

.skeleton-detail-row {
  display: flex;
  justify-content: space-between;
  padding: $space-sm 0;
}

.skeleton-line {
  height: 28rpx;
  border-radius: $radius-sm;
  background: linear-gradient(90deg, $color-bg-input 25%, darken($color-bg-input, 3%) 50%, $color-bg-input 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;

  &--lg {
    height: 40rpx;
  }

  &--sm {
    height: 22rpx;
  }
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

// ===== 错误状态 =====
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx $space-base;

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
</style>

.channel-price { font-size: 24rpx; color: $color-text-secondary; margin-top: 8rpx; }
.price-tier-list { margin-top: 24rpx; padding: 0; }
.price-tier-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16rpx 24rpx; border: 2rpx solid $color-border; border-radius: $radius-sm; margin-bottom: 8rpx;
}
.price-tier-item.current { background: $color-primary-subtle; border-color: $color-primary; }
.tier-label { font-size: 26rpx; font-weight: 600; }
.tier-duration { font-size: 22rpx; color: $color-text-secondary; }
.tier-price { font-family: 'JetBrains Mono', monospace; font-size: 28rpx; font-weight: 700; color: $color-primary; }
.tier-badge { font-size: 20rpx; font-weight: 700; padding: 2rpx 10rpx; border-radius: $radius-full; background: $color-primary; color: #fff; margin-left: 8rpx; }

.detail-bottom-bar {
  position: fixed; bottom: 0; left: 0; right: 0;
  display: flex; gap: 16rpx;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: $color-bg-card;
  border-top: 2rpx solid $color-border;
  z-index: 100;
}
.bottom-btn {
  flex: 1; height: 80rpx; line-height: 80rpx;
  text-align: center; border-radius: $radius-full;
  font-size: $text-base; font-weight: 600;
}
.outline-btn { border: 2rpx solid $color-primary; color: $color-primary; background: $color-primary-subtle; }
.primary-btn { background: $color-primary; color: $color-text-inverse; }
.bottom-btn:active { opacity: 0.8; }