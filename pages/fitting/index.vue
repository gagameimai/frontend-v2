<template>
  <section class="overflow-hidden">
    <div class="hidden img_box banner md:flex justify-center items-center">
      <div class="text-white text-2xl">
        <span class="hover:text-yellow-400 transition-all duration-300">
          <NuxtLink to="/">首頁</NuxtLink>
        </span>
        <span> / </span>
        <span>車用配件</span>
      </div>
    </div>
    <div class="container mx-auto px-5 py-20">
      <div class="md:grid md:grid-cols-3 lg:grid-cols-4 gap-8">
        <div v-for="(fitting, index) in fittingList" :key="index" class="col-span-1 py-5">
          <NuxtLink :to="'/fittingDetail/' + fitting.id">
            <img
              :src="fitting.img"
              :alt="fitting.name" />
            <h2 class="text-lg font-medium mb-5">
              <font-awesome-icon
                class="text-yellow-400 mr-3"
                :icon="['fas', 'arrow-alt-circle-right']"
              />{{ fitting.name }}
            </h2>
            <hr class="mb-5" />
            <p class="px-2 py-1">
              <font-awesome-icon
                class="text-xs text-yellow-400 mr-3"
                :icon="['fas', 'dot-circle']"
              />材質: {{ fitting.material }}
            </p>
            <p class="px-2 py-1">
              <font-awesome-icon
                class="text-xs text-yellow-400 mr-3"
                :icon="['fas', 'dot-circle']"
              />電源: {{ fitting.power }}
            </p>
          </NuxtLink>
        </div>
      </div>
    </div>
    <!-- end -->
  </section>
</template>

<script>
export default {
  name: "fitting",
  data() {
    return {
      fittingList: []
    };
  },
  mounted() {
    this.getFitting();
  },
  methods: {
    getFitting() {
      this.$axios.get('https://admin.meimai.com.tw/api/fitting').then((response) => {
        let result = response.data.result;
        if (result) {
            this.fittingList = result;
        }
      })
    }
  }
};
</script>

<style scoped>
.banner {
  background-image: url(/assets/img/fitting/banner.png);
}
</style>
