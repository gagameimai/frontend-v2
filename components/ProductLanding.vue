<template>
  <div class="lp-page">
    <!-- HERO -->
    <div class="hero" :class="{ 'has-bn': banner.img }">
      <!-- 後台「列表頁 Banner 管理 → 產品分類頁」：電腦版 1920×480（4:1）、手機版 1080×608（16:9）。
           沒上傳就維持原本的標題帶樣式，不會變高變空。 -->
      <div v-if="banner.img" class="bn" :style="{ '--bg': 'url(' + banner.img + ')', '--bg-m': 'url(' + (banner.imgMobile || banner.img) + ')' }"></div>
      <div v-if="banner.img" class="bn-ov"></div>
      <div class="ov"></div>
      <div class="wrap in">
        <div class="ey">{{ t(`${ns}.eyebrow`) }}</div>
        <h1>{{ t(`${ns}.title`) }}</h1>
        <p>{{ t(`${ns}.intro`) }}</p>
      </div>
    </div>

    <!-- 怎麼挑 -->
    <section class="guide">
      <div class="wrap">
        <div class="kick">{{ t(`${ns}.guideLabel`) }}</div>
        <h2>{{ t(`${ns}.guideTitle`) }}</h2>
        <div class="gitems">
          <div v-for="n in 3" :key="n" class="gi">
            <div class="no">0{{ n }}</div>
            <h3>{{ t(`${ns}.guide${n}Title`) }}</h3>
            <p>{{ t(`${ns}.guide${n}Desc`) }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 各品牌產品 -->
    <section v-for="g in groups" :key="g.key" class="grp">
      <div class="wrap">
        <div class="ghead">
          <div>
            <div class="kick">{{ g.kicker }}</div>
            <h2>{{ t(`${ns}.${g.key}Title`) }}</h2>
            <p class="lead">{{ t(`${ns}.${g.key}Desc`) }}</p>
          </div>
          <NuxtLink v-if="g.moreTo" :to="g.moreTo" class="more">{{ t(`${ns}.viewAll`) }} →</NuxtLink>
        </div>

        <div v-if="listOf(g.key).length" class="pgrid">
          <NuxtLink
            v-for="item in listOf(g.key).slice(0, 8)"
            :key="item.id"
            class="pcard"
            :to="`${g.detailBase}/${item.id}`"
          >
            <div class="ph">
              <img v-if="item.img" :src="item.img" :alt="`${item.name} ${t(`${ns}.altKeyword`)}`" loading="lazy" @error="onImgError" />
            </div>
            <h3>{{ item.name }}</h3>
            <small>{{ g.badge }}</small>
          </NuxtLink>
        </div>
        <p v-else class="empty">{{ t(`${ns}.empty`) }}</p>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta">
      <div class="wrap-sm">
        <h2>{{ t(`${ns}.ctaTitle`) }}</h2>
        <p>{{ t(`${ns}.ctaDesc`) }}</p>
        <NuxtLink to="/partner" class="btn">{{ t(`${ns}.ctaBtn`) }}</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { usePageSeo } from '~/composables/usePageSeo'

const props = defineProps({
  // i18n 命名空間，例如 landingHeadunit
  ns: { type: String, required: true },
  // 每一組＝一個品牌的產品清單
  // { key, kicker, badge, endpoint, params, detailBase, moreTo }
  groups: { type: Array, required: true }
})

const { t } = useI18n()
// 後台「列表頁 Banner 管理」：沒設定時 banner.img 為 null，維持原本的標題帶
import { useListBanner } from '~/composables/useListBanner'
const banner = useListBanner('productLanding', computed(() => props.ns))
const config = useRuntimeConfig()

const { data } = await useAsyncData(`landing-${props.ns}`, async () => {
  const out = {}
  await Promise.all(
    props.groups.map(async (g) => {
      try {
        const res = await $fetch(`${config.public.apiBase}${g.endpoint}`, { params: g.params || {} })
        out[g.key] = Array.isArray(res?.result) ? res.result : []
      } catch (e) {
        out[g.key] = []
      }
    })
  )
  return out
})

const listOf = (key) => data.value?.[key] ?? []
const onImgError = (e) => { e.target.style.display = 'none' }

usePageSeo({
  title: () => t(`${props.ns}.seoTitle`),
  description: () => t(`${props.ns}.seoDesc`),
  noSuffix: true
})
</script>

<style scoped>
.lp-page {
  --ink: #0d1b2e; --text: #1b2431; --muted: #5b6675; --dim: #93a0b0;
  --bg: #fff; --bg2: #f5f7fa; --line: #e6ebf1; --navy: #007abe; --dark: #0d1016;
  font-family: 'Noto Sans TC', system-ui, 'Microsoft JhengHei', sans-serif;
  background: var(--bg); color: var(--text); line-height: 1.85; letter-spacing: 0.02em;
}
.lp-page a { color: inherit; text-decoration: none; }
.wrap { max-width: 1080px; margin: 0 auto; padding: 0 26px; }
.wrap-sm { max-width: 760px; margin: 0 auto; padding: 0 26px; }
.lp-page section { padding: 60px 0; }

.hero { position: relative; background: var(--dark); color: #fff; padding: 100px 0 68px; }
.hero .ov { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,122,190,.2), transparent 62%); }
.hero .in { position: relative; z-index: 2; }
.hero .ey { font-size: 12px; letter-spacing: 2px; color: #7fc4ea; margin-bottom: 10px; }
.hero h1 { font-size: 36px; font-weight: 900; margin: 0 0 14px; letter-spacing: .02em; }
.hero p { max-width: 660px; color: #c6ced8; font-size: 15px; margin: 0; }

.kick { font-size: 12px; letter-spacing: 2px; color: var(--navy); margin-bottom: 8px; }
.lp-page h2 { font-size: 23px; font-weight: 800; color: var(--ink); margin: 0 0 12px; }
.lead { font-size: 14px; color: var(--muted); margin: 0; max-width: 640px; }

.guide { background: var(--bg2); }
.gitems { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin-top: 26px; }
.gi { border-top: 2px solid var(--ink); padding-top: 16px; }
.gi .no { font-size: 12px; letter-spacing: 2px; color: var(--navy); margin-bottom: 8px; }
.gi h3 { font-size: 16px; font-weight: 700; color: var(--ink); margin: 0 0 8px; }
.gi p { font-size: 14px; color: var(--muted); margin: 0; }

.grp { border-top: 1px solid var(--line); }
.ghead { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 26px; }
.more { font-size: 13px; color: var(--navy); white-space: nowrap; }
.more:hover { text-decoration: underline; }
.pgrid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px 20px; }
.pcard .ph { aspect-ratio: 4 / 3; background: var(--bg2); display: grid; place-items: center; overflow: hidden; }
.pcard .ph img { width: 100%; height: 100%; object-fit: contain; padding: 12px; box-sizing: border-box; mix-blend-mode: multiply; }
.pcard h3 { font-size: 14px; font-weight: 500; color: var(--ink); margin: 10px 0 4px; }
.pcard:hover h3 { color: var(--navy); }
.pcard small { color: var(--dim); font-size: 12px; }
.empty { font-size: 14px; color: var(--muted); }

.cta { background: var(--dark); color: #fff; text-align: center; }
.cta h2 { color: #fff; }
.cta p { font-size: 14px; color: #c6ced8; margin: 0 0 20px; }
.btn { display: inline-block; background: var(--navy); color: #fff; padding: 12px 30px; border-radius: 999px; font-size: 14px; }

@media (max-width: 900px) {
  .gitems { grid-template-columns: 1fr; gap: 22px; }
  .pgrid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 560px) {
  .hero { padding: 80px 0 52px; }
  .hero h1 { font-size: 27px; }
  .ghead { flex-direction: column; align-items: flex-start; }
}

.hero.has-bn { aspect-ratio: 4 / 1; min-height: 260px; display: flex; align-items: center; }
.hero.has-bn .in, .hero.has-bn > .wrap { width: 100%; }
.hero .bn { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; background-image: var(--bg); background-size: cover; background-position: center; }
.hero .bn-ov { position: absolute; inset: 0; z-index: 1; background: linear-gradient(90deg, rgba(13, 16, 22, 0.93) 0%, rgba(13, 16, 22, 0.86) 36%, rgba(13, 16, 22, 0.55) 56%, rgba(13, 16, 22, 0.12) 80%); }
@media (max-width: 640px) {
  .hero.has-bn { display: block; aspect-ratio: auto; min-height: 0; }
  .hero.has-bn .bn { position: relative; inset: auto; height: auto; aspect-ratio: 16 / 9; background-image: var(--bg-m, var(--bg)); }
  .hero.has-bn .bn-ov { display: none; }
}
</style>
