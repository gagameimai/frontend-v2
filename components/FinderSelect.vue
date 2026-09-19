<template>
  <div
    ref="fieldEl"
    class="fld"
    tabindex="0"
    role="combobox"
    aria-haspopup="listbox"
    :aria-expanded="open ? 'true' : 'false'"
    :aria-disabled="disabled ? 'true' : 'false'"
    :class="{ open, chosen, dis: disabled, up: isUp }"
    @click="onFieldClick"
    @keydown="onKeydown"
  >
    <i class="led"></i>
    <span class="cap">{{ cap }}</span>
    <span class="val">{{ displayLabel }}</span>
    <i class="cv"></i>
    <div ref="optsEl" class="opts" role="listbox">
      <div
        v-for="(opt, i) in options"
        :key="i"
        class="opt"
        :class="{ on: i === selectedIndex, dis: opt.disabled }"
        role="option"
        :aria-selected="i === selectedIndex ? 'true' : 'false'"
        @click.stop="selectOption(opt)"
      >{{ opt.label }}</div>
    </div>
  </div>
</template>

<script setup>
// 深色自訂下拉選單：比照草稿「首頁_混搭版.html」的 .finder .fld / .opts。
// 外面看起來是一個欄位，實際上不是瀏覽器原生 <select>（原生清單一定白底、位置由瀏覽器決定），
// 這裡自己畫一份深色清單，並依畫面剩餘空間決定往上或往下展開。
// options 格式：[{ value, label, disabled? }]，第一筆通常是「請選擇...」的預留選項。
const props = defineProps({
  cap: { type: String, default: '' },
  modelValue: { default: '' },
  options: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
  open: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'change', 'toggle', 'close'])

const fieldEl = ref(null)
const optsEl = ref(null)
const isUp = ref(false)

const selectedIndex = computed(() => props.options.findIndex((o) => o.value === props.modelValue))
const displayLabel = computed(() => {
  const i = selectedIndex.value
  return i >= 0 ? props.options[i].label : ''
})
// 目前選到的不是第一筆佔位選項，才算「已選擇」（用來決定文字要不要變白色）
const chosen = computed(() => selectedIndex.value > 0)

// 依欄位目前位置，計算清單要往上或往下展開、該放在哪個座標。
// 用 position:fixed，才不會被上層 .hero 的排版或 overflow 影響，該往上就往上、該往下就往下。
function place() {
  const fld = fieldEl.value
  const box = optsEl.value
  if (!fld || !box) return
  const r = fld.getBoundingClientRect()
  const gap = 9
  box.style.left = Math.round(r.left) + 'px'
  box.style.width = Math.round(r.width) + 'px'
  box.style.maxHeight = 'none'
  const want = box.scrollHeight + 14
  const below = window.innerHeight - r.bottom - 14
  const above = r.top - 14
  const up = below < want && above > below
  isUp.value = up
  box.style.maxHeight = Math.min(330, Math.max(120, up ? above : below)) + 'px'
  const hgt = box.offsetHeight
  let top = up ? r.top - gap - hgt : r.bottom + gap
  const header = document.querySelector('header')
  const minTop = (header ? Math.round(header.getBoundingClientRect().height) : 0) + 8
  top = Math.min(top, window.innerHeight - hgt - 8)
  top = Math.max(minTop, top)
  box.style.bottom = 'auto'
  box.style.top = Math.round(top) + 'px'
}

watch(
  () => props.open,
  (val) => {
    if (val) nextTick(() => place())
  }
)

function onFieldClick(ev) {
  if (props.disabled) return
  // 點到清單本身不切換開關，交給下面選項自己的 click 處理
  if (ev.target.closest && ev.target.closest('.opts')) return
  emit('toggle')
}

function selectOption(opt) {
  if (opt.disabled) return
  emit('update:modelValue', opt.value)
  emit('change', opt.value)
  emit('close')
  nextTick(() => fieldEl.value && fieldEl.value.focus())
}

function onKeydown(ev) {
  if (props.disabled) return
  if (ev.key === 'Enter' || ev.key === ' ') {
    ev.preventDefault()
    emit('toggle')
  } else if (ev.key === 'Escape') {
    if (props.open) emit('close')
  } else if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
    ev.preventDefault()
    const dir = ev.key === 'ArrowDown' ? 1 : -1
    let n = selectedIndex.value + dir
    while (n >= 0 && n < props.options.length && props.options[n].disabled) {
      n += dir
    }
    if (n >= 0 && n < props.options.length) {
      const opt = props.options[n]
      emit('update:modelValue', opt.value)
      emit('change', opt.value)
    }
  }
}

function handleResize() {
  if (props.open) place()
}
function handleScroll() {
  if (!props.open || !fieldEl.value) return
  const r = fieldEl.value.getBoundingClientRect()
  if (r.bottom < 0 || r.top > window.innerHeight) {
    emit('close')
  } else {
    place()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleScroll, { passive: true })
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.fld {
  flex: 1;
  position: relative;
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
.fld:focus,
.fld.open {
  background: rgba(0, 122, 190, 0.1);
}
.fld:focus .led,
.fld.open .led {
  background: #4fb6ea;
  box-shadow: 0 0 9px rgba(79, 182, 234, 0.95);
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
.fld:focus .cap,
.fld.open .cap {
  color: #4fb6ea;
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
  border-color: #4fb6ea;
}
.fld.dis {
  opacity: 0.45;
  cursor: not-allowed;
}
/* 用 position:fixed，才不會被 .hero 的排版或面板的 overflow 切掉；
   left／width／top／bottom 由 JS 依當下位置算，所以「該往上就往上、該往下就往下」。 */
.opts {
  position: fixed;
  z-index: 60;
  padding: 6px;
  border: 1px solid #33404f;
  border-radius: 12px;
  background: linear-gradient(180deg, #1c242f, #12181f);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  overflow: auto;
  overscroll-behavior: contain;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-6px);
  transition: opacity 0.18s, transform 0.18s, visibility 0.18s;
}
.fld.up .opts {
  transform: translateY(6px);
}
.fld.open .opts {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}
.opt {
  position: relative;
  padding: 9px 30px 9px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.78);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.opt:hover {
  background: rgba(0, 122, 190, 0.24);
  color: #fff;
}
.opt.on {
  background: rgba(0, 122, 190, 0.34);
  color: #fff;
}
.opt.on::after {
  content: '';
  position: absolute;
  right: 13px;
  top: 50%;
  margin-top: -7px;
  width: 6px;
  height: 10px;
  border-right: 2px solid #4fb6ea;
  border-bottom: 2px solid #4fb6ea;
  transform: rotate(45deg);
}
.opt.dis {
  opacity: 0.4;
  cursor: not-allowed;
}
.opts::-webkit-scrollbar {
  width: 9px;
}
.opts::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 5px;
  border: 2px solid transparent;
  background-clip: padding-box;
}
.opts::-webkit-scrollbar-track {
  background: transparent;
}
@media (prefers-reduced-motion: reduce) {
  .opts,
  .fld .cv {
    transition: none;
  }
}
@media (max-width: 760px) {
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
