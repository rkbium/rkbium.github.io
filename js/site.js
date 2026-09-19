(function () {
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Abstracts: two-line preview that expands in place ---------- */
  document.querySelectorAll('.abs-toggle').forEach(function (btn) {
    var abs = document.getElementById(btn.getAttribute('aria-controls'));
    btn.hidden = false;
    btn.addEventListener('click', function () {
      var open = abs.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Show less' : 'Show full abstract';
    });
  });

  /* ---------- Key-findings summaries ---------- */
  document.querySelectorAll('.sum-toggle').forEach(function (btn) {
    var box = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', function () {
      var open = box.hidden;
      box.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Hide key findings' : 'Key findings';
    });
  });

  /* ---------- Publication filters ---------- */
  var filters = document.querySelectorAll('.filter');
  var pubs = document.querySelectorAll('.pub');

  function applyFilter(tag) {
    filters.forEach(function (f) {
      f.setAttribute('aria-pressed', String(f.dataset.filter === tag));
    });
    pubs.forEach(function (p) {
      var tags = (p.dataset.tags || '').split(' ');
      p.hidden = !(tag === 'all' || tags.indexOf(tag) !== -1);
    });
  }

  filters.forEach(function (f) {
    var tag = f.dataset.filter;
    var count = tag === 'all' ? pubs.length : Array.prototype.filter.call(pubs, function (p) {
      return (p.dataset.tags || '').split(' ').indexOf(tag) !== -1;
    }).length;
    var badge = document.createElement('span');
    badge.className = 'count';
    badge.textContent = count;
    f.appendChild(badge);
    f.addEventListener('click', function () { applyFilter(tag); });
  });

  document.querySelectorAll('[data-filter-link]').forEach(function (a) {
    a.addEventListener('click', function () { applyFilter(a.dataset.filterLink); });
  });

  /* ---------- Project tabs (each tablist works on its own) ---------- */
  document.querySelectorAll('[role="tablist"]').forEach(function (list) {
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));

    function selectTab(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
      animateBars(document.getElementById(tab.getAttribute('aria-controls')));
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { selectTab(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') next = tabs[0];
        if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); selectTab(next, true); }
      });
    });
  });

  /* ---------- Yield-loss bars grow when they scroll into view ---------- */
  function animateBars(scope) {
    (scope || document).querySelectorAll('.lbar').forEach(function (b) {
      if (b.offsetParent !== null) b.classList.add('in');
    });
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('.lbar').forEach(function (b) { io.observe(b); });
  } else {
    animateBars();
  }

  // Tapping a bar pins its tooltip on touch screens
  document.querySelectorAll('.lbar').forEach(function (b) {
    b.addEventListener('click', function () {
      var on = !b.classList.contains('tip-on');
      document.querySelectorAll('.lbar.tip-on').forEach(function (x) { x.classList.remove('tip-on'); });
      if (on) b.classList.add('tip-on');
    });
  });

  /* ---------- "Show more" blocks (theses) ---------- */
  document.querySelectorAll('.show-more').forEach(function (btn) {
    var box = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', function () {
      var open = box.hidden;
      box.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Show less' : 'Show more';
    });
  });

  /* ---------- Horizontal carousels with arrow buttons ---------- */
  document.querySelectorAll('[data-carousel]').forEach(function (c) {
    var track = c.querySelector('.carousel-track');
    var prev = c.querySelector('.cz-prev');
    var next = c.querySelector('.cz-next');
    function update() {
      var max = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max;
      c.classList.toggle('no-scroll', max <= 0);
    }
    function step(dir) {
      track.scrollBy({ left: dir * Math.max(track.clientWidth * 0.8, 200), behavior: 'smooth' });
    }
    prev.addEventListener('click', function () { step(-1); });
    next.addEventListener('click', function () { step(1); });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* ---------- Peer-review counts, live from ORCID ---------- */
  // Journals with data-issn get their count from the public ORCID record.
  if (window.fetch) {
    fetch('https://pub.orcid.org/v3.0/0000-0001-5624-6307/peer-reviews', { headers: { Accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) {
        var counts = {}, total = 0;
        (data.group || []).forEach(function (g) {
          var ids = (g['external-ids'] && g['external-ids']['external-id']) || [];
          var issn = ids.length ? String(ids[0]['external-id-value']).replace(/^issn:/, '') : '';
          var n = 0;
          (g['peer-review-group'] || []).forEach(function (pg) { n += (pg['peer-review-summary'] || []).length; });
          counts[issn] = (counts[issn] || 0) + n;
          total += n;
        });
        document.querySelectorAll('.journal[data-issn]').forEach(function (j) {
          var n = counts[j.dataset.issn];
          if (!n) return;
          j.querySelector('[data-reviews]').textContent = n;
          j.querySelector('.j-count').lastChild.textContent = n === 1 ? ' review' : ' reviews';
        });
        if (total) document.querySelectorAll('[data-orcid-total]').forEach(function (el) { el.textContent = total; });
      })
      .catch(function () {});
  }

  /* ---------- Site visit counter (Abacus, no cookies) ---------- */
  // Counts once per browser session; later page views in the same session only read the number.
  if (window.fetch) {
    var visitsEl = document.querySelector('[data-visits]');
    var counted = false;
    try { counted = sessionStorage.getItem('rb-counted') === '1'; } catch (e) {}
    if (location.hostname !== 'radhakrishnabhandari.com.np') counted = true;   // previews only read
    var api = 'https://abacus.jasoncameron.dev/' + (counted ? 'get' : 'hit') + '/radhakrishnabhandari-com-np/visits';
    if (visitsEl) {
      fetch(api)
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (d) {
          if (typeof d.value !== 'number') return;
          visitsEl.textContent = d.value.toLocaleString('en');
          visitsEl.closest('.visits').hidden = false;
          try { sessionStorage.setItem('rb-counted', '1'); } catch (e) {}
        })
        .catch(function () {});
    }
  }

  /* ---------- Side rail shows the section in view ---------- */
  var railLabel = document.querySelector('[data-rail-section]');
  if (railLabel && 'IntersectionObserver' in window) {
    var railIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var head = e.target.querySelector('.section-head');
        if (head) railLabel.textContent = head.textContent.replace(/\s+/g, ' ').trim().replace(/^(\d+) /, '$1 — ');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section').forEach(function (s) { railIo.observe(s); });
  }

  /* ---------- Gallery: reveal the rest of the photos ---------- */
  var moreBtn = document.querySelector('.btn-more');
  if (moreBtn) {
    var moreLabel = moreBtn.textContent;
    moreBtn.addEventListener('click', function () {
      var gallery = document.getElementById(moreBtn.getAttribute('aria-controls'));
      var open = gallery.classList.toggle('show-all');
      moreBtn.setAttribute('aria-expanded', String(open));
      moreBtn.textContent = open ? 'Show fewer photos' : moreLabel;
      if (!open) gallery.scrollIntoView({ block: 'start' });
    });
  }

  /* ---------- Lightbox for figures, photos, and slides ---------- */
  var lb = document.getElementById('lightbox');
  if (!lb || typeof lb.showModal !== 'function') {
    // Old browsers: just open the full-size image
    document.querySelectorAll('.zoom').forEach(function (z) {
      z.addEventListener('click', function () { window.open(z.dataset.full, '_blank'); });
    });
    return;
  }

  var lbImg = lb.querySelector('img');
  var lbCap = lb.querySelector('figcaption');
  var prev = lb.querySelector('.lb-prev');
  var next = lb.querySelector('.lb-next');
  var items = [];   // [{src, caption, alt}]
  var index = 0;

  function show(i) {
    index = (i + items.length) % items.length;
    var it = items[index];
    lbImg.src = it.src;
    lbImg.alt = it.alt || '';
    lbCap.textContent = it.caption || '';
  }

  function open(list, start) {
    items = list;
    prev.hidden = next.hidden = items.length < 2;
    show(start);
    lb.showModal();
  }

  function fromZoom(z) {
    var img = z.querySelector('img');
    return { src: z.dataset.full, caption: z.dataset.caption, alt: img ? img.alt : '' };
  }

  document.querySelectorAll('.zoom').forEach(function (z) {
    z.addEventListener('click', function () {
      var group = z.dataset.group
        ? Array.prototype.slice.call(document.querySelectorAll('.zoom[data-group="' + z.dataset.group + '"]'))
        : [z];
      open(group.map(fromZoom), group.indexOf(z));
    });
  });

  // Thesis slide decks: numbered images slide-01.jpg … slide-NN.jpg
  document.querySelectorAll('[data-slides]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var count = parseInt(btn.dataset.count, 10);
      var list = [];
      for (var n = 1; n <= count; n++) {
        list.push({
          src: btn.dataset.slides + (n < 10 ? '0' + n : n) + '.jpg',
          caption: btn.dataset.title + ' — slide ' + n + ' of ' + count,
          alt: btn.dataset.title + ', slide ' + n
        });
      }
      open(list, 0);
    });
  });

  prev.addEventListener('click', function () { show(index - 1); });
  next.addEventListener('click', function () { show(index + 1); });
  lb.querySelector('.lb-close').addEventListener('click', function () { lb.close(); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', function (e) {
    if (group.length < 2) return;
    if (e.key === 'ArrowRight') show(index + 1);
    if (e.key === 'ArrowLeft') show(index - 1);
  });
  lb.addEventListener('close', function () { lbImg.removeAttribute('src'); });
})();
