<template>
  <div class="h-screen">
    <!-- wallpaper -->
    <iframe v-if="wallpaperData" :src="wallpaperUrl" width="100%" height="100%" frameborder="0"></iframe>

    <!-- component -->
    <iframe
      v-for="(item, index) in component"
      :key="item.name"
      :src="`#/${item.name}`"
      :style="`position: fixed; top: ${item.top}; left: ${item.left}; right: ${item.right}; bottom: ${item.bottom};`"
      :width="item.width"
      :height="item.height"
      frameborder="0"></iframe>
  </div>
</template>

<script setup lang="ts">
import { isUrl } from '@/utils'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

onMounted(async () => {
  // init
  const router = useRouter()
  const displayId = router.currentRoute.value.query.displayId as string
  const data = await window.ipcRenderer.invoke('get-wallpaper-data', +displayId)
  wallpaperData.value = data

  // listen
  window.ipcRenderer.on('component-data', (event, data) => {
    console.log('component data', data)
  })
  window.ipcRenderer.on('wallpaper-data', (event, data) => {
    if (data === wallpaperData.value) return
    wallpaperData.value = data
  })
})

const wallpaperData = ref('')
const wallpaperUrl = computed(() => {
  return isUrl(wallpaperData.value) ? wallpaperData.value : '#/' + wallpaperData.value
})

const component = ref([
  {
    name: 'calendar',
    top: '0',
    left: 'auto',
    right: '0',
    bottom: 'auto',
    width: '100%',
    height: '400',
  },
  {
    name: 'ios17Clock?bg=transparent',
    top: '0',
    left: '0',
    right: 'auto',
    bottom: 'auto',
    width: '640',
    height: '360',
  },
])
</script>

<style scoped></style>
