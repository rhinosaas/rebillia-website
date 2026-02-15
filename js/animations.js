/* ==========================================================================
   ANIMATIONS.JS — IntersectionObserver scroll reveal
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => {
      el.classList.add('visible');
    });
    return;
  }

  // ── Scroll Reveal ────────────────────────────────────────────────────────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => {
    revealObserver.observe(el);
  });

});
