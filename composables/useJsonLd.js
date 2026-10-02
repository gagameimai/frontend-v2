/**
 * 結構化資料（JSON-LD）
 *
 * 用途：讓 Google 與生成式搜尋引擎正確認出「美邁車用電子＝Clarion 歌樂台灣官方授權總經銷」。
 * 全部透過 useHead 以 <script type="application/ld+json"> 輸出，SSR 就會帶在 HTML 裡。
 *
 * 注意：FAQPage 的問答內容必須是頁面上「看得到」的文字，
 *      不可以只寫在結構化資料裡（Google 規範，違反可能被判為濫用）。
 */
import { useHead } from '#imports'
import { SITE_INFO } from '~/composables/useSiteInfo'
import { useSeoSettings } from '~/composables/useSeoSettings'

// obj 可以是物件或「回傳物件的函式」（回傳 null＝這段不輸出）。用函式的話，後台設定載入後會自動更新。
function ld(id, obj) {
  useHead(() => {
    const data = typeof obj === 'function' ? obj() : obj
    return {
      script: data
        ? [
            {
              key: `ld-${id}`,
              type: 'application/ld+json',
              // 注意：unhead v2 的 SSR 是讀 textContent || innerHTML，
              // 寫成 children 不會被輸出（HTML 裡會完全看不到這段），務必用 innerHTML。
              innerHTML: JSON.stringify(data)
            }
          ]
        : []
    }
  })
}

/** Organization：公司實體資料。首頁與關於我們頁都要有。 */
export function useOrganizationJsonLd() {
  const { info, seo, flag } = useSeoSettings()
  ld('organization', () => {
    if (!flag('org')) return null
    const o = seo.value
    const sameAs = [info.value.facebook, info.value.instagram, info.value.youtube].filter(Boolean)
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: o.company_zh || SITE_INFO.name,
      alternateName: o.company_en ? [o.company_en, ...SITE_INFO.alternateName.filter((n) => n !== o.company_en)] : SITE_INFO.alternateName,
      url: SITE_INFO.url,
      logo: SITE_INFO.url + SITE_INFO.logoPath,
      email: info.value.email || SITE_INFO.email,
      telephone: o.phone_intl || SITE_INFO.telephone,
      address: {
        '@type': 'PostalAddress',
        streetAddress: o.addr_street || SITE_INFO.address.streetAddress,
        addressLocality: o.addr_locality || SITE_INFO.address.addressLocality,
        addressRegion: o.addr_region || SITE_INFO.address.addressRegion,
        addressCountry: SITE_INFO.address.addressCountry
      },
      sameAs: sameAs.length ? sameAs : SITE_INFO.sameAs
    }
  })
}

/** WebSite：網站本身。只放首頁。 */
export function useWebSiteJsonLd() {
  ld('website', {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Clarion 歌樂 × MM 美邁｜台灣官方授權總經銷',
    url: SITE_INFO.url,
    inLanguage: 'zh-TW',
    publisher: {
      '@type': 'Organization',
      name: SITE_INFO.name
    }
  })
}

/**
 * FAQPage
 * @param {Array<{q:string,a:string}>} items 必須與頁面上實際顯示的問答一致
 */
export function useFaqJsonLd(items) {
  ld('faq', () => {
    const list = (typeof items === 'function' ? items() : items) || []
    if (!list.length) return null
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: list.map((it) => ({
        '@type': 'Question',
        name: it.q,
        acceptedAnswer: { '@type': 'Answer', text: it.a }
      }))
    }
  })
}

/**
 * Product：商品詳情頁用。
 * 沒有價格時不輸出 offers —— Google 的 Offer 需要 price，
 * 給了幣別卻沒有金額反而會被判定為無效資料。
 *
 * @param {Function} getter 回傳 { name, brand, description, image, sku, price }
 */
export function useProductJsonLd(getter) {
  const info = typeof getter === 'function' ? getter() : getter
  if (!info || !info.name) return

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: info.name,
    brand: { '@type': 'Brand', name: info.brand || 'Clarion' }
  }
  if (info.description) data.description = String(info.description).replace(/<[^>]*>/g, '').slice(0, 300)
  if (info.image) data.image = info.image
  if (info.sku) data.sku = String(info.sku)

  const price = Number(String(info.price ?? '').replace(/[^\d.]/g, ''))
  if (price > 0) {
    data.offers = {
      '@type': 'Offer',
      priceCurrency: 'TWD',
      price: String(price),
      availability: 'https://schema.org/InStock',
      url: info.url || undefined,
      seller: { '@type': 'Organization', name: SITE_INFO.name }
    }
  }
  const { flag } = useSeoSettings()
  ld('product', () => (flag('product') ? data : null))
}
