<template>
  <div class="ov-page">
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
        <div class="crumb">
          <NuxtLink to="/">{{ $t('clarionOverview.home') }}</NuxtLink> ／
          <span>{{ $t('header.clarion') }}</span> ／ {{ $t('clarionOverview.navTitle') }}
        </div>
        <div class="ey">{{ eyebrow }}</div>
        <h1>{{ $t('clarionOverview.title') }}</h1>
        <p>{{ $t('clarionOverview.intro') }}</p>
      </div>
    </div>

    <!-- 側邊快速導覽（sticky） -->
    <nav class="subnav" ref="subnavEl">
      <div class="wrap subnav-in">
        <a
          v-for="sec in sectionMeta"
          :key="sec.key"
          :href="'#' + sec.key"
          :class="{ on: activeKey === sec.key }"
          @click="scrollToSection(sec.key, $event)"
        >
          {{ $t(sec.nav) }}
        </a>
      </div>
    </nav>

    <!-- 為什麼選 Clarion -->
    <section class="guide-wrap">
      <div class="wrap">
        <div class="guide">
          <h2>{{ $t('clarionOverview.guideTitle') }}</h2>
          <p>{{ $t('clarionOverview.guideDesc') }}</p>
        </div>
      </div>
    </section>

    <!-- 多媒體安卓機 GL -->
    <section id="tablet" class="catsec" data-sec="tablet">
      <div class="wrap">
        <div class="shead">
          <div>
            <div class="sub">{{ $t('clarionOverview.tabletKicker') }}</div>
            <div class="cn">{{ $t('clarionOverview.tabletTitle') }}</div>
            <div class="desc">{{ $t('clarionOverview.tabletDesc') }}</div>
          </div>
          <NuxtLink to="/partner" class="btn ghost">{{ $t('clarionOverview.findInstaller') }}</NuxtLink>
        </div>

        <div class="grid">
          <NuxtLink
            v-for="item in tabletList"
            :key="'tablet-' + item.id"
            class="card"
            :to="'/multimediaDetail/' + item.id"
          >
            <div class="img">
              <span class="badge">{{ $t('clarionOverview.badgeTablet') }}</span>
              <img :src="item.img" :alt="item.name" loading="lazy" @error="onImgError" />
            </div>
            <div class="body">
              <h3>{{ item.name }}</h3>
              <div v-if="item.memo" class="spec">{{ item.memo }}</div>
              <div class="foot">
                <span class="ch">{{ $t('clarionOverview.supplyByDealer') }}</span>
                <span class="ask">{{ $t('clarionOverview.viewDetail') }}</span>
              </div>
            </div>
          </NuxtLink>
        </div>
        <p v-if="tabletList.length === 0" class="empty">{{ $t('clarionOverview.empty') }}</p>
      </div>
    </section>

    <!-- 汽車音響 -->
    <section id="sound" class="catsec" data-sec="sound">
      <div class="wrap">
        <div class="shead">
          <div>
            <div class="sub">{{ $t('clarionOverview.soundKicker') }}</div>
            <div class="cn">{{ $t('clarionOverview.soundTitle') }}</div>
            <div class="desc">{{ $t('clarionOverview.soundDesc') }}</div>
          </div>
          <NuxtLink to="/partner" class="btn ghost">{{ $t('clarionOverview.findInstaller') }}</NuxtLink>
        </div>

        <div class="grid">
          <NuxtLink
            v-for="item in soundList"
            :key="'sound-' + item.id"
            class="card"
            :to="'/clarion/audioAccessoriesDetail/' + item.id"
          >
            <div class="img">
              <span class="badge">{{ item.badge }}</span>
              <img :src="item.img" :alt="item.name" loading="lazy" @error="onImgError" />
            </div>
            <div class="body">
              <h3>{{ item.name }}</h3>
              <div v-if="item.memo" class="spec">{{ item.memo }}</div>
              <div class="foot">
                <span class="ch">{{ $t('clarionOverview.supplyByDealer') }}</span>
                <span class="ask">{{ $t('clarionOverview.viewDetail') }}</span>
              </div>
            </div>
          </NuxtLink>
        </div>
        <p v-if="soundList.length === 0" class="empty">{{ $t('clarionOverview.empty') }}</p>
      </div>
    </section>

    <!-- 鏡頭 -->
    <section id="camera" class="catsec" data-sec="camera">
      <div class="wrap">
        <div class="shead">
          <div>
            <div class="sub">{{ $t('clarionOverview.cameraKicker') }}</div>
            <div class="cn">{{ $t('clarionOverview.cameraTitle') }}</div>
            <div class="desc">{{ $t('clarionOverview.cameraDesc') }}</div>
          </div>
          <NuxtLink to="/partner" class="btn ghost">{{ $t('clarionOverview.findInstaller') }}</NuxtLink>
        </div>

        <div class="grid">
          <NuxtLink
            v-for="item in cameraList"
            :key="'camera-' + item.id"
            class="card"
            :to="'/clarion/cameraDetail/' + item.id"
          >
            <div class="img">
              <span class="badge">{{ $t('clarionOverview.badgeCamera') }}</span>
              <img :src="item.img" :alt="item.name" loading="lazy" @error="onImgError" />
            </div>
            <div class="body">
              <h3>{{ item.name }}</h3>
              <div v-if="item.memo" class="spec">{{ item.memo }}</div>
              <div class="foot">
                <span class="ch">{{ $t('clarionOverview.supplyByDealer') }}</span>
                <span class="ask">{{ $t('clarionOverview.viewDetail') }}</span>
              </div>
            </div>
          </NuxtLink>
        </div>
        <p v-if="cameraList.length === 0" class="empty">{{ $t('clarionOverview.empty') }}</p>
      </div>
    </section>

    <!-- 車用主機 1/2DIN -->
    <section id="din" class="catsec" data-sec="din">
      <div class="wrap">
        <div class="shead">
          <div>
            <div class="sub">{{ $t('clarionOverview.dinKicker') }}</div>
            <div class="cn">{{ $t('clarionOverview.dinTitle') }}</div>
            <div class="desc">{{ $t('clarionOverview.dinDesc') }}</div>
          </div>
          <NuxtLink to="/partner" class="btn ghost">{{ $t('clarionOverview.findInstaller') }}</NuxtLink>
        </div>

        <div class="grid">
          <NuxtLink
            v-for="item in dinList"
            :key="'din-' + item.id"
            class="card"
            :to="'/headUnitDetail/' + item.id"
          >
            <div class="img">
              <span class="badge">{{ item.badge }}</span>
              <img :src="item.img" :alt="item.name" loading="lazy" @error="onImgError" />
            </div>
            <div class="body">
              <h3>{{ item.name }}</h3>
              <div v-if="item.memo" class="spec">{{ item.memo }}</div>
              <div class="foot">
                <span class="ch">{{ $t('clarionOverview.supplyByDealer') }}</span>
                <span class="ask">{{ $t('clarionOverview.viewDetail') }}</span>
              </div>
            </div>
          </NuxtLink>
        </div>
        <p v-if="dinList.length === 0" class="empty">{{ $t('clarionOverview.empty') }}</p>
      </div>
    </section>

    <!-- 行車記錄器 -->
    <section id="dvr" class="catsec" data-sec="dvr">
      <div class="wrap">
        <div class="shead">
          <div>
            <div class="sub">{{ $t('clarionOverview.dvrKicker') }}</div>
            <div class="cn">{{ $t('clarionOverview.dvrTitle') }}</div>
            <div class="desc">{{ $t('clarionOverview.dvrDesc') }}</div>
          </div>
          <NuxtLink to="/partner" class="btn ghost">{{ $t('clarionOverview.findInstaller') }}</NuxtLink>
        </div>

        <div class="grid">
          <NuxtLink
            v-for="item in dvrList"
            :key="'dvr-' + item.id"
            class="card"
            :to="'/clarion/dashcamDetail/' + item.id"
          >
            <div class="img">
              <span class="badge">{{ $t('clarionOverview.badgeDvr') }}</span>
              <img :src="item.img" :alt="item.name" loading="lazy" @error="onImgError" />
            </div>
            <div class="body">
              <h3>{{ item.name }}</h3>
              <div v-if="item.memo" class="spec">{{ item.memo }}</div>
              <div class="foot">
                <span class="ch">{{ $t('clarionOverview.supplyByDealer') }}</span>
                <span class="ask">{{ $t('clarionOverview.viewDetail') }}</span>
              </div>
            </div>
          </NuxtLink>
        </div>
        <p v-if="dvrList.length === 0" class="empty">{{ $t('clarionOverview.empty') }}</p>
      </div>
    </section>

    <!-- 頭枕螢幕 -->
    <!-- <section id="headrest" class="catsec" data-sec="headrest">
      <div class="wrap">
        <div class="shead">
          <div>
            <div class="sub">{{ $t('clarionOverview.headrestKicker') }}</div>
            <div class="cn">{{ $t('clarionOverview.headrestTitle') }}</div>
            <div class="desc">{{ $t('clarionOverview.headrestDesc') }}</div>
          </div>
          <NuxtLink to="/partner" class="btn ghost">{{ $t('clarionOverview.findInstaller') }}</NuxtLink>
        </div>

        <div class="grid">
          <NuxtLink
            v-for="item in headrestList"
            :key="'headrest-' + item.id"
            class="card"
            :to="'/headrestDetail/' + item.id"
          >
            <div class="img">
              <span class="badge">{{ $t('clarionOverview.badgeHeadrest') }}</span>
              <img :src="item.img" :alt="item.name" loading="lazy" @error="onImgError" />
            </div>
            <div class="body">
              <h3>{{ item.name }}</h3>
              <div v-if="item.memo" class="spec">{{ item.memo }}</div>
              <div class="foot">
                <span class="ch">{{ $t('clarionOverview.supplyByDealer') }}</span>
                <span class="ask">{{ $t('clarionOverview.viewDetail') }}</span>
              </div>
            </div>
          </NuxtLink>
        </div>
        <p v-if="headrestList.length === 0" class="empty">{{ $t('clarionOverview.empty') }}</p>
      </div>
    </section> -->

    <!-- 可攜式 -->
    <!-- <section id="portable" class="catsec" data-sec="portable">
      <div class="wrap">
        <div class="shead">
          <div>
            <div class="sub">{{ $t('clarionOverview.portableKicker') }}</div>
            <div class="cn">{{ $t('clarionOverview.portableTitle') }}</div>
            <div class="desc">{{ $t('clarionOverview.portableDesc') }}</div>
          </div>
          <NuxtLink to="/partner" class="btn ghost">{{ $t('clarionOverview.findInstaller') }}</NuxtLink>
        </div>

        <div class="grid">
          <NuxtLink
            v-for="item in portableList"
            :key="'portable-' + item.id"
            class="card"
            :to="'/portableDetail/' + item.id"
          >
            <div class="img">
              <span class="badge">{{ $t('clarionOverview.badgePortable') }}</span>
              <img :src="item.img" :alt="item.name" loading="lazy" @error="onImgError" />
            </div>
            <div class="body">
              <h3>{{ item.name }}</h3>
              <div v-if="item.memo" class="spec">{{ item.memo }}</div>
              <div class="foot">
                <span class="ch">{{ $t('clarionOverview.supplyByDealer') }}</span>
                <span class="ask">{{ $t('clarionOverview.viewDetail') }}</span>
              </div>
            </div>
          </NuxtLink>
        </div>
        <p v-if="portableList.length === 0" class="empty">{{ $t('clarionOverview.empty') }}</p>
      </div>
    </section> -->

    <!-- help -->
    <section class="help">
      <div class="wrap">
        <h2>{{ $t('clarionOverview.helpTitle') }}</h2>
        <p class="help-p">{{ $t('clarionOverview.helpDesc') }}</p>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const { t } = useI18n()
const config = useRuntimeConfig()

const eyebrow = computed(() => `${t('header.clarion')} ｜ ${t('clarionOverview.eyebrowSuffix')}`)

// Banner 背景圖（後台「列表頁 Banner 管理」；沒設定就用下面的預設漸層背景）
const banner = useListBanner('clarionOverview')

// 7 大分類
const sectionMeta = [
  { key: 'tablet', nav: 'clarionOverview.navTablet' },
  { key: 'sound', nav: 'clarionOverview.navSound' },
  { key: 'camera', nav: 'clarionOverview.navCamera' },
  { key: 'din', nav: 'clarionOverview.navDin' },
  { key: 'dvr', nav: 'clarionOverview.navDvr' },
  // { key: 'headrest', nav: 'clarionOverview.navHeadrest' },
  // { key: 'portable', nav: 'clarionOverview.navPortable' }
]

const fetchList = (endpoint, params) =>
  $fetch(`${config.public.apiBase}${endpoint}`, params ? { params } : undefined).catch(() => ({ result: [] }))

// 多媒體安卓機 GL：/multimedia?type=2（0=MM 多媒體安卓機／1=MM 專用機／2=Clarion）
const { data: tabletData } = await useAsyncData('ov-tablet', () => fetchList('/multimedia', { type: 2 }))
const tabletList = computed(() =>
  (tabletData.value?.result ?? []).map((p) => ({ id: p.id, name: p.name, memo: p.memo, img: p.img }))
)

// 汽車音響：/audio_accessories（type 0喇叭／1高音／2重低音／3擴大機）
const { data: soundData } = await useAsyncData('ov-sound', () => fetchList('/audio_accessories'))
const SOUND_BADGE = { 0: 'SPEAKER', 1: 'TWEETER', 2: 'SUB', 3: 'AMP' }
const soundList = computed(() =>
  (soundData.value?.result ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    memo: p.memo,
    img: p.img,
    badge: p.badge || SOUND_BADGE[Number(p.type)] || 'SOUND'
  }))
)

// 鏡頭：Clarion /camera?brand=1
const { data: cameraData } = await useAsyncData('ov-camera', () => fetchList('/camera', { brand: 1 }))
const cameraList = computed(() =>
  (cameraData.value?.result ?? []).map((p) => ({ id: p.id, name: p.name, memo: p.memo, img: p.img }))
)

// 車用主機：/head_unit（type 0=1DIN／1=2DIN）
const { data: dinData } = await useAsyncData('ov-din', () => fetchList('/head_unit'))
const dinList = computed(() =>
  (dinData.value?.result ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    memo: p.memo,
    img: p.img,
    badge: p.badge || (Number(p.type) === 1 ? t('clarionOverview.badgeDin2') : t('clarionOverview.badgeDin1'))
  }))
)

// 行車記錄器：Clarion /dashcam?brand=1
const { data: dvrData } = await useAsyncData('ov-dvr', () => fetchList('/dashcam', { brand: 1 }))
const dvrList = computed(() =>
  (dvrData.value?.result ?? []).map((p) => ({ id: p.id, name: p.name, memo: p.memo, img: p.img }))
)

// 頭枕螢幕：/headrest
// const { data: headrestData } = await useAsyncData('ov-headrest', () => fetchList('/headrest'))
// const headrestList = computed(() =>
//   (headrestData.value?.result ?? []).map((p) => ({ id: p.id, name: p.name, memo: p.memo, img: p.img }))
// )

// 可攜式：/portable
// const { data: portableData } = await useAsyncData('ov-portable', () => fetchList('/portable'))
// const portableList = computed(() =>
//   (portableData.value?.result ?? []).map((p) => ({ id: p.id, name: p.name, memo: p.memo, img: p.img }))
// )

const onImgError = (e) => {
  e.target.style.display = 'none'
}

// sticky 側邊導覽：捲動到哪一區就把該區連結標成 active
const activeKey = ref('tablet')
let observer = null

const scrollToSection = (key, e) => {
  e.preventDefault()
  const el = document.getElementById(key)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  const sections = sectionMeta.map((s) => document.getElementById(s.key)).filter(Boolean)
  if (!sections.length || typeof IntersectionObserver === 'undefined') return
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
  sections.forEach((el) => observer.observe(el))
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
})

usePageSeo({
  title: () => t('clarionOverview.seoTitle'),
  description: () => t('clarionOverview.seoDesc'),
  noSuffix: true
})
</script>

<style scoped>
.ov-page {
  --ink: #0d1b2e;
  --text: #1b2431;
  --muted: #5b6675;
  --dim: #93a0b0;
  --bg: #fff;
  --bg2: #f5f7fa;
  --line: #e6ebf1;
  --navy: #007ABE;
  --purple: #af47d2;
  --dark: #0d1016;
  font-family: 'Noto Sans TC', system-ui, 'Microsoft JhengHei', sans-serif;
  color: var(--text);
  line-height: 1.75;
  letter-spacing: 0.02em;
  background: var(--bg);
}
.ov-page a { color: inherit; text-decoration: none; }
.ov-page img { display: block; max-width: 100%; }
.ov-page h2 { font-size: clamp(22px, 3vw, 30px); font-weight: 900; color: var(--ink); }
.wrap { max-width: 1080px; margin: 0 auto; padding: 0 26px; }
.ov-page section { padding: 48px 0; }
.catsec + .catsec { padding-top: 0; }
#tablet { scroll-margin-top: 84px; }
#sound, #camera, #din, #dvr, #headrest, #portable { scroll-margin-top: 138px; }

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
.hero .ov { position: absolute; inset: 0; }
.hero .bg-mobile, .hero .glow-mobile, .hero .ov-mobile { display: none; }
@media (max-width: 640px) {
  .hero .bg-desktop, .hero .glow-desktop, .hero .ov-desktop { display: none; }
  .hero .bg-mobile, .hero .glow-mobile, .hero .ov-mobile { display: block; }
  .hero .ov-mobile { background: linear-gradient(90deg, rgba(243, 246, 250, 0.94) 0%, rgba(243, 246, 250, 0.92) 55%, rgba(243, 246, 250, 0.74) 82%, rgba(243, 246, 250, 0.3) 100%); }
}
.hero .in { position: relative; z-index: 2; width: 100%; min-width: 0; padding: 40px 8px 46px; }
.hero .crumb { font-size: 12px; color: var(--dim); margin-bottom: 14px; }
.hero .crumb a:hover { color: var(--navy); }
.hero .ey { font-size: 12px; letter-spacing: 4px; color: var(--navy); font-weight: 700; }
.hero h1 { font-size: clamp(28px, 5vw, 44px); font-weight: 900; color: var(--ink); line-height: 1.15; margin: 10px 0; }
.hero p { width: 100%; color: #41506b; max-width: 640px; font-weight: 300; }
.subnav { position: sticky; top: 64px; z-index: 30; background: rgba(255, 255, 255, 0.94); backdrop-filter: blur(8px); border-bottom: 1px solid var(--line); }
.subnav-in { display: flex; gap: 6px; overflow-x: auto; padding-top: 12px; padding-bottom: 12px; }
.subnav a { flex: none; font-size: 13px; color: var(--muted); padding: 8px 14px; border-radius: 20px; white-space: nowrap; transition: 0.16s; }
.subnav a:hover { color: var(--navy); background: var(--bg2); }
.subnav a.on { color: #fff; background: var(--navy); font-weight: 700; }

/* guide */
.guide-wrap { padding-bottom: 0; }
.guide { background: linear-gradient(120deg, #f4ecfb, #ece1f7); border: 1px solid #e4d3f2; border-radius: 18px; padding: 28px 32px; }
.guide h2 { font-size: clamp(18px, 2.4vw, 22px); font-weight: 900; color: var(--purple); margin-bottom: 8px; }
.guide p { color: var(--muted); font-weight: 300; max-width: 780px; }

.shead { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 22px; flex-wrap: wrap; }
.shead .sub { font-size: 12px; letter-spacing: 2px; color: var(--dim); font-weight: 700; text-transform: uppercase; }
.shead .cn { font-size: clamp(20px, 2.6vw, 26px); font-weight: 900; color: var(--ink); }
.shead .desc { color: var(--muted); font-size: 13px; font-weight: 300; max-width: 560px; margin-top: 4px; }

/* grid */
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
@media (max-width: 640px) {
  .subnav { top: 64px; }
  .guide { padding: 22px 20px; }
}
@media (max-width: 520px) {
  .grid { grid-template-columns: 1fr; }
}
</style>
