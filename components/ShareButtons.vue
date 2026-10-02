<template>
  <!-- LINE 圖示改用 Font Awesome 官方 LINE 品牌圖形（置中、四邊等距）。
       2026-09：有些瀏覽器（例如 Brave、開了防追蹤／廣告過濾的 Edge、Opera、裝了擋廣告外掛的 Chrome）
       會把名字像「share-buttons」「fa-facebook」的東西當成社群追蹤元件自動藏起來，整塊變空白。
       所以：① class 改成中性名稱 ② 圖示改成直接畫在頁面裡的 SVG，不靠 Font Awesome 圖示元件。 -->
  <div class="pd-acts">
    <button type="button" class="pd-act pd-fb" :aria-label="$t('share.facebook')" @click="shareFacebook">
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.25-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1z" />
      </svg>
      <span class="tip">{{ $t('share.facebook') }}</span>
    </button>
    <button type="button" class="pd-act pd-ln" :aria-label="$t('share.line')" @click="shareLine">
      <svg viewBox="0 0 512 512" width="20" height="20" aria-hidden="true" focusable="false">
        <path fill="currentColor" fill-rule="evenodd" d="M311 196.8v81.3c0 2.1-1.6 3.7-3.7 3.7h-13c-1.3 0-2.4-.7-3-1.5l-37.3-50.3v48.2c0 2.1-1.6 3.7-3.7 3.7h-13c-2.1 0-3.7-1.6-3.7-3.7V196.9c0-2.1 1.6-3.7 3.7-3.7h12.9c1.1 0 2.4 .6 3 1.6l37.3 50.3V196.9c0-2.1 1.6-3.7 3.7-3.7h13c2.1-.1 3.8 1.6 3.8 3.5zm-93.7-3.7h-13c-2.1 0-3.7 1.6-3.7 3.7v81.3c0 2.1 1.6 3.7 3.7 3.7h13c2.1 0 3.7-1.6 3.7-3.7V196.8c0-1.9-1.6-3.7-3.7-3.7zm-31.4 68.1H150.3V196.8c0-2.1-1.6-3.7-3.7-3.7h-13c-2.1 0-3.7 1.6-3.7 3.7v81.3c0 1 .3 1.8 1 2.5c.7 .6 1.5 1 2.5 1h52.2c2.1 0 3.7-1.6 3.7-3.7v-13c0-1.9-1.6-3.7-3.5-3.7zm193.7-68.1H327.3c-1.9 0-3.7 1.6-3.7 3.7v81.3c0 1.9 1.6 3.7 3.7 3.7h52.2c2.1 0 3.7-1.6 3.7-3.7V265c0-2.1-1.6-3.7-3.7-3.7H344V247.7h35.5c2.1 0 3.7-1.6 3.7-3.7V230.9c0-2.1-1.6-3.7-3.7-3.7H344V213.5h35.5c2.1 0 3.7-1.6 3.7-3.7v-13c-.1-1.9-1.7-3.7-3.7-3.7zM512 93.4V419.4c-.1 51.2-42.1 92.7-93.4 92.6H92.6C41.4 511.9-.1 469.8 0 418.6V92.6C.1 41.4 42.2-.1 93.4 0H419.4c51.2 .1 92.7 42.1 92.6 93.4zM441.6 233.5c0-83.4-83.7-151.3-186.4-151.3s-186.4 67.9-186.4 151.3c0 74.7 66.3 137.4 155.9 149.3c21.8 4.7 19.3 12.7 14.4 42.1c-.8 4.7-3.8 18.4 16.1 10.1s107.3-63.2 146.5-108.2c27-29.7 39.9-59.8 39.9-93.1z" />
      </svg>
      <span class="tip">{{ $t('share.line') }}</span>
    </button>
    <button
      type="button"
      class="pd-act"
      :class="{ copied }"
      :aria-label="$t('share.copyLink')"
      @click="copyLink"
    >
      <svg v-if="copied" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
        <path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <svg v-else viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
        <path d="M10.2 13.8a3.9 3.9 0 0 0 5.5 0l3-3a3.9 3.9 0 0 0-5.5-5.5l-1.3 1.3M13.8 10.2a3.9 3.9 0 0 0-5.5 0l-3 3a3.9 3.9 0 0 0 5.5 5.5l1.3-1.3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <span class="tip">{{ copied ? $t('share.copied') : $t('share.copyLink') }}</span>
    </button>
  </div>
</template>

<script setup>
// 共用分享按鈕：商品詳情頁的 Facebook 分享／LINE 分享／複製連結。
// title 目前只用來當按鈕的無障礙標籤補充，不影響分享內容
// （FB／LINE 分享出去的標題與縮圖是抓網頁本身的 og:title / og:image，各頁已經用 useHead 設好了）。
defineProps({
  title: { type: String, default: '' }
})

const pageUrl = ref('')
onMounted(() => {
  pageUrl.value = window.location.href
})

const shareFacebook = () => {
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl.value)}`
  window.open(url, '_blank', 'noopener,noreferrer,width=600,height=520')
}

const shareLine = () => {
  const url = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(pageUrl.value)}`
  window.open(url, '_blank', 'noopener,noreferrer,width=500,height=600')
}

const copied = ref(false)
let copiedTimer = null
const copyLink = async () => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(pageUrl.value)
    } else {
      // 舊瀏覽器或非 https 環境的備援寫法
      const el = document.createElement('textarea')
      el.value = pageUrl.value
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    copied.value = true
    clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (e) {
    // 複製失敗就不特別提示，避免打擾使用者
  }
}

onBeforeUnmount(() => {
  clearTimeout(copiedTimer)
})
</script>

<style scoped>
.pd-acts {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 4px 0 18px;
}
.pd-act {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px solid var(--line, #e6ebf1);
  color: var(--ink, #1b2431);
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  transition: border-color 0.16s, color 0.16s, transform 0.16s;
}
/* ── 手機觸控目標 ≥44×44（2026-09-18）──────────────────────────
   視覺大小不變，用 ::after 把「可以點到的範圍」撐到 44×44。
   直接把圖示改大會動到版面，所以用這個做法。 */
.pd-act svg {
  display: block;
  flex: none;
}
.pd-act::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
}
.pd-act:hover {
  border-color: var(--navy, var(--site-accent, #007abe));
  color: var(--navy, var(--site-accent, #007abe));
  transform: translateY(-2px);
}
.pd-act.pd-fb { color: #1877f2; }
.pd-act.pd-ln { color: #06c755; }
.pd-act.pd-fb:hover { border-color: #1877f2; color: #1877f2; background: #f2f7ff; }
.pd-act.pd-ln:hover { border-color: #06c755; color: #06c755; background: #f1fbf5; }
.pd-act.copied {
  border-color: var(--navy, var(--site-accent, #007abe));
  color: var(--navy, var(--site-accent, #007abe));
}
.pd-act .tip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  background: var(--dark, #0d1016);
  color: #fff;
  font-size: 11px;
  padding: 4px 9px;
  border-radius: 6px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.16s, transform 0.16s;
}
.pd-act .tip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: var(--dark, #0d1016);
}
.pd-act:hover .tip,
.pd-act:focus-visible .tip,
.pd-act.copied .tip {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}
</style>
