<template>
  <div class="cf-page">
    <!-- HERO（歌樂 OEM 頁樣式，品牌文字改 MEIMAI） -->
    <div class="hero">
      <!-- 後台「列表頁 Banner 管理」：桌機 1920×480（4:1）、手機 1080×608（16:9）。
           兩張都交給 CSS 變數，≤640px 由樣式表切到手機那張；手機沒設定就沿用桌機。 -->
      <!-- 手機版：有上傳手機圖就用手機圖，沒上傳就自動用電腦版圖片；電腦版跟手機版都沒圖才顯示預設底色 -->
      <div v-if="banner.img" class="bg bg-desktop" :style="{ backgroundImage: 'url(' + banner.img + ')' }"></div>
      <div v-if="banner.imgMobile || banner.img" class="bg bg-mobile" :style="{ backgroundImage: 'url(' + (banner.imgMobile || banner.img) + ')' }"></div>
      <div v-if="!banner.img" class="glow glow-desktop"></div>
      <div v-if="!banner.imgMobile && !banner.img" class="glow glow-mobile"></div>
      <div v-if="banner.img" class="ov ov-desktop"></div>
      <div v-if="banner.imgMobile || banner.img" class="ov ov-mobile"></div>
      <div class="wrap in">
        <div class="ey">{{ $t('carFrame.eyebrow') }}</div>
        <h1>{{ $t('carFrame.title') }}</h1>
        <p>{{ $t('carFrame.intro') }}</p>
      </div>
    </div>

    <section class="finder-sec">
      <div class="wrap">
        <div class="crumb">
          <NuxtLink to="/">{{ $t('carFrame.home') }}</NuxtLink> ／ {{ $t('carFrame.title') }}
        </div>

        <!-- 選車型：照草稿「安卓車框頁_混搭版.html」的查詢方式（車廠 → 車款 → 年份 → 結果）。
             結果只顯示車框＋完工照與基本規格，「看詳細內容」連到 /carFrameDetail/:id，這一頁不展開詳細內容。
             流程、資料、樣式都在 components/CarFrameFinder.vue。 -->
        <CarFrameFinder />
      </div>
    </section>

    <!-- 為什麼要用專用車框 -->
    <section class="feat">
      <div class="wrap">
        <div class="kick"><div class="lbl">{{ $t('carFrame.whyKicker') }}</div></div>
        <h2>{{ $t('carFrame.whyTitle') }}</h2>
        <div class="row">
          <div class="fb">
            <b>{{ $t('carFrame.why1Title') }}</b>
            <p>{{ $t('carFrame.why1Desc') }}</p>
          </div>
          <div class="fb">
            <b>{{ $t('carFrame.why2Title') }}</b>
            <p>{{ $t('carFrame.why2Desc') }}</p>
          </div>
          <div class="fb">
            <b>{{ $t('carFrame.why3Title') }}</b>
            <p>{{ $t('carFrame.why3Desc') }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { usePageSeo } from '~/composables/usePageSeo'
import { useListBanner } from '~/composables/useListBanner'

const { t } = useI18n()

// Banner 背景圖（後台「列表頁 Banner 管理」；沒設定就用下面的預設漸層背景）
const banner = useListBanner('carFrame')

// SEO：標題／描述／canonical
usePageSeo({
  title: () => t('carFrame.title'),
  description: () => t('carFrame.intro'),
  brand: 'mm'
})
</script>

<style scoped>
.cf-page {
  --ink: #0d1b2e;
  --text: #1b2431;
  --muted: #5b6675;
  --dim: #93a0b0;
  --bg: #fff;
  --bg2: #f5f7fa;
  --line: #e6ebf1;
  --navy: #007ABE;
  --blue: #3d7bff;
  --dark: #0d1016;
  font-family: 'Noto Sans TC', system-ui, 'Microsoft JhengHei', sans-serif;
  color: var(--text);
  line-height: 1.75;
  letter-spacing: 0.02em;
  background: var(--bg);
}
.cf-page a { color: inherit; text-decoration: none; }
.cf-page img { display: block; max-width: 100%; }
.cf-page h2 { font-size: clamp(22px, 3vw, 30px); font-weight: 900; color: var(--ink); }
.cf-page .wrap { max-width: 1080px; margin: 0 auto; padding: 0 26px; }
.cf-page section { padding: 48px 0; }
.cf-page .finder-sec { padding-top: 22px; }

/* hero */
.hero { position: relative; width: 100%; overflow-x: hidden; background: linear-gradient(115deg, #f3f6fa, #e7eef6 55%, #dbe6f1); aspect-ratio: 4 / 1; min-height: 260px; display: flex; align-items: center; }
.hero .glow { position: absolute; right: -80px; top: -60px; width: 420px; height: 420px; border-radius: 50%; background: radial-gradient(circle, rgba(61, 123, 255, 0.16), transparent 62%); z-index: 1; }
.hero .bg { position: absolute; inset: 0; width: 100%; height: 100%; background-size: cover; background-position: center; }
.hero .ov { position: absolute; inset: 0; }
.hero .bg-mobile, .hero .glow-mobile, .hero .ov-mobile { display: none; }
@media (max-width: 640px) {
  .hero .bg-desktop, .hero .glow-desktop, .hero .ov-desktop { display: none; }
  .hero .bg-mobile, .hero .glow-mobile, .hero .ov-mobile { display: block; }
  .hero .ov-mobile { background: linear-gradient(90deg, rgba(243, 246, 250, 0.94) 0%, rgba(243, 246, 250, 0.92) 55%, rgba(243, 246, 250, 0.74) 82%, rgba(243, 246, 250, 0.3) 100%); }
}
.hero .in { position: relative; z-index: 2; width: 100%; min-width: 0; padding: 52px 8px 46px; }
.hero .ey { font-size: 12px; letter-spacing: 4px; color: var(--navy); font-weight: 700; }
.hero h1 { font-size: clamp(28px, 5vw, 44px); font-weight: 900; color: var(--ink); line-height: 1.15; margin: 10px 0; }
.hero p { width: 100%; color: #41506b; max-width: 560px; font-weight: 300; }
.crumb { font-size: 12px; color: var(--dim); padding: 4px 0 6px; }
.crumb a:hover { color: var(--navy); }

/* feature */
.feat { background: radial-gradient(110% 130% at 82% 18%, rgba(61, 123, 255, 0.22), rgba(61, 123, 255, 0.03) 46%, var(--dark) 74%), var(--dark); color: #fff; }
.feat h2 { color: #fff; }
.feat .kick { margin-bottom: 0; }
.feat .lbl { font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #8fb2ff; text-transform: uppercase; }
.feat .row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 22px; }
.fb { background: linear-gradient(150deg, #1b2740, #0d1016 82%); border: 1px solid #29344a; border-radius: 16px; padding: 22px; }
.fb b { color: #fff; font-size: 16px; }
.fb p { color: #aeb8c6; font-size: 13px; margin-top: 6px; }

@media (max-width: 820px) {
  .feat .row { grid-template-columns: 1fr; }
}
</style>
