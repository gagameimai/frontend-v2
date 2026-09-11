// 給「同一個清單路徑、但商品本身分屬不同品牌」的詳情頁使用（目前只有 multimediaDetail：
// 同一支 /multimedia/{id} API，type 0/1=MM、2=Clarion，網址本身看不出品牌）。
// 頁面抓到商品資料後把品牌塞進這個共用狀態，Header.vue 讀出來決定要顯示哪個 logo。
// 用 Nuxt useState 是因為它是 SSR-safe 的全域共享狀態（同一個 key 在整個 app 只有一份）。
export const useDetailBrandOverride = () => useState('detailBrandOverride', () => null)
