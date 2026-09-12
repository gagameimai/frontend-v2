/**
 * 取得產品列表／總覽頁的 Banner 背景圖（後台「列表頁 Banner 管理」設定，見 backend config/list_banner.php）。
 * 回傳 computed：{ img, imgMobile }
 *   img        桌機版 1920×480（4:1）；後台沒設定時為 null，頁面顯示預設漸層背景
 *   imgMobile  手機版 1080×608（16:9）；後台沒設定時為 null，前台沿用 img
 * 模板用法：v-if="banner.img"、:style="{ '--bg': `url(${banner.img})`, '--bg-m': `url(${banner.imgMobile || banner.img})` }"
 *
 * 明確 import Nuxt 內建的 composable，不依賴自動載入（這個專案的 composables/ 自動載入沒被驗證過）。
 *
 * 用法（在 <script setup> 內）：
 *   const banner = useListBanner('headUnit')             // 單一 banner 的頁面，不用帶 type
 *   const banner = useListBanner('multimedia', pageType)  // 同一元件多個 type 共用，type 可傳 ref／computed，值變了會自動重抓
 */
import { useRuntimeConfig, useAsyncData, computed } from '#imports'

export function useListBanner(pageKey, typeKey = null) {
  const config = useRuntimeConfig()

  // typeKey 可能是純值，也可能是 ref/computed，兩種都要能吃
  const typeVal = computed(() => {
    const raw = typeKey && typeof typeKey === 'object' && 'value' in typeKey ? typeKey.value : typeKey
    return raw === null || raw === undefined || raw === '' ? 'default' : String(raw)
  })

  const { data } = useAsyncData(
    () => `list-banner-${pageKey}-${typeVal.value}`,
    () =>
      $fetch(`${config.public.apiBase}/list_banner`, {
        params: { page: pageKey, type: typeVal.value }
      }).catch(() => ({ result: null })),
    { watch: [typeVal] }
  )

  return computed(() => ({
    img: data.value?.result?.img || null,
    imgMobile: data.value?.result?.img_mobile || null,
  }))
}
