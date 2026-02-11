# YouTube Ad Skipper (Chrome Extension)

這是第一版（Part 1）Chrome 擴充功能，目標是**在 YouTube 播放時自動略過可略過的廣告**，並在不可略過廣告時做最小干擾處理（靜音 + 提高播放速度）。

## 功能

- 自動偵測 YouTube 是否處於廣告播放狀態
- 自動點擊「略過廣告」按鈕（若按鈕已出現）
- 廣告期間自動靜音
- 廣告期間將播放速度提升到 `16x`
- 廣告結束後自動恢復：
  - 音量狀態（如果是擴充功能改成靜音，會自動解除）
  - 播放速度恢復為 `1x`

## 安裝方式（開發者模式）

1. 打開 Chrome，前往 `chrome://extensions`
2. 開啟右上角的「開發人員模式」
3. 點擊「載入未封裝項目」
4. 選擇此專案資料夾

## 專案結構

- `manifest.json`: Chrome 擴充功能設定（Manifest V3）
- `content.js`: 注入 YouTube 頁面的廣告偵測與略過邏輯

## 注意事項

- YouTube 會不定期調整 DOM 結構與 class 名稱，若失效需要更新 selector。
- 本專案僅供技術學習用途，請自行評估使用風險與平台條款。
