<template>
  <section>
    <div class="img_box banner">
      <div class="text-center pt-28 pb-20 md:py-14 lg:pt-44">
        <p class="hidden lg:block text-white text-2xl font-semibold mb-10">
          <span class="hover:text-yellow-400 transition-all duration-300">
            <NuxtLink to="/">首頁</NuxtLink>
          </span>
          <span> / </span>
          <span>{{ breadcrumbBlands }} - {{ breadcrumbModel }}</span>
        </p>
        <div class="container mx-auto px-5">
          <div class="lg:grid grid-cols-10 gap-5">
            <!---->
            <div class="col-span-3 mb-3 lg:mb-0">
              <select
                v-model="brandInputValue"
                @change="brandChange(true)"
                class="w-full h-12 p-3 text-black"
              >
                <option value="" selected>選擇汽車品牌</option>
                <option
                  v-for="(brand, index) in brandList"
                  :key="index"
                  :value="brand.id">
                  {{ brand.name }}
                </option>
              </select>
            </div>
            <!---->
            <div class="col-span-3 mb-3 lg:mb-0">
              <select
                v-model="modelInputValue"
                @change="modelChange"
                class="w-full h-12 p-3 text-black"
              >
                <option value="" selected>選擇車款</option>
                <option
                  v-for="(type, index) in modelList"
                  :key="index"
                  :value="type.id">
                  {{ type.name }}
                </option>
              </select>
            </div>
            <!---->
            <div class="col-span-3 mb-3 lg:mb-0">
              <select
                v-model="yearInputValue"
                class="w-full h-12 p-3 text-black"
              >
                <option disabled>選擇年份</option>
                <option
                  v-for="(year, index) in yearList"
                  :key="index">
                  {{ year }}
                </option>
                <option selected value="">所有年份</option>
              </select>
            </div>
            <!---->
            <div class="col-span-1">
              <button
                @click="search"
                class="w-full h-full text-white font-medium bg-yellow-300 hover:bg-yellow-400 transition-all duration-300 py-2"
              >
                <font-awesome-icon class="text-sm mr-2" :icon="['fas', 'search']" />搜尋
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- -->
    <div class="container mx-auto px-5 py-20">
      <!-- 車框 -->
      <div class="py-10 lg:py-14">
        <h2 class="text-2xl lg:text-3xl font-semibold py-5">多媒體機車框</h2>
        <div class="md:grid md:grid-cols-3 xl:grid-cols-4 gap-8">
          <div
            v-for="(carFrame, index) in carFrameList"
            :key="index"
            class="col-span-1 py-5"
          >
            <NuxtLink :to="'/carFrameDetail/' + carFrame.id">
              <img
                class="mb-3"
                :src="JSON.parse(carFrame.img)[0]"
                :alt="carFrame.name" />
              <hr class="mb-2" />
              <h3 class="text-xl font-semibold">
                <font-awesome-icon
                  class="text-yellow-400 mr-3"
                  :icon="['fas', 'arrow-alt-circle-right']"/>
                  <i>{{ carFrame.brand_name }} {{ carFrame.car_name }} {{ carFrame.name }}</i>
              </h3>
              <p class="text-xl flex items-center">
                <span class="mr-2">{{ carFrame.year_start }} ~ {{ carFrame.year_end }}</span>
                <span class="text-sm font-medium border rounded-sm border-yellow-400 px-1">
                  {{ carFrame.size }}吋
                </span>
              </p>
            </NuxtLink>
          </div>
        </div>
      </div>
      <!-- 多媒體機 -->
      <div class="py-10 lg:py-14">
        <h2 class="text-2xl lg:text-3xl font-semibold py-5">
          安卓車用多媒體機
        </h2>
        <div class="md:grid md:grid-cols-3 xl:grid-cols-4 gap-8">
          <div
            v-for="(carMedia, idx) in carMediaList"
            :key="idx"
            class="col-span-1 py-5"
          >
            <NuxtLink :to="'/multimediaDetail/' + carMedia.id">
              <img
                class="mb-3"
                :src="carMedia.img"
                :alt="carMedia.name" />
              <hr class="mb-2" />
              <h3 class="text-xl font-semibold">
                <font-awesome-icon
                  class="text-yellow-400 mr-3"
                  :icon="['fas', 'arrow-alt-circle-right']" />
                  <i>{{ carMedia.name }}</i>
              </h3>
            </NuxtLink>
          </div>
        </div>
      </div>
      <!-- 盲點偵測 -->
      <div class="py-10 md:py-14 lg:py-20">
        <h2 class="text-2xl lg:text-3xl font-semibold py-5">盲點偵測</h2>
        <div class="md:grid md:grid-cols-3 xl:grid-cols-4 gap-8">
          <div v-for="(carBlindSpot, idx) in carBlindSpotList" :key="idx" class="col-span-1 py-5">
            <NuxtLink :to="'/carBlindSpotDetail/' + carBlindSpot.id">
              <img
                class="mb-3"
                :src="carBlindSpot.img"
                :alt="carBlindSpot.name"
              />
              <hr class="mb-2" />
              <h3 class="text-xl font-semibold">
                <font-awesome-icon
                  class="text-yellow-400 mr-3"
                  :icon="['fas', 'arrow-alt-circle-right']"
                /><i>{{ carBlindSpot.name }}</i>
              </h3>
            </NuxtLink>
          </div>
        </div>
      </div>
      <!-- 車用配件 -->
      <div class="py-10 lg:py-14">
        <h2 class="text-2xl lg:text-3xl font-semibold py-5">車用配件</h2>
        <div class="md:grid md:grid-cols-3 xl:grid-cols-4 gap-8">
          <div v-for="(carFitting, idx) in carFittingList" :key="idx" class="col-span-1 py-5">
            <NuxtLink :to="'/fittingDetail/' + carFitting.id">
              <img
                class="mb-3"
                :src="carFitting.img"
                :alt="carFitting.name"
              />
              <hr class="mb-2" />
              <h3 class="text-xl font-semibold">
                <font-awesome-icon
                  class="text-yellow-400 mr-3"
                  :icon="['fas', 'arrow-alt-circle-right']"
                /><i>{{ carFitting.name }}</i>
              </h3>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
    <!-- pagination -->
    <div v-show="filterData.length >= 20" class="container mx-auto px-5 py-20">
      <div class="flex justify-center">
        <ul class="flex">
          <li
            v-show="currentPage > 1"
            @click="decreasePage"
            class="bg-gray-50 hover:bg-yellow-400 text-2xl text-yellow-400 hover:text-white transition-all duration-300 cursor-pointer border px-5 py-2 mr-4"
          >
            <font-awesome-icon :icon="['fas', 'caret-left']" />
          </li>
          <li>
            <select
              v-model="currentPage"
              @change="changePage()"
              name=""
              id=""
              class="w-20 h-12 p-3 text-black border mr-4"
            >
              <option v-for="(page, idx) in totalPage" :key="idx">
                {{ page }}
              </option>
            </select>
          </li>
          <li
            v-show="currentPage < 5"
            @click="increasePage"
            class="bg-gray-50 hover:bg-yellow-400 text-2xl text-yellow-400 hover:text-white transition-all duration-300 cursor-pointer border px-5 py-2"
          >
            <font-awesome-icon :icon="['fas', 'caret-right']" />
          </li>
        </ul>
      </div>
      <!---->
    </div>
    <!-- end -->
  </section>
</template>

<script>
import carFrame from "~/static/carFrame.js";

export default {
  name: "carFrame",
  data() {
    return {
      carFrame,
      breadcrumbBlands: this.$route.query.brand,
      breadcrumbModel: this.$route.query.model,
      brandList: [],
      car: [],
      types: [],
      modelList: [],
      years: [],
      yearList: [],
      brandInputValue: "",
      modelInputValue: "",
      yearInputValue: "",
      // typeSelect: true,
      // yearSelect: true,
      totalPage: 5,
      currentPage: 1,
      filterData: [],
      fiterCarFrames: [],
      carFrameList: [],
      carMediaList: [],
      carBlindSpotList: [],
      carFittingList: []
    };
  },
  mounted: async function() {
    // 取得下拉選單所有資料
    await this.getListData();
    let lsBrand = this.$route.query.brand,
        lsModel = this.$route.query.model,
        lsYear = this.$route.query.year
    if (lsBrand) {
      this.brandInputValue = lsBrand;
      this.modelInputValue = lsModel;
      this.yearInputValue = lsYear;
    }

    this.brandChange();
    this.modelChange();
    this.search();
    //
    let newPage = Math.ceil(this.carFrame.length / 20);
    this.totalPage = newPage;
  },
  methods: {
    getListData() {
      return new Promise(resolve => {
        this.$axios.get('https://admin.meimai.com.tw/api/car').then((response) => {
          let carBrand = response.data.car_brand,
              car = response.data.car;
          if (carBrand) {
            this.brandList = carBrand;
          }
          if (car) {
            this.car = car;
          }
          resolve();
        })
      });
    },
    increasePage() {
      if (this.currentPage >= this.totalPage) {
        return;
      } else {
        this.currentPage++;
        this.changePage();
      }
    },
    decreasePage() {
      if (this.currentPage <= 1) {
        return;
      } else {
        this.currentPage--;
        this.changePage();
      }
    },
    changePage() {
      this.filterData = this.carFrame.slice(
        (this.currentPage - 1) * 20,
        this.currentPage * 20
      );
      window.scrollTo(0, 0);
    },
    brandChange(isChange) {
      if (isChange) {
        // default setting
        this.modelInputValue = "";
        this.yearInputValue = "";
      }
      this.typeSelect = true;
      this.yearSelect = true;
      //
      const newArray = this.carFrame.filter(
        item => item.brand === this.brandInputValue
      );
      const arr = [];
      newArray.forEach(item => {
        arr.push(...item.model);
      });
      this.types = [...new Set(arr)];
      this.typeSelect = false;

      this.breadcrumbBlands = this.brandInputValue;
      this.breadcrumbModel = "";

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
      this.breadcrumbModel = this.modelInputValue;

      this.yearList = [];
      let tempStart = 0,
          tempEnd = 0;
      if(this.modelInputValue == '') {
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
    search() {
      this.carFrameList = [];
      this.carMediaList = [];
      this.carBlindSpotList = [];
      this.carFittingList = [];

      let params = {
        car_brand_id: this.brandInputValue,
        car_id: !this.modelInputValue ? '' : this.modelInputValue,
        year: !this.yearInputValue ? '' : this.yearInputValue,
      }

      this.$axios.get('https://admin.meimai.com.tw/api/search', {params}).then((response) => {
          let result = response.data.result;
          if (result) {
            if (result.car_frame.length > 0) {
              this.carFrameList = result.car_frame
            }
            if (result.car_media.length > 0) {
              this.carMediaList = result.car_media
            }
            if (result.car_blind_spot.length > 0) {
              this.carBlindSpotList = result.car_blind_spot
            }
            if (result.car_fitting.length > 0) {
              this.carFittingList = result.car_fitting
            }
            this.$router.push({
              path: "/searchPage",
              query: {
                brand: this.brandInputValue,
                model: this.modelInputValue,
                year: this.yearInputValue
              }
            });
          }
      });
    },
    storeLocalStorage() {
      localStorage.setItem("brand", this.brandInputValue);
      localStorage.setItem("model", this.modelInputValue);
      localStorage.setItem("year", this.yearInputValue);
    }
  }
};
</script>

<style scoped>
.banner {
  background-image: url(/assets/img/carFrame/banner.png);
}
</style>
