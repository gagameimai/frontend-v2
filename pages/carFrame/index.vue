<template>
  <section>
    <div class="img_box banner">
      <div class="text-center pt-28 pb-20 md:py-14 lg:pt-44">
        <p class="hidden lg:block text-white text-2xl font-semibold mb-10">
          <span class="hover:text-yellow-400 transition-all duration-300">
            <NuxtLink to="/">首頁</NuxtLink>
          </span>
          <span> / </span>
          <span>安卓車框</span>
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
                <option selected value="">選擇汽車品牌</option>
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
                <option selected value="">選擇車款</option>
                <option
                  v-for="(model, index) in modelList"
                  :key="index"
                  :value="model.id">
                  {{ model.name }}
                </option>
              </select>
            </div>
            <!---->
            <div class="col-span-3 mb-3 lg:mb-0">
              <select
                v-model="yearInputValue"
                class="w-full h-12 p-3 text-black"
              >
                <option selected value="">選擇年份</option>
                <option
                  v-for="(year, index) in yearList"
                  :key="index">
                  {{ year }}
                </option>
              </select>
            </div>
            <!---->
            <div class="col-span-1">
              <button
                @click="getCarFrame"
                class="w-full h-full text-white font-medium bg-yellow-300 hover:bg-yellow-400 transition-all duration-300 py-2">
                <font-awesome-icon class="text-sm mr-2" :icon="['fas', 'search']" />搜尋
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- -->
    <div class="container mx-auto px-5 py-10 md:py-20">
      <div class="md:grid md:grid-cols-3 xl:grid-cols-4 gap-8">
        <div
          v-for="(carFrame, index) in carFrameList"
          :key="index"
          class="col-span-1 py-5">
          <NuxtLink
            :to="'/carFrameDetail/' + carFrame.id">
            <img
              class="mb-3"
              :src="carFrame.img"
              :alt="carFrame.name" />
            <hr class="mb-2" />
            <h3 class="text-xl font-semibold">
              <font-awesome-icon
                class="text-yellow-400 mr-3"
                :icon="['fas', 'arrow-alt-circle-right']" />
                <i>{{ carFrame.brand_name }} {{ carFrame.car_name }} {{ carFrame.name }}</i>
            </h3>
            <p class="text-xl flex items-center">
              <span class="mr-2">{{ carFrame.year_start }}~{{ carFrame.year_end }}</span>
              <span
                class="text-md font-medium border rounded-sm border-yellow-400 px-1"
                >{{ carFrame.size }}吋</span
              >
            </p>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script>

export default {
  name: "carFrame",
  data() {
    return {
      carFrameList: [],
      brandList: [],
      car: [],
      modelList: [],
      yearList: [],
      brandInputValue: "",
      modelInputValue: "",
      yearInputValue: ""
    };
  },
  mounted() {
    // 取得下拉選單所有資料
    this.getListData();
  },
  methods: {
    getListData() {
      this.$axios.get('https://admin.meimai.com.tw/api/car').then(async(response) => {
        let carBrand = response.data.car_brand,
            car = response.data.car;
        if (carBrand) {
          this.brandList = carBrand;
          let lsBrand = this.$route.query.brand,
              lsModel = this.$route.query.model,
              lsYear = this.$route.query.year
          if (lsBrand) {
            this.brandInputValue = lsBrand;
            this.modelInputValue = lsModel;
            this.yearInputValue = lsYear;
          }
          else {
            // 指定載入TOYOTA車框
            this.brandList.forEach(el => {
              if (el.name == 'TOYOTA') {
                this.brandInputValue = el.id;
                this.modelInputValue = '';
                this.yearInputValue = '';
                return;
              }
            });
          }
          await this.getCarFrame();
        }
        if (car) {
          this.car = car;
        }
        this.brandChange();
        this.modelChange();
      })
    },
    getCarFrame() {
      return new Promise((resolve, reject) => {
        let params = {
          car_brand_id: this.brandInputValue,
          car_id: this.modelInputValue == 'all' ? '' : this.modelInputValue,
          year: this.yearInputValue == 'all' ? '' : this.yearInputValue
        }

        this.$axios.get('https://admin.meimai.com.tw/api/carframe', {params}).then((response) => {
          let result = response.data.result;
          if (result) {


            this.carFrameList = result;
            this.$router.push({ path: '/carFrame', query: { brand: this.brandInputValue, model: this.modelInputValue, year: this.yearInputValue }});
            // store LSBrand、LSModel、LSYear to localStorage 以前使用
            // localStorage.setItem("LSBrand", this.brandInputValue);
            // localStorage.setItem("LSModel", this.modelInputValue);
            // localStorage.setItem("LSYear", this.yearInputValue);
            resolve();
          }
        })
      })
    },
    brandChange(isChange) {
      this.modelList = [];
      this.car.forEach(el => {
        if(this.brandInputValue == el.car_brand_id) {
          this.modelList.push(el);
        }
      });
      if (isChange) {
        this.modelInputValue = '';
        this.yearInputValue = '';
      }
    },
    modelChange() {
      this.yearList = [];
      let tempStart = 0,
          tempEnd = 0;
      if(this.modelInputValue == '' || this.modelInputValue == 'all') {
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
    }
  }
};
</script>

<style scoped>
.banner {
  background-image: url(/assets/img/carFrame/banner.png);
}
</style>
