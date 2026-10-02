// 動態產生 robots.txt，並指向 sitemap 讓搜尋引擎自動發現
// 後台「SEO／GEO 設定 ▸ 允許 AI 爬蟲讀取網站」關閉時，會額外擋掉主要的 AI 爬蟲（需重新部署／重新產生才生效）

const AI_BOTS = ['GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'ClaudeBot', 'anthropic-ai', 'Google-Extended', 'PerplexityBot', 'CCBot']

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const site = (config.public.siteUrl || '').replace(/\/$/, '')

  // 讀不到後台設定（或沒設定）就當作允許
  let allowAi = true
  try {
    const res: any = await $fetch(`${config.public.apiBase}/website`)
    if (res?.result?.seo?.flags?.ai_bots === 0) allowAi = false
  } catch (e) {
    allowAi = true
  }

  const aiBlock = allowAi ? '' : AI_BOTS.map((b) => `User-agent: ${b}\nDisallow: /\n\n`).join('')

  const body =
    `User-agent: *\n` +
    `Allow: /\n` +
    `Disallow: /searchPage\n` +
    `\n` +
    aiBlock +
    `Sitemap: ${site}/sitemap.xml\n`

  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return body
})
