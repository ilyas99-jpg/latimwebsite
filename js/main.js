/* ============================================================
   LATIMTECH — Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* --- Mobile Menu ---------------------------------------- */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('active');
      hamburger.classList.toggle('active');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        hamburger.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  /* --- Sticky Header -------------------------------------- */
  const header = document.getElementById('header');
  if (header) {
    const tick = () => header.classList.toggle('scrolled', window.scrollY > 50);
    window.addEventListener('scroll', tick, { passive: true });
    tick();
  }

  /* --- Active Nav Link ------------------------------------ */
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* --- Staggered card animations (must run BEFORE observer) */
  const staggerSels = [
    '.services-grid .service-card',
    '.projects-grid .project-card',
    '.portfolio-grid .portfolio-item',
    '.why-grid .why-item',
    '.values-grid .value-card',
    '.stats-grid .stat-item',
    '.services-list .service-detail',
    '.contact-cards .contact-card',
  ];
  staggerSels.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('fade-in');
      el.style.transitionDelay = `${Math.min(i * 0.07, 0.5)}s`;
    });
  });

  /* --- Scroll Animations (Intersection Observer) ---------- */
  const animEls = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');
  if (animEls.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
    animEls.forEach(el => obs.observe(el));
  }

  /* --- Counter Animation ---------------------------------- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const cObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { runCounter(e.target); cObs.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => cObs.observe(el));
  }

  function runCounter(el) {
    const target   = parseInt(el.dataset.count, 10);
    const suffix   = el.dataset.suffix || '';
    const duration = 1800;
    const start    = performance.now();
    const step = ts => {
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(ease * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* --- Portfolio / Project filter ------------------------- */
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const filterItems = document.querySelectorAll('[data-category]');

  if (filterBtns.length && filterItems.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        filterItems.forEach(item => {
          const show = f === 'all' || item.dataset.category === f;
          item.style.transition = 'opacity .3s ease, transform .3s ease';
          if (show) {
            item.style.display = '';
            requestAnimationFrame(() => { item.style.opacity = '1'; item.style.transform = ''; });
          } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(.95)';
            setTimeout(() => { if (item.style.opacity === '0') item.style.display = 'none'; }, 310);
          }
        });
      });
    });
  }

  /* --- Contact Form (Formspree) --------------------------- */
  const form        = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;

      form.querySelectorAll('[required]').forEach(f => {
        f.classList.remove('error');
        if (!f.value.trim()) { f.classList.add('error'); valid = false; }
      });

      const email = form.querySelector('input[type="email"]');
      if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        email.classList.add('error'); valid = false;
      }

      if (!valid) return;

      const btn  = form.querySelector('button[type="submit"]');
      const orig = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';
      btn.disabled  = true;

      fetch(form.action, {
        method:  'POST',
        body:    new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
      .then(r => {
        if (r.ok) {
          form.reset();
          btn.innerHTML = orig;
          btn.disabled  = false;
          if (formSuccess) { form.style.display = 'none'; formSuccess.classList.add('visible'); }
        } else {
          btn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error — please try again';
          btn.disabled  = false;
          setTimeout(() => { btn.innerHTML = orig; }, 3500);
        }
      })
      .catch(() => {
        btn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Network error — please try again';
        btn.disabled  = false;
        setTimeout(() => { btn.innerHTML = orig; }, 3500);
      });
    });

    form.querySelectorAll('input, select, textarea').forEach(f => {
      f.addEventListener('input', () => f.classList.remove('error'));
    });
  }

  /* --- Smooth scroll for anchor links --------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* --- Hero Image Slideshow -------------------------------- */
  (function () {
    const slides  = document.querySelectorAll('.hero-slide');
    const dots    = document.querySelectorAll('.hero-dot');
    const prevBtn = document.getElementById('heroPrev');
    const nextBtn = document.getElementById('heroNext');
    const hero    = document.getElementById('hero');
    if (!slides.length) return;

    let current = 0, paused = false, timer = null;
    const DELAY = 5000, TOTAL = slides.length;

    function videoOf(slide) { return slide.querySelector('video'); }

    function goTo(idx) {
      idx = (idx + TOTAL) % TOTAL;

      // Deactivate outgoing slide
      const outgoing = slides[current];
      outgoing.classList.remove('active');
      dots[current].classList.remove('active');
      dots[current].setAttribute('aria-selected', 'false');
      const outVid = videoOf(outgoing);
      if (outVid) { outVid.pause(); outVid.currentTime = 0; }

      // Activate incoming slide
      current = idx;
      const incoming = slides[current];
      incoming.classList.add('active');
      dots[current].classList.add('active');
      dots[current].setAttribute('aria-selected', 'true');
      const inVid = videoOf(incoming);
      if (inVid) { inVid.play().catch(() => {}); }
    }
    function startTimer()   { stopTimer(); timer = setInterval(() => { if (!paused) goTo(current + 1); }, DELAY); }
    function stopTimer()    { if (timer) { clearInterval(timer); timer = null; } }
    function restartTimer() { stopTimer(); startTimer(); }

    hero.addEventListener('mouseenter', () => { paused = true; });
    hero.addEventListener('mouseleave', () => { paused = false; });
    prevBtn.addEventListener('click', () => { goTo(current - 1); restartTimer(); });
    nextBtn.addEventListener('click', () => { goTo(current + 1); restartTimer(); });
    dots.forEach(d => d.addEventListener('click', () => { goTo(+d.dataset.index); restartTimer(); }));

    let tx = 0;
    hero.addEventListener('touchstart', e => { tx = e.changedTouches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend',   e => {
      const delta = e.changedTouches[0].clientX - tx;
      if (Math.abs(delta) > 50) { delta < 0 ? goTo(current + 1) : goTo(current - 1); restartTimer(); }
    }, { passive: true });

    startTimer();
  }());

});
