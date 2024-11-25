<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ThemeToggle from '@/components/theme/index.vue'
import { ref, reactive } from 'vue'
import { category, type CategoryValue } from '@/config'

const wallpaperUrl = ref<string>()

const componentConfig = reactive({
  // position: 'top-right',
  bg: 'bg-transparent',
  // customBG: '',
})

function handleSetWallpaper() {
  if (!wallpaperUrl.value) return alert('请输入壁纸URL')
  setWallpaper(wallpaperUrl.value)
}

function setWallpaper(value: CategoryValue | string) {
  window.ipcRenderer.send('set-wallpaper', value)
}

function setComponent(value: CategoryValue | string) {
  const query = { ...componentConfig }
  window.ipcRenderer.send('set-component', value, query)
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <header class="border-b">
      <div class="container flex items-center h-14">
        <div class="flex items-center justify-between flex-1">
          <div class="flex items-center space-x-2">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>

    <main class="container py-6">
      <Tabs default-value="wallpaper" class="w-full">
        <TabsList>
          <TabsTrigger value="wallpaper">壁纸</TabsTrigger>
          <TabsTrigger value="components">组件</TabsTrigger>
        </TabsList>

        <!-- 壁纸设置页签 -->
        <TabsContent value="wallpaper">
          <Label>选择预设壁纸</Label>
          <div class="grid grid-cols-4 gap-4 py-2">
            <Button variant="outline" @click="setWallpaper(category.ios17Clock)">iOS17 Clock</Button>
            <Button variant="outline" @click="setWallpaper(category.star)">Star</Button>
          </div>
          <Label>自定义壁纸</Label>
          <div class="flex items-center space-x-2">
            <Input v-model="wallpaperUrl" placeholder="输入壁纸URL" class="w-[300px]" type="url" />
            <Button variant="outline" size="sm" @click="handleSetWallpaper">设置壁纸</Button>
          </div>
        </TabsContent>

        <!-- 组件设置页签 -->
        <TabsContent value="components">
          <div>
            <Label>iOS17 时钟组件</Label>

            <!-- 背景色设置 -->
            <div class="py-3 mt-4">
              <Label>背景色</Label>

              <div class="flex items-center space-x-2">
                <Button variant="outline" size="sm" @click="componentConfig.bg = 'bg-black'">黑色</Button>
                <Button variant="outline" size="sm" @click="componentConfig.bg = 'bg-transparent'">透明</Button>
                <!-- <Label>自定义</Label> -->
                <!-- <input type="color" v-model="componentConfig.customBG" class="w-6 bg-transparent rounded cursor-pointer" /> -->
              </div>
            </div>

            <!-- 应用按钮 -->
            <Button class="mt-6" @click="setComponent(category.ios17Clock)">应用</Button>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  </div>
</template>
