(function () {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Theme toggle (remembered per visitor; storage may be unavailable)
  const toggle = document.querySelector('.theme-toggle');
  const stored = (() => { try { return localStorage.getItem('theme'); } catch { return null; } })();
  if (stored) root.dataset.theme = stored;
  const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  const sync = () => toggle.setAttribute('aria-pressed', String(isDark()));
  sync();
  toggle.addEventListener('click', () => {
    root.dataset.theme = isDark() ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch {}
    sync();
  });

  // BibTeX disclosure
  document.querySelectorAll('button[aria-controls]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
    });
  });

  // Image lightbox (native <dialog>: Esc closes, focus returns to the button)
  const dlg = document.querySelector('.lightbox');
  if (dlg) {
    const big = dlg.querySelector('img'), cap = dlg.querySelector('.lb-cap');
    let opener = null;
    document.querySelectorAll('.zoom').forEach((btn) => {
      const img = btn.querySelector('img');
      btn.setAttribute('aria-label', 'Enlarge image: ' + img.alt);
      btn.addEventListener('click', () => {
        opener = btn;
        big.src = btn.dataset.full; big.alt = img.alt;
        const fc = btn.closest('figure') && btn.closest('figure').querySelector('figcaption');
        cap.textContent = fc ? fc.textContent.trim() : img.alt;
        dlg.showModal();
      });
    });
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', () => opener && opener.focus());
  }

  // Lite YouTube embed: load the player only when clicked (faster page, no tracking until play)
  document.querySelectorAll('.yt').forEach((btn) => {
    btn.addEventListener('click', () => {
      const f = document.createElement('iframe');
      f.className = 'yt-frame';
      f.src = 'https://www.youtube-nocookie.com/embed/' + btn.dataset.id + '?autoplay=1&rel=0';
      f.title = 'TMLR Journal Paper 2026: Directional Curvature from Armijo Backtracking';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      f.allowFullscreen = true;
      btn.replaceWith(f);
      f.focus();
    });
  });

  // Highlight current section in nav
  const links = [...document.querySelectorAll('.nav ul a')];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.removeAttribute('aria-current'));
      const a = links.find((l) => l.getAttribute('href') === '#' + e.target.id);
      if (a) a.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  links.forEach((a) => { const s = document.querySelector(a.getAttribute('href')); if (s) io.observe(s); });

  // Motion (motion.dev): reveal on scroll + animate the Armijo figure
  if (reduce || !window.Motion) return;
  const { animate, inView, stagger } = window.Motion;
  const show = (el, i) => animate(el, { opacity: [0, 1], transform: ['translateY(16px)', 'translateY(0)'] },
    { duration: 0.5, delay: (i % 4) * 0.07, easing: [0.22, 1, 0.36, 1] });

  // Content already on screen animates right away; only content below the fold waits for scroll.
  document.querySelectorAll('.reveal').forEach((el) => {
    const idx = [...el.parentElement.children].indexOf(el);
    if (el.getBoundingClientRect().top < window.innerHeight) { show(el, idx); return; }
    el.classList.add('pre');
    inView(el, () => { el.classList.remove('pre'); show(el, idx); }, { amount: 0.1 });
  });

  const loss = document.querySelector('.armijo .loss');
  if (loss) {
    const len = loss.getTotalLength();
    loss.style.strokeDasharray = len;
    animate(loss, { strokeDashoffset: [len, 0] }, { duration: 1.2, easing: 'ease-out' });
    const probes = document.querySelectorAll('.armijo .probe, .armijo .acclabel');
    animate(probes, { opacity: [0, 1], transform: ['scale(0.4)', 'scale(1)'] },
      { delay: stagger(0.35, { start: 1.1 }), duration: 0.35 });
  }
})();
