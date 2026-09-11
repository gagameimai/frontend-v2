/**
 * 統一設定頁面 SEO（title / description / og / canonical）
 *
 * 用法（在 <script setup> 內）：
 *   usePageSeo({
 *     title: () => t('safety.title'),
 *     description: () => t('safety.intro')
 *   })
 *
 * 說明：
 * - title 會自動補上網站後綴「｜Clarion 歌樂 台灣官方授權總經銷｜美邁車用電子」
 * - canonical 由 runtimeConfig.public.siteUrl + 目前路徑（去掉 query）自動組出
 * - 傳字串或傳 function 都可以；傳 function 時切換語系會自動更新
 */
// 明確 import Nuxt 內建的 composable，不依賴自動載入（這個專案的 composables/ 自動載入沒被驗證過）
import { useRoute, useRuntimeConfig, useHead } from '#imports'

export function usePageSeo(options = {}) {
  const route = useRoute()
  const config = useRuntimeConfig()
  const site = String(config.public.siteUrl || '').replace(/\/$/, '')

  const val = (v) => (typeof v === 'function' ? v() : v)

  const suffix = options.suffix ?? '｜Clarion 歌樂 台灣官方授權總經銷｜美邁車用電子'
  const fullTitle = () => {
    const t = val(options.title)
    if (!t) return `美邁車用電子${suffix}`
    return options.noSuffix ? t : `${t}${suffix}`
  }
  const desc = () => val(options.description) || ''
  const image = () => {
    const img = val(options.image)
    if (!img) return `${site}/new_panel.png`
    return /^https?:\/\//.test(img) ? img : `${site}${img}`
  }
  // canonical 不帶 query string（例如 /multimedia?type=2 也指向 /multimedia）
  // canonicalPath：明確指定 canonical 路徑（語意化網址用），否則用目前路徑
  const canonical = () => {
    const p = val(options.canonicalPath) || route.path
    return `${site}${p === '/' ? '/' : p.replace(/\/$/, '')}`
  }

  // 品牌 favicon 已改由 app.vue 統一依路徑判斷、全站共用（見 composables/useBrandZone.js），
  // 這裡不再各頁各自宣告，避免兩邊搶同一個 <link key> 造成覆蓋順序不穩定。
  // options.brand 仍可傳入（不會報錯），只是不再影響 favicon。

  useHead({
    title: fullTitle,
    meta: [
      { name: 'description', content: desc },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: desc },
      { property: 'og:url', content: canonical },
      { property: 'og:image', content: image },
      { name: 'twitter:card', content: 'summary_large_image' }
    ],
    link: [{ rel: 'canonical', href: canonical }]
  })
}
