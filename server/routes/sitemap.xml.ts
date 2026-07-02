// 動態產生 sitemap.xml：靜態頁面 + 各產品詳情頁（依後端 API 的 id 自動收錄）
// 存取位置：https://<你的網域>/sitemap.xml

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const site = (config.public.siteUrl || '').replace(/\/$/, '')
  const api = (config.public.apiBase || '').replace(/\/$/, '')

  const today = new Date().toISOString().split('T')[0]

  // 靜態頁面
  const staticRoutes = [
    { loc: '/', changefreq: 'daily', priority: '1.0' },
    { loc: '/multimedia', changefreq: 'weekly', priority: '0.8' },
    { loc: '/carFrame', changefreq: 'weekly', priority: '0.8' },
    { loc: '/blindSpot', changefreq: 'weekly', priority: '0.8' },
    { loc: '/fitting', changefreq: 'weekly', priority: '0.8' },
    { loc: '/partner', changefreq: 'monthly', priority: '0.6' },
    { loc: '/qa', changefreq: 'monthly', priority: '0.5' },
    { loc: '/download', changefreq: 'monthly', priority: '0.5' },
    { loc: '/searchPage', changefreq: 'monthly', priority: '0.4' }
  ]

  // 產品詳情頁：從後端 API 抓取 id
  const dynamicSources = [
    { endpoint: '/fitting', path: '/fittingDetail' },
    { endpoint: '/blindspot', path: '/blindSpotDetail' },
    { endpoint: '/carframe', path: '/carFrameDetail' },
    { endpoint: '/multimedia', path: '/multimediaDetail' }
  ]

  const dynamicRoutes: { loc: string; changefreq: string; priority: string }[] = []

  for (const src of dynamicSources) {
    try {
      const res: any = await $fetch(`${api}${src.endpoint}`)
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

  const urls = [...staticRoutes, ...dynamicRoutes]
    .map(
      (r) =>
        `  <url>\n` +
        `    <loc>${site}${r.loc}</loc>\n` +
        `    <lastmod>${today}</lastmod>\n` +
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
