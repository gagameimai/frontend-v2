<template>
  <div class="mmd-page">
    <!-- 麵包屑 -->
    <div class="wrap">
      <div class="crumb">
        <NuxtLink to="/">{{ $t('multimediaDetail.home') }}</NuxtLink> ／
        <NuxtLink :to="isClarion ? (Number(info.type) === 3 ? '/clarion/oem' : '/clarion/gl') : (Number(info.type) === 1 ? '/mm/oem' : '/mm/me')">{{ isClarion ? 'CLARION' : 'MEIMAI' }}</NuxtLink> ／
        <NuxtLink to="/multimedia">{{ $t('multimediaDetail.category') }}</NuxtLink> ／ {{ info.name }}
      </div>
    </div>

    <!-- 產品主視覺（OEM 詳情頁 phero 樣式） -->
    <div class="wrap">
      <div class="phero">
        <div class="gal">
          <div class="main">
            <img v-if="info.img" :src="info.img" :alt="info.name" @click="openLightbox(info.img, info.name)" />
            <div v-else class="noph"><b>{{ isClarion ? 'clarion' : 'MEIMAI' }}</b><span>{{ $t('multimediaDetail.photoPlaceholder') }}</span></div>
          </div>
        </div>
        <div class="pinfo">
          <div class="eyebrow">{{ isClarion ? $t('multimediaDetail.eyebrowClarion') : $t('multimediaDetail.eyebrow') }}</div>
          <h1>{{ info.name }}</h1>
          <ul v-if="specList.length" class="speclist">
            <li v-for="(spec, i) in specList" :key="i">{{ spec }}</li>
          </ul>
          <div class="warranty">{{ $t('multimediaDetail.warranty') }}</div>
          <div class="price">{{ $t('multimediaDetail.priceNote') }}　<span>{{ $t('multimediaDetail.priceSub') }}</span></div>
          <ShareButtons :title="info.name" />
        </div>
      </div>
    </div>

    <!-- 產品內文：由後台 API 的 content（ckeditor）顯示 -->
    <section id="detail" class="detail">
      <div class="wrap">
        <div class="content" v-html="info.content"></div>
      </div>
    </section>

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

// 取單一產品資料（Nuxt 3 SSR 寫法）：
// 1) 用 data.value?.result 安全取值，避免 undefined 的 reading 'result' 錯
// 2) watch route.params.id → 切換不同產品時會重新抓，修正「換頁沒生效」
const { data } = await useAsyncData(
  'multimedia-detail',
  () => $fetch(`${config.public.apiBase}/multimedia/${route.params.id}`),
  { watch: [() => route.params.id] }
)

const info = computed(() => data.value?.result ?? {})
// car_media.type：0=MM、1=MM 專用機、2=Clarion。品牌文字依此切換，不可寫死。
// type 2 = Clarion GL、type 3 = Clarion 車型專用機，兩者都算 Clarion
const isClarion = computed(() => [2, 3].includes(Number(info.value?.type)))

const lightbox = ref({ open: false, src: '', alt: '' })
const openLightbox = (src, alt) => { if (src) lightbox.value = { open: true, src, alt } }
const closeLightbox = () => { lightbox.value.open = false }

// 這支 API 混合 MM（type 0/1）與 Clarion（type 2）商品，網址看不出品牌，
// 抓到資料後把品牌寫進共用狀態，讓 Header.vue 切換成對應的 logo
const detailBrandOverride = useState('detailBrandOverride', () => null)
watch(
  () => info.value.type,
  (rawType) => {
    const type = rawType === null || rawType === undefined ? null : Number(rawType)
    if (type === 2) detailBrandOverride.value = 'clarion'
    else if (type === 0 || type === 1) detailBrandOverride.value = 'mm'
    else detailBrandOverride.value = null
  },
  { immediate: true }
)
onBeforeUnmount(() => {
  detailBrandOverride.value = null
})

// 規格條列：依後台「尺寸／硬碟／記憶體／解析度／建議售價」欄位，沒有值的欄位就不顯示那行
const specList = computed(() => {
  const list = []
  if (info.value.size) list.push(`${t('multimediaDetail.specSize')}：${info.value.size}`)
  if (info.value.ram) list.push(`${t('multimediaDetail.specRam')}：${info.value.ram}`)
  if (info.value.hard_drive) list.push(`${t('multimediaDetail.specHardDrive')}：${info.value.hard_drive}`)
  if (info.value.resolution) list.push(`${t('multimediaDetail.specResolution')}：${info.value.resolution}`)
  if (info.value.price) list.push(`${t('multimediaDetail.specPrice')}：${info.value.price}`)
  return list
})

// 商品結構化資料（沒有價格就不輸出 offers，避免產生無效資料）
useProductJsonLd(() => ({
  name: info.value.name,
  brand: isClarion.value ? 'Clarion' : 'MM 美邁',
  description: info.value.memo_in,
  image: info.value.img,
  sku: info.value.id,
  price: info.value.price
}))

useHead({
  title: () => info.value.name || t('multimediaDetail.title'),
  meta: [
    { name: 'description', content: () => info.value.memo_in || '' },
    { property: 'og:description', content: () => info.value.memo_in || '' },
    { property: 'og:image', content: () => info.value.img || '/new_panel.png' }
  ]
})
</script>

<style scoped>
.mmd-page {
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
  font-family: 'Noto Sans JP', 'Noto Sans TC', system-ui, 'Microsoft JhengHei', sans-serif;
  color: var(--text);
  line-height: 1.75;
  letter-spacing: 0.02em;
  background: var(--bg);
}
.mmd-page a { color: inherit; text-decoration: none; }
.mmd-page img { display: block; max-width: 100%; }
.wrap { max-width: 1080px; margin: 0 auto; padding: 0 26px; }

.btn {
  display: inline-flex; align-items: center; justify-content: center;
  min-height: 44px; background: var(--navy); color: #fff; font-weight: 500;
  padding: 12px 26px; border-radius: 9px; font-size: 14px; border: 0; cursor: pointer;
  transition: transform 0.16s, filter 0.16s;
}
.btn:hover { transform: translateY(-2px); filter: brightness(1.06); }
.btn.o { background: var(--navy); color: #ffffff; font-weight: 700; }
.btn.ghost { background: transparent; border: 1px solid var(--line); color: var(--ink); }

.crumb { font-size: 12px; color: var(--dim); padding: 16px 0; }
.crumb a:hover { color: var(--navy); }

/* phero */
.phero { display: grid; grid-template-columns: 1.3fr 1fr; gap: 44px; padding: 10px 0 40px; }
.gal .main { aspect-ratio: 4/3; border: 1px solid var(--line); border-radius: 16px; background: #fff; position: relative; overflow: hidden; cursor: zoom-in; }
.gal .main img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; padding: 8px; mix-blend-mode: multiply; }
.gal .main .noph { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; color: #8ea0b6; }
.gal .main .noph b { font-size: 22px; letter-spacing: 1px; color: #c3ccd7; }
.gal .main .noph span { font-size: 12px; background: rgba(255, 255, 255, 0.7); padding: 4px 12px; border-radius: 20px; }

.pinfo .eyebrow { font-size: 12px; letter-spacing: 3px; color: var(--blue-soft); font-weight: 500; text-transform: uppercase; }
.pinfo h1 { font-size: clamp(26px, 3.5vw, 40px); font-weight: 900; color: var(--ink); line-height: 1.16; margin: 12px 0 14px; }
.speclist { list-style: none; margin: 16px 0; padding: 0; }
.speclist li { font-size: 14px; color: var(--text); padding: 7px 0; border-bottom: 1px solid var(--line); display: flex; gap: 8px; }
.speclist li::before { content: '■'; color: var(--navy); font-size: 10px; margin-top: 4px; }
.warranty { display: inline-flex; align-items: center; gap: 8px; background: var(--bg2); border: 1px solid var(--line); border-radius: 20px; padding: 7px 14px; font-size: 12px; color: var(--navy); font-weight: 500; margin: 4px 0 10px; }
.price { margin: 6px 0 14px; font-size: 14px; color: var(--muted); }
.price span { font-size: 12px; }

/* 內文（ckeditor content） */
.detail { padding: 20px 0 50px; }
.content { max-width: 1080px; margin: 0 auto; }
.content :deep(*) { font-family: 'Noto Sans JP', 'Noto Sans TC', system-ui, 'Microsoft JhengHei', sans-serif !important; }
.content :deep(table) { max-width: 100%; }

@media (max-width: 820px) {
  .phero { grid-template-columns: 1fr; gap: 24px; }
}
.lb-modal { position: fixed; inset: 0; z-index: 9999; display: none; align-items: center; justify-content: center; padding: 24px; background: rgba(1, 27, 51, 0.88); backdrop-filter: blur(6px); cursor: zoom-out; }
.lb-modal.open { display: flex; }
.lb-modal img { max-width: min(94vw, 1180px); max-height: 88vh; object-fit: contain; border-radius: 14px; background: #fff; box-shadow: 0 28px 70px rgba(0, 0, 0, 0.4); }
.lb-close { position: absolute; top: 20px; right: 24px; width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.14); border: 1px solid rgba(255,255,255,0.3); color: #fff; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
</style>
