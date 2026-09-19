<template>
  <div class="sf-page">
    <!-- HERO -->
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
        <div class="ey">{{ $t('portable.eyebrow') }}</div>
        <h1>{{ $t('portable.title') }}</h1>
        <p>{{ $t('portable.intro') }}</p>
      </div>
    </div>

    <section>
      <div class="wrap">
        <div class="crumb">
          <NuxtLink to="/">{{ $t('portable.home') }}</NuxtLink> ／ {{ $t('portable.title') }}
        </div>

        <div class="shead">
          <div>
            <div class="sub">{{ $t('portable.sectionKicker') }}</div>
            <div class="cn">{{ $t('portable.sectionTitle') }}</div>
            <div class="desc">{{ $t('portable.sectionDesc') }}</div>
          </div>
          <NuxtLink to="/partner" class="btn ghost">{{ $t('portable.findInstaller') }}</NuxtLink>
        </div>

        <div class="grid">
          <NuxtLink
            v-for="(item, index) in productList"
            :key="index"
            class="card"
            :to="'/portableDetail/' + item.id"
          >
            <div class="img">
              <span class="badge">{{ $t('portable.badge') }}</span>
              <img :src="item.img" :alt="item.name" loading="lazy" @error="onImgError" />
            </div>
            <div class="body">
              <h3>{{ item.name }}</h3>
              <div v-if="item.memo" class="spec">{{ item.memo }}</div>
              <div class="foot">
                <span class="ch">{{ $t('portable.supplyByDealer') }}</span>
                <span class="ask">{{ $t('portable.viewDetail') }}</span>
              </div>
            </div>
          </NuxtLink>
        </div>

        <p v-if="productList.length === 0" class="empty">{{ $t('portable.empty') }}</p>
      </div>
    </section>

    <!-- help -->
    <section class="help">
      <div class="wrap">
        <h2>{{ $t('portable.helpTitle') }}</h2>
        <p class="help-p">{{ $t('portable.helpDesc') }}</p>
        <div class="help-btns">
          <NuxtLink to="/partner" class="btn o">{{ $t('home.findDealers') }}</NuxtLink>
          <NuxtLink to="/qa" class="btn ghost-light">{{ $t('home.faq') }}</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { usePageSeo } from '~/composables/usePageSeo'
import { useListBanner } from '~/composables/useListBanner'

const config = useRuntimeConfig()

// Banner 背景圖（後台「列表頁 Banner 管理」；沒設定就用下面的預設漸層背景）
const banner = useListBanner('portable')

/**
 * 可攜式 API（後台尚未建立）
 * 待後端提供後把 ENDPOINT 改成實際路徑（例：'/portable'）即可自動載入，版面不需調整。
 * 預期回傳格式與其他端點一致：{ result: [ { id, name, img, memo } ] }
 */
const ENDPOINT = '/portable'

const { data } = await useAsyncData('portable-list', () =>
  ENDPOINT
    ? $fetch(`${config.public.apiBase}${ENDPOINT}`)
    : Promise.resolve({ result: [] })
)
const productList = computed(() => data.value?.result ?? [])

const onImgError = (e) => {
  e.target.style.display = 'none'
}

// SEO：標題／描述／canonical
const { t: seoT } = useI18n()
usePageSeo({
  title: () => seoT('portable.title'),
  description: () => seoT('portable.intro')
})
</script>

<style scoped>
.sf-page {
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
  color: var(--text);
  line-height: 1.75;
  letter-spacing: 0.02em;
  background: var(--bg);
}
.sf-page a { color: inherit; text-decoration: none; }
.sf-page img { display: block; max-width: 100%; }
.sf-page h2 { font-size: clamp(22px, 3vw, 30px); font-weight: 900; color: var(--ink); }
.sf-page .wrap { max-width: 1080px; margin: 0 auto; padding: 0 26px; }
.sf-page section { padding: 48px 0; }

.btn {
  display: inline-flex; align-items: center; justify-content: center;
  min-height: 44px; background: var(--navy); color: #fff; font-weight: 500;
  padding: 11px 22px; border-radius: 9px; font-size: 14px; border: 0; cursor: pointer;
  transition: transform 0.16s, filter 0.16s;
}
.btn:hover { transform: translateY(-2px); filter: brightness(1.06); }
.btn.o { background: var(--navy); color: #ffffff; font-weight: 700; }
.btn.ghost { background: transparent; border: 1px solid #b7c1cf; color: var(--ink); }
.btn.ghost-light { background: transparent; border: 1px solid var(--line); color: var(--ink); margin-left: 10px; }

/* hero */
.hero { position: relative; width: 100%; overflow-x: hidden; background: linear-gradient(115deg, #f3f6fa, #e7eef6 55%, #dbe6f1); aspect-ratio: 4 / 1; min-height: 260px; display: flex; align-items: center; }
.hero .glow { position: absolute; right: -80px; top: -60px; width: 420px; height: 420px; border-radius: 50%; background: radial-gradient(circle, rgba(61, 123, 255, 0.16), transparent 62%); z-index: 1; }
.hero .bg { position: absolute; inset: 0; width: 100%; height: 100%; background-size: cover; background-position: center; }
.hero .ov { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(243, 246, 250, 0.94) 0%, rgba(243, 246, 250, 0.9) 34%, rgba(243, 246, 250, 0.66) 50%, rgba(243, 246, 250, 0) 64%); }
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
.crumb { font-size: 12px; color: var(--dim); padding: 4px 0 18px; }
.crumb a:hover { color: var(--navy); }

.shead { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 22px; flex-wrap: wrap; }
.shead .sub { font-size: 12px; letter-spacing: 2px; color: var(--dim); font-weight: 700; text-transform: uppercase; }
.shead .cn { font-size: clamp(20px, 2.6vw, 26px); font-weight: 900; color: var(--ink); }
.shead .desc { color: var(--muted); font-size: 13px; font-weight: 300; max-width: 560px; margin-top: 4px; }

/* product grid */
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.card { border: 1px solid var(--line); border-radius: 16px; overflow: hidden; background: #fff; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; display: block; }
.card:hover { transform: translateY(-6px); box-shadow: 0 18px 40px rgba(13, 27, 46, 0.12); }
.card .img { position: relative; aspect-ratio: 4/3; background: linear-gradient(150deg, #eef2f7, #dbe4ef); display: flex; align-items: center; justify-content: center; color: #8ea0b6; font-size: 13px; text-align: center; padding: 0 12px; }
.card .img img { position: absolute; inset: 0; z-index: 2; width: 100%; height: 100%; object-fit: contain; background: #fff; padding: 10px; mix-blend-mode: multiply; }
.card .badge { position: absolute; top: 10px; left: 10px; z-index: 3; font-size: 11px; font-weight: 700; background: var(--navy); color: #fff; padding: 2px 9px; border-radius: 20px; }
.card .body { padding: 16px 18px; }
.card h3 { font-size: 16px; font-weight: 700; color: var(--ink); }
.card .spec { color: var(--dim); font-size: 12px; margin: 4px 0 10px; min-height: 20px; }
.card .foot { display: flex; align-items: center; justify-content: space-between; margin-top: 10px; }
.card .ch { color: var(--muted); font-size: 13px; font-weight: 600; }
.card .ask { font-size: 12px; color: var(--navy); border: 1px solid var(--line); border-radius: 7px; padding: 6px 12px; }

.empty { text-align: center; color: var(--dim); font-size: 14px; padding: 30px 0; }

/* help */
.help { background: var(--bg2); border-top: 1px solid var(--line); text-align: center; }
.help-p { max-width: 480px; margin: 10px auto 0; color: var(--muted); }
.help-btns { margin-top: 20px; }

@media (max-width: 820px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 520px) {
  .grid { grid-template-columns: 1fr; }
}
</style>
