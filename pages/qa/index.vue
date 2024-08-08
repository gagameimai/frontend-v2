<template>
  <section>
    <div class="img_box banner"></div>
    <div v-if="this.question" class="container mx-auto px-5 py-20">
      <div  v-html="this.question"></div>
    </div>
  </section>
</template>

<script>
export default {
  data() {
    return {
      question: null
    };
  },
  mounted() {
    this.getQuestion();
  },
  methods: {
    getQuestion(){
      this.$axios.get('https://admin.meimai.com.tw/api/question').then((response) => {
        let result = response.data.result;
        this.question = result.content;
      })
    }
  }
};
</script>

<style scoped>
.banner {
  background-image: url(/assets/img/qa/banner.png);
}
</style>
