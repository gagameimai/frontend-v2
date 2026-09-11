/**
 * 全站唯一的公司資料來源（NAP：名稱／地址／電話）
 *
 * 為什麼要寫死在這裡：SEO 規範要求 NAP 在全站逐字一致，
 * 結構化資料（JSON-LD）也需要在 SSR 當下就拿得到值，不能等前端 API 回來。
 * 頁尾顯示用的值仍然走後台 /api/website 設定，
 * 若後台資料有異動，請一併更新這支檔案，兩邊必須一模一樣。
 */
export const SITE_INFO = {
  // 公司全名（結構化資料與對外文件一律用這個寫法）
  name: '美邁車用電子有限公司',
  nameEn: 'MEIMAI Vehicle Electronics Co., Ltd.',
  alternateName: ['MEIMAI Vehicle Electronics Co., Ltd.', 'MEIMAI Vehicle Electronics', 'MM 美邁', '美邁車用電子'],

  url: 'https://clarion.meimai.com.tw',
  logoPath: '/logo-organization.png',

  email: 'mm@meimai.com.tw',
  // 結構化資料用國際格式；頁面顯示用本地格式
  telephone: '+886-3-2170098',
  telephoneLocal: '03-2170098',

  address: {
    streetAddress: '國信街35號',
    addressLocality: '桃園區',
    addressRegion: '桃園市',
    addressCountry: 'TW'
  },
  addressFull: '桃園市桃園區國信街35號',

  sameAs: [
    'https://www.facebook.com/meimaiofficial/',
    'https://www.instagram.com/meimai_official/',
    'https://www.youtube.com/@meimai_official'
  ],

  // 全站核心定位句
  positioning: '美邁車用電子｜Clarion 歌樂 台灣官方授權總經銷（2026 年起）',
  positioningSub: '原廠品質・在地安裝・專業售後'
}
