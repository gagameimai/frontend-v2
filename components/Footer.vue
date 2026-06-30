<template>
  <section>
    <footer class="py-10 text-white flex justify-center">
      <div class="container mx-auto p-5">
        <div class="hidden lg:grid place-items-center gap-5">
          <div class="col-span-5">
            <div class="mt-[-30px]">
              <img
                width="280"
                src="~/assets/img/Header/meimai_footer.png"
                alt="meimai"
              />
            </div>
            <div class="lg:grid place-items-center">
              <p class="mb-4">{{ websiteInfo.tel }}</p>
              <div class="w-[230px] mb-4 inline-block text-justify">{{ websiteInfo.address }}</div>
              <p class="mb-4">{{ websiteInfo.email }}</p>
              <div class="mb-4">
                <a
                  class="text-[#F28729] text-xl icons"
                  :href="websiteInfo.facebook"
                  target="_bland"
                  ><font-awesome-icon class="mr-4 fa-2x" :icon="['fab', 'square-facebook']"
                /></a>
                <a
                  class="text-[#F28729] text-xl icons"
                  :href="websiteInfo.instagram"
                  target="_bland"
                  ><font-awesome-icon class="mr-4 fa-2x" :icon="['fab', 'instagram']"
                /></a>
                <a
                  class="text-[#F28729] text-xl icons"
                  :href="websiteInfo.youtube"
                  target="_bland"
                  ><font-awesome-icon class="fa-2x" :icon="['fab', 'square-youtube']"
                /></a>
              </div>
            </div>
          </div>

          <!-- <div class="col-span-4 mt-[-10px]">
            <div>
              <iframe src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2FMM.MEIMAI&tabs=timeline&width=400&height=200&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true&appId" width="400" height="200" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>
            </div>
          </div> -->
        </div>
        <hr class="hidden lg:block mb-5 border-gray-500" />
        <div>
          <p class="text-center text-white mb-0">
            {{ websiteInfo.copyright }}
          </p>
        </div>
      </div>
    </footer>
    <!-- back to top button -->
    <img class="to-top" title="回到頂部" src="@/assets/img/Home/to_top.png" @click="backToTop"/>
  </section>
</template>

<script>
export default {
  name: "website",
  data() {
    return {
      websiteInfo:[]
    };
  },
  mounted() {
    this.getWebsiteInfo();
  },
  methods: {
    getWebsiteInfo() {
      this.$axios.get('https://admin.meimai.com.tw/api/website').then((response) => {
        let result = response.data.result;
        if (result) {
          this.websiteInfo = result
        }
      })
    },
    backToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }
};
</script>

<style scoped>
footer {
  /* background-color: rgba(12, 21, 48, 1); */
  background-color: #023059;
}
.icons {
  color: rgba(236, 167, 44, 1);
}
a {
  color: rgba(255, 255, 255, 1);
  text-decoration: none;
  transition: all 0.3s;
}
a:hover {
  color: rgba(243, 182, 31, 1);
}
.to-top {
  width: 50px;
  height: 50px;
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  cursor: pointer;
}
</style>
