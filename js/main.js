/* ==========================================================================
   MAIN.JS — Navbar toggle, smooth scroll, scroll animations
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ── Navbar scroll effect ────────────────────────────────────────────────
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  // ── Mobile menu toggle ──────────────────────────────────────────────────
  const toggle = document.querySelector('.navbar__toggle');
  const nav = document.querySelector('.navbar__nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      nav.classList.toggle('open');
      document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
    });

    // Close menu on link click
    nav.querySelectorAll('a:not(.navbar__dropdown > .navbar__link)').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        nav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ── Mobile dropdown toggle ──────────────────────────────────────────────
  document.querySelectorAll('.navbar__dropdown > .navbar__link').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (window.innerWidth <= 1024) {
        e.preventDefault();
        btn.closest('.navbar__dropdown').classList.toggle('open');
      }
    });
  });

  // ── Smooth scroll for anchor links ──────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80; // navbar height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ── Active nav link highlighting ────────────────────────────────────────
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('navbar__link--active');
    }
  });

});
