<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ThemeToggle from '@/components/theme/index.vue'
import { ref } from 'vue'

const wallpaperUrl = ref('https://xiaoyao-ye.github.io/ios17-clock/')

const handleSetWallpaper = async () => {
  if (!wallpaperUrl.value) return alert('请输入壁纸URL')

  window.ipcRenderer.send('set-wallpaper', wallpaperUrl.value)
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
            <Button variant="outline" size="sm">刷新</Button>
            <Button variant="outline" size="sm">设置</Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="container py-6">
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <slot></slot>
      </div>
    </main>
  </div>
</template>
