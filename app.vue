<template>
  <div>
    <Header />
    <NuxtPage />
    <Footer />
  </div>
</template>

<script setup>
useSeoMeta({
  ogImage: '/new_panel.png'
})
// useHead({
//   meta: [
//     {
//       property: 'og:image', content: `https://www.meimai.com.tw/new_panel.png`
//     }
//   ]
// })
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;900&display=swap");

html {
  font-family: "Noto Sans JP", "Source Sans Pro", -apple-system,
    BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
  color: rgba(12, 21, 48, 1);
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
}
</style>

