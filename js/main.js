(function () {
  var root = document.documentElement;
  var motion = root.classList.contains('motion');
  var toggle = document.querySelector('.theme-toggle');
  var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };

  /* ------------------------------------------------------------------
     Theme
     ------------------------------------------------------------------ */
  function savedTheme() {
    try {
      var value = localStorage.getItem('theme');
      return value === 'light' || value === 'dark' ? value : null;
    } catch (e) {
      return null;
    }
  }

  function applyTheme(theme, animate) {
    if (animate && motion) {
      root.classList.add('theme-anim');
      clearTimeout(applyTheme.timer);
      applyTheme.timer = setTimeout(function () { root.classList.remove('theme-anim'); }, 500);
    }
    root.setAttribute('data-theme', theme);
    if (toggle) {
      toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  applyTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light', false);

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next, true);
      try { localStorage.setItem('theme', next); } catch (e) {}
      if (motion) {
        toggle.classList.remove('spin');
        void toggle.offsetWidth; // restart the animation
        toggle.classList.add('spin');
      }
    });
    toggle.addEventListener('animationend', function () { toggle.classList.remove('spin'); });
  }

  // Follow system changes until the visitor picks a theme themselves.
  if (media) {
    var onSystemChange = function (event) {
      if (!savedTheme()) applyTheme(event.matches ? 'dark' : 'light', true);
    };
    if (media.addEventListener) media.addEventListener('change', onSystemChange);
    else if (media.addListener) media.addListener(onSystemChange);
  }

  /* ------------------------------------------------------------------
     Sticky header shadow + reading progress
     ------------------------------------------------------------------ */
  var header = document.querySelector('.site-header');
  var bar = document.querySelector('.progress');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-scrolled', y > 8);
    if (bar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ------------------------------------------------------------------
     Count-up numbers
     ------------------------------------------------------------------ */
  function format(el, value) {
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var text = value.toFixed(decimals);
    if (el.hasAttribute('data-strip-zero') && value < 1) text = text.replace(/^0/, '');
    return text;
  }

  function countUp(el) {
    if (el.getAttribute('data-counted')) return;
    el.setAttribute('data-counted', '1');
    var target = parseFloat(el.getAttribute('data-count'));
    var duration = 1400;
    var start = null;
    function step(now) {
      if (start === null) start = now;
      var t = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = format(el, target * eased);
      if (t < 1) window.requestAnimationFrame(step);
      else el.textContent = format(el, target);
    }
    window.requestAnimationFrame(step);
    // Safety net: make sure the final value always lands, even if frames are throttled.
    setTimeout(function () { el.textContent = format(el, target); }, duration + 200);
  }

  /* ------------------------------------------------------------------
     Scroll reveals
     ------------------------------------------------------------------ */
  if (motion) {
    each(document.querySelectorAll('[data-count]'), function (el) {
      el.textContent = format(el, 0);
    });

    each(document.querySelectorAll('[data-stagger]'), function (group) {
      each(group.children, function (child, i) { child.style.setProperty('--i', i); });
    });

    var reveal = function (el) {
      el.classList.add('is-visible');
      var items = el.hasAttribute('data-stagger') ? el.children : [el];
      setTimeout(function () {
        each(items, function (item) { item.classList.add('reveal-done'); });
      }, 900 + items.length * 90);
      if (el.hasAttribute('data-count')) countUp(el);
      each(el.querySelectorAll('[data-count]'), countUp);
    };

    var targets = document.querySelectorAll('.reveal, [data-stagger]');

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
      each(targets, function (el) { observer.observe(el); });
    } else {
      each(targets, reveal);
    }
  }

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
