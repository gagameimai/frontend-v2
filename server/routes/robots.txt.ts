// 動態產生 robots.txt，並指向 sitemap 讓搜尋引擎自動發現

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const site = (config.public.siteUrl || '').replace(/\/$/, '')

  const body =
    `User-agent: *\n` +
    `Allow: /\n` +
    `\n` +
    `Sitemap: ${site}/sitemap.xml\n`

  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return body
})
