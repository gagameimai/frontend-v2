<template>
  <div class="cf-page">
    <!-- HERO（歌樂 OEM 頁樣式，品牌文字改 MEIMAI） -->
    <div class="hero">
      <div v-if="bannerImg" class="bg" :style="{ backgroundImage: 'url(' + bannerImg + ')' }"></div>
      <div v-else class="glow"></div>
      <div v-if="bannerImg" class="ov"></div>
      <div class="wrap in">
        <div class="ey">{{ $t('carFrame.eyebrow') }}</div>
        <h1>{{ $t('carFrame.title') }}</h1>
        <p>{{ $t('carFrame.intro') }}</p>
      </div>
    </div>

    <section>
      <div class="wrap">
        <div class="crumb">
          <NuxtLink to="/">{{ $t('carFrame.home') }}</NuxtLink> ／ {{ $t('carFrame.title') }}
        </div>

        <!-- 選車型（功能保留：車廠 / 車款 / 年份） -->
        <div class="selbar">
          <span class="sel-label">{{ $t('carFrame.selectLabel') }}</span>
          <select v-model="brandInputValue" class="sel" @change="brandChange(true)">
            <option value="">{{ $t('carFrame.selectBrand') }}</option>
            <option v-for="(brand, index) in brandList" :key="index" :value="brand.id">
              {{ brand.name }}
            </option>
          </select>
          <select v-model="modelInputValue" class="sel" @change="modelChange">
            <option value="">{{ $t('carFrame.selectModel') }}</option>
            <option v-for="(model, index) in modelList" :key="index" :value="model.id">
              {{ model.name }}
            </option>
          </select>
          <select v-model="yearInputValue" class="sel">
            <option value="">{{ $t('carFrame.selectYear') }}</option>
            <option v-for="(year, index) in yearList" :key="index" :value="year">
              {{ year }}
            </option>
          </select>
          <button type="button" class="btn o cf-search" @click="getCarFrame">
            {{ $t('carFrame.search') }}
          </button>
        </div>
        <p class="sel-note">{{ $t('carFrame.selectNote') }}</p>

        <div class="shead">
          <div>
            <div class="sub">{{ $t('carFrame.sectionKicker') }}</div>
            <div class="cn">{{ $t('carFrame.sectionTitle') }}</div>
            <div class="desc">{{ $t('carFrame.sectionDesc') }}</div>
          </div>
          <NuxtLink to="/partner" class="btn ghost">{{ $t('carFrame.findInstaller') }}</NuxtLink>
        </div>

        <div class="grid">
          <NuxtLink
            v-for="(carFrame, index) in carFrameList"
            :key="index"
            class="card"
            :to="'/carFrameDetail/' + carFrame.id"
          >
            <div class="img">
              <span class="badge">{{ carFrame.brand_name }}</span>
              <img :src="carFrame.img" :alt="carFrame.name" loading="lazy" @error="onImgError" />
            </div>
            <div class="body">
              <h3>{{ carFrame.brand_name }} {{ carFrame.car_name }} {{ carFrame.name }}</h3>
              <div class="spec">
                {{ carFrame.year_start }}~{{ carFrame.year_end }} · {{ carFrame.size }}{{ $t('carFrame.inch') }} · {{ $t('carFrame.frameTag') }}
              </div>
              <div class="foot">
                <span class="ch">{{ $t('carFrame.supplyByDealer') }}</span>
                <span class="ask">{{ $t('carFrame.viewDetail') }}</span>
              </div>
            </div>
          </NuxtLink>
        </div>

        <p v-if="carFrameList.length === 0" class="empty">
          {{ $t('carFrame.empty') }}
        </p>
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

    <!-- 找不到你的車 -->
    <section class="help">
      <div class="wrap">
        <h2>{{ $t('carFrame.helpTitle') }}</h2>
        <p class="help-p">{{ $t('carFrame.helpDesc') }}</p>
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

const { $axios } = useNuxtApp()

// Banner 背景圖（後台「列表頁 Banner 管理」；沒設定就用下面的預設漸層背景）
const bannerImg = useListBanner('carFrame')
const route = useRoute()
const router = useRouter()

// 下拉與清單資料（改為 Vue 3 Composition API）
const carFrameList = ref([])
const brandList = ref([])
const car = ref([])
const modelList = ref([])
const yearList = ref([])
const brandInputValue = ref('')
const modelInputValue = ref('')
const yearInputValue = ref('')

// 取得下拉選單所有資料
const getListData = async () => {
  const { data } = await $axios.get('/car')
  if (data.car_brand) {
    brandList.value = data.car_brand
    const lsBrand = route.query.brand
    if (lsBrand) {
      brandInputValue.value = lsBrand
      modelInputValue.value = route.query.model || ''
      yearInputValue.value = route.query.year || ''
    } else {
      // 預設載入 TOYOTA 車框
      const toyota = data.car_brand.find((el) => el.name === 'TOYOTA')
      if (toyota) {
        brandInputValue.value = toyota.id
        modelInputValue.value = ''
        yearInputValue.value = ''
      }
    }
    if (data.car) car.value = data.car
    await getCarFrame()
    brandChange()
    modelChange()
  }
}

const getCarFrame = async () => {
  const params = {
    car_brand_id: brandInputValue.value,
    car_id: modelInputValue.value === 'all' ? '' : modelInputValue.value,
    year: yearInputValue.value === 'all' ? '' : yearInputValue.value
  }
  const { data } = await $axios.get('/carframe', { params })
  if (data.result) {
    carFrameList.value = data.result
    router.push({
      path: '/carFrame',
      query: {
        brand: brandInputValue.value,
        model: modelInputValue.value,
        year: yearInputValue.value
      }
    })
  }
}

const brandChange = (isChange) => {
  modelList.value = []
  car.value.forEach((el) => {
    if (brandInputValue.value == el.car_brand_id) {
      modelList.value.push(el)
    }
  })
  if (isChange) {
    modelInputValue.value = ''
    yearInputValue.value = ''
  }
}

const modelChange = () => {
  yearList.value = []
  let tempStart = 0
  let tempEnd = 0
  if (modelInputValue.value === '' || modelInputValue.value === 'all') {
    modelList.value.forEach((el, index) => {
      if (index === 0) {
        tempStart = el.year_start
        tempEnd = el.year_end
      } else {
        if (el.year_start < tempStart) tempStart = el.year_start
        if (el.year_end > tempEnd) tempEnd = el.year_end
      }
    })
    if (tempStart != 0 && tempEnd != 0) {
      const years = +tempEnd - +tempStart
      yearList.value.push(tempStart)
      for (let i = 1; i <= years; i++) {
        yearList.value.push(+tempStart + i)
      }
    }
  } else {
    modelList.value.forEach((el) => {
      if (modelInputValue.value == el.id) {
        const years = +el.year_end - +el.year_start
        yearList.value.push(el.year_start)
        for (let i = 1; i <= years; i++) {
          yearList.value.push(+el.year_start + i)
        }
      }
    })
  }
}

const onImgError = (e) => {
  e.target.style.display = 'none'
}

onMounted(() => {
  getListData()
})

// SEO：標題／描述／canonical
const { t: seoT } = useI18n()
usePageSeo({
  title: () => seoT('carFrame.title'),
  description: () => seoT('carFrame.intro'),
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
  font-family: 'Noto Sans JP', 'Noto Sans TC', system-ui, 'Microsoft JhengHei', sans-serif;
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
.hero { position: relative; overflow: hidden; background: linear-gradient(115deg, #f3f6fa, #e7eef6 55%, #dbe6f1); }
.hero .glow { position: absolute; right: -80px; top: -60px; width: 420px; height: 420px; border-radius: 50%; background: radial-gradient(circle, rgba(61, 123, 255, 0.16), transparent 62%); z-index: 1; }
.hero .bg { position: absolute; inset: 0; width: 100%; height: 100%; background-size: cover; background-position: center; opacity: 0.5; }
.hero .ov { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(243, 246, 250, 0.95), rgba(243, 246, 250, 0.55) 45%, rgba(243, 246, 250, 0.1) 78%); }
.hero .in { position: relative; z-index: 2; padding: 52px 8px 46px; }
.hero .ey { font-size: 12px; letter-spacing: 4px; color: var(--navy); font-weight: 700; }
.hero h1 { font-size: clamp(28px, 5vw, 44px); font-weight: 900; color: var(--ink); line-height: 1.15; margin: 10px 0; }
.hero p { color: #41506b; max-width: 560px; font-weight: 300; }

.crumb { font-size: 12px; color: var(--dim); padding: 4px 0 18px; }
.crumb a:hover { color: var(--navy); }

/* 選車型 */
.selbar {
  display: flex; gap: 8px; flex-wrap: wrap; align-items: center;
  background: var(--bg2); border: 1px solid var(--line); border-radius: 12px;
  padding: 10px; margin-bottom: 10px;
}
.sel-label { font-size: 13px; font-weight: 700; color: var(--navy); padding: 0 8px; white-space: nowrap; }
.sel {
  flex: 1; min-width: 120px; height: 40px; border: 1px solid #dde3ea; border-radius: 8px;
  padding: 0 12px; font-size: 13.5px; font-family: inherit; background: #fff; color: var(--text);
}
.cf-search { height: 40px; min-height: 40px; padding: 0 26px; }
.sel-note { font-size: 12.5px; color: var(--dim); margin: 0 0 22px; }

.shead { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 22px; flex-wrap: wrap; }
.shead .sub { font-size: 12px; letter-spacing: 2px; color: var(--dim); font-weight: 700; text-transform: uppercase; }
.shead .cn { font-size: clamp(20px, 2.6vw, 26px); font-weight: 900; color: var(--ink); }
.shead .desc { color: var(--muted); font-size: 13px; font-weight: 300; max-width: 520px; margin-top: 4px; }

/* product grid */
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.card { border: 1px solid var(--line); border-radius: 16px; overflow: hidden; background: #fff; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; display: block; }
.card:hover { transform: translateY(-6px); box-shadow: 0 18px 40px rgba(13, 27, 46, 0.12); }
.card .img { position: relative; aspect-ratio: 4/3; background: linear-gradient(150deg, #eef2f7, #dbe4ef); display: flex; align-items: center; justify-content: center; color: #8ea0b6; font-size: 13px; }
.card .img img { position: absolute; inset: 0; z-index: 2; width: 100%; height: 100%; object-fit: contain; background: #fff; padding: 10px; mix-blend-mode: multiply; }
.card .badge { position: absolute; top: 10px; left: 10px; z-index: 3; font-size: 11px; font-weight: 700; background: var(--navy); color: #fff; padding: 2px 9px; border-radius: 20px; }
.card .body { padding: 16px 18px; }
.card h3 { font-size: 16px; font-weight: 700; color: var(--ink); }
.card .spec { color: var(--dim); font-size: 12px; margin: 4px 0 10px; min-height: 32px; }
.card .foot { display: flex; align-items: center; justify-content: space-between; }
.card .ch { color: var(--muted); font-size: 13px; font-weight: 600; }
.card .ask { font-size: 12px; color: var(--navy); border: 1px solid var(--line); border-radius: 7px; padding: 6px 12px; }

.empty { text-align: center; color: var(--dim); font-size: 14px; padding: 30px 0; }

/* feature */
.feat { background: radial-gradient(110% 130% at 82% 18%, rgba(61, 123, 255, 0.22), rgba(61, 123, 255, 0.03) 46%, var(--dark) 74%), var(--dark); color: #fff; }
.feat h2 { color: #fff; }
.feat .kick { margin-bottom: 0; }
.feat .lbl { font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #8fb2ff; text-transform: uppercase; }
.feat .row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 22px; }
.fb { background: linear-gradient(150deg, #1b2740, #0d1016 82%); border: 1px solid #29344a; border-radius: 16px; padding: 22px; }
.fb b { color: #fff; font-size: 16px; }
.fb p { color: #aeb8c6; font-size: 13px; margin-top: 6px; }

/* help */
.help { background: var(--bg2); border-top: 1px solid var(--line); text-align: center; }
.help-p { max-width: 480px; margin: 10px auto 0; color: var(--muted); }
.help-btns { margin-top: 20px; }

@media (max-width: 820px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
  .feat .row { grid-template-columns: 1fr; }
}
@media (max-width: 520px) {
  .grid { grid-template-columns: 1fr; }
  .sel { min-width: 100%; }
  .cf-search { width: 100%; }
}
</style>
