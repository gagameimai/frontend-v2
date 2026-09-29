<template>
  <Teleport to="body">
    <Transition name="fp">
      <div v-if="open" class="fp-mask" @click.self="emit('close')">
        <div
          ref="panelEl"
          class="fp"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          tabindex="-1"
          @keydown.esc.stop="emit('close')"
        >
          <!-- 手機版把手（純裝飾，提示這是從下面滑上來的面板） -->
          <i class="grab" aria-hidden="true"></i>

          <!-- 步驟列：1 汽車品牌 › 2 車款 › 3 年份；選過的步驟可以點回去改 -->
          <div class="fp-head">
            <ol class="steps">
              <li v-for="s in steps" :key="s.k">
                <button
                  type="button"
                  :class="{ cur: s.k === step, done: !!s.value && s.k !== step }"
                  :disabled="!s.enabled"
                  @click="emit('step', s.k)"
                >
                  <i>{{ s.k }}</i>
                  <span class="lb">{{ s.label }}</span>
                  <span v-if="s.value" class="vv">{{ s.value }}</span>
                </button>
              </li>
            </ol>
            <button type="button" class="x" :aria-label="closeLabel" @click="emit('close')">✕</button>
          </div>

          <div class="fp-title">{{ title }}</div>

          <!-- 打字搜尋：打「altis」「crv」「豐田」都可以，結果直接列在下面 -->
          <div v-if="searchPlaceholder" class="fp-search">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.6-3.6"></path></svg>
            <input
              ref="searchEl"
              type="search"
              :value="query"
              :placeholder="searchPlaceholder"
              :aria-label="searchPlaceholder"
              autocomplete="off"
              enterkeyhint="search"
              @input="emit('update:query', $event.target.value)"
              @keydown.enter.prevent="pickFirst"
            />
            <button v-if="query" type="button" class="clr" :aria-label="clearLabel" @click="clearQuery">✕</button>
          </div>

          <div ref="bodyEl" class="fp-body">
            <p v-if="!items.length" class="empty">{{ emptyText }}</p>
            <template v-else>
              <section v-for="sec in sections" :key="sec.name || '_'" class="sec">
                <!-- 收合的那一組（例如「全部車廠 A–Z」）：先只露一顆展開鈕 -->
                <button
                  v-if="sec.name && sec.name === foldGroup && !unfolded"
                  type="button"
                  class="fold"
                  :aria-expanded="'false'"
                  @click="unfolded = true"
                >
                  <span>{{ sec.name }}</span><small>{{ sec.items.length }}</small><i aria-hidden="true"></i>
                </button>
                <template v-else>
                  <h3 v-if="sec.name" class="gh">{{ sec.name }}</h3>
                  <div class="grid" :class="'k-' + (sec.kind || kind)">
                    <button
                      v-for="it in sec.items"
                      :key="String(it.value)"
                      type="button"
                      class="opt"
                      :class="{ on: it.on, wide: it.wide, row: it.row }"
                      :aria-pressed="it.on ? 'true' : 'false'"
                      @click="emit('pick', it.value)"
                    >
                      <b>{{ it.label }}</b>
                      <small v-if="it.sub">{{ it.sub }}</small>
                    </button>
                  </div>
                </template>
              </section>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
// 首頁「選車型」大面板（2026-09）：取代原本欄位旁邊的窄小下拉清單。
// 電腦／平板：畫面中間一塊大面板；手機（≤640px）：從底部滑上來的面板，手指好點。
// 瘦身版（使用者 2026-09 選定）：上方可打字搜尋、常見車廠排前面其餘收合、年份依年代分組，
// 客人不用一次看完幾十個按鈕。選完一步由首頁自動換到下一步（品牌 → 車款 → 年份）。
const props = defineProps({
  open: { type: Boolean, default: false },
  step: { type: Number, default: 1 },
  // [{ k, label, value, enabled }]
  steps: { type: Array, default: () => [] },
  title: { type: String, default: '' },
  // [{ value, label, sub?, on?, wide?, row?, group?, groupKind? }]；group 相同的會排在同一區、依第一次出現的順序
  items: { type: Array, default: () => [] },
  kind: { type: String, default: 'brand' }, // brand / model / year / hit：決定格子寬度
  emptyText: { type: String, default: '' },
  closeLabel: { type: String, default: 'Close' },
  clearLabel: { type: String, default: 'Clear' },
  // 搜尋框：沒給 placeholder 就不顯示
  searchPlaceholder: { type: String, default: '' },
  query: { type: String, default: '' },
  // 這一組預設收起來，只露一顆「展開」鈕（例如「全部車廠（A–Z）」）
  foldGroup: { type: String, default: '' },
})
const emit = defineEmits(['pick', 'close', 'step', 'update:query'])

const panelEl = ref(null)
const searchEl = ref(null)
const bodyEl = ref(null)
const unfolded = ref(false)

const sections = computed(() => {
  const order = []
  const map = new Map()
  for (const it of props.items) {
    const g = it.group || ''
    if (!map.has(g)) {
      map.set(g, { name: g, kind: it.groupKind || '', items: [] })
      order.push(g)
    }
    map.get(g).items.push(it)
  }
  return order.map((g) => map.get(g))
})

// 目前選到的項目剛好在收合那一組裡，就直接展開，客人才看得到自己選了什麼
watch(
  () => props.items,
  (list) => {
    if (props.foldGroup && list.some((it) => it.group === props.foldGroup && it.on)) unfolded.value = true
  },
  { immediate: true }
)

function pickFirst() {
  const first = props.items[0]
  if (first && props.query) emit('pick', first.value)
}
function clearQuery() {
  emit('update:query', '')
  nextTick(() => searchEl.value && searchEl.value.focus())
}

// 打開時：鎖住背後的頁面不要跟著捲、把焦點放進面板
// 有搜尋框的步驟：電腦版直接把游標放進搜尋框（可以馬上打字）；手機不自動彈鍵盤，免得遮住選項
function focusInside() {
  nextTick(() => {
    const p = panelEl.value
    if (!p) return
    const wide = typeof window !== 'undefined' && window.matchMedia('(min-width: 641px) and (hover: hover)').matches
    let target = null
    if (wide && searchEl.value) target = searchEl.value
    if (!target) target = p.querySelector('.opt.on') || p.querySelector('.opt') || p
    try {
      target.focus({ preventScroll: true })
    } catch (e) {
      target.focus()
    }
    if (target.classList && target.classList.contains('opt')) target.scrollIntoView({ block: 'nearest' })
    // 很窄的手機上步驟列可能要左右滑：把「現在這一步」捲進畫面
    const cur = p.querySelector('.steps .cur')
    const bar = p.querySelector('.steps')
    if (cur && bar) bar.scrollLeft = Math.max(0, cur.offsetLeft - bar.clientWidth + cur.offsetWidth + 8)
  })
}
function lockScroll(lock) {
  if (typeof document === 'undefined') return
  document.documentElement.style.overflow = lock ? 'hidden' : ''
}
watch(
  () => props.open,
  (v) => {
    lockScroll(v)
    unfolded.value = false
    if (v) focusInside()
  }
)
// 換步驟（品牌 → 車款）時，內容換了，捲回最上面、收合狀態重來、重新放焦點
watch(
  () => props.step,
  () => {
    if (!props.open) return
    unfolded.value = false
    nextTick(() => {
      if (bodyEl.value) bodyEl.value.scrollTop = 0
      focusInside()
    })
  }
)
// 打字時結果換了，捲回最上面
watch(
  () => props.query,
  () => nextTick(() => bodyEl.value && (bodyEl.value.scrollTop = 0))
)
onBeforeUnmount(() => lockScroll(false))
</script>

<style scoped>
.fp-mask {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(6, 10, 16, 0.62);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.fp {
  position: relative;
  width: min(760px, 100%);
  max-height: min(82vh, 720px);
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid #33404f;
  background: linear-gradient(180deg, #1c242f, #12181f);
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  color: #fff;
  font-family: 'Noto Sans TC', system-ui, 'Microsoft JhengHei', sans-serif;
  outline: 0;
  overflow: hidden;
}
.grab { display: none; }

/* 步驟列 */
.fp-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 12px 10px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}
.steps {
  flex: 1;
  min-width: 0;
  display: flex;
  gap: 6px;
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-x: auto;
  scrollbar-width: none;
}
.steps::-webkit-scrollbar { display: none; }
.steps li { flex: none; }
.steps button {
  display: flex;
  align-items: center;
  gap: 7px;
  height: 36px;
  padding: 0 12px 0 6px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  color: rgba(255, 255, 255, 0.55);
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}
.steps button i {
  font-style: normal;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 11.5px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}
.steps button .vv { color: #fff; font-weight: 800; max-width: 12em; overflow: hidden; text-overflow: ellipsis; }
.steps button.done .lb { display: none; }
.steps button.cur { border-color: #4fb6ea; color: #fff; background: rgba(79, 182, 234, 0.12); }
.steps button.cur i { background: #4fb6ea; color: #0b1422; }
.steps button.done i { background: rgba(79, 182, 234, 0.25); color: #9fdcff; }
.steps button:disabled { opacity: 0.4; cursor: default; }
.steps button:not(:disabled):hover { border-color: rgba(79, 182, 234, 0.6); }
.x {
  flex: none;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 0;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.8);
  font-size: 15px;
  cursor: pointer;
}
.x:hover { background: rgba(255, 255, 255, 0.16); color: #fff; }

.fp-title {
  padding: 14px 18px 8px;
  font-size: clamp(16px, 2vw, 19px);
  font-weight: 800;
}

/* 搜尋框 */
.fp-search {
  position: relative;
  margin: 2px 18px 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 46px;
  padding: 0 10px 0 14px;
  border-radius: 11px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.55);
}
.fp-search:focus-within { border-color: #4fb6ea; background: rgba(79, 182, 234, 0.08); color: #9fdcff; }
.fp-search input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #fff;
  font-family: inherit;
  font-size: 16px; /* 16px：iPhone 點進去才不會自動放大畫面 */
}
.fp-search input::placeholder { color: rgba(255, 255, 255, 0.4); }
.fp-search input::-webkit-search-cancel-button { display: none; }
.clr {
  flex: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 0;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 12px;
  cursor: pointer;
}

/* 選項（捲動只發生在這一塊） */
.fp-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 2px 18px 18px;
}
.sec + .sec { margin-top: 14px; }
.gh {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.5);
}
.grid { display: grid; gap: 8px; }
.grid.k-brand { grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); }
/* 常見車廠 10 個：電腦 5×2、手機 2×5，排得整整齊齊不會剩一格 */
.grid.k-pop { grid-template-columns: repeat(5, minmax(0, 1fr)); }
@media (min-width: 641px) and (max-width: 720px) {
  .grid.k-pop { grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); }
}
.grid.k-model { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
/* 年份：一個年代剛好 10 格一排（手機 5 格兩排），不會出現尾巴孤零零一格 */
.grid.k-year { grid-template-columns: repeat(10, minmax(0, 1fr)); gap: 6px; }
.grid.k-hit { grid-template-columns: 1fr; gap: 6px; }
.opt {
  min-height: 52px;
  padding: 8px 10px;
  border-radius: 11px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  color: #fff;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  text-align: center;
  transition: background 0.15s, border-color 0.15s;
}
.opt b { font-size: 14px; font-weight: 700; line-height: 1.25; word-break: keep-all; overflow-wrap: anywhere; }
.opt small { font-size: 11px; color: rgba(255, 255, 255, 0.5); line-height: 1.3; }
.opt:hover { background: rgba(0, 122, 190, 0.22); border-color: rgba(79, 182, 234, 0.5); }
.opt:focus-visible { outline: 2px solid #4fb6ea; outline-offset: 2px; }
.opt.on { background: rgba(0, 122, 190, 0.45); border-color: #4fb6ea; }
.opt.on small { color: rgba(255, 255, 255, 0.75); }
/* 年份那顆「所有年份」：整列橫跨 */
.opt.wide { grid-column: 1 / -1; flex-direction: row; justify-content: flex-start; gap: 10px; text-align: left; min-height: 48px; padding: 8px 14px; }
/* 搜尋結果：一行一筆，左邊車名、右邊小字 */
.opt.row { flex-direction: row; justify-content: space-between; gap: 12px; text-align: left; min-height: 48px; padding: 8px 14px; }
.opt.row small { text-align: right; flex: none; max-width: 55%; }
.grid.k-year .opt { min-height: 44px; padding: 6px 2px; }
.grid.k-year .opt b { font-size: 13.5px; }
.empty { font-size: 14px; color: rgba(255, 255, 255, 0.6); padding: 14px 0; line-height: 1.7; }

/* 收合的「全部車廠」 */
.fold {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  padding: 0 16px;
  border-radius: 11px;
  border: 1px dashed rgba(255, 255, 255, 0.22);
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}
.fold small { font-size: 12px; color: rgba(255, 255, 255, 0.45); font-weight: 600; }
.fold i {
  margin-left: auto;
  width: 8px;
  height: 8px;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: rotate(45deg);
  margin-top: -4px;
}
.fold:hover { border-color: #4fb6ea; color: #fff; }

.fp-body::-webkit-scrollbar { width: 9px; }
.fp-body::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.18); border-radius: 5px; border: 2px solid transparent; background-clip: padding-box; }

/* 進出場動畫：電腦淡入放大、手機從底部滑上來 */
.fp-enter-active, .fp-leave-active { transition: opacity 0.2s ease; }
.fp-enter-active .fp, .fp-leave-active .fp { transition: transform 0.24s cubic-bezier(0.22, 0.61, 0.36, 1); }
.fp-enter-from, .fp-leave-to { opacity: 0; }
.fp-enter-from .fp, .fp-leave-to .fp { transform: translateY(12px) scale(0.98); }

/* ── 手機：底部滑出面板 ── */
@media (max-width: 640px) {
  .fp-mask { align-items: flex-end; padding: 0; }
  .fp {
    width: 100%;
    max-height: 86svh;
    border-radius: 18px 18px 0 0;
    border-left: 0;
    border-right: 0;
    border-bottom: 0;
    padding-bottom: env(safe-area-inset-bottom);
  }
  .grab { display: block; width: 40px; height: 5px; border-radius: 3px; background: rgba(255, 255, 255, 0.22); margin: 8px auto 0; }
  .fp-head { padding: 8px 10px 10px 12px; }
  .fp-title { padding: 12px 14px 6px; }
  .fp-search { margin: 2px 14px 10px; }
  .fp-body { padding: 2px 14px 16px; }
  .grid { gap: 7px; }
  .grid.k-brand { grid-template-columns: repeat(auto-fill, minmax(98px, 1fr)); }
  .grid.k-pop { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .grid.k-pop .opt { min-height: 50px; flex-direction: row; gap: 8px; }
  .grid.k-model { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); }
  .grid.k-year { grid-template-columns: repeat(5, minmax(0, 1fr)); }
  .opt b { font-size: 13.5px; }
  .fp-enter-from .fp, .fp-leave-to .fp { transform: translateY(100%); }
}
/* 很窄的手機（320～400）：步驟列縮小一點，三個步驟盡量一排放得下 */
@media (max-width: 400px) {
  .steps { gap: 4px; }
  .steps button { padding: 0 9px 0 4px; gap: 5px; font-size: 12px; height: 34px; }
  .steps button i { width: 20px; height: 20px; font-size: 11px; }
  .steps button .vv { max-width: 6.5em; }
  .steps button.cur .vv { display: none; } /* 正在改的這一步只顯示「車款」「年份」字樣就好 */
  .opt.row { flex-direction: column; align-items: flex-start; gap: 1px; }
  .opt.row small { text-align: left; max-width: none; }
}
/* 手機橫拿、矮螢幕：面板不要超出畫面 */
@media (max-height: 520px) {
  .fp-mask { padding: 10px; align-items: center; }
  .fp { max-height: calc(100svh - 20px); border-radius: 14px; }
  .grab { display: none; }
  .fp-title { padding: 8px 16px 4px; }
  .fp-search { height: 40px; margin-bottom: 6px; }
}
@media (prefers-reduced-motion: reduce) {
  .fp-enter-active, .fp-leave-active, .fp-enter-active .fp, .fp-leave-active .fp { transition: none; }
}
</style>
