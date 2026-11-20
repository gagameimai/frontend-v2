<template>
  <!-- 隱私權政策（2026-11-14 新增）：純文字靜態頁，內容為老闆核定原文，請勿改寫。不接後台、不需登入。 -->
  <div class="pv-page">
    <div class="hero">
      <div class="glow"></div>
      <div class="wrap in">
        <div class="ey">PRIVACY POLICY</div>
        <h1>隱私權政策</h1>
        <p>最後更新日期：2026 年 11 月 14 日</p>
      </div>
    </div>

    <section>
      <div class="wrap-sm rich">
        <p>美邁車用電子有限公司（以下稱「本公司」）重視您的隱私。本政策說明本公司透過官方網站 clarion.meimai.com.tw，以及本公司自行使用的影片上傳工具，如何蒐集、使用及保護資料。</p>

        <h2>一、適用範圍</h2>
        <p>本政策適用於本公司官方網站，以及本公司官方社群帳號（Facebook 粉絲專頁、Instagram、YouTube 頻道「美邁車用電子 MEIMAI VEHICLE ELECTRONICS」）的內容發布作業。</p>

        <h2>二、蒐集的資料</h2>
        <ol>
          <li>您主動提供的資料：您透過網站、電話、LINE 或電子郵件與我們聯絡時提供的姓名、電話、電子郵件、車型與詢問內容。</li>
          <li>瀏覽紀錄：網站可能透過 Cookie 或分析工具，記錄瀏覽頁面、裝置與瀏覽器類型等不具個人識別性的統計資料。</li>
        </ol>

        <h2>三、資料使用目的</h2>
        <ol>
          <li>回覆您的詢問、提供產品資訊、安裝與售後服務。</li>
          <li>改善網站內容與使用體驗。</li>
          <li>依法令要求辦理。</li>
        </ol>
        <p>本公司不會將您的個人資料出售、出租或提供給無關的第三人。</p>

        <h2>四、Google／YouTube 資料使用說明</h2>
        <p>本公司的「美邁影片自動上傳」工具僅供本公司內部使用，用途是將本公司自製的產品影片上傳至本公司自己的 YouTube 頻道，並管理影片標題、說明、字幕與公開狀態。</p>
        <ol>
          <li>本工具只存取本公司自有的 YouTube 頻道，不存取任何其他使用者的 Google 帳戶資料。</li>
          <li>授權憑證僅保存在本公司內部電腦，不提供給第三方。</li>
          <li>本工具對 Google API 資料的使用，遵守 Google API 服務使用者資料政策（Google API Services User Data Policy），包括有限使用（Limited Use）規範。</li>
          <li>本公司可隨時於 Google 帳戶的「第三方存取權」頁面撤銷授權。</li>
        </ol>

        <h2>五、資料保存與安全</h2>
        <p>本公司以合理的技術與管理措施保護資料，避免遭未經授權的存取、變更或外洩。資料只在達成上述目的所需期間內保存。</p>

        <h2>六、您的權利</h2>
        <p>依個人資料保護法，您可以要求查詢、閱覽、補充、更正、停止使用或刪除您的個人資料。請以下列方式與我們聯絡。</p>

        <h2>七、聯絡我們</h2>
        <p>美邁車用電子有限公司</p>
        <p>電子郵件：<a href="mailto:mm@meimai.com.tw">mm@meimai.com.tw</a></p>

        <h2>八、政策修訂</h2>
        <p>本公司得視需要修訂本政策，修訂後內容將公布於本頁。</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { usePageSeo } from '~/composables/usePageSeo'

usePageSeo({
  title: () => '隱私權政策',
  description: () => '美邁車用電子有限公司隱私權政策：說明官方網站 clarion.meimai.com.tw 與本公司影片上傳工具如何蒐集、使用及保護資料。'
})
</script>

<style scoped>
/* 樣式沿用「內容來源與更正聲明」頁（pages/contentPolicy）的 hero 與內文排版 */
.pv-page {
  --ink: #0d1b2e;
  --text: #1b2431;
  --muted: #5b6675;
  --navy: var(--site-accent, #007abe);
  font-family: 'Noto Sans TC', system-ui, 'Microsoft JhengHei', sans-serif;
  background: #fff;
  color: var(--text);
  line-height: 1.75;
  letter-spacing: 0.02em;
}
.pv-page a { color: var(--navy); text-decoration: none; }
.pv-page a:hover { text-decoration: underline; }
.wrap { max-width: 1080px; margin: 0 auto; padding: 0 26px; }
.wrap-sm { max-width: 900px; margin: 0 auto; padding: 0 26px; }
.pv-page section { padding: 56px 0; }

/* overflow 要兩軸一起鎖（只寫 overflow-x 手機版會多一條內部捲軸）；高度至少 4:1、至少 260px，文字多會自己長高 */
.hero { position: relative; width: 100%; overflow: hidden; background: linear-gradient(115deg, #f3f6fa, #e7eef6 55%, #dbe6f1); min-height: max(260px, 25vw); display: flex; align-items: center; }
.hero .glow { position: absolute; right: -80px; top: -60px; width: 420px; height: 420px; border-radius: 50%; background: radial-gradient(circle, rgba(61, 123, 255, 0.16), transparent 62%); z-index: 1; }
.hero .in { position: relative; z-index: 2; width: 100%; min-width: 0; padding: 24px 8px 22px; }
.hero .ey { font-size: 12px; letter-spacing: 4px; color: var(--navy); font-weight: 700; }
.hero h1 { font-size: clamp(28px, 5vw, 44px); font-weight: 900; color: var(--ink); line-height: 1.15; margin: 10px 0; max-width: 640px; }
.hero p { width: 100%; color: #41506b; max-width: 560px; font-weight: 300; margin-top: 6px; }

.rich h2 { font-size: clamp(20px, 2.6vw, 26px); font-weight: 900; color: var(--ink); margin: 30px 0 12px; }
.rich p { color: var(--muted); font-weight: 300; margin: 8px 0; }
.rich ol { padding-left: 22px; margin: 8px 0; }
.rich li { color: var(--muted); margin: 5px 0; line-height: 1.8; overflow-wrap: anywhere; }
</style>
