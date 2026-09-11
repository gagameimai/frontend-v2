<template>
  <div class="dl-page">
    <!-- 標題帶 -->
    <div class="hd">
      <div class="wrap">
        <div class="en">{{ $t('download.eyebrow') }}</div>
        <h1>{{ $t('download.title') }}</h1>
        <p>{{ $t('download.intro') }}</p>
      </div>
    </div>

    <section>
      <div class="wrap">
        <!-- 技師 / 經銷提醒 -->
        <div class="warn">{{ $t('download.warning') }}</div>

        <!-- 搜尋 -->
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

        <!-- 品牌分頁 -->
        <div class="brandtabs">
          <button class="bt" :class="{ on: brand === 'mm' }" @click="brand = 'mm'">
            {{ $t('download.tabMM') }}
          </button>
          <button class="bt" :class="{ on: brand === 'clarion' }" @click="brand = 'clarion'">
            {{ $t('download.tabClarion') }}
          </button>
        </div>

        <!-- Clarion：資源尚未提供 -->
        <div v-if="brand === 'clarion'" class="soon">{{ $t('download.clarionSoon') }}</div>

        <!-- MM：分類手風琴（資料來自 /resource） -->
        <template v-else>
          <div v-for="row in filteredVersions" :key="row.i" class="grp">
            <button class="summary" type="button" @click="toggle(row.i)">
              <span class="pm">{{ isOpen(row.i) ? '–' : '+' }}</span>
              <span class="ttl">{{ row.v.name }}</span>
            </button>
            <div v-show="isOpen(row.i)" class="gbody">
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
            </div>
          </div>

          <p v-if="versionList.length === 0" class="empty">{{ $t('download.empty') }}</p>
          <p v-else-if="filteredVersions.length === 0" class="noresult">
            {{ $t('download.noResult', { q: keyword }) }}
          </p>
        </template>
      </div>
    </section>
  </div>
</template>

<script setup>
const { t } = useI18n()
const config = useRuntimeConfig()

// 資源清單（API 照舊：/resource）
const { data } = await useAsyncData('resource-list', () =>
  $fetch(`${config.public.apiBase}/resource`)
)
const versionList = computed(() => data.value?.result ?? [])

const brand = ref('mm')
const keyword = ref('')

// 手風琴展開狀態（預設展開第一個分類）
const openSet = ref(new Set([0]))
const toggle = (i) => {
  const s = new Set(openSet.value)
  if (s.has(i)) s.delete(i)
  else s.add(i)
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

useHead({
  title: () => t('download.title')
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
  font-family: 'Noto Sans JP', 'Noto Sans TC', system-ui, 'Microsoft JhengHei', sans-serif;
  letter-spacing: 0.02em;
  background: var(--bg);
  color: var(--text);
  line-height: 1.7;
}
.dl-page a { color: inherit; text-decoration: none; }
.wrap { max-width: 920px; margin: 0 auto; padding: 0 26px; }
.dl-page section { padding: 44px 0 70px; }

/* 標題帶 */
.hd { background: linear-gradient(115deg, #eef2f7, #dde5ef 60%, #cfdae8); padding: 46px 0; }
.hd .en { font-size: 12px; letter-spacing: 4px; color: var(--navy); font-weight: 700; }
.hd h1 { font-size: clamp(28px, 4vw, 40px); font-weight: 900; margin-top: 8px; color: var(--ink); }
.hd p { color: #41506b; margin-top: 8px; font-weight: 400; }

/* 技師提醒 */
.warn {
  background: #fff7ed; border: 1px solid #f3d9bb; border-radius: 12px;
  padding: 14px 16px; font-size: 13px; color: #8a5a1e; margin-bottom: 18px; line-height: 1.6;
}

/* 搜尋 */
.tools { display: flex; gap: 10px; flex-wrap: wrap; margin: 26px 0 22px; }
.search { flex: 1; min-width: 220px; position: relative; }
.search input {
  width: 100%; height: 46px; border: 1px solid var(--line); border-radius: 12px;
  padding: 0 16px 0 42px; font-size: 15px; font-family: inherit; color: var(--text); background: #fff;
}
.search input:focus { outline: none; border-color: var(--navy); }
.search .ic { position: absolute; left: 15px; top: 12px; color: var(--dim); }
.cnt { align-self: center; font-size: 13px; color: var(--dim); }

/* 品牌分頁 */
.brandtabs { display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap; }
.bt {
  border: 1px solid var(--line); background: #fff; color: var(--muted); border-radius: 10px;
  padding: 10px 22px; font-size: 14px; font-weight: 500; font-family: inherit; cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.bt.on { background: var(--navy); color: #fff; border-color: var(--navy); }
.bt:hover:not(.on) { border-color: #c3ccd7; }

.soon {
  border: 1px dashed var(--line); border-radius: 14px; background: var(--bg2);
  padding: 40px 26px; text-align: center; color: var(--muted); font-size: 14px;
}

/* 分類手風琴 */
.grp { border: 1px solid var(--line); border-radius: 14px; margin-bottom: 12px; overflow: hidden; background: #fff; }
.summary {
  width: 100%; cursor: pointer; display: flex; align-items: center; gap: 10px;
  padding: 18px 20px; font-size: 16px; font-weight: 700; color: var(--ink);
  background: none; border: 0; font-family: inherit; text-align: left;
}
.summary:hover { background: var(--bg2); }
.summary .pm { color: var(--navy); font-weight: 400; font-size: 20px; width: 18px; text-align: center; flex-shrink: 0; }
.gbody { border-top: 1px solid var(--line); }
.memo { padding: 14px 20px 0; color: var(--muted); font-size: 13px; white-space: pre-line; }
.grp ul { list-style: none; padding: 14px 20px 18px; margin: 0; }
.grp li {
  display: flex; align-items: center; justify-content: space-between; gap: 14px;
  padding: 11px 14px; border: 1px solid var(--line); border-radius: 10px; margin-bottom: 8px;
  transition: border-color 0.15s, background 0.15s;
}
.grp li:hover { border-color: #cdd6e0; background: var(--bg2); }
.grp li .nm { font-size: 14px; color: var(--text); }
.dl {
  white-space: nowrap; font-size: 13px; font-weight: 700; color: var(--navy);
  border: 1px solid #f3d3b3; border-radius: 8px; padding: 7px 14px; transition: background 0.15s;
}
.dl:hover { background: #fef2e6; }
.dl.vid { color: var(--navy); border-color: #cdd9e8; }
.dl.vid:hover { background: #eef3f9; }

.noresult, .empty { text-align: center; color: var(--dim); padding: 30px; }

@media (max-width: 720px) {
  .grp li { flex-direction: column; align-items: flex-start; }
}
</style>
