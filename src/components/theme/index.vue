<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/vue'
import { useColorMode, useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
  <Button @click="toggleDark()" size="sm" variant="outline">
    <Icon :icon="isDark ? 'carbon:sun' : 'carbon:moon'" />
  </Button>
</template>