(() => {
  const AD_OVERLAY_SELECTORS = [
    '.ytp-ad-player-overlay',
    '.ytp-ad-module',
    '.ad-showing'
  ];

  const SKIP_BUTTON_SELECTORS = [
    '.ytp-ad-skip-button',
    '.ytp-ad-skip-button-modern',
    '.videoAdUiSkipButton',
    'button.ytp-skip-ad-button'
  ];

  let wasMutedByExtension = false;

  const getPlayer = () => document.querySelector('video.html5-main-video');

  const isAdShowing = () => {
    if (document.querySelector('.ad-showing')) return true;

    return AD_OVERLAY_SELECTORS.some((selector) => document.querySelector(selector));
  };

  const clickSkipButton = () => {
    for (const selector of SKIP_BUTTON_SELECTORS) {
      const btn = document.querySelector(selector);
      if (btn && !btn.disabled && btn.offsetParent !== null) {
        btn.click();
        return true;
      }
    }
    return false;
  };

  const handleAdPlayback = () => {
    const player = getPlayer();
    if (!player) return;

    const hasAd = isAdShowing();

    if (hasAd) {
      clickSkipButton();

      if (!player.muted) {
        player.muted = true;
        wasMutedByExtension = true;
      }

      // 將廣告加速到最高，縮短等待時間。
      if (player.playbackRate < 16) {
        player.playbackRate = 16;
      }
      return;
    }

    if (wasMutedByExtension) {
      player.muted = false;
      wasMutedByExtension = false;
    }

    if (player.playbackRate !== 1) {
      player.playbackRate = 1;
    }
  };

  const observer = new MutationObserver(() => handleAdPlayback());

  const start = () => {
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });

    setInterval(handleAdPlayback, 500);
    handleAdPlayback();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
