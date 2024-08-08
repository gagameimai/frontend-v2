<template>
  <section class="overflow-hidden">
    <!-- vue agile -->
    <div id="vue_agile" :class="[ window.width < 1024 ? 'mt-12' : '']">
      <carousel
        :wrap-around="true"
        :autoplay="2000">
        <template v-if="bannerList.length != 0">
        <slide v-for="banner in bannerList" :key="banner">
          <div class="carousel__item">
            <a :href="banner.url">
              <img :src="banner.img"/>
            </a>
          </div>
        </slide>
      </template>
      <template #addons="{ slidesCount }">
          <Navigation v-if="slidesCount > 1" />
          <Pagination v-if="slidesCount > 1" />
        </template>
      </carousel>
    </div>
    <!-- search -->
    <div class="container mx-auto my-10 p-3 border-2 border-yellow-300">
      <div class="md:grid grid-cols-11 gap-8">
        <div class="col-span-3 mb-3 md:mb-0">
          <select
            v-model="brandInputValue"
            @change="brandChange"
            class="w-full h-12 p-3 text-black border rounded-md bg-white"
          >
            <option selected value="">選擇汽車品牌</option>
            <option
              v-for="(brand, index) in brandList"
              :key="index"
              :value="brand.id"
              class="capitalize"
              >{{ brand.name }}</option
            >
          </select>
        </div>
        <div class="col-span-3 mb-3 md:mb-0">
          <select
            v-model="modelInputValue"
            @change="modelChange"
            :disabled="typeSelect"
            class="w-full h-12 p-3 text-black border rounded-md bg-white"
          >
            <option selected value="">選擇車款</option>
            <option
              v-for="(model, index) in modelList"
              :key="index"
              :value="model.id">
              {{ model.name }}
            </option>
          </select>
        </div>
        <div class="col-span-3 mb-3 md:mb-0">
          <select
            v-model="yearInputValue"
            :disabled="yearSelect"
            class="w-full h-12 p-3 text-black border rounded-md bg-white"
          >
            <option disabled value="undefined">選擇年份</option>
            <option
              v-for="(year, index) in yearList"
              :key="index">
              {{ year }}
            </option>
            <option selected value="">所有年份</option>
          </select>
        </div>
        <div class="col-span-2">
          <button
            @click="searchData"
            class="w-full bg-yellow-400 hover:bg-yellow-500 transition-all duration-300 p-3 rounded-md"
          >
            搜尋
          </button>
        </div>
      </div>
    </div>
    <!-- product -->
    <div id="productList">
      <div class="container mx-auto p-5">
        <!---->
        <div class="md:grid grid-cols-7 gap-8">
          <div class="col-span-3 py-5 md:py-10">
            <div>
              <img src="@/assets/img/Home/android.png" alt="" />
            </div>
          </div>
          <div class="col-span-4 py-5 md:py-10 flex items-center">
            <div
              data-aos="fade-left"
              data-aos-duration="500"
              data-aos-delay="300"
              data-aos-once="true"
              data-aos-anchor-placement="bottom-bottom"
            >
              <h2 class="font-semibold text-4xl mb-5">安卓車用多媒體機</h2>
              <p class="text-xl mb-5">
                輕鬆操作智能導航與聯網影音，為車內增添視聽享受與便利結合多功能、挑戰高效能的美邁車用多媒體車機。
              </p>
              <nuxt-link
                to="/multimedia"
                class="block w-full md:w-40 text-center text-white bg-yellow-400 hover:bg-yellow-500 transition-all duration-300 p-3"
                >了解更多</nuxt-link
              >
            </div>
          </div>
        </div>
        <hr />
        <!---->
        <div class="md:grid grid-cols-7 gap-8">
          <div class="col-span-3 py-5 md:py-10">
            <div>
              <img src="@/assets/img/Home/carFrame.jpg" alt="" />
            </div>
          </div>
          <div class="col-span-4 py-5 md:py-10 flex items-center">
            <div
              data-aos="fade-left"
              data-aos-duration="500"
              data-aos-delay="300"
              data-aos-once="true"
              data-aos-anchor-placement="bottom-bottom"
            >
              <h2 class="font-semibold text-4xl mb-5">安卓車框</h2>
              <p class="text-xl mb-5">
                與安卓機完美匹配，美觀專用車框，車款完備。
              </p>
              <nuxt-link
                to="/carFrame"
                class="block w-full md:w-40 text-center text-white bg-yellow-400 hover:bg-yellow-500 transition-all duration-300 p-3"
                >了解更多</nuxt-link
              >
            </div>
          </div>
        </div>
        <hr />
        <!---->
        <div class="md:grid grid-cols-7 gap-8">
          <div class="col-span-3 py-5 md:py-10">
            <div>
              <img src="@/assets/img/Home/blindSpot.png" alt="" />
            </div>
          </div>
          <div class="col-span-4 py-5 md:py-10 flex items-center">
            <div
              data-aos="fade-left"
              data-aos-duration="500"
              data-aos-delay="300"
              data-aos-once="true"
              data-aos-anchor-placement="bottom-bottom"
            >
              <h2 class="font-semibold text-4xl mb-5">盲點偵測</h2>
              <p class="text-xl mb-5">
                無法看見的區域，讓盲點偵測幫您看見。
              </p>
              <nuxt-link
                to="/blindSpot"
                class="block w-full md:w-40 text-center text-white bg-yellow-400 hover:bg-yellow-500 transition-all duration-300 p-3"
                >了解更多</nuxt-link
              >
            </div>
          </div>
        </div>
        <hr />
        <!---->
        <div class="md:grid grid-cols-7 gap-8">
          <div class="col-span-3 py-5 md:py-10">
            <div>
              <img src="@/assets/img/Home/fitting.png" alt="" />
            </div>
          </div>
          <div class="col-span-4 py-5 md:py-10 flex items-center">
            <div
              data-aos="fade-left"
              data-aos-duration="500"
              data-aos-delay="300"
              data-aos-once="true"
              data-aos-anchor-placement="bottom-bottom"
            >
              <h2 class="font-semibold text-4xl mb-5">車用配件</h2>
              <p class="text-xl mb-5">
                更多全面性的車用電子配件選擇，搭配安卓機使用更升級。
              </p>
              <nuxt-link
                to="/fitting"
                class="block w-full md:w-40 text-center text-white bg-yellow-400 hover:bg-yellow-500 transition-all duration-300 p-3"
                >了解更多</nuxt-link
              >
            </div>
          </div>
        </div>
        <!---->
      </div>
    </div>
    <!-- product end -->
    <!-- transition -->
    <div class="relative z-40 flex items-center solution">
      <div
        class="container mx-auto text-white p-5 z-10"
        data-aos="fade-up"
        data-aos-duration="500"
        data-aos-delay="300"
        data-aos-once="true"
        data-aos-anchor-placement="bottom-bottom"
      >
        <h1 class="text-2xl md:text-4xl font-semibold mb-3 uppercase">
          MEIMAI 美邁車用電子有限公司
        </h1>
        <p class="text-xl font-medium leading-loose">
          歡迎來到美邁車用電子有限公司（MM）！提供各種高品質的車載電子產品。我們的產品包括安卓車載多媒體機、行車記錄器、倒車鏡頭、AVM 360環景輔助系統、盲點偵測及各大車型安卓車框等。<br />
          我們以提供卓越的售後服務為主打，不斷推陳出新，從品質把關到保固認證，只提供最優質的產品。同時，我們在台灣逐漸拓展據點，致力於帶來更專業便利的服務。美邁，不只是不錯的選擇，更是您最值得信賴的合作夥伴。<br />
          美邁車用電子，締造驕傲品質
        </p>
      </div>
    </div>
    <!-- transition end-->
    <!-- partner -->
    <div class="px-5 py-10 md:py-20">
      <div class="container mx-auto">
        <h2 class="uppercase text-2xl md:text-4xl font-extrabold mb-5">
          合作經銷
        </h2>
        <select v-model="county"
                @change="getPartner"
                class="border px-3 py-2 mb-5 w-full lg:w-1/3">
          <option value="">全區域</option>
          <option v-for="(county, index) in counties" :key="index" :value="index">{{ county }}</option>
        </select>
        <div class="md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="(partner, index) in partners"
              :key="index"
              class="col-span-1"
              data-aos="fade-up"
              data-aos-duration="500"
              data-aos-delay="300"
              data-aos-once="true"
              data-aos-anchor-placement="bottom-bottom"
          >
            <div class="min-h-full border shadow-md p-5 mb-5">
              <h4 class="text-lg font-semibold mb-3">{{ partner.name }}</h4>
              <p class="mb-2">
                <font-awesome-icon
                  class="text-yellow-400 mr-3"
                  :icon="['fas', 'phone-alt']"
                />{{ partner.tel }}
              </p>
              <p>
                <font-awesome-icon
                  class="text-yellow-400 mr-3"
                  :icon="['fas', 'map-marker-alt']"
                />{{ partner.address }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- partner end -->
  </section>
</template>

<script>
import carFrame from "~/static/carFrame.js";

export default {
  name: "home",
  data() {
    return {
      carFrame,
      bannerList: [],
      brandList: [],
      car: [],
      modelList: [],
      types: [],
      yearList: [],
      years: [],
      brandInputValue: "",
      modelInputValue: "",
      yearInputValue: undefined,
      typeSelect: true,
      yearSelect: true,
      filterData: [],
      partners: [],
      counties: [],
      county: '',
      window: {
          width: 1200,
      }
    };
  },
  mounted() {
    // 取得下拉選單所有資料
    this.$nextTick(() => this.getbanner());
    this.getListData();
    this.getPartner();
  },
  methods: {
    getbanner() {
      this.$axios.get('https://admin.meimai.com.tw/api/banner').then((response) => {
        let result = response.data.result;
        if (result) {
            this.bannerList = result;
        }
      })
    },
    onResize() {
      this.window.width = window.innerWidth;
    },
    getListData() {
      this.$axios.get('https://admin.meimai.com.tw/api/car').then((response) => {
        let carBrand = response.data.car_brand,
            car = response.data.car;
        if (carBrand) {
          this.brandList = carBrand;
        }
        if (car) {
          this.car = car;
        }
      })
    },
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
    },
    brandChange() {
      // default setting
      this.modelInputValue = "";
      this.yearInputValue = undefined;
      this.typeSelect = true;
      this.yearSelect = true;
      //
      const newArray = this.carFrame.filter(
        item => item.brand === this.brandInputValue
      );
      const arr = [];
      newArray.forEach(item => {
        // arr.push(item.type);
        arr.push(...item.model);
      });
      this.types = [...new Set(arr)];
      this.typeSelect = false;

      this.modelList = [];
      this.car.forEach(el => {
        if(this.brandInputValue == el.car_brand_id) {
          this.modelList.push(el);
        }
      });
    },
    modelChange() {
      const newArray = this.carFrame.filter(
        item =>
          item.brand === this.brandInputValue &&
          item.type.includes(this.modelInputValue)
      );
      const arr = [];
      newArray.forEach(item => {
        arr.push(...item.year);
      });
      this.years = [...new Set(arr)];
      this.yearSelect = false;

      this.yearList = [];
      let tempStart = 0,
          tempEnd = 0;
      if(this.modelInputValue == 'all') {
        this.modelList.forEach((el, index) => {
          if (index == 0) {
            tempStart = el.year_start;
            tempEnd = el.year_end;
          }
          else {
            if (el.year_start < tempStart) {
              tempStart = el.year_start;
            }
            if (el.year_end > tempEnd) {
              tempEnd = el.year_end;
            }
          }
        });
        if (tempStart != 0 && tempEnd != 0) {
          let years = +tempEnd - +tempStart;
          this.yearList.push(tempStart);
          for(let i=1; i<=years; i++) {
            this.yearList.push(+tempStart + i);
          }
        }
      }
      else {
        this.modelList.forEach(el => {
          if(this.modelInputValue == el.id) {
            let years = +el.year_end - +el.year_start;
            this.yearList.push(el.year_start);
            for(let i=1; i<=years; i++) {
              this.yearList.push(+el.year_start + i);
            }
          }
        });
      }
    },
    searchData() {
      this.$router.push({
        path: "/searchPage",
        query: {
          brand: this.brandInputValue,
          model: this.modelInputValue,
          year: this.yearInputValue
        }
      });
      // localStorage.setItem("brand", this.brandInputValue);
      // localStorage.setItem("model", this.modelInputValue);
      // localStorage.setItem("year", this.yearInputValue);
    }
  }
};
</script>

<style scoped>
.carousel__item {
  min-height: 200px;
  width: 100%;
  background-color: var(--vc-clr-primary);
  color: var(--vc-clr-white);
  font-size: 20px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  & img {
    width: 100%;
  }
}
.carousel__prev,
.carousel__next {
  box-sizing: content-box;
}

.text-shadow {
  text-shadow: 1px 1px 3px rgba(35, 24, 21, 0.3);
}

.solution {
  position: relative;
  background-image: url(/assets/img/Home/bannerBG.png);
  background-repeat: no-repeat;
  background-size: cover;
  background-attachment: fixed;
  z-index: 4;
}

.solution::after {
  content: "00000";
  position: absolute;
  inset: 0 0 0 0;
  z-index: 5;
  background-color: rgba(35, 24, 21, 0.5);
}
</style>