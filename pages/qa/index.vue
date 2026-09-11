<template>
  <div class="qa-page">
    <!-- HERO -->
    <div class="hero">
      <div class="glow"></div>
      <div class="wrap in">
        <div class="ey">{{ $t('qa.eyebrow') }}</div>
        <h1>{{ $t('qa.title') }}</h1>
        <p>{{ $t('qa.intro') }}</p>
        <div class="quick">
          <NuxtLink to="/download">{{ $t('qa.quickDownload') }}</NuxtLink>
          <NuxtLink to="/partner">{{ $t('qa.quickDealers') }}</NuxtLink>
        </div>
      </div>
    </div>

    <!-- 保固重點帶 -->
    <div class="perf">
      <div class="row">
        <div class="c"><b>{{ $t('qa.perf1') }}</b><small>{{ $t('qa.perf1Sub') }}</small></div>
        <div class="c"><b>{{ $t('qa.perf2') }}</b><small>{{ $t('qa.perf2Sub') }}</small></div>
        <div class="c"><b>{{ $t('qa.perf3') }}</b><small>{{ $t('qa.perf3Sub') }}</small></div>
      </div>
    </div>

    <!-- 內容：由後台 API 的 content 顯示（API 照舊） -->
    <section>
      <div class="wrap-sm">
        <div v-if="question" class="rich" v-html="question"></div>
        <p v-else class="empty">{{ $t('qa.empty') }}</p>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta">
      <div class="wrap">
        <div class="lbl">{{ $t('qa.ctaLabel') }}</div>
        <h2>{{ $t('qa.ctaTitle') }}</h2>
        <p>{{ $t('qa.ctaDesc') }}</p>
        <div class="cta-btns">
          <NuxtLink to="/partner" class="btn o">{{ $t('home.findDealers') }}</NuxtLink>
          <NuxtLink to="/download" class="btn ghost">{{ $t('qa.quickDownload') }}</NuxtLink>
        </div>
      </div>
    </section>

    <div class="updated">{{ $t('qa.updated') }}</div>
  </div>
</template>

<script setup>
const { t } = useI18n()
const config = useRuntimeConfig()

// 常見問題內容（API 照舊：/question 取 result.content）
const { data } = await useAsyncData('qa-question', () =>
  $fetch(`${config.public.apiBase}/question`)
)

const question = computed(() => data.value?.result?.content ?? '')

useHead({
  title: () => t('qa.title')
})
</script>

<style scoped>
.qa-page {
  --ink: #0d1b2e;
  --text: #1b2431;
  --muted: #5b6675;
  --dim: #93a0b0;
  --bg: #fff;
  --bg2: #f5f7fa;
  --line: #e6ebf1;
  --navy: #007ABE;
  --dark: #0d1016;
  font-family: 'Noto Sans JP', 'Noto Sans TC', system-ui, 'Microsoft JhengHei', sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.75;
  letter-spacing: 0.02em;
}
.qa-page a { color: inherit; text-decoration: none; }
.wrap { max-width: 1080px; margin: 0 auto; padding: 0 26px; }
.wrap-sm { max-width: 900px; margin: 0 auto; padding: 0 26px; }
.qa-page section { padding: 56px 0; }

.btn {
  display: inline-flex; align-items: center; justify-content: center;
  min-height: 44px; background: var(--navy); color: #fff; font-weight: 500;
  padding: 12px 26px; border-radius: 9px; font-size: 14px; transition: transform 0.16s, filter 0.16s;
}
.btn:hover { transform: translateY(-2px); filter: brightness(1.06); }
.btn.o { background: var(--navy); color: #ffffff; font-weight: 700; }
.btn.ghost { background: transparent; border: 1px solid #33405a; color: #fff; }

/* hero */
.hero { position: relative; overflow: hidden; background: linear-gradient(115deg, #f3f6fa, #e7eef6 55%, #dbe6f1); }
.hero .glow { position: absolute; right: -80px; top: -60px; width: 420px; height: 420px; border-radius: 50%; background: radial-gradient(circle, rgba(61, 123, 255, 0.16), transparent 62%); z-index: 1; }
.hero .in { position: relative; z-index: 2; padding: 52px 8px 46px; }
.hero .ey { font-size: 12px; letter-spacing: 4px; color: var(--navy); font-weight: 700; }
.hero h1 { font-size: clamp(28px, 5vw, 44px); font-weight: 900; color: var(--ink); line-height: 1.15; margin: 10px 0; }
.hero p { color: #41506b; max-width: 560px; font-weight: 300; }
.quick { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 22px; }
.quick a { font-size: 13px; color: var(--navy); background: #fff; border: 1px solid #d7e0ea; border-radius: 22px; padding: 8px 16px; transition: 0.16s; }
.quick a:hover { background: var(--navy); color: #fff; border-color: var(--navy); }

/* 保固重點帶 */
.perf { background: var(--navy); }
.perf .row { max-width: 1080px; margin: 0 auto; padding: 20px 26px; display: grid; grid-template-columns: repeat(3, 1fr); }
.perf .c { text-align: center; padding: 0 16px; border-right: 1px solid rgba(255, 255, 255, 0.14); }
.perf .c:last-child { border-right: none; }
.perf b { display: block; font-size: 16px; font-weight: 800; color: var(--navy); }
.perf small { font-size: 11px; color: rgba(255, 255, 255, 0.55); }

/* 後台內容（統一成新站字體與排版） */
.rich :deep(*) { font-family: 'Noto Sans JP', 'Noto Sans TC', 'Microsoft JhengHei', sans-serif !important; }
.rich :deep(h1), .rich :deep(h2) { font-size: clamp(20px, 2.6vw, 26px); font-weight: 900; color: var(--ink); margin: 30px 0 12px; }
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
.cta { background: radial-gradient(110% 130% at 82% 18%, rgba(61, 123, 255, 0.24), rgba(61, 123, 255, 0.03) 46%, var(--dark) 74%), var(--dark); color: #fff; text-align: center; }
.cta .lbl { font-size: 11px; font-weight: 700; letter-spacing: 2px; color: var(--navy); text-transform: uppercase; }
.cta h2 { color: #fff; font-size: clamp(22px, 3vw, 30px); font-weight: 900; margin-top: 12px; }
.cta p { color: #aeb8c6; max-width: 480px; margin: 10px auto 0; font-weight: 300; }
.cta-btns { margin-top: 22px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }

.updated { text-align: center; font-size: 12px; color: var(--dim); padding: 20px 26px; border-top: 1px solid var(--line); line-height: 1.9; }

@media (max-width: 820px) {
  .perf .row { grid-template-columns: 1fr; gap: 12px; }
  .perf .c { border-right: none; }
}
</style>
