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


  // ──────────────────────────────────────────────
  // 10. SMOOTH SCROLL for anchor links
  // ──────────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#' || href === '#!') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offsetTop = target.offsetTop - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
        // Close mobile menu if open
        if (mobileMenu && mobileMenu.classList.contains('open')) {
          window.closeMobileMenu();
        }
      }
    });
  });


  // ──────────────────────────────────────────────
  // 11. MODAL SYSTEM (reusable)
  // ──────────────────────────────────────────────
  (function initModalSystem() {
    // Create modal container if not exists
    let modalContainer = document.getElementById('modalContainer');
    if (!modalContainer) {
      modalContainer = document.createElement('div');
      modalContainer.id = 'modalContainer';
      modalContainer.style.cssText = [
        'position:fixed',
        'inset:0',
        'z-index:9999',
        'display:none',
        'align-items:center',
        'justify-content:center',
        'padding:1rem'
      ].join(';');
      document.body.appendChild(modalContainer);
    }

    // Modal backdrop
    const backdrop = document.createElement('div');
    backdrop.style.cssText = [
      'position:absolute',
      'inset:0',
      'background:rgba(0,0,0,0.6)',
      'backdrop-filter:blur(4px)',
      'opacity:0',
      'transition:opacity 0.3s ease'
    ].join(';');
    modalContainer.appendChild(backdrop);

    // Modal content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.style.cssText = [
      'position:relative',
      'background:var(--color-bg-card)',
      'border:1px solid var(--color-border)',
      'border-radius:16px',
      'padding:2rem',
      'max-width:420px',
      'width:100%',
      'box-shadow:0 20px 60px rgba(0,0,0,0.3)',
      'transform:scale(0.9) translateY(20px)',
      'opacity:0',
      'transition:all 0.3s ease',
      'text-align:center'
    ].join(';');
    modalContainer.appendChild(contentWrapper);

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.setAttribute('aria-label', 'Close modal');
    closeBtn.style.cssText = [
      'position:absolute',
      'top:1rem',
      'right:1rem',
      'width:32px',
      'height:32px',
      'border-radius:8px',
      'border:1px solid var(--color-border)',
      'background:var(--color-bg-secondary)',
      'color:var(--color-text-muted)',
      'font-size:1.5rem',
      'line-height:1',
      'cursor:pointer',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'transition:all 0.2s ease'
    ].join(';');
    closeBtn.addEventListener('mouseenter', function () {
      this.style.borderColor = 'var(--color-accent)';
      this.style.color = 'var(--color-accent)';
    });
    closeBtn.addEventListener('mouseleave', function () {
      this.style.borderColor = 'var(--color-border)';
      this.style.color = 'var(--color-text-muted)';
    });
    contentWrapper.appendChild(closeBtn);

    // Icon placeholder
    const iconEl = document.createElement('div');
    iconEl.style.cssText = 'font-size:3rem;margin-bottom:1rem;';
    contentWrapper.appendChild(iconEl);

    // Title placeholder
    const titleEl = document.createElement('h3');
    titleEl.style.cssText = [
      'font-size:1.25rem',
      'font-weight:700',
      'color:var(--color-text-primary)',
      'margin-bottom:0.75rem'
    ].join(';');
    contentWrapper.appendChild(titleEl);

    // Message placeholder
    const messageEl = document.createElement('p');
    messageEl.style.cssText = [
      'font-size:0.95rem',
      'color:var(--color-text-muted)',
      'line-height:1.6',
      'margin-bottom:1.5rem'
    ].join(';');
    contentWrapper.appendChild(messageEl);

    // Action button placeholder
    const actionBtn = document.createElement('button');
    actionBtn.textContent = 'Close';
    actionBtn.style.cssText = [
      'padding:0.75rem 2rem',
      'border-radius:8px',
      'border:none',
      'background:var(--color-accent)',
      'color:white',
      'font-weight:600',
      'font-size:0.95rem',
      'cursor:pointer',
      'transition:all 0.2s ease'
    ].join(';');
    actionBtn.addEventListener('mouseenter', function () {
      this.style.transform = 'translateY(-2px)';
      this.style.boxShadow = '0 4px 12px rgba(56,189,248,0.3)';
    });
    actionBtn.addEventListener('mouseleave', function () {
      this.style.transform = '';
      this.style.boxShadow = '';
    });
    contentWrapper.appendChild(actionBtn);

    // Show modal function
    window.showModal = function (options) {
      options = options || {};
      const type = options.type || 'success';
      const title = options.title || '';
      const message = options.message || '';
      const icon = options.icon || (type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️');
      const buttonText = options.buttonText || 'Close';
      const autoClose = options.autoClose !== undefined ? options.autoClose : false;
      const duration = options.duration || 3000;

      iconEl.textContent = icon;
      titleEl.textContent = title;
      messageEl.textContent = message;
      actionBtn.textContent = buttonText;

      modalContainer.style.display = 'flex';
      
      // Trigger animation
      requestAnimationFrame(function () {
        backdrop.style.opacity = '1';
        contentWrapper.style.transform = 'scale(1) translateY(0)';
        contentWrapper.style.opacity = '1';
      });

      // Auto close
      if (autoClose) {
        setTimeout(window.closeModal, duration);
      }
    };

    // Close modal function
    window.closeModal = function () {
      backdrop.style.opacity = '0';
      contentWrapper.style.transform = 'scale(0.9) translateY(20px)';
      contentWrapper.style.opacity = '0';
      
      setTimeout(function () {
        modalContainer.style.display = 'none';
      }, 300);
    };

    // Close on button click
    closeBtn.addEventListener('click', window.closeModal);
    actionBtn.addEventListener('click', window.closeModal);

    // Close on backdrop click
    backdrop.addEventListener('click', window.closeModal);

    // Close on ESC key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modalContainer.style.display === 'flex') {
        window.closeModal();
      }
    });
  })();


  // ──────────────────────────────────────────────
  // 12. TOAST NOTIFICATION SYSTEM
  // ──────────────────────────────────────────────
  (function initToastSystem() {
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toastContainer';
      toastContainer.style.cssText = [
        'position:fixed',
        'top:1rem',
        'right:1rem',
        'z-index:10000',
        'display:flex',
        'flex-direction:column',
        'gap:0.75rem',
        'pointer-events:none'
      ].join(';');
      document.body.appendChild(toastContainer);
    }

    window.showToast = function (options) {
      options = options || {};
      const type = options.type || 'info';
      const message = options.message || '';
      const duration = options.duration || 3000;

      const toast = document.createElement('div');
      const bgColor = type === 'success' ? 'rgba(34,197,94,0.95)' : 
                      type === 'error' ? 'rgba(239,68,68,0.95)' : 
                      'rgba(56,189,248,0.95)';
      
      toast.style.cssText = [
        'pointer-events:auto',
        'background:' + bgColor,
        'color:white',
        'padding:1rem 1.25rem',
        'border-radius:10px',
        'font-size:0.9rem',
        'font-weight:500',
        'box-shadow:0 4px 20px rgba(0,0,0,0.15)',
        'transform:translateX(120%)',
        'transition:transform 0.3s ease',
        'max-width:320px',
        'display:flex',
        'align-items:center',
        'gap:0.75rem'
      ].join(';');

      const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
      toast.innerHTML = '<span style="font-size:1.1rem;">' + icon + '</span><span>' + message + '</span>';

      toastContainer.appendChild(toast);

      // Animate in
      requestAnimationFrame(function () {
        toast.style.transform = 'translateX(0)';
      });

      // Remove after duration
      setTimeout(function () {
        toast.style.transform = 'translateX(120%)';
        setTimeout(function () {
          toast.remove();
        }, 300);
      }, duration);
    };
  })();


  // ──────────────────────────────────────────────
  // 13. COURSE ENROLLMENT BUTTONS
  // ──────────────────────────────────────────────
  (function initCourseEnrollment() {
    const enrollButtons = document.querySelectorAll('.glass-card .btn-primary');
    
    enrollButtons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        
        // Show loading state
        const originalText = btn.textContent;
        btn.textContent = 'Enrolling...';
        btn.style.opacity = '0.7';
        btn.style.pointerEvents = 'none';

        // Simulate API call
        setTimeout(function () {
          btn.textContent = originalText;
          btn.style.opacity = '';
          btn.style.pointerEvents = '';

          // Show success modal
          window.showModal({
            type: 'success',
            title: 'Enrolled Successfully!',
            message: 'You have been enrolled in this course. Check your email for course access details.',
            icon: '🎉',
            buttonText: 'Awesome!',
            autoClose: false
          });

          // Also show toast
          window.showToast({
            type: 'success',
            message: 'Enrolled successfully!',
            duration: 2500
          });
        }, 1200);
      });
    });
  })();


  // ──────────────────────────────────────────────
  // 14. CATEGORY FILTER FUNCTIONALITY
  // ──────────────────────────────────────────────
  (function initCategoryFilter() {
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(function (card) {
      card.addEventListener('click', function () {
        const categoryName = this.querySelector('h3').textContent;
        
        // Show toast with filter info
        window.showToast({
          type: 'info',
          message: 'Filtering by: ' + categoryName,
          duration: 2000
        });

        // Scroll to courses section
        const coursesSection = document.getElementById('courses');
        if (coursesSection) {
          const offsetTop = coursesSection.offsetTop - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      });

      // Add cursor pointer and hover effect
      card.style.cursor = 'pointer';
      card.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-4px)';
      });
      card.addEventListener('mouseleave', function () {
        this.style.transform = '';
      });
    });
  })();


  // ──────────────────────────────────────────────
  // 15. BUTTON LOADING STATES (for CTA buttons)
  // ──────────────────────────────────────────────
  (function initButtonLoading() {
    const ctaButtons = document.querySelectorAll('.cta-section .btn-primary, .cta-section .btn-secondary');
    
    ctaButtons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        // If it's a hash link, let smooth scroll handle it
        const href = this.getAttribute('href');
        if (href && href.startsWith('#')) return;

        e.preventDefault();
        
        const originalText = btn.textContent.trim();
        btn.textContent = 'Loading...';
        btn.style.opacity = '0.7';
        btn.style.pointerEvents = 'none';

        setTimeout(function () {
          btn.textContent = originalText;
          btn.style.opacity = '';
          btn.style.pointerEvents = '';

          window.showModal({
            type: 'success',
            title: 'Welcome to NeuralPath!',
            message: 'Thank you for your interest. Our team will reach out to you shortly.',
            icon: '🚀',
            buttonText: 'Got it',
            autoClose: false
          });
        }, 1500);
      });
    });
  })();


  // ──────────────────────────────────────────────
  // 16. LOGIN BUTTON FUNCTIONALITY
  // ──────────────────────────────────────────────
  (function initLoginButton() {
    const loginBtn = document.querySelector('.btn-login');
    if (loginBtn) {
      loginBtn.addEventListener('click', function (e) {
        e.preventDefault();
        
        window.showModal({
          type: 'info',
          title: 'Login Coming Soon',
          message: 'User authentication is under development. Please contact support for account access.',
          icon: '🔐',
          buttonText: 'Close',
          autoClose: false
        });
      });
    }
  })();

})();
