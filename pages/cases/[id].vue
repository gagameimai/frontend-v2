<template>
  <div class="cd-page">
    <div class="wrap crumb">
      <NuxtLink to="/">{{ $t('cases.home') }}</NuxtLink> ／
      <NuxtLink to="/cases">{{ $t('cases.title') }}</NuxtLink> ／
      <span>{{ info.name }}</span>
    </div>

    <section class="top">
      <div class="wrap grid">
        <div class="ph">
          <img v-if="info.img" :src="info.img" :alt="info.name" @error="onImgError" />
          <div v-else class="noph"><b>CASE</b></div>
        </div>
        <div class="info">
          <div class="cat">{{ caseCategoryLabel(info.category) }}</div>
          <h1>{{ info.name }}</h1>
          <dl class="meta">
            <template v-if="info.car_model"><dt>{{ $t('cases.car') }}</dt><dd>{{ info.car_model }}</dd></template>
            <template v-if="info.product"><dt>{{ $t('cases.product') }}</dt><dd>{{ info.product }}</dd></template>
            <template v-if="info.dealer"><dt>{{ $t('cases.dealer') }}</dt><dd>{{ info.dealer }}</dd></template>
            <template v-if="info.installed_at"><dt>{{ $t('cases.date') }}</dt><dd>{{ info.installed_at }}</dd></template>
          </dl>
        </div>
      </div>
    </section>

    <section v-if="info.need || info.work" class="body">
      <div class="wrap-sm">
        <div v-if="info.need" class="blk">
          <h2>{{ $t('cases.need') }}</h2>
          <p>{{ info.need }}</p>
        </div>
        <div v-if="info.work" class="blk">
          <h2>{{ $t('cases.work') }}</h2>
          <p>{{ info.work }}</p>
        </div>
      </div>
    </section>

    <section class="help">
      <div class="wrap-sm">
        <h2>{{ $t('cases.helpTitle') }}</h2>
        <p>{{ $t('cases.helpDesc') }}</p>
        <NuxtLink to="/partner" class="btn">{{ $t('cases.toDealers') }}</NuxtLink>
        <NuxtLink to="/cases" class="back">← {{ $t('cases.back') }}</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { usePageSeo } from '~/composables/usePageSeo'
const { t } = useI18n()
const route = useRoute()
const config = useRuntimeConfig()

const { data } = await useAsyncData(`install-case-${route.params.id}`, () =>
  $fetch(`${config.public.apiBase}/install_cases/${route.params.id}`).catch(() => ({ result: {} }))
)
const info = computed(() => data.value?.result ?? {})

const caseCategoryKeys = {
  0: 'home.caseCategory0', 1: 'home.caseCategory1', 2: 'home.caseCategory2',
  3: 'home.caseCategory3', 4: 'home.caseCategory4', 5: 'home.caseCategory5',
  6: 'home.caseCategory6', 7: 'home.caseCategory7', 8: 'home.caseCategory8'
}
const caseCategoryLabel = (v) => (caseCategoryKeys[v] ? t(caseCategoryKeys[v]) : '')
const onImgError = (e) => { e.target.style.display = 'none' }

usePageSeo({
  title: () => info.value.name || t('cases.title'),
  description: () =>
    [info.value.car_model, info.value.product, info.value.need].filter(Boolean).join('、') || t('cases.intro'),
  image: () => info.value.img
})
</script>

<style scoped>
.cd-page {
  --ink: #0d1b2e; --text: #1b2431; --muted: #5b6675; --dim: #93a0b0;
  --bg: #fff; --bg2: #f5f7fa; --line: #e6ebf1; --navy: #007abe;
  font-family: 'Noto Sans TC', system-ui, 'Microsoft JhengHei', sans-serif;
  background: var(--bg); color: var(--text); line-height: 1.75; letter-spacing: 0.02em;
}
.cd-page a { color: inherit; text-decoration: none; }
.wrap { max-width: 1080px; margin: 0 auto; padding: 0 26px; }
.wrap-sm { max-width: 760px; margin: 0 auto; padding: 0 26px; }
.cd-page section { padding: 48px 0; }

.crumb { padding-top: 26px; font-size: 12px; color: var(--dim); }
.crumb a:hover { color: var(--navy); }

.grid { display: grid; grid-template-columns: 1.15fr 1fr; gap: 40px; align-items: start; }
.grid > * { min-width: 0; }
.ph { aspect-ratio: 16 / 10; background: var(--bg2); overflow: hidden; }
.ph img { width: 100%; height: 100%; object-fit: cover; display: block; }
.noph { width: 100%; height: 100%; display: grid; place-items: center; color: var(--dim); letter-spacing: 3px; }
.cat { font-size: 11px; letter-spacing: 1px; color: var(--navy); margin-bottom: 8px; }
.info h1 { font-size: 26px; font-weight: 900; color: var(--ink); margin: 0 0 18px; }
.meta { display: grid; grid-template-columns: 76px 1fr; gap: 8px 12px; margin: 0; font-size: 14px; border-top: 1px solid var(--line); padding-top: 16px; }
.meta dt { color: var(--dim); }
.meta dd { margin: 0; color: var(--text); overflow-wrap: anywhere; }

.body { padding-top: 0; }
.blk { border-top: 1px solid var(--line); padding-top: 20px; margin-top: 28px; }
.blk h2 { font-size: 15px; font-weight: 700; color: var(--ink); margin: 0 0 8px; }
.blk p { font-size: 14px; color: var(--muted); margin: 0; white-space: pre-line; }

.help { background: var(--bg2); }
.help h2 { font-size: 20px; font-weight: 700; color: var(--ink); margin: 0 0 10px; }
.help p { font-size: 14px; color: var(--muted); margin: 0 0 18px; }
.btn { display: inline-block; background: var(--navy); color: #fff; padding: 11px 26px; border-radius: 999px; font-size: 14px; }
.back { display: inline-block; margin-left: 16px; font-size: 13px; color: var(--muted); }
.back:hover { color: var(--navy); }

@media (max-width: 820px) {
  .grid { grid-template-columns: 1fr; gap: 24px; }
  .info h1 { font-size: 22px; }
}
</style>
