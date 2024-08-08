<template>
  <section>
    <div class="hidden img_box banner md:flex justify-center items-center">
      <p class="text-white text-2xl font-semibold">
        <span class="hover:text-yellow-400 transition-all duration-300">
          <NuxtLink to="/">首頁</NuxtLink>
        </span>
        <span> / </span>
        <span class="hover:text-yellow-400 transition-all duration-300">
          <NuxtLink to="/carFrame">安卓車框</NuxtLink>
        </span>
        <span> / </span>
        <span>{{ carFrameInfo.result.brand_name }}</span>
      </p>
    </div>

    <div class="container mx-auto px-5 py-20">
      <div class="max-w-5xl mx-auto text-center">
        <h2 class="text-center text-2xl lg:text-3xl font-semibold mb-5">
          {{ carFrameInfo.result.brand_name }} {{ carFrameInfo.result.car_name }}{{ carFrameInfo.result.name }}
        </h2>
        <p class="text-xl font-medium mb-5">
          年份 / {{ carFrameInfo.result.year_start }}~{{ carFrameInfo.result.year_end }} 、 尺寸 / {{ carFrameInfo.result.size }}吋
        </p>
        <img
            :src="carFrameInfo.result.img"
            :alt="carFrameInfo.result.name"
            class="w-full mb-10" />
      </div>
      <h2
        v-if="carFrameInfo.result.img3"
        class="text-center text-3xl font-semibold mb-5">
        車框概觀
      </h2>
      <div
        v-if="carFrameInfo.result.img3"
        class="max-w-5xl mx-auto text-center">
        <img
            :src="carFrameInfo.result.img3"
            class="w-full mb-10" />
      </div>
      <h2
        v-if="carFrameInfo.result.img1 && carFrameInfo.result.img1[0] != ''"
        class="text-center text-3xl font-semibold mb-5">
        車框配件
      </h2>
      <span v-if="carFrameInfo.result.img1 && Array.isArray(carFrameInfo.result.img1)">
        <div
          v-for="image in carFrameInfo.result.img1"
          :key="image"
          class="max-w-5xl mx-auto text-center">
          <img
              v-if="image"
              :src="image"
              class="w-full mb-10" />
        </div>
      </span>
      <h2
        v-if="carFrameInfo.result.img2 && carFrameInfo.result.img2[0] != ''"
        class="text-center text-3xl font-semibold mb-5">
        實際安裝
      </h2>
      <span v-if="carFrameInfo.result.img2 && Array.isArray(carFrameInfo.result.img2)">
        <div
          v-for="image in carFrameInfo.result.img2"
          :key="image"
          class="max-w-5xl mx-auto text-center">
          <img
              v-if="image"
              :src="image"
              class="w-full mb-10" />
        </div>
      </span>
      <h2
        v-if="carFrameInfo.result.content"
        class="text-center text-3xl font-semibold mb-5">
        產品說明
      </h2>
      <div v-html="carFrameInfo.result.content"></div>
    </div>
    <!---->
    <div class="container mx-auto px-5 py-10 md:py-20">
      <h2 class="text-center text-3xl font-semibold mb-8">推廌搭配安卓機</h2>
      <div class="lg:grid lg:grid-cols-2 xl:grid-cols-4 gap-8">
        <div v-for="(multiMedias, index) in multiMediasList.result" :key="index" class="col-span-1 py-5">
          <nuxt-link
            :to="{
              name: 'multimediaDetail-id',
              query: {
                id: multiMedias.id
              }
            }"
          >
            <img
              :src="multiMedias.img"
              :alt="multiMedias.name"
              class="w-full"
            />
          </nuxt-link>
          <h2 class="text-lg font-medium mb-5">
            <font-awesome-icon
              class="text-yellow-400 mr-3"
              :icon="['fas', 'arrow-alt-circle-right']"
            />{{ multiMedias.name }}
          </h2>
          <hr class="mb-5" />
          <p class="px-2 py-1">
            <font-awesome-icon
              class="text-xs text-yellow-400 mr-3"
              :icon="['fas', 'dot-circle']"
            />硬體：{{ multiMedias.hard_drive }}
          </p>
          <p class="px-2 py-1">
            <font-awesome-icon
              class="text-xs text-yellow-400 mr-3"
              :icon="['fas', 'dot-circle']"
            />記憶體：{{ multiMedias.ram }}
          </p>
          <p class="px-2 py-1">
            <font-awesome-icon
              class="text-xs text-yellow-400 mr-3"
              :icon="['fas', 'dot-circle']"
            />解析度：{{ multiMedias.resolution }}
          </p>
          <p class="px-2 py-1">
            <font-awesome-icon
              class="text-xs text-yellow-400 mr-3"
              :icon="['fas', 'dot-circle']"
            />建議售價：{{ multiMedias.price }}
          </p>
        </div>
      </div>
    </div>
    <!---->
  </section>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const id = route.params.id

const { data: multiMediasList } = await useAsyncData(
    'multiMediasList',
    () => $fetch('https://admin.meimai.com.tw/api/multimedia'))

const { data: carFrameInfo } = await useAsyncData(
  'carFrameInfo',
   () => $fetch(`https://admin.meimai.com.tw/api/carframe/${id}`))

// useSeoMeta({
//   ogImage: carFrameInfo._rawValue.result.img ? carFrameInfo._rawValue.result.img : '/new_panel.png'
// })

useHead({
  meta: [
    {
      property: 'og:image', content: carFrameInfo._rawValue.result.img ? carFrameInfo._rawValue.result.img : '/new_panel.png'
    }
  ]
})

console.log(carFrameInfo)

</script>

<style lang="scss" src="@/assets/css/main.scss" scoped />
<style scoped>
.banner {
  background-image: url(/assets/img/carFrame/banner.png);
}
</style>
