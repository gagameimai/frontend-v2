<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { useBrandZone } from '~/composables/useBrandZone'

useSeoMeta({
  ogImage: '/new_panel.png'
})
// useHead({
//   meta: [
//     {
//       property: 'og:image', content: `https://www.meimai.com.tw/new_panel.png`
//     }
//   ]
// })

// 全站 favicon：MM 專區用 MM 的 icon，其餘所有頁面（Clarion 專區＋共用頁／首頁）
// 一律用 Clarion 白底黑字的 icon（使用者 2026-09 指定）。
// 判斷邏輯與 Header.vue 的 logo 共用同一份（composables/useBrandZone.js），
// 這裡是唯一設定 favicon 的地方，避免各頁各自宣告造成「有些頁面沒生效」。
const brandZone = useBrandZone()
const faviconLinks = computed(() => {
  if (brandZone.value === 'mm') {
    return [
      { key: 'fav-ico', rel: 'icon', type: 'image/x-icon', sizes: 'any', href: '/favicon-mm.ico' },
      { key: 'fav-32', rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-mm-32.png' },
      { key: 'fav-16', rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-mm-16.png' },
      { key: 'fav-apple', rel: 'apple-touch-icon', type: 'image/png', sizes: '180x180', href: '/favicon-mm-180.png' }
    ]
  }
  // Clarion 專區＋共用頁（含首頁）：都用 Clarion 白底黑字 icon
  return [
    { key: 'fav-ico', rel: 'icon', type: 'image/x-icon', sizes: 'any', href: '/favicon-clarion.ico' },
    { key: 'fav-32', rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-clarion-32.png' },
    { key: 'fav-16', rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-clarion-16.png' },
    { key: 'fav-apple', rel: 'apple-touch-icon', type: 'image/png', sizes: '180x180', href: '/favicon-clarion-180.png' }
  ]
})
useHead({
  link: faviconLinks
})
</script>

<style>
html {
  width: 100%;
}
body {
  width: 100%;
  font-family: "Noto Sans TC", system-ui, "Microsoft JhengHei", -apple-system,
    BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
  color: #0d1b2e;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
}
</style>
