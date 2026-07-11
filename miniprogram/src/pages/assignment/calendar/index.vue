<template>
  <view class="calendar-page">
    <CfNavBar title="排期日历" :showBack="true" backText="返回" />

    <!-- Month Selector -->
    <view class="calendar-page__month-selector">
      <text class="calendar-page__month-arrow" @tap="prevMonth">&#x2039;</text>
      <text class="calendar-page__month-text">{{ monthLabel }}</text>
      <text class="calendar-page__month-arrow" @tap="nextMonth">&#x203a;</text>
    </view>

    <!-- Calendar Grid -->
    <view class="calendar-page__grid card">
      <view class="calendar-page__weekdays">
        <text v-for="d in weekdays" :key="d" class="calendar-page__weekday">{{ d }}</text>
      </view>
      <view class="calendar-page__days">
        <view
          v-for="(day, i) in calendarDays"
          :key="i"
          class="calendar-page__day"
          :class="{
            'calendar-page__day--other': !day.currentMonth,
            'calendar-page__day--today': day.isToday,
            'calendar-page__day--selected': day.isSelected,
          }"
          @tap="selectDay(day)"
        >
          <text>{{ day.date }}</text>
          <view v-if="day.dotColor" class="calendar-page__dot" :style="{ backgroundColor: day.dotColor }" />
        </view>
      </view>
    </view>

    <!-- Legend -->
    <view class="calendar-page__legend">
      <view class="calendar-page__legend-item"><view class="calendar-page__legend-dot" style="background-color: $state-confirmed;" /><text>已确认</text></view>
      <view class="calendar-page__legend-item"><view class="calendar-page__legend-dot" style="background-color: $state-pending;" /><text>待确认</text></view>
      <view class="calendar-page__legend-item"><view class="calendar-page__legend-dot" style="background-color: $state-quoted;" /><text>已完成</text></view>
    </view>

    <!-- Selected Day Detail -->
    <view v-if="selectedDaySchedule" class="calendar-page__detail card">
      <text class="calendar-page__detail-title">{{ selectedDateLabel }} 排期</text>
      <view class="calendar-page__detail-card" style="border-left: 8rpx solid $state-confirmed;">
        <text class="calendar-page__detail-name">{{ selectedDaySchedule.title }}</text>
        <text class="calendar-page__detail-info">19:00 - 20:30 | 脱口秀</text>
        <text class="calendar-page__detail-info">北京朝阳区XX会议中心</text>
        <CfStatusTag type="confirmed" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CfNavBar from '@/components/CfNavBar.vue'
import CfStatusTag from '@/components/CfStatusTag.vue'

const weekdays = ['日', '一', '二', '三', '四', '五', '六']
const monthLabel = ref('2024年12月')

// Simplified calendar data for Dec 2024 (starts on Sunday)
const calendarDays = ref([
  // Nov 24-30
  { date: 24, currentMonth: false }, { date: 25, currentMonth: false }, { date: 26, currentMonth: false }, { date: 27, currentMonth: false }, { date: 28, currentMonth: false }, { date: 29, currentMonth: false }, { date: 30, currentMonth: false },
  // Dec 1-7
  { date: 1, currentMonth: true }, { date: 2, currentMonth: true }, { date: 3, currentMonth: true }, { date: 4, currentMonth: true }, { date: 5, currentMonth: true, dotColor: '#3b82f6' }, { date: 6, currentMonth: true }, { date: 7, currentMonth: true },
  // Dec 8-14
  { date: 8, currentMonth: true }, { date: 9, currentMonth: true }, { date: 10, currentMonth: true, dotColor: '#3b82f6' }, { date: 11, currentMonth: true }, { date: 12, currentMonth: true }, { date: 13, currentMonth: true }, { date: 14, currentMonth: true },
  // Dec 15-21
  { date: 15, currentMonth: true }, { date: 16, currentMonth: true }, { date: 17, currentMonth: true }, { date: 18, currentMonth: true }, { date: 19, currentMonth: true }, { date: 20, currentMonth: true, dotColor: '#22c55e', isSelected: true, isToday: true }, { date: 21, currentMonth: true },
  // Dec 22-28
  { date: 22, currentMonth: true, dotColor: '#22c55e' }, { date: 23, currentMonth: true }, { date: 24, currentMonth: true }, { date: 25, currentMonth: true, dotColor: '#f59e0b' }, { date: 26, currentMonth: true }, { date: 27, currentMonth: true }, { date: 28, currentMonth: true, dotColor: '#22c55e' },
  // Dec 29-31 + Jan
  { date: 29, currentMonth: true }, { date: 30, currentMonth: true }, { date: 31, currentMonth: true }, { date: 1, currentMonth: false }, { date: 2, currentMonth: false }, { date: 3, currentMonth: false }, { date: 4, currentMonth: false },
])

const selectedDateLabel = computed(() => '12月20日')
const selectedDaySchedule = ref({ title: '星辰文化年会演出' })

function selectDay(day: any) {
  calendarDays.value.forEach(d => d.isSelected = false)
  day.isSelected = true
}

function prevMonth() { monthLabel.value = '2024年11月' }
function nextMonth() { monthLabel.value = '2025年1月' }
</script>

<style lang="scss" scoped>
.calendar-page { background-color: $color-bg-page; padding-bottom: $space-2xl; }

.calendar-page__month-selector { display: flex; align-items: center; justify-content: center; padding: $space-md $space-base; gap: $space-2xl; }
.calendar-page__month-text { font-size: $text-md; font-weight: 600; color: $color-text-primary; }
.calendar-page__month-arrow { font-size: $text-2xl; color: $color-text-secondary; padding: $space-xs $space-sm; }

.calendar-page__grid { margin: 0 $space-base; padding: $space-lg !important; }

.calendar-page__weekdays { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: $space-md; }
.calendar-page__weekday { text-align: center; font-size: $text-sm; color: $color-text-tertiary; padding: $space-sm 0; }

.calendar-page__days { display: grid; grid-template-columns: repeat(7, 1fr); gap: $space-xs; }
.calendar-page__day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: $text-base;
  color: $color-text-primary;
  position: relative;
  border-radius: $radius-sm;

  &--other { color: $color-text-placeholder; }
  &--today { background-color: $color-primary-bg; color: $color-primary; font-weight: 600; }
  &--selected { background-color: $color-primary; color: $color-text-inverse !important; border-radius: 50%; font-weight: 600; }
}

.calendar-page__dot { width: 8rpx; height: 8rpx; border-radius: 50%; position: absolute; bottom: 4rpx; }

.calendar-page__legend { display: flex; justify-content: center; gap: $space-xl; padding: $space-md $space-base; }
.calendar-page__legend-item { display: flex; align-items: center; gap: $space-xs; font-size: $text-sm; color: $color-text-secondary; }
.calendar-page__legend-dot { width: 12rpx; height: 12rpx; border-radius: 50%; }

.calendar-page__detail { margin: $space-md $space-base; }
.calendar-page__detail-title { font-size: $text-md; font-weight: 600; color: $color-text-primary; margin-bottom: $space-md; display: block; }
.calendar-page__detail-card { background-color: $color-bg-page; border-radius: $radius-sm; padding: $space-md; }
.calendar-page__detail-name { font-size: $text-md; font-weight: 500; color: $color-text-primary; display: block; margin-bottom: $space-xs; }
.calendar-page__detail-info { font-size: $text-base; color: $color-text-secondary; display: block; margin-bottom: 4rpx; }
</style>
