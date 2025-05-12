<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardFooter, CardHeader } from '@/components/ui/card'
import ThemeToggle from '@/components/theme/index.vue'
import { ref, reactive, computed } from 'vue'
import { category, type CategoryValue } from '@/config'
import { isUrl } from '@/utils'
import { onMounted } from 'vue'

const wallpaperUrl = ref<string>('')
const wallpaperList = ref<string[]>(['ios17Clock', 'star', 'solar'])
const baseURL = window.location.href

const componentConfig = reactive({
  // position: 'top-right',
  bg: 'bg-transparent',
  // customBG: '',
})

const previewList = computed(() => {
  return wallpaperList.value.map(w => (isUrl(w) ? w : baseURL + w))
})

const displays = ref<{ id: number; name: string }[]>([])

onMounted(async () => {
  // 初始化获取
  displays.value = await window.ipcRenderer.invoke('displays')
})

function removeAll(displayId: number) {
  window.ipcRenderer.send('remove-all', displayId)
}

function setWallpaper(displayId: number, value: CategoryValue | string) {
  window.ipcRenderer.send('set-wallpaper', displayId, value)
}

function setComponent(value: CategoryValue | string) {
  const query = { ...componentConfig }
  window.ipcRenderer.send('set-component', value, query)
}

function addWallpaper() {
  if (!wallpaperUrl.value) return alert('请输入URL')
  wallpaperList.value.unshift(wallpaperUrl.value)
  wallpaperUrl.value = ''
}

function removeWallpaper(index: number) {
  wallpaperList.value.splice(index, 1)
}

function resetStore() {
  window.ipcRenderer.invoke('reset-store')
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
          <Button variant="outline" size="sm" @click="resetStore">清除壁纸缓存</Button>
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
          <div>
            <Button v-for="item in displays" :key="item.id" @click="removeAll(item.id)">移除{{ item.name }}组件和壁纸</Button>
          </div>

          <div>
            <Button v-for="item in displays" :key="item.id" @click="setWallpaper(item.id, '')">移除{{ item.name }}壁纸</Button>
          </div>

          <Label>添加自定义壁纸</Label>
          <div class="flex items-center py-2 space-x-2">
            <Input v-model="wallpaperUrl" placeholder="输入网页URL" class="w-[300px]" />
            <Button variant="outline" size="sm" @click="addWallpaper">添加</Button>
          </div>

          <!-- 卡片列表 -->
          <div>
            <Label>预览列表</Label>
            <div class="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 mt-4">
              <Card v-for="(url, index) in previewList" :key="url" class="overflow-hidden">
                <CardHeader class="p-0">
                  <div class="relative w-full aspect-video">
                    <iframe :src="url" class="absolute inset-0 w-full h-full" loading="lazy"></iframe>
                  </div>
                </CardHeader>
                <CardFooter class="flex justify-between p-2 space-x-2">
                  <Button
                    v-for="item in displays"
                    :key="item.id"
                    variant="ghost"
                    size="sm"
                    @click="setWallpaper(item.id, wallpaperList[index])">
                    为 {{ item.name }} 设为壁纸
                  </Button>
                  <!-- <Button variant="ghost" size="sm" @click="removeWallpaper(index)">删除</Button> -->
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>

        <!-- 组件设置页签 -->
        <TabsContent value="components">
          <Button size="sm" @click="setComponent(category.calendar)">日历</Button>

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
