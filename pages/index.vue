<template>
  <div class="c-page">
    <!-- SEO 需要一個 H1，使用 .visually-hidden 讓它在畫面上看不到、搜尋引擎與螢幕閱讀器仍讀得到。 -->
    <h1 class="visually-hidden">{{ $t('home.seoH1') }}</h1>

    <!-- Hero（整頁式：滿版高度，表頭透明浮貼其上） -->
    <section class="hero">
      <!-- 桌機吃 img（16:9），手機若有提供 imgMobile（直式 1080×2160）就改吃直式。
           整頁式的 hero 是滿版高度，16:9 橫圖在手機會被左右各裁掉約 35%，圖上的字會被切掉。
           用 <picture> 是純 CSS 判斷，SSR 不會有水合不一致。 -->
      <picture
        v-for="(slide, i) in heroSlides"
        :key="i"
        class="hero-bg"
        :class="{ active: i === activeSlide }"
      >
        <source v-if="slide.imgMobile" media="(max-width: 640px)" :srcset="slide.imgMobile" />
        <img :src="slide.img" :alt="slide.name || 'Clarion 歌樂 台灣官方授權總經銷｜美邁車用電子'" loading="lazy" />
      </picture>
      <a
        v-if="heroSlides[activeSlide] && heroSlides[activeSlide].url"
        class="hero-link"
        :href="heroSlides[activeSlide].url"
        :aria-label="heroSlides[activeSlide].name || $t('home.seoH1')"
        target="_blank"
        rel="noopener"
      ></a>
      <div class="dots" v-if="heroSlides.length > 1">
        <i
          v-for="(slide, i) in heroSlides"
          :key="i"
          :class="{ on: i === activeSlide }"
          @click="activeSlide = i"
        ></i>
      </div>
      <!-- 向下捲動指示 -->
      <button class="scrolldown" type="button" :aria-label="$t('home.scrollDown')" @click="scrollToNext">
        <span>{{ $t('home.scrollDown') }}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5v13M12 18l-6-6M12 18l6-6" fill="none" stroke="currentColor"
                stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <!-- 車型查詢：抽屜式，收合時只有一個把手貼在 Hero 底部，點了才往上展開三個下拉。
           要放在 .hero 裡面（不是外面），這樣下面 CSS 的 position:absolute; bottom:0 才會貼齊 Hero 底緣，而不是貼齊整個網頁底部。
           欄位資料與查詢邏輯（brandChange／modelChange／searchData）完全沒動，只是外面換一層收合＋自訂下拉外觀。 -->
      <div class="finderwrap" :class="{ open: finderOpen }">
      <button
        class="finder-tab"
        type="button"
        :aria-expanded="finderOpen ? 'true' : 'false'"
        aria-controls="finderPanel"
        @click="toggleFinder"
      >
        <svg class="fr" viewBox="0 0 28 20" width="26" height="19" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="1" y="1" width="26" height="18" rx="3"></rect><rect x="5.5" y="5" width="17" height="10" rx="1.5" opacity=".55"></rect></svg>
        <span class="t">{{ $t('search.finderTabTitle') }}</span>
        <span class="n">{{ $t('search.finderTabDesc') }}</span>
        <span class="ar" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 9l6 6 6-6"></path></svg>
        </span>
      </button>
      <div class="finder-panel" id="finderPanel"><div>
        <div class="finder" ref="finderEl">
          <span class="lab">{{ $t('search.finderLabel') }}</span>
          <FinderSelect
            :cap="$t('search.brandCap')"
            v-model="brandInputValue"
            :options="brandOptions"
            :open="activeField === 'brand'"
            @toggle="toggleField('brand')"
            @close="closeField"
            @change="brandChange"
          />
          <FinderSelect
            :cap="$t('search.modelCap')"
            v-model="modelInputValue"
            :options="modelOptions"
            :disabled="typeSelect"
            :open="activeField === 'model'"
            @toggle="toggleField('model')"
            @close="closeField"
            @change="modelChange"
          />
          <FinderSelect
            :cap="$t('search.yearCap')"
            v-model="yearInputValue"
            :options="yearOptions"
            :disabled="yearSelect"
            :open="activeField === 'year'"
            @toggle="toggleField('year')"
            @close="closeField"
          />
          <a href="#" class="btn o" @click.prevent="searchData">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.6-3.6"></path></svg>
            {{ $t('home.search') }}
          </a>
        </div>
      </div></div>
      </div>
    </section>

    <!-- 產品分類 -->
    <section id="products" style="padding-top: 20px">
      <div class="wrap">
        <div class="kicker"><span class="en">{{ $t('home.productsKicker') }}</span><span class="jp">{{ $t('home.productsLabel') }}</span></div>
        <p style="max-width: 560px; margin: -8px 0 16px">
          {{ $t('home.productsIntro') }}
        </p>
        <div class="pgrid">
          <div v-for="(item, index) in displayProducts" :key="index" class="pcard">
            <component :is="cardTag(item)" v-bind="cardProps(item)" class="plink">
              <div class="ph" :class="{ dk: item.dark }">
                <img
                  v-if="item.img"
                  :src="item.img"
                  :alt="item.name"
                  loading="lazy"
                  style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; padding: 14px"
                  @error="(e) => (e.target.style.display = 'none')"
                />
                <span v-else>{{ $t('home.imgRatio') }}</span>
              </div>
              <h4>{{ item.name }}</h4>
              <small v-if="item.sub">{{ item.sub }}</small>
            </component>
          </div>
        </div>
        <!-- 依需求選購：連到跨品牌著陸頁，形成內部連結 -->
        <div class="byneed">
          <span class="byneed-lb">{{ $t('home.byNeed') }}</span>
          <NuxtLink to="/products/android-headunit">{{ $t('footer.lpHeadunit') }}</NuxtLink>
          <NuxtLink to="/products/dash-cam">{{ $t('footer.lpDashcam') }}</NuxtLink>
          <NuxtLink to="/products/car-audio">{{ $t('footer.lpAudio') }}</NuxtLink>
        </div>
      </div>
    </section>

    <!-- clarion 滿版背景圖：後台「首頁滿版區塊管理」有填內容(zone1)就整段換成後台排版，
         沒填就維持這裡寫死的預設版面；背景圖同理，後台有上傳圖才蓋掉 public/home/section-clarion.webp -->
    <section class="feature fullbleed" id="feature">
      <div class="bg" :style="bgStyle(zoneBg('zone1', 'clarion'))"></div>
      <div class="wrap">
        <div v-if="homeSections.zone1 && homeSections.zone1.content" class="cms-content" v-html="homeSections.zone1.content"></div>
      </div>
    </section>

    <!-- MM 美邁滿版背景圖：同上，後台 zone2 有填內容才整段換成後台排版 -->
    <section class="mm fullbleed" id="mm">
      <div class="bg" :style="bgStyle(zoneBg('zone2', 'mm'))"></div>
      <div class="wrap">
        <div class="mmbox">
          <div v-if="homeSections.zone2 && homeSections.zone2.content" class="cms-content" v-html="homeSections.zone2.content"></div>
        </div>
      </div>
    </section>

    <!-- 安裝案例 -->
    <section v-if="installCases.length" id="cases">
      <div class="wrap">
        <div class="kicker">
          <span class="en">{{ $t('home.caseKicker') }}</span><span class="jp">{{ $t('home.caseLabel') }}</span>
          <NuxtLink to="/cases" class="allcases">{{ $t('home.caseAll') }}</NuxtLink>
        </div>
        <div class="cases">
          <NuxtLink v-for="(item, index) in installCases" :key="index" class="case" :to="`/cases/${item.id}`">
            <div class="ph">
              <img
                v-if="item.img"
                :src="item.img"
                :alt="item.name"
                loading="lazy"
                style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover"
                @error="(e) => (e.target.style.display = 'none')"
              />
            </div>
            <h4>{{ item.name }}</h4>
            <small>{{ caseCategoryLabel(item.category) }}</small>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 尾端 CTA 滿版背景圖：同上，後台 zone3 有填內容才整段換成後台排版 -->
    <section class="final fullbleed">
      <div class="bg" :style="bgStyle(zoneBg('zone3', 'cta'))"></div>
      <div class="wrap">
        <div v-if="homeSections.zone3 && homeSections.zone3.content" class="cms-content" v-html="homeSections.zone3.content"></div>
      </div>
    </section>
  </div>
</template>

<script setup>

/**
 * 滿版情境段的背景圖槽位。
 * 檔案放 public/home/ 底下，換圖只要「同檔名覆蓋」、不用改程式。
 * 檔案不存在時圖層載不到，會直接顯示底下的深色底，版面不會壞，
 * 所以可以先上線再一張一張補。
 *
 * 每一段兩張：
 *   img   桌機 2560×1440（16:9）
 *   imgM  手機直式 1080×1920，螢幕寬 ≤640px 時自動改吃這張（純 CSS media query，SSR 安全）
 * 規格：WebP、每張 300KB 以內。選「有一半是暗部或留白」的圖，文字壓上去才讀得清楚。
 */
const BG = {
  clarion: { img: '/home/section-clarion.webp', imgM: '/home/section-clarion-m.webp' },
  mm:      { img: '/home/section-mm.webp',      imgM: '/home/section-mm-m.webp' },
  cta:     { img: '/home/section-cta.webp',     imgM: '/home/section-cta-m.webp' },
}
// 用 CSS 變數把兩張圖都交給 .bg，桌機／手機由樣式表的 media query 決定吃哪一張
const bgStyle = (s) => ({ '--bg': `url(${s.img})`, '--bg-m': `url(${s.imgM || s.img})` })

// ---- 首頁「滿版區塊管理」（後台 home_section 管理：zone1/zone2/zone3）----
// 後台每個區塊可以填：內容（CKEditor，整段蓋掉下面寫死的預設排版）、背景圖（電腦版/手機版）。
// 還沒編輯過的區塊，API 回傳 content/img 都是 null，前台就照舊顯示預設文字與 BG 裡的預設圖，不會空白。
const homeSections = ref({})
function getHomeSections() {
  $axios
    .get('/home_section')
    .then((response) => {
      homeSections.value = response.data?.result || {}
    })
    .catch(() => {
      homeSections.value = {}
    })
}
// 背景圖：後台這個區塊有上傳電腦版圖才改用後台的圖（手機版留空就沿用後台電腦版圖），
// 沒上傳就維持原本寫死在 BG 裡的預設圖
function zoneBg(sectionKey, fallbackKey) {
  const sec = homeSections.value[sectionKey]
  if (sec && sec.img) {
    return { img: sec.img, imgM: sec.img_mobile || sec.img }
  }
  return BG[fallbackKey]
}

// Hero 的向下指示：捲到下一段（車型查詢）
function scrollToNext() {
  const el = document.querySelector('.finderwrap')
  if (!el) return window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
  const top = el.getBoundingClientRect().top + window.scrollY - 80
  window.scrollTo({ top: top < 0 ? 0 : top, behavior: 'smooth' })
}
import { NuxtLink } from '#components'
import { useOrganizationJsonLd, useWebSiteJsonLd } from '~/composables/useJsonLd'
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import carFrame from '~/static/carFrame.js'

const { t } = useI18n()

// 結構化資料：讓搜尋引擎與 AI 正確認出「美邁＝Clarion 台灣官方授權總經銷」
useOrganizationJsonLd()
useWebSiteJsonLd()

// ---- meta / head（只套用在這個新首頁，不影響其他頁面）----
useHead({
  title: 'Clarion 歌樂台灣總經銷｜安卓車機・車用多媒體主機｜美邁 MEIMAI',
  meta: [
    { name: 'description', content: '美邁 MEIMAI 為 Clarion 歌樂台灣官方授權總經銷（2026 年起），主打安卓車機、車型專用機、車用多媒體主機、汽車音響、行車記錄器等車用電子產品。原廠公司貨享原廠保固，全台經銷據點提供專業安裝與售後服務。' },
    { name: 'keywords', content: 'Clarion, 歌樂, Clarion 台灣, Clarion 總經銷, 安卓車機, 安卓機, 車用多媒體主機, 車型專用機, 汽車音響, 行車記錄器, 倒車顯影, 盲點偵測, MM 美邁, 美邁車用電子, MEIMAI' },
    { name: 'robots', content: 'index,follow' },
    { name: 'author', content: '美邁車用電子有限公司' },
    { name: 'theme-color', content: '#007ABE' },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'Clarion 歌樂 × MM 美邁' },
    { property: 'og:title', content: 'Clarion 歌樂台灣總經銷｜安卓車機・車用多媒體主機｜美邁 MEIMAI' },
    { property: 'og:description', content: '美邁 MEIMAI 為 Clarion 歌樂台灣官方授權總經銷（2026 年起），主打安卓車機、車型專用機、汽車音響、行車記錄器等車用電子產品。原廠保固、全台經銷據點、專業安裝售後。' },
    { property: 'og:url', content: 'https://clarion.meimai.com.tw/' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
  link: [
    { rel: 'canonical', href: 'https://clarion.meimai.com.tw/' },
    // 字型由 nuxt.config.ts 全站載一次（Noto Sans TC），這裡不再重複載
  ],
})

// ---- banner ----
// 首頁 Banner 由後台「Banner 管理」維護（backend：banner 資料表 / GET /api/banner）。
//
// 後台一筆 Banner 有兩張圖：
//   img         電腦版，建議 1920×1080（16:9）
//   img_mobile  手機版，建議 1080×2160（直式）；可留空
// 首頁是整頁式（滿版），Banner 用 object-fit:cover 撐滿整個畫面高度，
// 所以 16:9 橫圖放到手機（例如 390×844）會被左右各裁掉約 35%，圖上的字會被切掉。
// 這就是為什麼手機要另外放一張直式圖，而不是同一張縮小。
// img_mobile 留空時會自動沿用 img（會被裁，但不會壞）。
const { $axios } = useNuxtApp()
const bannerList = ref([])
const heroSlides = computed(() =>
  bannerList.value.map((b) => ({
    img: b.img,
    imgMobile: b.img_mobile || '',
    url: b.url || '',
    name: b.name || '',
  }))
)

function getBanner() {
  $axios
    .get('/banner')
    .then((response) => {
      const result = response.data?.result
      if (Array.isArray(result) && result.length) {
        bannerList.value = result
        // 後台改過 Banner 數量時，避免索引還停在已經不存在的那一張
        if (activeSlide.value >= result.length) activeSlide.value = 0
      }
    })
    .catch(() => {
      // 後台掛掉時就維持預設圖，不要讓首頁空白
    })
}
const activeSlide = ref(0)
let heroTimer = null

// ---- 車型查詢（沿用 index.vue 的邏輯） ----
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

function getListData() {
  $axios.get('/car').then((response) => {
    const brand = response.data.car_brand
    const car = response.data.car
    if (brand) brandList.value = brand
    if (car) carList.value = car
  })
}

function brandChange() {
  modelInputValue.value = ''
  yearInputValue.value = undefined
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
  if (modelInputValue.value == 'all') {
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

// 車型查詢的下拉選項：換成自訂下拉元件用的 { value, label } 格式，資料來源跟查詢邏輯不變
const brandOptions = computed(() => [
  { value: '', label: t('search.selectBrand') },
  ...brandList.value.map((b) => ({ value: b.id, label: b.name })),
])
const modelOptions = computed(() => [
  { value: '', label: t('search.selectModel') },
  ...modelList.value.map((m) => ({ value: m.id, label: m.name })),
])
const yearOptions = computed(() => [
  { value: undefined, label: t('search.selectYear'), disabled: true },
  ...yearList.value.map((y) => ({ value: y, label: String(y) })),
  { value: '', label: t('search.allYears') },
])

// 車型查詢抽屜：收合／展開；只負責外殼開關，不碰欄位與查詢邏輯
const finderOpen = ref(false)
function toggleFinder() {
  finderOpen.value = !finderOpen.value
}

// 三個自訂下拉同時間只能開一個：開其中一個，另外兩個會自動關閉
const activeField = ref(null)
function toggleField(name) {
  activeField.value = activeField.value === name ? null : name
}
function closeField() {
  activeField.value = null
}
// 點擊三個欄位以外的地方，自動收起目前展開的下拉清單
const finderEl = ref(null)
function onFinderDocClick(ev) {
  if (finderEl.value && !finderEl.value.contains(ev.target)) {
    activeField.value = null
  }
}
onMounted(() => {
  document.addEventListener('click', onFinderDocClick)
})
onUnmounted(() => {
  document.removeEventListener('click', onFinderDocClick)
})

const router = useRouter()
function searchData() {
  router.push({
    path: '/searchPage',
    query: {
      brand: brandInputValue.value,
      model: modelInputValue.value,
      year: yearInputValue.value,
    },
  })
}

// ---- 首頁「精選商品」（後台 recommend_products 管理）----
const recommendProducts = ref([])

function getRecommendProducts() {
  $axios
    .get('/recommend_products')
    .then((response) => {
      recommendProducts.value = response.data.result || []
    })
    .catch(() => {
      recommendProducts.value = []
    })
}

// 實際顯示用：直接對應後台 recommend_products 回傳的內容（name/img/link 後端已組好）
const displayProducts = computed(() =>
  recommendProducts.value.map((item) => ({
    name: item.name,
    sub: '',
    img: item.img,
    internal: true,
    link: item.link,
  }))
)

// 精選商品卡片的外層標籤。
// 注意：<component :is> 一定要綁「元件本身」，不能綁字串 'NuxtLink' ——
// Nuxt 3 的元件是編譯期自動匯入，字串不會被解析成元件，
// 會被當成不存在的 HTML 標籤 <nuxtlink> 印出來，結果就是沒有 href、點了沒反應。
const cardTag = (item) => (item.internal && item.link ? NuxtLink : 'a')
const cardProps = (item) =>
  item.internal && item.link ? { to: item.link } : item.link ? { href: item.link } : {}

// ---- 首頁「安裝實績（Case）」（後台 install_cases 管理）----
const installCases = ref([])

function getInstallCases() {
  $axios
    .get('/install_cases', { params: { home: 1 } })
    .then((response) => {
      installCases.value = response.data.result || []
    })
    .catch(() => {
      installCases.value = []
    })
}

// 分類（0~8）對應的顯示文字，跟後台「安裝案例」的分類選項一致
const caseCategoryKeys = {
  0: 'home.caseCategory0',
  1: 'home.caseCategory1',
  2: 'home.caseCategory2',
  3: 'home.caseCategory3',
  4: 'home.caseCategory4',
  5: 'home.caseCategory5',
  6: 'home.caseCategory6',
  7: 'home.caseCategory7',
  8: 'home.caseCategory8',
}
function caseCategoryLabel(category) {
  const key = caseCategoryKeys[category]
  return key ? t(key) : ''
}

onMounted(() => {
  getBanner()
  getListData()
  getRecommendProducts()
  getInstallCases()
  getHomeSections()
  heroTimer = setInterval(() => {
    if (!heroSlides.value.length) return
    activeSlide.value = (activeSlide.value + 1) % heroSlides.value.length
  }, 4500)
})

onUnmounted(() => {
  if (heroTimer) clearInterval(heroTimer)
})
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
  --blue-soft: #6fa0ff;
  --dark: #0d1016;
  font-family: 'Noto Sans TC', system-ui, 'Microsoft JhengHei', sans-serif;
  color: var(--text);
  line-height: 1.75;
  font-weight: 400;
  letter-spacing: 0.02em;
}
.c-page a {
  color: inherit;
  text-decoration: none;
}
.c-page img {
  display: block;
  max-width: 100%;
}
.c-page .wrap {
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 26px;
}
.c-page .ph {
  position: relative;
  overflow: hidden;
  background: linear-gradient(150deg, #eef2f7, #dbe4ef);
  border: 1px solid var(--line);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8ea0b6;
  font-size: 12px;
}
.c-page .ph.dk {
  background: linear-gradient(155deg, #f4f8fd, #ffffff 65%);
  border: 1px solid rgba(111, 155, 255, 0.3);
  box-shadow: 0 0 0 1px rgba(61, 123, 255, 0.14), 0 22px 50px rgba(61, 123, 255, 0.22);
  color: #8ea0b6;
}
.c-page .ph.dk img {
  mix-blend-mode: multiply;
}
.c-page .ph span {
  background: rgba(255, 255, 255, 0.6);
  padding: 3px 10px;
  border-radius: 20px;
}
.c-page .ph.dk span {
  background: var(--navy);
  color: #1a1205;
  font-weight: 700;
}
.c-page h1 {
  font-size: clamp(32px, 5vw, 54px);
  font-weight: 900;
  line-height: 1.16;
  color: var(--ink);
  letter-spacing: 0.5px;
}
.c-page h2 {
  font-size: clamp(22px, 3vw, 32px);
  font-weight: 900;
  color: var(--ink);
  line-height: 1.3;
}
.c-page p {
  color: var(--muted);
  font-weight: 300;
}
.c-page .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  background: var(--navy);
  color: #fff;
  font-weight: 500;
  padding: 12px 26px;
  border-radius: 9px;
  font-size: 14px;
  transition: transform 0.16s, box-shadow 0.16s, filter 0.16s;
}
.c-page .btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.06);
}
.c-page .btn.o {
  background: var(--navy);
  color: #ffffff;
  font-weight: 700;
}
.c-page .btn.ghost {
  background: transparent;
  border: 1px solid var(--line);
  color: var(--ink);
}
.hero {
  position: relative;
  width: 100%;
  min-height: 100vh;
  min-height: 100svh;
  overflow: hidden;
  background: var(--dark);
}
@media (max-width: 1023px) {
  .hero { min-height: 94svh; }
}
@media (max-width: 640px) {
  .hero { min-height: 88svh; }
}
.hero-link {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: block;
}
.hero-bg {
  position: absolute;
  inset: 0;
  display: block;
  opacity: 0;
  transition: opacity 1.3s;
  will-change: transform;
}
.hero-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  display: block;
}
.hero::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 190px;
  z-index: 2;
  pointer-events: none;
  background: linear-gradient(0deg, rgba(13, 16, 22, 0.82) 0%, rgba(13, 16, 22, 0.64) 36%, rgba(13, 16, 22, 0.3) 64%, rgba(13, 16, 22, 0) 100%);
}
@media (max-width: 640px) {
  .hero::after { height: 150px; }
}
.hero-bg.active {
  opacity: 1;
  animation: hero-kenburns 16s ease-out both;
}
@keyframes hero-kenburns {
  from {
    transform: scale(1.08);
  }
  to {
    transform: scale(1);
  }
}
@media (prefers-reduced-motion: reduce) {
  .hero-bg.active {
    animation: none;
  }
}
.hero::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 170px;
  z-index: 2;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.28), rgba(0, 0, 0, 0.08) 60%, rgba(0, 0, 0, 0));
}
@media (max-width: 960px) {
  .hero::before {
    height: 120px;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.26), rgba(0, 0, 0, 0.06) 60%, rgba(0, 0, 0, 0));
  }
}
@media (max-width: 640px) {
  .hero::before {
    height: 96px;
  }
}
.hero .wrap {
  position: relative;
  z-index: 2;
}
.eyebrow {
  font-size: 12px;
  letter-spacing: 4px;
  color: var(--navy);
  font-weight: 700;
}
.hero h1 {
  color: var(--ink);
  margin: 12px 0;
  line-height: 1.2;
}
.hero .lead {
  max-width: 470px;
  color: #41506b;
  font-weight: 400;
  font-size: 16px;
}
.hero .btns {
  margin-top: 24px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.dots {
  position: absolute;
  bottom: 100px;
  right: 30px;
  z-index: 3;
  display: flex;
  gap: 8px;
}
@media (max-width: 640px) {
  .dots { bottom: 78px; right: 18px; }
}
.dots i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.55);
  box-shadow: 0 0 0 1px rgba(13, 16, 22, 0.28);
  cursor: pointer;
  transition: width 0.2s, background 0.2s;
  display: block;
}
.dots i.on {
  background: var(--navy);
  width: 22px;
  border-radius: 5px;
}
/* finder */
.fullbleed {
  position: relative;
  min-height: 100vh;
  min-height: 100svh;
  display: grid;
  align-items: center;
  overflow: hidden;
  padding: 104px 0;
  box-sizing: border-box;
}
.fullbleed .bg {
  position: absolute;
  inset: 0;
  background-image: var(--bg);
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
}
@media (max-width: 640px) {
  .fullbleed .bg {
    background-image: var(--bg-m, var(--bg));
    background-size: cover;
    background-position: center center; }
}
.fullbleed .wrap {
  position: relative;
  z-index: 2;
  width: 100%;
  box-sizing: border-box;
}
.fullbleed .btn.ghost { border-color: rgba(255, 255, 255, 0.32); color: #fff; background: transparent; }
.fullbleed .btn.ghost:hover { border-color: var(--navy); color: #fff; }
.fullbleed .chip { background: rgba(255, 255, 255, 0.05); border-color: rgba(255, 255, 255, 0.18); color: #dbe3ec; }
.fullbleed .chip:hover { border-color: var(--navy); color: #fff; }
.fullbleed .kicker .en { color: #fff; }
.fullbleed .kicker .jp { color: #8d9aa8; }
.fullbleed h2 { color: #fff; }
@media (max-width: 820px) {
  .fullbleed { min-height: auto; padding: 76px 0; }
}

.scrolldown {
  position: absolute;
  left: 50%;
  bottom: 92px;
  transform: translateX(-50%);
  z-index: 3;
  display: grid;
  justify-items: center;
  gap: 5px;
  padding: 6px 10px;
  border: 0;
  background: none;
  color: rgba(255, 255, 255, 0.84);
  font-size: 10px;
  letter-spacing: 3px;
  cursor: pointer;
  text-shadow: 0 1px 3px rgba(13, 16, 22, 0.85), 0 0 10px rgba(13, 16, 22, 0.5);
}
.scrolldown svg { width: 18px; height: 18px; animation: sd 2.2s ease-in-out infinite; }
@keyframes sd {
  0%, 100% { transform: translateY(0); opacity: 0.7; }
  50% { transform: translateY(5px); opacity: 1; }
}
@media (max-width: 640px) { .scrolldown { bottom: 70px; font-size: 9px; } }
@media (prefers-reduced-motion: reduce) { .scrolldown svg { animation: none; } }

/* 車型查詢：抽屜式（收合把手＋展開面板）。收合時只有一個把手貼在 Hero 底部，主視覺不被白卡切斷；
   點把手才往下展開三個下拉。把手與面板同一種深色金屬質感，是同一個抽屜的兩種狀態，不是兩張不同卡片。
   欄位本身（FinderSelect 元件）的樣式在 components/FinderSelect.vue 裡，這裡只管外殼。 */
.finderwrap {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 6;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
}
.finder-tab {
  display: inline-flex;
  align-items: center;
  gap: 13px;
  height: 56px;
  padding: 0 16px 0 24px;
  border: 1px solid #2f3a48;
  border-bottom: 0;
  border-radius: 14px 14px 0 0;
  cursor: pointer;
  background: linear-gradient(180deg, #222b37, #181f29);
  color: #fff;
  font-family: inherit;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 -14px 30px rgba(0, 0, 0, 0.32);
  transition: background 0.22s ease;
}
.finder-tab:hover {
  background: linear-gradient(180deg, #28323f, #1c242f);
}
.finder-tab:focus-visible {
  outline: 2px solid var(--navy);
  outline-offset: 3px;
}
.finder-tab .fr {
  flex: none;
  color: #4fb6ea;
}
.finder-tab .t {
  font-size: 15.5px;
  font-weight: 800;
  white-space: nowrap;
}
.finder-tab .n {
  font-size: 12.5px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.44);
  white-space: nowrap;
}
.finder-tab .ar {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.09);
  display: grid;
  place-items: center;
  color: #9fdcff;
  flex: none;
  transform: rotate(180deg);
  transition: transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.finderwrap.open .finder-tab .ar {
  transform: rotate(0deg);
}
.finder-panel {
  display: grid;
  grid-template-rows: 0fr;
  width: 100%;
  max-width: 880px;
  transition: grid-template-rows 0.34s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.finder-panel > div {
  overflow: hidden;
  min-height: 0;
}
.finderwrap.open .finder-panel {
  grid-template-rows: 1fr;
}
.finder {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 7px 7px 13px;
  border-radius: 14px 14px 0 0;
  border: 1px solid #2f3a48;
  background: linear-gradient(180deg, #222b37, #161d26 45%, #10161d);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.07), inset 0 -1px 0 rgba(0, 0, 0, 0.5), 0 20px 44px rgba(0, 0, 0, 0.42);
}
.finder .lab {
  display: none;
}
.finder .btn {
  align-self: center;
  margin-left: 7px;
  height: 46px;
  padding: 0 22px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  font-size: 14.5px;
  font-weight: 800;
  background: linear-gradient(180deg, #0b93dd, #0069a6);
  color: #fff;
  border: 0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -2px 0 rgba(0, 0, 0, 0.35), 0 6px 18px rgba(0, 122, 190, 0.4);
}
.finder .btn:hover {
  background: linear-gradient(180deg, #12a0ec, #0073b4);
}
@media (prefers-reduced-motion: reduce) {
  .finder-panel,
  .finder-tab .ar {
    transition: none;
  }
}
@media (max-width: 760px) {
  .finderwrap { padding: 0; }
  .finder-tab {
    height: auto;
    padding: 11px 16px;
    flex-wrap: wrap;
    gap: 3px 11px;
    width: 100%;
    max-width: 100%;
    align-self: stretch;
    text-align: left;
    border-left: 0;
    border-right: 0;
  }
  .finder { border-radius: 0; border-left: 0; border-right: 0; }
  .finder-tab .t { font-size: 14.5px; }
  .finder-tab .n { flex: 1 1 100%; order: 3; font-size: 12px; text-align: left; }
  .finder-tab .ar { order: 2; margin-left: auto; }
  .finder { flex-wrap: wrap; padding: 6px; }
  .finder .btn { flex: 1 1 100%; justify-content: center; margin: 6px 0 0; }
}
.c-page section {
  padding: 80px 0;
}
.kicker {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 20px;
}
.kicker .en {
  font-size: 20px;
  font-weight: 900;
  color: var(--ink);
  letter-spacing: 1px;
}
.kicker .jp {
  font-size: 13px;
  color: var(--dim);
}
.kicker.light .en {
  color: #fff;
}
.byneed {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 14px;
  margin: 32px 0 0;
  padding-top: 24px;
  border-top: 1px solid var(--line);
  font-size: 13px;
}
.byneed-lb {
  color: var(--dim);
}
.byneed a {
  color: var(--navy);
  border-bottom: 1px solid transparent;
}
.byneed a:hover {
  border-bottom-color: var(--navy);
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
.pgrid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.pcard {
  cursor: pointer;
}
.pcard .plink {
  display: block;
  color: inherit;
  text-decoration: none;
}
.pcard .ph {
  aspect-ratio: 4 / 3;
  transition: transform 0.28s, box-shadow 0.28s;
}
.pcard:hover .ph {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 18px 36px rgba(13, 27, 46, 0.16);
}
.pcard .ph {
  background: #fff;
}
.pcard .ph img {
  mix-blend-mode: multiply;
}
.pcard h4 {
  font-size: 14px;
  font-weight: 500;
  margin-top: 10px;
  color: var(--ink);
}
.pcard:hover h4 {
  color: var(--navy);
}
.pcard small {
  color: var(--dim);
  font-size: 12px;
}
.cms-content {
  font-family: inherit;
}
.cms-content :deep(img) {
  max-width: 100%;
  height: auto;
}
.cms-content :deep(a) {
  color: inherit;
}

.feature {
  background: var(--dark);
  color: #fff;
}
.feature .wrap { max-width: 1080px; }
.feature .pill {
  display: inline-block;
  font-size: 11px;
  background: var(--navy);
  color: #fff;
  padding: 3px 11px;
  border-radius: 20px;
  font-weight: 700;
  letter-spacing: 1px;
}
.c-page .feature .fbtitle {
  font-size: clamp(30px, 5vw, 52px);
  font-weight: 900;
  color: #fff;
  margin: 16px 0 0;
  line-height: 1.2;
  letter-spacing: 0.01em;
}
.c-page .feature .fbdesc {
  color: #c3ccd8;
  max-width: 540px;
  margin: 14px 0 0;
  font-size: 15px;
}
.fspecs {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  margin: 28px 0 0;
}
.fspecs b { display: block; font-size: 24px; color: #fff; font-weight: 700; }
.fspecs small { color: #7fc4ea; font-size: 11px; letter-spacing: 1px; }
.fbtns { display: flex; align-items: center; gap: 16px; margin-top: 32px; flex-wrap: wrap; }
.feature .clarion {
  font-family: Arial, sans-serif;
  font-weight: 700;
  letter-spacing: -1px;
  color: #fff;
  font-size: 20px;
}

.mm { background: var(--dark); color: #fff; }
.mm .wrap { max-width: 1080px; display: flex; justify-content: flex-end; }
.mmbox { max-width: 520px; }
.mm h2 {
  color: #fff;
  font-size: clamp(26px, 4vw, 40px);
  font-weight: 900;
  margin: 14px 0 0;
  line-height: 1.25;
}
.mm p { color: #c3ccd8; margin: 14px 0 0; font-size: 15px; }
@media (max-width: 820px) {
  .mm .wrap { justify-content: flex-start; }
  .mmbox { max-width: none; }
}
.chips {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin: 16px 0;
}
.chip {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 8px 13px;
  font-size: 13px;
  color: var(--muted);
  transition: border-color 0.16s, color 0.16s;
}
.chip:hover {
  border-color: var(--navy);
  color: var(--navy);
}
.trust {
  background: var(--bg2);
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}
.trust .row {
  display: flex;
  justify-content: space-around;
  text-align: center;
  flex-wrap: wrap;
  gap: 18px;
}
@media (max-width: 640px) {
  .trust .row { display: grid; grid-template-columns: 1fr 1fr; gap: 26px 12px; }
}
.trust b {
  display: block;
  font-size: 30px;
  font-weight: 900;
  color: var(--ink);
}
.trust small {
  color: var(--dim);
  font-size: 12px;
  letter-spacing: 1px;
}
.cases {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}
.kicker .allcases {
  margin-left: auto;
  font-size: 13px;
  color: var(--navy, #007abe);
  white-space: nowrap;
}
.kicker .allcases:hover {
  text-decoration: underline;
}
.case {
  display: block;
  color: inherit;
  text-decoration: none;
}
.case .ph {
  transition: opacity 0.25s ease;
}
.case:hover .ph {
  opacity: 0.86;
}
.case:hover h4 {
  color: var(--navy, #007abe);
}
.case .ph {
  aspect-ratio: 16 / 10;
}
.case h4 {
  font-size: 15px;
  font-weight: 500;
  margin-top: 12px;
  color: var(--ink);
}
.case small {
  color: var(--dim);
  font-size: 12px;
}
.final { background: var(--dark); text-align: center; color: #fff; }
.final h2 { color: #fff; font-size: clamp(26px, 4.2vw, 42px); font-weight: 900; margin: 14px 0 0; }
.final p { color: #c3ccd8; font-size: 15px; }
.final .kicker .en { color: #fff; }
@media (max-width: 820px) {
  .pgrid { grid-template-columns: repeat(2, 1fr); }
  .cases { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .dots {
    bottom: 10px;
  }
}
</style>
