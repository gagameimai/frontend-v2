// 「產品類別開關」（後台：產品管理 ▸ 產品類別開關）的前台讀取。
// 資料存在 /website 回傳的 categories：{ clarion: [{key,name,on}], mm: [...] }，陣列順序＝顯示順序。
// 後台沒設定過 → 用下面的預設（頭枕螢幕、可攜式預設關閉，與先前工程師註解隱藏的狀態一致）。
// key 必須與 backend/config/product_categories.php 一致。
import { useWebsiteInfo } from '~/composables/useWebsiteInfo'

export const CATEGORY_DEFAULTS = {
  clarion: [['gl', 1], ['oem', 1], ['audio', 1], ['camera', 1], ['din', 1], ['dvr', 1], ['headrest', 0], ['portable', 0]],
  mm: [['android', 1], ['oem', 1], ['frame', 1], ['safety', 1], ['dvr', 1], ['camera', 1], ['fitting', 1]]
}

export const useCategories = (brand) => {
  const { locale } = useI18n()
  // 與 app.vue、Header、Footer 共用同一份（composables/useWebsiteInfo.js），不會多打一次 API
  const { data } = useWebsiteInfo()

  const list = computed(() => {
    const saved = data.value?.result?.categories?.[brand]
    const defs = CATEGORY_DEFAULTS[brand]
    const known = {}
    defs.forEach(([k, on]) => { known[k] = on })
    const out = []
    const seen = {}
    if (Array.isArray(saved)) {
      saved.forEach((s) => {
        if (s && s.key in known && !seen[s.key]) {
          seen[s.key] = 1
          out.push({ key: s.key, name: s.name || '', on: s.on ? 1 : 0 })
        }
      })
    }
    defs.forEach(([k, on]) => { if (!seen[k]) out.push({ key: k, name: '', on }) })
    return out
  })

  const isOn = (key) => !!list.value.find((r) => r.key === key)?.on
  const order = (key) => list.value.findIndex((r) => r.key === key)
  // 自訂名稱只套用在中文；英文版維持原本翻譯
  const label = (key, fallback) => {
    const n = locale.value === 'zh-tw' ? list.value.find((r) => r.key === key)?.name : ''
    return n || fallback
  }
  return { list, isOn, order, label }
}
