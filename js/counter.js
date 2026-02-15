/* ==========================================================================
   COUNTER.JS — Animated number counters
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(counter => {
    counterObserver.observe(counter);
  });

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1800;

    if (prefersReducedMotion) {
      el.textContent = prefix + formatNumber(target) + suffix;
      return;
    }

    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      el.textContent = prefix + formatNumber(current) + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  function formatNumber(n) {
    if (n >= 1000) {
      return n.toLocaleString();
    }
    return n.toString();
  }

});
