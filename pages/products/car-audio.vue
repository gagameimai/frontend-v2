<template>
  <!-- 跨品牌著陸頁：承接「汽車音響推薦」這類一般需求詞 -->
  <ProductLanding ns="landingAudio" :groups="groups" />
</template>

<script setup>
const groups = [
  {
    key: 'audio',
    kicker: 'CLARION AUDIO',
    badge: 'Clarion 汽車音響',
    endpoint: '/audio_accessories',
    params: {},
    detailBase: '/clarion/audioAccessoriesDetail',
    moreTo: '/audioAccessories'
  }
]
</script>
