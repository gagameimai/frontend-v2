// 後台「產品類別開關」關閉的類別：就算有人直接輸入網址，也顯示找不到頁面。
// 判斷用 startsWith，所以 /headrest 也會擋掉 /headrestDetail/123。
import { CATEGORY_DEFAULTS } from '~/composables/useCategories'

const RULES = [
  ['clarion', 'gl', ['/clarion/gl']],
  ['clarion', 'oem', ['/clarion/oem']],
  ['clarion', 'audio', ['/audioAccessories', '/clarion/audioAccessoriesDetail']],
  ['clarion', 'camera', ['/clarion/camera', '/clarion/cameraDetail']],
  ['clarion', 'din', ['/headUnit']],
  ['clarion', 'dvr', ['/clarion/dashcam', '/clarion/dashcamDetail']],
  ['clarion', 'headrest', ['/headrest']],
  ['clarion', 'portable', ['/portable']],
  ['mm', 'android', ['/mm/me']],
  ['mm', 'oem', ['/mm/oem']],
  ['mm', 'frame', ['/carFrame']],
  ['mm', 'safety', ['/safety']],
  ['mm', 'dvr', ['/mm/dashcam', '/mm/dashcamDetail']],
  ['mm', 'camera', ['/mm/camera', '/mm/cameraDetail']],
  ['mm', 'fitting', ['/fitting']]
]

export default defineNuxtRouteMiddleware(async (to) => {
  const hit = RULES.find(([, , paths]) => paths.some((p) => to.path === p || to.path.startsWith(p + '/') || to.path.startsWith(p + 'Detail')))
  if (!hit) return
  const [brand, key] = hit
  const config = useRuntimeConfig()
  const cache = useState('category-gate', () => null)
  if (!cache.value) {
    try {
      const res = await $fetch(`${config.public.apiBase}/website`)
      cache.value = res?.result?.categories || {}
    } catch (e) {
      return // 讀不到設定就不擋，避免後端異常時整站打不開
    }
  }
  const saved = Array.isArray(cache.value[brand]) ? cache.value[brand].find((r) => r && r.key === key) : null
  const def = CATEGORY_DEFAULTS[brand].find(([k]) => k === key)
  const on = saved ? !!saved.on : !!(def && def[1])
  if (!on) {
    return abortNavigation(createError({ statusCode: 404, statusMessage: 'Page Not Found' }))
  }
})
