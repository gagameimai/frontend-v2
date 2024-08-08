<template>
  <section>
    <div class="img_box banner flex justify-center items-center">
      <div class="text-white text-2xl font-semibold flex">
        <div class="hover:text-yellow-400 transition-all duration-300">
          <NuxtLink to="/">首頁</NuxtLink>
        </div>
        <div> / </div>
        <h1 class="text-white text-2xl font-semibold">盲點偵測</h1>
      </div>
    </div>
    <!-- -->
    <div class="container mx-auto px-5 py-10 md:py-20">
      <div class="md:grid md:grid-cols-3 lg:grid-cols-4 gap-8">
        <div
          v-for="(blindSpot, index) in blindSpotList"
          :key="index"
          class="col-span-1 py-5"
        >
          <NuxtLink :to="'/blindSpotDetail/' + blindSpot.id">
            <img
              :src="blindSpot.img"
              :alt="blindSpot.name"
            />
            <hr class="mb-5" />
            <h2 class="text-lg font-medium mb-5">
              <font-awesome-icon
                class="text-yellow-400 mr-3"
                :icon="['fas', 'arrow-alt-circle-right']"
              />{{ blindSpot.name }}
            </h2>
          </NuxtLink>
        </div>
      </div>
    </div>
    <!-- end -->
  </section>
</template>

<script>
export default {
  name: "blindSpot",
  data() {
    return {
      blindSpotList:[]
    };
  },
  mounted() {
    this.getBlindSpot();
  },
  methods: {
    getBlindSpot() {
      this.$axios.get('https://admin.meimai.com.tw/api/blindspot').then((response) => {
        let result = response.data.result;
        if (result) {
          this.blindSpotList = result
        }
      })
    }
  }
};
</script>

<style scoped>
.banner {
  background-image: url(/assets/img/blindSpot/banner.png);
}
</style>
