<template>
  <div class="cp-page">
    <!-- HERO：沿用品牌故事／常見問題的標題帶樣式（本頁為純文字聲明頁，不接後台 Banner） -->
    <div class="hero">
      <div class="glow"></div>
      <div class="wrap in">
        <div class="ey">{{ $t('contentPolicy.eyebrow') }}</div>
        <h1>{{ cms.title || $t('contentPolicy.title') }}</h1>
        <p>{{ cms.intro || $t('contentPolicy.intro') }}</p>
      </div>
    </div>

    <!-- 三個重點帶 -->
    <div class="perf">
      <div class="row">
        <div class="c"><b>{{ $t('contentPolicy.perf1') }}</b><small>{{ $t('contentPolicy.perf1Sub') }}</small></div>
        <div class="c"><b>{{ $t('contentPolicy.perf2') }}</b><small>{{ $t('contentPolicy.perf2Sub') }}</small></div>
        <div class="c"><b>{{ $t('contentPolicy.perf3') }}</b><small>{{ $t('contentPolicy.perf3Sub') }}</small></div>
      </div>
    </div>

    <!-- 內文：後台「系統設定 → 內容來源與更正聲明」有填就用後台的（依語言），沒填用下面內建的版本 -->
    <section v-if="cms.body">
      <div class="wrap-sm rich">
        <div v-html="cmsHtml"></div>
      </div>
    </section>
    <section v-else>
      <div class="wrap-sm rich">
        <h2>{{ $t('contentPolicy.s1Title') }}</h2>
        <p>{{ $t('contentPolicy.s1P1') }}</p>
        <p>{{ $t('contentPolicy.s1P2') }}</p>

        <h2>{{ $t('contentPolicy.s2Title') }}</h2>
        <ul>
          <li>{{ $t('contentPolicy.s2L1') }}</li>
          <li>{{ $t('contentPolicy.s2L2') }}</li>
          <li>{{ $t('contentPolicy.s2L3') }}</li>
          <li>{{ $t('contentPolicy.s2L4') }}</li>
        </ul>

        <h2>{{ $t('contentPolicy.s3Title') }}</h2>
        <p>{{ $t('contentPolicy.s3P1') }}</p>
        <div class="contact">
          <div class="ct"><span class="k">{{ $t('contentPolicy.email') }}</span><a :href="'mailto:' + email">{{ email }}</a></div>
          <div class="ct"><span class="k">{{ $t('contentPolicy.tel') }}</span><a :href="'tel:' + tel">{{ tel }}</a></div>
        </div>
        <p>{{ $t('contentPolicy.s3P2') }}</p>
        <ol>
          <li>{{ $t('contentPolicy.s3L1') }}</li>
          <li>{{ $t('contentPolicy.s3L2') }}</li>
          <li>{{ $t('contentPolicy.s3L3') }}</li>
          <li>{{ $t('contentPolicy.s3L4') }}</li>
        </ol>
        <p class="note">{{ $t('contentPolicy.s3Note') }}</p>

        <h2>{{ $t('contentPolicy.s4Title') }}</h2>
        <div class="steps">
          <div class="st"><b>1</b><div><strong>{{ $t('contentPolicy.step1') }}</strong><span>{{ $t('contentPolicy.step1Sub') }}</span></div></div>
          <div class="st"><b>2</b><div><strong>{{ $t('contentPolicy.step2') }}</strong><span>{{ $t('contentPolicy.step2Sub') }}</span></div></div>
          <div class="st"><b>3</b><div><strong>{{ $t('contentPolicy.step3') }}</strong><span>{{ $t('contentPolicy.step3Sub') }}</span></div></div>
          <div class="st"><b>4</b><div><strong>{{ $t('contentPolicy.step4') }}</strong><span>{{ $t('contentPolicy.step4Sub') }}</span></div></div>
        </div>

        <h2>{{ $t('contentPolicy.s5Title') }}</h2>
        <p>{{ $t('contentPolicy.s5P1') }}</p>
        <p>{{ $t('contentPolicy.s5P2') }}</p>
        <p class="upd">{{ $t('contentPolicy.updated') }}</p>
      </div>
    </section>

    <!-- CTA：與品牌故事頁相同 -->
    <section class="cta">
      <div class="wrap">
        <div class="lbl">{{ $t('contentPolicy.ctaLabel') }}</div>
        <h2>{{ $t('contentPolicy.ctaTitle') }}</h2>
        <p>{{ $t('contentPolicy.ctaDesc') }}</p>
        <div class="cta-btns">
          <a :href="'mailto:' + email" class="btn o">{{ $t('contentPolicy.ctaMail') }}</a>
          <NuxtLink to="/qa" class="btn ghost">{{ $t('home.faq') }}</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { usePageSeo } from '~/composables/usePageSeo'
import { useWebsiteInfo } from '~/composables/useWebsiteInfo'

const { t, locale } = useI18n()
const config = useRuntimeConfig()
const { data: site } = await useWebsiteInfo()
// 後台可編輯的內容（API 照 about 的做法：/content_policy 取 result.{zh,en}.{title,intro,body}）
const { data: cmsData } = await useAsyncData('contentPolicy', () =>
  $fetch(`${config.public.apiBase}/content_policy`).catch(() => ({ result: null }))
)
// 後台內文裡單獨一行寫 [聯絡方式]（英文版 [contact]）的地方，會換成 E-mail／電話卡片；沒寫就放在內文最後面
const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
const cmsHtml = computed(() => {
  const card =
    '<div class="contact">' +
    '<div class="ct"><span class="k">' + esc(t('contentPolicy.email')) + '</span><a href="mailto:' + esc(email.value) + '">' + esc(email.value) + '</a></div>' +
    '<div class="ct"><span class="k">' + esc(t('contentPolicy.tel')) + '</span><a href="tel:' + esc(tel.value) + '">' + esc(tel.value) + '</a></div>' +
    '</div>'
  const body = cms.value.body || ''
  const token = /<p[^>]*>\s*\[(?:聯絡方式|contact)\]\s*<\/p>/i
  return token.test(body) ? body.replace(token, card) : body + card
})
const cms = computed(() => {
  const r = cmsData.value?.result || {}
  const lang = locale.value === 'en' ? 'en' : 'zh'
  return r[lang] || { title: '', intro: '', body: '' }
})
// 聯絡方式取自後台「網站基本設定」，後台改了這裡就跟著變；沒填時用公司預設值
const email = computed(() => site.value?.result?.email || 'mm@meimai.com.tw')
const tel = computed(() => site.value?.result?.tel || '03-2170098')

usePageSeo({
  title: () => cms.value.title || t('contentPolicy.seoTitle'),
  description: () => t('contentPolicy.seoDesc')
})
</script>

<style scoped>
.cp-page {
  --ink: #0d1b2e;
  --text: #1b2431;
  --muted: #5b6675;
  --dim: #93a0b0;
  --bg: #fff;
  --bg2: var(--site-bg2, #f5f7fa);
  --line: #e6ebf1;
  --navy: var(--site-accent, #007abe);
  --dark: var(--site-dark, #0d1016);
  font-family: 'Noto Sans TC', system-ui, 'Microsoft JhengHei', sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.75;
  letter-spacing: 0.02em;
}
.cp-page a { color: inherit; text-decoration: none; }
.wrap { max-width: 1080px; margin: 0 auto; padding: 0 26px; }
.wrap-sm { max-width: 900px; margin: 0 auto; padding: 0 26px; }
.cp-page section { padding: 56px 0; }

.btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 11px 22px; border-radius: 8px; font-size: 14px; font-weight: 600; letter-spacing: 0.04em;
  transition: transform 0.18s ease, filter 0.18s ease;
}
.btn:hover { transform: translateY(-2px); filter: brightness(1.06); }
.btn.o { background: var(--navy); color: #ffffff; font-weight: 700; }
.btn.ghost { background: transparent; border: 1px solid #33405a; color: #fff; }

/* HERO：與品牌故事頁同一套尺寸與底色 */
.hero { position: relative; width: 100%; overflow-x: hidden; background: linear-gradient(115deg, #f3f6fa, #e7eef6 55%, #dbe6f1); aspect-ratio: 4 / 1; min-height: 260px; display: flex; align-items: center; }
.hero .glow { position: absolute; right: -80px; top: -60px; width: 420px; height: 420px; border-radius: 50%; background: radial-gradient(circle, rgba(61, 123, 255, 0.16), transparent 62%); z-index: 1; }
.hero .in { position: relative; z-index: 2; width: 100%; min-width: 0; padding: 52px 8px 46px; }
.hero .ey { font-size: 12px; letter-spacing: 4px; color: var(--navy); font-weight: 700; }
.hero h1 { font-size: clamp(28px, 5vw, 44px); font-weight: 900; color: var(--ink); line-height: 1.15; margin: 10px 0; max-width: 640px; }
.hero p { width: 100%; color: #41506b; max-width: 560px; font-weight: 300; margin-top: 6px; }
@media (max-width: 640px) { .hero { aspect-ratio: 16 / 9; } }

/* 重點帶：與常見問題頁同一套 */
.perf { background: var(--navy); }
.perf .row { max-width: 1080px; margin: 0 auto; padding: 22px 26px; display: grid; grid-template-columns: repeat(3, 1fr); }
.perf .c { text-align: center; padding: 0 16px; border-right: 1px solid rgba(255, 255, 255, 0.14); }
.perf .c:last-child { border-right: none; }
.perf b { display: block; font-size: 20px; font-weight: 900; color: #fff; }
.perf small { font-size: 11px; color: rgba(255, 255, 255, 0.7); letter-spacing: 1px; }

/* 內文：與品牌故事頁 .rich 同一套（:deep 讓後台貼的 HTML 也套得到） */
.rich :deep(h1), .rich :deep(h2) { font-size: clamp(20px, 2.6vw, 26px); font-weight: 900; color: var(--ink); margin: 30px 0 12px; }
.rich :deep(h2:first-child) { margin-top: 0; }
.rich :deep(h3), .rich :deep(h4) { font-size: 16px; font-weight: 800; color: var(--navy); margin: 22px 0 8px; }
.rich :deep(p) { color: var(--muted); font-weight: 300; margin: 8px 0; }
.rich :deep(ul), .rich :deep(ol) { padding-left: 20px; margin: 8px 0; }
.rich :deep(li) { color: var(--muted); margin: 5px 0; line-height: 1.8; }
.rich :deep(strong), .rich :deep(b) { color: var(--ink); }
.rich :deep(a:hover) { text-decoration: underline; }
.rich :deep(img) { max-width: 100%; height: auto; margin: 12px auto; }
.rich :deep(small) { font-size: 13px; color: var(--dim); }
.rich h2 { font-size: clamp(20px, 2.6vw, 26px); font-weight: 900; color: var(--ink); margin: 30px 0 12px; }
.rich h2:first-child { margin-top: 0; }
.rich p { color: var(--muted); font-weight: 300; margin: 8px 0; }
.rich ul, .rich ol { padding-left: 20px; margin: 8px 0; }
.rich li { color: var(--muted); margin: 5px 0; line-height: 1.8; }
.rich strong { color: var(--ink); }
.rich .note { font-size: 13px; color: var(--dim); }
.rich .upd { font-size: 13px; color: var(--dim); margin-top: 28px; }

.contact, .rich :deep(.contact) { display: flex; flex-wrap: wrap; gap: 10px 28px; background: var(--bg2); border: 1px solid var(--line); border-radius: 10px; padding: 14px 18px; margin: 12px 0 16px; }
.contact .ct, .rich :deep(.contact .ct) { display: flex; align-items: center; gap: 10px; font-size: 15px; }
.contact .k, .rich :deep(.contact .k) { font-size: 12px; font-weight: 700; letter-spacing: 1px; color: var(--navy); }
.contact a, .rich :deep(.contact a) { color: var(--ink); font-weight: 600; }
.contact a:hover, .rich :deep(.contact a:hover) { text-decoration: underline; }

.steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 14px 0 6px; }
.st { display: flex; gap: 12px; align-items: flex-start; border: 1px solid var(--line); border-radius: 10px; padding: 14px; background: #fff; }
.st b { flex: 0 0 30px; width: 30px; height: 30px; border-radius: 50%; background: var(--navy); color: #fff; font-weight: 900; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; }
.st strong { display: block; font-size: 14px; color: var(--ink); margin-bottom: 2px; }
.st span { font-size: 12.5px; color: var(--muted); line-height: 1.6; }

/* CTA：與品牌故事頁相同 */
.cta { background: radial-gradient(110% 130% at 82% 18%, rgba(61, 123, 255, 0.24), rgba(61, 123, 255, 0.03) 46%, var(--dark) 74%), var(--dark); color: #fff; text-align: center; }
.cta .lbl { font-size: 11px; font-weight: 700; letter-spacing: 2px; color: var(--navy); text-transform: uppercase; }
.cta h2 { color: #fff; font-size: clamp(22px, 3vw, 30px); font-weight: 900; margin-top: 12px; }
.cta p { color: #aeb8c6; max-width: 480px; margin: 10px auto 0; font-weight: 300; }
.cta-btns { margin-top: 22px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }

@media (max-width: 820px) {
  .steps { grid-template-columns: 1fr 1fr; }
  .perf .row { grid-template-columns: 1fr; gap: 12px; }
  .perf .c { border-right: none; border-bottom: 1px solid rgba(255, 255, 255, 0.14); padding-bottom: 10px; }
  .perf .c:last-child { border-bottom: none; padding-bottom: 0; }
}
@media (max-width: 520px) {
  .steps { grid-template-columns: 1fr; }
}
</style>
