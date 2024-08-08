<template>
  <section>
    <div class="img_box banner"></div>
    <div class="container mx-auto px-5 py-40 md:py-20">
      <div class="max-w-5xl mx-auto mb-16">
        <h2 class="text-2xl font-semibold uppercase lg:text-4xl mb-5">
          資源下載
        </h2>
        <div v-for="(version, idx) in versionList" :key="idx" class="mb-10">
          <h6
            @click.stop="version.isShow = !version.isShow"
            class="font-medium text-xl cursor-pointer mb-5">
            <font-awesome-icon
              v-if="version.isShow"
              class="text-sm text-yellow-400 mr-2"
              :icon="['fas', 'minus']"/>
            <font-awesome-icon
              v-else
              class="text-sm text-yellow-400 mr-2"
              :icon="['fas', 'plus']"/>
            <span>{{ version.name }}</span>
          </h6>
          <transition name="slide">
            <div v-if="version.isShow">
              <p class="mb-3 whitespace-pre-line">{{ version.memo }}</p>
              <ul>
                <li
                  v-for="(resource, index) in version.resources"
                  :key="index"
                  class="border rounded px-3 py-2 mb-3">
                  <p>
                    <span class="mr-5">{{ resource.name }}</span>
                    <a :href="resource.url" target="_blank"><font-awesome-icon
                        class="text-sm text-yellow-400 mr-2"
                        :icon="['fas', 'download']"/>
                        <span class="text-yellow-400">下載</span>
                    </a>
                  </p>
                </li>
              </ul>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "download",
  data() {
    return {
      versionList: []
    };
  },
  mounted() {
    this.getResource();
  },
  methods: {
    getResource() {
      this.$axios.get('https://admin.meimai.com.tw/api/resource').then((response) => {
        let result = response.data.result;
        if (result) {
            this.versionList = result;
            this.versionList.forEach((el, index) => {
              if (index == 0 ) {
                this.$set(this.versionList[index], 'isShow', true);
              }
              else {
                this.$set(this.versionList[index], 'isShow', false);
              }
            })
        }
      })
    }
  }
};
</script>

<style scoped>
.banner {
  background-image: url(/assets/img/download/banner.png);
}
/* vue slide up down */

.slide-enter-active {
  -moz-transition-duration: 0.3s;
  -webkit-transition-duration: 0.3s;
  -o-transition-duration: 0.3s;
  transition-duration: 0.3s;
  -moz-transition-timing-function: ease-in;
  -webkit-transition-timing-function: ease-in;
  -o-transition-timing-function: ease-in;
  transition-timing-function: ease-in;
}
.slide-leave-active {
  -moz-transition-duration: 0.3s;
  -webkit-transition-duration: 0.3s;
  -o-transition-duration: 0.3s;
  transition-duration: 0.3s;
  -moz-transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
  -webkit-transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
  -o-transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
  transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
}
.slide-enter-to,
.slide-leave {
  max-height: 100px;
  overflow: hidden;
}
.slide-enter,
.slide-leave-to {
  overflow: hidden;
  max-height: 0;
}
</style>
