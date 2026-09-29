// 動態產生 sitemap.xml：靜態頁面 + 各產品詳情頁（依後端 API 的 id 自動收錄）
// 存取位置：https://<你的網域>/sitemap.xml

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const site = (config.public.siteUrl || '').replace(/\/$/, '')
  const api = (config.public.apiBase || '').replace(/\/$/, '')

  // 靜態頁面
  // 注意：這裡的路徑必須對應 pages/ 底下實際存在的路由，寫錯會產生 404 的 sitemap 項目
  const staticRoutes = [
    { loc: '/', changefreq: 'daily', priority: '1.0' },
    { loc: '/clarion/overview', changefreq: 'weekly', priority: '0.9' },
    { loc: '/mm/overview', changefreq: 'weekly', priority: '0.8' },
    { loc: '/mm/me', changefreq: 'weekly', priority: '0.8' },
    { loc: '/mm/oem', changefreq: 'weekly', priority: '0.8' },
    // 跨品牌需求詞著陸頁（承接「安卓機推薦」「行車記錄器推薦」這類搜尋）
    { loc: '/products/android-headunit', changefreq: 'weekly', priority: '0.9' },
    { loc: '/products/dash-cam', changefreq: 'weekly', priority: '0.9' },
    { loc: '/products/car-audio', changefreq: 'weekly', priority: '0.9' },
    { loc: '/clarion/gl', changefreq: 'weekly', priority: '0.9' },
    { loc: '/clarion/oem', changefreq: 'weekly', priority: '0.9' },
    // /multimedia 與 /clarion/gl、/clarion/oem、/mm/me、/mm/oem 內容重複（canonical 指向品牌頁），不列入
    { loc: '/headUnit', changefreq: 'weekly', priority: '0.8' },
    { loc: '/audioAccessories', changefreq: 'weekly', priority: '0.8' },
    { loc: '/carFrame', changefreq: 'weekly', priority: '0.8' },
    { loc: '/safety', changefreq: 'weekly', priority: '0.8' },
    { loc: '/mm/dashcam', changefreq: 'weekly', priority: '0.8' },
    { loc: '/clarion/dashcam', changefreq: 'weekly', priority: '0.8' },
    { loc: '/mm/camera', changefreq: 'weekly', priority: '0.8' },
    { loc: '/clarion/camera', changefreq: 'weekly', priority: '0.8' },
    { loc: '/headrest', changefreq: 'weekly', priority: '0.8' },
    { loc: '/portable', changefreq: 'weekly', priority: '0.8' },
    { loc: '/fitting', changefreq: 'weekly', priority: '0.8' },
    { loc: '/cases', changefreq: 'weekly', priority: '0.7' },
    { loc: '/about', changefreq: 'monthly', priority: '0.7' },
    { loc: '/partner', changefreq: 'monthly', priority: '0.6' },
    { loc: '/qa', changefreq: 'monthly', priority: '0.5' },
    { loc: '/download', changefreq: 'monthly', priority: '0.5' }
    // /searchPage 為站內搜尋結果頁，不列入 sitemap
  ]

  // 產品詳情頁：從後端 API 抓取 id
  // 2026-09-28 補齊：行車記錄器、鏡頭（依 brand 0=MM／1=Clarion 分開路徑）、頭枕螢幕、可攜式、汽車音響、車用主機、導入事例
  const dynamicSources: { endpoint: string; path: string; query?: Record<string, any> }[] = [
    { endpoint: '/fitting', path: '/fittingDetail' },
    { endpoint: '/blindspot', path: '/safetyDetail' },
    { endpoint: '/carframe', path: '/carFrameDetail' },
    { endpoint: '/multimedia', path: '/multimediaDetail' },
    { endpoint: '/dashcam', path: '/mm/dashcamDetail', query: { brand: 0 } },
    { endpoint: '/dashcam', path: '/clarion/dashcamDetail', query: { brand: 1 } },
    { endpoint: '/camera', path: '/mm/cameraDetail', query: { brand: 0 } },
    { endpoint: '/camera', path: '/clarion/cameraDetail', query: { brand: 1 } },
    { endpoint: '/headrest', path: '/headrestDetail' },
    { endpoint: '/portable', path: '/portableDetail' },
    { endpoint: '/audio_accessories', path: '/clarion/audioAccessoriesDetail' },
    { endpoint: '/head_unit', path: '/headUnitDetail' },
    { endpoint: '/install_cases', path: '/cases' }
  ]

  const dynamicRoutes: { loc: string; changefreq: string; priority: string }[] = []

  for (const src of dynamicSources) {
    try {
      const res: any = await $fetch(`${api}${src.endpoint}`, { query: src.query })
      const list: any[] = Array.isArray(res?.result) ? res.result : []
      for (const item of list) {
        if (item?.id !== undefined && item?.id !== null) {
          dynamicRoutes.push({
            loc: `${src.path}/${item.id}`,
            changefreq: 'weekly',
            priority: '0.6'
          })
        }
      }
    } catch (e) {
      // 某個 API 失敗時略過該類別，不影響整份 sitemap
      console.error(`[sitemap] 無法取得 ${src.endpoint}:`, e)
    }
  }

  // 去掉重複網址；lastmod 不再一律填「今天」（不準的日期會讓 Google 忽略整個欄位），等後台 API 有提供更新時間再補
  const seen = new Set<string>()
  const urls = [...staticRoutes, ...dynamicRoutes]
    .filter((r) => (seen.has(r.loc) ? false : (seen.add(r.loc), true)))
    .map(
      (r) =>
        `  <url>\n` +
        `    <loc>${site}${r.loc}</loc>\n` +
        `    <changefreq>${r.changefreq}</changefreq>\n` +
        `    <priority>${r.priority}</priority>\n` +
        `  </url>`
    )
    .join('\n')

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${urls}\n` +
    `</urlset>`

  setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return xml
})
