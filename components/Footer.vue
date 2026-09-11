<template>
  <footer class="foot1">
    <div class="foot">
      <div class="col-brand">
        <div class="logo-wrap">
          <img :src="logoSrc" :alt="logoAlt" />
        </div>
        <div>美邁車用電子有限公司</div>
        <div>日本 Clarion 歌樂 台灣總經銷</div>
        <div class="contact">
          ☎ {{ websiteInfo.tel }}　·　✉ {{ websiteInfo.email }}<br />
          📍 {{ websiteInfo.address }}
        </div>
        <div class="social">
          <a :href="websiteInfo.facebook" target="_blank" rel="noopener" aria-label="Facebook">
            <font-awesome-icon :icon="['fab', 'square-facebook']" />
          </a>
          <a :href="websiteInfo.instagram" target="_blank" rel="noopener" aria-label="Instagram">
            <font-awesome-icon :icon="['fab', 'instagram']" />
          </a>
          <a :href="websiteInfo.youtube" target="_blank" rel="noopener" aria-label="YouTube">
            <font-awesome-icon :icon="['fab', 'square-youtube']" />
          </a>
        </div>
      </div>

      <div>
        <div class="hd">{{ $t('footer.products') }}</div>
        <div><NuxtLink to="/clarion/overview">{{ $t('footer.clarionLink') }}</NuxtLink> ・ <NuxtLink to="/mm/overview">{{ $t('footer.mmLink') }}</NuxtLink></div>
      </div>

      <div>
        <div class="hd">{{ $t('footer.support') }}</div>
        <div><NuxtLink to="/qa">{{ $t('footer.qa') }}</NuxtLink> · <NuxtLink to="/partner">{{ $t('footer.dealers') }}</NuxtLink></div>
        <div><NuxtLink to="/download">{{ $t('footer.download') }}</NuxtLink></div>
      </div>

      <div>
        <div class="hd">{{ $t('footer.about') }}</div>
        <div><NuxtLink to="/about">{{ $t('footer.brandStory') }}</NuxtLink></div>
        <div>clarion.meimai.com.tw</div>
      </div>
    </div>
    <div class="copy">{{ websiteInfo.copyright || 'Copyright © 2026 MEIMAI. All Rights Reserved' }}</div>

    <button
      class="to-top"
      :class="{ show: showToTop }"
      type="button"
      :aria-label="$t('home.backToTop')"
      :title="$t('home.backToTop')"
      @click="backToTop"
    >
      <span class="knob">
        <span class="ring"></span>
        <svg class="arw" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 19V6M12 6l-6 6M12 6l6 6" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
    </button>
  </footer>
</template>

<script setup>
import { reactive, ref, onMounted, onBeforeUnmount, computed } from 'vue'
import logoCobrandWhite from '~/assets/img/Header/logo-cobrand-white.svg'
import logoClarionWhite from '~/assets/img/Header/logo-clarion-white.svg'
import logoMMWhite from '~/assets/img/Header/logo-mm-white.svg'

const websiteInfo = reactive({})
const { $axios } = useNuxtApp()
const route = useRoute()

// 依目前路徑切換頁尾 logo：Clarion 專區 / MM 專區 / 共用頁（雙品牌合併版）
const brandZone = computed(() => {
  if (route.path.startsWith('/clarion')) return 'clarion'
  if (route.path.startsWith('/mm')) return 'mm'
  return 'cobrand'
})
const logoSrc = computed(() => {
  if (brandZone.value === 'clarion') return logoClarionWhite
  if (brandZone.value === 'mm') return logoMMWhite
  return logoCobrandWhite
})
const logoAlt = computed(() => {
  if (brandZone.value === 'clarion') return 'Clarion 歌樂'
  if (brandZone.value === 'mm') return 'MM 美邁'
  return 'Clarion × MM 美邁'
})

onMounted(() => {
  $axios.get('/website').then((response) => {
    const result = response.data.result
    if (result) {
      Object.assign(websiteInfo, result)
    }
  })
})

// 捲動超過一屏的 60% 才淡入，一進站不要就掛在畫面上
const showToTop = ref(false)
function onScroll() {
  showToTop.value = window.scrollY > (window.innerHeight || 800) * 0.6
}
onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

function backToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
.foot1 {
  background: #0d1016;
  color: #8f9bab;
  padding: 44px 0 24px;
  font-size: 13px;
  position: relative;
}
.foot {
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 26px;
  display: flex;
  justify-content: space-between;
  gap: 30px;
  flex-wrap: wrap;
}
.foot a {
  color: #8f9bab;
  text-decoration: none;
}
.foot a:hover {
  color: #fff;
}
.col-brand {
  max-width: 300px;
}
.logo-wrap {
  margin-bottom: 10px;
}
.logo-wrap img {
  height: 24px;
  width: auto;
  display: block;
}
.hd {
  color: #fff;
  margin-bottom: 8px;
  font-weight: 500;
}
.contact {
  font-size: 12px;
  line-height: 1.9;
  margin-top: 10px;
}
.social {
  display: flex;
  gap: 9px;
  margin-top: 14px;
}
.social a {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid #2a3644;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #cbd3df;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.social a:hover {
  background: #007abe;
  color: #fff;
  border-color: #007abe;
}
.copy {
  max-width: 1080px;
  margin: 26px auto 0;
  padding: 16px 26px 0;
  border-top: 1px solid #20242c;
  text-align: center;
  font-size: 12px;
  color: #6b7684;
}
/* ── 回到頂部：音旋按鈕 ──────────────────────────────
   預設＝深色旋鈕、細外環；滑過＝外環亮 Clarion Azzurro 藍光暈；
   點擊＝旋鈕微縮＋藍光擴散。捲動一段才淡入。 */
.to-top {
  position: fixed;
  right: 22px;
  bottom: 22px;
  z-index: 60;
  width: 52px;
  height: 52px;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  opacity: 0;
  visibility: hidden;
  transform: translateY(14px);
  transition: opacity 0.35s ease, transform 0.35s ease, visibility 0.35s;
}
.to-top.show { opacity: 1; visibility: visible; transform: none; }
.to-top .knob {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  color: #fff;
  background: radial-gradient(120% 120% at 32% 26%, #3a4450 0%, #212832 42%, #141a22 100%);
  box-shadow: 0 6px 18px rgba(8, 12, 18, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.09);
  transition: transform 0.22s cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 0.28s ease;
}
.to-top .ring {
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.16);
  transition: border-color 0.28s ease, box-shadow 0.28s ease;
}
.to-top .arw {
  position: relative;
  width: 21px;
  height: 21px;
  transition: transform 0.28s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.to-top:hover .knob {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(8, 12, 18, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.12);
}
.to-top:hover .ring {
  border-color: #007abe;
  box-shadow: 0 0 0 3px rgba(0, 122, 190, 0.18), 0 0 16px rgba(0, 122, 190, 0.45);
}
.to-top:hover .arw { transform: translateY(-2px); }
.to-top:focus-visible .ring { border-color: #007abe; box-shadow: 0 0 0 3px rgba(0, 122, 190, 0.28); }
.to-top:active .knob { transform: scale(0.94); }
.to-top:active .ring { box-shadow: 0 0 0 6px rgba(0, 122, 190, 0.14), 0 0 22px rgba(0, 122, 190, 0.55); }
@media (max-width: 640px) {
  .to-top { right: 14px; bottom: 14px; width: 44px; height: 44px; }
  .to-top .arw { width: 18px; height: 18px; }
}
@media (prefers-reduced-motion: reduce) {
  .to-top, .to-top .knob, .to-top .arw, .to-top .ring { transition: none; }
}
</style>
