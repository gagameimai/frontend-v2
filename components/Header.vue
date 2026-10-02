<template>
  <div class="c-header" :class="{ floating }">
    <header :class="{ solid: floating && isSolid }">
      <div class="nav">
        <NuxtLink to="/" class="logo" :aria-label="logoAlt">
          <span class="logo-badge">
            <img class="lg-dark" :src="logoSrc" :alt="logoAlt" :style="{ height: logoHeight }" />
            <img v-if="floating" class="lg-white" :src="logoSrcWhite" alt="" aria-hidden="true" :style="{ height: logoHeight }" />
          </span>
        </NuxtLink>

        <nav class="menu" :class="{ open: menuOpen }" @click="onMenuClick">
          <div class="has-drop" :class="{ open: openKey === 'clarion' }">
            <!-- 用一般 <a> 而不是 NuxtLink：NuxtLink 自己的換頁動作會比我們的攔截先跑，
                 手機選單裡點了就直接跳走、攔不住（之前的 bug）。換頁一律由 onDropTriggerClick 決定。 -->
            <a href="/clarion/overview" class="drop-trigger" :aria-expanded="openKey === 'clarion' ? 'true' : 'false'" @click="onDropTriggerClick('clarion', '/clarion/overview', $event)">
              <span class="cn">{{ $t('header.clarion') }} <span class="caret">▼</span></span>
              <span class="sub">{{ $t('header.clarionSub') }}</span>
            </a>
            <div class="drop">
              <small>{{ $t('header.clarionMenuTitle') }}</small>
              <div class="drop-grid">
                <NuxtLink v-for="c in clarionMenu" :key="c.key" :to="c.to">{{ c.text }}</NuxtLink>
              </div>
              <NuxtLink to="/clarion/overview" class="view-all">{{ $t('header.clarionViewAll') }}</NuxtLink>
            </div>
          </div>

          <div class="has-drop" :class="{ open: openKey === 'mm' }">
            <a href="/mm/overview" class="drop-trigger" :aria-expanded="openKey === 'mm' ? 'true' : 'false'" @click="onDropTriggerClick('mm', '/mm/overview', $event)">
              <span class="cn">{{ $t('header.mm') }} <span class="caret">▼</span></span>
              <span class="sub">{{ $t('header.mmSub') }}</span>
            </a>
            <div class="drop drop-mm">
              <small>{{ $t('header.mmMenuTitle') }}</small>
              <div class="drop-grid">
                <NuxtLink v-for="c in mmMenu" :key="c.key" :to="c.to">{{ c.text }}</NuxtLink>
              </div>
              <NuxtLink to="/mm/overview" class="view-all">{{ $t('header.mmViewAll') }}</NuxtLink>
            </div>
          </div>

          <a href="/#cases">
            <span class="cn">{{ $t('header.cases') }}</span>
            <span class="sub">{{ $t('header.casesSub') }}</span>
          </a>

          <NuxtLink to="/partner" class="cta">
            <span class="cn">{{ $t('header.dealers') }}</span>
            <span class="sub">{{ $t('header.dealersSub') }}</span>
          </NuxtLink>

          <span class="lang">
            <button
              type="button"
              class="lang-btn"
              :class="{ active: locale === 'zh-tw' }"
              @click="setLocale('zh-tw')"
            >
              {{ $t('header.langZh') }}
            </button>
            <span class="sep">/</span>
            <button
              type="button"
              class="lang-btn"
              :class="{ active: locale === 'en' }"
              @click="setLocale('en')"
            >
              {{ $t('header.langEn') }}
            </button>
          </span>
        </nav>

        <!-- 2026-10：選單按鈕改成「等化器直條」：滑過直條跳動並轉 Clarion 藍，點開旋鈕轉 90°、直條合成 ✕ -->
        <button
          type="button"
          class="burger"
          :class="{ on: menuOpen }"
          :aria-label="menuOpen ? '關閉選單' : '開啟選單'"
          :aria-expanded="menuOpen ? 'true' : 'false'"
          @click="toggleMenu"
        >
          <span class="knob" aria-hidden="true"><span class="eq"><u></u><u></u><u></u></span></span>
        </button>
      </div>
    </header>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import logoCobrand from '~/assets/img/Header/logo-cobrand-light.svg'
import logoClarion from '~/assets/img/Header/logo-clarion-dark.svg'
import logoMM from '~/assets/img/Header/logo-mm-dark.svg'
import logoCobrandWhite from '~/assets/img/Header/logo-cobrand-white.svg'
import logoClarionWhite from '~/assets/img/Header/logo-clarion-white.svg'
import logoMMWhite from '~/assets/img/Header/logo-mm-white.svg'
import { useBrandZone } from '~/composables/useBrandZone'
import { useWebsiteInfo } from '~/composables/useWebsiteInfo'

// floating＝true 時表頭一開始透明浮在頁面最上面的 Banner 上，捲動/選單展開/下拉展開後才轉白底
// （目前只有首頁在用，見 layouts/default.vue）
const props = defineProps({
  floating: { type: Boolean, default: false }
})

const menuOpen = ref(false)
// 手機版目前展開中的下拉選單（'clarion' / 'mm' / null），手機沒有 hover，改用點擊控制
const openKey = ref(null)

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
  openKey.value = null
}

// 「Clarion 歌樂／MM 美邁」這種有子選單的主標題：
// ・手機（≤640px）：不能點（CSS 關掉點擊），底下的子分類直接全部列出來，不會再有浮在上面的半透明下拉。
// ・平板漢堡選單（641～1024px）：點了只展開／收合子選單，不換頁、也不關掉整個選單。
// ・電腦（漢堡選單沒開）：維持原本點了換到總覽頁、滑過顯示子選單。
const router = useRouter()
const onDropTriggerClick = (key, path, e) => {
  // 電腦上按著 Ctrl／⌘ 點、或按滑鼠中鍵＝想開新分頁，交給瀏覽器自己處理
  if (!menuOpen.value && (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0)) return
  e.preventDefault()
  if (menuOpen.value) {
    e.stopPropagation()
    openKey.value = openKey.value === key ? null : key
    return
  }
  router.push(path)
}

// RWD 漢堡選單展開時，點下拉選單裡的子分類連結或其他連結，才把整個選單收起來
const onMenuClick = (e) => {
  if (e.target.closest('a')) {
    menuOpen.value = false
    openKey.value = null
  }
}
const { locale, setLocale } = useI18n()

// 依目前路徑判斷：Clarion 專區用 Clarion 單標；MM 專區與共用頁（首頁/經銷據點/常見問題等）一律用聯名款（Clarion × MM）。
// 不再單獨顯示 MM 單標（老闆 2026-09-29 決定，與草稿 V2 一致：V2 表頭只有 Clarion 單標與聯名款兩種）。
// （與全站 favicon 共用同一份判斷邏輯，見 composables/useBrandZone.js）
const brandZone = useBrandZone()
// 後台「產品管理 ▸ 產品類別開關」：選單項目的顯示、順序、名稱
const { t: tr } = useI18n()
const clarionCats = useCategories('clarion')
const mmCats = useCategories('mm')
const CLARION_LINKS = { gl: '/clarion/gl', oem: '/clarion/oem', audio: '/audioAccessories', camera: '/clarion/camera', din: '/headUnit', dvr: '/clarion/dashcam', headrest: '/headrest', portable: '/portable' }
const MM_LINKS = { android: '/mm/me', oem: '/mm/oem', frame: '/carFrame', safety: '/safety', dvr: '/mm/dashcam', camera: '/mm/camera', fitting: '/fitting' }
const clarionMenu = computed(() =>
  clarionCats.list.value.filter((r) => r.on).map((r) => ({
    key: r.key, to: CLARION_LINKS[r.key], text: clarionCats.label(r.key, tr('header.clarionItems.' + r.key))
  }))
)
const mmMenu = computed(() =>
  mmCats.list.value.filter((r) => r.on).map((r) => ({
    key: r.key, to: MM_LINKS[r.key], text: mmCats.label(r.key, tr('header.mmItems.' + r.key))
  }))
)

// 後台「網站基本設定 ▸ 全站標誌圖片」有上傳就用上傳的，沒上傳用內建預設
const { data: siteData } = useWebsiteInfo()
const siteLogo = (k) => siteData.value?.result?.[k] || ''
const logoSrc = computed(() => {
  if (brandZone.value === 'clarion') return siteLogo('logo_clarion_dark') || logoClarion
  return siteLogo('logo_cobrand_dark') || logoCobrand
})
const logoAlt = computed(() => {
  if (brandZone.value === 'clarion') return 'Clarion 歌樂'
  return 'Clarion × MM 美邁'
})
// 兩種 logo 長寬比不同，比照草稿的高度設定，讓視覺重量一致（聯名版 V4 含 meimai@ 與副標，比舊版高，故 30px 才與 Clarion 單標視覺等寬）
const logoHeight = computed(() => {
  if (brandZone.value === 'clarion') return '24px'
  return '30px'
})
// floating 表頭透明時用白色版 logo（深色版先淡出），轉白底後換回深色版
const logoSrcWhite = computed(() => {
  if (brandZone.value === 'clarion') return siteLogo('logo_clarion_white') || logoClarionWhite
  return siteLogo('logo_cobrand_white') || logoCobrandWhite
})

// floating 表頭：捲動超過一定距離就轉白底（手機選單展開也算，見 isSolid）
const scrolled = ref(false)
let onScroll = null
onMounted(() => {
  if (props.floating) {
    onScroll = () => {
      scrolled.value = window.scrollY > 60
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
  }
})
onUnmounted(() => {
  if (onScroll) window.removeEventListener('scroll', onScroll)
})
const isSolid = computed(() => scrolled.value || menuOpen.value)
</script>

<style scoped>
.c-header {
  --ink: #0d1b2e;
  --text: #1b2431;
  --muted: #5b6675;
  --dim: #93a0b0;
  --bg: #fff;
  --bg2: var(--site-bg2, #f5f7fa);
  --line: #e6ebf1;
  --navy: var(--site-accent, #007abe);
  position: sticky;
  top: 0;
  z-index: 50;
}
a {
  color: inherit;
  text-decoration: none;
}
.lang {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: var(--muted);
  margin-left: 16px;
}
.lang-btn {
  background: none;
  border: 0;
  padding: 0;
  font: inherit;
  color: var(--muted);
  cursor: pointer;
  transition: color 0.2s;
}
.lang-btn:hover {
  color: var(--ink);
}
.lang-btn.active {
  color: var(--ink);
  font-weight: 700;
}
.lang .sep {
  color: #c7cfd9;
}
/* header/nav */
header {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line);
}
.nav {
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 26px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}
.logo {
  display: inline-flex;
  align-items: center;
}
.logo-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 8px;
  padding: 6px 12px;
}
.logo-badge img {
  height: 26px;
  width: auto;
  display: block;
  transition: opacity 0.35s ease;
}
.menu {
  display: flex;
  gap: 22px;
  align-items: center;
  font-size: 13px;
  color: var(--muted);
  white-space: nowrap;
}
.menu a:hover {
  color: var(--ink);
}
.menu > a,
.menu .has-drop > a {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.16;
  text-align: center;
  gap: 4px; /* 大字（歌樂／美邁）與下面小字（クラリオン／MEIMAI）拉開一點，不要貼在一起 */
}
.menu .cn,
.menu .sub {
  white-space: nowrap;
}
.menu .sub {
  font-size: 9px;
  letter-spacing: 1.5px;
  color: #a7b0bd;
  font-weight: 400;
  text-transform: uppercase;
}
.menu .cta {
  background: var(--navy);
  color: #fff;
  padding: 6px 16px;
  border-radius: 8px;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  line-height: 1.1;
}
.menu .cta .sub {
  color: #4aa3d6;
}
/* ── 手機觸控目標 ≥44×44（2026-09-18）──────────────────────────
   視覺大小不變，用 ::after 把「可以點到的範圍」撐到 44×44。
   直接把圖示改大會動到版面，所以用這個做法。 */
.burger {
  display: none;
  min-width: 44px;
  min-height: 44px;
  font-size: 22px;
  line-height: 1;
  background: none;
  border: 0;
  cursor: pointer;
  padding: 0;
}
/* 選單按鈕：三根高低不同的等化器直條（顏色用 currentColor，跟著表頭變色：
   首頁頂端透明時是白色、往下滾變白底後是深色、其他頁白底也是深色）。
   滑過／鍵盤聚焦：直條轉 Clarion 藍 var(--site-accent, #007abe) 並跳動；展開：直條合成 ✕、整個轉 90°。 */
.burger {
  color: var(--ink);
}
.burger .knob {
  position: relative;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  transition: transform 0.4s cubic-bezier(0.3, 1.4, 0.5, 1);
}
.burger:active .knob {
  transform: scale(0.92);
}
.burger.on .knob {
  transform: rotate(90deg);
}
.burger .eq {
  position: relative;
  display: block;
  width: 20px;
  height: 18px;
}
.burger .eq u {
  position: absolute;
  bottom: 0;
  width: 4px;
  border-radius: 2px;
  background: currentColor;
  text-decoration: none;
  transition: height 0.3s, left 0.3s, bottom 0.3s, width 0.3s, transform 0.3s, opacity 0.2s, background 0.25s;
}
.burger .eq u:nth-child(1) { left: 0; height: 9px; }
.burger .eq u:nth-child(2) { left: 8px; height: 18px; }
.burger .eq u:nth-child(3) { left: 16px; height: 13px; }
.burger:hover .eq u,
.burger:focus-visible .eq u {
  background: var(--site-accent, #007abe);
}
.burger:hover .eq u:nth-child(1) { animation: eqA 0.8s infinite ease-in-out; }
.burger:hover .eq u:nth-child(2) { animation: eqB 0.62s infinite ease-in-out; }
.burger:hover .eq u:nth-child(3) { animation: eqC 0.95s infinite ease-in-out; }
@keyframes eqA { 50% { height: 17px; } }
@keyframes eqB { 50% { height: 6px; } }
@keyframes eqC { 50% { height: 18px; } }
.burger.on .eq u {
  animation: none !important;
  background: currentColor;
  height: 22px !important;
  width: 2.4px;
  left: 8.8px !important;
  bottom: -2px;
}
.burger.on .eq u:nth-child(1) { transform: rotate(45deg); }
.burger.on .eq u:nth-child(2) { opacity: 0; }
.burger.on .eq u:nth-child(3) { transform: rotate(-45deg); }
@media (prefers-reduced-motion: reduce) {
  .burger .knob,
  .burger .eq u { transition: none; animation: none !important; }
}
@keyframes menuIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: none; }
}
.logo {
  position: relative;
}
.logo::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  min-height: 44px;
  height: 100%;
}
.has-drop {
  position: relative;
}
.has-drop::after {
  content: '';
  position: absolute;
  left: -10px;
  right: -10px;
  top: 100%;
  height: 18px;
}
.caret {
  font-size: 9px;
  opacity: 0.55;
  margin-left: 3px;
}
.drop {
  position: absolute;
  top: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%) translateY(8px);
  opacity: 0;
  visibility: hidden;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  box-shadow: 0 18px 44px rgba(13, 27, 46, 0.14);
  padding: 16px;
  min-width: 340px;
  transition: opacity 0.25s, visibility 0.25s, transform 0.25s;
  transition-delay: 0.35s;
  z-index: 60;
}
.has-drop:hover .drop,
.has-drop.open .drop {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
  transition-delay: 0s;
}
.menu:has(.has-drop:hover) .has-drop:not(:hover) .drop {
  transition-delay: 0s;
  opacity: 0;
  visibility: hidden;
}
.drop.drop-mm {
  min-width: 250px;
}
.drop small {
  display: block;
  color: var(--dim);
  font-size: 11px;
  letter-spacing: 2px;
  margin: 0 0 10px 4px;
}
.drop-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
}
.drop-grid a {
  display: block;
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 13px;
  color: var(--text);
  transition: background 0.15s, color 0.15s, padding-left 0.15s;
}
.drop-grid a:hover {
  background: var(--bg2);
  color: var(--navy);
  padding-left: 16px;
}
.view-all {
  display: none;
  margin-top: 10px;
  padding-top: 12px;
  border-top: 1px solid var(--line);
  font-size: 13px;
  font-weight: 700;
  color: var(--navy);
  text-align: center;
}
.view-all:hover {
  text-decoration: underline;
}
@media (max-width: 1024px) {
  .menu {
    display: none;
    position: absolute;
    top: 64px;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: stretch;
    background: #fff;
    padding: 12px 26px;
    gap: 2px;
    border-bottom: 1px solid var(--line);
  }
  .menu.open {
    display: flex;
    animation: menuIn 0.28s ease both;
  }
  .burger {
    display: grid;
    place-items: center;
  }
  .menu > a,
  .menu .has-drop > a {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    text-align: left;
    padding: 13px 4px;
    border-bottom: 1px solid #f0f3f6;
  }
  .menu .cta {
    flex-direction: row;
    justify-content: center;
    margin-top: 10px;
  }
  /* 手機選單裡「經銷據點」旁的小字 DEALERS 淡藍疊在藍底上看不清楚、又擠在一起，手機上不顯示 */
  .menu .cta .sub {
    display: none;
  }
  .has-drop {
    width: 100%;
  }
  .view-all {
    display: block;
  }
  .lang {
    margin-left: 0;
    padding: 13px 4px;
  }
  /* 漢堡選單裡的子選單：不再浮在上面（原本會蓋住「導入事例」「經銷據點」、還會超出畫面左邊），
     改成點了在標題底下展開、把下面的項目往下推；沒點開就完全不顯示（手機沒有 hover，避免殘影） */
  .drop,
  .drop.drop-mm {
    display: none;
    position: static;
    min-width: 0;
    width: 100%;
    transform: none;
    opacity: 1;
    visibility: visible;
    transition: none;
    box-shadow: none;
    border: 0;
    border-radius: 0;
    padding: 4px 0 10px 8px;
  }
  .has-drop.open .drop {
    display: block;
  }
  /* 2026-09-30 修正：電腦版那條「滑過就顯示下拉」的規則會把子選單往左移一半（為了在電腦上置中），
     在手機／平板上一點到或滑過子選單，整排就被往左推、左邊一半跑出畫面。這裡把位移歸零，
     而且寫成跟那條規則一樣的寫法，才蓋得過它。 */
  .has-drop:hover .drop,
  .has-drop.open .drop {
    transform: none;
    transition-delay: 0s;
  }
  /* 滑過子選單項目時，電腦版會把字往右推一點；手機上點下去會晃一下，這裡取消 */
  .drop-grid a:hover {
    padding-left: 12px;
  }
  .has-drop::after {
    display: none;
  }
  /* 桌機那條「滑到別的下拉就把這個藏起來」的規則，在觸控上會因為點過留下的 hover 狀態，把另一組子分類整個藏掉 */
  .menu:has(.has-drop:hover) .has-drop:not(:hover) .drop {
    opacity: 1;
    visibility: visible;
  }
  .has-drop.open .caret {
    display: inline-block;
    transform: rotate(180deg);
  }
}
/* 手機（≤640px）：「Clarion 歌樂」「MM 美邁」只是分組標題，不能點；子分類直接全部列出來 */
@media (max-width: 640px) {
  .menu .has-drop > a.drop-trigger {
    pointer-events: none;
    cursor: default;
    color: var(--ink);
    font-weight: 700;
    border-bottom: 0;
    padding-bottom: 4px;
  }
  .menu .has-drop > a.drop-trigger .caret {
    display: none;
  }
  .drop,
  .drop.drop-mm {
    display: block;
    padding: 0 0 10px;
    border-bottom: 1px solid #f0f3f6;
  }
  .drop small {
    display: none;
  }
  .drop-grid a {
    padding: 10px 12px;
  }
}

.c-header.floating header {
  position: relative;
  z-index: 1;
  background: transparent;
  backdrop-filter: none;
  border-bottom: 1px solid transparent;
  margin-bottom: -64px;
  transition: background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
}
.c-header.floating header::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 118px;
  z-index: -1;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.18) 62%, rgba(0, 0, 0, 0));
  opacity: 1;
  transition: opacity 0.35s ease;
}
.c-header.floating header.solid,
.c-header.floating header:has(.has-drop:hover) {
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(10px);
  border-bottom-color: var(--line);
  box-shadow: 0 2px 22px rgba(13, 27, 46, 0.07);
}
.c-header.floating header.solid::before,
.c-header.floating header:has(.has-drop:hover)::before {
  opacity: 0;
}
.c-header.floating header:not(.solid):not(:has(.has-drop:hover)) .menu > a,
.c-header.floating header:not(.solid):not(:has(.has-drop:hover)) .menu .has-drop > a {
  color: #fff;
}
.c-header.floating header:not(.solid):not(:has(.has-drop:hover)) .menu .cn {
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.45);
}
.c-header.floating header:not(.solid):not(:has(.has-drop:hover)) .menu .sub {
  color: rgba(255, 255, 255, 0.85);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.45);
}
.c-header.floating header:not(.solid):not(:has(.has-drop:hover)) .burger {
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.45);
}
.c-header.floating header:not(.solid):not(:has(.has-drop:hover)) .menu .cta {
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.75);
}
.c-header.floating header:not(.solid):not(:has(.has-drop:hover)) .menu .cta .cn {
  color: #fff;
  text-shadow: none;
}
.c-header.floating header:not(.solid):not(:has(.has-drop:hover)) .menu .cta .sub {
  color: rgba(255, 255, 255, 0.85);
  text-shadow: none;
}
.c-header.floating header:not(.solid):not(:has(.has-drop:hover)) .lang {
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.45);
}
.c-header.floating header:not(.solid):not(:has(.has-drop:hover)) .lang-btn {
  color: #fff;
}
.c-header.floating header:not(.solid):not(:has(.has-drop:hover)) .lang .sep {
  color: rgba(255, 255, 255, 0.6);
}
.c-header.floating .drop,
.c-header.floating .drop * {
  text-shadow: none;
}
.c-header.floating .logo-badge {
  position: relative;
}
.c-header.floating .logo-badge .lg-white {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.45));
}
.c-header.floating header:not(.solid):not(:has(.has-drop:hover)) .logo-badge .lg-dark {
  opacity: 0;
}
.c-header.floating header:not(.solid):not(:has(.has-drop:hover)) .logo-badge .lg-white {
  opacity: 1;
}
@media (max-width: 1024px) {
  .c-header.floating header::before {
    height: 96px;
  }
}
</style>
