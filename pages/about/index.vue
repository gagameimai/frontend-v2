<template>
  <div class="about-page">
    <!-- HERO -->
    <div class="hero" :class="{ 'has-bn': banner.img }">
      <!-- 後台「列表頁 Banner 管理 → 關於我們」：電腦版 1920×480（4:1）、手機版 1080×608（16:9）。
           沒上傳就維持原本的標題帶樣式。 -->
      <div v-if="banner.img" class="bn" :style="{ '--bg': 'url(' + banner.img + ')', '--bg-m': 'url(' + (banner.imgMobile || banner.img) + ')' }"></div>
      <div v-if="banner.img" class="bn-ov"></div>
      <div v-if="!banner.img" class="glow"></div>
      <div class="wrap in">
        <div class="ey">{{ $t('about.eyebrow') }}</div>
        <h1>{{ $t('about.heroTitleLine1') }}<br />{{ $t('about.heroTitleLine2') }}</h1>
        <p>{{ $t('about.heroDesc') }}</p>
      </div>
    </div>

    <section>
      <div class="wrap-sm">
        <div v-if="aboutContent" class="rich" v-html="aboutContent"></div>
        <p v-else class="empty">{{ $t('about.empty') }}</p>
      </div>
    </section>

    <!-- 常見問題 -->
    <section class="faq">
      <div class="wrap-sm">
        <div class="lbl">{{ $t('about.faqLabel') }}</div>
        <h2>{{ $t('about.faqTitle') }}</h2>
        <div class="fq" v-for="(item, i) in faqItems" :key="i">
          <h3>{{ item.q }}</h3>
          <p>{{ item.a }}</p>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta">
      <div class="wrap">
        <div class="lbl">{{ $t('about.ctaLabel') }}</div>
        <h2>{{ $t('about.ctaTitle') }}</h2>
        <p>{{ $t('about.ctaDesc') }}</p>
        <div class="cta-btns">
          <NuxtLink to="/partner" class="btn o">{{ $t('home.findDealers') }}</NuxtLink>
          <NuxtLink to="/qa" class="btn ghost">{{ $t('home.faq') }}</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { usePageSeo } from '~/composables/usePageSeo'
import { useListBanner } from '~/composables/useListBanner'

const banner = useListBanner('about')
import { useOrganizationJsonLd, useFaqJsonLd } from '~/composables/useJsonLd'

const { t } = useI18n()
const config = useRuntimeConfig()

const { data } = await useAsyncData('about-content', () =>
  $fetch(`${config.public.apiBase}/about`).catch(() => ({ result: {} }))
)

const aboutContent = computed(() => data.value?.result?.content ?? '')

// 頁面上顯示的常見問題（同一份資料也拿去做 FAQPage 結構化資料，兩邊必須一致）
const faqItems = computed(() => [
  { q: t('about.faqQ1'), a: t('about.faqA1') },
  { q: t('about.faqQ2'), a: t('about.faqA2') },
  { q: t('about.faqQ3'), a: t('about.faqA3') }
])

usePageSeo({
  title: () => t('about.seoTitle'),
  description: () => t('about.seoDesc'),
  noSuffix: true
})
useOrganizationJsonLd()
useFaqJsonLd(() => faqItems.value)
</script>

<style scoped>
.about-page {
  --ink: #0d1b2e;
  --text: #1b2431;
  --muted: #5b6675;
  --dim: #93a0b0;
  --bg: #fff;
  --bg2: #f5f7fa;
  --line: #e6ebf1;
  --navy: #007ABE;
  --dark: #0d1016;
  font-family: 'Noto Sans TC', system-ui, 'Microsoft JhengHei', sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.75;
  letter-spacing: 0.02em;
}
.about-page a { color: inherit; text-decoration: none; }
.wrap { max-width: 1080px; margin: 0 auto; padding: 0 26px; }
.wrap-sm { max-width: 900px; margin: 0 auto; padding: 0 26px; }
.about-page section { padding: 56px 0; }

.btn {
  display: inline-flex; align-items: center; justify-content: center;
  min-height: 44px; background: var(--navy); color: #fff; font-weight: 500;
  padding: 12px 26px; border-radius: 9px; font-size: 14px; transition: transform 0.16s, filter 0.16s;
}
.btn:hover { transform: translateY(-2px); filter: brightness(1.06); }
.btn.o { background: var(--navy); color: #ffffff; font-weight: 700; }
.btn.ghost { background: transparent; border: 1px solid #33405a; color: #fff; }

/* hero */
.hero { position: relative; overflow: hidden; background: linear-gradient(115deg, #eef2f7, #dde5ef 60%, #cfdae8); }
.hero .glow { position: absolute; right: -80px; top: -60px; width: 420px; height: 420px; border-radius: 50%; background: radial-gradient(circle, rgba(61, 123, 255, 0.16), transparent 62%); z-index: 1; }
.hero .in { position: relative; z-index: 2; padding: 56px 8px 46px; }
.hero .ey { font-size: 12px; letter-spacing: 4px; color: var(--navy); font-weight: 700; }
.hero h1 { font-size: clamp(26px, 4.5vw, 42px); font-weight: 900; color: var(--ink); line-height: 1.2; margin: 10px 0; max-width: 640px; }
.hero p { color: #41506b; max-width: 560px; font-weight: 300; margin-top: 6px; }

.stats { background: var(--navy); }
.stats .row { max-width: 1080px; margin: 0 auto; padding: 22px 26px; display: grid; grid-template-columns: repeat(4, 1fr); }
.stats .c { text-align: center; padding: 0 16px; border-right: 1px solid rgba(255, 255, 255, 0.14); }
.stats .c:last-child { border-right: none; }
.stats b { display: block; font-size: 22px; font-weight: 900; color: #fff; }
.stats small { font-size: 11px; color: rgba(255, 255, 255, 0.6); letter-spacing: 1px; }

.rich :deep(*) { font-family: 'Noto Sans TC', 'Microsoft JhengHei', sans-serif !important; }
.rich :deep(h1), .rich :deep(h2) { font-size: clamp(20px, 2.6vw, 26px); font-weight: 900; color: var(--ink); margin: 30px 0 12px; }
.rich :deep(h2:first-child) { margin-top: 0; }
.rich :deep(h3), .rich :deep(h4) { font-size: 16px; font-weight: 800; color: var(--navy); margin: 22px 0 8px; }
.rich :deep(p) { color: var(--muted); font-weight: 300; margin: 8px 0; }
.rich :deep(ul), .rich :deep(ol) { padding-left: 20px; margin: 8px 0; }
.rich :deep(li) { color: var(--muted); margin: 5px 0; line-height: 1.8; }
.rich :deep(strong), .rich :deep(b) { color: var(--ink); }
.rich :deep(a:hover) { text-decoration: underline; }
.rich :deep(img) { max-width: 100%; height: auto; margin: 12px auto; }
.rich :deep(table) { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 14px; }
.rich :deep(th), .rich :deep(td) { border: 1px solid var(--line); padding: 9px 12px; text-align: left; }
.rich :deep(th) { background: var(--bg2); color: var(--navy); font-weight: 700; }
.rich :deep(hr) { border: 0; border-top: 1px solid var(--line); margin: 24px 0; }

.empty { text-align: center; color: var(--dim); padding: 40px 0; }

/* CTA */
.faq {
  border-top: 1px solid var(--line, #e6ebf1);
}
.faq .lbl {
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--navy, #007abe);
  margin-bottom: 8px;
}
.faq h2 {
  font-size: 22px;
  font-weight: 800;
  color: var(--ink, #0d1b2e);
  margin: 0 0 24px;
}
.faq .fq {
  border-top: 1px solid var(--line, #e6ebf1);
  padding: 18px 0;
}
.faq .fq h3 {
  font-size: 15px;
  font-weight: 700;
  color: var(--ink, #0d1b2e);
  margin: 0 0 8px;
}
.faq .fq p {
  font-size: 14px;
  color: var(--muted, #5b6675);
  margin: 0;
  line-height: 1.85;
}

.cta { background: radial-gradient(110% 130% at 82% 18%, rgba(61, 123, 255, 0.24), rgba(61, 123, 255, 0.03) 46%, var(--dark) 74%), var(--dark); color: #fff; text-align: center; }
.cta .lbl { font-size: 11px; font-weight: 700; letter-spacing: 2px; color: var(--navy); text-transform: uppercase; }
.cta h2 { color: #fff; font-size: clamp(22px, 3vw, 30px); font-weight: 900; margin-top: 12px; }
.cta p { color: #aeb8c6; max-width: 480px; margin: 10px auto 0; font-weight: 300; }
.cta-btns { margin-top: 22px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }

@media (max-width: 820px) {
  .stats .row { grid-template-columns: repeat(2, 1fr); gap: 16px 0; }
  .stats .c:nth-child(2) { border-right: none; }
}

.hero.has-bn { aspect-ratio: 4 / 1; min-height: 260px; display: flex; align-items: center; }
.hero.has-bn .in, .hero.has-bn > .wrap { width: 100%; }
.hero .bn { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; background-image: var(--bg); background-size: cover; background-position: center; }
.hero .bn-ov { position: absolute; inset: 0; z-index: 1; background: linear-gradient(90deg, rgba(243, 246, 250, 0.94) 0%, rgba(243, 246, 250, 0.9) 34%, rgba(243, 246, 250, 0.66) 50%, rgba(243, 246, 250, 0) 64%); }
@media (max-width: 640px) {
  .hero.has-bn { display: block; aspect-ratio: auto; min-height: 0; }
  .hero.has-bn .bn { position: relative; inset: auto; height: auto; aspect-ratio: 16 / 9; background-image: var(--bg-m, var(--bg)); }
  .hero.has-bn .bn-ov { display: none; }
}
</style>
