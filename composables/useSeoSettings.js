// 後台「系統設定 ▸ SEO／GEO 設定」的前台讀取。
// 資料存在 /website 回傳的 seo：{ company_zh, company_en, phone_intl, addr_*, og_image, gsc, bing,
//   flags:{org,product,ai_bots}, pages:{ '/path': {title,description} }, faq:[{q,a}] }
// 每個欄位沒填＝回傳空值，呼叫端要自己退回網站原本的預設文字。
// 與 app.vue、Footer、Header 共用同一個 'website-info' key，不會多打一次 API。
import { computed } from '#imports'
import { useWebsiteInfo } from '~/composables/useWebsiteInfo'

export function useSeoSettings() {
  const { data } = useWebsiteInfo()
  const info = computed(() => data.value?.result || {})
  const seo = computed(() => info.value.seo || {})
  // 開關預設為開（沒設定過＝開），只有後台明確關閉（0）才算關
  const flag = (name) => (seo.value.flags ? seo.value.flags[name] !== 0 : true)
  return { info, seo, flag }
}
