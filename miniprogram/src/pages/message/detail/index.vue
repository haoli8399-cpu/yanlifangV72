<template>
  <view class="msg-detail-page">
    <CfNavBar title="消息详情" :showBack="true" backText="返回" />

    <!-- 加载骨架屏 -->
    <view v-if="loading" class="skeleton">
      <view class="skeleton-head" />
      <view class="card" style="margin-top: 24rpx;">
        <view class="skeleton-line" style="width: 50%; margin-bottom: 24rpx;" />
        <view class="skeleton-line skeleton-line--sm" style="width: 90%;" />
        <view class="skeleton-line skeleton-line--sm" style="width: 80%; margin-top: 12rpx;" />
        <view class="skeleton-line skeleton-line--sm" style="width: 60%; margin-top: 12rpx;" />
      </view>
    </view>

    <!-- 错误状态 -->
    <view v-else-if="error" class="error-state">
      <text class="error-state__icon">😵</text>
      <text class="error-state__title">加载失败</text>
      <text class="error-state__desc">消息不存在或网络异常</text>
      <view class="error-state__btn" @tap="loadDetail"><text>重新加载</text></view>
    </view>

    <!-- 正常内容 -->
    <template v-else-if="msg">
      <!-- 头部 -->
      <view class="msg-detail-page__head card">
        <view class="msg-detail-page__head-left">
          <view class="msg-detail-page__avatar" :class="`msg-detail-page__avatar--${msg.tone}`">
            <text>{{ msg.icon }}</text>
          </view>
          <view class="msg-detail-page__head-info">
            <text class="msg-detail-page__sender">{{ msg.title }}</text>
            <text class="msg-detail-page__time">{{ msg.time }}</text>
          </view>
        </view>
        <view class="msg-detail-page__type" :class="`msg-detail-page__type--${msg.tone}`">
          <text>{{ typeLabel }}</text>
        </view>
      </view>

      <!-- 方案通知 -->
      <view v-if="msg.type === '方案通知'" class="card msg-detail-page__plan">
        <text class="card-title">方案详情</text>
        <view class="msg-detail-page__row">
          <text class="msg-detail-page__label">方案名称</text>
          <text class="msg-detail-page__value">{{ detail.planName }}</text>
        </view>
        <view class="msg-detail-page__row">
          <text class="msg-detail-page__label">演员级别</text>
          <view class="status-tag status-tag--signed"><text>{{ detail.tier }}</text></view>
        </view>
        <view class="msg-detail-page__row">
          <text class="msg-detail-page__label">报价金额</text>
          <text class="msg-detail-page__price">¥{{ detail.price.toLocaleString() }}</text>
        </view>
        <view class="msg-detail-page__row">
          <text class="msg-detail-page__label">报价时间</text>
          <text class="msg-detail-page__value">{{ detail.quotedAt }}</text>
        </view>
      </view>

      <!-- 跟进消息 -->
      <view v-else-if="msg.type === '跟进消息'" class="card msg-detail-page__follow">
        <text class="card-title">跟进历史</text>
        <view class="msg-detail-page__timeline">
          <view
            v-for="(t, i) in detail.follows"
            :key="i"
            class="msg-detail-page__timeline-item"
            :class="{ 'msg-detail-page__timeline-item--last': i === detail.follows.length - 1 }"
          >
            <view class="msg-detail-page__timeline-avatar">
              <text>{{ t.avatar }}</text>
            </view>
            <view class="msg-detail-page__timeline-body">
              <view class="msg-detail-page__timeline-top">
                <text class="msg-detail-page__timeline-name">{{ t.name }}</text>
                <text class="msg-detail-page__timeline-time">{{ t.time }}</text>
              </view>
              <text class="msg-detail-page__timeline-text">{{ t.text }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 系统通知 -->
      <view v-else class="card msg-detail-page__system">
        <text class="card-title">通知内容</text>
        <text class="msg-detail-page__system-text">{{ detail.content }}</text>
      </view>

      <!-- 底部操作按钮 -->
      <view class="msg-detail-page__footer">
        <view class="msg-detail-page__action" :class="`msg-detail-page__action--${actionType.style}`" @tap="onAction">
          <text>{{ actionType.text }}</text>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import CfNavBar from '@/components/CfNavBar.vue'

interface MsgItem {
  id: string
  type: '全部' | '方案通知' | '跟进消息' | '系统'
  tone: 'agent' | 'plan' | 'follow' | 'system'
  icon: string
  title: string
  time: string
  summary: string
  unread: boolean
}

// 与列表页保持一致的 mock 数据，详情页按 id 取完整内容
const mockList: MsgItem[] = [
  { id: 'm1', type: '全部', tone: 'agent', icon: '◇', title: '小演 · XX科技年会', time: '10:32', summary: 'T3级60min ¥6,000，点击查看详情', unread: true },
  { id: 'm2', type: '方案通知', tone: 'plan', icon: '◇', title: '方案通知', time: '09:15', summary: 'XX地产开盘方案已被客户查看', unread: false },
  { id: 'm3', type: '跟进消息', tone: 'follow', icon: '◈', title: '跟进提醒', time: '昨天', summary: 'XX银行答谢已等待48h，需要今天推进确认', unread: true },
  { id: 'm4', type: '方案通知', tone: 'plan', icon: '◇', title: '报价已发送', time: '昨天', summary: 'XX保险年会报价已发送给活动公司', unread: false },
  { id: 'm5', type: '系统', tone: 'system', icon: '◉', title: '系统通知', time: '07-05', summary: '本月成交率提升 20%，继续保持响应速度', unread: false },
]

const detailMap: Record<string, any> = {
  m1: { planName: '周末脱口秀之夜', tier: 'T3', price: 6000, quotedAt: '2026-07-08 10:32' },
  m2: { planName: 'XX地产开盘暖场方案', tier: 'T4', price: 12000, quotedAt: '2026-07-07 09:15' },
  m3: {
    follows: [
      { avatar: '◈', name: '小演', time: '07-06 14:00', text: '已为您匹配 3 位 T3 级以上演员，等待客户确认。' },
      { avatar: '◈', name: '小演', time: '07-07 10:20', text: '客户查看了方案，未回复，建议今天电话推进。' },
      { avatar: '◈', name: '小演', time: '07-08 09:00', text: '已等待 48h，请尽快确认，避免档期被占。' },
    ],
  },
  m4: { planName: 'XX保险年会定制专场', tier: 'T3', price: 8800, quotedAt: '2026-07-07 16:40' },
  m5: { content: '本月成交率环比提升 20%，感谢您的快速响应。继续保持，更多优质企业客户正在涌入演立方。' },
}

const loading = ref(true)
const error = ref(false)
const msgId = ref('')
const msg = ref<MsgItem | null>(null)
const detail = ref<any>({})

const typeLabel = computed(() => {
  const map: Record<string, string> = { 方案通知: '方案通知', 跟进消息: '跟进消息', 系统: '系统通知' }
  return map[msg.value?.type || ''] || '消息'
})

const actionType = computed(() => {
  const t = msg.value?.type
  if (t === '方案通知') return { text: '立即查看', style: 'primary' }
  if (t === '跟进消息') return { text: '联系小演', style: 'primary' }
  return { text: '知道了', style: 'ghost' }
})

async function loadDetail() {
  loading.value = true
  error.value = false
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    const found = mockList.find(m => m.id === msgId.value) || null
    if (!found) {
      error.value = true
      msg.value = null
      return
    }
    msg.value = found
    detail.value = detailMap[found.id] || {}
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}

function onAction() {
  const t = msg.value?.type
  if (t === '方案通知') {
    uni.navigateTo({ url: '/pages/sku/detail/index' })
  } else if (t === '跟进消息') {
    uni.showToast({ title: '正在接入小演…', icon: 'none' })
  } else {
    uni.navigateBack({ delta: 1 })
  }
}

onLoad((options: Record<string, string>) => {
  msgId.value = options?.id || ''
  loadDetail()
})
</script>

<style lang="scss" scoped>
.msg-detail-page {
  min-height: 100vh;
  background: $color-bg-page;
  padding-bottom: calc($tab-bar-height + 40rpx);

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 24rpx $space-base 0;
  }

  &__head-left { display: flex; align-items: center; gap: $space-md; }
  &__avatar {
    width: 88rpx;
    height: 88rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $text-xl;
    flex-shrink: 0;

    &--agent { background: $color-primary-subtle; color: $color-primary; }
    &--plan { background: rgba($color-info, 0.1); color: $color-info; }
    &--follow { background: rgba($color-danger, 0.08); color: $color-danger; }
    &--system { background: rgba($color-success, 0.1); color: $color-success; }
  }

  &__head-info { display: flex; flex-direction: column; }
  &__sender { font-size: $text-lg; font-weight: 700; color: $color-text-primary; }
  &__time { font-size: $text-sm; color: $color-text-tertiary; margin-top: 4rpx; }

  &__type {
    padding: 6rpx 20rpx;
    border-radius: $radius-full;
    font-size: $text-xs;
    font-weight: 600;

    &--agent { background: $color-primary-subtle; color: $color-primary; }
    &--plan { background: rgba($color-info, 0.1); color: $color-info; }
    &--follow { background: rgba($color-danger, 0.08); color: $color-danger; }
    &--system { background: rgba($color-success, 0.1); color: $color-success; }
  }

  &__plan,
  &__follow,
  &__system { margin: 24rpx $space-base 0; }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $space-sm 0;

    & + & { border-top: 1rpx solid $color-divider; }
  }

  &__label { font-size: $text-base; color: $color-text-secondary; }
  &__value { font-size: $text-base; color: $color-text-primary; text-align: right; }
  &__price { font-family: 'JetBrains Mono', monospace; font-size: $text-xl; font-weight: 700; color: $color-primary; }

  &__timeline { padding-left: 8rpx; }
  &__timeline-item { display: flex; gap: $space-md; padding-bottom: $space-lg; position: relative; }
  &__timeline-avatar {
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    background: $color-primary-subtle;
    color: $color-primary;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $text-md;
    flex-shrink: 0;
  }
  &__timeline-body { flex: 1; }
  &__timeline-top { display: flex; align-items: center; justify-content: space-between; }
  &__timeline-name { font-size: $text-base; font-weight: 600; color: $color-text-primary; }
  &__timeline-time { font-size: $text-sm; color: $color-text-tertiary; }
  &__timeline-text { display: block; margin-top: 8rpx; font-size: $text-base; color: $color-text-secondary; line-height: 1.6; }

  &__system-text { display: block; font-size: $text-base; color: $color-text-secondary; line-height: 1.7; }

  &__footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 24rpx 32rpx calc(24rpx + env(safe-area-inset-bottom));
    background: $color-bg-card;
    border-top: 1rpx solid $color-border;
  }

  &__action {
    height: 88rpx;
    border-radius: $radius-full;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $text-base;
    font-weight: 600;

    &--primary { background: $color-primary; color: $color-text-inverse; }
    &--ghost { background: $color-primary-subtle; color: $color-primary; border: 2rpx solid $color-primary; }

    &:active { opacity: 0.85; }
  }
}

.card-title {
  font-size: $text-xl;
  font-weight: 600;
  color: $color-text-primary;
  margin-bottom: $space-md;
  display: block;
}

// 骨架屏
.skeleton { padding: 24rpx $space-base; }
.skeleton-head {
  height: 140rpx;
  border-radius: $radius-md;
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

  &--sm { height: 22rpx; }
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

// 错误状态
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 160rpx $space-base;

  &__icon { font-size: 96rpx; margin-bottom: $space-lg; }
  &__title { font-size: $text-xl; font-weight: 600; color: $color-text-primary; margin-bottom: $space-sm; }
  &__desc { font-size: $text-sm; color: $color-text-secondary; margin-bottom: $space-xl; }
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

    &:active { opacity: 0.8; }
  }
}
</style>
