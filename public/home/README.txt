首頁滿版情境圖放這裡
====================

程式會去讀以下六個檔名，換圖只要用同樣的檔名覆蓋，不用改任何程式碼：

  桌機 2560×1440                手機直式 1080×1920           用在哪一段
  section-clarion.webp          section-clarion-m.webp       主打段（Clarion）文字在左，主體放右
  section-mm.webp               section-mm-m.webp            MM 美邁段　　　文字在右，主體放左
  section-cta.webp              section-cta-m.webp           尾端 CTA 段　　文字置中，主體放中間或留白

螢幕寬 640px 以下自動改吃 -m 那張（純 CSS media query，SSR 安全）。
-m 那張不存在時圖層載不到，會直接顯示底下的深色底，版面不會壞，
所以可以先上線再一張一張補。

目前狀態（2026-09-11）
---------------------
  section-clarion   ✔ 實圖：Clarion 喇叭單體特寫（業主提供）— B 版：拉近出血、對比高、陰影帶 Azzurro
  section-cta       ✔ 實圖：濱海公路黃昏（業主提供）— B 版：往下裁多留路面，下半漸暗
  section-mm        ✘ 還是暫代圖（MM 字標＋深色底），等「安裝現場技師工作中」的照片，
                      拿到後同檔名覆蓋即可（桌機＋手機兩張）
後製流程：cover 裁切 → 亮度 0.88～0.92 → 暗角壓向 #0D1016 → 手機版主體放上半部、
下方 smoothstep 漸層接到 #0D1016 → WebP q88（超過 300KB 才降）。

規格
----
・桌機 2560×1440（16:9）、手機 1080×1920（直式）
・WebP，每張壓到 300KB 以內（目前 25～41KB）
・選圖原則：挑「有一半是暗部或留白」的照片。
       文字要壓在圖上，整張都是重點的照片會讓文字看不清楚。
       程式已經加了漸層遮罩，但選圖時先注意會漂亮很多。
・構圖：主打段文字在左 → 主體放右；MM 段文字在右 → 主體放左；
       CTA 段文字置中 → 主體放中間或留白。手機版主體放上半部。

（舊的 section-*.jpg 已不再引用，留著沒關係，也可以刪。）

Hero 輪播圖（首頁 Banner）
-------------------------
Hero 不吃這個資料夾。首頁 Banner 由**後台「Banner 管理」**維護：
  backend：banner 資料表 / GET /api/banner
  一筆 Banner 有兩張圖 —— img（電腦版）、img_mobile（手機版）

後台還沒有啟用中的 Banner 時，會退回 public/ 底下的預設圖：

  桌機：/banner-clarion-dark.jpg、/banner-clarion-light.jpg   1920×1080（16:9）
  手機：/banner-clarion-dark-m.jpg、/banner-clarion-light-m.jpg  1080×2160（直式）

實作是 <picture> + <source media="(max-width:640px)">，純 CSS 判斷，
SSR 不會有水合不一致的問題。

為什麼電腦版與手機版一定要分開兩張：
  首頁是滿版，Banner 用 object-fit:cover 撐滿整個畫面高度。
  16:9 橫圖在手機（390×844）會被左右各裁掉約 35%，
  圖上的字（Clarion／標語）會直接被切掉。縮小也沒用，是裁切不是縮放。

做圖注意：
  ・重要的字與主體集中在畫面中間 60% 的範圍
  ・底部約 190px 會蓋暗漸層（SCROLL 指示與輪播圓點），不要把字放最下面
  ・正下方還會壓上「車型查詢」浮動卡片，也要留白

（舊的聯名版 hero-light/dark.png 與 -m.jpg 還留在 public/，目前沒有引用，
  是留著備用；Banner 已依業主指示改成以 Clarion 歌樂為主，不用聯名鎖定。）
