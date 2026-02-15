/* ==========================================================================
   PRICING-TOGGLE.JS — Monthly/annual pricing switch
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const toggle = document.querySelector('.pricing-toggle__switch');
  const monthlyLabel = document.querySelector('[data-toggle="monthly"]');
  const annualLabel = document.querySelector('[data-toggle="annual"]');

  if (!toggle) return;

  let isAnnual = false;

  function updatePricing() {
    toggle.classList.toggle('active', isAnnual);

    if (monthlyLabel) monthlyLabel.classList.toggle('active', !isAnnual);
    if (annualLabel) annualLabel.classList.toggle('active', isAnnual);

    document.querySelectorAll('[data-price-monthly]').forEach(el => {
      const monthly = el.getAttribute('data-price-monthly');
      const annual = el.getAttribute('data-price-annual');
      el.textContent = isAnnual ? annual : monthly;
    });

    document.querySelectorAll('[data-period]').forEach(el => {
      el.textContent = isAnnual ? '/yr' : '/mo';
    });

    // Show/hide annual savings badge
    document.querySelectorAll('.pricing-card__savings').forEach(el => {
      el.style.display = isAnnual ? 'inline-block' : 'none';
    });
  }

  toggle.addEventListener('click', () => {
    isAnnual = !isAnnual;
    updatePricing();
  });

  if (monthlyLabel) {
    monthlyLabel.addEventListener('click', () => {
      isAnnual = false;
      updatePricing();
    });
  }

  if (annualLabel) {
    annualLabel.addEventListener('click', () => {
      isAnnual = true;
      updatePricing();
    });
  }

  // Initialize
  updatePricing();
});
