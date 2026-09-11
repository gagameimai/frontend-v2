<template>
  <div class="pt-page">
    <!-- 標題帶 -->
    <div class="hd">
      <div class="wrap">
        <div class="en">{{ $t('partner.eyebrow') }}</div>
        <h1>{{ $t('partner.title') }}</h1>
        <p>{{ $t('partner.intro') }}</p>
      </div>
    </div>

    <section>
      <div class="wrap">
        <!-- 縣市篩選（功能照舊） -->
        <div class="bar">
          <select v-model="county">
            <option value="">{{ $t('partner.allCounties') }}</option>
            <option v-for="(name, key) in counties" :key="key" :value="key">
              {{ name }}
            </option>
          </select>
          <span class="cnt">{{ $t('partner.count', { n: partners.length }) }}</span>
        </div>

        <div v-if="partners.length" class="grid">
          <div v-for="(partner, index) in partners" :key="index" class="card">
            <span v-if="cityOf(partner)" class="cty">{{ cityOf(partner) }}</span>
            <h3>{{ partner.name }}</h3>
            <div v-if="partner.tel" class="row"><span class="i">☎</span>{{ partner.tel }}</div>
            <div v-if="partner.address" class="row"><span class="i">📍</span>{{ partner.address }}</div>
            <a
              v-if="partner.address"
              class="map"
              :href="mapUrl(partner.address)"
              target="_blank"
              rel="noopener"
            >
              {{ $t('partner.mapLink') }}
            </a>
          </div>
        </div>

        <div v-else class="none">{{ $t('partner.none') }}</div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { usePageSeo } from '~/composables/usePageSeo'
const { t } = useI18n()
const config = useRuntimeConfig()

// 選取的縣市（空字串＝全部）
const county = ref('')

// 取經銷據點（API 照舊：/partner 帶 county 參數）
// 切換縣市時自動重新查詢
const { data } = await useAsyncData(
  'partner-list',
  () => $fetch(`${config.public.apiBase}/partner`, { params: { county: county.value } }),
  { watch: [county] }
)

const partners = computed(() => data.value?.result?.partner ?? [])

// 縣市清單只在第一次取得後保留（切換縣市時不覆蓋）
const counties = ref(null)
watch(
  data,
  (d) => {
    if (!counties.value && d?.result?.county) {
      counties.value = d.result.county
    }
  },
  { immediate: true }
)

// 卡片上的縣市標籤：若後台資料有帶縣市才顯示
const cityOf = (p) => {
  const c = p?.county ?? p?.city
  if (c === undefined || c === null || c === '') return ''
  return counties.value?.[c] ?? c
}

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
  font-family: 'Noto Sans JP', 'Noto Sans TC', system-ui, 'Microsoft JhengHei', sans-serif;
  letter-spacing: 0.02em;
  background: var(--bg);
  color: var(--text);
  line-height: 1.7;
}
.pt-page a { color: inherit; text-decoration: none; }
.wrap { max-width: 1000px; margin: 0 auto; padding: 0 26px; }
.pt-page section { padding: 44px 0 70px; }

/* 標題帶 */
.hd { background: linear-gradient(115deg, #eef2f7, #dde5ef 60%, #cfdae8); padding: 52px 0; }
.hd .en { font-size: 12px; letter-spacing: 4px; color: var(--navy); font-weight: 700; }
.hd h1 { font-size: clamp(28px, 4vw, 40px); font-weight: 900; margin-top: 8px; color: var(--ink); }
.hd p { color: #41506b; margin-top: 8px; font-weight: 400; }

/* 篩選列 */
.bar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 24px; }
.bar select {
  height: 46px; border: 1px solid var(--line); border-radius: 12px; padding: 0 16px;
  font-size: 15px; font-family: inherit; color: var(--text); background: #fff;
  min-width: 180px; cursor: pointer;
}
.bar .cnt { color: var(--dim); font-size: 14px; }

/* 據點卡片 */
.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.card { border: 1px solid var(--line); border-radius: 14px; padding: 20px; transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s; }
.card:hover { transform: translateY(-4px); box-shadow: 0 14px 32px rgba(13, 27, 46, 0.1); border-color: #cdd6e0; }
.card .cty { display: inline-block; font-size: 11px; font-weight: 700; color: var(--navy); background: rgba(2, 48, 89, 0.08); border-radius: 20px; padding: 3px 10px; margin-bottom: 8px; }
.card h3 { font-size: 17px; font-weight: 700; color: var(--ink); }
.card .row { display: flex; gap: 8px; align-items: flex-start; font-size: 14px; color: var(--muted); margin-top: 8px; }
.card .row .i { color: var(--navy); flex-shrink: 0; }
.card .map { display: inline-block; margin-top: 12px; font-size: 13px; font-weight: 500; color: var(--navy); border: 1px solid var(--line); border-radius: 8px; padding: 7px 14px; }
.card .map:hover { background: var(--bg2); }

.none { text-align: center; color: var(--dim); padding: 40px; }

@media (max-width: 760px) {
  .grid { grid-template-columns: 1fr; }
}
</style>
