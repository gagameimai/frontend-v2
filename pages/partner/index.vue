<template>
  <section class="overflow-hidden">
    <div class="img_box banner"></div>
    <div class="py-20">
      <div class="container mx-auto p-5">
        <div class="lg:grid grid-cols-6 lg:gap-10 xl:gap-20">
          <div class="col-span-2 mb-10 lg:text-right">
            <h1 class="text-2xl font-semibold uppercase lg:text-4xl lg:mb-5">
              合作經銷
            </h1>
          </div>
          <div class="col-span-4">
            <select
              v-model="county"
              @change="getPartner"
              class="border px-3 py-2 mb-5 w-full lg:w-2/5">
              <option value="">全區域</option>
              <option v-for="(county, index) in counties" :key="index" :value="index">{{ county }}</option>
            </select>
            <div
              v-for="(partner, index) in partners"
              :key="index"
              class="border shadow-md p-5 mb-5">
              <h4 class="text-lg font-semibold mb-3">{{ partner.name }}</h4>
              <p class="mb-2">
                <font-awesome-icon
                  class="text-yellow-400 mr-3"
                  :icon="['fas', 'phone-alt']"/>{{ partner.tel }}
              </p>
              <a
                :href="`https://www.google.com.tw/maps/place/${partner.address}`"
                target="_blank">
                <p>
                  <font-awesome-icon
                    class="text-yellow-400 mr-3"
                    :icon="['fas', 'map-marker-alt']"/>
                    {{ partner.address }}
                </p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "partner",
  data() {
    return {
      partners: [],
      counties: [],
      county: ''
    };
  },
  mounted() {
    this.getPartner();
  },
  methods: {
    getPartner() {
      let params = {
        county: this.county
      };

      this.$axios.get('https://admin.meimai.com.tw/api/partner', {params}).then((response) => {
        let result = response.data.result;
        if (result) {
          if (this.counties.length == 0) { // 沒有值才需要重新assign
            this.counties = result.county;
          }
          this.partners = result.partner
        }
      })
    }
  }
};
</script>

<style scoped>
.banner {
  background-image: url(/assets/img/partner/banner.png);
}
</style>
