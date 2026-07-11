<template>
  <view class="cf-status-tag" :class="[`cf-status-tag--${type}`]">
    <text>{{ label }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { StatusLabels } from '@/types'
import type { RequestStatus, AssignmentStatus } from '@/types'

const props = defineProps<{
  type: RequestStatus | AssignmentStatus | 'completed' | 'transferred' | 'settled' | 'pending' | 'rejected'
}>()

const labelMap: Record<string, string> = {
  ...StatusLabels,
  completed: '已完成',
  transferred: '已打款',
  settled: '已结算',
  pending: '待确认',
  rejected: '已拒绝',
}

const label = computed(() => labelMap[props.type] || props.type)
</script>

<style lang="scss" scoped>
.cf-status-tag {
  display: inline-flex;
  align-items: center;
  padding: 4rpx 16rpx;
  border-radius: $radius-xs;
  font-size: $text-xs;
  font-weight: 500;

  &--pending_quote,
  &--pending {
    color: $state-pending;
    background-color: $state-pending-bg;
  }
  &--quoted {
    color: $state-quoted;
    background-color: $state-quoted-bg;
  }
  &--confirmed {
    color: $state-confirmed;
    background-color: $state-confirmed-bg;
  }
  &--signed {
    color: $state-signed;
    background-color: $state-signed-bg;
  }
  &--cancelled,
  &--rejected {
    color: $state-cancelled;
    background-color: $state-cancelled-bg;
  }
  &--completed {
    color: $state-quoted;
    background-color: $state-quoted-bg;
  }
  &--settled {
    color: $state-confirmed;
    background-color: $state-confirmed-bg;
  }
  &--transferred {
    color: $state-quoted;
    background-color: $state-quoted-bg;
  }
}
</style>
