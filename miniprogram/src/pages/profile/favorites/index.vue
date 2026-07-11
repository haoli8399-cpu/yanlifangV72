<template>
  <view class="favorites-page">
    <CfNavBar title="我的收藏" :showBack="true" backText="返回" />

    <!-- 加载骨架屏 -->
    <view v-if="loading" class="skeleton">
      <view v-for="i in 3" :key="i" class="card skeleton-card">
        <view class="skeleton-line" style="width: 60%; margin-bottom: 24rpx;" />
        <view class="skeleton-line skeleton-line--sm" style="width: 80%;" />
      </view>
    </view>

    <template v-else>
      <!-- 双 Tab -->
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
      <view v-if="list.length === 0" class="empty-state">
        <text class="empty-state__icon">⭐</text>
        <text class="empty-state__title">暂无收藏</text>
        <text class="empty-state__desc">去「找方案」收藏你喜欢的演出方案吧</text>
      </view>

      <!-- 收藏方案 -->
      <view v-if="activeTab === 'plan'" class="fav-list">
        <view
          v-for="item in planFavs"
          :key="item.id"
          class="card fav-card"
          @tap="openSku(item.id)"
        >
          <image :src="item.cover" mode="aspectFill" class="fav-card__cover" />
          <view class="fav-card__info">
            <text class="fav-card__name">{{ item.name }}</text>
            <view class="fav-card__meta">
              <view class="fav-card__tag"><text>{{ item.tier }}</text></view>
              <text class="fav-card__supplier">{{ item.supplier }}</text>
            </view>
            <text class="fav-card__price">¥{{ item.price.toLocaleString() }}/场</text>
          </view>
          <view class="fav-card__remove" @tap.stop="remove(item.id)" >
            <text>取消收藏</text>
          </view>
        </view>
      </view>

      <!-- 收藏案例 -->
      <view v-else class="fav-list">
        <view
          v-for="item in caseFavs"
          :key="item.id"
          class="card fav-card"
          @tap="uni.showToast({ title: '案例详情开发中', icon: 'none' })"
        >
          <image :src="item.cover" mode="aspectFill" class="fav-card__cover" />
          <view class="fav-card__info">
            <text class="fav-card__name">{{ item.name }}</text>
            <text class="fav-card__supplier">{{ item.client }} · {{ item.scene }}</text>
          </view>
          <view class="fav-card__remove" @tap.stop="removeCase(item.id)">
            <text>取消收藏</text>
          </view>
        </view>
      </view>
      <view class="bottom-space" />
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import CfNavBar from '@/components/CfNavBar.vue'

interface PlanFav { id: string; name: string; tier: string; supplier: string; price: number; cover: string }
interface CaseFav { id: string; name: string; client: string; scene: string; cover: string }

const loading = ref(true)
const tabs = [
  { key: 'plan', label: '收藏方案' },
  { key: 'case', label: '收藏案例' },
]
const activeTab = ref('plan')

const planFavs = ref<PlanFav[]>([
  { id: 'p1', name: '周末脱口秀之夜', tier: 'T3', supplier: '演立方自营', price: 8800, cover: '/static/images/show-card-1.jpg' },
  { id: 'p2', name: '即兴喜剧专场', tier: 'T4', supplier: '欢笑工厂', price: 12000, cover: '/static/images/show-card-2.jpg' },
  { id: 'p3', name: '亲子喜剧嘉年华', tier: 'T2', supplier: '童趣喜剧', price: 5600, cover: '/static/images/show-card-3.jpg' },
])
const caseFavs = ref<CaseFav[]>([
  { id: 'c1', name: 'XX科技年会案例', client: 'XX科技', scene: '企业年会', cover: '/static/images/show-card-1.jpg' },
])

const list = computed(() => (activeTab.value === 'plan' ? planFavs.value : caseFavs.value))

function openSku(id: string) {
  uni.navigateTo({ url: `/pages/sku/detail/index?id=${id}` })
}
function remove(id: string) {
  planFavs.value = planFavs.value.filter(p => p.id !== id)
  uni.showToast({ title: '已取消收藏', icon: 'none' })
}
function removeCase(id: string) {
  caseFavs.value = caseFavs.value.filter(c => c.id !== id)
  uni.showToast({ title: '已取消收藏', icon: 'none' })
}

onMounted(() => {
  setTimeout(() => { loading.value = false }, 500)
})
</script>

<style lang="scss" scoped>
.favorites-page {
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

.fav-list { padding: $space-base $space-base 0; }

.fav-card {
  display: flex;
  align-items: center;
  gap: $space-md;

  & + & { margin-top: $space-md; }

  &__cover {
    width: 140rpx;
    height: 140rpx;
    border-radius: $radius-md;
    flex-shrink: 0;
    background: $color-bg-input;
  }

  &__info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8rpx; }
  &__name { font-size: $text-md; font-weight: 700; color: $color-text-primary; }
  &__meta { display: flex; align-items: center; gap: $space-sm; }
  &__tag {
    padding: 2rpx 12rpx;
    border-radius: $radius-xs;
    background: $color-primary-subtle;
    color: $color-primary;
    font-size: $text-xs;
    font-weight: 600;
  }
  &__supplier { font-size: $text-sm; color: $color-text-secondary; }
  &__price { font-family: 'JetBrains Mono', monospace; font-size: $text-lg; font-weight: 700; color: $color-primary; }

  &__remove {
    align-self: center;
    padding: 10rpx 20rpx;
    border: 2rpx solid $color-border;
    border-radius: $radius-full;
    font-size: $text-xs;
    color: $color-text-tertiary;

    &:active { background: $color-bg-input; }
  }
}

.bottom-space { height: $space-2xl; }

// 骨架屏
.skeleton { padding: $space-base; }
.skeleton-card { height: 180rpx; }
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
