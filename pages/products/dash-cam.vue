<template>
  <!-- 跨品牌著陸頁：承接「行車記錄器推薦」這類一般需求詞 -->
  <ProductLanding ns="landingDashcam" :groups="groups" />
</template>

<script setup>
const groups = [
  {
    key: 'clarion',
    kicker: 'CLARION',
    badge: 'Clarion 歌樂',
    endpoint: '/dashcam',
    params: { brand: 1 },
    detailBase: '/clarion/dashcamDetail',
    moreTo: '/clarion/dashcam'
  },
  {
    key: 'mm',
    kicker: 'MM MEIMAI',
    badge: 'MM 美邁',
    endpoint: '/dashcam',
    params: { brand: 0 },
    detailBase: '/mm/dashcamDetail',
    moreTo: '/mm/dashcam'
  }
]
</script>
