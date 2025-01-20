<template>
  <section>
    <div class="hidden img_box banner md:flex justify-center items-center">
      <p class="text-white text-2xl">
        <span class="hover:text-yellow-400 transition-all duration-300">
          <NuxtLink to="/">首頁</NuxtLink>
        </span>
        <span> / </span>
        <span class="hover:text-yellow-400 transition-all duration-300">
          <NuxtLink to="/carFrame">安卓車框</NuxtLink>
        </span>
        <span> / </span>
        <span>{{ carFrameInfo.brand_name }}</span>
      </p>
    </div>

    <div class="container mx-auto px-5 py-20">
      <div class="max-w-5xl mx-auto text-center">
        <h2 class="text-center text-2xl lg:text-3xl font-semibold mb-5">
          {{ carFrameInfo.brand_name }} {{ carFrameInfo.car_name }}{{ carFrameInfo.name }}
        </h2>
        <p class="text-xl font-medium mb-5">
          年份 / {{ carFrameInfo.year_start }}~{{ carFrameInfo.year_end }} 、 尺寸 / {{ carFrameInfo.size }}吋
        </p>
        <img
            :src="carFrameInfo.img"
            :alt="carFrameInfo.name"
            class="w-full mb-10" />
      </div>
      <h2
        v-if="carFrameInfo.img3"
        class="text-center text-3xl font-semibold mb-5">
        車框概觀
      </h2>
      <div
        v-if="carFrameInfo.img3"
        class="max-w-5xl mx-auto text-center">
        <img
            :src="carFrameInfo.img3"
            class="w-full mb-10" />
      </div>
      <h2
        v-if="carFrameInfo.img1 && carFrameInfo.img1[0] != ''"
        class="text-center text-3xl font-semibold mb-5">
        車框配件
      </h2>
      <span v-if="carFrameInfo.img1 && Array.isArray(carFrameInfo.img1)">
        <div
          v-for="image in carFrameInfo.img1"
          :key="image"
          class="max-w-5xl mx-auto text-center">
          <img
              v-if="image"
              :src="image"
              class="w-full mb-10" />
        </div>
      </span>
      <h2
        v-if="carFrameInfo.img2 && carFrameInfo.img2[0] != ''"
        class="text-center text-3xl font-semibold mb-5">
        實際安裝
      </h2>
      <span v-if="carFrameInfo.img2 && Array.isArray(carFrameInfo.img2)">
        <div
          v-for="image in carFrameInfo.img2"
          :key="image"
          class="max-w-5xl mx-auto text-center">
          <img
              v-if="image"
              :src="image"
              class="w-full mb-10" />
        </div>
      </span>
      <h2
        v-if="carFrameInfo.content"
        class="text-center text-3xl font-semibold mb-5">
        產品說明
      </h2>
      <div v-html="carFrameInfo.content"></div>
    </div>
    <!---->
    <div class="container mx-auto px-5 py-10 md:py-20">
      <h2 class="text-center text-3xl font-semibold mb-8">推廌搭配安卓機</h2>
      <div class="lg:grid lg:grid-cols-2 xl:grid-cols-4 gap-8">
        <div v-for="(multiMedias, index) in multiMediasInfo" :key="index" class="col-span-1 py-5">
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

const multiMediasInfo = reactive({});
await useAsyncData(
    'multiMediasList',
    () => $fetch('https://admin.meimai.com.tw/api/multimedia'))
    .then((response)=> {
      if (response) {
        Object.assign(multiMediasInfo, response.data._rawValue.result);
      }
    });

const carFrameInfo = reactive({});
await useAsyncData(
  'carFrameInfo',
   () => $fetch(`https://admin.meimai.com.tw/api/carframe/${id}`))
   .then((response)=> {
      if (response) {
        Object.assign(carFrameInfo, response.data._rawValue.result);
      }
    });

useHead({
  meta: [
    {
      property: 'og:image', content: carFrameInfo.img ? carFrameInfo.img : '/new_panel.png'
    }
  ]
})
</script>

<style lang="scss" src="@/assets/css/main.scss" scoped />
<style scoped>
.banner {
  background-image: url(/assets/img/carFrame/banner.png);
}
</style>
