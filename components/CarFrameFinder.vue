<template>
  <div ref="rootEl" class="cff">
    <!-- 往下捲、查詢列看不到時，頂端浮出一條小路徑列（回上一步＋目前選到哪） -->
    <div
      class="mini"
      :class="{ show: miniShow }"
      :style="{ top: headerH + 'px' }"
      :aria-hidden="miniShow ? 'false' : 'true'"
    >
      <div class="mini-in">
        <button type="button" class="bk2" :tabindex="miniShow ? 0 : -1" @click="back">{{ backLabel }}</button>
        <span class="p">
          <template v-if="S.model"><small>{{ brandEn }}</small>{{ [S.model, yLabel].filter(Boolean).join(' · ') }}</template>
          <template v-else>{{ brandEn }}</template>
        </span>
      </div>
    </div>

    <!-- 快速查詢列：汽車品牌 / 車款 / 年份 ＋ 查詢 -->
    <div ref="hfEl" class="hf">
      <button
        v-for="f in fields"
        :key="f.k"
        type="button"
        class="f"
        :class="{ cur: f.cur, ch: !!f.val, dis: f.dis, open: S.open === f.k }"
        :disabled="f.dis"
        :aria-expanded="S.open === f.k ? 'true' : 'false'"
        aria-controls="cffDrop"
        @click="onField(f.k)"
      >
        <i class="led"></i>
        <span class="cap">{{ f.cap }}</span>
        <span class="val">{{ f.val || f.ph }}</span>
        <i class="cv"></i>
      </button>
      <button type="button" class="go" @click="onGo">{{ t('cfFinder.go') }}</button>
    </div>

    <!-- 點欄位後展開的選單 -->
    <div v-if="S.open" id="cffDrop" ref="dropEl" class="drop2" role="listbox" :aria-label="dropTitle">
      <div class="dh">{{ dropTitle }}</div>
      <p v-if="S.open === 2 && framesState !== 'ok'" class="dst">
        {{ framesState === 'error' ? t('cfFinder.loadError') : t('cfFinder.loading') }}
      </p>
      <template v-for="it in dropItems" :key="String(it.v)">
        <div v-if="it.head" class="dh sub">{{ it.head }}</div>
        <button
          type="button"
          role="option"
          :aria-selected="it.on ? 'true' : 'false'"
          :class="{ on: it.on }"
          @click="onPick(it.v)"
        >
          <span>{{ it.label }}</span><small>{{ it.sub }}</small>
        </button>
      </template>
    </div>

    <div class="selhint">{{ S.brandId ? t('cfFinder.hintEdit') : t('cfFinder.hintStart') }}</div>

    <div ref="bodyEl" class="body">
      <!-- 第 1 步：車廠牆 -->
      <template v-if="S.step === 1">
        <div :key="'s1-' + flashKey" class="sT" :class="{ flash: flashKey > 0 }"><i>1</i>{{ t('cfFinder.step1') }}</div>
        <p v-if="!brands.length" class="stat">{{ t('cfFinder.loadError') }}</p>
        <div v-else class="lw">
          <button
            v-for="b in brands"
            :key="b.id"
            type="button"
            :class="{ on: S.brandId === b.id }"
            @click="pickBrand(b.id)"
          >
            <b>{{ b.en }}</b><small>{{ b.zh }}</small>
          </button>
        </div>
      </template>

      <!-- 第 2 步：車款 -->
      <template v-else-if="S.step === 2">
        <div :key="'s2-' + flashKey" class="sT" :class="{ flash: flashKey > 0 }"><i>2</i>{{ t('cfFinder.step2', { brand: brandEn }) }}</div>
        <p v-if="framesState === 'error'" class="stat">{{ t('cfFinder.loadError') }}</p>
        <p v-else-if="framesState !== 'ok'" class="stat">{{ t('cfFinder.loading') }}</p>
        <p v-else-if="!models.length" class="stat">
          {{ t('cfFinder.noFrameBrand') }}<NuxtLink to="/partner" class="stat-link">{{ t('cfFinder.findDealer') }}</NuxtLink>
        </p>
        <div v-else class="mt">
          <button
            v-for="m in models"
            :key="m.name"
            type="button"
            :class="{ on: S.model === m.name }"
            @click="pickModel(m.name)"
          >
            <b>{{ m.name }}</b>
            <span>{{ rangeLabel(m.ys, m.ye) }} · {{ t('cfFinder.frameCount', { n: m.count }) }}</span>
          </button>
        </div>
      </template>

      <!-- 第 3 步：全部年份（看框比對） -->
      <template v-else-if="S.step === 3 && !S.all">
        <div :key="'s3-' + flashKey" class="sT" :class="{ flash: flashKey > 0 }"><i>3</i>{{ t('cfFinder.step3', { model: S.model }) }}</div>
        <p v-if="framesState === 'error'" class="stat">{{ t('cfFinder.loadError') }}</p>
        <p v-else-if="framesState !== 'ok'" class="stat">{{ t('cfFinder.loading') }}</p>
        <p v-else-if="!groups.length" class="stat">
          {{ t('cfFinder.noFrameModel') }}<NuxtLink to="/partner" class="stat-link">{{ t('cfFinder.findDealer') }}</NuxtLink>
        </p>
        <template v-else>
          <div v-if="missYear" class="vbox confirm">{{ t('cfFinder.noYearMatch', { year: missYear }) }}</div>
          <div class="hint2">{{ t('cfFinder.step3HintA') }}<b>{{ t('cfFinder.step3HintB') }}</b>{{ t('cfFinder.step3HintC') }}</div>
          <div class="yc">
            <button v-for="(g, i) in groups" :key="g.key" type="button" @click="pickGroup(i)">
              <span class="im">
                <img
                  v-if="g.frames[0].img && !bad[g.frames[0].img]"
                  :src="g.frames[0].img"
                  :alt="frameTitle(g.frames[0])"
                  loading="lazy"
                  @error="markBad(g.frames[0].img)"
                />
                <span v-else class="ph"></span>
                <span v-if="g.frames.length > 1" class="n c">{{ t('cfFinder.needTag', { n: g.frames.length }) }}</span>
              </span>
              <span v-if="g.frames.length > 1" class="th">
                <span v-for="f in g.frames.slice(0, 4)" :key="f.id">
                  <img v-if="f.img && !bad[f.img]" :src="f.img" alt="" loading="lazy" @error="markBad(f.img)" />
                </span>
              </span>
              <span class="tx">
                <b>{{ g.label }}</b>
                <span>{{ [g.frames.length === 1 ? g.frames[0].name : '', sizeText(g.sizes)].filter(Boolean).join(' · ') }}</span>
              </span>
            </button>
          </div>
          <button type="button" class="allLink" @click="showAll">{{ t('cfFinder.allLink') }}</button>
        </template>
      </template>

      <!-- 第 3 步（店家用）：連完工照一起比對 -->
      <template v-else-if="S.step === 3 && S.all">
        <div :key="'s3a-' + flashKey" class="sT" :class="{ flash: flashKey > 0 }"><i>3</i>{{ t('cfFinder.step3All', { model: S.model }) }}</div>
        <div class="hint2">{{ t('cfFinder.step3AllHint') }}</div>
        <div class="g4">
          <template v-for="(g, i) in groups" :key="g.key">
            <div v-for="f in g.frames" :key="f.id" class="pairCard">
              <div class="top">
                <button type="button" class="yr" @click="pickGroup(i)">{{ g.label }} ›</button>
                <span>{{ f.name }}</span>
              </div>
              <div class="ba">
                <div>
                  <span class="lab">{{ t('cfFinder.labFrame') }}</span>
                  <img v-if="f.img && !bad[f.img]" class="fi" :src="f.img" :alt="frameTitle(f)" loading="lazy" @error="markBad(f.img)" />
                  <span v-else class="ph"></span>
                </div>
                <div :class="{ empty: !hasInstall(f) }">
                  <span class="lab">{{ t('cfFinder.labInstall') }}</span>
                  <img v-if="hasInstall(f)" class="pi" :src="f.img2" :alt="frameTitle(f) + ' ' + t('cfFinder.labInstall')" loading="lazy" @error="markBad(f.img2)" />
                  <span v-else class="none">{{ t('cfFinder.instPending') }}</span>
                </div>
              </div>
              <div class="ft">
                <span class="z">{{ t('cfFinder.canFit', { s: f.size }) }}</span>
                <span v-if="g.frames.length > 1" class="need">{{ t('cfFinder.needShort') }}</span>
                <NuxtLink class="dl" :to="detailTo(f)">{{ t('cfFinder.detailShort') }}</NuxtLink>
                <a class="lineBtn" :href="lineHref(bestYear(g))" target="_blank" rel="noopener"><i>LINE</i>{{ t('cfFinder.lineShare') }}</a>
              </div>
            </div>
          </template>
        </div>
      </template>

      <!-- 第 5 步：選的年份剛好是交界年，有好幾款可能符合 -->
      <template v-else-if="S.step === 5">
        <div :key="'s5-' + flashKey" class="yh" :class="{ flash: flashKey > 0 }"><b>{{ t('cfFinder.yearTitle', { model: S.model, year: S.year }) }}</b></div>
        <div class="vbox confirm">{{ t('cfFinder.yearCross', { year: S.year, n: yearHits.length }) }}</div>
        <div class="yc">
          <button v-for="i in yearHits" :key="groups[i].key" type="button" @click="pickFromHits(i)">
            <span class="im">
              <img
                v-if="groups[i].frames[0].img && !bad[groups[i].frames[0].img]"
                :src="groups[i].frames[0].img"
                :alt="frameTitle(groups[i].frames[0])"
                loading="lazy"
                @error="markBad(groups[i].frames[0].img)"
              />
              <span v-else class="ph"></span>
              <span v-if="groups[i].frames.length > 1" class="n c">{{ t('cfFinder.needTag', { n: groups[i].frames.length }) }}</span>
            </span>
            <span class="tx">
              <b>{{ groups[i].label }}</b>
              <span>{{ [groups[i].frames.length === 1 ? groups[i].frames[0].name : '', sizeText(groups[i].sizes)].filter(Boolean).join(' · ') }}</span>
            </span>
          </button>
        </div>
        <button type="button" class="otherY" @click="backAllYears">{{ t('cfFinder.backAllYears') }}</button>
      </template>

      <!-- 第 4 步：結果（車框＋完工照），「看詳細內容」連到車框詳情頁，不在這一頁展開 -->
      <template v-else-if="S.step === 4 && curGroup && curFrame">
        <button v-if="S.year && yearHits.length > 1" type="button" class="backOv" @click="toCompare">
          {{ t('cfFinder.backCompare', { year: S.year, n: yearHits.length }) }}
        </button>
        <div :key="'s4-' + flashKey" class="yh" :class="{ flash: flashKey > 0 }">
          <b>{{ S.model }}　{{ curGroup.label }}</b>
          <span v-if="curGroup.frames.length === 1 && curFrame.name">{{ curFrame.name }}</span>
        </div>
        <template v-if="curGroup.frames.length > 1">
          <div class="vbox confirm">{{ t('cfFinder.multiVariant', { n: curGroup.frames.length }) }}</div>
          <div class="vch">
            <button
              v-for="(x, i) in curGroup.frames"
              :key="x.id"
              type="button"
              :class="{ on: i === S.vi }"
              @click="S.vi = i"
            >
              <span class="t">{{ x.name || t('cfFinder.unitInch', { s: x.size }) }}</span>
              <small>{{ t('cfFinder.canFit', { s: x.size }) }}</small>
            </button>
          </div>
        </template>

        <!-- 結果卡片：照草稿「安卓車框頁_混搭版.html」的相簿式。
             圖片順序：車框 → 車框概況（有才有）→ 完工照 1～3；大圖可左右切換、點圖放大，下方縮圖列可直接跳。
             列表 API 只給每組第 1 張，完整完工照由 /api/carframe/{id} 補抓（進到這一步才抓、抓過就記住）。 -->
        <div class="big one gal2">
          <div class="gcol" :class="{ solo: gItems.length < 2 }">
            <div
              class="gstage"
              :class="{ light: gCur.light }"
              role="button"
              tabindex="0"
              :aria-label="t('cfFinder.zoomIn')"
              @click="openLb(gIdx)"
              @keydown.enter.prevent="openLb(gIdx)"
              @touchstart.passive="onGTs"
              @touchend="onGTe"
            >
              <img v-if="gCur.src && !bad[gCur.src]" :class="gCur.light ? 'fi' : 'pi'" :src="gCur.src" :alt="gCur.alt" @error="markBad(gCur.src)" />
              <span v-else class="ph"></span>
              <span class="glab">{{ gCur.label }}</span>
              <span class="gzm" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5 21 21" /><path d="M8 10.5h5M10.5 8v5" /></svg>
              </span>
              <span v-if="gItems.length > 1" class="gcnt">{{ gIdx + 1 }} / {{ gItems.length }}</span>
              <template v-if="gItems.length > 1">
                <button type="button" class="garr gp" :aria-label="t('cfFinder.prev')" @click.stop="gStep(-1)">‹</button>
                <button type="button" class="garr gnx" :aria-label="t('cfFinder.next')" @click.stop="gStep(1)">›</button>
              </template>
            </div>
            <div v-if="gItems.length > 1" class="gthumbs">
              <button v-for="(it, i) in gItems" :key="it.key" type="button" class="gth" :class="{ on: i === gIdx }" :aria-label="it.label" @click="gIdx = i">
                <span class="gtp"><img v-if="it.src && !bad[it.src]" :src="it.src" :class="{ fit: it.light }" alt="" loading="lazy" @error="markBad(it.src)" /><span v-else class="ph"></span></span>
                <em>{{ it.label }}</em>
              </button>
            </div>
          </div>
          <!-- 右欄（版本 B，2026-10-01 定案）：資料在上、按鈕貼底；電腦版不再重複放完工照小圖（左邊縮圖列已經有） -->
          <div class="inf">
            <div class="inf-top">
              <h3>
                {{ frameTitle(curFrame) }}<span v-if="curGroup.frames.length > 1" class="need">{{ t('cfFinder.needConfirm') }}</span>
              </h3>
              <div class="kv">
                <div><span>{{ t('cfFinder.fitYear') }}</span><b>{{ curGroup.label }}</b></div>
                <div><span>{{ t('cfFinder.fitUnit') }}</span><b>{{ t('cfFinder.unitInch', { s: curFrame.size }) }}</b></div>
              </div>
              <!-- 小標示：有車框概況才出現「車框概況已附」；完工照有幾張就寫幾張，沒有寫「完工照準備中」 -->
              <div class="chips">
                <span v-if="hasOv(curFrame)" class="chip"><i></i>{{ t('cfFinder.chipOv') }}</span>
                <span v-if="instItems.length" class="chip"><i></i>{{ t('cfFinder.chipInst', { n: instItems.length }) }}</span>
                <span v-else class="chip off"><i></i>{{ t('cfFinder.instPending') }}</span>
              </div>
              <div class="frameNote"><b>{{ t('cfFinder.noteB') }}</b>{{ t('cfFinder.noteRest', { s: curFrame.size }) }}<template v-if="hasOv(curFrame)">{{ t('cfFinder.noteOv') }}</template></div>
            </div>
            <div class="inf-act">
              <NuxtLink class="detBtn viewall" :to="detailTo(curFrame)">
                {{ t('cfFinder.detailBtn') }}<b v-if="instItems.length">{{ t('cfFinder.instBadge', { n: instItems.length }) }}</b><span class="chev">›</span>
              </NuxtLink>
              <button type="button" class="otherY inC" @click="backAllYears">{{ t('cfFinder.otherYears') }}</button>
              <!-- 分享時帶「只對到這一款」的年份，客人點開會直接看到這個結果；電腦、手機都直接三顆按鈕（手機版貼在卡片底部） -->
              <div class="resAct one">
                <div class="shRow" role="group" :aria-label="t('cfFinder.shareGroup')">
                  <a class="sh ln" :href="lineHref(bestYear(curGroup))" target="_blank" rel="noopener"><i>LINE</i>{{ t('cfFinder.shareLine') }}</a>
                  <a class="sh fb" :href="fbHref(bestYear(curGroup))" target="_blank" rel="noopener"><i>f</i>{{ t('cfFinder.shareFb') }}</a>
                  <button type="button" class="sh cp" @click="copyLink(bestYear(curGroup))">{{ copied ? t('cfFinder.copied') : t('cfFinder.shareCopy') }}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 保險：狀態對不上資料時（例如資料還在載入）顯示載入中，不會整塊空白 -->
      <p v-else class="stat">
        {{ framesState === 'error' ? t('cfFinder.loadError') : framesState === 'ok' ? t('cfFinder.noFrameModel') : t('cfFinder.loading') }}
      </p>
    </div>

    <p class="disc"><b>{{ t('cfFinder.discB') }}</b>　{{ t('cfFinder.disc') }}</p>

    <!-- 放大檢視（全螢幕）：＋／－、滾輪、拖曳、雙擊、左右滑、Esc；畫面掛在 body 底下，不被卡片裁掉 -->
    <Teleport to="body">
      <div v-if="lb.open" class="lbx" role="dialog" aria-modal="true" :aria-label="t('cfFinder.zoomIn')">
        <div class="lbtop">
          <b>{{ curFrame ? frameTitle(curFrame) : '' }} · {{ lbCur.label }}　{{ lb.i + 1 }} / {{ gItems.length }}</b>
          <button type="button" class="lbclose" :aria-label="t('cfFinder.lbClose')" @click="closeLb">✕</button>
        </div>
        <div
          class="lbcv"
          :class="{ zoomed: lb.sc > 1 }"
          @click.self="closeLb"
          @wheel.prevent="onLbWheel"
          @pointerdown="onLbDown"
          @pointermove="onLbMove"
          @pointerup="onLbUp"
          @pointercancel="onLbUp"
          @dblclick.prevent="lbToggle"
        >
          <div class="lbs" :class="{ light: lbCur.light }" :style="{ transform: `translate(${lb.x}px, ${lb.y}px) scale(${lb.sc})` }">
            <img v-if="lbCur.src && !bad[lbCur.src]" :src="lbCur.src" :alt="lbCur.alt" draggable="false" @error="markBad(lbCur.src)" />
            <span v-else class="ph"></span>
          </div>
        </div>
        <template v-if="gItems.length > 1">
          <button type="button" class="garr gp" :aria-label="t('cfFinder.prev')" @click="lbStep(-1)">‹</button>
          <button type="button" class="garr gnx" :aria-label="t('cfFinder.next')" @click="lbStep(1)">›</button>
        </template>
        <div class="lbtools">
          <button type="button" aria-label="−" @click="lbZoom(-0.5)">－</button>
          <span>{{ Math.round(lb.sc * 100) }}%</span>
          <button type="button" aria-label="+" @click="lbZoom(0.5)">＋</button>
          <button type="button" class="rs" @click="lbReset">{{ t('cfFinder.lbReset') }}</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
// 安卓車框「選車型」流程：照草稿「安卓車框頁_混搭版.html」的查詢方式
//   車廠 → 車款 → 年份（知道年份直接選；不知道就看車框長相比對）→ 結果（車框＋完工照）
// 資料：/api/car（車廠、車款）、/api/carframe?car_brand_id=（該車廠全部車框，含 car_name／年份／吋數／img／img2）。
// 「看詳細內容」一律連到 /carFrameDetail/:id，這一頁不展開詳細內容。
// 網址 /carFrame?brand=車廠id&model=車款id&year=年份 可以直接開到對的那一步（LINE 分享也是這個網址）。
const { t } = useI18n()
const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const apiBase = config.public.apiBase
const siteUrl = String(config.public.siteUrl || '').replace(/\/+$/, '')

// ── 車廠／車款（SSR 就抓，車廠牆會直接出現在 HTML 裡） ──
const { data: carData, refresh: refreshCar } = await useAsyncData('cf-finder-car', () =>
  $fetch(`${apiBase}/car`).catch(() => null)
)

// 「TOYOTA 豐田」拆成英文＋中文兩行；「BMW」這種沒有中文的就只有一行
function splitName(name) {
  const s = String(name || '').trim()
  const m = s.match(/^(.*?)\s*([㐀-鿿豈-﫿].*)?$/)
  const en = m && m[1] ? m[1].trim() : s
  const zh = m && m[2] ? m[2].trim() : ''
  return { en: en || s, zh }
}
const brands = computed(() =>
  (carData.value?.car_brand || []).map((b) => ({ id: Number(b.id), name: b.name, ...splitName(b.name) }))
)
const cars = computed(() => carData.value?.car || [])

// ── 流程狀態（跟草稿同一套：step 1 車廠／2 車款／3 年份／4 結果／5 交界年比對） ──
const S = reactive({ brandId: null, model: null, gi: null, vi: 0, year: null, step: 1, open: null, all: false })
const missYear = ref(null)
const flashKey = ref(0)

// ── 該車廠的全部車框（瀏覽器端抓，換車廠才重抓，抓過的會記住） ──
const brandFrames = ref([])
const framesState = ref('idle') // idle / loading / ok / error
const framesCache = new Map()
let reqSeq = 0
let pendingYear = null

async function loadBrandFrames(id) {
  // 每次都遞增序號：就算這次直接用快取，也要讓「還在路上的舊請求」回來時知道自己過期了，不會蓋掉現在的資料
  const seq = ++reqSeq
  if (!id) {
    brandFrames.value = []
    framesState.value = 'idle'
    return
  }
  if (framesCache.has(id)) {
    brandFrames.value = framesCache.get(id)
    framesState.value = 'ok'
    applyPendingYear()
    return
  }
  framesState.value = 'loading'
  try {
    const res = await $fetch(`${apiBase}/carframe`, { params: { car_brand_id: id } })
    if (seq !== reqSeq) return // 使用者已經換別的車廠了，舊的結果丟掉
    const list = Array.isArray(res?.result) ? res.result : []
    framesCache.set(id, list)
    brandFrames.value = list
    framesState.value = 'ok'
    applyPendingYear()
  } catch (e) {
    if (seq !== reqSeq) return
    brandFrames.value = []
    framesState.value = 'error'
  }
}

const curBrand = computed(() => brands.value.find((b) => b.id === S.brandId) || null)
const brandEn = computed(() => (curBrand.value ? curBrand.value.en : ''))

// 車款清單：只列出「有車框」的車款（名稱相同的合併成一個），順序跟後台車款表一致
const models = computed(() => {
  if (!S.brandId) return []
  const byName = new Map()
  for (const f of brandFrames.value) {
    const name = f && f.car_name
    if (!name) continue
    const ys = Number(f.year_start)
    const ye = Number(f.year_end)
    let m = byName.get(name)
    if (!m) {
      m = { name, count: 0, ys: Infinity, ye: -Infinity }
      byName.set(name, m)
    }
    m.count++
    if (Number.isFinite(ys)) m.ys = Math.min(m.ys, ys)
    if (Number.isFinite(ye)) m.ye = Math.max(m.ye, ye)
    else if (Number.isFinite(ys)) m.ye = Math.max(m.ye, ys)
  }
  const order = cars.value.filter((c) => Number(c.car_brand_id) === S.brandId).map((c) => c.name)
  const rank = (n) => {
    const i = order.indexOf(n)
    return i < 0 ? 1e9 : i
  }
  return [...byName.values()].sort((a, b) => rank(a.name) - rank(b.name) || String(a.name).localeCompare(String(b.name)))
})

// 這個車款的車框，依「年份區間」分組；同一區間有好幾款（例如棕色／黑色面板）就是「需經銷店確認」
const groups = computed(() => {
  if (!S.model) return []
  const map = new Map()
  for (const f of brandFrames.value) {
    if (!f || f.car_name !== S.model) continue
    const ys = Number(f.year_start)
    if (!Number.isFinite(ys)) continue
    let ye = Number(f.year_end)
    if (!Number.isFinite(ye) || ye < ys) ye = ys
    const key = ys + '-' + ye
    let g = map.get(key)
    if (!g) {
      g = { key, ys, ye, frames: [] }
      map.set(key, g)
    }
    g.frames.push(f)
  }
  const list = [...map.values()].sort((a, b) => a.ys - b.ys || a.ye - b.ye)
  for (const g of list) {
    g.sizes = [...new Set(g.frames.map((f) => String(f.size ?? '').trim()).filter(Boolean))].sort((a, b) => Number(a) - Number(b))
    g.label = rangeLabel(g.ys, g.ye)
  }
  return list
})

function covers(g, yr) {
  return yr >= g.ys && yr <= g.ye
}
function hitsOf(yr) {
  const out = []
  groups.value.forEach((g, i) => {
    if (covers(g, yr)) out.push(i)
  })
  return out
}
const yearHits = computed(() => (S.year ? hitsOf(S.year) : []))

// 年份下拉：這個車款所有車框涵蓋到的年份（逐年）
const yearList = computed(() => {
  const set = new Set()
  for (const g of groups.value) {
    const end = Math.min(g.ye, g.ys + 80) // 防呆：資料年份異常時不要跑出上百筆
    for (let y = g.ys; y <= end; y++) set.add(y)
  }
  return [...set].sort((a, b) => a - b)
})

const curGroup = computed(() => (S.gi !== null && S.gi >= 0 ? groups.value[S.gi] || null : null))
const curFrame = computed(() => (curGroup.value ? curGroup.value.frames[S.vi] || curGroup.value.frames[0] : null))

// 分享用的年份：挑一個「只對到這一組」的年份，別人點開才會直接到這個結果（交界年會變成比對畫面）
function bestYear(g) {
  if (!g) return null
  for (let y = g.ys; y <= g.ye; y++) {
    const h = hitsOf(y)
    if (h.length === 1 && groups.value[h[0]] === g) return y
  }
  return g.ys
}

function rangeLabel(ys, ye) {
  if (!Number.isFinite(ys)) return ''
  if (!Number.isFinite(ye) || ye === ys) return String(ys)
  return `${ys}–${ye}`
}
function sizeText(sizes) {
  return sizes && sizes.length ? t('cfFinder.canFit', { s: sizes.join('／') }) : ''
}
function frameTitle(f) {
  if (!f) return ''
  return [brandEn.value, S.model, f.name].filter(Boolean).join(' ') + ' ' + t('cfFinder.frameSuffix')
}
function detailTo(f) {
  return `/carFrameDetail/${f.id}`
}

// 圖片壞掉就改顯示佔位框，不要出現破圖
const bad = reactive({})
function markBad(src) {
  if (src) bad[src] = true
}
function hasOv(f) {
  return !!(f && f.img3 && !bad[f.img3])
}
function hasInstall(f) {
  return !!(f && f.img2 && !bad[f.img2])
}


// ── 結果卡片相簿（照草稿：車框 → 車框概況 → 完工照 1～3；大圖切換、縮圖、點圖放大） ──
// 列表 API 的 img2／img3 只有每組第 1 張；進到結果這一步才抓 /api/carframe/{id} 補完整完工照，抓過就記住。
const detailMap = reactive({})
async function loadDetail(id) {
  if (!id || detailMap[id] !== undefined) return
  detailMap[id] = null
  try {
    const r = await $fetch(`${apiBase}/carframe/${id}`)
    const d = (r && r.result) || {}
    detailMap[id] = {
      img2: Array.isArray(d.img2) ? d.img2.filter((x) => typeof x === 'string' && x.trim()) : [],
      img3: typeof d.img3 === 'string' ? d.img3 : ''
    }
  } catch (e) {
    detailMap[id] = { img2: [], img3: '' }
  }
}
const gIdx = ref(0)
watch(
  () => (curFrame.value ? curFrame.value.id : null),
  (id) => {
    gIdx.value = 0
    if (id && import.meta.client) loadDetail(id)
  },
  { immediate: true }
)
const gItems = computed(() => {
  const f = curFrame.value
  if (!f) return []
  const d = detailMap[f.id] || null
  const title = frameTitle(f)
  const out = [{ key: 'frame', src: f.img, label: t('cfFinder.labFrame'), light: true, alt: title }]
  const ov = (d && d.img3) || f.img3
  if (ov && !bad[ov]) out.push({ key: 'ov', src: ov, label: t('cfFinder.labOverview'), light: true, alt: title + ' ' + t('cfFinder.labOverview') })
  const inst = d ? d.img2 : f.img2 ? [f.img2] : []
  inst.forEach((src, i) => {
    if (bad[src]) return
    out.push({ key: 'inst' + i, src, label: t('cfFinder.instN', { n: i + 1 }), light: false, inst: true, alt: title + ' ' + t('cfFinder.labInstall') + ' ' + (i + 1) })
  })
  return out.map((it, i) => ({ ...it, i }))
})
const instItems = computed(() => gItems.value.filter((it) => it.inst))
const gCur = computed(() => gItems.value[gIdx.value] || gItems.value[0] || {})
watch(gItems, (list) => {
  if (gIdx.value >= list.length) gIdx.value = 0
})
function gStep(d) {
  const n = gItems.value.length
  if (n < 2) return
  gIdx.value = (gIdx.value + d + n) % n
}
// 手機左右滑動切換大圖
let gTx = null
function onGTs(ev) {
  gTx = ev.touches && ev.touches.length === 1 ? ev.touches[0].clientX : null
}
function onGTe(ev) {
  if (gTx === null) return
  const dx = ev.changedTouches[0].clientX - gTx
  gTx = null
  if (Math.abs(dx) > 45) {
    gStep(dx < 0 ? 1 : -1)
    ev.preventDefault()
  }
}

// ── 放大檢視 ──
const lb = reactive({ open: false, i: 0, sc: 1, x: 0, y: 0 })
const lbCur = computed(() => gItems.value[lb.i] || gItems.value[0] || {})
let lbDrag = null
let lbPointers = 0
function openLb(i) {
  lb.i = i
  lb.sc = 1
  lb.x = 0
  lb.y = 0
  lb.open = true
  if (import.meta.client) document.documentElement.classList.add('lbopen')
}
function closeLb() {
  lb.open = false
  if (import.meta.client) document.documentElement.classList.remove('lbopen')
}
function lbStep(d) {
  const n = gItems.value.length
  if (n < 2) return
  lb.i = (lb.i + d + n) % n
  gIdx.value = lb.i
  lb.sc = 1
  lb.x = 0
  lb.y = 0
}
function lbZoom(d, cx, cy) {
  const next = Math.min(4, Math.max(1, Math.round((lb.sc + d) * 10) / 10))
  if (next === 1) {
    lb.x = 0
    lb.y = 0
  }
  lb.sc = next
}
function lbReset() {
  lb.sc = 1
  lb.x = 0
  lb.y = 0
}
function lbToggle() {
  if (lb.sc > 1) lbReset()
  else lb.sc = 2
}
function onLbWheel(ev) {
  lbZoom(ev.deltaY < 0 ? 0.25 : -0.25)
}
function onLbDown(ev) {
  lbPointers++
  if (lb.sc <= 1) {
    lbDrag = { x: ev.clientX, y: ev.clientY, sx: lb.x, sy: lb.y, swipe: true }
    return
  }
  lbDrag = { x: ev.clientX, y: ev.clientY, sx: lb.x, sy: lb.y, swipe: false }
  ev.currentTarget.setPointerCapture && ev.currentTarget.setPointerCapture(ev.pointerId)
}
function onLbMove(ev) {
  if (!lbDrag || lbDrag.swipe) return
  lb.x = lbDrag.sx + (ev.clientX - lbDrag.x)
  lb.y = lbDrag.sy + (ev.clientY - lbDrag.y)
}
function onLbUp(ev) {
  lbPointers = Math.max(0, lbPointers - 1)
  if (!lbDrag) return
  if (lbDrag.swipe) {
    const dx = ev.clientX - lbDrag.x
    if (Math.abs(dx) > 60) lbStep(dx < 0 ? 1 : -1)
  }
  lbDrag = null
}

// ── 查詢列三個欄位 ──
const yLabel = computed(() => {
  if (S.step < 3) return ''
  if (S.year) return String(S.year)
  return curGroup.value ? curGroup.value.label : t('cfFinder.allYears')
})
const fields = computed(() => [
  {
    k: 1,
    cap: t('cfFinder.brandCap'),
    ph: t('cfFinder.brandPh'),
    val: curBrand.value ? curBrand.value.name : '',
    cur: S.step === 1,
    dis: false
  },
  {
    k: 2,
    cap: t('cfFinder.modelCap'),
    ph: t('cfFinder.modelPh'),
    val: S.model || '',
    cur: S.step === 2,
    dis: !S.brandId
  },
  {
    k: 3,
    cap: t('cfFinder.yearCap'),
    ph: t('cfFinder.yearPh'),
    val: yLabel.value,
    cur: S.step >= 3,
    dis: !S.model
  }
])

// 左上「回上一步」按鈕依目前在哪一步顯示成更明確的字
const backLabel = computed(() => {
  if (S.step >= 4) return t('cfFinder.backYM')
  if (S.step === 3) return t('cfFinder.backModel')
  if (S.step === 2) return t('cfFinder.backBrand')
  return t('cfFinder.back')
})

const dropTitle = computed(() => {
  if (S.open === 1) return t('cfFinder.dropBrand')
  if (S.open === 2) return t('cfFinder.dropModel', { brand: brandEn.value })
  if (S.open === 3) return t('cfFinder.dropYear', { model: S.model || '' })
  return ''
})
// 熱門品牌排前面（跟首頁快搜同一套：訪客點越多的越前面；沒點過就照預設順序）
const POPULAR_BRANDS = ['TOYOTA', 'MITSUBISHI', 'HONDA', 'SUZUKI', 'NISSAN', 'HYUNDAI', 'MAZDA', 'FORD', 'BENZ', 'BMW', 'VOLKSWAGEN', 'AUDI']
const BRAND_CLICK_KEY = 'mm_brand_clicks'
const brandClicks = ref({})
function loadBrandClicks() {
  try {
    const o = JSON.parse(localStorage.getItem(BRAND_CLICK_KEY) || '{}')
    brandClicks.value = o && typeof o === 'object' ? o : {}
  } catch (e) {
    brandClicks.value = {}
  }
}
function bumpBrandClick(id) {
  const b = brands.value.find((x) => x.id === id)
  const key = b ? b.en.toUpperCase() : ''
  if (!POPULAR_BRANDS.includes(key)) return
  try {
    const o = { ...brandClicks.value }
    o[key] = (o[key] || 0) + 1
    brandClicks.value = o
    localStorage.setItem(BRAND_CLICK_KEY, JSON.stringify(o))
  } catch (e) {
    // 存不進去就算了，只是排序不記住
  }
}
const brandDropItems = computed(() => {
  const pop = []
  const rest = []
  for (const b of brands.value) {
    const i = POPULAR_BRANDS.indexOf(b.en.toUpperCase())
    if (i >= 0) pop.push({ b, i })
    else rest.push(b)
  }
  pop.sort((x, y) => (brandClicks.value[POPULAR_BRANDS[y.i]] || 0) - (brandClicks.value[POPULAR_BRANDS[x.i]] || 0) || x.i - y.i)
  const out = [...pop.map((x) => x.b), ...rest].map((b) => ({ v: b.id, label: b.name, sub: '', on: S.brandId === b.id }))
  if (pop.length && out.length > pop.length) {
    out[0].head = t('cfFinder.popular')
    out[pop.length].head = t('cfFinder.otherBrands')
  }
  return out
})
const dropItems = computed(() => {
  if (S.open === 1) return brandDropItems.value
  if (S.open === 2) {
    if (framesState.value !== 'ok') return []
    return models.value.map((m) => ({
      v: m.name,
      label: m.name,
      sub: t('cfFinder.frameCount', { n: m.count }),
      on: S.model === m.name
    }))
  }
  if (S.open === 3) {
    const items = [{ v: 'all', label: t('cfFinder.allYears'), sub: t('cfFinder.allYearsSub'), on: !S.year && S.gi === null }]
    for (const y of yearList.value) {
      const n = hitsOf(y).length
      items.push({ v: y, label: String(y), sub: n > 1 ? t('cfFinder.yearHits', { n }) : '', on: S.year === y })
    }
    return items
  }
  return []
})

// ── 狀態切換（對照草稿的 setBrand／setModel／setYear／setYearNum／back） ──
function setBrand(id) {
  if (id !== S.brandId) {
    S.model = null
    S.gi = null
    S.year = null
  }
  S.brandId = id
  S.step = 2
  S.all = false
  missYear.value = null
}
function setModel(name) {
  S.model = name
  S.step = 3
  S.all = false
  S.gi = null
  S.year = null
  missYear.value = null
}
function setGroup(i) {
  S.gi = i
  S.vi = 0
  S.year = null
  S.step = 4
  S.all = false
  missYear.value = null
}
function setYearNum(yr) {
  S.vi = 0
  S.all = false
  missYear.value = null
  const h = hitsOf(yr)
  if (h.length === 1) {
    S.year = yr
    S.gi = h[0]
    S.step = 4
  } else if (h.length > 1) {
    S.year = yr
    S.gi = null
    S.step = 5
  } else {
    // 這一年沒有車框（通常是網址帶了不存在的年份）：回到全部年份，並提示
    S.year = null
    S.gi = null
    S.step = 3
    missYear.value = yr
  }
}
function applyPendingYear() {
  if (pendingYear === null || !S.model || framesState.value !== 'ok') return
  const y = pendingYear
  pendingYear = null
  setYearNum(y)
  syncUrl()
}

function modelIdOf(name) {
  if (!name || !S.brandId) return null
  const c = cars.value.find((x) => Number(x.car_brand_id) === S.brandId && x.name === name)
  return c ? Number(c.id) : null
}

// 網址跟著狀態走（用 replace，不會塞一堆「上一頁」紀錄）
function syncUrl() {
  const query = {}
  if (S.brandId) query.brand = String(S.brandId)
  const mid = modelIdOf(S.model)
  if (mid) query.model = String(mid)
  if (S.year) query.year = String(S.year)
  const cur = route.query
  if (cur.brand === query.brand && cur.model === query.model && cur.year === query.year && Object.keys(cur).length === Object.keys(query).length) return
  router.replace({ query })
}
function shareUrl(year) {
  const p = new URLSearchParams()
  if (S.brandId) p.set('brand', String(S.brandId))
  const mid = modelIdOf(S.model)
  if (mid) p.set('model', String(mid))
  if (year) p.set('year', String(year))
  const qs = p.toString()
  return `${siteUrl}/carFrame${qs ? '?' + qs : ''}`
}
function lineHref(year) {
  return 'https://social-plugins.line.me/lineit/share?url=' + encodeURIComponent(shareUrl(year))
}
function fbHref(year) {
  return 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(shareUrl(year))
}
const copied = ref(false)
let copiedTimer = null
async function copyLink(year) {
  const url = shareUrl(year)
  let ok = false
  try {
    await navigator.clipboard.writeText(url)
    ok = true
  } catch (e) {
    try {
      const ta = document.createElement('textarea')
      ta.value = url
      ta.setAttribute('readonly', '')
      ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0'
      document.body.appendChild(ta)
      ta.select()
      ok = document.execCommand('copy')
      document.body.removeChild(ta)
    } catch (e2) {
      ok = false
    }
  }
  if (!ok) return
  copied.value = true
  clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => (copied.value = false), 2000)
}

// 每次切換步驟：同步網址、如果人已經捲到流程下面就捲回流程開頭、標題閃一下
function changed(scroll = true) {
  syncUrl()
  if (scroll) flashKey.value++
  nextTick(() => {
    if (scroll) toTop(false)
    onScroll() // 內容高度變了，浮動路徑列要不要出現重新判斷一次
  })
}

function pickBrand(id) {
  bumpBrandClick(id)
  S.open = null
  setBrand(id)
  changed()
}
function pickModel(name) {
  S.open = null
  setModel(name)
  changed()
}
function pickGroup(i) {
  setGroup(i)
  changed()
}
function pickFromHits(i) {
  S.gi = i
  S.vi = 0
  S.step = 4
  changed()
}
function showAll() {
  S.all = true
  S.gi = null
  changed()
}
function backAllYears() {
  S.step = 3
  S.all = false
  S.gi = null
  S.year = null
  missYear.value = null
  changed()
}
function toCompare() {
  S.step = 5
  S.gi = null
  changed()
}
function back() {
  S.open = null
  if (S.step === 4 && S.year && yearHits.value.length > 1) {
    S.step = 5
    S.gi = null
  } else if (S.step >= 4) {
    S.step = 3
    S.gi = null
    S.year = null
  } else {
    S.step = Math.max(1, S.step - 1)
  }
  S.all = false
  missYear.value = null
  changed()
}

function onField(k) {
  const f = fields.value.find((x) => x.k === k)
  if (!f || f.dis) return
  if (S.open === k) {
    S.open = null
    return
  }
  S.open = k
  S.step = k
  if (k === 3) S.all = false
}
function onPick(v) {
  const k = S.open
  S.open = null
  if (k === 1) {
    bumpBrandClick(v)
    setBrand(v)
  } else if (k === 2) setModel(v)
  else if (v === 'all') {
    S.step = 3
    S.gi = null
    S.year = null
    S.all = false
    missYear.value = null
  } else setYearNum(Number(v))
  changed()
}
function onGo() {
  S.open = null
  if (!S.brandId) {
    // 什麼都還沒選：直接打開車廠選單，引導從第一格開始
    S.step = 1
    S.open = 1
    return
  }
  if (S.model && S.year) setYearNum(S.year)
  else if (S.model && S.gi !== null && curGroup.value) S.step = 4
  else if (S.model) S.step = 3
  else S.step = 2
  S.all = false
  changed()
  scrollToResults()
}

// 按「查詢」後直接捲到結果，不用自己往下滑（要扣掉表頭、浮動路徑列的高度）
function scrollToResults() {
  nextTick(() => {
    setTimeout(() => {
      const el = bodyEl.value
      if (!el) return
      const top = el.getBoundingClientRect().top + window.pageYOffset - headerBottom() - 60
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
    }, 60)
  })
}

// ── 網址帶參數進來（首頁、LINE 分享）：直接開到對的那一步（伺服器端、瀏覽器端算出來一樣，不會水合不一致） ──
function qNum(v) {
  const n = parseInt(Array.isArray(v) ? v[0] : v, 10)
  return Number.isFinite(n) ? n : null
}
const qBrand = qNum(route.query.brand)
const deepLink = !!(qBrand && brands.value.some((b) => b.id === qBrand))
if (deepLink) {
  setBrand(qBrand)
  const qModel = qNum(route.query.model)
  const car = qModel ? cars.value.find((c) => Number(c.id) === qModel && Number(c.car_brand_id) === qBrand) : null
  if (car) {
    setModel(car.name)
    const qYear = qNum(route.query.year)
    if (qYear) pendingYear = qYear
  }
}

// 換車廠就去抓那個車廠的車框（只在瀏覽器端）
watch(
  () => S.brandId,
  (id) => {
    if (import.meta.client) loadBrandFrames(id)
  }
)

// ── 畫面互動：點外面收起選單、Esc 收起、浮動路徑列 ──
const rootEl = ref(null)
const hfEl = ref(null)
const bodyEl = ref(null)
const dropEl = ref(null)
const headerH = ref(0)
const miniShow = ref(false)

function headerBottom() {
  const h = document.querySelector('header')
  return h ? Math.max(0, Math.round(h.getBoundingClientRect().bottom)) : 0
}
function toTop(force) {
  const el = rootEl.value
  if (!el) return
  const top = el.getBoundingClientRect().top + window.pageYOffset - headerBottom() - 8
  if (force || window.pageYOffset > top) {
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
  }
}
function onScroll() {
  headerH.value = headerBottom()
  const hf = hfEl.value
  const root = rootEl.value
  if (!hf || !root) {
    miniShow.value = false
    return
  }
  const barGone = hf.getBoundingClientRect().bottom < headerH.value + 8
  const flowStillHere = root.getBoundingClientRect().bottom > headerH.value + 80
  miniShow.value = !!(S.brandId && barGone && flowStillHere)
}
function onDocClick(ev) {
  if (!S.open) return
  const target = ev.target
  if (hfEl.value && hfEl.value.contains(target)) return
  if (dropEl.value && dropEl.value.contains(target)) return
  S.open = null
}
function onKey(ev) {
  if (lb.open) {
    if (ev.key === 'Escape') closeLb()
    else if (ev.key === 'ArrowLeft') lbStep(-1)
    else if (ev.key === 'ArrowRight') lbStep(1)
    else if (ev.key === '+' || ev.key === '=') lbZoom(0.5)
    else if (ev.key === '-') lbZoom(-0.5)
    return
  }
  if (ev.key === 'Escape' && S.open) S.open = null
}

// 首頁「查詢」按下去時會在 localStorage 放一份選好的車（備份用，網址本來也有帶）。
// 網址沒帶參數時才用它；讀完一律刪掉，而且只認 10 分鐘內的，之後從選單進來就是乾淨的第一步。
let usedStored = false
function readStoredCar() {
  try {
    const raw = localStorage.getItem('mmFinderCar')
    localStorage.removeItem('mmFinderCar')
    if (!raw || deepLink) return
    const v = JSON.parse(raw)
    if (!v || Date.now() - Number(v.t || 0) > 10 * 60 * 1000) return
    const b = qNum(v.brand)
    if (!b || !brands.value.some((x) => x.id === b)) return
    setBrand(b)
    const m = qNum(v.model)
    const car = m ? cars.value.find((c) => Number(c.id) === m && Number(c.car_brand_id) === b) : null
    if (car) {
      setModel(car.name)
      const y = qNum(v.year)
      if (y) pendingYear = y
    }
    usedStored = true
  } catch (e) {
    // 讀不到就照一般流程
  }
}

onMounted(() => {
  // 伺服器端抓車廠失敗時，瀏覽器端再補抓一次
  if (!carData.value) refreshCar()
  loadBrandClicks()
  readStoredCar()
  if (usedStored) syncUrl()
  loadBrandFrames(S.brandId)
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKey)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  onScroll()
  // 從別處帶參數進來：直接捲到查詢列，不用自己往下滑
  if (deepLink || usedStored) setTimeout(() => toTop(true), 80)
})
onBeforeUnmount(() => {
  if (lb.open) closeLb()
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKey)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
})
</script>

<style scoped>
/* 顏色照草稿（MM 美邁頁：深藍 #023059＋橘 #F28729） */
.cff {
  --navy: #023059;
  --ink: #0d1b2e;
  --text: #1b2431;
  --muted: #5b6675;
  --dim: #93a0b0;
  --line: #e6ebf1;
  --bg2: var(--site-bg2, #f5f7fa);
  --orange: #f28729;
  --dark: var(--site-dark, #0d1016);
  color: var(--text);
}
/* 用最低權重的元素選擇器，才不會蓋掉下面各按鈕自己設定的顏色 */
button { font-family: inherit; cursor: pointer; }
a { color: inherit; text-decoration: none; }
img { display: block; }

/* ── 快速查詢列 ── */
.hf {
  margin: 12px 0 4px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: #fff;
  padding: 6px;
  box-shadow: 0 8px 22px rgba(13, 27, 46, 0.06);
  display: grid;
  grid-template-columns: 1fr;
}
.hf .f {
  position: relative;
  display: block;
  width: 100%;
  text-align: left;
  border: 0;
  background: transparent;
  padding: 9px 34px 9px 20px;
  border-radius: 9px;
  min-width: 0;
}
.hf .f + .f { border-top: 1px solid #eef1f5; }
.hf .f .led {
  position: absolute; left: 9px; top: 12px; bottom: 12px; width: 2px; border-radius: 2px;
  background: #e1e7ee; transition: background 0.2s;
}
.hf .f .cap { display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.15em; color: var(--dim); margin-bottom: 1px; }
.hf .f .val {
  display: block; font-size: 14.5px; font-weight: 500; color: #8a96a6;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; height: 23px; line-height: 23px;
}
.hf .f.ch .val { color: var(--ink); font-weight: 700; }
.hf .f:hover { background: var(--bg2); }
.hf .f.cur { background: var(--bg2); }
.hf .f.cur .led { background: var(--orange); }
.hf .f.cur .cap { color: var(--navy); }
.hf .f.dis { opacity: 0.45; cursor: default; }
.hf .f.dis:hover { background: transparent; }
.hf .f .cv {
  position: absolute; right: 16px; top: 22px; width: 7px; height: 7px;
  border-right: 2px solid #a5b1bf; border-bottom: 2px solid #a5b1bf;
  transform: rotate(45deg); transition: transform 0.2s;
}
.hf .f.open .cv { transform: rotate(-135deg); border-color: var(--navy); top: 26px; }
.hf .f:focus-visible, .hf .go:focus-visible { outline: 2px solid var(--navy); outline-offset: 2px; }
.hf .go {
  height: 46px; margin-top: 6px; border: 0; border-radius: 9px;
  background: var(--orange); color: #1a1205; font-weight: 700; font-size: 14.5px;
  transition: filter 0.16s;
}
.hf .go:hover { filter: brightness(1.06); }
/* 平板（直立 iPad 768）以上就改成橫排，不然三格直排會佔掉半個畫面 */
@media (min-width: 740px) {
  .hf { grid-template-columns: 1fr 1fr 1fr auto; align-items: center; }
  .hf .f + .f { border-top: 0; }
  .hf .f + .f::before { content: ''; position: absolute; left: 0; top: 9px; bottom: 9px; width: 1px; background: #eef1f5; }
  .hf .go { margin: 0 0 0 6px; padding: 0 22px; }
}
@media (min-width: 900px) { .hf .go { padding: 0 26px; } }

/* ── 點欄位後展開的選單（深色，照草稿） ── */
.drop2 {
  margin-top: 6px;
  border-radius: 12px;
  background: linear-gradient(180deg, #1c242f, #12181f);
  border: 1px solid #33404f;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.35);
  padding: 5px;
  max-height: 300px;
  overflow: auto;
  overscroll-behavior: contain;
}
@media (min-width: 740px) { .drop2 { max-width: 520px; } }
.drop2 .dh { font-size: 10.5px; letter-spacing: 0.12em; color: rgba(255, 255, 255, 0.4); font-weight: 700; padding: 5px 8px 4px; }
.drop2 .dst { font-size: 13px; color: rgba(255, 255, 255, 0.6); padding: 8px 10px; }
.drop2 button {
  width: 100%; border: 0; background: transparent; text-align: left;
  padding: 9px 10px; border-radius: 8px; font-size: 14px; font-weight: 600;
  color: rgba(255, 255, 255, 0.82); display: flex; justify-content: space-between; align-items: baseline; gap: 8px;
}
.drop2 button small { color: rgba(255, 255, 255, 0.4); font-size: 11px; font-weight: 500; white-space: nowrap; }
.drop2 button:hover, .drop2 button:focus-visible { background: rgba(2, 48, 89, 0.5); color: #fff; outline: 0; }
.drop2 button.on { background: rgba(2, 48, 89, 0.7); color: #fff; }
.drop2 .dh.sub { padding-top: 9px; }
.selhint { font-size: 12.5px; color: var(--dim); margin-top: 5px; text-align: center; }

/* ── 浮動路徑列（往下捲、查詢列看不到時出現） ── */
.mini {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 40;
  height: 50px;
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--line);
  transform: translateY(-110%);
  opacity: 0;
  visibility: hidden;
  transition: transform 0.2s, opacity 0.2s, visibility 0.2s;
}
.mini.show { transform: none; opacity: 1; visibility: visible; }
.mini-in { max-width: 1080px; height: 100%; margin: 0 auto; padding: 0 26px; display: flex; align-items: center; gap: 10px; }
.mini .bk2 {
  flex: none; height: 34px; border-radius: 9px; border: 1px solid var(--line); background: #fff;
  font-size: 12.5px; font-weight: 500; color: var(--ink); padding: 0 10px 0 22px; position: relative; white-space: nowrap;
}
.mini .bk2::before {
  content: ''; position: absolute; left: 10px; top: 50%; width: 7px; height: 7px; margin-top: -4px;
  border-left: 2.5px solid var(--ink); border-bottom: 2.5px solid var(--ink); transform: rotate(45deg);
}
.mini .p { flex: 1; min-width: 0; font-size: 13px; font-weight: 700; color: var(--ink); line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mini .p small { display: block; font-size: 10px; color: var(--dim); font-weight: 700; letter-spacing: 0.08em; }
@media (max-width: 640px) { .mini-in { padding: 0 16px; } }

/* ── 步驟內容 ── */
.body { margin-top: 12px; }
.sT { display: flex; align-items: center; gap: 10px; font-size: clamp(18px, 2.2vw, 22px); font-weight: 900; color: var(--ink); margin: 14px 0 12px; border-radius: 8px; }
.sT i { font-style: normal; width: 26px; height: 26px; border-radius: 50%; background: var(--navy); color: #fff; font-size: 13px; font-weight: 700; display: grid; place-items: center; flex: none; }
.stat { font-size: 14px; color: var(--muted); padding: 18px 0; }
.stat-link { margin-left: 8px; color: var(--navy); font-weight: 700; white-space: nowrap; }
.hint2 { font-size: 12.5px; color: var(--dim); margin: -2px 0 10px; }
.hint2 b { color: var(--muted); }

/* 車廠牆 */
/* 欄數依寬度自動排（每格至少 96px／電腦 108px），像 MITSUBISHI、Volkswagen 這種長名字才不會被從字中間切斷；
   手機 3 欄（最窄的 320 手機 2 欄）、平板 5～7 欄、電腦 8 欄 */
.lw { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 7px; margin: 6px 0 4px; }
@media (min-width: 600px) { .lw { gap: 9px; } }
@media (min-width: 800px) { .lw { grid-template-columns: repeat(auto-fill, minmax(108px, 1fr)); } }
.lw button {
  min-height: 58px; border: 1px solid var(--line); border-radius: 14px; background: #fff;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; padding: 6px 4px;
  transition: border-color 0.18s, box-shadow 0.18s, background 0.18s, transform 0.18s;
}
.lw button:hover { border-color: #c9d3df; box-shadow: 0 10px 24px rgba(13, 27, 46, 0.08); transform: translateY(-1px); }
.lw b { font-size: 12px; font-weight: 700; letter-spacing: 0.03em; color: var(--ink); line-height: 1.15; text-align: center; word-break: keep-all; }
@media (min-width: 800px) { .lw b { font-size: 13px; letter-spacing: 0.06em; } }
.lw small { font-size: 11px; color: var(--dim); line-height: 1; }
.lw button.on { background: var(--navy); border-color: var(--navy); }
.lw button.on b { color: #fff; }
.lw button.on small { color: rgba(255, 255, 255, 0.6); }

/* 車款磚 */
.mt { display: grid; grid-template-columns: repeat(2, 1fr); gap: 7px; }
@media (min-width: 600px) { .mt { grid-template-columns: repeat(3, 1fr); gap: 9px; } }
@media (min-width: 800px) { .mt { grid-template-columns: repeat(4, 1fr); } }
.mt button {
  display: block; width: 100%;
  border: 1px solid var(--line); background: #fff; border-radius: 14px; padding: 10px 12px; text-align: left; min-height: 58px;
  transition: border-color 0.18s, box-shadow 0.18s;
}
.mt button:hover { border-color: #c9d3df; box-shadow: 0 10px 24px rgba(13, 27, 46, 0.08); }
.mt button.on { border-color: var(--navy); box-shadow: inset 0 0 0 1px var(--navy); }
.mt button b { display: block; font-size: 15px; font-weight: 700; color: var(--ink); overflow-wrap: anywhere; }
.mt button span { font-size: 12px; color: var(--dim); }

/* 年份卡（看框比對） */
.yc { display: grid; grid-template-columns: repeat(2, 1fr); gap: 9px; }
@media (min-width: 600px) { .yc { grid-template-columns: repeat(3, 1fr); gap: 12px; } }
@media (min-width: 800px) { .yc { grid-template-columns: repeat(4, 1fr); gap: 14px; } }
.yc button {
  display: block; width: 100%;
  border: 1px solid var(--line); background: #fff; border-radius: 14px; padding: 0; text-align: left; overflow: hidden;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
}
.yc button:hover { border-color: #c9d3df; box-shadow: 0 10px 24px rgba(13, 27, 46, 0.08); transform: translateY(-2px); }
.yc .im { position: relative; aspect-ratio: 4 / 3; background: #fff; display: grid; place-items: center; border-bottom: 1px solid #f0f3f7; }
.yc .im img { max-width: 88%; max-height: 84%; object-fit: contain; mix-blend-mode: multiply; }
.yc .n { position: absolute; left: 7px; top: 7px; font-size: 11px; font-weight: 700; border-radius: 6px; padding: 1px 7px; }
.yc .n.c { background: #fff3df; color: #9a6208; }
.yc .th { display: flex; gap: 4px; padding: 6px 8px 0; }
.yc .th span { flex: 1; min-width: 0; height: 30px; border: 1px solid #eef1f5; border-radius: 6px; display: grid; place-items: center; overflow: hidden; background: #fff; }
.yc .th img { max-width: 90%; max-height: 26px; object-fit: contain; mix-blend-mode: multiply; }
.yc .tx { display: block; padding: 8px 10px 10px; }
.yc .tx b { display: block; font-size: 16px; font-weight: 700; color: var(--ink); line-height: 1.25; }
.yc .tx span { font-size: 12px; color: var(--dim); }
.allLink {
  display: block; margin: 14px auto 2px; border: 0; background: transparent;
  font-size: 12.5px; font-weight: 700; color: var(--navy);
}
.allLink:hover { text-decoration: underline; }

/* 圖片佔位（沒圖或圖壞掉） */
.ph { display: block; width: 64%; height: 58%; border-radius: 8px; background: linear-gradient(160deg, #3d4756, #232a34); box-shadow: inset 0 0 0 6px #4b5665; }
.th .ph { width: 70%; height: 60%; box-shadow: inset 0 0 0 3px #4b5665; }

/* 店家比對卡 */
.g4 { display: grid; grid-template-columns: 1fr; gap: 10px; }
@media (min-width: 600px) { .g4 { grid-template-columns: 1fr 1fr; } }
.pairCard { border: 1px solid var(--line); border-radius: 16px; overflow: hidden; background: #fff; }
.pairCard .top { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; padding: 10px 13px 6px; }
.pairCard .top .yr { border: 0; background: transparent; padding: 0; font-size: 15px; font-weight: 900; color: var(--ink); }
.pairCard .top .yr:hover { color: var(--navy); }
.pairCard .top span { font-size: 11px; color: var(--dim); text-align: right; }
.ba { display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid #f0f3f7; border-bottom: 1px solid #f0f3f7; }
.ba > div { aspect-ratio: 4 / 3; position: relative; display: grid; place-items: center; background: #fff; overflow: hidden; }
.ba > div + div { border-left: 1px solid #f0f3f7; }
.ba > div.empty { background: var(--bg2); }
.ba .fi { width: 90%; height: 80%; object-fit: contain; mix-blend-mode: multiply; }
.ba .pi { width: 100%; height: 100%; object-fit: cover; }
.lab {
  position: absolute; left: 7px; top: 7px; z-index: 4; font-size: 10px; font-weight: 700; color: #fff;
  background: rgba(13, 27, 46, 0.72); border-radius: 5px; padding: 1px 7px;
}
.none { font-size: 12.5px; color: var(--dim); font-weight: 700; }
.pairCard .ft { display: flex; align-items: center; gap: 6px; padding: 9px 11px 11px; flex-wrap: wrap; }
.pairCard .ft .z { font-size: 11px; font-weight: 700; color: var(--navy); background: #eef2f7; border-radius: 6px; padding: 1px 8px; }
.pairCard .ft .dl {
  margin-left: auto; height: 34px; border-radius: 10px; border: 1.5px solid var(--line); background: #fff; color: var(--navy);
  font-size: 12px; font-weight: 700; padding: 0 10px; display: inline-flex; align-items: center;
}
.lineBtn {
  display: inline-flex; align-items: center; justify-content: center; gap: 7px; height: 34px; border-radius: 10px;
  background: #06c755; color: #fff; font-weight: 900; font-size: 12.5px; padding: 0 11px;
}
.lineBtn i, .resAct .l i {
  font-style: normal; font-size: 10px; font-weight: 900; background: #fff; color: #06c755; border-radius: 5px; padding: 1px 4px;
}

/* 結果標題、提示框 */
.yh { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; margin: 2px 0 10px; border-radius: 8px; }
.yh b { font-size: clamp(18px, 2.2vw, 22px); font-weight: 900; color: var(--ink); }
.yh span { font-size: 13px; color: var(--dim); }
.vbox { border-radius: 12px; padding: 10px 12px; font-size: 13px; margin-bottom: 10px; line-height: 1.7; }
.vbox.confirm { background: #fff6e6; border: 1px solid #f1cf8f; color: #6b4b07; }
.backOv { display: inline-block; margin: 0 0 8px; border: 0; background: transparent; padding: 0; font-size: 12.5px; font-weight: 700; color: var(--navy); }
.vch { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
.vch button {
  display: flex; flex-direction: column; align-items: flex-start; gap: 1px; text-align: left;
  border: 1px solid var(--line); background: #fff; border-radius: 12px; padding: 8px 12px; min-height: 44px;
  font-size: 13px; font-weight: 700; color: var(--ink);
}
@media (min-width: 800px) { .vch button { min-width: 160px; } }
.vch button small { font-size: 11px; color: var(--dim); font-weight: 600; }
.vch button.on { border-color: var(--navy); color: var(--navy); background: var(--bg2); box-shadow: inset 0 0 0 1px var(--navy); }
.vch button.on small { color: var(--muted); }

/* 結果卡：左邊車框＋完工照，右邊資訊 */
.big { border: 1px solid var(--line); border-radius: 16px; overflow: hidden; background: #fff; }
.big .inf { padding: 14px 16px 16px; }
.inf-top > h3 { margin: 0; }
.big .inf h3 { font-size: 18px; font-weight: 700; color: var(--ink); line-height: 1.45; overflow-wrap: anywhere; }
/* 相簿式結果卡（照草稿 .gal2）：左邊大圖＋縮圖列，右邊資訊；800px 以上左右並排 */
.gal2 { display: grid; grid-template-columns: 1fr; container-type: inline-size; }
.gal2 .gcol { min-width: 0; }
.gstage {
  position: relative; aspect-ratio: 4 / 3; background: #10161f; overflow: hidden; cursor: zoom-in;
  display: grid; place-items: center; outline: none;
}
.gstage.light { background: linear-gradient(150deg, #f2f5f9, #e4ebf3); }
.gstage:focus-visible { box-shadow: inset 0 0 0 3px rgba(242, 135, 41, 0.6); }
.gstage .fi { width: 88%; height: 84%; object-fit: contain; mix-blend-mode: multiply; }
.gstage .pi { width: 100%; height: 100%; object-fit: cover; }
.gstage .ph { width: 64%; height: 58%; }
.glab {
  position: absolute; left: 10px; top: 10px; z-index: 4; font-size: 11.5px; font-weight: 800; color: #fff;
  background: rgba(13, 27, 46, 0.74); border-radius: 6px; padding: 2px 9px;
}
.gzm { position: absolute; right: 8px; top: 8px; z-index: 4; pointer-events: none; filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.65)) drop-shadow(0 0 1px rgba(0, 0, 0, 0.5)); }
.gzm svg { display: block; }
.gcnt {
  position: absolute; right: 10px; bottom: 10px; z-index: 4; background: rgba(13, 27, 46, 0.78); color: #fff;
  font-size: 12px; font-weight: 800; border-radius: 8px; padding: 2px 10px;
}
.garr {
  position: absolute; top: 50%; transform: translateY(-50%); width: 38px; height: 38px; border-radius: 50%; border: 0;
  background: rgba(255, 255, 255, 0.92); color: #0d1b2e; font-size: 20px; font-weight: 900; cursor: pointer; z-index: 5; line-height: 1;
}
.garr.gp { left: 10px; }
.garr.gnx { right: 10px; }
.gthumbs { display: flex; gap: 8px; padding: 10px; border-top: 1px solid #eef1f5; overflow-x: auto; scrollbar-width: none; background: #fff; }
.gthumbs::-webkit-scrollbar { display: none; }
.gth {
  flex: none; width: 86px; height: 64px; border-radius: 9px; border: 2px solid transparent; background: #eef2f7;
  padding: 0; position: relative; overflow: hidden; cursor: pointer;
}
.gth.on { border-color: var(--orange); }
.gth .gtp { position: absolute; inset: 0; display: grid; place-items: center; overflow: hidden; }
.gth .gtp img { width: 100%; height: 100%; object-fit: cover; }
.gth .gtp img.fit { object-fit: contain; mix-blend-mode: multiply; }
.gth .gtp .ph { width: 60%; height: 55%; }
.gth em {
  position: absolute; left: 0; right: 0; bottom: 0; font-style: normal; font-size: 10.5px; font-weight: 700; color: #fff;
  background: rgba(13, 27, 46, 0.72); text-align: center; padding: 1px 0;
}
.chips { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
.chip { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: var(--navy); background: #eef4fa; border-radius: 999px; padding: 3px 10px; }
.chip i { width: 7px; height: 7px; border-radius: 50%; background: var(--orange); }
.chip.off { color: var(--dim); background: var(--bg2); }
.chip.off i { background: #c3ccd8; }
.inf { display: flex; flex-direction: column; gap: 10px; }
.inf-act { display: flex; flex-direction: column; }
.detBtn.viewall { gap: 8px; border: 2px solid var(--navy); color: var(--navy); font-weight: 900; height: 50px; }
.detBtn.viewall:hover { background: #eef4fa; }
.detBtn.viewall b { background: var(--orange); color: #fff; border-radius: 999px; font-size: 12px; font-weight: 800; padding: 1px 9px; }
.detBtn.viewall .chev { font-size: 18px; line-height: 1; }
@media (min-width: 800px) {
  /* 電腦版（版本 B）：縮圖直排在大圖左邊、大圖放大；右欄資料在上、按鈕貼底 */
  .big.one.gal2 { grid-template-columns: 1.12fr 1fr; }
  .big.one .inf { border-left: 1px solid #f0f3f7; padding: 18px 20px; justify-content: space-between; }
  .gal2 .gcol { display: grid; grid-template-columns: 96px 1fr; grid-template-rows: 1fr; }
  /* 只有一張圖時沒有縮圖欄：大圖要佔滿整欄，不然會被塞進 96px 的縮圖欄位（2026-10-02 修） */
  .gal2 .gcol.solo { grid-template-columns: 1fr; }
  .gal2 .gthumbs { order: -1; flex-direction: column; overflow-y: auto; overflow-x: hidden; border-top: 0; border-right: 1px solid #eef1f5; padding: 10px 8px; min-height: 0; max-height: 100%; }
  .gal2 .gth { width: 78px; height: 60px; }
  .gal2 .gstage { aspect-ratio: auto; min-height: 420px; height: 100%; }
}
@media (max-width: 799px) {
  /* 手機：大圖、縮圖列、資料、按鈕；分享列貼在卡片底部 */
  .gal2 .resAct.one { position: sticky; bottom: 0; background: #fff; z-index: 6; border-top: 1px solid #eef1f5; margin: 12px -16px 0; padding: 10px 16px 4px; }
}
.need {
  display: inline-block; font-size: 11px; font-weight: 700; color: #9a6208; background: #fff3df;
  border: 1px solid #f1cf8f; border-radius: 6px; padding: 0 7px; margin-left: 6px; vertical-align: 2px; white-space: nowrap;
}
.pairCard .ft .need { margin-left: 0; }
.kv { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; margin: 9px 0 10px; }
.kv div { background: var(--bg2); border-radius: 9px; padding: 6px 9px; min-width: 0; }
.kv span { display: block; font-size: 11px; color: var(--dim); letter-spacing: 0.08em; }
.kv b { font-size: 14px; font-weight: 700; color: var(--ink); }
.frameNote { margin-top: 10px; background: var(--bg2); border-radius: 10px; padding: 9px 11px; font-size: 13px; color: var(--muted); line-height: 1.75; }
.frameNote b { color: var(--ink); }
.detBtn {
  display: flex; align-items: center; justify-content: center; width: 100%; margin-top: 10px; height: 46px;
  border-radius: 9px; border: 1px solid var(--line); background: #fff; color: var(--ink); font-weight: 500; font-size: 14px; white-space: nowrap;
}
.detBtn:hover { background: var(--bg2); }
.resAct { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
.resAct a {
  height: 50px; border-radius: 9px; display: flex; align-items: center; justify-content: center; gap: 7px;
  font-weight: 700; font-size: 14px; text-align: center; padding: 0 6px; line-height: 1.25;
}
/* 小手機（寬度 375 以下，例如 360／320 的安卓機、iPhone SE 一代）兩顆按鈕改上下排，「找經銷店確認安裝」才不會被擠成兩行 */
@media (max-width: 374px) {
  .resAct { grid-template-columns: 1fr; }
  .resAct a { height: 48px; }
}
.resAct.one { grid-template-columns: 1fr; }
.otherY.inC { margin-top: 8px; }
.shRow { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; margin-top: 8px; }
.resAct.one .shRow { margin-top: 0; }
.shRow .sh {
  height: 44px; border-radius: 9px; display: flex; align-items: center; justify-content: center; gap: 5px;
  font-size: 12.5px; font-weight: 700; padding: 0 4px; white-space: nowrap; border: 1px solid var(--line);
  background: #fff; color: var(--ink);
}
.shRow .sh i { font-style: normal; font-size: 10px; font-weight: 900; border-radius: 4px; padding: 1px 4px; color: #fff; }
.shRow .sh.ln { color: #06c755; border-color: #b9ebd0; }
.shRow .sh.ln i { background: #06c755; }
.shRow .sh.fb { color: #1877f2; border-color: #bfd6fb; }
.shRow .sh.fb i { background: #1877f2; }
.shRow .sh:hover { background: var(--bg2); }
@media (max-width: 374px) { .shRow .sh { font-size: 11.5px; } .shRow .sh i { display: none; } }
.resAct .d { background: var(--orange); color: #1a1205; }
.resAct.one a { height: 46px; }
.resAct a:hover, .lineBtn:hover { filter: brightness(1.05); }
.otherY {
  display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 14px; height: 44px; width: 100%;
  border-radius: 9px; border: 1px solid var(--line); background: #fff; font-size: 13px; font-weight: 500; color: var(--ink);
}
.otherY:hover { background: var(--bg2); }

.disc { margin-top: 26px; padding-top: 12px; border-top: 1px solid var(--line); font-size: 12px; color: var(--dim); line-height: 1.7; }
.disc b { color: var(--muted); font-weight: 700; }

/* 換步驟時的提示：淡淡的橘底一閃 */
.flash { animation: cffFlash 1s ease; }
@keyframes cffFlash {
  0% { background: rgba(242, 135, 41, 0.14); box-shadow: 0 0 0 8px rgba(242, 135, 41, 0.14); }
  100% { background: transparent; box-shadow: 0 0 0 8px rgba(242, 135, 41, 0); }
}
@media (prefers-reduced-motion: reduce) {
  .flash { animation: none; }
  .mini, .lw button, .yc button, .mt button { transition: none; }
}
</style>

<style>
/* 放大檢視掛在 body 底下，所以不能 scoped（CarFrameFinder.vue） */
.lbx { position: fixed; inset: 0; z-index: 99999; background: #06090f; display: flex; }
html.lbopen { overflow: hidden; }
.lbx .lbtop {
  position: absolute; left: 0; right: 0; top: 0; z-index: 6; display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px; color: #fff; background: linear-gradient(rgba(6, 10, 16, 0.8), transparent);
}
.lbx .lbtop b { font-size: 14px; font-weight: 700; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-right: 10px; }
.lbx .lbclose { flex: none; width: 40px; height: 40px; border-radius: 50%; border: 0; background: rgba(255, 255, 255, 0.16); color: #fff; font-size: 18px; cursor: pointer; }
.lbx .lbcv { position: absolute; inset: 0; display: grid; place-items: center; overflow: hidden; touch-action: none; cursor: zoom-in; }
.lbx .lbcv.zoomed { cursor: grab; }
.lbx .lbs { width: min(92vw, 1000px); aspect-ratio: 4 / 3; position: relative; transition: transform 0.12s; transform-origin: center; border-radius: 8px; overflow: hidden; background: #10161f; display: grid; place-items: center; }
.lbx .lbs.light { background: linear-gradient(150deg, #f2f5f9, #e4ebf3); }
.lbx .lbs img { max-width: 100%; max-height: 100%; width: auto; height: auto; user-select: none; -webkit-user-drag: none; }
.lbx .lbs .ph { display: block; width: 60%; height: 55%; border-radius: 8px; background: linear-gradient(160deg, #3d4756, #232b36); }
.lbx .garr { position: absolute; top: 50%; transform: translateY(-50%); width: 42px; height: 42px; border-radius: 50%; border: 0; background: rgba(255, 255, 255, 0.16); color: #fff; font-size: 22px; font-weight: 900; cursor: pointer; z-index: 6; line-height: 1; }
.lbx .garr.gp { left: 12px; }
.lbx .garr.gnx { right: 12px; }
.lbx .lbtools {
  position: absolute; left: 50%; bottom: 18px; transform: translateX(-50%); z-index: 6; display: flex; gap: 6px; align-items: center;
  background: rgba(255, 255, 255, 0.14); border-radius: 999px; padding: 5px; backdrop-filter: blur(6px);
}
.lbx .lbtools button { min-width: 40px; height: 40px; border-radius: 999px; border: 0; background: transparent; color: #fff; font-size: 20px; font-weight: 800; cursor: pointer; }
.lbx .lbtools button.rs { font-size: 13px; padding: 0 12px; white-space: nowrap; }
.lbx .lbtools span { color: #fff; font-size: 12px; min-width: 46px; text-align: center; }
</style>
