<template>
  <div class="cs-page">
    <!-- HERO -->
    <div class="hero">
      <div class="ov"></div>
      <div class="wrap in">
        <div class="ey">{{ $t('cases.eyebrow') }}</div>
        <h1>{{ $t('cases.title') }}</h1>
        <p>{{ $t('cases.intro') }}</p>
      </div>
    </div>

    <section>
      <div class="wrap cols">
        <!-- 左：搜尋 -->
        <aside class="side">
          <div class="sbox">
            <label class="slab">{{ $t('cases.searchPh') }}</label>
            <input v-model="q" type="search" class="sinput" :placeholder="$t('cases.searchPh')" />
            <p class="hint">{{ $t('cases.searchHint') }}</p>
            <p class="cnt">{{ $t('cases.count', { n: filtered.length }) }}</p>
          </div>
        </aside>

        <!-- 右：案例卡片 -->
        <div class="main">
          <p v-if="!list.length" class="empty">{{ $t('cases.empty') }}</p>
          <p v-else-if="!filtered.length" class="empty">{{ $t('cases.noResult') }}</p>

          <div v-else class="cgrid">
            <NuxtLink v-for="item in filtered" :key="item.id" class="cc" :to="`/cases/${item.id}`">
              <div class="ph">
                <span v-if="item.is_pinned == 1" class="pin">{{ $t('cases.pinned') }}</span>
                <img
                  v-if="item.img"
                  :src="item.img"
                  :alt="item.name"
                  loading="lazy"
                  @error="onImgError"
                />
              </div>
              <div class="cbody">
                <div class="cat">{{ caseCategoryLabel(item.category) }}</div>
                <h3>{{ item.name }}</h3>
                <dl class="meta">
                  <template v-if="item.car_model">
                    <dt>{{ $t('cases.car') }}</dt><dd>{{ item.car_model }}</dd>
                  </template>
                  <template v-if="item.product">
                    <dt>{{ $t('cases.product') }}</dt><dd>{{ item.product }}</dd>
                  </template>
                  <template v-if="item.dealer">
                    <dt>{{ $t('cases.dealer') }}</dt><dd>{{ item.dealer }}</dd>
                  </template>
                  <template v-if="item.installed_at">
                    <dt>{{ $t('cases.date') }}</dt><dd>{{ item.installed_at }}</dd>
                  </template>
                </dl>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <section class="help">
      <div class="wrap-sm">
        <h2>{{ $t('cases.helpTitle') }}</h2>
        <p>{{ $t('cases.helpDesc') }}</p>
        <NuxtLink to="/partner" class="btn">{{ $t('cases.toDealers') }}</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { usePageSeo } from '~/composables/usePageSeo'
const { t } = useI18n()
const config = useRuntimeConfig()

const { data } = await useAsyncData('install-cases', () =>
  $fetch(`${config.public.apiBase}/install_cases`).catch(() => ({ result: [] }))
)
const list = computed(() => data.value?.result ?? [])

const q = ref('')
const filtered = computed(() => {
  const k = q.value.trim().toLowerCase()
  if (!k) return list.value
  return list.value.filter((it) =>
    [it.name, it.car_model, it.product, it.dealer].some((v) => (v || '').toLowerCase().includes(k))
  )
})

// 分類文字沿用首頁那組 i18n（跟後台「安裝案例」的分類選項一致）
const caseCategoryKeys = {
  0: 'home.caseCategory0', 1: 'home.caseCategory1', 2: 'home.caseCategory2',
  3: 'home.caseCategory3', 4: 'home.caseCategory4', 5: 'home.caseCategory5',
  6: 'home.caseCategory6', 7: 'home.caseCategory7', 8: 'home.caseCategory8'
}
const caseCategoryLabel = (v) => (caseCategoryKeys[v] ? t(caseCategoryKeys[v]) : '')

const onImgError = (e) => { e.target.style.display = 'none' }

usePageSeo({
  title: () => t('cases.title'),
  description: () => t('cases.intro')
})
</script>

<style scoped>
.cs-page {
  --ink: #0d1b2e; --text: #1b2431; --muted: #5b6675; --dim: #93a0b0;
  --bg: #fff; --bg2: #f5f7fa; --line: #e6ebf1; --navy: #007abe; --dark: #0d1016;
  font-family: 'Noto Sans JP', 'Noto Sans TC', system-ui, 'Microsoft JhengHei', sans-serif;
  background: var(--bg); color: var(--text); line-height: 1.75; letter-spacing: 0.02em;
}
.cs-page a { color: inherit; text-decoration: none; }
.wrap { max-width: 1080px; margin: 0 auto; padding: 0 26px; }
.wrap-sm { max-width: 760px; margin: 0 auto; padding: 0 26px; }
.cs-page section { padding: 56px 0; }

.hero { position: relative; background: var(--dark); color: #fff; padding: 96px 0 64px; }
.hero .ov { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,122,190,.18), transparent 60%); }
.hero .in { position: relative; }
.hero .ey { font-size: 12px; letter-spacing: 2px; color: #7fc4ea; margin-bottom: 10px; }
.hero h1 { font-size: 34px; font-weight: 900; margin: 0 0 12px; }
.hero p { max-width: 640px; color: #c6ced8; font-size: 15px; margin: 0; }

.cols { display: grid; grid-template-columns: 240px 1fr; gap: 0 56px; align-items: start; }
.side { position: sticky; top: 88px; }
.sbox { border-top: 2px solid var(--ink); padding-top: 16px; }
.slab { display: block; font-size: 12px; letter-spacing: 1px; color: var(--dim); margin-bottom: 8px; }
.sinput { width: 100%; box-sizing: border-box; border: 1px solid var(--line); border-radius: 4px; padding: 9px 11px; font-size: 14px; font-family: inherit; }
.sinput:focus { outline: none; border-color: var(--navy); }
.hint { font-size: 12px; color: var(--dim); margin: 10px 0 0; }
.cnt { font-size: 12px; color: var(--muted); margin: 14px 0 0; padding-top: 12px; border-top: 1px solid var(--line); }

.empty { color: var(--muted); font-size: 14px; padding: 28px 0; }
.cgrid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 34px 28px; }
.cc { display: block; }
.cc .ph { position: relative; aspect-ratio: 16 / 10; background: var(--bg2); overflow: hidden; }
.cc .ph img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .4s ease; }
.cc:hover .ph img { transform: scale(1.04); }
.cc .pin { position: absolute; top: 10px; right: 10px; z-index: 2; background: var(--navy); color: #fff; font-size: 11px; letter-spacing: 1px; padding: 3px 9px; border-radius: 2px; }
.cbody { padding-top: 14px; }
.cat { font-size: 11px; letter-spacing: 1px; color: var(--navy); margin-bottom: 6px; }
.cc h3 { font-size: 17px; font-weight: 700; color: var(--ink); margin: 0 0 10px; }
.cc:hover h3 { color: var(--navy); }
.meta { display: grid; grid-template-columns: 68px 1fr; gap: 4px 10px; margin: 0; font-size: 13px; }
.meta dt { color: var(--dim); }
.meta dd { margin: 0; color: var(--muted); overflow-wrap: anywhere; }

.help { background: var(--bg2); }
.help h2 { font-size: 20px; font-weight: 700; color: var(--ink); margin: 0 0 10px; }
.help p { font-size: 14px; color: var(--muted); margin: 0 0 18px; }
.btn { display: inline-block; background: var(--navy); color: #fff; padding: 11px 26px; border-radius: 999px; font-size: 14px; }

@media (max-width: 900px) {
  .cols { grid-template-columns: 1fr; gap: 28px; }
  .side { position: static; }
  .cgrid { gap: 28px 20px; }
}
@media (max-width: 560px) {
  .hero { padding: 76px 0 48px; }
  .hero h1 { font-size: 27px; }
  .cgrid { grid-template-columns: 1fr; }
}
</style>
