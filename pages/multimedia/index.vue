<template>
  <section class="overflow-hidden">
    <div class="hidden md:flex img_box banner justify-center items-center">
      <p class="text-white text-2xl font-semibold">
        <span class="hover:text-yellow-400 transition-all duration-300"
          ><NuxtLink to="/">首頁</NuxtLink></span
        >
        <span> / </span>
        <span>安卓多媒體機</span>
      </p>
    </div>
    <!-- -->
    <div class="container mx-auto px-5 py-20">
      <div
        v-for="(multiMedias, index) in multiMediasList"
        :key="index"
        class="lg:grid grid-cols-8 gap-8 mb-10">
        <div class="col-span-3 py-0 lg:py-16">
          <div>
            <img
              :src="multiMedias.img"
              :alt="multiMedias.name"
              class="w-full"
            />
          </div>
        </div>
        <div class="col-span-5 py-0 md:py-16 flex items-center">
          <div
            data-aos="fade-left"
            data-aos-duration="500"
            data-aos-delay="300"
            data-aos-once="true"
            data-aos-anchor-placement="bottom-bottom"
          >
            <h2 class="text-2xl font-semibold mb-5">
              <font-awesome-icon
                class="text-yellow-400 mr-3"
                :icon="['fas', 'arrow-alt-circle-right']"
              />{{ multiMedias.name }}
            </h2>
            <p class="text-xl mb-8">{{ multiMedias.memo }}</p>
            <p class="text-base mb-5">
              <span
                v-for="(size, key) in multiMedias.size.split(';')"
                :key="key"
                class="border rounded border-yellow-400 px-3 py-1 mr-3"
                >{{ size }}吋</span
              >
            </p>
            <p class="text-base mb-3">
              <font-awesome-icon
                class="text-yellow-400 mr-3"
                :icon="['fas', 'check']"
              />硬體：{{ multiMedias.hard_drive }}
            </p>
            <p class="text-base mb-3">
              <font-awesome-icon
                class="text-yellow-400 mr-3"
                :icon="['fas', 'check']"
              />記憶體：{{ multiMedias.ram }}
            </p>
            <p class="text-base mb-3">
              <font-awesome-icon
                class="text-yellow-400 mr-3"
                :icon="['fas', 'check']"
              />解析度：{{ multiMedias.resolution }}
            </p>
            <p class="text-base mb-8">
              <font-awesome-icon
                class="text-yellow-400 mr-3"
                :icon="['fas', 'check']"
              />建議售價：{{ multiMedias.price }}
            </p>
            <NuxtLink
              :to="'/multimediaDetail/' + multiMedias.id"
              class="block w-full md:w-40 text-center text-white bg-yellow-400 hover:bg-yellow-500 transition-all duration-300 p-3"
              >詳細規格</NuxtLink
            >
          </div>
        </div>
      </div>
    </div>
    <!-- -->
    <div class="hidden lg:block container mx-auto px-5 py-10 md:py-20">
      <h2 class="text-center text-3xl font-semibold mb-8">規格比較</h2>
      <div class="lg:grid lg:grid-cols-2 xl:grid-cols-4 gap-8">
        <div
          v-for="(multiMedias, index) in multiMediasList"
          :key="index"
          data-aos="fade-up"
          data-aos-duration="500"
          data-aos-delay="300"
          data-aos-once="true"
          data-aos-anchor-placement="bottom-bottom"
          class="col-span-1 py-5"
        >
          <img
            :src="multiMedias.img"
            :alt="multiMedias.name"
          />
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
          <!-- <p class="px-2 py-1">
            <font-awesome-icon
              class="text-xs text-yellow-400 mr-3"
              :icon="['fas', 'dot-circle']"
            />系統：{{ multiMedias.system }}
          </p>
          <p class="px-2 py-1">
            <font-awesome-icon
              class="text-xs text-yellow-400 mr-3"
              :icon="['fas', 'dot-circle']"
            />DSP：{{ multiMedias.dsp }}
          </p> -->
          <p class="px-2 py-1">
            <font-awesome-icon
              class="text-xs text-yellow-400 mr-3"
              :icon="['fas', 'dot-circle']"
            />建議售價：{{ multiMedias.price }}
          </p>
        </div>
      </div>
    </div>
    <!-- end -->
  </section>
</template>

<script>
export default {
  name: "multiMedia",
  data() {
    return {
      multiMediasList: []
    };
  },
  mounted() {
    this.getMultiMedias();
  },
  methods: {
    getMultiMedias() {
      this.$axios.get('https://admin.meimai.com.tw/api/multimedia').then((response) => {
        let result = response.data.result;
        if (result) {
          this.multiMediasList = result
        }
      })
    }
  }
};
</script>

<style scoped>
.banner {
  background-image: url(assets/img/multimedia/banner.png);
}
</style>
