<template>
  <div class="pt-page">
    <!-- 標題帶 -->
    <div class="hd" :class="{ 'has-bn': banner.img }">
      <!-- 後台「列表頁 Banner 管理 → 經銷據點」：電腦版 1920×480（4:1）、手機版 1080×608（16:9）。
           沒上傳就維持原本的標題帶樣式，不會變高變空。 -->
      <div v-if="banner.img" class="bn bn-desktop" :style="{ backgroundImage: 'url(' + banner.img + ')' }"></div>
      <div v-if="banner.imgMobile || banner.img" class="bn bn-mobile" :style="{ backgroundImage: 'url(' + (banner.imgMobile || banner.img) + ')' }"></div>
      <div v-if="banner.img" class="bn-ov bn-ov-desktop"></div>
      <div v-if="banner.imgMobile || banner.img" class="bn-ov bn-ov-mobile"></div>
      <div class="wrap">
        <div class="en">{{ $t('partner.eyebrow') }}</div>
        <h1>{{ $t('partner.title') }}</h1>
        <p>{{ $t('partner.intro') }}</p>
      </div>
    </div>

    <section>
      <div class="wrap wrap-wide">
        <!-- 左側：搜尋 + 縣市清單（桌機 sticky 直排，手機收成橫向可滑動） -->
        <div class="side">
          <div class="tools">
            <div class="search">
              <span class="si">🔍</span>
              <input
                v-model="keyword"
                type="search"
                :placeholder="$t('partner.searchPlaceholder')"
                autocomplete="off"
              />
            </div>
            <span class="cnt">{{ $t('partner.count', { n: partners.length }) }}</span>
          </div>

          <div class="chips">
            <button class="chip" :class="{ on: county === '' }" @click="county = ''">
              {{ $t('partner.allCounties') }}<span class="n">{{ allPartners.length }}</span>
            </button>
            <button
              v-for="chip in countyChips"
              :key="chip.key"
              class="chip"
              :class="{ on: county === chip.key }"
              @click="county = county === chip.key ? '' : chip.key"
            >
              {{ chip.name }}<span class="n">{{ chip.count }}</span>
            </button>
          </div>
        </div>

        <!-- 右側：據點清單（未篩選時依縣市分組；有搜尋或選縣市時顯示篩選結果） -->
        <div id="results" :class="{ grouped: resultsGrouped }">
          <template v-for="section in displaySections" :key="section.key">
            <h2 v-if="section.heading" class="rgroup">
              {{ section.heading }}<span class="rn">{{ $t('partner.groupCount', { n: section.list.length }) }}</span>
            </h2>
            <div class="grid">
              <div v-for="(partner, index) in section.list" :key="index" class="card">
                <span v-if="!resultsGrouped && cityOf(partner)" class="cty">{{ cityOf(partner) }}</span>
                <h3>{{ partner.name }}</h3>
                <div v-if="partner.tel" class="row">
                  <span class="i">☎</span><a :href="'tel:' + telDigits(partner.tel)">{{ partner.tel }}</a>
                </div>
                <div v-if="partner.address" class="row"><span class="i">📍</span>{{ partner.address }}</div>
                <div class="acts">
                  <a v-if="partner.tel" class="btn2" :href="'tel:' + telDigits(partner.tel)">{{ $t('partner.callLink') }}</a>
                  <a
                    v-if="partner.address"
                    class="btn2"
                    :href="mapUrl(partner.address)"
                    target="_blank"
                    rel="noopener"
                  >
                    {{ $t('partner.mapLink') }}
                  </a>
                </div>
              </div>
            </div>
          </template>
        </div>

        <div v-if="partners.length === 0" class="none">{{ $t('partner.none') }}</div>
      </div>
    </section>
  </div>
</template>

<script setup>
// 後台「列表頁 Banner 管理」：沒設定時 banner.img 為 null，維持原本的標題帶
import { useListBanner } from '~/composables/useListBanner'
const banner = useListBanner('partner')
import { usePageSeo } from '~/composables/usePageSeo'
const { t } = useI18n()
const config = useRuntimeConfig()

// 選取的縣市 key（空字串＝全部）／搜尋關鍵字
const county = ref('')
const keyword = ref('')

// 一次抓全部經銷據點（不再依縣市分開查詢），前端負責搜尋、篩選、依縣市分組顯示
const { data } = await useAsyncData('partner-list', () =>
  $fetch(`${config.public.apiBase}/partner`)
)

const allPartners = computed(() => data.value?.result?.partner ?? [])
// 後台回傳的縣市名稱清單（純字串陣列，例如 ["台北市","新北市",...]，不是代碼對照表；
// 每個據點的 county 欄位本身就已經是中文縣市名稱，兩邊直接用字串比對即可）
const countyNames = computed(() => data.value?.result?.county ?? [])

// 卡片上的縣市標籤：若後台資料有帶縣市才顯示
const cityOf = (p) => p?.county ?? p?.city ?? ''

// 左側縣市清單：每個縣市附上據點數（依全部據點計算，不受搜尋關鍵字影響）
const countyChips = computed(() =>
  countyNames.value.map((name) => ({
    key: name,
    name,
    count: allPartners.value.filter((p) => cityOf(p) === name).length
  }))
)

// 關鍵字比對：店名、縣市、地址
const keywordFiltered = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q) return allPartners.value
  return allPartners.value.filter((p) =>
    [p.name, cityOf(p), p.address].filter(Boolean).join(' ').toLowerCase().includes(q)
  )
})

// 最終顯示清單：關鍵字 + 縣市篩選
const partners = computed(() => {
  if (!county.value) return keywordFiltered.value
  return keywordFiltered.value.filter((p) => cityOf(p) === county.value)
})

// 沒有搜尋也沒選縣市時，右側依縣市分組顯示（比較好瀏覽）；一旦搜尋或選了縣市，
// 卡片上的縣市標籤就不用重複顯示了（分組標題／篩選條件已經講清楚是哪個縣市）
const showGrouped = computed(() => !county.value && !keyword.value.trim())
const resultsGrouped = computed(() => showGrouped.value || !!county.value)

const displaySections = computed(() => {
  if (!showGrouped.value) {
    return [{ key: 'flat', heading: null, list: partners.value }]
  }
  const groups = []
  const matched = new Set()
  for (const name of countyNames.value) {
    const list = allPartners.value.filter((p) => cityOf(p) === name)
    if (list.length) {
      groups.push({ key: name, heading: name, list })
      list.forEach((p) => matched.add(p))
    }
  }
  // 保險：萬一有據點的縣市欄位不在後台清單裡（例如打錯字），也不會被漏掉不顯示
  const others = allPartners.value.filter((p) => !matched.has(p))
  if (others.length) {
    groups.push({ key: '__other', heading: t('partner.otherCounty'), list: others })
  }
  return groups
})

const telDigits = (tel) => (tel || '').replace(/[^0-9+]/g, '')

const mapUrl = (address) =>
  `https://www.google.com.tw/maps/place/${encodeURIComponent(address)}`

usePageSeo({
  title: () => t('partner.seoTitle'),
  description: () => t('partner.seoDesc'),
  noSuffix: true
})
</script>

<style scoped>
.pt-page {
  --ink: #0d1b2e;
  --text: #1b2431;
  --muted: #5b6675;
  --dim: #93a0b0;
  --bg: #fff;
  --bg2: #f5f7fa;
  --line: #e6ebf1;
  --navy: #007ABE;
  --dark: #0d1016;
  font-family: 'Noto Sans TC', system-ui, 'Microsoft JhengHei', sans-serif;
  letter-spacing: 0.02em;
  background: var(--bg);
  color: var(--text);
  line-height: 1.7;
}
.pt-page a { color: inherit; text-decoration: none; }
.wrap { max-width: 1000px; margin: 0 auto; padding: 0 26px; }
.pt-page section { padding: 44px 0 70px; }

.hd { position: relative; overflow: hidden; background: linear-gradient(115deg, #eef2f7, #dde5ef 60%, #cfdae8); padding: 52px 0; }
.hd > .wrap { position: relative; z-index: 2; }
.hd .en { font-size: 12px; letter-spacing: 4px; color: var(--navy); font-weight: 700; }
.hd h1 { font-size: clamp(28px, 4vw, 40px); font-weight: 900; margin-top: 8px; color: var(--ink); }
.hd p { color: #41506b; margin-top: 8px; font-weight: 400; }

.wrap-wide { max-width: 1080px; }

/* 兩欄：左側 sticky 搜尋＋縣市／右側據點清單（900px 以下收成單欄） */
section .wrap-wide { display: grid; grid-template-columns: 250px 1fr; column-gap: 64px; align-items: start; }
.side { grid-column: 1; position: sticky; top: 96px; }
#results, .none { grid-column: 2; }

/* 搜尋：底線式 */
.tools { display: block; margin: 0 0 26px; }
.search { position: relative; min-width: 0; }
.search .si { position: absolute; left: 2px; top: 50%; transform: translateY(-50%); font-size: 14px; opacity: 0.45; filter: grayscale(1); pointer-events: none; }
.search input {
  width: 100%; height: 48px; border: 0; border-bottom: 1px solid var(--line); border-radius: 0;
  padding: 0 8px 0 30px; font-size: 15px; font-family: inherit; color: var(--text); background: transparent;
  transition: border-color 0.2s;
}
.search input::placeholder { color: var(--dim); }
.search input:focus { outline: none; border-bottom-color: var(--navy); box-shadow: none; }
.cnt { display: block; padding-top: 12px; font-size: 12.5px; color: var(--dim); letter-spacing: 0.06em; }

/* 縣市清單：直式，選中的左側有藍線 */
.chips {
  display: flex; flex-direction: column; gap: 0; padding: 0; margin: 0; border-left: 1px solid var(--line);
  max-height: calc(100vh - 230px); overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin;
}
.chip {
  position: relative; flex: none; border: 0; background: none; border-radius: 0; padding: 10px 0 10px 16px;
  font-size: 13.5px; color: var(--muted); cursor: pointer; text-align: left; display: flex;
  justify-content: space-between; align-items: baseline; gap: 10px; font-family: inherit; transition: color 0.2s;
}
.chip::after {
  content: ''; position: absolute; left: -1px; top: 0; bottom: 0; width: 2px; background: var(--navy);
  transform: scaleY(0); transform-origin: top; transition: transform 0.3s cubic-bezier(.22,.61,.36,1);
}
.chip:hover { color: var(--ink); }
.chip.on { color: var(--ink); font-weight: 700; }
.chip.on::after { transform: scaleY(1); }
.chip .n { font-size: 12px; color: var(--dim); font-weight: 400; }
.chip.on .n { color: var(--navy); }

/* 分組標題（依縣市） */
.rgroup { display: flex; align-items: baseline; gap: 12px; font-size: 11px; font-weight: 700; color: var(--dim); letter-spacing: 0.24em; text-transform: uppercase; margin: 38px 0 0; padding: 0 0 6px; }
.rgroup:first-child { margin-top: 0; }
.rgroup .rn { font-weight: 400; color: #c3ccd7; font-size: 11px; letter-spacing: 0.1em; }

/* 卡片：細線列，不再是圓角外框 */
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 48px; }
.card { border: 0; border-top: 1px solid var(--line); border-radius: 0; padding: 20px 0 24px; }
#results.grouped .card .cty { display: none; }
.card .cty { display: block; font-size: 11px; letter-spacing: 0.18em; color: var(--dim); font-weight: 700; margin-bottom: 7px; }
.card h3 { font-size: 16px; font-weight: 700; color: var(--ink); line-height: 1.5; }
.card .row { display: flex; gap: 9px; align-items: flex-start; font-size: 13.5px; color: var(--muted); margin-top: 8px; line-height: 1.75; }
.card .row .i { color: var(--dim); flex-shrink: 0; font-size: 12px; filter: grayscale(1); }
.card .row a { color: inherit; }
.card .row a:hover { color: var(--navy); }
.card .acts { display: flex; gap: 24px; margin-top: 14px; flex-wrap: wrap; }
.card .btn2 { position: relative; display: inline-flex; align-items: center; gap: 5px; font-size: 13px; font-weight: 700; color: var(--navy); border: 0; border-radius: 0; padding: 0; }
.card .btn2::after {
  content: ''; position: absolute; left: 0; right: 100%; bottom: -3px; height: 1px; background: var(--navy);
  transition: right 0.3s cubic-bezier(.22,.61,.36,1);
}
.card .btn2:hover::after { right: 0; }

.none { text-align: center; color: var(--dim); padding: 40px 0; font-size: 14px; }

@media (max-width: 900px) {
  section .wrap-wide { display: block; }
  .side { position: static; margin-bottom: 26px; }
  .chips {
    flex-direction: row; overflow-x: auto; overflow-y: visible; max-height: none; border-left: 0;
    border-bottom: 1px solid var(--line); gap: 26px; margin-top: 22px; -webkit-overflow-scrolling: touch;
  }
  .chip { flex: 0 0 auto; padding: 0 0 14px; white-space: nowrap; }
  .chip::after { left: 0; right: 0; top: auto; bottom: -1px; width: auto; height: 2px; transform: scaleX(0); transform-origin: left; }
  .chip.on::after { transform: scaleX(1); }
  .grid { grid-template-columns: 1fr; gap: 0; }
}

.hd.has-bn { aspect-ratio: 4 / 1; min-height: 260px; display: flex; align-items: center; }
.hd.has-bn .in, .hd.has-bn > .wrap { width: 100%; }
.hd .bn { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; background-size: cover; background-position: center; }
.hd .bn-ov { position: absolute; inset: 0; z-index: 1; background: linear-gradient(90deg, rgba(243, 246, 250, 0.94) 0%, rgba(243, 246, 250, 0.9) 34%, rgba(243, 246, 250, 0.66) 50%, rgba(243, 246, 250, 0) 64%); }
.hd .bn-mobile, .hd .bn-ov-mobile { display: none; }
@media (max-width: 640px) {
  .hd .bn-desktop, .hd .bn-ov-desktop { display: none; }
  .hd .bn-mobile, .hd .bn-ov-mobile { display: block; }
}
</style>
