<template>
  <div class="dl-page">
    <!-- 標題帶 -->
    <div class="hd" :class="{ 'has-bn': banner.img }">
      <!-- 後台「列表頁 Banner 管理 → 資源下載」：電腦版 1920×480（4:1）、手機版 1080×608（16:9）。
           沒上傳就維持原本的標題帶樣式，不會變高變空。 -->
      <div v-if="banner.img" class="bn bn-desktop" :style="{ backgroundImage: 'url(' + banner.img + ')' }"></div>
      <div v-if="banner.imgMobile || banner.img" class="bn bn-mobile" :style="{ backgroundImage: 'url(' + (banner.imgMobile || banner.img) + ')' }"></div>
      <div v-if="banner.img" class="bn-ov bn-ov-desktop"></div>
      <div v-if="banner.imgMobile || banner.img" class="bn-ov bn-ov-mobile"></div>
      <div class="wrap">
        <div class="en">{{ $t('download.eyebrow') }}</div>
        <h1>{{ $t('download.title') }}</h1>
        <p>{{ $t('download.intro') }}</p>
      </div>
    </div>

    <section>
      <div class="wrap wrap-wide">
        <!-- 技師 / 經銷提醒 -->
        <div class="caution">{{ $t('download.warning') }}</div>

        <!-- 左側：搜尋 + 品牌分頁（桌機 sticky 直排，手機收成橫排） -->
        <div class="side">
          <div class="tools">
            <div class="search">
              <span class="ic">🔍</span>
              <input
                v-model="keyword"
                type="text"
                :placeholder="$t('download.searchPlaceholder')"
              />
            </div>
            <span v-if="keyword.trim()" class="cnt">
              {{ $t('download.matchCount', { n: filteredVersions.length }) }}
            </span>
          </div>

          <div class="brandtabs">
            <button class="bt" :class="{ on: brand === 'clarion' }" @click="brand = 'clarion'">
              {{ $t('download.tabClarion') }}
            </button>
            <button class="bt" :class="{ on: brand === 'mm' }" @click="brand = 'mm'">
              {{ $t('download.tabMM') }}
            </button>
          </div>
        </div>

        <!-- Clarion：資源尚未提供 -->
        <div v-if="brand === 'clarion'" class="blist">
          <div class="empty">{{ $t('download.clarionSoon') }}</div>
        </div>

        <!-- MM：分類手風琴（資料來自 /resource） -->
        <div v-else class="blist">
          <details
            v-for="row in filteredVersions"
            :key="row.i"
            class="grp"
            :open="isOpen(row.i)"
            @toggle="onToggleGroup(row.i, $event)"
          >
            <summary>
              <span class="pm">{{ isOpen(row.i) ? '–' : '+' }}</span>
              <span class="ttl">{{ row.v.name }}</span>
            </summary>
            <div v-if="row.v.memo" class="memo">{{ row.v.memo }}</div>
            <ul>
              <li v-for="(resource, index) in row.v.resources" :key="index">
                <span class="nm">{{ resource.name }}</span>
                <a
                  class="dl"
                  :class="{ vid: isVideo(resource.url) }"
                  :href="resource.url"
                  target="_blank"
                  rel="noopener"
                >
                  {{ isVideo(resource.url) ? $t('download.watch') : $t('download.dl') }}
                </a>
              </li>
            </ul>
          </details>

          <p v-if="versionList.length === 0" class="empty">{{ $t('download.empty') }}</p>
          <p v-else-if="filteredVersions.length === 0" class="noresult">
            {{ $t('download.noResult', { q: keyword }) }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { usePageSeo } from '~/composables/usePageSeo'
// 後台「列表頁 Banner 管理」：沒設定時 banner.img 為 null，維持原本的標題帶
import { useListBanner } from '~/composables/useListBanner'
const banner = useListBanner('download')
const { t } = useI18n()
const config = useRuntimeConfig()

// 資源清單（API 照舊：/resource）
const { data } = await useAsyncData('resource-list', () =>
  $fetch(`${config.public.apiBase}/resource`)
)
const versionList = computed(() => data.value?.result ?? [])

const brand = ref('mm')
const keyword = ref('')

// 手風琴展開狀態（預設展開第一個分類；用原生 <details> 的 toggle 事件同步狀態）
const openSet = ref(new Set([0]))
const onToggleGroup = (i, event) => {
  const s = new Set(openSet.value)
  if (event.target.open) s.add(i)
  else s.delete(i)
  openSet.value = s
}
// 搜尋時符合的分類自動展開
const isOpen = (i) => (keyword.value.trim() ? true : openSet.value.has(i))

// 依關鍵字過濾分類（保留原始索引，讓展開狀態不會跑掉）
const filteredVersions = computed(() => {
  const list = versionList.value.map((v, i) => ({ v, i }))
  const q = keyword.value.trim().toLowerCase()
  if (!q) return list
  return list.filter(({ v }) =>
    [v.name, v.memo, ...(v.resources || []).map((r) => r.name)]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(q)
  )
})

// YouTube 連結顯示為「觀看」，其餘為「下載」
const isVideo = (url) => /youtube\.com|youtu\.be/i.test(url || '')

// SEO：標題／描述／og／canonical 一次設定（usePageSeo 會自動補站名後綴與 canonical）
usePageSeo({
  title: () => t('download.title'),
  description: () => t('download.intro')
})
</script>

<style scoped>
.dl-page {
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
.dl-page a { color: inherit; text-decoration: none; }
.wrap { max-width: 920px; margin: 0 auto; padding: 0 26px; }
.dl-page section { padding: 44px 0 70px; }

.hd { position: relative; overflow: hidden; background: linear-gradient(115deg, #eef2f7, #dde5ef 60%, #cfdae8); padding: 46px 0; }
.hd > .wrap { position: relative; z-index: 2; }
.hd .en { font-size: 12px; letter-spacing: 4px; color: var(--navy); font-weight: 700; }
.hd h1 { font-size: clamp(28px, 4vw, 40px); font-weight: 900; margin-top: 8px; color: var(--ink); }
.hd p { color: #41506b; margin-top: 8px; font-weight: 400; }

.wrap-wide { max-width: 1080px; }

.caution {
  background: #f5f8fb; border: 0; border-left: 2px solid var(--navy); border-radius: 0;
  padding: 16px 18px; font-size: 13.5px; color: var(--muted); line-height: 1.9; margin-bottom: 34px;
  grid-column: 1 / -1;
}

/* 兩欄：左側 sticky 搜尋/品牌分頁，右側檔案清單（900px 以下收成單欄） */
section .wrap-wide { display: grid; grid-template-columns: 250px 1fr; column-gap: 64px; align-items: start; }
.side { grid-column: 1; position: sticky; top: 96px; }
.blist { grid-column: 2; margin-top: 6px; }

.tools { display: block; margin: 0 0 26px; }
.search { min-width: 0; position: relative; }
.search input {
  width: 100%; height: 48px; border: 0; border-bottom: 1px solid var(--line); border-radius: 0;
  padding: 0 8px 0 30px; font-size: 15px; font-family: inherit; color: var(--text); background: transparent;
  transition: border-color 0.2s;
}
.search input::placeholder { color: var(--dim); }
.search input:focus { outline: none; border-bottom-color: var(--navy); }
.search .ic { position: absolute; left: 2px; top: 14px; color: var(--dim); font-size: 14px; filter: grayscale(1); }
.cnt { display: block; padding: 10px 0 0; font-size: 12.5px; color: var(--dim); letter-spacing: 0.06em; }

.brandtabs { display: flex; flex-direction: column; gap: 0; margin: 0; border-bottom: 0; border-left: 1px solid var(--line); }
.bt {
  position: relative; text-align: left; border: 0; background: none; color: var(--dim); border-radius: 0;
  padding: 12px 0 12px 16px; font-size: 14px; font-weight: 500; font-family: inherit; cursor: pointer;
  letter-spacing: 0.02em; transition: color 0.2s;
}
.bt::after {
  content: ''; position: absolute; left: -1px; right: auto; top: 0; bottom: 0; width: 2px; height: auto;
  background: var(--navy); transform: scaleY(0); transform-origin: top; transition: transform 0.3s cubic-bezier(.22,.61,.36,1);
}
.bt.on { color: var(--ink); font-weight: 700; }
.bt.on::after { transform: scaleY(1); }
.bt:hover:not(.on) { color: var(--muted); }

.grp { border: 0; border-bottom: 1px solid var(--line); border-radius: 0; margin: 0; overflow: visible; background: none; }
.grp > summary {
  cursor: pointer; list-style: none; display: flex; align-items: center; gap: 16px;
  padding: 22px 2px; font-size: 16px; font-weight: 700; color: var(--ink); transition: color 0.2s;
}
.grp > summary::-webkit-details-marker { display: none; }
.grp > summary:hover { color: var(--navy); }
.grp[open] > summary { color: var(--navy); padding-bottom: 14px; }
.grp > summary .pm { position: relative; width: 16px; height: 16px; font-size: 0; color: transparent; flex-shrink: 0; }
.grp > summary .pm::before, .grp > summary .pm::after {
  content: ''; position: absolute; left: 0; top: 50%; width: 16px; height: 1.5px; background: var(--dim);
  transition: transform 0.3s cubic-bezier(.22,.61,.36,1), background 0.2s;
}
.grp > summary .pm::after { transform: rotate(90deg); }
.grp > summary:hover .pm::before, .grp > summary:hover .pm::after { background: var(--navy); }
.grp[open] > summary .pm::before, .grp[open] > summary .pm::after { background: var(--navy); }
.grp[open] > summary .pm::after { transform: rotate(0deg); }

.memo { padding: 0 2px 6px 34px; color: var(--muted); font-size: 13px; line-height: 1.9; white-space: pre-line; }
.grp ul { list-style: none; padding: 0 2px 20px 34px; margin: 0; }
.grp li {
  display: flex; align-items: baseline; justify-content: space-between; gap: 20px;
  padding: 13px 0; border: 0; border-top: 1px solid #f0f4f8; border-radius: 0; margin: 0; background: none;
}
.grp li:first-child { border-top: 0; }
.grp li .nm { font-size: 14px; color: var(--muted); line-height: 1.8; }
.grp li:hover .nm { color: var(--ink); }
.dl {
  position: relative; white-space: nowrap; font-size: 13px; font-weight: 700; color: var(--navy);
  border: 0; border-radius: 0; padding: 0; background: none; transition: opacity 0.2s;
}
.dl::after {
  content: ''; position: absolute; left: 0; right: 100%; bottom: -3px; height: 1px; background: var(--navy);
  transition: right 0.3s cubic-bezier(.22,.61,.36,1);
}
.dl:hover::after { right: 0; }
.dl.vid { color: var(--muted); }
.dl.vid::after { background: var(--muted); }

.noresult, .empty { text-align: center; color: var(--dim); padding: 30px; }

@media (max-width: 900px) {
  section .wrap-wide { display: block; }
  .side { position: static; }
  .tools { margin-bottom: 0; }
  .brandtabs { flex-direction: row; gap: 30px; border-left: 0; border-bottom: 1px solid var(--line); margin: 26px 0 0; }
  .bt { padding: 0 0 14px; }
  .bt::after { left: 0; right: 0; top: auto; bottom: -1px; width: auto; height: 2px; transform: scaleX(0); transform-origin: left; }
  .bt.on::after { transform: scaleX(1); }
  .cnt { padding-top: 8px; }
}

@media (max-width: 720px) {
  .grp li { flex-direction: column; align-items: flex-start; gap: 8px; }
  .grp ul, .memo { padding-left: 0; }
  .brandtabs { gap: 22px; }
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
