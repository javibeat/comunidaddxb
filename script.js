/* ============================================
   COMUNIDAD HISPANA EAU — Interactivity
   ============================================ */

(function () {
  'use strict';

  // --- Mobile nav toggle ---
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      navToggle.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.textContent = '☰';
      });
    });
  }

  // --- Scroll animations (Intersection Observer) ---
  const fadeEls = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    fadeEls.forEach((el) => observer.observe(el));
  } else {
    // Fallback: show everything
    fadeEls.forEach((el) => el.classList.add('visible'));
  }

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navHeight = document.getElementById('nav')?.offsetHeight || 60;
        const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // --- Nav background opacity on scroll ---
  const nav = document.getElementById('nav');
  if (nav) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 80) {
            nav.style.borderBottomColor = 'rgba(255,255,255,0.1)';
          } else {
            nav.style.borderBottomColor = 'rgba(255,255,255,0.04)';
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // --- Calendar Reminder ---
  const reminderBtn = document.getElementById('reminder-btn');
  if (reminderBtn) {
    reminderBtn.addEventListener('click', (e) => {
      e.preventDefault();

      // Calculate dates for tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const formatICSDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      const start = formatICSDate(tomorrow);
      tomorrow.setHours(tomorrow.getHours() + 1);
      const end = formatICSDate(tomorrow);

      const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Comunidad Hispana EAU//ES
BEGIN:VEVENT
SUMMARY:Inscripción Consular - Embajada de España (EAU)
DESCRIPTION:Recuerda realizar tu alta como residente o no residente en el Consulado de España en Abu Dhabi.\\n\\nEnlace directo:\\nhttps://www.exteriores.gob.es/Embajadas/abudhabi/es/ServiciosConsulares/Paginas/index.aspx?scco=Emiratos+Árabes+Unidos&scd=2&scca=Inscripción+Consular&scs=Alta+de+residente+y+de+no+residente
DTSTART:${start}
DTEND:${end}
URL:https://hispanoeau.com
END:VEVENT
END:VCALENDAR`;

      const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Recordatorio_Inscripcion_Consular.ics');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // --- Featured News Carousel ---
  const newsSlides = document.getElementById('newsSlides');
  const newsDots = document.getElementById('newsDots');
  const prevBtn = document.getElementById('newsPrev');
  const nextBtn = document.getElementById('newsNext');
  const newsContainer = document.getElementById('featured-news');

  if (newsSlides && newsDots && prevBtn && nextBtn) {
    let currentSlide = 0;
    let newsItems = [];
    let autoSlideTimer = null;

    // Time-ago helper
    function timeAgo(dateStr) {
      const now = new Date();
      const date = new Date(dateStr + 'T00:00:00');
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Hoy';
      if (diffDays === 1) return 'Ayer';
      if (diffDays < 7) return 'Hace ' + diffDays + ' días';
      if (diffDays < 30) return 'Hace ' + Math.floor(diffDays / 7) + ' semana' + (Math.floor(diffDays / 7) > 1 ? 's' : '');
      return 'Hace ' + Math.floor(diffDays / 30) + ' mes' + (Math.floor(diffDays / 30) > 1 ? 'es' : '');
    }

    // Category labels
    function categoryLabel(cat) {
      const labels = {
        gobierno: 'Gobierno',
        seguridad: 'Seguridad',
        comunidad: 'Comunidad',
        avisos: 'Avisos'
      };
      return labels[cat] || cat;
    }

    // Render a single news card
    function renderCard(item) {
      const priorityBadge = item.priority === 'alta'
        ? '<span class="news-priority-badge">⚡ Prioritaria</span>'
        : '';

      return `
        <div class="news-card">
          <div class="news-card-meta">
            <span class="news-category" data-cat="${item.category}">${categoryLabel(item.category)}</span>
            <span class="news-source-name">${item.sourceIcon} ${item.source}</span>
            ${priorityBadge}
          </div>
          <div class="news-card-title">${item.title}</div>
          <div class="news-card-summary">${item.summary}</div>
          <div class="news-card-footer">
            <span class="news-date">🕐 ${timeAgo(item.date)}</span>
            <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="news-link">
              🔗 Ver fuente oficial →
            </a>
          </div>
        </div>
      `;
    }

    // Render dots
    function renderDots() {
      newsDots.innerHTML = '';
      newsItems.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'news-dot' + (i === currentSlide ? ' active' : '');
        dot.addEventListener('click', () => goToSlide(i));
        newsDots.appendChild(dot);
      });
    }

    // Go to slide
    function goToSlide(index) {
      currentSlide = index;
      newsSlides.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
      // Update dots
      newsDots.querySelectorAll('.news-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
      });
      resetAutoSlide();
    }

    // Nav
    function nextSlide() {
      goToSlide((currentSlide + 1) % newsItems.length);
    }

    function prevSlide() {
      goToSlide((currentSlide - 1 + newsItems.length) % newsItems.length);
    }

    // Auto-slide
    function startAutoSlide() {
      autoSlideTimer = setInterval(nextSlide, 8000);
    }

    function resetAutoSlide() {
      clearInterval(autoSlideTimer);
      startAutoSlide();
    }

    // Pause on hover
    if (newsContainer) {
      newsContainer.addEventListener('mouseenter', () => {
        clearInterval(autoSlideTimer);
      });
      newsContainer.addEventListener('mouseleave', () => {
        startAutoSlide();
      });
    }

    // Button listeners
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    // Keyboard nav
    document.addEventListener('keydown', (e) => {
      // Only respond if the news section is in viewport
      if (!newsContainer) return;
      const rect = newsContainer.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    });

    // Fetch and render news
    fetch('news.json')
      .then(res => {
        if (!res.ok) throw new Error('No se pudieron cargar las noticias');
        return res.json();
      })
      .then(data => {
        // Sort: alta priority first, then by date descending
        newsItems = data.sort((a, b) => {
          if (a.priority === 'alta' && b.priority !== 'alta') return -1;
          if (a.priority !== 'alta' && b.priority === 'alta') return 1;
          return new Date(b.date) - new Date(a.date);
        });

        if (newsItems.length === 0) {
          newsSlides.innerHTML = '<div class="news-empty">No hay noticias destacadas en este momento.</div>';
          return;
        }

        newsSlides.innerHTML = newsItems.map(renderCard).join('');
        renderDots();
        startAutoSlide();
      })
      .catch(() => {
        newsSlides.innerHTML = '<div class="news-empty">Consulta las fuentes oficiales para mantenerte informado.</div>';
      });
  }
})();

