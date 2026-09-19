<template>
  <div class="sfd-page">
    <!-- 麵包屑（白底，CameraDetail 樣式） -->
    <div class="wrap">
      <div class="crumb">
        <NuxtLink to="/">{{ $t('safetyDetail.home') }}</NuxtLink> ／
        <NuxtLink to="/safety">{{ $t('safetyDetail.category') }}</NuxtLink> ／
        {{ info.name }}
      </div>
    </div>

    <!-- 產品主視覺（左圖右資訊，CameraDetail 樣式） -->
    <div class="wrap">
      <div class="phero">
        <div class="gal-main" @click="openLightbox(info.img, info.name)">
          <img
            v-if="info.img"
            :src="info.img"
            :alt="info.name"
            referrerpolicy="no-referrer"
            loading="eager"
            @error="onImgError"
          />
        </div>
        <div class="pinfo">
          <div class="ey">{{ eyebrow }}</div>
          <h1>{{ info.name }}</h1>
          <p class="sub">{{ info.memo_in }}</p>
          <div class="warranty">{{ $t('multimediaDetail.warranty') }}</div>
          <div class="price">
            {{ $t('multimediaDetail.priceNote') }}　<span>{{ $t('multimediaDetail.priceSub') }}</span>
          </div>
          <ShareButtons :title="info.name" />
        </div>
      </div>
    </div>

    <!-- 產品內文：後台 API 的 content（ckeditor），原樣顯示 -->
    <div v-if="info.content" class="rich wrap" v-html="info.content"></div>

    <!-- 適用車款（blindspot 專屬，保留原功能） -->
    <section v-if="brandList.length" class="sec">
      <h2>{{ $t('safetyDetail.applicableModels') }}</h2>
      <div class="finder2">
        <select v-model="selectBrandId">
          <option v-for="(b, i) in brandList" :key="i" :value="b.id">{{ b.name }}</option>
        </select>
      </div>
      <div class="wrap">
        <div v-if="filteredDepend.length" class="fitgrid">
          <div v-for="(el, i) in filteredDepend" :key="i" class="fitcard">
            <h4>{{ $t('safetyDetail.labelModel') }}{{ el.style || '-' }}</h4>
            <p>{{ $t('safetyDetail.labelYear') }}{{ el.year || '-' }}</p>
            <p>{{ $t('safetyDetail.labelSpec') }}{{ el.spc || '-' }}</p>
          </div>
        </div>
        <p v-else class="nodata">{{ $t('safetyDetail.noData') }}</p>
      </div>
    </section>

    <!-- 圖片放大燈箱 -->
    <div class="lb-modal" :class="{ open: lightbox.open }" @click="closeLightbox">
      <button class="lb-close" aria-label="close">✕</button>
      <img :src="lightbox.src" :alt="lightbox.alt" />
    </div>
  </div>
</template>

<script setup>
import { usePageSeo } from '~/composables/usePageSeo'
const route = useRoute()
const config = useRuntimeConfig()
const { t } = useI18n()

const eyebrow = computed(() => `${t('safetyDetail.category')} ｜ ${t('header.mm')}`)

// 取單一產品資料（Nuxt 3 SSR 寫法）：
// 1) data.value?.result 安全取值，避免 undefined 的 reading 'result' 錯
// 2) watch route.params.id → 切換不同產品時重新抓
const { data } = await useAsyncData(
  'blindspot-detail',
  () => $fetch(`${config.public.apiBase}/blindspot/${route.params.id}`),
  { watch: [() => route.params.id] }
)

const info = computed(() => data.value?.result ?? {})
const brandList = computed(() => info.value.car_brand ?? [])
const dependList = computed(() => info.value.depend ?? [])

// 適用車款：預設選第一個車廠，資料變動時自動校正
const selectBrandId = ref(null)
watch(
  brandList,
  (list) => {
    if (list.length && !list.some((b) => b.id === selectBrandId.value)) {
      selectBrandId.value = list[0].id
    }
  },
  { immediate: true }
)

const filteredDepend = computed(() =>
  dependList.value.filter((el) => String(el.car_brand_id) === String(selectBrandId.value))
)

// 圖片放大
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

// SEO：標題／描述／og／canonical 一次設定。
// 標題補上類別（例如「ME-82+ 多媒體安卓機」），只放型號在搜尋結果上沒有任何關鍵字。
usePageSeo({
  title: () => {
    const name = info.value.name
    const cat = t('safetyDetail.title')
    return name ? `${name} ${cat}` : cat
  },
  description: () => info.value.memo_in || '',
  image: () => info.value.img || '/new_panel.png'
})
</script>

<style scoped>
.sfd-page {
  --ink: #0d1b2e;
  --text: #1b2431;
  --muted: #5b6675;
  --dim: #93a0b0;
  --bg: #fff;
  --bg2: #f5f7fa;
  --line: #e6ebf1;
  --navy: #007ABE;
  --blue-soft: #6fa0ff;
  --dark: #0d1016;
  font-family: 'Noto Sans TC', system-ui, 'Microsoft JhengHei', sans-serif;
  color: var(--text);
  line-height: 1.75;
  letter-spacing: 0.02em;
  background: var(--bg);
}
.sfd-page a { color: inherit; text-decoration: none; }
.sfd-page img { display: block; max-width: 100%; }
.wrap { max-width: 1080px; margin: 0 auto; padding: 0 26px; }

.btn {
  display: inline-flex; align-items: center; justify-content: center;
  min-height: 44px; background: var(--navy); color: #fff; font-weight: 500;
  padding: 11px 22px; border-radius: 9px; font-size: 14px; transition: transform 0.16s, filter 0.16s;
}
.btn:hover { transform: translateY(-2px); filter: brightness(1.06); }
.btn.o { background: var(--navy); color: #ffffff; font-weight: 700; }
.btn.ghost { background: transparent; border: 1px solid var(--line); color: var(--ink); }

.crumb { font-size: 12px; color: var(--dim); padding: 16px 0; }
.crumb a:hover { color: var(--navy); }

.phero { display: grid; grid-template-columns: 1.3fr 1fr; gap: 44px; padding: 10px 0 40px; }
.gal-main { aspect-ratio: 4/3; border: 1px solid var(--line); border-radius: 16px; background: #fff; position: relative; overflow: hidden; cursor: zoom-in; }
.gal-main img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; padding: 8px; mix-blend-mode: multiply; }
.pinfo .ey { font-size: 12px; letter-spacing: 3px; color: var(--blue-soft); font-weight: 500; text-transform: uppercase; }
.pinfo h1 { font-size: clamp(26px, 4.5vw, 40px); font-weight: 900; color: var(--ink); margin: 12px 0 14px; line-height: 1.15; }
.pinfo .sub { color: var(--muted); font-weight: 300; font-size: 15px; margin-bottom: 16px; max-width: 440px; }
.warranty { display: inline-flex; align-items: center; gap: 8px; background: var(--bg2); border: 1px solid var(--line); border-radius: 20px; padding: 7px 14px; font-size: 12px; color: var(--navy); font-weight: 500; margin: 10px 0; }
.price { margin: 14px 0; font-size: 14px; color: var(--muted); }
.price span { font-size: 12px; }
@media (max-width: 820px) {
  .phero { grid-template-columns: 1fr; gap: 24px; padding: 16px 0 30px; }
}

.rich { margin-top: 20px; padding-bottom: 8px; }
.rich :deep(*) { font-family: 'Noto Sans TC', 'Microsoft JhengHei', sans-serif !important; }
.rich :deep(img) { max-width: 100%; height: auto; margin: 14px auto; background: #fff; mix-blend-mode: multiply; }
.rich :deep(table) { max-width: 100%; margin: 0 auto; }

.sec { padding: 44px 0; border-top: 1px solid var(--line); margin-top: 20px; }
.sec h2 { text-align: center; margin-bottom: 22px; font-size: clamp(22px, 3vw, 30px); font-weight: 900; color: var(--ink); }
.finder2 { display: flex; justify-content: center; margin-bottom: 22px; }
.finder2 select { background: #fff; border: 1px solid #dde3ea; border-radius: 9px; height: 42px; padding: 0 14px; font-size: 14px; font-family: inherit; color: var(--text); min-width: 220px; }
.fitgrid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.fitcard { border: 1px solid var(--line); border-radius: 12px; padding: 16px 18px; background: #fff; }
.fitcard h4 { font-size: 15px; font-weight: 700; color: var(--ink); margin-bottom: 6px; }
.fitcard p { font-size: 13px; color: var(--muted); margin: 2px 0; }
.nodata { color: var(--dim); text-align: center; }

.lb-modal { position: fixed; inset: 0; z-index: 9999; display: none; align-items: center; justify-content: center; padding: 24px; background: rgba(1, 27, 51, 0.88); backdrop-filter: blur(6px); cursor: zoom-out; }
.lb-modal.open { display: flex; }
.lb-modal img { max-width: min(94vw, 1180px); max-height: 88vh; object-fit: contain; border-radius: 14px; background: #fff; box-shadow: 0 28px 70px rgba(0, 0, 0, 0.4); }
.lb-close { position: absolute; top: 20px; right: 24px; width: 44px; height: 44px; border-radius: 50%; background: rgba(255, 255, 255, 0.14); border: 1px solid rgba(255, 255, 255, 0.3); color: #fff; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; }

@media (max-width: 820px) { .fitgrid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 520px) { .fitgrid { grid-template-columns: 1fr; } }
</style>
