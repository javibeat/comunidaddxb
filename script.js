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
  // --- Support Counter Logic ---
  const supportBtn = document.getElementById('support-btn');
  const supportCountEl = document.getElementById('support-count');
  const API_URL = 'https://api.counterapi.dev/v1/hispanoeau/support';

  async function updateCounterUI() {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        const value = parseInt(data.count) || 124; // Baseline
        supportCountEl.textContent = value.toLocaleString();
      } else {
        supportCountEl.textContent = '124';
      }
    } catch (err) {
      console.error('Counter error:', err);
      supportCountEl.textContent = '124';
    }
  }

  if (supportBtn && supportCountEl) {
    updateCounterUI();

    if (localStorage.getItem('hasSupportedGuia')) {
      supportBtn.classList.add('thanked');
      supportBtn.textContent = '🤝 ¡Gracias por tu apoyo!';
    }

    supportBtn.addEventListener('click', async () => {
      if (localStorage.getItem('hasSupportedGuia')) return;

      supportBtn.classList.add('thanked');
      supportBtn.textContent = '🤝 ¡Gracias por tu apoyo!';
      localStorage.setItem('hasSupportedGuia', 'true');

      try {
        const response = await fetch(`${API_URL}/up`);
        if (response.ok) {
          const data = await response.json();
          const value = parseInt(data.count) || 125;
          supportCountEl.textContent = value.toLocaleString();
        }
      } catch (err) {
        console.error('Increment error:', err);
      }
    });
  }
})();
