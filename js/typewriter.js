/* ==========================================================================
   TYPEWRITER — Cycles through words with type/delete animation
   ========================================================================== */

(function () {
  var el = document.getElementById('typewriter-text');
  if (!el) return;

  var container = el.parentElement;
  var words = ['Developers', 'Vibe Coders', 'AI Agents', 'Non-Technical Teams', 'Everyone'];
  var wordIndex = 0;
  var charIndex = 0;
  var isDeleting = false;
  var typeSpeed = 80;
  var deleteSpeed = 50;
  var pauseAfterType = 1800;
  var pauseAfterDelete = 400;

  // Measure the longest word and set fixed container width
  var maxWidth = 0;
  var measure = document.createElement('span');
  measure.style.visibility = 'hidden';
  measure.style.position = 'absolute';
  measure.style.whiteSpace = 'nowrap';
  measure.style.font = window.getComputedStyle(el.closest('h2')).font;
  document.body.appendChild(measure);
  for (var i = 0; i < words.length; i++) {
    measure.textContent = words[i] + '|';
    var w = measure.offsetWidth;
    if (w > maxWidth) maxWidth = w;
  }
  document.body.removeChild(measure);
  container.style.width = maxWidth + 'px';

  function tick() {
    var currentWord = words[wordIndex];

    if (!isDeleting) {
      charIndex++;
      el.textContent = currentWord.substring(0, charIndex);

      if (charIndex === currentWord.length) {
        setTimeout(function () {
          isDeleting = true;
          tick();
        }, pauseAfterType);
        return;
      }
      setTimeout(tick, typeSpeed);
    } else {
      charIndex--;
      el.textContent = currentWord.substring(0, charIndex);

      if (charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(tick, pauseAfterDelete);
        return;
      }
      setTimeout(tick, deleteSpeed);
    }
  }

  tick();
})();
