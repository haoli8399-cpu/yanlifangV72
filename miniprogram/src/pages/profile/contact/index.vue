<template>
  <view class="contact-page">
    <CfNavBar title="联系客服" :showBack="true" backText="返回" />

    <!-- 客服卡片 -->
    <view class="card contact-page__card">
      <view class="contact-page__cs">
        <view class="contact-page__cs-avatar"><text>🎧</text></view>
        <view class="contact-page__cs-info">
          <text class="contact-page__cs-name">演立方客服 · 小演团队</text>
          <text class="contact-page__cs-desc">工作日 9:00 - 21:00 在线服务</text>
        </view>
      </view>

      <view class="contact-page__actions">
        <view class="contact-page__action" @tap="callPhone">
          <text class="contact-page__action-icon">📞</text>
          <view class="contact-page__action-info">
            <text class="contact-page__action-title">客服电话</text>
            <text class="contact-page__action-sub">{{ phone }}</text>
          </view>
        </view>
        <view class="contact-page__action" @tap="onlineService">
          <text class="contact-page__action-icon">💬</text>
          <view class="contact-page__action-info">
            <text class="contact-page__action-title">在线客服</text>
            <text class="contact-page__action-sub">点击接入小演对话</text>
          </view>
        </view>
      </view>

      <view class="contact-page__worktime">
        <text class="contact-page__worktime-label">工作时间</text>
        <text class="contact-page__worktime-value">周一至周日 9:00 - 21:00（法定节假日另行通知）</text>
      </view>
    </view>

    <!-- FAQ -->
    <text class="contact-page__faq-title">常见问题</text>
    <view class="card contact-page__faq">
      <view
        v-for="(item, i) in faqs"
        :key="i"
        class="contact-page__faq-item"
        :class="{ 'contact-page__faq-item--last': i === faqs.length - 1 }"
      >
        <view class="contact-page__faq-q" @tap="toggle(i)">
          <text class="contact-page__faq-q-text">{{ item.q }}</text>
          <text class="contact-page__faq-arrow" :class="{ 'contact-page__faq-arrow--open': item.open }">›</text>
        </view>
        <view v-if="item.open" class="contact-page__faq-a">
          <text>{{ item.a }}</text>
        </view>
      </view>
    </view>
    <view class="bottom-space" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CfNavBar from '@/components/CfNavBar.vue'

const phone = '400-888-6688'

const faqs = ref([
  { q: '如何发布演出需求？', a: '首页点击「提需求」，粘贴活动信息或选择活动类型，小演会自动生成方案并匹配演员。', open: false },
  { q: '报价包含哪些费用？', a: '报价含演员费用、基础设备与互动环节；异地演出的差旅费会在最终方案里单独说明。', open: false },
  { q: '演员档期如何确认？', a: '确认报价后进入签约流程，系统会锁定演员档期并推送签到提醒，避免冲突。', open: false },
  { q: '为什么没有收到报价？', a: '请检查需求信息是否完整，或联系客服电话，我们会优先为您推进匹配。', open: false },
  { q: '如何申请发票？', a: '在「我的 - 发票管理」中，对已完成结算的订单点击「申请开票」即可。', open: false },
])

function callPhone() {
  uni.makePhoneCall({ phoneNumber: phone.replace(/-/g, '') })
}
function onlineService() {
  uni.showToast({ title: '正在接入小演…', icon: 'none' })
}
function toggle(i: number) {
  faqs.value[i].open = !faqs.value[i].open
}
</script>

<style lang="scss" scoped>
.contact-page {
  min-height: 100vh;
  background: $color-bg-page;

  &__card { margin: 24rpx $space-base 0; }

  &__cs { display: flex; align-items: center; gap: $space-md; padding-bottom: $space-md; border-bottom: 1rpx solid $color-divider; }
  &__cs-avatar {
    width: 96rpx; height: 96rpx; border-radius: 50%;
    background: $color-primary-subtle; color: $color-primary;
    display: flex; align-items: center; justify-content: center; font-size: 48rpx; flex-shrink: 0;
  }
  &__cs-info { display: flex; flex-direction: column; }
  &__cs-name { font-size: $text-lg; font-weight: 700; color: $color-text-primary; }
  &__cs-desc { font-size: $text-sm; color: $color-text-secondary; margin-top: 6rpx; }

  &__actions { padding: $space-md 0; }
  &__action {
    display: flex; align-items: center; gap: $space-md;
    padding: $space-sm 0;

    & + & { border-top: 1rpx solid $color-divider; }
    &:active { opacity: 0.7; }
  }
  &__action-icon { font-size: 44rpx; }
  &__action-info { display: flex; flex-direction: column; }
  &__action-title { font-size: $text-base; font-weight: 600; color: $color-text-primary; }
  &__action-sub { font-size: $text-sm; color: $color-text-secondary; margin-top: 4rpx; }

  &__worktime {
    display: flex; flex-direction: column;
    padding-top: $space-md;
    border-top: 1rpx solid $color-divider;
  }
  &__worktime-label { font-size: $text-base; font-weight: 600; color: $color-text-primary; margin-bottom: 8rpx; }
  &__worktime-value { font-size: $text-sm; color: $color-text-secondary; line-height: 1.6; }

  &__faq-title { display: block; margin: $space-lg $space-base $space-sm; font-size: $text-xl; font-weight: 700; color: $color-text-primary; }
  &__faq { padding: 0 $space-lg; }

  &__faq-item {
    padding: $space-md 0;
    & + & { border-top: 1rpx solid $color-divider; }
    &--last { border-bottom: none; }
  }
  &__faq-q { display: flex; align-items: center; justify-content: space-between; }
  &__faq-q-text { font-size: $text-base; font-weight: 600; color: $color-text-primary; flex: 1; }
  &__faq-arrow { font-size: $text-2xl; color: $color-text-tertiary; transition: transform 0.2s ease; }
  &__faq-arrow--open { transform: rotate(90deg); }
  &__faq-a {
    margin-top: $space-sm;
    font-size: $text-sm;
    color: $color-text-secondary;
    line-height: 1.7;
  }
}

.bottom-space { height: $space-2xl; }
</style>
