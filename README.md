# YouTube Ad Skipper (Chrome Extension)

這是第一版（Part 1）瀏覽器擴充功能，目標是**在 YouTube 播放時自動略過可略過的廣告**，並在不可略過廣告時做最小干擾處理（靜音 + 提高播放速度）。

## 功能

- 自動偵測 YouTube 是否處於廣告播放狀態
- 自動點擊「略過廣告」按鈕（若按鈕已出現）
- 廣告期間自動靜音
- 廣告期間將播放速度提升到 `16x`
- 廣告結束後自動恢復：
  - 音量狀態（如果是擴充功能改成靜音，會自動解除）
  - 播放速度恢復為 `1x`

## 安裝方式（Chrome）

1. 打開 Chrome，前往 `chrome://extensions`
2. 開啟右上角的「開發人員模式」
3. 點擊「載入未封裝項目」
4. 選擇此專案資料夾

## 安裝方式（Edge）

1. 打開 Edge，前往 `edge://extensions`
2. 開啟左下角「開發人員模式（Developer mode）」
3. 點擊「載入解壓縮的擴充功能（Load unpacked）」
4. 選擇此專案資料夾

## 在 Chrome / Edge 測試流程

1. 先確認擴充功能已載入，且狀態為啟用。
2. 打開 YouTube 任一影片（建議找「有廣告機率高」的熱門影片）。
3. 觀察下列行為是否出現：
   - 廣告可略過時，按鈕出現後會自動點擊。
   - 廣告不可略過時，播放器會暫時靜音。
   - 廣告期間播放速度會提高，結束後恢復 `1x`。
4. 多切換幾部影片（含 Shorts 與一般影片），確認行為穩定。

## 偵錯方式（建議）

1. 在 `chrome://extensions` 或 `edge://extensions` 中，找到此擴充功能。
2. 點開「Inspect views / 檢查視圖（content script）」或直接在 YouTube 頁面按 `F12`。
3. 在 Console 檢查是否有錯誤訊息（例如 selector 失效）。
4. 修改 `content.js` 後，回到擴充功能頁面按「重新載入（Reload）」再重測。

## 專案結構

- `manifest.json`: 擴充功能設定（Manifest V3）
- `content.js`: 注入 YouTube 頁面的廣告偵測與略過邏輯

## 注意事項

- YouTube 會不定期調整 DOM 結構與 class 名稱，若失效需要更新 selector。
- 某些廣告型態（例如伺服器端插入廣告）不一定能被完整略過。
- 本專案僅供技術學習用途，請自行評估使用風險與平台條款。
