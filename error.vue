<template>
  <div>
    <Header />

    <main
      class="min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-16 text-center"
    >
      <!-- 錯誤代碼 -->
      <p
        class="text-[80px] sm:text-[120px] leading-none font-black text-[#023059] select-none"
      >
        {{ error.statusCode }}
      </p>

      <!-- 橘色分隔線 -->
      <span class="block w-16 h-1 bg-[#F28729] rounded-full my-6"></span>

      <!-- 標題 -->
      <h1 class="text-xl sm:text-2xl font-bold text-[#023059] mb-3">
        {{ title }}
      </h1>

      <!-- 說明 -->
      <p class="text-gray-500 max-w-md mb-10 leading-relaxed">
        {{ description }}
      </p>

      <!-- 按鈕 -->
      <div class="flex flex-col sm:flex-row items-center gap-4">
        <button
          class="px-8 py-3 rounded-full bg-[#F28729] text-white font-medium hover:opacity-90 transition-all"
          @click="handleHome"
        >
          回到首頁
        </button>
        <button
          class="px-8 py-3 rounded-full border border-[#023059] text-[#023059] font-medium hover:bg-[#023059] hover:text-white transition-all"
          @click="handleReload"
        >
          重新整理
        </button>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
const props = defineProps({
  error: {
    type: Object,
    default: () => ({ statusCode: 500 })
  }
})

const is404 = computed(() => props.error?.statusCode === 404)

const title = computed(() =>
  is404.value ? '找不到這個頁面' : '網頁發生了一點問題'
)

const description = computed(() =>
  is404.value
    ? '您所尋找的頁面可能已被移除、更名，或暫時無法使用。'
    : '系統目前無法完成您的請求，請稍後再試，或返回首頁繼續瀏覽。'
)

// 清除錯誤狀態並導回首頁
const handleHome = () => clearError({ redirect: '/' })

// 重新整理目前頁面
const handleReload = () => clearError({ redirect: useRoute().fullPath })

useHead({
  title: computed(() =>
    `${props.error?.statusCode} | MEIMAI MM 美邁車用電子有限公司`
  )
})
</script>
