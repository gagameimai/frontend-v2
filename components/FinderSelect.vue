<template>
  <button
    ref="fieldEl"
    type="button"
    class="fld"
    aria-haspopup="dialog"
    :aria-label="cap + '：' + (displayLabel || '')"
    :aria-expanded="open ? 'true' : 'false'"
    :class="{ open, chosen, dis: disabled }"
    @click="emit('toggle')"
  >
    <i class="led"></i>
    <span class="cap">{{ cap }}</span>
    <span class="val">{{ displayLabel }}</span>
    <i class="cv"></i>
  </button>
</template>

<script setup>
// 首頁「選車型」抽屜裡的一格欄位（深色，比照草稿「首頁_混搭版.html」的 .finder .fld）。
// 2026-09 改版：原本點下去會在欄位旁邊彈出一個窄窄的小清單，42 個車廠一次只看得到 7 個、手機很難點，
// 現在這個元件只負責「顯示目前選了什麼」，點下去由首頁打開大面板（components/FinderPanel.vue）來選。
// options 格式：[{ value, label }]，第一筆通常是「請選擇...」的預留選項，用來顯示還沒選時的文字。
// 欄位還不能用時（例如還沒選車廠就點車款）仍然可以點，由首頁決定要帶客人回到哪一步。
const props = defineProps({
  cap: { type: String, default: '' },
  // 不給預設值：年份欄「還沒選」是 undefined，若預設成 ''，會被當成「所有年份」而不是顯示「選擇年份」
  modelValue: { default: undefined },
  options: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
  open: { type: Boolean, default: false },
})
const emit = defineEmits(['toggle'])

const fieldEl = ref(null)
const selectedIndex = computed(() => props.options.findIndex((o) => o.value === props.modelValue))
const displayLabel = computed(() => {
  const i = selectedIndex.value
  return i >= 0 ? props.options[i].label : ''
})
// 目前選到的不是第一筆佔位選項，才算「已選擇」（用來決定文字要不要變白色）
const chosen = computed(() => selectedIndex.value > 0)

// 讓首頁在面板關掉後把焦點還給這一格（鍵盤操作的人才知道自己在哪）
defineExpose({ focus: () => fieldEl.value && fieldEl.value.focus() })
</script>

<style scoped>
.fld {
  flex: 1;
  position: relative;
  display: block;
  text-align: left;
  font-family: inherit;
  border: 0;
  background: transparent;
  outline: 0;
  padding: 9px 16px 9px 20px;
  border-radius: 9px;
  min-width: 0;
  cursor: pointer;
}
.fld + .fld::after {
  content: '';
  position: absolute;
  left: 0;
  top: 9px;
  bottom: 9px;
  width: 1px;
  background: rgba(255, 255, 255, 0.07);
}
.fld .led {
  position: absolute;
  left: 9px;
  top: 12px;
  bottom: 12px;
  width: 2px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.1);
  transition: background 0.2s, box-shadow 0.2s;
}
.fld:hover {
  background: rgba(255, 255, 255, 0.04);
}
.fld:focus-visible,
.fld.open {
  background: color-mix(in srgb, var(--site-accent, #007abe) 10.0%, transparent);
}
.fld:focus-visible .led,
.fld.open .led {
  background: var(--site-accent-lt, #4fb6ea);
  box-shadow: 0 0 9px color-mix(in srgb, var(--site-accent-lt, #4fb6ea) 95.0%, transparent);
}
.fld .cap {
  display: block;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 2px;
}
.fld:focus-visible .cap,
.fld.open .cap {
  color: var(--site-accent-lt, #4fb6ea);
}
.fld .val {
  display: block;
  height: 23px;
  line-height: 23px;
  padding-right: 18px;
  font-size: 14.5px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.62);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.fld.chosen .val {
  color: #fff;
}
.fld .cv {
  position: absolute;
  right: 16px;
  top: 23px;
  width: 7px;
  height: 7px;
  border-right: 2px solid rgba(255, 255, 255, 0.45);
  border-bottom: 2px solid rgba(255, 255, 255, 0.45);
  transform: rotate(45deg);
  transition: transform 0.2s, border-color 0.2s;
}
.fld.open .cv {
  transform: rotate(-135deg);
  border-color: var(--site-accent-lt, #4fb6ea);
}
.fld.dis {
  opacity: 0.45;
}
@media (prefers-reduced-motion: reduce) {
  .fld .cv {
    transition: none;
  }
}
/* 跟 pages/index.vue 的抽屜斷點一致：直立手機才直排，手機橫拿用橫排 */
@media (max-width: 760px) and (orientation: portrait), (max-width: 560px) {
  .fld {
    flex: 1 1 100%;
    padding: 9px 14px 9px 18px;
  }
  .fld + .fld::after {
    left: 14px;
    right: 14px;
    top: 0;
    bottom: auto;
    width: auto;
    height: 1px;
  }
}
</style>
