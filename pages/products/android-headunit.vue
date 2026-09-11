<template>
  <!-- 跨品牌著陸頁：承接「安卓車機／安卓機推薦」這類一般需求詞 -->
  <ProductLanding ns="landingHeadunit" :groups="groups" />
</template>

<script setup>
const groups = [
  {
    key: 'clarion',
    kicker: 'CLARION',
    badge: 'Clarion 歌樂',
    endpoint: '/multimedia',
    params: { type: 2 },
    detailBase: '/multimediaDetail',
    moreTo: '/clarion/gl'
  },
  {
    key: 'clarionOem',
    kicker: 'CLARION OEM',
    badge: 'Clarion 車型專用機',
    endpoint: '/multimedia',
    params: { type: 3 },
    detailBase: '/multimediaDetail',
    moreTo: '/clarion/oem'
  },
  {
    key: 'mm',
    kicker: 'MM MEIMAI',
    badge: 'MM 美邁',
    endpoint: '/multimedia',
    params: { type: 0 },
    detailBase: '/multimediaDetail',
    moreTo: '/multimedia?type=0'
  }
]
</script>
