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

  const SEEK_RETRY_MS = 120;

  const state = {
    mutedByExtension: false,
    intervalId: null,
    observer: null,
    lastAdJumpAt: 0
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

    return Array.from(document.querySelectorAll('button')).find((btn) => {
      const label = (btn.getAttribute('aria-label') || '').toLowerCase();
      return (
        !btn.disabled &&
        isVisible(btn) &&
        (label.includes('skip') || label.includes('略過') || label.includes('跳過'))
      );
    }) || null;
  };

  const clickSkipButton = () => {
    const btn = findSkipButton();
    if (!btn) return false;

    btn.click();
    return true;
  };

  const jumpAdToEnd = (video) => {
    const moviePlayer = getMoviePlayer();
    const duration = Number(video.duration);

    // 方式 A：直接操作 HTMLVideoElement。
    if (Number.isFinite(duration) && duration > 1 && video.currentTime < duration - 0.15) {
      video.currentTime = duration - 0.05;
      return true;
    }

    // 方式 B：透過 YouTube player API 作為備援。
    if (moviePlayer && typeof moviePlayer.getDuration === 'function' && typeof moviePlayer.seekTo === 'function') {
      const playerDuration = Number(moviePlayer.getDuration());
      if (Number.isFinite(playerDuration) && playerDuration > 1) {
        moviePlayer.seekTo(Math.max(playerDuration - 0.05, 0), true);
        return true;
      }
    }

    return false;
  };

  const handleAdState = () => {
    const video = getVideo();
    if (!video) return;

    const adShowing = isAdShowing();

    if (adShowing) {
      const now = Date.now();
      if (now - state.lastAdJumpAt > SEEK_RETRY_MS) {
        clickSkipButton();
        jumpAdToEnd(video);
        state.lastAdJumpAt = now;
      }

      if (!state.mutedByExtension && !video.muted) {
        video.muted = true;
        state.mutedByExtension = true;
      }

      return;
    }

    if (state.mutedByExtension) {
      video.muted = false;
      state.mutedByExtension = false;
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

    state.lastAdJumpAt = 0;
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

    setTimeout(() => {
      handleAdState();
      state.intervalId = window.setInterval(handleAdState, 120);
    }, 300);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }

  window.addEventListener('yt-navigate-finish', start);
})();
