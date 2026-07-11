<template>
  <view class="message-page">
    <CfNavBar title="" />

    <!-- 加载骨架屏 -->
    <template v-if="loading">
      <view class="skeleton-tab-row">
        <view v-for="i in 4" :key="i" class="skeleton-tab" />
      </view>
      <view class="message-list">
        <view v-for="i in 4" :key="i" class="skeleton-message-item">
          <view class="skeleton-message-avatar" />
          <view class="skeleton-message-content">
            <view class="skeleton-line" style="width: 55%; margin-bottom: 12rpx;" />
            <view class="skeleton-line skeleton-line--sm" style="width: 80%;" />
          </view>
        </view>
      </view>
    </template>

    <!-- 错误状态 -->
    <view v-else-if="error" class="error-state">
      <text class="error-state__icon">😵</text>
      <text class="error-state__title">加载失败</text>
      <text class="error-state__desc">网络不给力，请检查网络后重试</text>
      <view class="error-state__btn" @tap="loadMessages">
        <text>重新加载</text>
      </view>
    </view>

    <!-- 正常内容 -->
    <template v-else>
      <view class="tab-row">
        <view
          v-for="tab in tabs"
          :key="tab"
          class="tab-row__item"
          :class="{ 'tab-row__item--active': activeTab === tab }"
          @tap="activeTab = tab"
        >
          <text>{{ tab }}</text>
        </view>
      </view>

      <scroll-view scroll-y class="message-list" :show-scrollbar="false">
        <!-- 空状态 -->
        <view v-if="filteredMessages.length === 0" class="empty-state">
          <text class="empty-state__icon">📭</text>
          <text class="empty-state__title">暂无消息</text>
          <text class="empty-state__desc">当有新消息时，会在这里显示</text>
        </view>

        <view
          v-for="item in filteredMessages"
          :key="item.id"
          class="message-item"
          :class="`message-item--${item.tone}`"
          @tap="openDetail(item.id)"
        >
          <view class="message-item__avatar" :class="`message-item__avatar--${item.tone}`">
            <text>{{ item.icon }}</text>
          </view>
          <view class="message-item__content">
            <view class="message-item__top">
              <text class="message-item__title">{{ item.title }}</text>
              <text class="message-item__time">{{ item.time }}</text>
            </view>
            <text class="message-item__summary">{{ item.summary }}</text>
          </view>
          <view v-if="item.unread" class="message-item__dot" />
        </view>
        <view class="bottom-space" />
      </scroll-view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import CfNavBar from '@/components/CfNavBar.vue'

const loading = ref(true)
const error = ref(false)

const tabs = ['全部', '方案通知', '跟进消息', '系统']
const activeTab = ref('全部')

const messages = ref([
  {
    id: 'm1',
    type: '全部',
    tone: 'agent',
    icon: '◇',
    title: '小演 · XX科技年会',
    time: '10:32',
    summary: 'T3级60min ¥6,000，点击查看详情',
    unread: true,
  },
  {
    id: 'm2',
    type: '方案通知',
    tone: 'plan',
    icon: '◇',
    title: '方案通知',
    time: '09:15',
    summary: 'XX地产开盘方案已被客户查看',
    unread: false,
  },
  {
    id: 'm3',
    type: '跟进消息',
    tone: 'follow',
    icon: '◈',
    title: '跟进提醒',
    time: '昨天',
    summary: 'XX银行答谢已等待48h，需要今天推进确认',
    unread: true,
  },
  {
    id: 'm4',
    type: '方案通知',
    tone: 'plan',
    icon: '◇',
    title: '报价已发送',
    time: '昨天',
    summary: 'XX保险年会报价已发送给活动公司',
    unread: false,
  },
  {
    id: 'm5',
    type: '系统',
    tone: 'system',
    icon: '◉',
    title: '系统通知',
    time: '07-05',
    summary: '本月成交率提升 20%，继续保持响应速度',
    unread: false,
  },
])

const filteredMessages = computed(() => {
  if (activeTab.value === '全部') return messages.value
  return messages.value.filter(item => item.type === activeTab.value)
})

async function loadMessages() {
  loading.value = true
  error.value = false
  try {
    // 模拟数据加载（后续接入真实 API）
    await new Promise(resolve => setTimeout(resolve, 600))
    // TODO: 调用真实 API 获取消息列表
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}

function openDetail(id: string) {
  uni.navigateTo({ url: `/pages/message/detail/index?id=${id}` })
}

onMounted(() => {
  loadMessages()
})
</script>

<style lang="scss" scoped>
.message-page {
  min-height: 100vh;
  background: $color-bg-page;
  padding-bottom: calc($tab-bar-height + $space-lg);
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

.message-list {
  height: calc(100vh - 180rpx);
  padding: $space-sm $space-base 0;
}

.message-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: $space-sm;
  padding: $space-md;
  border: 1rpx solid $color-border;
  border-left: 6rpx solid $color-border;
  border-radius: $radius-md;
  background: $color-bg-card;

  &--agent { border-left-color: $color-primary; }
  &--follow { border-left-color: $color-danger; background: rgba($color-danger, 0.04); }
  &--plan { border-left-color: $color-info; }
  &--system { border-left-color: $color-success; }

  & + & {
    margin-top: $space-sm;
  }

  &__avatar {
    width: 76rpx;
    height: 76rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: $text-lg;

    &--agent { background: $color-primary-subtle; color: $color-primary; }
    &--plan { background: rgba($color-info, 0.1); color: $color-info; }
    &--follow { background: rgba($color-danger, 0.08); color: $color-danger; }
    &--system { background: rgba($color-success, 0.1); color: $color-success; }
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $space-sm;
  }

  &__title {
    color: $color-text-primary;
    font-size: $text-base;
    font-weight: 800;
  }

  &__time {
    color: $color-text-tertiary;
    font-size: $text-xs;
    white-space: nowrap;
  }

  &__summary {
    display: block;
    margin-top: 4rpx;
    color: $color-text-secondary;
    font-size: $text-base;
    line-height: 1.45;
  }

  &__dot {
    position: absolute;
    top: $space-md;
    right: $space-md;
    width: 20rpx;
    height: 20rpx;
    border-radius: 50%;
    background: $color-danger;
  }
}

.bottom-space {
  height: $space-xl;
}

// ===== 加载骨架屏 =====
.skeleton-tab-row {
  display: flex;
  gap: $space-sm;
  padding: $space-sm $space-base;
  background: $color-bg-card;
  border-bottom: 1rpx solid $color-border;
}

.skeleton-tab {
  flex: 1;
  height: 56rpx;
  border-radius: $radius-full;
  background: linear-gradient(90deg, $color-bg-input 25%, darken($color-bg-input, 3%) 50%, $color-bg-input 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-message-item {
  display: flex;
  align-items: center;
  gap: $space-sm;
  padding: $space-md;
  border: 1rpx solid $color-border;
  border-left: 6rpx solid $color-border;
  border-radius: $radius-md;
  background: $color-bg-card;

  &--agent { border-left-color: $color-primary; }
  &--follow { border-left-color: $color-danger; background: rgba($color-danger, 0.04); }
  &--plan { border-left-color: $color-info; }
  &--system { border-left-color: $color-success; }

  & + & {
    margin-top: $space-sm;
  }
}

.skeleton-message-avatar {
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  flex-shrink: 0;
  background: linear-gradient(90deg, $color-bg-input 25%, darken($color-bg-input, 3%) 50%, $color-bg-input 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-message-content {
  flex: 1;
  min-width: 0;
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

// ===== 空状态 =====
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx $space-base;

  &__icon {
    font-size: 80rpx;
    margin-bottom: $space-md;
  }

  &__title {
    font-size: $text-lg;
    font-weight: 600;
    color: $color-text-primary;
    margin-bottom: $space-xs;
  }

  &__desc {
    font-size: $text-sm;
    color: $color-text-tertiary;
  }
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
