// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  ssr: true,
  app:{
    head: {
      title: "美邁車用電子｜Clarion 歌樂 台灣官方授權總經銷",
      htmlAttrs: {
        lang: "zh-TW"
      },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: 'keywords', content: 'Clarion, 歌樂, Clarion 台灣, 歌樂台灣, Clarion 總經銷, 車用音響, 車用喇叭, 擴大機, DSP, 重低音, 車型專用機, 車用多媒體機, 安卓機, 套框機, 行車紀錄器, 倒車顯影, 盲點偵測, 美邁車用電子'},
        { hid: 'description', name: 'description', content: '美邁車用電子為日本 Clarion（歌樂）台灣官方授權總經銷（2026 年起），提供車型專用主機、車用音響、喇叭、擴大機、DSP 與行車輔助系統，並提供全台經銷據點安裝與售後服務。'},
        { 'http-equiv': 'X-UA-Compatible', content:'ie=edge' },
        { property: 'og:title', content: '美邁車用電子｜Clarion 歌樂 台灣官方授權總經銷' },
        { property: 'og:description', content: '日本 Clarion（歌樂）台灣官方授權總經銷（2026 年起）。車型專用主機、車用音響與行車輔助系統，全台經銷據點安裝與售後服務。' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: '美邁車用電子有限公司' },
        { property: 'og:locale', content: 'zh_TW' },
        { property: 'og:image', content: 'https://clarion.meimai.com.tw/og-share.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        // 這裡只是還沒 hydrate 前的初始值；實際 favicon 由 app.vue 依目前頁面（Clarion／MM／共用）
        // 透過 composables/useBrandZone.js 統一、即時切換，見 app.vue 的 useHead(faviconLinks)。
        { key: 'fav-ico', rel: "icon", type: "image/x-icon", sizes: "any", href: "/favicon.ico" },
        { key: 'fav-apple', rel: "apple-touch-icon", type: "image/png", sizes: "180x180", href: "/favicon_180.png" },
      ],
      script:[]
    }
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
        '@/assets/css/global.css',
        "@/assets/css/main.scss",
        '@fortawesome/fontawesome-svg-core/styles.css'
      ],

  plugins: [],

  imports: {
    dirs: ['composables']
  },

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/tailwindcss',
    'nuxt-aos',
    'nuxt-gtag',
    'vue3-carousel-nuxt',
    '@nuxtjs/i18n',
  ],

  // 多國語系設定（第一階段：選單/按鈕文字，不改網址結構）
  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'zh-tw',
    //lazy: true,
    restructureDir: false, // 讓語系檔沿用專案根目錄的 locales/ 資料夾（v9 預設會改抓 i18n/locales/）
    langDir: 'locales/',
    locales: [
      { code: 'zh-tw', name: '繁體中文', file: 'zh-tw.js' },
      { code: 'en', name: 'English', file: 'en.js' },
    ],
  },

  runtimeConfig: {
    public: {
      // API base URL。可用環境變數 NUXT_PUBLIC_API_BASE 覆蓋（本機/測試/正式切換）
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://admin.meimai.com.tw/api',
      // 前台網站網址（sitemap / robots 用），可用 NUXT_PUBLIC_SITE_URL 覆蓋
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://clarion.meimai.com.tw'
    }
  },

  gtag: {
    // 兩組 GA4 一起送：G-6Q9W9ZX3FC（現行）＋ G-1QLZNF29EP（原手動掛載、網址壞掉未生效）
    tags: [
      { id: 'G-6Q9W9ZX3FC' },
      { id: 'G-1QLZNF29EP' }
    ]
  },
  devServer: {
    host: '0.0.0.0', // Exposes to the local network
    port: 3000,      // Optional: specify a port
  },
})