<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ThemeToggle from '@/components/theme/index.vue'
import { ref } from 'vue'
import { category, type CategoryValue } from '@/config'

const wallpaperUrl = ref<string>()

function handleSetWallpaper() {
  if (!wallpaperUrl.value) return alert('请输入壁纸URL')

  setWallpaper(wallpaperUrl.value)
}
function setWallpaper(value: CategoryValue | string) {
  window.ipcRenderer.send('set-wallpaper', value)
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <header class="border-b">
      <div class="container flex items-center h-14">
        <div class="flex items-center justify-between flex-1">
          <div class="flex items-center space-x-2">
            <Input v-model="wallpaperUrl" placeholder="输入壁纸URL" class="w-[300px]" type="url" />
            <Button variant="outline" size="sm" @click="handleSetWallpaper">设置壁纸</Button>
          </div>

          <!-- 右侧操作按钮 -->
          <div class="flex items-center space-x-2">
            <!-- <Button variant="outline" size="sm">刷新</Button> -->
            <!-- <Button variant="outline" size="sm">设置</Button> -->
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="container py-6">
      <Button variant="outline" size="sm" @click="setWallpaper(category.ios17Clock)">iOS17 Clock</Button>
      <Button variant="outline" size="sm" @click="setWallpaper(category.star)">star</Button>
    </main>
  </div>
</template>
