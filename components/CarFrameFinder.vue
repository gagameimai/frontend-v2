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
        <button type="button" class="bk2" :tabindex="miniShow ? 0 : -1" @click="back">{{ t('cfFinder.back') }}</button>
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
      <button
        v-for="it in dropItems"
        :key="String(it.v)"
        type="button"
        role="option"
        :aria-selected="it.on ? 'true' : 'false'"
        :class="{ on: it.on }"
        @click="onPick(it.v)"
      >
        <span>{{ it.label }}</span><small>{{ it.sub }}</small>
      </button>
    </div>

    <div class="selhint">{{ S.brandId ? t('cfFinder.hintEdit') : t('cfFinder.hintStart') }}</div>

    <div class="body">
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

        <div class="big one">
          <div class="two">
            <div>
              <span class="lab">{{ t('cfFinder.labFrame') }}</span>
              <img v-if="curFrame.img && !bad[curFrame.img]" class="fi" :src="curFrame.img" :alt="frameTitle(curFrame)" @error="markBad(curFrame.img)" />
              <span v-else class="ph"></span>
            </div>
            <div :class="{ empty: !hasInstall(curFrame) }">
              <span class="lab">{{ t('cfFinder.labInstall') }}</span>
              <img v-if="hasInstall(curFrame)" class="pi" :src="curFrame.img2" :alt="frameTitle(curFrame) + ' ' + t('cfFinder.labInstall')" loading="lazy" @error="markBad(curFrame.img2)" />
              <span v-else class="none">{{ t('cfFinder.instPending') }}</span>
            </div>
          </div>
          <div class="inf">
            <h3>
              {{ frameTitle(curFrame) }}<span v-if="curGroup.frames.length > 1" class="need">{{ t('cfFinder.needConfirm') }}</span>
            </h3>
            <div class="kv">
              <div><span>{{ t('cfFinder.fitYear') }}</span><b>{{ curGroup.label }}</b></div>
              <div><span>{{ t('cfFinder.fitUnit') }}</span><b>{{ t('cfFinder.unitInch', { s: curFrame.size }) }}</b></div>
            </div>
            <div class="frameNote"><b>{{ t('cfFinder.noteB') }}</b>{{ t('cfFinder.noteRest', { s: curFrame.size }) }}</div>
            <NuxtLink class="detBtn" :to="detailTo(curFrame)">{{ t('cfFinder.detailBtn') }}</NuxtLink>
            <div class="resAct">
              <!-- 分享時帶「只對到這一款」的年份，客人點開會直接看到這個結果，而不是一堆候選的比對畫面 -->
              <a class="l" :href="lineHref(bestYear(curGroup))" target="_blank" rel="noopener"><i>LINE</i>{{ t('cfFinder.lineShare') }}</a>
              <NuxtLink class="d" to="/partner">{{ t('cfFinder.dealerBtn') }}</NuxtLink>
            </div>
          </div>
        </div>
        <button type="button" class="otherY" @click="backAllYears">{{ t('cfFinder.otherYears') }}</button>
      </template>

      <!-- 保險：狀態對不上資料時（例如資料還在載入）顯示載入中，不會整塊空白 -->
      <p v-else class="stat">
        {{ framesState === 'error' ? t('cfFinder.loadError') : framesState === 'ok' ? t('cfFinder.noFrameModel') : t('cfFinder.loading') }}
      </p>
    </div>

    <p class="disc"><b>{{ t('cfFinder.discB') }}</b>　{{ t('cfFinder.disc') }}</p>
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
function hasInstall(f) {
  return !!(f && f.img2 && !bad[f.img2])
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

const dropTitle = computed(() => {
  if (S.open === 1) return t('cfFinder.dropBrand')
  if (S.open === 2) return t('cfFinder.dropModel', { brand: brandEn.value })
  if (S.open === 3) return t('cfFinder.dropYear', { model: S.model || '' })
  return ''
})
const dropItems = computed(() => {
  if (S.open === 1) {
    return brands.value.map((b) => ({ v: b.id, label: b.name, sub: '', on: S.brandId === b.id }))
  }
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
  if (k === 1) setBrand(v)
  else if (k === 2) setModel(v)
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
  --bg2: #f5f7fa;
  --orange: #f28729;
  --dark: #0d1016;
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
.big .two { display: grid; grid-template-columns: 1fr; }
.big .two > div { aspect-ratio: 3 / 2; position: relative; display: grid; place-items: center; background: #fff; overflow: hidden; }
.big .two > div + div { border-top: 1px solid #f0f3f7; }
.big .two > div.empty { background: var(--bg2); }
.big .two .fi { width: 88%; height: 84%; object-fit: contain; mix-blend-mode: multiply; }
.big .two .pi { width: 100%; height: 100%; object-fit: cover; }
.big .two .lab { left: 10px; top: 10px; font-size: 11px; padding: 2px 8px; border-radius: 6px; }
.big .inf { padding: 14px 16px 16px; }
.big .inf h3 { font-size: 18px; font-weight: 700; color: var(--ink); line-height: 1.45; overflow-wrap: anywhere; }
@media (min-width: 600px) {
  .big .two { grid-template-columns: 1fr 1fr; }
  .big .two > div + div { border-top: 0; border-left: 1px solid #f0f3f7; }
}
@media (min-width: 800px) {
  .big.one { display: grid; grid-template-columns: 1.2fr 1fr; }
  .big.one .two { grid-template-columns: 1fr; }
  .big.one .two > div + div { border-left: 0; border-top: 1px solid #f0f3f7; }
  .big.one .inf { border-left: 1px solid #f0f3f7; padding: 18px 20px; }
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
.resAct .l { background: #06c755; color: #fff; }
.resAct .d { background: var(--orange); color: #1a1205; }
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
