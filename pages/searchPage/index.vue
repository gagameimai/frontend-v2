<template>
  <div class="c-page sp-page">
    <!-- Hero（首頁混搭樣式：淺底大圖 + 遮罩） -->
    <section class="hero">
      <div class="bg" :style="{ backgroundImage: 'url(' + bannerBg + ')' }"></div>
      <div class="hero-ov"></div>
      <div class="wrap">
        <div class="crumb">
          <NuxtLink to="/">{{ $t('search.home') }}</NuxtLink> ／ {{ breadcrumb }}
        </div>
        <div class="eyebrow">{{ $t('search.eyebrow') }}</div>
        <h1>{{ $t('search.title') }}</h1>
        <p class="lead">{{ $t('search.intro') }}</p>
      </div>
    </section>

    <!-- 車型查詢 finder（比照首頁） -->
    <div class="finderwrap">
      <div class="finder">
        <span class="lab">{{ $t('search.finderLabel') }}</span>
        <select v-model="brandInputValue" @change="brandChange(true)">
          <option value="">{{ $t('search.selectBrand') }}</option>
          <option v-for="(brand, index) in brandList" :key="index" :value="brand.id">
            {{ brand.name }}
          </option>
        </select>
        <select v-model="modelInputValue" @change="modelChange" :disabled="typeSelect">
          <option value="">{{ $t('search.selectModel') }}</option>
          <option v-for="(model, index) in modelList" :key="index" :value="model.id">
            {{ model.name }}
          </option>
        </select>
        <select v-model="yearInputValue" :disabled="yearSelect">
          <option disabled value="undefined">{{ $t('search.selectYear') }}</option>
          <option v-for="(year, index) in yearList" :key="index">{{ year }}</option>
          <option value="">{{ $t('search.allYears') }}</option>
        </select>
        <a href="#" class="btn o" @click.prevent="searchData">{{ $t('home.search') }}</a>
      </div>
    </div>

    <!-- 搜尋結果 -->
    <section class="results">
      <div class="wrap">
        <!-- 多媒體機車框 -->
        <div v-if="carFrameList.length" class="cat">
          <div class="kicker"><span class="en">{{ $t('search.catFrameKicker') }}</span><span class="jp">／ {{ $t('search.catFrame') }}</span></div>
          <div class="grid">
            <NuxtLink
              v-for="(carFrameItem, index) in carFrameList"
              :key="index"
              class="card"
              :to="'/carFrameDetail/' + carFrameItem.id"
            >
              <div class="img">
                <img :src="frameImg(carFrameItem)" :alt="carFrameItem.name" loading="lazy" @error="onImgError" />
              </div>
              <div class="body">
                <h3>{{ carFrameItem.brand_name }} {{ carFrameItem.car_name }} {{ carFrameItem.name }}</h3>
                <div class="meta">
                  <span>{{ carFrameItem.year_start }} ~ {{ carFrameItem.year_end }}</span>
                  <span v-if="carFrameItem.size" class="chip">{{ carFrameItem.size }}{{ $t('search.inch') }}</span>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- 安卓車用多媒體機 -->
        <div v-if="carMediaList.length" class="cat">
          <div class="kicker"><span class="en">{{ $t('search.catMultimediaKicker') }}</span><span class="jp">／ {{ $t('search.catMultimedia') }}</span></div>
          <div class="grid">
            <NuxtLink
              v-for="(carMedia, idx) in carMediaList"
              :key="idx"
              class="card"
              :to="'/multimediaDetail/' + carMedia.id"
            >
              <div class="img">
                <img :src="carMedia.img" :alt="carMedia.name" loading="lazy" @error="onImgError" />
              </div>
              <div class="body">
                <h3>{{ carMedia.name }}</h3>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- 盲點偵測 -->
        <div v-if="carBlindSpotList.length" class="cat">
          <div class="kicker"><span class="en">{{ $t('search.catSafetyKicker') }}</span><span class="jp">／ {{ $t('search.catSafety') }}</span></div>
          <div class="grid">
            <NuxtLink
              v-for="(carBlindSpot, idx) in carBlindSpotList"
              :key="idx"
              class="card"
              :to="'/safetyDetail/' + carBlindSpot.id"
            >
              <div class="img">
                <img :src="carBlindSpot.img" :alt="carBlindSpot.name" loading="lazy" @error="onImgError" />
              </div>
              <div class="body">
                <h3>{{ carBlindSpot.name }}</h3>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- 車用配件 -->
        <div v-if="carFittingList.length" class="cat">
          <div class="kicker"><span class="en">{{ $t('search.catAccessoriesKicker') }}</span><span class="jp">／ {{ $t('search.catAccessories') }}</span></div>
          <div class="grid">
            <NuxtLink
              v-for="(carFitting, idx) in carFittingList"
              :key="idx"
              class="card"
              :to="'/fittingDetail/' + carFitting.id"
            >
              <div class="img">
                <img :src="carFitting.img" :alt="carFitting.name" loading="lazy" @error="onImgError" />
              </div>
              <div class="body">
                <h3>{{ carFitting.name }}</h3>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- 查無結果 -->
        <div v-if="!hasResults" class="empty">
          <p>{{ $t('search.emptyText') }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { usePageSeo } from '~/composables/usePageSeo'
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import carFrame from '~/static/carFrame.js'

const { $axios } = useNuxtApp()
const route = useRoute()
const router = useRouter()

// ---- 車型查詢（沿用首頁邏輯）----
const brandList = ref([])
const carList = ref([])
const modelList = ref([])
const yearList = ref([])
const types = ref([])
const years = ref([])
const brandInputValue = ref('')
const modelInputValue = ref('')
const yearInputValue = ref(undefined)
const typeSelect = ref(true)
const yearSelect = ref(true)

// ---- 搜尋結果 ----
const carFrameList = ref([])
const carMediaList = ref([])
const carBlindSpotList = ref([])
const carFittingList = ref([])

const hasResults = computed(
  () =>
    carFrameList.value.length ||
    carMediaList.value.length ||
    carBlindSpotList.value.length ||
    carFittingList.value.length
)

// 麵包屑：品牌 - 車款
const breadcrumb = computed(() => {
  const brand = brandList.value.find((b) => String(b.id) === String(brandInputValue.value))
  const model = modelList.value.find((m) => String(m.id) === String(modelInputValue.value))
  const parts = [brand?.name, model?.name].filter(Boolean)
  return parts.length ? parts.join(' - ') : '選車型搜尋'
})

// 車框列表圖：img 可能是 JSON 陣列字串，取第一張
function frameImg(item) {
  try {
    const arr = typeof item.img === 'string' ? JSON.parse(item.img) : item.img
    return Array.isArray(arr) ? arr[0] : item.img
  } catch (e) {
    return item.img
  }
}

function getListData() {
  return new Promise((resolve) => {
    $axios.get('/car').then((response) => {
      const brand = response.data.car_brand
      const car = response.data.car
      if (brand) brandList.value = brand
      if (car) carList.value = car
      resolve()
    })
  })
}

// isChange=true 代表使用者手動改選單，才重置車款/年份；還原網址參數時傳 false
function brandChange(isChange) {
  if (isChange) {
    modelInputValue.value = ''
    yearInputValue.value = undefined
  }
  typeSelect.value = true
  yearSelect.value = true

  const newArray = carFrame.filter((item) => item.brand === brandInputValue.value)
  const arr = []
  newArray.forEach((item) => arr.push(...item.model))
  types.value = [...new Set(arr)]
  typeSelect.value = false

  modelList.value = []
  carList.value.forEach((el) => {
    if (brandInputValue.value == el.car_brand_id) {
      modelList.value.push(el)
    }
  })
}

function modelChange() {
  const newArray = carFrame.filter(
    (item) => item.brand === brandInputValue.value && item.type.includes(modelInputValue.value)
  )
  const arr = []
  newArray.forEach((item) => arr.push(...item.year))
  years.value = [...new Set(arr)]
  yearSelect.value = false

  yearList.value = []
  let tempStart = 0
  let tempEnd = 0
  if (modelInputValue.value == '') {
    modelList.value.forEach((el, index) => {
      if (index == 0) {
        tempStart = el.year_start
        tempEnd = el.year_end
      } else {
        if (el.year_start < tempStart) tempStart = el.year_start
        if (el.year_end > tempEnd) tempEnd = el.year_end
      }
    })
    if (tempStart != 0 && tempEnd != 0) {
      const spanYears = +tempEnd - +tempStart
      yearList.value.push(tempStart)
      for (let i = 1; i <= spanYears; i++) {
        yearList.value.push(+tempStart + i)
      }
    }
  } else {
    modelList.value.forEach((el) => {
      if (modelInputValue.value == el.id) {
        const spanYears = +el.year_end - +el.year_start
        yearList.value.push(el.year_start)
        for (let i = 1; i <= spanYears; i++) {
          yearList.value.push(+el.year_start + i)
        }
      }
    })
  }
}

// 呼叫 /search API 取回四類結果（API 照舊）
function runSearch() {
  const params = {
    car_brand_id: brandInputValue.value,
    car_id: !modelInputValue.value ? '' : modelInputValue.value,
    year: !yearInputValue.value ? '' : yearInputValue.value,
  }

  return $axios.get('/search', { params }).then((response) => {
    const result = response.data.result
    carFrameList.value = result?.car_frame ?? []
    carMediaList.value = result?.car_media ?? []
    carBlindSpotList.value = result?.car_blind_spot ?? []
    carFittingList.value = result?.car_fitting ?? []
  })
}

// 按下搜尋：更新網址參數後查詢
function searchData() {
  router.push({
    path: '/searchPage',
    query: {
      brand: brandInputValue.value,
      model: modelInputValue.value,
      year: yearInputValue.value,
    },
  })
  runSearch()
}

const onImgError = (e) => {
  e.target.style.display = 'none'
}

onMounted(async () => {
  await getListData()

  // 還原網址上的查詢條件
  const qBrand = route.query.brand
  const qModel = route.query.model
  const qYear = route.query.year
  if (qBrand) {
    brandInputValue.value = qBrand
    if (qModel) modelInputValue.value = qModel
    if (qYear) yearInputValue.value = qYear
  }

  brandChange(false)
  modelChange()
  runSearch()
})

// SEO：站內搜尋結果頁（robots.txt 已 Disallow，這裡再加 noindex 保險）
usePageSeo({
  title: '產品搜尋',
  description: '搜尋 Clarion 歌樂與 MM 美邁車用電子產品：車型專用機、多媒體安卓機、車用音響、行車記錄器與影像安全配件。'
})
useHead({ meta: [{ name: 'robots', content: 'noindex, follow' }] })
</script>

<style scoped>
.c-page {
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
  font-family: 'Noto Sans JP', 'Noto Sans TC', system-ui, 'Microsoft JhengHei', sans-serif;
  color: var(--text);
  line-height: 1.75;
  letter-spacing: 0.02em;
  background: var(--bg);
}
.c-page a { color: inherit; text-decoration: none; }
.c-page img { display: block; max-width: 100%; }
.c-page .wrap { max-width: 1080px; margin: 0 auto; padding: 0 26px; }
.c-page h1 { font-size: clamp(28px, 5vw, 48px); font-weight: 900; line-height: 1.16; color: var(--ink); }
.c-page h2 { font-size: clamp(22px, 3vw, 32px); font-weight: 900; color: var(--ink); }
.c-page p { color: var(--muted); font-weight: 300; }

.btn {
  display: inline-flex; align-items: center; justify-content: center;
  min-height: 44px; background: var(--navy); color: #fff; font-weight: 500;
  padding: 12px 26px; border-radius: 9px; font-size: 14px; border: 0; cursor: pointer;
  transition: transform 0.16s, filter 0.16s;
}
.btn:hover { transform: translateY(-2px); filter: brightness(1.06); }
.btn.o { background: var(--navy); color: #ffffff; font-weight: 700; }

/* hero */
.hero { position: relative; overflow: hidden; min-height: 300px; display: flex; align-items: center; background: linear-gradient(115deg, #eef2f7, #dde5ef 55%, #cfdae8); }
.hero .bg { position: absolute; inset: 0; width: 100%; height: 100%; background-size: cover; background-position: center; opacity: 0.5; }
.hero-ov { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(243, 246, 250, 0.94), rgba(243, 246, 250, 0.55) 45%, rgba(243, 246, 250, 0.12) 78%); }
.hero .wrap { position: relative; z-index: 2; padding-top: 46px; padding-bottom: 46px; }
.hero .crumb { font-size: 12px; color: var(--dim); margin-bottom: 14px; }
.hero .crumb a:hover { color: var(--navy); }
.eyebrow { font-size: 12px; letter-spacing: 4px; color: var(--navy); font-weight: 700; }
.hero h1 { margin: 10px 0; }
.hero .lead { max-width: 500px; color: #41506b; font-weight: 400; font-size: 16px; }

/* finder（同首頁） */
.finderwrap { display: flex; justify-content: center; padding: 28px 0; }
.finder {
  background: #fff; border: 1px solid var(--line); border-radius: 14px;
  box-shadow: 0 10px 30px rgba(13, 27, 46, 0.07); padding: 8px;
  display: flex; gap: 8px; align-items: center; flex-wrap: wrap;
  width: calc(100% - 52px); max-width: 760px;
}
.finder .lab { font-size: 13px; font-weight: 700; color: var(--navy); white-space: nowrap; padding: 0 10px; display: flex; align-items: center; gap: 6px; }
.finder select { background: #fbfcfd; border: 1px solid #e1e7ee; border-radius: 9px; height: 42px; padding: 0 12px; font-size: 13.5px; font-family: inherit; color: var(--text); flex: 1; min-width: 104px; cursor: pointer; }
.finder select:disabled { background: #f1f3f6; color: #aeb8c4; cursor: not-allowed; }
.finder .btn { height: 42px; min-height: 42px; padding: 0 24px; }

/* results */
.results { padding: 20px 0 72px; }
.cat { padding: 24px 0; }
.kicker { display: flex; align-items: baseline; gap: 12px; margin-bottom: 20px; }
.kicker .en { font-size: 20px; font-weight: 900; color: var(--ink); letter-spacing: 1px; }
.kicker .jp { font-size: 13px; color: var(--dim); }

.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
.card { border: 1px solid var(--line); border-radius: 16px; overflow: hidden; background: #fff; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; display: block; }
.card:hover { transform: translateY(-6px); box-shadow: 0 18px 40px rgba(13, 27, 46, 0.12); }
.card .img { position: relative; aspect-ratio: 4/3; background: linear-gradient(150deg, #eef2f7, #dbe4ef); display: flex; align-items: center; justify-content: center; }
.card .img img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; background: #fff; padding: 10px; mix-blend-mode: multiply; }
.card .body { padding: 14px 16px; }
.card h3 { font-size: 15px; font-weight: 700; color: var(--ink); }
.card .meta { display: flex; align-items: center; gap: 8px; margin-top: 8px; color: var(--muted); font-size: 13px; }
.card .chip { font-size: 11px; font-weight: 600; color: var(--navy); border: 1px solid var(--navy); border-radius: 6px; padding: 2px 8px; }

.empty { text-align: center; padding: 48px 0 20px; }
.empty p { color: var(--muted); margin-bottom: 18px; }

@media (max-width: 820px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .finder .lab { width: 100%; justify-content: flex-start; padding: 2px 4px 6px; }
  .finder select { flex: 1 1 30%; min-width: 0; }
  .finder .btn { flex: 1 1 100%; justify-content: center; margin-top: 2px; }
}
@media (max-width: 520px) {
  .grid { grid-template-columns: 1fr; }
}
</style>
