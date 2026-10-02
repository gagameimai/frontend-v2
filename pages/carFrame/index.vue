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
        <div class="ey" :style="banner.kickerColor ? { color: banner.kickerColor } : null">{{ banner.kicker || $t('carFrame.eyebrow') }}</div>
        <h1 :style="banner.titleColor ? { color: banner.titleColor } : null">{{ banner.title || $t('carFrame.title') }}</h1>
        <p :style="banner.descColor ? { color: banner.descColor } : null">{{ banner.desc || $t('carFrame.intro') }}</p>
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
  --bg2: var(--site-bg2, #f5f7fa);
  --line: #e6ebf1;
  --navy: #023059; /* 美邁 VIS 深藍（歌樂頁才用 var(--site-accent, #007abe)） */
  --orange: #F28729; /* 美邁 VIS 橘 */
  --blue: #3d7bff;
  --dark: var(--site-dark, #0d1016);
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
.hero .ey { font-size: 12px; letter-spacing: 4px; color: var(--orange); font-weight: 700; }
.hero h1 { font-size: clamp(28px, 5vw, 44px); font-weight: 900; color: var(--ink); line-height: 1.15; margin: 10px 0; }
.hero p { width: 100%; color: #41506b; max-width: 560px; font-weight: 300; }
.crumb { font-size: 12px; color: var(--dim); padding: 4px 0 6px; }
.crumb a:hover { color: var(--navy); }

/* 找不到你的車：深色滿版（照草稿 .help） */
.help {
  background: radial-gradient(110% 130% at 82% 18%, rgba(61, 123, 255, 0.22), rgba(61, 123, 255, 0.03) 46%, var(--dark) 74%), var(--dark);
  color: #fff; text-align: center; padding: 56px 0;
}
.help .kick { display: flex; justify-content: center; align-items: baseline; gap: 8px; margin-bottom: 10px; }
.help .kick .en { font-size: 12px; font-weight: 800; letter-spacing: 2px; color: #fff; text-transform: uppercase; }
.help .kick .jp { font-size: 12px; color: #8fb2ff; }
.help h2 { color: #fff; font-size: clamp(22px, 3.2vw, 30px); font-weight: 900; }
.help p { max-width: 520px; margin: 12px auto 0; color: #aeb8c6; font-size: 14px; line-height: 1.8; }
.help-btns { margin-top: 22px; }
.help-btns .btn {
  display: inline-flex; align-items: center; justify-content: center; min-width: 160px; height: 46px; padding: 0 22px;
  border-radius: 10px; background: var(--orange); color: #1a1205; font-weight: 700; font-size: 14px; transition: transform 0.15s, filter 0.15s;
}
.help-btns .btn:hover { transform: translateY(-2px); filter: brightness(1.06); }
</style>
