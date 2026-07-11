<template>
  <view class="demand-page">
    <CfNavBar title="我的需求" :showBack="true" backText="返回" />

    <!-- 加载骨架屏 -->
    <view v-if="loading" class="skeleton">
      <view v-for="i in 3" :key="i" class="card skeleton-card">
        <view class="skeleton-line" style="width: 50%; margin-bottom: 24rpx;" />
        <view class="skeleton-line skeleton-line--sm" style="width: 70%;" />
        <view class="skeleton-line skeleton-line--sm" style="width: 90%; margin-top: 12rpx;" />
      </view>
    </view>

    <!-- 正常内容 -->
    <template v-else>
      <!-- Tab 筛选 -->
      <view class="tab-row">
        <view
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-row__item"
          :class="{ 'tab-row__item--active': activeTab === tab.key }"
          @tap="activeTab = tab.key"
        >
          <text>{{ tab.label }}</text>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="filteredDemands.length === 0" class="empty-state">
        <text class="empty-state__icon">📋</text>
        <text class="empty-state__title">暂无需求</text>
        <text class="empty-state__desc">发布需求后，这里会展示你的商演订单</text>
      </view>

      <!-- 列表 -->
      <view class="demand-list">
        <view
          v-for="item in filteredDemands"
          :key="item.id"
          class="card demand-card"
          @tap="openDetail(item.id)"
        >
          <view class="demand-card__top">
            <text class="demand-card__title">{{ item.title }}</text>
            <CfStatusTag :type="item.status" />
          </view>
          <view class="demand-card__tags">
            <view class="demand-card__tag"><text>{{ showTypeLabel(item.showType) }}</text></view>
            <text class="demand-card__time">{{ item.createdAt }}</text>
          </view>
          <view class="demand-card__bottom">
            <text class="demand-card__budget">预算 ¥{{ item.budgetMin.toLocaleString() }} - ¥{{ item.budgetMax.toLocaleString() }}</text>
            <text class="demand-card__arrow">›</text>
          </view>
        </view>
        <view class="bottom-space" />
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import CfNavBar from '@/components/CfNavBar.vue'
import CfStatusTag from '@/components/CfStatusTag.vue'
import { ShowTypeLabels, type RequestStatus, type ShowType } from '@/types'

interface Demand {
  id: string
  title: string
  showType: ShowType
  status: RequestStatus
  createdAt: string
  budgetMin: number
  budgetMax: number
}

const loading = ref(true)
const tabs = [
  { key: 'all', label: '全部' },
  { key: 'ongoing', label: '进行中' },
  { key: 'done', label: '已完成' },
]
const activeTab = ref('all')

const demands = ref<Demand[]>([
  { id: 'r1', title: '2026公司年会脱口秀', showType: 'talkshow', status: 'quoted', createdAt: '2026-07-05', budgetMin: 8000, budgetMax: 15000 },
  { id: 'r2', title: '品牌发布会暖场演出', showType: 'improv', status: 'signed', createdAt: '2026-06-28', budgetMin: 12000, budgetMax: 20000 },
  { id: 'r3', title: '客户答谢会定制专场', showType: 'newcomedy', status: 'pending_quote', createdAt: '2026-07-08', budgetMin: 5000, budgetMax: 10000 },
  { id: 'r4', title: '商场周末亲子喜剧', showType: 'family', status: 'cancelled', createdAt: '2026-06-20', budgetMin: 3000, budgetMax: 6000 },
])

const filteredDemands = computed(() => {
  if (activeTab.value === 'all') return demands.value
  if (activeTab.value === 'ongoing') {
    return demands.value.filter(d => ['pending_quote', 'quoted', 'confirmed'].includes(d.status))
  }
  return demands.value.filter(d => ['signed', 'cancelled'].includes(d.status))
})

function showTypeLabel(t: ShowType) {
  return ShowTypeLabels[t] || t
}

function openDetail(id: string) {
  uni.navigateTo({ url: `/pages/request/detail/index?id=${id}` })
}

onMounted(() => {
  setTimeout(() => { loading.value = false }, 500)
})
</script>

<style lang="scss" scoped>
.demand-page {
  min-height: 100vh;
  background: $color-bg-page;
}

.tab-row {
  display: flex;
  gap: $space-sm;
  padding: $space-sm $space-base;
  background: $color-bg-card;
  border-bottom: 1rpx solid $color-border;

  &__item {
    flex: 1;
    height: 56rpx;
    border-radius: $radius-full;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-text-secondary;
    background: $color-bg-input;
    font-size: $text-xs;
    font-weight: 700;

    &--active {
      color: $color-text-inverse;
      background: $color-primary;
    }
  }
}

.demand-list {
  padding: $space-base $space-base 0;
}

.demand-card {
  & + & { margin-top: $space-md; }

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $space-sm;
  }

  &__title {
    font-size: $text-lg;
    font-weight: 700;
    color: $color-text-primary;
    flex: 1;
  }

  &__tags {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: $space-sm;
  }

  &__tag {
    padding: 4rpx 16rpx;
    border-radius: $radius-xs;
    background: $color-primary-subtle;
    font-size: $text-xs;
    color: $color-primary;
    font-weight: 600;
  }

  &__time { font-size: $text-sm; color: $color-text-tertiary; }

  &__bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: $space-md;
    padding-top: $space-sm;
    border-top: 1rpx solid $color-divider;
  }

  &__budget { font-size: $text-base; color: $color-text-secondary; }
  &__arrow { font-size: $text-2xl; color: $color-text-tertiary; }
}

.bottom-space { height: $space-2xl; }

// 骨架屏
.skeleton { padding: $space-base; }
.skeleton-card { margin-bottom: $space-md; }
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

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 160rpx $space-base;

  &__icon { font-size: 80rpx; margin-bottom: $space-md; }
  &__title { font-size: $text-lg; font-weight: 600; color: $color-text-primary; margin-bottom: $space-xs; }
  &__desc { font-size: $text-sm; color: $color-text-tertiary; text-align: center; }
}
</style>
