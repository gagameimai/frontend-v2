<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { useWebsiteInfo } from '~/composables/useWebsiteInfo'
// 全站預設分享圖由 nuxt.config.ts 的 og:image（https://clarion.meimai.com.tw/og-share.png，Clarion × MM 聯名圖）提供；
// 各頁用 usePageSeo 覆寫。這裡不再設定，避免舊圖 new_panel.png 用相對路徑蓋掉預設。
// useHead({
//   meta: [
//     {
//       property: 'og:image', content: `https://www.meimai.com.tw/new_panel.png`
//     }
//   ]
// })

// 全站 favicon：一律用 Clarion 字樣圖示（老闆 2026-09-29 指定：全站只放歌樂，
// 不再依 MM／Clarion 專區切換；Google 搜尋結果本來也只會用首頁一個圖示）。
// 這裡是唯一設定 favicon 的地方，避免各頁各自宣告造成「有些頁面沒生效」。
const faviconLinks = [
  { key: 'fav-ico', rel: 'icon', type: 'image/x-icon', sizes: 'any', href: '/favicon-clarion.ico' },
  { key: 'fav-32', rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-clarion-32.png' },
  { key: 'fav-16', rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-clarion-16.png' },
  { key: 'fav-apple', rel: 'apple-touch-icon', type: 'image/png', sizes: '180x180', href: '/favicon-clarion-180.png' }
]


// 全站配色（後台「網站基本設定」可改）：theme_dark＝全站深色底、theme_footer＝頁尾底色（沒填跟著全站深色底）、
// theme_accent＝重點色（原 #007ABE）、theme_bg2＝淺灰區塊底色（原 #F5F7FA）。
// 以 CSS 變數 --site-dark／--site-foot 蓋在 :root，各頁面的深色背景都寫成 var(--site-dark, #0d1016)，
// 後台沒設定或值不合格式時就維持原本的 #0d1016。跟 Footer 共用同一個 'website-info' 資料（不會多打一次 API）。
const { data: themeData } = useWebsiteInfo()
// 後台「SEO／GEO 設定」填了搜尋引擎網站驗證碼，就輸出對應的 <meta>（沒填不輸出）
useHead(() => {
  const s = themeData.value?.result?.seo || {}
  const meta = []
  if (s.gsc) meta.push({ key: 'gsc-verify', name: 'google-site-verification', content: s.gsc })
  if (s.bing) meta.push({ key: 'bing-verify', name: 'msvalidate.01', content: s.bing })
  return { meta }
})
// 後台「網站基本設定 ▸ 全站標誌圖片」上傳了分頁小圖示就改用它（一張大圖交給瀏覽器縮），沒上傳維持原本歌樂圖示。
useHead(() => {
  const fav = themeData.value?.result?.logo_favicon
  if (!fav || typeof fav !== 'string') return { link: faviconLinks }
  return {
    link: [
      { key: 'fav-ico', rel: 'icon', href: fav },
      { key: 'fav-apple', rel: 'apple-touch-icon', href: fav }
    ]
  }
})
const HEX = /^#[0-9a-fA-F]{6}$/
// 把 #RRGGBB 往白色混 p（0～1），用來由「全站深色底」自動推出相近的深色（卡片底、邊線、漸層中段…）；
// 預設值（沒設定時）仍是各處原本寫死的色碼，所以不動後台就跟以前一模一樣。
const mix = (hex, p) => {
  const n = parseInt(hex.slice(1), 16)
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * p))
  return '#' + ch.map((v) => v.toString(16).padStart(2, '0')).join('')
}
const themeCss = computed(() => {
  const c = themeData.value?.result || {}
  const vars = []
  if (HEX.test(c.theme_dark || '')) {
    const d = c.theme_dark
    vars.push(`--site-dark:${d}`, `--site-dark-2:${mix(d, 0.045)}`, `--site-dark-3:${mix(d, 0.1)}`, `--site-dark-4:${mix(d, 0.06)}`, `--site-dark-5:${mix(d, 0.12)}`, `--site-dark-6:${mix(d, 0.17)}`)
  }
  if (HEX.test(c.theme_footer || '')) vars.push(`--site-foot:${c.theme_footer}`)
  if (HEX.test(c.theme_accent || '')) {
    const a = c.theme_accent
    vars.push(`--site-accent:${a}`, `--site-accent-lt:${mix(a, 0.4)}`, `--site-accent-hv:${mix(a, 0.12)}`)
  }
  if (HEX.test(c.theme_bg2 || '')) vars.push(`--site-bg2:${c.theme_bg2}`)
  return vars.length ? `:root{${vars.join(';')}}` : ''
})
useHead({
  style: [{ key: 'site-theme', innerHTML: () => themeCss.value }]
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
