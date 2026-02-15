/* ==========================================================================
   CODE-COPY.JS — Copy-to-clipboard for code blocks
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  document.querySelectorAll('.code-block__copy').forEach(btn => {
    btn.addEventListener('click', async () => {
      const codeBlock = btn.closest('.code-block');
      const code = codeBlock.querySelector('pre')?.textContent || '';

      try {
        await navigator.clipboard.writeText(code.trim());
        btn.classList.add('copied');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';

        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = originalText;
        }, 2000);
      } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = code.trim();
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);

        btn.classList.add('copied');
        btn.textContent = 'Copied!';
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.textContent = 'Copy';
        }, 2000);
      }
    });
  });

});
