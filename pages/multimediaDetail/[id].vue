<template>
  <section>
    <div class="hidden img_box banner md:flex justify-center items-center">
      <p class="text-white text-2xl font-semibold">
        <span class="hover:text-yellow-400 transition-all duration-300"
          ></span
        >
        <span>首頁 / </span>
        <span>安卓多媒體機</span>
        <span> / </span>
        <span>{{ multiMediasInfo.name }}</span>
      </p>
    </div>
    <div class="container mx-auto px-5 py-20">
      <div class="max-w-5xl mx-auto text-center">
        <h2 class="text-center text-2xl lg:text-3xl font-semibold mb-5">
          {{ multiMediasInfo.name }}
        </h2>
        <p class="mb-5">{{ multiMediasInfo.memo_in }}</p>
        <img
            :src="multiMediasInfo.img"
            :alt="multiMediasInfo.name"
            class="w-full mb-10" />
      </div>
      <div v-html="multiMediasInfo.content"></div>
    </div>
  </section>
</template>

<script>
export default {
  name: "[id]",
  data() {
    return {
      multiMediasInfo: {}
    };
  },
  mounted() {
    this.getMultiMedias();
  },
  methods: {
    getMultiMedias() {
      this.$axios.get('https://admin.meimai.com.tw/api/multimedia/' + this.$route.params.id).then((response) => {
        let result = response.data.result;
        if (result) {
          this.multiMediasInfo = result
          // 後端傳來的圖片置中效果無效，所以透過前端補上Tailwind 置中 css
          this.multiMediasInfo.content = this.multiMediasInfo.content.replaceAll('<img', '<img class="mx-auto" style="hight: auto"');
        }
      })
    }
  }
};
</script>

<style lang="scss" src="@/assets/css/main.scss" scoped />
<style scoped>
.banner {
  background-image: url(/assets/img/multimedia/banner.png);
}
</style>
