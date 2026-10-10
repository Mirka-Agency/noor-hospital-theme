(function () {
  'use strict';

  var root = document.documentElement;
  var isRTL = root.getAttribute('dir') === 'rtl';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Theme toggle */
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  function applyTheme(theme) {
    root.setAttribute('data-bs-theme', theme);
    if (themeMeta) themeMeta.setAttribute('content', theme === 'dark' ? '#0a1319' : '#0b6e8c');
  }
  applyTheme(root.getAttribute('data-bs-theme') || 'light');
  document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('nh-theme', next);
    });
  });

  /* Header state and back-to-top, driven by observers instead of scroll listeners */
  var header = document.getElementById('siteHeader');
  var sentinel = document.querySelector('.hero-sentinel');
  var hero = document.querySelector('.hero');
  var toTop = document.getElementById('toTop');

  if ('IntersectionObserver' in window) {
    if (sentinel && header) {
      new IntersectionObserver(function (entries) {
        header.classList.toggle('is-scrolled', !entries[0].isIntersecting);
      }).observe(sentinel);
    }
    if (hero && toTop) {
      new IntersectionObserver(function (entries) {
        toTop.classList.toggle('is-visible', !entries[0].isIntersecting);
      }, { threshold: 0 }).observe(hero);
    }
  }

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* Scroll reveal */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* Close the mobile menu after following an in-page link */
  var mobileNav = document.getElementById('mobileNav');
  if (mobileNav) {
    mobileNav.addEventListener('show.bs.offcanvas', function () { document.body.classList.add('menu-open'); });
    mobileNav.addEventListener('hidden.bs.offcanvas', function () { document.body.classList.remove('menu-open'); });
    mobileNav.querySelectorAll('a[href^="#"]:not([data-bs-toggle])').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.bootstrap && window.innerWidth < 1200) {
          bootstrap.Offcanvas.getOrCreateInstance(mobileNav).hide();
        }
      });
    });
  }

  /* Horizontal scroller buttons */
  document.querySelectorAll('[data-scroll]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var track = document.getElementById(btn.getAttribute('data-scroll'));
      if (!track) return;
      var tile = track.firstElementChild;
      var step = tile ? tile.getBoundingClientRect().width + 18 : track.clientWidth * 0.8;
      var forward = btn.getAttribute('data-dir') === 'next';
      var delta = (forward ? 1 : -1) * step * (isRTL ? -1 : 1);
      track.scrollBy({ left: delta, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* Carousels */
  function initSwipers() {
    if (typeof Swiper === 'undefined') return;
    var speed = reduceMotion ? 0 : 650;

    new Swiper('.doctor-swiper', {
      speed: speed,
      slidesPerView: 1.2,
      spaceBetween: 16,
      watchOverflow: true,
      grabCursor: true,
      pagination: { el: '.doctor-pagination', clickable: true },
      breakpoints: {
        576: { slidesPerView: 2.2, spaceBetween: 18 },
        768: { slidesPerView: 3, spaceBetween: 20 },
        1200: { slidesPerView: 4, spaceBetween: 24 }
      }
    });

    new Swiper('.story-swiper', {
      speed: speed,
      slidesPerView: 1.08,
      spaceBetween: 16,
      grabCursor: true,
      navigation: { prevEl: '.story-prev', nextEl: '.story-next' },
      breakpoints: {
        768: { slidesPerView: 2, spaceBetween: 20 }
      }
    });
  }

  /* Callback form */
  function toLatinDigits(value) {
    return value
      .replace(/[۰-۹]/g, function (d) { return String(d.charCodeAt(0) - 1776); })
      .replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 1632); })
      .replace(/[\s-]/g, '');
  }

  var form = document.getElementById('callbackForm');
  if (form) {
    var phone = form.querySelector('#cbPhone');
    var submitBtn = form.querySelector('button[type="submit"]');
    var success = form.querySelector('.form-success');

    phone.addEventListener('input', function () {
      phone.setCustomValidity(/^09\d{9}$/.test(toLatinDigits(phone.value)) ? '' : 'invalid');
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      phone.setCustomValidity(/^09\d{9}$/.test(toLatinDigits(phone.value)) ? '' : 'invalid');

      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        var firstInvalid = form.querySelector(':invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'در حال ارسال…';

      // Replace with a real request to the appointment backend.
      setTimeout(function () {
        form.reset();
        form.classList.remove('was-validated');
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.getAttribute('data-label');
        success.hidden = false;
        success.setAttribute('tabindex', '-1');
        success.focus();
      }, 900);
    });

    form.addEventListener('input', function () {
      if (!success.hidden) success.hidden = true;
    });
  }

  /* Doctor search (placeholder until connected to the doctors directory) */
  var docSearch = document.querySelector('.doctor-search');
  if (docSearch) {
    docSearch.addEventListener('submit', function (event) { event.preventDefault(); });
  }

  /* Nora assistant panel */
  var noraShell = document.getElementById('noraShell');
  var noraPanel = document.getElementById('noraPanel');
  var noraFab = document.querySelector('.nora-fab');
  var noraInput = document.getElementById('noraText');
  var noraVideo = document.getElementById('noraVideo');
  var noraCloseTimer = 0;
  var noraVideoReady = false;

  function prefersAppleVideo() {
    var ua = navigator.userAgent || '';
    var isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    var isSafari = /Safari/i.test(ua) && !/Chrome|CriOS|Chromium|Edg|OPR|Firefox|Android/i.test(ua);
    return isIOS || isSafari;
  }

  function ensureNoraVideo() {
    if (!noraVideo || noraVideoReady) return;
    noraVideo.src = prefersAppleVideo()
      ? 'assets/img/noora-ios.mov'
      : 'assets/img/noora.webm';
    noraVideoReady = true;
  }

  function playNoraVideo() {
    if (!noraVideo) return;
    ensureNoraVideo();
    if (reduceMotion) {
      noraVideo.pause();
      try { noraVideo.currentTime = 0; } catch (err) { /* ignore seek errors before load */ }
      return;
    }
    var playPromise = noraVideo.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () { /* autoplay may be blocked until gesture; open is a gesture */ });
    }
  }

  function pauseNoraVideo() {
    if (!noraVideo) return;
    noraVideo.pause();
  }

  function isNoraOpen() {
    return noraShell && !noraShell.hidden && noraShell.classList.contains('is-open');
  }

  function openNora() {
    if (!noraShell) return;
    if (noraCloseTimer) {
      clearTimeout(noraCloseTimer);
      noraCloseTimer = 0;
    }
    noraShell.hidden = false;
    noraShell.classList.remove('is-closing');
    // Force reflow so open animation restarts when reopening quickly.
    void noraShell.offsetWidth;
    noraShell.classList.add('is-open');
    noraFab.setAttribute('aria-expanded', 'true');
    playNoraVideo();
    setTimeout(function () { noraInput.focus(); }, 50);
  }

  function closeNora() {
    if (!noraShell || noraShell.hidden) return;
    noraShell.classList.remove('is-open');
    noraShell.classList.add('is-closing');
    noraFab.setAttribute('aria-expanded', 'false');
    pauseNoraVideo();

    var finish = function () {
      noraShell.hidden = true;
      noraShell.classList.remove('is-closing');
      noraCloseTimer = 0;
    };

    if (reduceMotion) {
      finish();
      return;
    }

    noraCloseTimer = setTimeout(finish, 300);
  }

  if (noraShell && noraPanel && noraFab) {
    document.querySelectorAll('[data-nora-open]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (isNoraOpen()) closeNora(); else openNora();
      });
    });
    noraPanel.querySelector('[data-nora-close]').addEventListener('click', function () {
      closeNora();
      noraFab.focus();
    });
    noraPanel.querySelectorAll('.nora-suggest button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        noraInput.value = btn.textContent;
        noraInput.focus();
      });
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isNoraOpen()) {
        closeNora();
        noraFab.focus();
      }
    });
  }

  if (document.readyState === 'complete') initSwipers();
  else window.addEventListener('load', initSwipers);
})();
