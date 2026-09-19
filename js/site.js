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

  /* ---------- Project tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));

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

  /* ---------- Lightbox for figures and photos ---------- */
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
  var group = [];
  var index = 0;

  function show(i) {
    index = (i + group.length) % group.length;
    var z = group[index];
    lbImg.src = z.dataset.full;
    lbImg.alt = z.querySelector('img') ? z.querySelector('img').alt : '';
    lbCap.textContent = z.dataset.caption || '';
  }

  document.querySelectorAll('.zoom').forEach(function (z) {
    z.addEventListener('click', function () {
      group = z.dataset.group
        ? Array.prototype.slice.call(document.querySelectorAll('.zoom[data-group="' + z.dataset.group + '"]'))
        : [z];
      prev.hidden = next.hidden = group.length < 2;
      show(group.indexOf(z));
      lb.showModal();
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
