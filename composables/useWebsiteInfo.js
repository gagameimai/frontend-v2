// 全站共用的「網站設定」（後台：系統設定 ▸ 網站基本設定／SEO／GEO／產品類別開關／全站標誌）。
// 後端 GET /api/website 回傳 { result: { copyright, address, tel, …, theme_*, logo_*, categories, seo } }。
// 全站只在這裡呼叫一次 useAsyncData('website-info')，app.vue、Header、Footer、useSeoSettings、useCategories
// 都從這裡拿；以前各自呼叫同一個 key 但 handler 不同，Nuxt 會警告 "Incompatible options"，
// 且前後端同一個 key 搶資料容易造成 hydration 不一致。
import { useAsyncData, useRuntimeConfig } from '#imports'

export function useWebsiteInfo() {
  const config = useRuntimeConfig()
  const api = `${config.public.apiBase}/website`
  return useAsyncData('website-info', () => $fetch(api).catch(() => ({ result: null })))
}
