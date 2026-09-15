<template>
  <div class="hud-page">
    <!-- 麵包屑（白底，din 草稿樣式） -->
    <div class="wrap">
      <div class="crumb">
        <NuxtLink to="/">{{ $t('headUnitDetail.home') }}</NuxtLink> ／
        <span>{{ $t('header.clarion') }}</span> ／
        <NuxtLink to="/headUnit">{{ $t('headUnitDetail.category') }}</NuxtLink> ／
        {{ info.name }}
      </div>
    </div>

    <!-- 產品主視覺（左圖右資訊，din 詳情草稿樣式） -->
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
          <div v-else class="noph"><b>clarion</b><span>{{ $t('headUnitDetail.imgPlaceholder') }}</span></div>
        </div>
        <div class="pinfo">
          <div class="ey">{{ eyebrow }}</div>
          <h1>{{ info.name }}</h1>
          <p class="sub">{{ info.memo_in }}</p>
          <ul v-if="specList.length" class="speclist">
            <li v-for="(spec, i) in specList" :key="i">{{ spec }}</li>
          </ul>
          <div v-if="info.price" class="price-tag">
            <span class="pt-label">{{ $t('headUnitDetail.specPrice') }}</span>
            <span class="pt-value">{{ info.price }}</span>
          </div>
          <div class="warranty">{{ $t('multimediaDetail.warranty') }}</div>
          <div v-if="!info.price" class="price">
            {{ $t('multimediaDetail.priceNote') }}　<span>{{ $t('multimediaDetail.priceSub') }}</span>
          </div>
          <ShareButtons :title="info.name" />
        </div>
      </div>
    </div>

    <!-- 產品內文：後台 API 的 content（ckeditor），原樣顯示 -->
    <div v-if="info.content" class="rich wrap" v-html="info.content"></div>

    <!-- 圖片放大燈箱 -->
    <div class="lb-modal" :class="{ open: lightbox.open }" @click="closeLightbox">
      <button class="lb-close" aria-label="close">✕</button>
      <img :src="lightbox.src" :alt="lightbox.alt" />
    </div>
  </div>
</template>

<script setup>
import { useProductJsonLd } from '~/composables/useJsonLd'
const route = useRoute()
const config = useRuntimeConfig()
const { t } = useI18n()

const eyebrow = computed(() => `${t('header.clarion')} ｜ ${t('headUnitDetail.category')}`)

/**
 * 車用主機 API（後台尚未建立）
 * 待後端提供後把 ENDPOINT 改成實際路徑（例：'/headunit'）即可自動載入，版面不需調整。
 * 預期回傳格式與其他詳情端點一致：{ result: { name, img, memo_in, content } }
 */
const ENDPOINT = '/head_unit'

const { data } = await useAsyncData(
  'headunit-detail',
  () =>
    ENDPOINT
      ? $fetch(`${config.public.apiBase}${ENDPOINT}/${route.params.id}`).catch(() => ({ result: {} }))
      : Promise.resolve({ result: {} }),
  { watch: [() => route.params.id] }
)
const info = computed(() => data.value?.result ?? {})

// 規格條列：尺寸／硬碟／記憶體／解析度／建議售價，沒有值的欄位就不顯示那行
const specList = computed(() => {
  const list = []
  if (info.value.size) list.push(`${t('headUnitDetail.specSize')}：${info.value.size}`)
  if (info.value.hard_drive) list.push(`${t('headUnitDetail.specHardDrive')}：${info.value.hard_drive}`)
  if (info.value.ram) list.push(`${t('headUnitDetail.specRam')}：${info.value.ram}`)
  if (info.value.resolution) list.push(`${t('headUnitDetail.specResolution')}：${info.value.resolution}`)
  return list
})

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

// 商品結構化資料（沒有價格就不輸出 offers，避免產生無效資料）
useProductJsonLd(() => ({
  name: info.value.name,
  brand: 'Clarion',
  description: info.value.memo_in,
  image: info.value.img,
  sku: info.value.id,
  price: info.value.price
}))

useHead({
  title: () => info.value.name || t('headUnitDetail.title'),
  meta: [
    { name: 'description', content: () => info.value.memo_in || '' },
    { property: 'og:description', content: () => info.value.memo_in || '' },
    { property: 'og:image', content: () => info.value.img || '/new_panel.png' }
  ]
})
</script>

<style scoped>
.hud-page {
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
.hud-page a { color: inherit; text-decoration: none; }
.hud-page img { display: block; max-width: 100%; }
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
.gal-main { aspect-ratio: 4/3; border: 1px solid var(--line); border-radius: 16px; background: #fff; position: relative; overflow: hidden; cursor: zoom-in; display: flex; align-items: center; justify-content: center; }
.gal-main img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; padding: 8px; mix-blend-mode: multiply; }
.gal-main .noph { text-align: center; color: #9aa7b6; }
.gal-main .noph b { display: block; font-size: 22px; color: #c4cdd8; letter-spacing: 1px; }
.gal-main .noph span { font-size: 12px; }
.pinfo .ey { font-size: 12px; letter-spacing: 3px; color: var(--blue-soft); font-weight: 500; text-transform: uppercase; }
.pinfo h1 { font-size: clamp(26px, 4.5vw, 40px); font-weight: 900; color: var(--ink); margin: 12px 0 14px; line-height: 1.15; }
.pinfo .sub { color: var(--muted); font-weight: 300; font-size: 15px; margin-bottom: 16px; max-width: 440px; }
.speclist { list-style: none; margin: 16px 0; padding: 0; }
.speclist li { font-size: 14px; color: var(--text); padding: 7px 0; border-bottom: 1px solid var(--line); display: flex; gap: 8px; }
.speclist li::before { content: '■'; color: var(--navy); font-size: 10px; margin-top: 4px; }
.price-tag { display: flex; align-items: baseline; gap: 8px; margin: 14px 0 10px; }
.price-tag .pt-label { font-size: 13px; color: var(--muted); font-weight: 500; }
.price-tag .pt-value { font-size: 24px; font-weight: 900; color: var(--navy); }
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

.lb-modal { position: fixed; inset: 0; z-index: 9999; display: none; align-items: center; justify-content: center; padding: 24px; background: rgba(1, 27, 51, 0.88); backdrop-filter: blur(6px); cursor: zoom-out; }
.lb-modal.open { display: flex; }
.lb-modal img { max-width: min(94vw, 1180px); max-height: 88vh; object-fit: contain; border-radius: 14px; background: #fff; box-shadow: 0 28px 70px rgba(0, 0, 0, 0.4); }
.lb-close { position: absolute; top: 20px; right: 24px; width: 44px; height: 44px; border-radius: 50%; background: rgba(255, 255, 255, 0.14); border: 1px solid rgba(255, 255, 255, 0.3); color: #fff; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
</style>
