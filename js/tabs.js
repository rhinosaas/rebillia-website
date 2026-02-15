/* ==========================================================================
   TABS.JS — Generic tab component
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  document.querySelectorAll('.tabs').forEach(tabsContainer => {
    const buttons = tabsContainer.querySelectorAll('.tabs__btn');
    const panels = tabsContainer.querySelectorAll('.tabs__panel');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab');

        // Update buttons
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update panels
        panels.forEach(p => {
          p.classList.remove('active');
          if (p.id === target) {
            p.classList.add('active');
          }
        });
      });
    });
  });

  // Code tabs (language switcher on developer page)
  document.querySelectorAll('.code-tabs').forEach(codeTabsContainer => {
    const buttons = codeTabsContainer.querySelectorAll('.code-tabs__btn');
    const panels = codeTabsContainer.querySelectorAll('.code-tabs__panel');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab');

        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        panels.forEach(p => {
          p.classList.remove('active');
          if (p.id === target) {
            p.classList.add('active');
          }
        });
      });
    });
  });

});
