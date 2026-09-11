<template>
  <div>
    <Header :floating="isHome" />
    <slot />
    <Footer />
  </div>
</template>

<script setup>
// 只有首頁的 Banner 是通版大圖，表頭才用「透明浮動、捲動後轉白底」的呈現方式；
// 其他頁面維持原本固定白底的表頭，不受影響。
const route = useRoute()
const isHome = computed(() => route.path === '/')
</script>
