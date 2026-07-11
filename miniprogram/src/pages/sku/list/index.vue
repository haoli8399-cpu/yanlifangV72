<template>
  <view class="sku-list-page page-with-tabbar">
    <!-- Search Bar -->
    <view class="sku-list-page__search">
      <view class="sku-list-page__search-bar">
        <text class="sku-list-page__search-icon">⌕</text>
        <input
          class="sku-list-page__search-input"
          type="text"
          placeholder="搜索演出方案"
          placeholder-class="sku-list-page__search-placeholder"
          v-model="searchText"
          confirm-type="search"
        />
      </view>
    </view>

    <!-- Category Tabs -->
    <scroll-view scroll-x class="sku-list-page__tabs">
      <view
        v-for="cat in categories"
        :key="cat"
        class="sku-list-page__tab"
        :class="{ 'sku-list-page__tab--active': activeCategory === cat }"
        @tap="activeCategory = cat"
      >
        <text>{{ cat }}</text>
      </view>
    </scroll-view>

    <!-- Filter Bar -->
    <view class="sku-list-page__filters">
      <view
        v-for="filter in filters"
        :key="filter.label"
        class="sku-list-page__filter"
        @tap="filter.onTap"
      >
        <text>{{ filter.label }}</text>
        <text class="sku-list-page__filter-arrow">▾</text>
      </view>
    </view>

    <!-- 加载中 -->
    <view v-if="loading" class="sku-loading">
      <view class="sku-loading-card" v-for="i in 3" :key="i">
        <view class="sku-loading-img" />
        <view class="sku-loading-body">
          <view class="sku-loading-line" style="width: 60%;" />
          <view class="sku-loading-line" style="width: 40%;" />
          <view class="sku-loading-line" style="width: 30%;" />
        </view>
      </view>
    </view>

    <!-- 错误状态 -->
    <view v-else-if="error" class="sku-error-state">
      <text class="sku-error-icon">😵</text>
      <text class="sku-error-text">加载失败</text>
      <text class="sku-error-hint">网络不给力，请检查后重试</text>
      <view class="sku-error-retry" @tap="loadSkus"><text>重新加载</text></view>
    </view>

    <!-- 空结果 -->
    <view v-else-if="skuList.length === 0" class="sku-empty-state">
      <text class="sku-empty-icon">📋</text>
      <text class="sku-empty-text">暂无匹配方案</text>
      <text class="sku-empty-hint">换个筛选条件试试</text>
    </view>

    <!-- SKU Cards -->
    <view v-else class="sku-list-page__list">
      <view
        v-for="item in skuList"
        :key="item.id"
        class="sku-list-page__card"
        @tap="goDetail(item.id)"
      >
        <image :src="item.coverImage" mode="aspectFill" class="sku-list-page__card-img" />
        <view class="sku-list-page__card-body">
          <view class="sku-list-page__card-header">
            <text class="sku-list-page__card-title">{{ item.title }}</text>
            <view class="status-tag status-tag--signed">
              <text>{{ item.showTypeLabel }}</text>
            </view>
          </view>
          <text class="sku-list-page__card-sub">{{ item.suitableScene }} | {{ item.duration }}分钟</text>
          <view class="sku-list-page__card-footer">
            <view>
              <text class="sku-list-page__card-price">¥{{ calcPrice(item.price).toLocaleString() }}<text class="sku-list-page__card-unit">/场</text></text>
              <text class="sku-list-page__card-price-label">{{ priceLabel }}</text>
            </view>
            <view class="sku-list-page__card-meta">
              <text class="sku-list-page__card-rating">{{ item.rating }}分</text>
              <text class="sku-list-page__card-sales">已售{{ item.salesCount }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Sku, UserRole } from '@/types'
import { ShowTypeLabels } from '@/types'

const searchText = ref('')
const activeCategory = ref('全部')
const loading = ref(true)
const error = ref(false)
const userRole = ref<UserRole>('client')

const priceLabel = computed(() => {
  const map: Record<UserRole, string> = { client: '标准价', company: '渠道价', performer: '成本价' }
  return map[userRole.value] || '标准价'
})

function calcPrice(base: number) {
  if (userRole.value === 'company') return Math.round(base * 0.7)
  if (userRole.value === 'performer') return Math.round(base * 0.6)
  return base
}
const categories = ['全部', '脱口秀', '即兴喜剧', '漫才', '新喜剧', '魔术喜剧', '亲子喜剧']
const filters = [
  { label: '价格排序', onTap: () => {} },
  { label: '评分优先', onTap: () => {} },
  { label: '咖位筛选', onTap: () => {} },
]

const skuList = ref<Sku[]>([
  { id: '1', title: '周末脱口秀之夜', showType: 'talkshow', coverImage: '/static/images/show-card-1.jpg', description: '', duration: 90, price: 8800, priceUnit: '场', rating: 4.9, ratingCount: 126, salesCount: 200, suitableScene: '适合年会/团建', businessType: 'commercial', performers: [], tags: [] },
  { id: '2', title: '即兴喜剧互动秀', showType: 'improv', coverImage: '/static/images/show-card-1.jpg', description: '', duration: 60, price: 6500, priceUnit: '场', rating: 4.8, ratingCount: 89, salesCount: 150, suitableScene: '适合团建/客户答谢', businessType: 'commercial', performers: [], tags: [] },
  { id: '3', title: '漫才双人专场', showType: 'manzai', coverImage: '/static/images/show-card-1.jpg', description: '', duration: 90, price: 12000, priceUnit: '场', rating: 4.7, ratingCount: 56, salesCount: 80, suitableScene: '适合年会/商演', businessType: 'commercial', performers: [], tags: [] },
  { id: '4', title: '企业年会脱口秀定制', showType: 'talkshow', coverImage: '/static/images/show-card-1.jpg', description: '', duration: 120, price: 15000, priceUnit: '场', rating: 4.9, ratingCount: 200, salesCount: 300, suitableScene: '适合大型年会', businessType: 'custom_content', performers: [], tags: [] },
])

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/sku/detail/index?id=${id}` })
}

function loadSkus() {
  loading.value = true
  error.value = false
  // 模拟数据加载，实际项目替换为真实接口调用
  setTimeout(() => {
    loading.value = false
    // error.value = true; // 取消注释可测试错误状态
  }, 800)
}

loadSkus()

userRole.value = (uni.getStorageSync('user_role') as UserRole) || 'client'
</script>

<style lang="scss" scoped>
.sku-list-page {
  background-color: $color-bg-page;

  &__search { padding: $space-md $space-base; }

  &__search-bar {
    display: flex;
    align-items: center;
    height: 72rpx;
    background-color: $color-bg-input;
    border-radius: $radius-full;
    padding: 0 $space-xl;
  }

  &__search-icon { font-size: 28rpx; margin-right: $space-sm; }

  &__search-input {
    flex: 1;
    font-size: $text-base;
    height: 100%;
  }

  &__search-placeholder { color: $color-text-placeholder; }

  &__tabs {
    white-space: nowrap;
    padding: $space-sm $space-base;
  }

  &__tab {
    display: inline-block;
    padding: 8rpx $space-lg;
    border-radius: $radius-full;
    font-size: $text-base;
    color: $color-text-secondary;
    background-color: #f0f0f2;
    margin-right: $space-sm;

    &--active {
      background-color: $color-primary;
      color: $color-text-inverse;
    }
  }

  &__filters {
    display: flex;
    gap: $space-md;
    padding: $space-sm $space-base $space-md;
  }

  &__filter {
    display: flex;
    align-items: center;
    gap: 4rpx;
    padding: 8rpx $space-md;
    border: 1rpx solid $color-border;
    border-radius: $radius-full;
    font-size: $text-sm;
    color: $color-text-secondary;
  }

  &__filter-arrow { font-size: $text-xs; }

  &__list {
    padding: 0 $space-base $space-xl;
    display: flex;
    flex-direction: column;
    gap: $space-md;
  }

  &__card {
    background-color: $color-bg-card;
    border-radius: $radius-md;
    overflow: hidden;
    box-shadow: $shadow-sm;

    &:active { opacity: 0.85; }
  }

  &__card-img {
    width: 100%;
    height: 320rpx;
  }

  &__card-body { padding: $space-md; }

  &__card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8rpx;
  }

  &__card-title {
    font-size: $text-md;
    font-weight: 500;
    color: $color-text-primary;
    flex: 1;
    margin-right: $space-sm;
  }

  &__card-sub {
    font-size: $text-sm;
    color: $color-text-secondary;
    margin-bottom: 8rpx;
    display: block;
  }

  &__card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8rpx;
  }

  &__card-price {
    font-size: $text-2xl;
    font-weight: 600;
    color: $color-primary;
    font-family: 'JetBrains Mono', monospace;
  }

  &__card-price-label {
    font-size: 20rpx;
    color: $color-text-tertiary;
    margin-left: 8rpx;
  }

  &__card-unit {
    font-size: $text-sm;
    font-weight: 400;
    color: $color-text-tertiary;
  }

  &__card-meta {
    display: flex;
    align-items: center;
    gap: $space-md;
  }

  &__card-rating {
    font-size: $text-sm;
    color: $state-pending;
  }

  &__card-sales {
    font-size: $text-sm;
    color: $color-text-tertiary;
  }
}
</style>

.supplier-badge {
  display: inline-block;
  font-size: 20rpx;
  font-weight: 600;
  padding: 2rpx 12rpx;
  border-radius: $radius-full;
  margin-top: 4rpx;
}
.supplier-badge.self { background: $color-primary-subtle; color: $color-primary; }
.supplier-badge.broker { background: $color-bg-input; color: $color-text-secondary; }
.supplier-badge.indie { background: #ecfdf5; color: $color-success; }

/* ===== 加载骨架屏 ===== */
.sku-loading {
  padding: 0 $space-base $space-xl;
  display: flex;
  flex-direction: column;
  gap: $space-md;
}
.sku-loading-card {
  display: flex;
  gap: $space-md;
  background: $color-bg-card;
  border-radius: $radius-md;
  overflow: hidden;
  box-shadow: $shadow-sm;
  padding: $space-md;
}
.sku-loading-img {
  width: 240rpx;
  height: 200rpx;
  flex-shrink: 0;
  border-radius: $radius-sm;
  background: linear-gradient(90deg, $color-bg-input 25%, darken($color-bg-input, 3%) 50%, $color-bg-input 75%);
  background-size: 200% 100%;
  animation: sku-shimmer 1.5s ease-in-out infinite;
}
.sku-loading-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: $space-sm;
}
.sku-loading-line {
  height: 28rpx;
  border-radius: $radius-sm;
  background: linear-gradient(90deg, $color-bg-input 25%, darken($color-bg-input, 3%) 50%, $color-bg-input 75%);
  background-size: 200% 100%;
  animation: sku-shimmer 1.5s ease-in-out infinite;
}
@keyframes sku-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ===== 空状态 ===== */
.sku-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 160rpx $space-base;
}
.sku-empty-icon { font-size: 80rpx; margin-bottom: $space-md; }
.sku-empty-text { font-size: $text-lg; font-weight: 700; color: $color-text-primary; margin-bottom: $space-xs; }
.sku-empty-hint { font-size: $text-sm; color: $color-text-secondary; }

/* ===== 错误状态 ===== */
.sku-error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 160rpx $space-base;
}
.sku-error-icon { font-size: 80rpx; margin-bottom: $space-md; }
.sku-error-text { font-size: $text-lg; font-weight: 700; color: $color-text-primary; margin-bottom: $space-xs; }
.sku-error-hint { font-size: $text-sm; color: $color-text-secondary; margin-bottom: $space-lg; }
.sku-error-retry {
  height: 72rpx;
  padding: 0 48rpx;
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