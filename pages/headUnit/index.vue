<template>
  <div class="hu-page">
    <!-- HERO -->
    <div class="hero">
      <!-- 後台「列表頁 Banner 管理」：桌機 1920×480（4:1）、手機 1080×608（16:9）。
           兩張都交給 CSS 變數，≤640px 由樣式表切到手機那張；手機沒設定就沿用桌機。 -->
      <div v-if="banner.img" class="bg" :style="{ '--bg': 'url(' + banner.img + ')', '--bg-m': 'url(' + (banner.imgMobile || banner.img) + ')' }"></div>
      <div v-else class="glow"></div>
      <div v-if="banner.img" class="ov"></div>
      <div class="wrap in">
        <div class="crumb">
          <NuxtLink to="/">{{ $t('headUnit.home') }}</NuxtLink> ／
          <span>{{ $t('header.clarion') }}</span> ／ {{ $t('headUnit.navTitle') }}
        </div>
        <div class="ey">{{ eyebrow }}</div>
        <h1>{{ $t('headUnit.title') }}</h1>
        <p>{{ $t('headUnit.intro') }}</p>
      </div>
    </div>

    <!-- 側邊快速導覽（sticky） -->
    <nav class="subnav" ref="subnavEl">
      <div class="wrap subnav-in">
        <a
          v-for="sec in SECTION_META"
          :key="sec.key"
          :href="'#' + sec.key"
          :class="{ on: activeKey === sec.key }"
          @click="scrollToSection(sec.key, $event)"
        >
          {{ $t(sec.nav) }}
        </a>
      </div>
    </nav>

    <!-- 1DIN / 2DIN -->
    <section v-for="(sec, si) in sections" :key="sec.key" class="catsec">
      <div class="wrap">
        <div class="shead">
          <div>
            <div :id="sec.key" class="sub">{{ $t(sec.kicker) }}</div>
            <div class="cn">{{ $t(sec.title) }}</div>
            <div class="desc">{{ $t(sec.desc) }}</div>
          </div>
          <NuxtLink v-if="si === 0" to="/partner" class="btn ghost">
            {{ $t('headUnit.findInstaller') }}
          </NuxtLink>
        </div>

        <div class="grid">
          <component
            :is="item.id ? resolveLink : 'div'"
            v-for="(item, i) in sec.items"
            :key="i"
            class="card"
            :class="{ static: !item.id, soon: item.soon }"
            v-bind="item.id ? { to: `/headUnitDetail/${item.id}` } : {}"
          >
            <div class="img">
              <span class="badge" :class="{ grey: item.soon }">
                {{ item.soon ? $t('headUnit.comingSoonBadge') : item.badge }}
              </span>
              <img
                v-if="item.img"
                :src="item.img"
                :alt="itemName(item)"
                loading="lazy"
                @error="onImgError"
              />
            </div>
            <div class="body">
              <h3>{{ itemName(item) }}</h3>
              <div class="spec">{{ itemSpec(item) }}</div>
              <div class="foot">
                <span class="ch" :class="{ dim: item.soon }">
                  {{ item.soon ? $t('headUnit.comingSoonNote') : $t('headUnit.supplyByDealer') }}
                </span>
                <span v-if="item.id" class="ask">{{ $t('headUnit.viewDetail') }}</span>
              </div>
            </div>
          </component>
        </div>

        <p v-if="sec.items.length === 0" class="empty">{{ $t('headUnit.empty') }}</p>

        <p v-if="si === sections.length - 1" class="note">{{ $t('headUnit.note') }}</p>
      </div>
    </section>

    <!-- help -->
    <section class="help">
      <div class="wrap">
        <h2>{{ $t('headUnit.helpTitle') }}</h2>
        <p class="help-p">{{ $t('headUnit.helpDesc') }}</p>
        <div class="help-btns">
          <NuxtLink to="/partner" class="btn o">{{ $t('home.findDealers') }}</NuxtLink>
          <NuxtLink to="/qa" class="btn ghost-light">{{ $t('home.faq') }}</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { resolveComponent, ref, onMounted, onBeforeUnmount } from 'vue'
import { useListBanner } from '~/composables/useListBanner'

const { t } = useI18n()
const config = useRuntimeConfig()
const resolveLink = resolveComponent('NuxtLink')
const eyebrow = computed(() => `${t('header.clarion')} ｜ ${t('headUnit.eyebrowSuffix')}`)

// Banner 背景圖（後台「列表頁 Banner 管理」；沒設定就用下面的預設漸層背景）
const banner = useListBanner('headUnit')
const ENDPOINT = '/head_unit'

const { data } = await useAsyncData('clarion-headunit', () =>
  ENDPOINT
    ? $fetch(`${config.public.apiBase}${ENDPOINT}`).catch(() => ({ result: [] }))
    : Promise.resolve({ result: [] })
)

const apiList = computed(() => data.value?.result ?? [])

// typeVal 對應後台 car_head_unit 的 type：1DIN0／2DIN1
const SECTION_META = [
  { key: '1din', typeVal: 0, nav: 'headUnit.navDin1', kicker: 'headUnit.din1Kicker', title: 'headUnit.din1Title', desc: 'headUnit.din1Desc' },
  { key: '2din', typeVal: 1, nav: 'headUnit.navDin2', kicker: 'headUnit.din2Kicker', title: 'headUnit.din2Title', desc: 'headUnit.din2Desc' }
]

// 依 type 分組，只顯示後台 API 實際提供的資料（無資料則該區留白）
const sections = computed(() =>
  SECTION_META.map((meta) => ({
    ...meta,
    items: apiList.value
      .filter((p) => Number(p.type) === meta.typeVal)
      .map((p) => ({
        id: p.id,
        badge: p.badge || meta.key.toUpperCase(),
        name: p.name,
        spec: p.memo || p.spec,
        img: p.img
      }))
  }))
)

const itemName = (item) => item.name || (item.nameKey ? t(item.nameKey) : '')
const itemSpec = (item) => item.spec || (item.specKey ? t(item.specKey) : '')

const onImgError = (e) => {
  e.target.style.display = 'none'
}

// sticky 側邊導覽：捲動到哪一區就把該區連結標成 active（比照 audioAccessories 的做法）
const activeKey = ref(SECTION_META[0]?.key)
let observer = null

const scrollToSection = (key, e) => {
  e.preventDefault()
  const el = document.getElementById(key)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  const sectionEls = SECTION_META.map((s) => document.getElementById(s.key)).filter(Boolean)
  if (!sectionEls.length || typeof IntersectionObserver === 'undefined') return
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeKey.value = entry.target.id
        }
      })
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  )
  sectionEls.forEach((el) => observer.observe(el))
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
})

useHead({
  title: () => t('headUnit.title')
})
</script>

<style scoped>
.hu-page {
  --ink: #0d1b2e;
  --text: #1b2431;
  --muted: #5b6675;
  --dim: #93a0b0;
  --bg: #fff;
  --bg2: #f5f7fa;
  --line: #e6ebf1;
  --navy: #007ABE;
  --dark: #0d1016;
  font-family: 'Noto Sans JP', 'Noto Sans TC', system-ui, 'Microsoft JhengHei', sans-serif;
  color: var(--text);
  line-height: 1.75;
  letter-spacing: 0.02em;
  background: var(--bg);
}
.hu-page a { color: inherit; text-decoration: none; }
.hu-page img { display: block; max-width: 100%; }
.hu-page h2 { font-size: clamp(22px, 3vw, 30px); font-weight: 900; color: var(--ink); }
.wrap { max-width: 1080px; margin: 0 auto; padding: 0 26px; }
.hu-page section { padding: 48px 0; }
.catsec + .catsec { padding-top: 0; }
.shead .sub { scroll-margin-top: 138px; }

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
.hero .in { position: relative; z-index: 2; padding: 40px 8px 46px; }
.hero .crumb { font-size: 12px; color: var(--dim); margin-bottom: 14px; }
.hero .crumb a:hover { color: var(--navy); }
.hero .ey { font-size: 12px; letter-spacing: 4px; color: var(--navy); font-weight: 700; }
.hero h1 { font-size: clamp(28px, 5vw, 44px); font-weight: 900; color: var(--ink); line-height: 1.15; margin: 10px 0; }
.hero p { color: #41506b; max-width: 560px; font-weight: 300; }

/* sticky 分類導覽 */
.subnav { position: sticky; top: 64px; z-index: 30; background: rgba(255, 255, 255, 0.94); backdrop-filter: blur(8px); border-bottom: 1px solid var(--line); }
.subnav-in { display: flex; gap: 6px; overflow-x: auto; padding-top: 12px; padding-bottom: 12px; }
.subnav a { flex: none; font-size: 13px; color: var(--muted); padding: 8px 14px; border-radius: 20px; white-space: nowrap; transition: 0.16s; }
.subnav a:hover { color: var(--navy); background: var(--bg2); }
.subnav a.on { color: #fff; background: var(--navy); font-weight: 700; }

.shead { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 22px; flex-wrap: wrap; }
.shead .sub { font-size: 12px; letter-spacing: 2px; color: var(--dim); font-weight: 700; text-transform: uppercase; }
.shead .cn { font-size: clamp(20px, 2.6vw, 26px); font-weight: 900; color: var(--ink); }
.shead .desc { color: var(--muted); font-size: 13px; font-weight: 300; max-width: 560px; margin-top: 4px; }

/* grid */
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.card { border: 1px solid var(--line); border-radius: 16px; overflow: hidden; background: #fff; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; display: block; }
.card:hover { transform: translateY(-6px); box-shadow: 0 18px 40px rgba(13, 27, 46, 0.12); }
.card.static { cursor: default; }
.card.static:hover { transform: none; box-shadow: none; }
.card .img { position: relative; aspect-ratio: 4/3; background: linear-gradient(150deg, #eef2f7, #dbe4ef); display: flex; align-items: center; justify-content: center; color: #8ea0b6; font-size: 13px; text-align: center; padding: 0 12px; }
.card.soon .img { background: repeating-linear-gradient(135deg, #eef2f7 0 12px, #e6ecf3 12px 24px); }
.card .img img { position: absolute; inset: 0; z-index: 2; width: 100%; height: 100%; object-fit: contain; background: #fff; padding: 10px; mix-blend-mode: multiply; }
.card .badge { position: absolute; top: 10px; left: 10px; z-index: 3; font-size: 11px; font-weight: 700; background: var(--navy); color: #fff; padding: 2px 9px; border-radius: 20px; }
.card .badge.grey { background: #5b6675; }
.card .body { padding: 16px 18px; }
.card h3 { font-size: 16px; font-weight: 700; color: var(--ink); }
.card .spec { color: var(--dim); font-size: 12px; margin: 4px 0 10px; min-height: 20px; }
.card .foot { display: flex; align-items: center; justify-content: space-between; margin-top: 10px; }
.card .ch { color: var(--muted); font-size: 13px; font-weight: 600; }
.card .ch.dim { color: var(--dim); font-weight: 500; }
.card .ask { font-size: 12px; color: var(--navy); border: 1px solid var(--line); border-radius: 7px; padding: 6px 12px; }

.empty { text-align: center; color: var(--dim); font-size: 14px; padding: 20px 0; }
.note { margin-top: 18px; font-size: 12px; color: var(--dim); line-height: 1.8; }

/* help */
.help { background: var(--bg2); border-top: 1px solid var(--line); text-align: center; }
.help-p { max-width: 480px; margin: 10px auto 0; color: var(--muted); }
.help-btns { margin-top: 20px; }

@media (max-width: 820px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .subnav { top: 64px; }
}
@media (max-width: 520px) {
  .grid { grid-template-columns: 1fr; }
}
</style>
