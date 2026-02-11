(() => {
  const SKIP_BUTTON_SELECTORS = [
    '.ytp-ad-skip-button',
    '.ytp-ad-skip-button-modern',
    '.videoAdUiSkipButton',
    'button.ytp-skip-ad-button',
    '.ytp-ad-skip-button-slot button'
  ];

  const AD_INDICATOR_SELECTORS = [
    '.ytp-ad-text',
    '.ytp-ad-player-overlay',
    '.ytp-ad-preview-container',
    '.ad-interrupting'
  ];

  const state = {
    mutedByExtension: false,
    rateChangedByExtension: false,
    previousPlaybackRate: 1,
    intervalId: null,
    observer: null
  };

  const getVideo = () => document.querySelector('video.html5-main-video');
  const getMoviePlayer = () => document.getElementById('movie_player');

  const isVisible = (el) => !!el && el.getClientRects().length > 0;

  const isAdShowing = () => {
    const moviePlayer = getMoviePlayer();
    if (moviePlayer && moviePlayer.classList.contains('ad-showing')) {
      return true;
    }

    return AD_INDICATOR_SELECTORS.some((selector) => isVisible(document.querySelector(selector)));
  };

  const findSkipButton = () => {
    for (const selector of SKIP_BUTTON_SELECTORS) {
      const btn = document.querySelector(selector);
      if (btn && !btn.disabled && isVisible(btn)) {
        return btn;
      }
    }

    const byAria = Array.from(document.querySelectorAll('button')).find((btn) => {
      const label = (btn.getAttribute('aria-label') || '').toLowerCase();
      return (
        !btn.disabled &&
        isVisible(btn) &&
        (label.includes('skip') || label.includes('略過') || label.includes('跳過'))
      );
    });

    return byAria || null;
  };

  const clickSkipButton = () => {
    const btn = findSkipButton();
    if (!btn) return false;

    btn.click();
    return true;
  };

  const handleAdState = () => {
    const video = getVideo();
    if (!video) return;

    const adShowing = isAdShowing();

    if (adShowing) {
      clickSkipButton();

      if (!state.mutedByExtension && !video.muted) {
        video.muted = true;
        state.mutedByExtension = true;
      }

      if (!state.rateChangedByExtension) {
        state.previousPlaybackRate = video.playbackRate;
        state.rateChangedByExtension = true;
      }

      if (video.playbackRate < 16) {
        video.playbackRate = 16;
      }

      return;
    }

    if (state.mutedByExtension) {
      video.muted = false;
      state.mutedByExtension = false;
    }

    if (state.rateChangedByExtension) {
      video.playbackRate = state.previousPlaybackRate || 1;
      state.rateChangedByExtension = false;
    }
  };

  const resetWatchers = () => {
    if (state.intervalId) {
      clearInterval(state.intervalId);
      state.intervalId = null;
    }

    if (state.observer) {
      state.observer.disconnect();
      state.observer = null;
    }
  };

  const start = () => {
    resetWatchers();

    state.observer = new MutationObserver(handleAdState);
    state.observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    // 稍微延遲啟動，等 YouTube player 穩定後再偵測。
    setTimeout(() => {
      handleAdState();
      state.intervalId = window.setInterval(handleAdState, 300);
    }, 1200);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }

  window.addEventListener('yt-navigate-finish', start);
})();
