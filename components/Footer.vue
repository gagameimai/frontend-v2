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
        <!-- 後台沒填的社群就整個不要輸出；沒有 href 的 <a> 不算連結，爬蟲與 AI 代理會讀到空連結 -->
        <div class="social">
          <a v-if="websiteInfo.facebook" :href="websiteInfo.facebook" target="_blank" rel="noopener" aria-label="Facebook" class="soc-fb">
            <font-awesome-icon :icon="['fab', 'facebook-f']" />
          </a>
          <a v-if="websiteInfo.instagram" :href="websiteInfo.instagram" target="_blank" rel="noopener" aria-label="Instagram" class="soc-ig">
            <font-awesome-icon :icon="['fab', 'instagram']" />
          </a>
          <a v-if="websiteInfo.youtube" :href="websiteInfo.youtube" target="_blank" rel="noopener" aria-label="YouTube" class="soc-yt">
            <font-awesome-icon :icon="['fab', 'youtube']" />
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
        <div><NuxtLink to="/contentPolicy">{{ $t('footer.contentPolicy') }}</NuxtLink></div>
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
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useWebsiteInfo } from '~/composables/useWebsiteInfo'
import logoCobrandWhite from '~/assets/img/Header/logo-cobrand-white.svg'

// 頁尾的電話／Email／地址／社群連結（NAP：名稱、地址、電話）。
// 這個站是靜態產生的，原本只在 onMounted 用 axios 抓，所以產出的 HTML 裡這幾欄是空的——
// 真人等 JS 載完會看到，但搜尋引擎爬蟲與 AI 代理讀到的是空的，三個社群連結連 href 都沒有。
// 改成：build 當下先抓一次烘進 HTML（爬蟲讀得到）＋ 掛載後再抓一次最新的（後台改了馬上生效）。
// 寫法比照 composables/useListBanner.js，不用 await，避免這個元件變成 async component。
const { data: websiteData, refresh: refreshWebsite } = useWebsiteInfo()
const websiteInfo = computed(() => websiteData.value?.result || {})

// 頁尾 logo 全站固定用聯名版（Clarion × MM）：頁尾代表公司（美邁車用電子／日本 Clarion 歌樂 台灣總經銷），
// 不隨 /clarion、/mm 專區切換，避免換頁時 logo 跳來跳去（2026-09-28 老闆指示）
const logoSrc = computed(() => websiteInfo.value.logo_footer || logoCobrandWhite)
const logoAlt = 'Clarion × MM 美邁'

// 靜態 HTML 先給畫面，掛載後立刻更新到最新（後台改了公司資料不用重新 generate 也會生效）
onMounted(() => {
  refreshWebsite()
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
  background: var(--site-foot, var(--site-dark, #0d1016));
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
/* 文字連結：頁尾的連結是同一行用「・」隔開、上下還有第二行，
   如果用 ::after 疊 44px 高的透明區塊，上下兩行的可點範圍會互相蓋住、
   變成點到上面那條卻跳到下面那頁。所以這裡改用實際的內距把行距撐開。 */
.foot a {
  display: inline-block;
  padding: 13px 0;
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
/* ── 手機觸控目標 ≥44×44（2026-09-18）──────────────────────────
   視覺大小不變，用 ::after 把「可以點到的範圍」撐到 44×44。
   直接把圖示改大會動到版面，所以用這個做法。 */
.social a {
  position: relative;
}
.social a::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
}
/* 社群圖示用各平台原廠樣式（2026-09-30，不套公司色）：實心原廠色圓鈕＋白色標誌，滑過去稍微變亮 */
.social a.soc-fb { background: #1877f2; color: #fff; border-color: #1877f2; }
.social a.soc-ig { background: linear-gradient(45deg, #f09433, #dc2743 55%, #bc1888); color: #fff; border-color: #dc2743; }
.social a.soc-yt { background: #ff0000; color: #fff; border-color: #ff0000; }
.social a.soc-fb:hover, .social a.soc-ig:hover, .social a.soc-yt:hover { filter: brightness(1.12); }
.copy {
  max-width: 1080px;
  margin: 26px auto 0;
  padding: 16px 26px 0;
  border-top: 1px solid #20242c;
  text-align: center;
  font-size: 12px;
  color: #6b7684;
}
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
  border-color: var(--site-accent, #007abe);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--site-accent, #007abe) 18.0%, transparent), 0 0 16px color-mix(in srgb, var(--site-accent, #007abe) 45.0%, transparent);
}
.to-top:hover .arw { transform: translateY(-2px); }
.to-top:focus-visible .ring { border-color: var(--site-accent, #007abe); box-shadow: 0 0 0 3px color-mix(in srgb, var(--site-accent, #007abe) 28.0%, transparent); }
.to-top:active .knob { transform: scale(0.94); }
.to-top:active .ring { box-shadow: 0 0 0 6px color-mix(in srgb, var(--site-accent, #007abe) 14.0%, transparent), 0 0 22px color-mix(in srgb, var(--site-accent, #007abe) 55.0%, transparent); }
@media (max-width: 640px) {
  .to-top { right: 14px; bottom: 14px; width: 44px; height: 44px; }
  .to-top .arw { width: 18px; height: 18px; }
}
@media (prefers-reduced-motion: reduce) {
  .to-top, .to-top .knob, .to-top .arw, .to-top .ring { transition: none; }
}
</style>
