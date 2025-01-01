<template>
  <div class="flex justify-end px-8 pt-12 text-gray-100 wrap" :key="key">
    <CalendarRoot v-slot="{ date, grid, weekDays }" weekday-format="short" :locale="locale">
      <CalendarHeader>
        <CalendarHeading class="px-2 pb-2 text-md" v-slot="{ headingValue }">
          <span class="pr-2 text-3xl">{{ date.toString().slice(5, 7) }}</span>
          <span class="pr-2 text-xl">{{ headingValue.split(' ')[0] }}</span>
          <span>/&nbsp;{{ toLunar(date.toString(), 'year') }}</span>
        </CalendarHeading>
      </CalendarHeader>

      <CalendarGrid v-for="month in grid" :key="month.value.toString()">
        <CalendarGridHead>
          <CalendarGridRow>
            <CalendarHeadCell class="w-full px-2 text-gray-200" v-for="day in weekDays" :key="day">{{ day }}</CalendarHeadCell>
          </CalendarGridRow>
        </CalendarGridHead>
        <CalendarGridBody>
          <CalendarGridRow class="w-full mt-2 tracking-wide" v-for="(weekDates, index) in month.rows" :key="`weekDate-${index}`">
            <CalendarCell
              class="flex-1 px-3"
              :class="{ shadow: date.toString() === weekDate.toString() }"
              v-for="weekDate in weekDates"
              :key="weekDate.toString()"
              :date="weekDate">
              <div v-if="isCurrentMonth(weekDate.toString())">
                <div class="text-xl leading-5">
                  {{ formatDay(weekDate.toString()) }}
                </div>
                <div class="text-xs" :class="{ 'text-yellow-200 font-bold': solarTerms[weekDate.toString()] }">
                  {{ toLunar(weekDate.toString()) }}
                </div>
              </div>
            </CalendarCell>
          </CalendarGridRow>
        </CalendarGridBody>
      </CalendarGrid>
    </CalendarRoot>
  </div>
</template>

<script setup lang="ts">
import { SolarDay } from 'tyme4ts'
import { CalendarRoot } from 'radix-vue'
import {
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHead,
  CalendarGridRow,
  CalendarHeadCell,
  CalendarHeader,
  CalendarHeading,
} from '@/components/ui/calendar'
import { onMounted, onUnmounted, ref } from 'vue'
import { solarTerms } from './solarTerms'

const locale = ref('en')
// const locale = ref('zh')

function toLunar(date: string, type: 'month' | 'year' = 'month') {
  if (type === 'month' && solarTerms[date]) return solarTerms[date]
  const [year, month, day] = date.split('-')
  const solar = SolarDay.fromYmd(+year, +month, +day)
  const lunar = solar.getLunarDay().toString()
  if (type === 'month') return lunar.slice(-2)
  if (type === 'year') return lunar.slice(2, -2)
}

function formatDay(date: string) {
  return +date.slice(-2)
}
function isCurrentMonth(date: string) {
  const currentMonth = new Date().getMonth() + 1
  const month = +date.slice(5, 7)
  return currentMonth === month
}

const key = ref(Date.now())
function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    key.value = Date.now()
    updateDate()
  }
}
let timeID: NodeJS.Timeout
function updateDate() {
  clearTimeout(timeID)
  const date = new Date()
  const nextMinute = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
  const timeDifference = nextMinute.getTime() - date.getTime()
  timeID = setTimeout(() => {
    key.value = Date.now()
  }, timeDifference)
}
onMounted(() => {
  updateDate()
  window.addEventListener('visibilitychange', handleVisibilityChange)
})
onUnmounted(() => {
  clearTimeout(timeID)
  window.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style scoped>
@import url('@/assets/fonts/Pacifico/index.css');
/* @import url('@/assets/fonts/LilitaOne/index.css'); */

.wrap {
  font-family: 'Pacifico', cursive !important;
  /* font-family: 'Lilita One', cursive !important; */
}
.shadow {
  text-shadow: 0 0 5px #ccc, 0 0 10px #fff;
}
</style>
