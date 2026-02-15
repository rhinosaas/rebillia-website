/* ==========================================================================
   ACCORDION.JS — FAQ accordion with keyboard navigation
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  document.querySelectorAll('.accordion').forEach(accordion => {
    const items = accordion.querySelectorAll('.accordion__item');

    items.forEach(item => {
      const trigger = item.querySelector('.accordion__trigger');
      const content = item.querySelector('.accordion__content');

      if (!trigger || !content) return;

      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Close other items (optional: remove these 3 lines for multi-open)
        items.forEach(other => {
          other.classList.remove('open');
          const otherContent = other.querySelector('.accordion__content');
          if (otherContent) otherContent.style.maxHeight = null;
        });

        if (!isOpen) {
          item.classList.add('open');
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });

      // Keyboard navigation
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          trigger.click();
        }

        // Arrow key navigation
        const allTriggers = Array.from(accordion.querySelectorAll('.accordion__trigger'));
        const idx = allTriggers.indexOf(trigger);

        if (e.key === 'ArrowDown' && idx < allTriggers.length - 1) {
          e.preventDefault();
          allTriggers[idx + 1].focus();
        }
        if (e.key === 'ArrowUp' && idx > 0) {
          e.preventDefault();
          allTriggers[idx - 1].focus();
        }
        if (e.key === 'Home') {
          e.preventDefault();
          allTriggers[0].focus();
        }
        if (e.key === 'End') {
          e.preventDefault();
          allTriggers[allTriggers.length - 1].focus();
        }
      });
    });
  });

});
