<template>
  <div class="share-buttons">
    <button type="button" class="share-btn" :aria-label="$t('share.facebook')" @click="shareFacebook">
      <font-awesome-icon :icon="['fab', 'facebook-f']" />
      <span class="label">{{ $t('share.facebook') }}</span>
    </button>
    <button type="button" class="share-btn" :aria-label="$t('share.line')" @click="shareLine">
      <font-awesome-icon :icon="['fab', 'line']" />
      <span class="label">{{ $t('share.line') }}</span>
    </button>
    <button
      type="button"
      class="share-btn"
      :class="{ copied }"
      :aria-label="$t('share.copyLink')"
      @click="copyLink"
    >
      <font-awesome-icon :icon="['fas', copied ? 'check' : 'link']" />
      <span class="label">{{ copied ? $t('share.copied') : $t('share.copyLink') }}</span>
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
.share-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 4px 0 18px;
}
.share-btn {
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
.share-btn:hover {
  border-color: var(--navy, #007abe);
  color: var(--navy, #007abe);
  transform: translateY(-2px);
}
.share-btn.copied {
  border-color: var(--navy, #007abe);
  color: var(--navy, #007abe);
}
.share-btn .label {
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
.share-btn .label::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: var(--dark, #0d1016);
}
.share-btn:hover .label,
.share-btn:focus-visible .label,
.share-btn.copied .label {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}
</style>
