<template>
  <section>
    <div class="hidden img_box banner md:flex justify-center items-center">
      <p class="text-white text-2xl">
        <span class="hover:text-yellow-400 transition-all duration-300"
          ></span
        >
        <span>首頁 / </span>
        <span>盲點偵測</span>
        <span> / </span>
        <span>{{ blindSpotInfo.name }}</span>
      </p>
    </div>
    <!---->
    <div class="container mx-auto px-5 py-20">
      <div class="max-w-5xl mx-auto text-center">
        <h2 class="text-center text-2xl lg:text-3xl font-semibold mb-5">
          {{ blindSpotInfo.name }}
        </h2>
        <p class="mb-5">{{ blindSpotInfo.memo_in }}</p>
        <img
            :src="blindSpotInfo.img"
            :alt="blindSpotInfo.name"
            class="w-full mb-10" />
      </div>
      <div v-html="blindSpotInfo.content"></div>
    </div>
    <!---->
    <div class="container mx-auto px-5 py-10 md:py-20">
      <h2 class="text-center text-2xl lg:text-3xl font-semibold mb-5">
        適用車款
      </h2>
      <div class="flex justify-center items-center">
        <select
          v-model="selectBrandId"
          @change="brandChange"
          class="block w-56 border rounded px-3 py-1 mx-auto mb-10">
          <option
            v-for="(brand, index) in brandList"
            :key="index"
            :value="brand.id">
            {{ brand.name }}
          </option>
        </select>
      </div>
      <!---->
      <h3 class="text-2xl font-semibold mb-5">{{ selectBrandName }}</h3>
      <div v-if="blindSpotList.length > 0"
        class="md:grid md:grid-cols-3 lg:grid-cols-4 gap-5 mb-14">
        <div
          v-for="(blind, index) in blindSpotList"
          :key="index"
          class="col-span-1 mb-5 md:mb-0">
          <div class="border border-gray-300 rounded px-5 py-3">
            <h4 class="font-semibold">車款：{{ blind.style }}</h4>
            <p>年份：{{ blind.year }}</p>
            <p>規格：{{ blind.spc }}</p>
          </div>
        </div>
      </div>
      <!---->
    </div>
    <!---->
  </section>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const id = route.params.id

const selectBrandId = ref(1);
const selectBrandName = ref('AUDI');
const brandList = ref([]);
const blindSpotList = ref([]);

const brandChange = () => {
  if (!selectBrandId.value) {
    return;
  }
  blindSpotList.value = [];
  blindSpotInfo.depend.forEach(el => {
    if (selectBrandId.value == el.car_brand_id) {
      blindSpotList.value.push(el);
    }
  });
  
  blindSpotInfo.car_brand.forEach(el => {
    if (selectBrandId.value === el.id) {
      selectBrandName.value = el.name;
    }
  });
}

const blindSpotInfo = reactive({});
await useAsyncData(
    'blindSpotInfo',
    () => $fetch(`https://admin.meimai.com.tw/api/blindspot/${id}`))
    .then((response)=> {
      if (response) {
        Object.assign(blindSpotInfo, response.data._rawValue.result);
        // 後端傳來的圖片置中效果無效，所以透過前端補上Tailwind 置中 css
        blindSpotInfo.content = blindSpotInfo.content.replaceAll('<img', '<img class="mx-auto" style="hight: auto"');
        blindSpotInfo.content = blindSpotInfo.content.replaceAll('<table', '<table class="mx-auto"');
        brandList.value = blindSpotInfo.car_brand;
        if (selectBrandId) {
          brandChange();
        }
      }
    });

useHead({
  meta: [
    {
      property: 'og:image', content: blindSpotInfo.img ? blindSpotInfo.img : '/new_panel.png'
    }
  ]
})
</script>

<style lang="scss" src="@/assets/css/main.scss" scoped />

<style scoped>
.banner {
  background-image: url(/assets/img/blindSpot/banner.png);
}
</style>
