<template>
  <section>
    <footer class="py-12 text-white flex justify-center">
      <div class="container mx-auto p-5">
        <div class="hidden lg:grid grid-cols-12 gap-5 mb-5">
          <div class="col-span-4">
            <div>
              <img
                src="~/assets/img/Header/meimai_footer.png"
                alt="meimai"
              />
              <p class="text-xl font-medium mb-2">
                Mei-Mai Vechicle electronic LTD.
              </p>
              <div>
                <a
                  class="text-xl icons"
                  :href="websiteInfo.facebook"
                  target="_bland"
                  ><font-awesome-icon class="mr-4 fone_size_1" :icon="['fab', 'facebook']"
                /></a>
                <a
                  class="text-xl icons"
                  :href="websiteInfo.instagram"
                  target="_bland"
                  ><font-awesome-icon class="mr-4 fone_size_1" :icon="['fab', 'instagram']"
                /></a>
                <a
                  class="text-xl icons"
                  :href="websiteInfo.youtube"
                  target="_bland"
                  ><font-awesome-icon class="mr-4 fone_size_1" :icon="['fab', 'youtube']"
                /></a>
              </div>
            </div>
          </div>
          <div class="col-span-4">
            <p class="mb-3">{{ websiteInfo.tel }}</p>
            <p class="mb-3">{{ websiteInfo.email }}</p>
            <p class="mb-3">{{ websiteInfo.address }}</p>
          </div>
          <div class="col-span-4">
            <div>
              <div
                class="fb-page"
                data-href="https://www.facebook.com/MM.MEIMAI"
                data-tabs="timeline"
                data-width="400"
                data-height="200"
                data-small-header="true"
                data-adapt-container-width="true"
                data-hide-cover="false"
                data-show-facepile="true">
                <blockquote
                  cite="https://www.facebook.com/MM.MEIMAI"
                  class="fb-xfbml-parse-ignore">
                  <a href="https://www.facebook.com/MM.MEIMAI">MEIMAI美邁車用電子有限公司</a>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
        <hr class="hidden lg:block mb-5 border-gray-500" />
        <div>
          <p class="text-center text-white mb-0">
            {{ websiteInfo.copyright }}
          </p>
        </div>
      </div>
    </footer>
    <!--facebook-->
    <div id="fb-root"></div>
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
    }
  }
};
</script>

<style scoped>
footer {
  /* background-color: rgba(12, 21, 48, 1); */
  background-color: rgba(13, 0, 43, 1);
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
</style>
