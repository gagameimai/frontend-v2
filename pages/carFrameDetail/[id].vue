<template>
  <div class="cfd-page">
    <!-- 麵包屑 -->
    <div class="crumbwrap">
      <div class="wrap">
        <div class="crumb">
          <NuxtLink to="/">{{ $t('carFrameDetail.home') }}</NuxtLink>
          <span class="sep">/</span>
          <NuxtLink to="/carFrame">{{ $t('carFrameDetail.category') }}</NuxtLink>
          <span class="sep">/</span>
          <span class="cur">{{ info.brand_name }} {{ info.car_name }}</span>
        </div>
      </div>
    </div>

    <!-- 產品主視覺 -->
    <div class="wrap">
      <div class="phero">
        <div class="gal-main" @click="openLightbox(info.img, heading)">
          <img v-if="info.img" :src="info.img" :alt="heading" loading="eager" @error="onImgError" />
        </div>
        <div class="pinfo">
          <div class="ey">{{ $t('carFrameDetail.eyebrow') }}</div>
          <h1>{{ heading }}</h1>
          <p class="sub">{{ $t('carFrameDetail.lead') }}</p>
          <ul class="speclist">
            <li>{{ $t('carFrameDetail.specYear', { start: info.year_start || '-', end: info.year_end || '-' }) }}</li>
            <li>{{ $t('carFrameDetail.specSize', { size: info.size || '-' }) }}</li>
            <li>{{ $t('carFrameDetail.specMold') }}</li>
            <li>{{ $t('carFrameDetail.specInstall') }}</li>
          </ul>
          <div class="warranty">{{ $t('carFrameDetail.warranty') }}</div>
          <div class="price">{{ $t('carFrameDetail.priceNote') }}　<span>{{ $t('carFrameDetail.priceSub') }}</span></div>
          <ShareButtons :title="heading" />
        </div>
      </div>
    </div>

    <!-- 產品內文（後台 content） -->
    <div v-if="info.content" class="wrap">
      <div class="rich" v-html="info.content"></div>
    </div>

    <!-- 車框概觀 -->
    <div v-if="info.img3" class="gsec">
      <div class="wrap">
        <h2>{{ $t('carFrameDetail.overview') }}</h2>
        <div class="ggrid one">
          <div class="gtile" @click="openLightbox(info.img3, $t('carFrameDetail.overview'))">
            <img :src="info.img3" :alt="$t('carFrameDetail.overview')" loading="lazy" @error="onImgError" />
          </div>
        </div>
      </div>
    </div>

    <!-- 車框配件 -->
    <div v-if="img1List.length" class="gsec">
      <div class="wrap">
        <h2>{{ $t('carFrameDetail.accessories') }}</h2>
        <div class="ggrid">
          <div
            v-for="(image, i) in img1List"
            :key="i"
            class="gtile"
            @click="openLightbox(image, $t('carFrameDetail.accessories'))"
          >
            <img :src="image" :alt="$t('carFrameDetail.accessories')" loading="lazy" @error="onImgError" />
          </div>
        </div>
      </div>
    </div>

    <!-- 實際安裝 -->
    <div v-if="img2List.length" class="gsec alt">
      <div class="wrap">
        <h2>{{ $t('carFrameDetail.installed') }}</h2>
        <div class="ggrid">
          <div
            v-for="(image, i) in img2List"
            :key="i"
            class="gtile"
            @click="openLightbox(image, $t('carFrameDetail.installed'))"
          >
            <img :src="image" :alt="$t('carFrameDetail.installed')" loading="lazy" @error="onImgError" />
          </div>
        </div>
      </div>
    </div>

    <!-- 推薦搭配安卓機 -->
    <div v-if="multiMediasInfo.length" class="gsec">
      <div class="wrap">
        <h2>{{ $t('carFrameDetail.recommend') }}</h2>
        <div class="recgrid">
          <NuxtLink
            v-for="(m, index) in multiMediasInfo"
            :key="index"
            class="reccard"
            :to="'/multimediaDetail/' + m.id"
          >
            <div class="im">
              <img :src="m.img" :alt="m.name" loading="lazy" @error="onImgError" />
            </div>
            <div class="bd">
              <h4>{{ m.name }}</h4>
              <div class="sp">
                {{ $t('multimedia.hardware') }}：{{ m.hard_drive || '-' }}<br />
                {{ $t('multimedia.ram') }}：{{ m.ram || '-' }}<br />
                {{ $t('multimedia.resolution') }}：{{ m.resolution || '-' }}
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- 圖片放大燈箱 -->
    <div class="lb-modal" :class="{ open: lightbox.open }" @click="closeLightbox">
      <button class="lb-close" aria-label="close">✕</button>
      <img :src="lightbox.src" :alt="lightbox.alt" />
    </div>
  </div>
</template>

<script setup>
const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const { t } = useI18n()

// 推薦搭配的安卓機（Nuxt 3 SSR 寫法，安全取值）
const { data: mmData } = await useAsyncData('carframe-recommend', () =>
  $fetch(`${runtimeConfig.public.apiBase}/multimedia`)
)
const multiMediasInfo = computed(() => mmData.value?.result ?? [])

// 車框詳情：data.value?.result 安全取值，避免 undefined 的 reading 'result' 錯；
// watch route.params.id → 換不同車框時會重新抓
const { data: cfData } = await useAsyncData(
  'carframe-detail',
  () => $fetch(`${runtimeConfig.public.apiBase}/carframe/${route.params.id}`),
  { watch: [() => route.params.id] }
)
const info = computed(() => cfData.value?.result ?? {})

// 標題：品牌 + 車款 + 型號
const heading = computed(() =>
  `${info.value.brand_name || ''} ${info.value.car_name || ''}${info.value.name || ''}`.trim()
)

// 圖庫（img1 車框配件 / img2 實際安裝）可能是陣列，過濾空值
const img1List = computed(() => (Array.isArray(info.value.img1) ? info.value.img1 : []).filter(Boolean))
const img2List = computed(() => (Array.isArray(info.value.img2) ? info.value.img2 : []).filter(Boolean))

// 圖片放大燈箱
const lightbox = ref({ open: false, src: '', alt: '' })
const openLightbox = (src, alt) => {
  if (src) lightbox.value = { open: true, src, alt }
}
const closeLightbox = () => {
  lightbox.value.open = false
}
const onImgError = (e) => {
  e.target.style.display = 'none'
}

const descText = () => {
  const c = info.value
  if (!c.brand_name) return ''
  return `${c.brand_name} ${c.car_name || ''} ${c.year_start || ''}-${c.year_end || ''} ${c.size || ''}吋`
}

useHead({
  title: () => heading.value || t('carFrameDetail.title'),
  meta: [
    { name: 'description', content: () => descText() },
    { property: 'og:description', content: () => descText() },
    { property: 'og:image', content: () => info.value.img || '/new_panel.png' }
  ]
})
</script>

<style scoped>
.cfd-page {
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
.cfd-page a { color: inherit; text-decoration: none; }
.cfd-page img { display: block; max-width: 100%; }
.wrap { max-width: 1080px; margin: 0 auto; padding: 0 26px; }

.btn {
  display: inline-flex; align-items: center; justify-content: center;
  min-height: 44px; background: var(--navy); color: #fff; font-weight: 500;
  padding: 11px 22px; border-radius: 9px; font-size: 14px; transition: transform 0.16s, filter 0.16s;
}
.btn:hover { transform: translateY(-2px); filter: brightness(1.06); }
.btn.o { background: var(--navy); color: #ffffff; font-weight: 700; }
.btn.ghost { background: transparent; border: 1px solid var(--line); color: var(--ink); }

.crumbwrap { background: linear-gradient(115deg, #f3f6fa, #e9eff7 60%, #dfe8f2); border-bottom: 1px solid var(--line); }
.crumb { font-size: 13px; color: var(--muted); padding: 16px 0; }
.crumb a:hover { color: var(--navy); }
.crumb .sep { color: #c2ccd8; margin: 0 6px; }
.crumb .cur { color: var(--ink); font-weight: 600; }

/* phero */
.phero { display: grid; grid-template-columns: 1.3fr 1fr; gap: 44px; padding: 30px 0 50px; align-items: center; }
.gal-main { aspect-ratio: 4/3; border: 1px solid var(--line); border-radius: 18px; background: linear-gradient(150deg, #f2f5f9, #e4ebf3); position: relative; overflow: hidden; cursor: zoom-in; }
.gal-main img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; padding: 8px; mix-blend-mode: multiply; }
.pinfo .ey { font-size: 12px; letter-spacing: 3px; color: var(--navy); font-weight: 700; text-transform: uppercase; }
.pinfo h1 { font-size: clamp(24px, 3.6vw, 36px); font-weight: 900; color: var(--ink); margin: 10px 0 12px; line-height: 1.2; }
.pinfo .sub { color: var(--muted); font-weight: 300; font-size: 15px; margin-bottom: 20px; max-width: 440px; }
.speclist { list-style: none; display: flex; flex-direction: column; gap: 9px; margin-bottom: 24px; }
.speclist li { font-size: 14px; color: var(--muted); padding-left: 16px; position: relative; }
.speclist li::before { content: '·'; position: absolute; left: 0; color: var(--navy); font-weight: 900; }
.warranty { display: inline-flex; align-items: center; gap: 8px; background: var(--bg2); border: 1px solid var(--line); border-radius: 20px; padding: 7px 14px; font-size: 12px; color: var(--navy); font-weight: 500; margin: 4px 0 10px; }
.price { margin: 6px 0 14px; font-size: 14px; color: var(--muted); }
.price span { font-size: 12px; }

.rich { margin-top: 6px; padding-bottom: 8px; }
.rich :deep(*) { font-family: 'Noto Sans TC', 'Microsoft JhengHei', sans-serif !important; }
.rich :deep(img) { max-width: 100%; height: auto; margin: 12px auto; }
.rich :deep(table) { max-width: 100%; margin: 0 auto; }

.gsec { padding: 48px 0; border-top: 1px solid var(--line); text-align: center; }
.gsec.alt { background: var(--bg2); }
.gsec h2 { margin-bottom: 24px; font-size: clamp(20px, 2.6vw, 26px); font-weight: 900; color: var(--ink); }
.ggrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; max-width: 820px; margin: 0 auto; }
.ggrid.one { grid-template-columns: 1fr; max-width: 520px; }
.gtile { aspect-ratio: 4/3; border: 1px solid var(--line); border-radius: 14px; overflow: hidden; position: relative; background: var(--bg2); cursor: zoom-in; }
.gtile img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }

.recgrid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; max-width: 980px; margin: 0 auto; text-align: left; }
.reccard { border: 1px solid var(--line); border-radius: 14px; overflow: hidden; background: #fff; transition: transform 0.2s, box-shadow 0.2s; display: block; }
.reccard:hover { transform: translateY(-5px); box-shadow: 0 16px 36px rgba(13, 27, 46, 0.12); }
.reccard .im { aspect-ratio: 4/3; background: #fff; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.reccard .im img { width: 100%; height: 100%; object-fit: contain; padding: 12px; mix-blend-mode: multiply; }
.reccard .bd { padding: 14px 16px; }
.reccard h4 { font-size: 15px; font-weight: 700; color: var(--ink); }
.reccard .sp { font-size: 12px; color: var(--dim); margin-top: 4px; line-height: 1.6; }

.lb-modal { position: fixed; inset: 0; z-index: 9999; display: none; align-items: center; justify-content: center; padding: 24px; background: rgba(1, 27, 51, 0.88); backdrop-filter: blur(6px); cursor: zoom-out; }
.lb-modal.open { display: flex; }
.lb-modal img { max-width: min(94vw, 1180px); max-height: 88vh; object-fit: contain; border-radius: 14px; background: #fff; box-shadow: 0 28px 70px rgba(0, 0, 0, 0.4); }
.lb-close { position: absolute; top: 20px; right: 24px; width: 44px; height: 44px; border-radius: 50%; background: rgba(255, 255, 255, 0.14); border: 1px solid rgba(255, 255, 255, 0.3); color: #fff; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; }

@media (max-width: 820px) {
  .phero { grid-template-columns: 1fr; gap: 24px; padding: 20px 0 36px; }
  .recgrid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .ggrid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 520px) {
  .recgrid { grid-template-columns: 1fr; }
}
@media (max-width: 420px) {
  .ggrid { grid-template-columns: 1fr; }
}
</style>
