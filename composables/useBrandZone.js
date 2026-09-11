/**
 * 判斷目前頁面屬於 Clarion 專區、MM 專區，還是共用頁（首頁/經銷據點/常見問題等）。
 * Header.vue（logo）與 app.vue（favicon）共用同一份判斷邏輯，只改這一個檔案，
 * 避免像之前一樣兩邊各自維護一份路徑清單、漏改頁面造成不同步。
 *
 * 明確 import Nuxt 內建的 composable，不依賴自動載入（這個專案的 composables/ 自動載入沒被驗證過）。
 *
 * 用 startsWith 比對，所以像 /headrest 這條同時會覆蓋 /headrestDetail/123 這種詳情頁網址，不用兩條都寫。
 */
import { useRoute, useState, computed } from '#imports'

const CLARION_ONLY_PATHS = ['/audioAccessories', '/headrest', '/portable', '/headUnit']
const MM_ONLY_PATHS = ['/carFrame', '/safety', '/fitting']

export function useBrandZone() {
  const route = useRoute()
  // SSR-safe 全域共享狀態：multimediaDetail 頁面抓到商品資料後會把品牌寫進來（見該頁 script）
  const detailBrandOverride = useState('detailBrandOverride', () => null)

  return computed(() => {
    if (route.path.startsWith('/clarion')) return 'clarion'
    if (route.path.startsWith('/mm')) return 'mm'

    if (route.path.startsWith('/multimediaDetail')) {
      return detailBrandOverride.value || 'cobrand'
    }

    if (route.path.startsWith('/multimedia')) {
      const type = String(route.query.type ?? '')
      if (type === '2') return 'clarion'
      if (type === '0' || type === '1') return 'mm'
      return 'cobrand'
    }

    if (CLARION_ONLY_PATHS.some((p) => route.path.startsWith(p))) return 'clarion'
    if (MM_ONLY_PATHS.some((p) => route.path.startsWith(p))) return 'mm'

    return 'cobrand'
  })
}
