<template>
  <div class="mm-page">
    <!-- HERO（歌樂 OEM 頁樣式，品牌文字改 MEIMAI） -->
    <div class="hero">
      <!-- 後台「列表頁 Banner 管理」：桌機 1920×480（4:1）、手機 1080×608（16:9）。
           兩張都交給 CSS 變數，≤640px 由樣式表切到手機那張；手機沒設定就沿用桌機。 -->
      <div v-if="banner.img" class="bg" :style="{ '--bg': 'url(' + banner.img + ')', '--bg-m': 'url(' + (banner.imgMobile || banner.img) + ')' }"></div>
      <div v-else class="glow"></div>
      <div v-if="banner.img" class="ov"></div>
      <div class="wrap in">
        <div class="ey">{{ isClarionType ? $t('multimedia.eyebrowClarion') : $t('multimedia.eyebrow') }}</div>
        <h1>{{ $t('multimedia.title') }}</h1>
        <p>{{ isClarionType ? $t('multimedia.introClarion') : $t('multimedia.intro') }}</p>
      </div>
    </div>

    <section>
      <div class="wrap">
        <div class="crumb">
          <NuxtLink to="/">{{ $t('multimedia.home') }}</NuxtLink> ／ {{ $t('multimedia.title') }}
        </div>

        <div class="shead">
          <div>
            <div class="sub">{{ $t('multimedia.sectionKicker') }}</div>
            <div class="cn">{{ sectionTitleText }}</div>
            <div class="desc">{{ isClarionType ? $t('multimedia.sectionDescClarion') : $t('multimedia.sectionDesc') }}</div>
          </div>
          <NuxtLink to="/partner" class="btn ghost">{{ $t('multimedia.findInstaller') }}</NuxtLink>
        </div>

        <div class="grid">
          <NuxtLink
            v-for="(item, index) in multiMediasList"
            :key="index"
            class="card"
            :to="'/multimediaDetail/' + item.id"
          >
            <div class="img">
              <span class="badge">{{ typeLabel(item.type) }}</span>
              <img :src="item.img" :alt="item.name" loading="lazy" @error="onImgError" />
            </div>
            <div class="body">
              <h3>{{ item.name }}</h3>
              <div class="spec">{{ item.memo }}</div>
              <div v-if="item.size" class="sizes">
                <span v-for="(size, key) in String(item.size).split(';')" :key="key" class="chip">
                  {{ size }}{{ $t('multimedia.inch') }}
                </span>
              </div>
              <div class="foot">
                <span class="ch">{{ $t('multimedia.supplyByDealer') }}</span>
                <span class="ask">{{ $t('multimedia.viewDetail') }}</span>
              </div>
            </div>
          </NuxtLink>
        </div>

        <p v-if="multiMediasList.length === 0" class="empty">
          {{ $t('multimedia.empty') }}
        </p>
      </div>
    </section>

    <!-- 規格比較（保留原功能，改新樣式） -->
    <section v-if="multiMediasList.length" class="compare">
      <div class="wrap">
        <div class="shead center">
          <div>
            <div class="sub">{{ $t('multimedia.compareKicker') }}</div>
            <div class="cn">{{ $t('multimedia.compareTitle') }}</div>
            <div class="desc">{{ $t('multimedia.compareDesc') }}</div>
          </div>
        </div>
        <div class="cgrid">
          <div v-for="(item, index) in multiMediasList" :key="index" class="ccard">
            <div class="cimg">
              <img :src="item.img" :alt="item.name" loading="lazy" @error="onImgError" />
            </div>
            <h3>{{ item.name }}</h3>
            <ul>
              <li><span>{{ $t('multimedia.hardware') }}</span>{{ item.hard_drive }}</li>
              <li><span>{{ $t('multimedia.ram') }}</span>{{ item.ram }}</li>
              <li><span>{{ $t('multimedia.resolution') }}</span>{{ item.resolution }}</li>
            </ul>
            <NuxtLink :to="'/multimediaDetail/' + item.id" class="clink">{{ $t('multimedia.viewDetail') }} →</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- 為什麼選：type=2（Clarion）用 OEM 版文案，其餘（MM）用原本文案 -->
    <section class="feat">
      <div class="wrap">
        <template v-if="isClarionType">
          <div class="kick"><div class="lbl">{{ $t('multimedia.whyOemKicker') }}</div></div>
          <h2>{{ $t('multimedia.whyOemTitle') }}</h2>
          <div class="row">
            <div class="fb">
              <b>{{ $t('multimedia.whyOem1Title') }}</b>
              <p>{{ $t('multimedia.whyOem1Desc') }}</p>
            </div>
            <div class="fb">
              <b>{{ $t('multimedia.whyOem2Title') }}</b>
              <p>{{ $t('multimedia.whyOem2Desc') }}</p>
            </div>
            <div class="fb">
              <b>{{ $t('multimedia.whyOem3Title') }}</b>
              <p>{{ $t('multimedia.whyOem3Desc') }}</p>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="kick"><div class="lbl">{{ $t('multimedia.whyKicker') }}</div></div>
          <h2>{{ $t('multimedia.whyTitle') }}</h2>
          <div class="row">
            <div class="fb">
              <b>{{ $t('multimedia.why1Title') }}</b>
              <p>{{ $t('multimedia.why1Desc') }}</p>
            </div>
            <div class="fb">
              <b>{{ $t('multimedia.why2Title') }}</b>
              <p>{{ $t('multimedia.why2Desc') }}</p>
            </div>
            <div class="fb">
              <b>{{ $t('multimedia.why3Title') }}</b>
              <p>{{ $t('multimedia.why3Desc') }}</p>
            </div>
          </div>
        </template>
      </div>
    </section>

    <!-- 想升級車機 -->
    <section class="help">
      <div class="wrap">
        <h2>{{ $t('multimedia.helpTitle') }}</h2>
        <p class="help-p">{{ $t('multimedia.helpDesc') }}</p>
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

// forceType：由語意化路由（/clarion/gl、/clarion/oem…）指定分類；
// 沒給就沿用舊行為，讀網址的 ?type=。
const props = defineProps({
  forceType: { type: [String, Number], default: null },
  // canonicalPath：語意化路由要把 canonical 指到自己，避免和 /multimedia?type= 變成重複內容
  canonicalPath: { type: String, default: null }
})

const { $axios } = useNuxtApp()
const { t } = useI18n()
const route = useRoute()

// 分類：0=MM 多媒體安卓機、1=MM 車型專用機、2=Clarion GL、3=Clarion OEM車型專用機；都沒有則顯示全部
const pageType = computed(() =>
  props.forceType !== null && props.forceType !== '' ? String(props.forceType) : route.query.type
)

// Banner 背景圖（後台「列表頁 Banner 管理」，依分類各自設定；沒設定就用下面的預設漸層背景）
const banner = useListBanner('multimedia', pageType)

const { data } = await useAsyncData(
  () => `multimedia-list-${pageType.value ?? 'all'}`,
  async () => {
    const params = {}
    if (pageType.value !== undefined && pageType.value !== null && pageType.value !== '') {
      params.type = pageType.value
    }
    const res = await $axios.get('/multimedia', { params })
    return res.data
  },
  { watch: [pageType] }
)
const multiMediasList = computed(() => data.value?.result ?? [])

// 卡片標籤：依 type 顯示品牌／類型
const TYPE_LABELS = { 0: 'multimedia.typeMM', 1: 'multimedia.typeOem', 2: 'multimedia.typeClarion', 3: 'multimedia.typeClarionOem' }
const typeLabel = (tp) => t(TYPE_LABELS[tp] ?? 'multimedia.typeMM')

// 底部「為什麼選」區塊：type=2（Clarion）用車型專用機版文案，其餘（MM，type < 2 或未帶）用原本文案
// type 2, type 3 都屬於 Clarion
const isClarionType = computed(() => [2, 3].includes(Number(pageType.value)))

// 分類標題：帶 GL（type=2）＝GL 系列、type=0＝ME 系列、帶 OEM 或 type=1（type=1 或 3）＝車型專用機
const SECTION_TITLE_KEY = {
  0: 'multimedia.sectionTitle',
  1: 'multimedia.sectionTitleOem',
  2: 'multimedia.sectionTitleClarion',
  3: 'multimedia.sectionTitleOem'
}
const sectionTitleText = computed(() => t(SECTION_TITLE_KEY[Number(pageType.value)] ?? 'multimedia.sectionTitle'))

const onImgError = (e) => {
  e.target.style.display = 'none'
}

// SEO：Clarion（type=2/3）與 MM（type=0/1）用不同標題／描述；canonical 一律不帶 query
const isClarionOem = computed(() => Number(pageType.value) === 3)
const isMmOem = computed(() => Number(pageType.value) === 1)
usePageSeo({
  title: () =>
    isClarionOem.value
      ? `${t('header.clarionItems.oem')}｜Clarion 歌樂`
      : isClarionType.value
        ? `${t('multimedia.title')}｜Clarion 歌樂 GL 系列`
        : isMmOem.value
          ? `${t('header.mmItems.oem')}｜MM 美邁`
          : t('multimedia.title'),
  description: () => (isClarionType.value ? t('multimedia.introClarion') : t('multimedia.intro')),
  brand: isClarionType.value ? 'clarion' : 'mm',
  // /multimedia?type= 的 canonical 一律指向語意化網址：/clarion/gl、/clarion/oem、/mm/me、/mm/oem
  canonicalPath:
    props.canonicalPath ||
    (Number(pageType.value) === 2
      ? '/clarion/gl'
      : isClarionOem.value
        ? '/clarion/oem'
        : Number(pageType.value) === 0
          ? '/mm/me'
          : isMmOem.value
            ? '/mm/oem'
            : null)
})
</script>

<style scoped>
.mm-page {
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
.mm-page a { color: inherit; text-decoration: none; }
.mm-page img { display: block; max-width: 100%; }
.mm-page h2 { font-size: clamp(22px, 3vw, 30px); font-weight: 900; color: var(--ink); }
.mm-page .wrap { max-width: 1080px; margin: 0 auto; padding: 0 26px; }
.mm-page section { padding: 48px 0; }

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
/* 列表頁 Banner：桌機固定 4:1 長條（1920×480）→ min-height 用 25vw，之後上傳橫幅照片才不會被壓扁；
   文字改貼齊上方、置左（不再垂直置中）。 */
.hero { position: relative; overflow: hidden; background: linear-gradient(115deg, #f3f6fa, #e7eef6 55%, #dbe6f1); min-height: clamp(260px, 25vw, 480px); }
.hero .glow { position: absolute; right: -80px; top: -60px; width: 420px; height: 420px; border-radius: 50%; background: radial-gradient(circle, rgba(61, 123, 255, 0.16), transparent 62%); z-index: 1; }
/* 有上傳圖就以圖為主：不降透明度。白色漸層只蓋左邊文字區，右邊 1/3 完整露出。 */
.hero .bg { position: absolute; inset: 0; width: 100%; height: 100%; background-image: var(--bg); background-size: cover; background-position: center; }
/* 內容欄置中（max-width 1080），文字最右可到視窗 ~50%，所以白色漸層要蓋到 64% 才收；右邊 1/3 完整露出。 */
.hero .ov { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(243, 246, 250, 0.94) 0%, rgba(243, 246, 250, 0.9) 34%, rgba(243, 246, 250, 0.66) 50%, rgba(243, 246, 250, 0) 64%); }
/* 手機：改成「圖在上（16:9 完整露出，不蓋白霧）、文字在下」 */
@media (max-width: 640px) {
  .hero { display: block; min-height: 0; }
  .hero .bg { position: relative; inset: auto; height: auto; aspect-ratio: 16 / 9; background-image: var(--bg-m, var(--bg)); }
  .hero .ov { display: none; }
}
.hero .in { position: relative; z-index: 2; padding: 52px 8px 46px; }
.hero .ey { font-size: 12px; letter-spacing: 4px; color: var(--navy); font-weight: 700; }
.hero h1 { font-size: clamp(28px, 5vw, 44px); font-weight: 900; color: var(--ink); line-height: 1.15; margin: 10px 0; }
.hero p { color: #41506b; max-width: 560px; font-weight: 300; }

.crumb { font-size: 12px; color: var(--dim); padding: 4px 0 18px; }
.crumb a:hover { color: var(--navy); }

.shead { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 22px; flex-wrap: wrap; }
.shead.center { justify-content: center; text-align: center; }
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
.card .sizes { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
.card .chip { font-size: 11px; font-weight: 600; color: var(--navy); border: 1px solid var(--navy); border-radius: 6px; padding: 2px 8px; }
.card .foot { display: flex; align-items: center; justify-content: space-between; }
.card .ch { color: var(--muted); font-size: 13px; font-weight: 600; }
.card .ask { font-size: 12px; color: var(--navy); border: 1px solid var(--line); border-radius: 7px; padding: 6px 12px; }

.empty { text-align: center; color: var(--dim); font-size: 14px; padding: 30px 0; }

/* 規格比較 */
.compare { background: var(--bg2); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.cgrid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.ccard { background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 18px; }
.ccard .cimg { aspect-ratio: 4/3; background: linear-gradient(150deg, #eef2f7, #dbe4ef); border-radius: 10px; overflow: hidden; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
.ccard .cimg img { width: 100%; height: 100%; object-fit: contain; background: #fff; padding: 8px; mix-blend-mode: multiply; }
.ccard h3 { font-size: 15px; font-weight: 700; color: var(--ink); margin-bottom: 10px; }
.ccard ul { list-style: none; padding: 0; margin: 0 0 12px; }
.ccard li { font-size: 12.5px; color: var(--text); padding: 6px 0; border-top: 1px dashed var(--line); }
.ccard li span { display: inline-block; min-width: 52px; color: var(--dim); font-weight: 700; margin-right: 6px; }
.ccard .clink { font-size: 12px; color: var(--navy); font-weight: 700; }
.ccard .clink:hover { color: var(--navy); }

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
  .cgrid { grid-template-columns: repeat(2, 1fr); }
  .feat .row { grid-template-columns: 1fr; }
}
@media (max-width: 520px) {
  .grid { grid-template-columns: 1fr; }
  .cgrid { grid-template-columns: 1fr; }
}
</style>
