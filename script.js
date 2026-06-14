/* ============================================================
   NeuralPath — script.js
   Vanilla JS only. No frameworks.
   ============================================================ */

(function () {
  'use strict';

  // ──────────────────────────────────────────────
  // 0. THEME — Light / Dark toggle
  // ──────────────────────────────────────────────
  const themeToggle = document.getElementById('themeToggle');
  const htmlEl      = document.documentElement;

  // On load: read saved preference; default to light
  (function initTheme() {
    const saved = localStorage.getItem('npTheme');
    if (saved === 'dark') {
      htmlEl.classList.add('dark');
    }
    // No saved value → light mode (no class)
  })();

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const isDark = htmlEl.classList.toggle('dark');
      localStorage.setItem('npTheme', isDark ? 'dark' : 'light');
    });
  }


  // ──────────────────────────────────────────────
  // 1. NAVBAR — scroll class + progress bar
  // ──────────────────────────────────────────────
  const navbar        = document.getElementById('navbar');
  const scrollProgress = document.getElementById('scrollProgress');

  function updateNavbarAndProgress() {
    const scrollTop    = window.scrollY;
    const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled     = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    // Scroll progress bar
    if (scrollProgress) {
      scrollProgress.style.width = scrolled + '%';
    }

    // Navbar background
    if (navbar) {
      if (scrollTop > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  }

  window.addEventListener('scroll', updateNavbarAndProgress, { passive: true });
  updateNavbarAndProgress(); // run on load


  // ──────────────────────────────────────────────
  // 2. HAMBURGER MENU
  // ──────────────────────────────────────────────
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen.toString());
    });
  }

  // Expose close function to inline onclick handlers
  window.closeMobileMenu = function () {
    if (mobileMenu) mobileMenu.classList.remove('open');
    if (hamburger)  {
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  };


  // ──────────────────────────────────────────────
  // 3. SCROLL REVEAL (IntersectionObserver)
  // ──────────────────────────────────────────────
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target); // animate once
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback — just make everything visible
    revealElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }


  // ──────────────────────────────────────────────
  // 4. TESTIMONIAL SLIDER
  // ──────────────────────────────────────────────
  const slider    = document.getElementById('testimonialSlider');
  const prevBtn   = document.getElementById('sliderPrev');
  const nextBtn   = document.getElementById('sliderNext');
  const dotsWrap  = document.getElementById('sliderDots');

  if (slider && prevBtn && nextBtn && dotsWrap) {
    const cards         = slider.querySelectorAll('.testimonial-card');
    const totalCards    = cards.length;
    let currentIndex    = 0;
    let autoPlayTimer   = null;
    let cardsPerView    = getCardsPerView();

    // Build dots
    function buildDots() {
      dotsWrap.innerHTML = '';
      const totalDots = Math.ceil(totalCards / cardsPerView);
      for (let i = 0; i < totalDots; i++) {
        const dot = document.createElement('div');
        dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('role', 'button');
        dot.setAttribute('aria-label', 'Slide ' + (i + 1));
        dot.addEventListener('click', function () {
          goToSlide(i);
        });
        dotsWrap.appendChild(dot);
      }
    }

    function getCardsPerView() {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 640)  return 2;
      return 1;
    }

    function getCardWidth() {
      if (cards.length === 0) return 0;
      const card  = cards[0];
      const style = window.getComputedStyle(slider);
      const gap   = parseFloat(style.gap) || 24;
      return card.getBoundingClientRect().width + gap;
    }

    function goToSlide(index) {
      const totalSlides = Math.ceil(totalCards / cardsPerView);
      currentIndex = ((index % totalSlides) + totalSlides) % totalSlides;

      const cardW     = getCardWidth();
      const offset    = currentIndex * cardsPerView * cardW;
      slider.scrollTo({ left: offset, behavior: 'smooth' });

      // Update dots
      const dots = dotsWrap.querySelectorAll('.slider-dot');
      dots.forEach(function (d, i) {
        d.classList.toggle('active', i === currentIndex);
      });
    }

    function next() {
      goToSlide(currentIndex + 1);
    }

    function prev() {
      goToSlide(currentIndex - 1);
    }

    prevBtn.addEventListener('click', function () {
      prev();
      resetAutoplay();
    });

    nextBtn.addEventListener('click', function () {
      next();
      resetAutoplay();
    });

    // Hover styles for prev/next buttons
    [prevBtn, nextBtn].forEach(function (btn) {
      btn.addEventListener('mouseenter', function () {
        btn.style.borderColor = 'var(--color-accent)';
        btn.style.color       = 'var(--color-accent)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.borderColor = 'var(--color-border)';
        btn.style.color       = 'var(--color-text-muted)';
      });
    });

    // Auto-play
    function startAutoplay() {
      autoPlayTimer = setInterval(next, 4000);
    }

    function resetAutoplay() {
      clearInterval(autoPlayTimer);
      startAutoplay();
    }

    // Touch / swipe support
    let touchStartX = 0;
    slider.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    slider.addEventListener('touchend', function (e) {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) next(); else prev();
        resetAutoplay();
      }
    }, { passive: true });

    // Pause on hover
    slider.addEventListener('mouseenter', function () { clearInterval(autoPlayTimer); });
    slider.addEventListener('mouseleave', startAutoplay);

    // Responsive rebuild
    window.addEventListener('resize', function () {
      const newCPV = getCardsPerView();
      if (newCPV !== cardsPerView) {
        cardsPerView = newCPV;
        currentIndex = 0;
        buildDots();
        goToSlide(0);
      }
    });

    // Init
    buildDots();
    startAutoplay();
  }


  // ──────────────────────────────────────────────
  // 5. SMOOTH ACTIVE NAV LINK HIGHLIGHT
  // ──────────────────────────────────────────────
  const sections  = document.querySelectorAll('section[id], footer[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');

  function updateActiveLink() {
    let currentSection = '';
    sections.forEach(function (section) {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        currentSection = '#' + section.id;
      }
    });

    navAnchors.forEach(function (a) {
      const isActive = a.getAttribute('href') === currentSection;
      a.style.color = isActive ? 'var(--color-accent)' : '';
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });


  // ──────────────────────────────────────────────
  // 6. COUNTER ANIMATION for stats
  // ──────────────────────────────────────────────
  const statNumbers = document.querySelectorAll('.stat-number');

  function animateCounter(el) {
    const text   = el.textContent.trim();
    // Extract numeric part and suffix
    const match  = text.match(/^([\d.]+)(.*)/);
    if (!match) return;

    const target   = parseFloat(match[1]);
    const suffix   = match[2];
    const duration = 1800;
    const steps    = 60;
    const increment = target / steps;
    let current  = 0;
    let step     = 0;

    const timer = setInterval(function () {
      step++;
      current = Math.min(current + increment, target);
      const display = Number.isInteger(target) ? Math.round(current) : current.toFixed(1);
      el.textContent = display + suffix;
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
  }

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    statNumbers.forEach(function (el) {
      counterObserver.observe(el);
    });
  }


  // ──────────────────────────────────────────────
  // 7. BUTTON RIPPLE EFFECT
  // ──────────────────────────────────────────────
  document.querySelectorAll('.btn-primary, .btn-secondary').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      const rect   = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size   = Math.max(rect.width, rect.height);
      const x      = e.clientX - rect.left - size / 2;
      const y      = e.clientY - rect.top  - size / 2;

      ripple.style.cssText = [
        'position:absolute',
        'border-radius:50%',
        'pointer-events:none',
        'width:' + size + 'px',
        'height:' + size + 'px',
        'left:' + x + 'px',
        'top:' + y + 'px',
        'background:rgba(255,255,255,0.25)',
        'transform:scale(0)',
        'animation:rippleAnim 0.5s ease-out forwards'
      ].join(';');

      // Ensure btn has position:relative for the ripple to work
      const pos = window.getComputedStyle(btn).position;
      if (pos === 'static') btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 600);
    });
  });

  // Inject ripple keyframes once
  if (!document.getElementById('rippleStyle')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'rippleStyle';
    styleEl.textContent = '@keyframes rippleAnim{to{transform:scale(2.5);opacity:0}}';
    document.head.appendChild(styleEl);
  }


  // ──────────────────────────────────────────────
  // 8. CATEGORY CARD STAGGER ANIMATION
  // ──────────────────────────────────────────────
  const categoryCards = document.querySelectorAll('.category-card');
  categoryCards.forEach(function (card, i) {
    card.style.transitionDelay = (i * 0.06) + 's';
  });


  // ──────────────────────────────────────────────
  // 9. KEYBOARD ACCESSIBILITY for slider
  // ──────────────────────────────────────────────
  document.addEventListener('keydown', function (e) {
    const sliderSection = document.getElementById('testimonials');
    if (!sliderSection) return;
    const rect = sliderSection.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;

    if (e.key === 'ArrowLeft'  && prevBtn) prevBtn.click();
    if (e.key === 'ArrowRight' && nextBtn) nextBtn.click();
  });

})();
