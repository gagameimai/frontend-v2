// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  ssr: true,
  app:{
    head: {
      title: "MEIMAI MM 美邁車用電子有限公司",
      htmlAttrs: {
        lang: "zh-TW"
      },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: 'keywords', content: '安卓機, 安卓機推薦, 安卓機挑選, 安卓機ptt, 安卓機價格, 安卓機台灣, 安卓機使用說明, 車用多媒體機, 套框機, 安卓框, 行車紀錄器, 行車紀錄器雙錄, 倒車鏡頭, 倒車顯影, 盲點, 盲點偵測, 盲點鏡片, 盲點燈號, 盲點聲音, 車用電子產品'},
        { hid: '美邁車用電子有限公司', name: '美邁車用電子有限公司', content: '美邁車用電子有限公司'},
        { 'http-equiv': 'X-UA-Compatible', content:'ie=edge' },
        { property: 'og:description', content: '美邁車用電子有限公司' },
        { property: 'og:site_name', content: '美邁車用電子有限公司' },
        { property: 'og:locale', content: 'zh_TW' },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", sizes: "any",href: "/favicon.ico" },
        { rel: "icon", type: "image/png", sizes: "192x192", href: "/favicon_192.png" },
        { rel: "apple-touch-icon", type: "image/png", sizes: "152x152", href: "/favicon_152.png" }, // ipad
        { rel: "apple-touch-icon", type: "image/png", sizes: "180x180", href: "/favicon_180.png" }, // iphone retina
        { rel: 'stylesheet', href: 'https://static.fontawesome.com/css/fontawesome-app.css' },
      ],
      script:[
      // {
      //   crossorigin: "anonymous",
      //   src: "https://connect.facebook.net/zh_TW/sdk.js#xfbml=1&version=v13.0&appId=541580076291513&autoLogAppEvents=1",
      //   nonce: "2PC0Scii",
      //   async: "true",
      //   defer: "true"
      // },
      {
        src: "https://www.googletagmanager.com/gtag/js?id=G-1QLZNF29EP%22",
        async: "true",
      }]
    }
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
        '@/assets/css/global.css',
        "@/assets/css/main.scss",
        '@fortawesome/fontawesome-svg-core/styles.css'
      ],

  plugins: [],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/tailwindcss',
    'nuxt-aos',
    'nuxt-gtag',
    'vue3-carousel-nuxt',
  ],

  runtimeConfig: {
    public: {
      // API base URL。可用環境變數 NUXT_PUBLIC_API_BASE 覆蓋（本機/測試/正式切換）
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://admin.meimai.com.tw/api',
      // 前台網站網址（sitemap / robots 用），可用 NUXT_PUBLIC_SITE_URL 覆蓋
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://www.meimai.com.tw'
    }
  },

  gtag: {
    id: 'G-6Q9W9ZX3FC'
  },
  devServer: {
    host: '0.0.0.0', // Exposes to the local network
    port: 3000,      // Optional: specify a port
  },
})