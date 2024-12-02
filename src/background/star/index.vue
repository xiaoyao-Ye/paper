<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'

interface Props {
  num?: number
  colors?: string[]
  showOpacity?: boolean
}
const props = withDefaults(defineProps<Props>(), { num: 240, showOpacity: false })

const defaultColors = [
  '255, 255, 255', // 白色
  '161, 198, 231', // 淡蓝色
  '234, 184, 228', // 淡紫色
  '255, 215, 0', // 金色
  '178, 226, 177', // 淡绿色
  '255, 111, 97', // 珊瑚红
]
const boxShadow = ref('')
function RandomStars(num: number = props.num) {
  const windowHeight = window.innerHeight
  const windowWidth = window.innerWidth
  let stars = ''
  const colors = props.colors || defaultColors
  for (let i = num; i >= 0; i--) {
    const x = Math.round(Math.random() * windowWidth)
    const y = Math.round(Math.random() * windowHeight)
    const size = Math.round(Math.random() * 0.52)
    const o = props.showOpacity ? Math.random() * 0.5 : 1
    const index = Math.floor(Math.random() * colors.length)

    stars += `${x}px ${y}px 0 ${size}px rgba(${colors[index]}, ${o}),`
    stars += `${x}px ${windowHeight + y}px 0 ${size}px rgba(${colors[index]}, ${o}),`
  }
  stars = stars.slice(0, -1)
  boxShadow.value = stars
}

const handleResize = () => RandomStars()
onMounted(() => {
  RandomStars()
  window.addEventListener('resize', handleResize)
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="relative h-screen">
    <div class="stars" :style="`box-shadow: ${boxShadow}`" />
  </div>
</template>

<style scoped>
/*背景星星*/
.stars {
  position: absolute;
  top: 0;
  left: 0;
  height: 1px;
  width: 1px;
  border-radius: 100%;
  background-color: transparent;
  z-index: 1000;
  /* 循环翻转播放(向上播放完后向下播放) */
  /* animation: toTop 36s infinite linear alternate; */
  /* 反转播放(向下移动 下雪一样) */
  /* animation: toTop 36s infinite linear reverse; */
  /* 正常播放(向上移动) */
  animation: toTop 36s infinite linear;
}

@keyframes toTop {
  0% {
    transform: translateY(0);
  }

  100% {
    transform: translateY(-100vh);
  }
}
</style>
