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
            <NuxtLink to="/clarion/overview" @click="onDropTriggerClick('clarion', $event)">
              <span class="cn">{{ $t('header.clarion') }} <span class="caret">▼</span></span>
              <span class="sub">{{ $t('header.clarionSub') }}</span>
            </NuxtLink>
            <div class="drop">
              <small>{{ $t('header.clarionMenuTitle') }}</small>
              <div class="drop-grid">
                <NuxtLink to="/clarion/oem">{{ $t('header.clarionItems.oem') }}</NuxtLink>
                <NuxtLink to="/clarion/gl">{{ $t('header.clarionItems.gl') }}</NuxtLink>
                <NuxtLink to="/audioAccessories">{{ $t('header.clarionItems.audio') }}</NuxtLink>
                <NuxtLink to="/clarion/camera">{{ $t('header.clarionItems.camera') }}</NuxtLink>
                <NuxtLink to="/headUnit">{{ $t('header.clarionItems.din') }}</NuxtLink>
                <NuxtLink to="/clarion/dashcam">{{ $t('header.clarionItems.dvr') }}</NuxtLink>
                <!-- <NuxtLink to="/headrest">{{ $t('header.clarionItems.headrest') }}</NuxtLink> 頭枕隱藏-->
                <!-- <NuxtLink to="/portable">{{ $t('header.clarionItems.portable') }}</NuxtLink> 可攜式隱藏 -->
              </div>
              <NuxtLink to="/clarion/overview" class="view-all">{{ $t('header.clarionViewAll') }}</NuxtLink>
            </div>
          </div>

          <div class="has-drop" :class="{ open: openKey === 'mm' }">
            <NuxtLink to="/mm/overview" @click="onDropTriggerClick('mm', $event)">
              <span class="cn">{{ $t('header.mm') }} <span class="caret">▼</span></span>
              <span class="sub">{{ $t('header.mmSub') }}</span>
            </NuxtLink>
            <div class="drop" style="min-width: 250px">
              <small>{{ $t('header.mmMenuTitle') }}</small>
              <div class="drop-grid">
                <NuxtLink to="/mm/me">{{ $t('header.mmItems.android') }}</NuxtLink>
                <NuxtLink to="/mm/oem">{{ $t('header.mmItems.oem') }}</NuxtLink>
                <NuxtLink to="/carFrame">{{ $t('header.mmItems.frame') }}</NuxtLink>
                <NuxtLink to="/safety">{{ $t('header.mmItems.safety') }}</NuxtLink>
                <NuxtLink to="/mm/dashcam">{{ $t('header.mmItems.dvr') }}</NuxtLink>
                <NuxtLink to="/mm/camera">{{ $t('header.mmItems.camera') }}</NuxtLink>
                <NuxtLink to="/fitting">{{ $t('header.mmItems.fitting') }}</NuxtLink>
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

        <button class="burger" @click="toggleMenu">☰</button>
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

// 手機模式（漢堡選單開著）點「Clarion 歌樂／MM 美邁」這種有子選單的主標題：
// 只負責展開/收合該子選單，不導頁、也不把整個漢堡選單關起來。
// 桌機（漢堡選單本來就沒開）維持原本點擊直接導頁、hover 顯示子選單的行為，不受影響。
const onDropTriggerClick = (key, e) => {
  if (!menuOpen.value) return
  e.preventDefault()
  e.stopPropagation()
  openKey.value = openKey.value === key ? null : key
}

// RWD 漢堡選單展開時，點下拉選單裡的子分類連結或其他連結，才把整個選單收起來
const onMenuClick = (e) => {
  if (e.target.closest('a')) {
    menuOpen.value = false
    openKey.value = null
  }
}
const { locale, setLocale } = useI18n()

// 依目前路徑判斷是 Clarion 專區、MM 專區，還是共用頁（首頁/經銷據點/常見問題等），切換對應 logo
// （與全站 favicon 共用同一份判斷邏輯，見 composables/useBrandZone.js）
const brandZone = useBrandZone()
const logoSrc = computed(() => {
  if (brandZone.value === 'clarion') return logoClarion
  if (brandZone.value === 'mm') return logoMM
  return logoCobrand
})
const logoAlt = computed(() => {
  if (brandZone.value === 'clarion') return 'Clarion 歌樂'
  if (brandZone.value === 'mm') return 'MM 美邁'
  return 'Clarion × MM 美邁'
})
// 三種 logo 長寬比不同，比照草稿的高度設定，讓視覺重量一致
const logoHeight = computed(() => {
  if (brandZone.value === 'clarion') return '24px'
  if (brandZone.value === 'mm') return '30px'
  return '26px'
})
// floating 表頭透明時用白色版 logo（深色版先淡出），轉白底後換回深色版
const logoSrcWhite = computed(() => {
  if (brandZone.value === 'clarion') return logoClarionWhite
  if (brandZone.value === 'mm') return logoMMWhite
  return logoCobrandWhite
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
  --bg2: #f5f7fa;
  --line: #e6ebf1;
  --navy: #007ABE;
  position: sticky;
  top: 0;
  z-index: 50;
}
a {
  color: inherit;
  text-decoration: none;
}
/* 語言切換（原本上方灰色橫條移除，改放表頭選單右側，比照草稿樣式） */
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
  gap: 1px;
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
.burger {
  display: none;
  font-size: 22px;
  background: none;
  border: 0;
  cursor: pointer;
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
  }
  .burger {
    display: block;
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
}

/* ── floating 表頭（目前只有首頁在用）：透明浮在 Banner 上，
   捲動 / 選單展開（isSolid）/ 滑到下拉選單（:has 判斷）時才轉白底 ── */
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
/* 頂端（透明狀態）：第一層選單文字、語言、漢堡轉白字，才看得清楚 */
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
/* 下拉面板永遠白底深字，不受上面白字規則影響 */
.c-header.floating .drop,
.c-header.floating .drop * {
  text-shadow: none;
}
/* logo：透明時顯示白色版，轉白底後淡出換回深色版 */
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
