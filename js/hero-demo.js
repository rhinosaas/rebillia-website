/* ==========================================================================
   HERO PRODUCT DEMO CAROUSEL
   Two replicas of the real Rebillia app, played as looping demos:
     Scene 1 — the live dashboard (Store Performance) reacting to events
     Scene 2 — creating a product (the real /main/products/add flow,
               storyboarded from a screen recording)
   Swipe / arrows / dots to switch; auto-advances after each loop.
   Pauses off-screen; animations skipped for prefers-reduced-motion.
   ========================================================================== */

(function () {
  'use strict';

  var carousel = document.getElementById('hero-carousel');
  var track = document.getElementById('hero-track');
  if (!carousel || !track) return;

  var dots = carousel.querySelectorAll('.hero-carousel__dot');
  var SCENES = 3;
  var current = 0;
  var switches = 0;

  /* ── Scene switching ──────────────────────────────────────────────── */

  function setScene(i) {
    current = ((i % SCENES) + SCENES) % SCENES;
    switches++;
    track.style.transform = 'translateX(' + (-100 * current) + '%)';
    for (var d = 0; d < dots.length; d++) {
      dots[d].classList.toggle('is-active', d === current);
    }
    for (var sc = 0; sc < track.children.length; sc++) {
      track.children[sc].classList.toggle('is-active', sc === current);
    }
    // NOTE: scenes are deliberately NOT reset here. A play interrupted by
    // this switch may still execute a few queued DOM writes; the main loop
    // resets all scenes right before each play, after the old play has
    // fully exited, so those zombie writes can't poison the next run.
  }

  /* A staleness token: steps abort when the user switches scenes. */
  function token() {
    var snap = switches;
    return function () { return snap !== switches; };
  }

  document.getElementById('hero-prev').addEventListener('click', function () { setScene(current - 1); });
  document.getElementById('hero-next').addEventListener('click', function () { setScene(current + 1); });
  for (var d = 0; d < dots.length; d++) {
    (function (idx) {
      dots[idx].addEventListener('click', function () { setScene(idx); });
    })(d);
  }

  // Drag-to-swipe: the track follows the finger/mouse, snaps on release.
  // touch-action: pan-y on the viewport keeps vertical page scroll native.
  var viewport = carousel.querySelector('.hero-carousel__viewport');
  var drag = null;

  function viewportWidth() {
    return viewport.getBoundingClientRect().width;
  }

  function snapTo(scene) {
    track.style.transform = 'translateX(' + (-100 * scene) + '%)';
  }

  viewport.addEventListener('pointerdown', function (e) {
    drag = { x: e.clientX, y: e.clientY, t: performance.now(), active: false };
  });

  viewport.addEventListener('pointermove', function (e) {
    if (!drag) return;
    // mouse button was released outside the viewport — abandon the drag,
    // otherwise hovering back over the carousel would keep dragging it
    if (e.pointerType === 'mouse' && !(e.buttons & 1)) {
      if (drag.active) { track.classList.remove('is-dragging'); snapTo(current); }
      drag = null;
      return;
    }
    var dx = e.clientX - drag.x;
    var dy = e.clientY - drag.y;
    if (!drag.active) {
      // vertical intent → let the page scroll
      if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) { drag = null; return; }
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      drag.active = true;
      try { viewport.setPointerCapture(e.pointerId); } catch (err) {}
      track.classList.add('is-dragging');
    }
    e.preventDefault();
    // rubber-band when dragging past the first/last scene
    var atEdge = (current === 0 && dx > 0) || (current === SCENES - 1 && dx < 0);
    var offset = -current * viewportWidth() + (atEdge ? dx * 0.35 : dx);
    track.style.transform = 'translateX(' + offset + 'px)';
  });

  function endDrag(e) {
    if (!drag) return;
    var wasActive = drag.active;
    var dx = e.clientX - drag.x;
    var dt = Math.max(performance.now() - drag.t, 1);
    drag = null;
    if (!wasActive) return;
    track.classList.remove('is-dragging');
    var passedThreshold = Math.abs(dx) > viewportWidth() * 0.2 || Math.abs(dx) / dt > 0.5;
    var atEdge = (current === 0 && dx > 0) || (current === SCENES - 1 && dx < 0);
    if (passedThreshold && !atEdge) {
      setScene(dx < 0 ? current + 1 : current - 1);
    } else {
      snapTo(current); // snap back without restarting the running demo
    }
  }

  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', function () {
    if (drag && drag.active) {
      track.classList.remove('is-dragging');
      snapTo(current);
    }
    drag = null;
  });

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Shared helpers ───────────────────────────────────────────────── */

  function sleep(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function isInView() {
    var r = carousel.getBoundingClientRect();
    return r.bottom > 60 && r.top < window.innerHeight - 60 && r.width > 0;
  }

  function waitUntilVisible(stale) {
    return new Promise(function (resolve) {
      (function check() {
        if (stale()) return resolve();
        if (isInView() && !document.hidden) return resolve();
        setTimeout(check, 400);
      })();
    });
  }

  function money(n) {
    return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  var resetEpoch = 0; // bumped on every scene reset; kills in-flight counters

  function countTo(node, to, format) {
    var from = parseFloat(node.textContent.replace(/[$,]/g, ''));
    var steps = 8, i = 0, epoch = resetEpoch;
    return new Promise(function (resolve) {
      var iv = setInterval(function () {
        if (epoch !== resetEpoch) { clearInterval(iv); resolve(); return; }
        i++;
        var v = from + (to - from) * (i / steps);
        node.textContent = format ? format(v) : Math.round(v);
        if (i >= steps) { clearInterval(iv); resolve(); }
      }, 55);
    });
  }

  function flash(node) {
    node.classList.add('demo-flash');
    return sleep(1100).then(function () {
      node.classList.remove('demo-flash');
    });
  }

  /* Character-by-character typing into a field; onChar mirrors keystrokes. */
  function typeInto(node, text, stale, onChar) {
    node.classList.remove('is-placeholder');
    node.classList.add('is-typing');
    // keep trailing element children (carets, currency tags)
    var keep = [];
    for (var i = node.children.length - 1; i >= 0; i--) keep.unshift(node.children[i]);
    return (function loop(idx) {
      if (stale() || idx > text.length) {
        node.classList.remove('is-typing');
        return Promise.resolve();
      }
      var t = text.slice(0, idx);
      node.textContent = t;
      for (var k = 0; k < keep.length; k++) node.appendChild(keep[k]);
      if (onChar) onChar(t);
      return sleep(40).then(function () { return loop(idx + 1); });
    })(1);
  }

  /* Cursor movement scoped to a scene's dash card. */
  function makeCursor(cursorEl, rootEl) {
    return {
      show: function () { cursorEl.classList.add('is-visible'); },
      hide: function () { cursorEl.classList.remove('is-visible'); },
      jump: function (fx, fy) {
        var r = rootEl.getBoundingClientRect();
        cursorEl.style.transitionDuration = '0ms, 400ms';
        cursorEl.style.transform = 'translate(' + (r.width * fx) + 'px, ' + (r.height * fy) + 'px)';
        cursorEl.getBoundingClientRect(); // flush so the next move animates
      },
      moveTo: function (target, duration) {
        duration = duration || 800;
        var r = target.getBoundingClientRect();
        if (!r.width && !r.height) return sleep(60); // target hidden — skip the move
        var rootR = rootEl.getBoundingClientRect();
        var x = r.left - rootR.left + r.width / 2;
        var y = r.top - rootR.top + r.height / 2;
        x = Math.max(0, Math.min(x, rootR.width - 22));
        y = Math.max(0, Math.min(y, rootR.height - 22));
        cursorEl.style.transitionDuration = duration + 'ms, 400ms';
        cursorEl.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
        return sleep(duration + 100);
      },
      click: function (target) {
        cursorEl.classList.add('is-clicking');
        if (target) target.classList.add('demo-press');
        return sleep(200).then(function () {
          if (target) target.classList.remove('demo-press');
          return sleep(250);
        }).then(function () {
          cursorEl.classList.remove('is-clicking');
        });
      }
    };
  }

  /* ── Scene 1: live dashboard feed ─────────────────────────────────── */

  var s1 = {
    feed: document.getElementById('demo-feed'),
    valSubs: document.getElementById('demo-val-subs'),
    valMembers: document.getElementById('demo-val-members'),
    cardSubs: document.getElementById('demo-card-subs'),
    cardMembers: document.getElementById('demo-card-members'),
    cardProducts: document.getElementById('demo-card-products'),
    chipPaid: document.getElementById('demo-chip-paid'),
    paidCount: document.getElementById('demo-paid-count'),
    paidAmt: document.getElementById('demo-paid-amt'),
    chipOverdue: document.getElementById('demo-chip-overdue'),
    overdueCount: document.getElementById('demo-overdue-count'),
    overdueAmt: document.getElementById('demo-overdue-amt')
  };

  var s1Init = s1.feed && {
    subs: 146, members: 36,
    paidCount: 3, paidAmt: 177.00,
    overdueCount: 7, overdueAmt: 6515.99,
    feedHTML: s1.feed.innerHTML
  };

  function resetScene1() {
    if (!s1Init) return;
    s1.valSubs.textContent = s1Init.subs;
    s1.valMembers.textContent = s1Init.members;
    s1.paidCount.textContent = s1Init.paidCount;
    s1.paidAmt.textContent = money(s1Init.paidAmt);
    s1.overdueCount.textContent = s1Init.overdueCount;
    s1.overdueAmt.textContent = money(s1Init.overdueAmt);
    s1.feed.innerHTML = s1Init.feedHTML;
  }

  function feedPush(dotColor, text, amount) {
    var item = document.createElement('div');
    item.className = 'dash__feed-item is-entering';
    var dot = document.createElement('span');
    dot.className = 'dash__feed-dot';
    dot.style.background = dotColor;
    item.appendChild(dot);
    item.appendChild(document.createTextNode(text));
    if (amount) {
      var amt = document.createElement('span');
      amt.className = 'dash__feed-amt';
      amt.textContent = amount;
      item.appendChild(amt);
    }
    s1.feed.insertBefore(item, s1.feed.firstChild);
    var items = s1.feed.children;
    for (var i = 1; i < items.length; i++) items[i].classList.add('is-old');
    while (items.length > 3) s1.feed.removeChild(s1.feed.lastChild);
    item.getBoundingClientRect(); // flush so the entrance transition plays
    item.classList.remove('is-entering');
    return sleep(450);
  }

  async function playScene1(stale) {
    await waitUntilVisible(stale);
    if (stale()) return;
    await sleep(1600);
    if (stale()) return;

    await feedPush('#04D28F', 'New subscription — Premium Plan · $59/mo');
    countTo(s1.valSubs, s1Init.subs + 1);
    countTo(s1.valMembers, s1Init.members + 1);
    await Promise.all([flash(s1.cardSubs), flash(s1.cardMembers)]);
    await sleep(1400);
    if (stale()) return;

    await waitUntilVisible(stale);
    await feedPush('#276BEE', 'Payment captured — Visa ··XXXX', '+$59.00');
    countTo(s1.paidCount, s1Init.paidCount + 1);
    countTo(s1.paidAmt, s1Init.paidAmt + 59.00, money);
    await flash(s1.chipPaid);
    await sleep(1400);
    if (stale()) return;

    await waitUntilVisible(stale);
    await feedPush('#7B4DB5', 'Items swapped mid-cycle — subscription unchanged, no reset');
    await flash(s1.cardProducts);
    await sleep(1400);
    if (stale()) return;

    await waitUntilVisible(stale);
    await feedPush('#04D28F', 'Overdue invoice recovered', '+$89.99');
    countTo(s1.overdueCount, s1Init.overdueCount - 1);
    countTo(s1.overdueAmt, s1Init.overdueAmt - 89.99, money);
    countTo(s1.paidAmt, s1Init.paidAmt + 59.00 + 89.99, money);
    await Promise.all([flash(s1.chipOverdue), flash(s1.chipPaid)]);

    await sleep(3000);
  }

  /* ── Scene 2: create a product ────────────────────────────────────── */

  var s2root = document.getElementById('hero-demo2');
  var s2 = s2root && {
    form: document.getElementById('p-form'),
    catalog: document.getElementById('p-catalog'),
    name: document.getElementById('p-name'),
    category: document.getElementById('p-category'),
    planTitle: document.getElementById('p-plan-title'),
    planName: document.getElementById('p-plan-name'),
    chargeRow: document.getElementById('p-charge-row'),
    chargeName: document.getElementById('p-charge-name'),
    chargePrice: document.getElementById('p-charge-price'),
    chargeMenu: document.getElementById('p-charge-menu'),
    save: document.getElementById('p-save'),
    modal: document.getElementById('p-modal'),
    tabDetails: document.getElementById('p-tab-details'),
    tabPrice: document.getElementById('p-tab-price'),
    paneDetails: document.getElementById('p-pane-details'),
    panePrice: document.getElementById('p-pane-price'),
    modalName: document.getElementById('p-modal-name'),
    model: document.getElementById('p-model'),
    modelList: document.getElementById('p-model-list'),
    modelOpt: document.getElementById('p-model-opt'),
    amount: document.getElementById('p-amount'),
    modalSave: document.getElementById('p-modal-save'),
    newRow: document.getElementById('p-new-row'),
    toast: document.getElementById('p-toast'),
    cursorEl: document.getElementById('p-cursor')
  };

  var cur2 = s2 && makeCursor(s2.cursorEl, s2root);

  function setInput(node, text, placeholder) {
    var keep = [];
    for (var i = node.children.length - 1; i >= 0; i--) keep.unshift(node.children[i]);
    node.textContent = text;
    for (var k = 0; k < keep.length; k++) node.appendChild(keep[k]);
    node.classList.toggle('is-placeholder', !!placeholder);
    node.classList.remove('is-typing');
  }

  function resetScene2() {
    if (!s2) return;
    s2.form.hidden = false;
    s2.form.style.opacity = '';
    s2.catalog.hidden = true;
    s2.newRow.hidden = true;
    s2.newRow.classList.remove('is-new');
    s2.toast.hidden = true;
    s2.toast.classList.remove('is-visible');
    s2.modal.hidden = true;
    s2.modal.classList.remove('is-open');
    s2.modelList.hidden = true;
    s2.modelOpt.classList.remove('is-hover');
    s2.tabDetails.classList.add('is-active');
    s2.tabPrice.classList.remove('is-active');
    s2.paneDetails.hidden = false;
    s2.panePrice.hidden = true;
    setInput(s2.name, 'Sample Product Name', true);
    setInput(s2.category, 'Base Product');
    s2.planTitle.textContent = 'One Time Purchase';
    setInput(s2.planName, 'One Time Purchase');
    s2.chargeName.textContent = 'One Time Purchase';
    s2.chargePrice.textContent = '$0';
    setInput(s2.modalName, 'One Time Purchase');
    setInput(s2.amount, '0');
    s2.cursorEl.classList.remove('is-visible');
  }

  async function playScene2(stale) {
    await waitUntilVisible(stale);
    if (stale()) return;
    await sleep(250);
    if (stale()) return;

    cur2.jump(0.5, 0.6);
    cur2.show();

    // 1. Name the product, pick its category
    await cur2.moveTo(s2.name, 550);
    await cur2.click();
    if (stale()) return;
    await typeInto(s2.name, 'Pool Cleaning', stale);
    await sleep(250);
    await cur2.moveTo(s2.category);
    await cur2.click(s2.category.parentElement);
    if (stale()) return;
    setInput(s2.category, 'Service');
    await flash(s2.category.parentElement);
    await sleep(400);
    if (stale()) return;

    // 2. Rename the rate plan — the card title mirrors keystrokes live
    await cur2.moveTo(s2.planName);
    await cur2.click();
    if (stale()) return;
    await typeInto(s2.planName, 'Monthly Pool Cleaning', stale, function (t) {
      s2.planTitle.textContent = t;
    });
    await sleep(500);
    if (stale()) return;

    // 3. Open the charge, set the pricing
    await cur2.moveTo(s2.chargeMenu);
    await cur2.click(s2.chargeMenu);
    if (stale()) return;
    s2.modal.hidden = false;
    s2.modal.getBoundingClientRect();
    s2.modal.classList.add('is-open');
    await sleep(700);
    if (stale()) return;

    await cur2.moveTo(s2.modalName, 600);
    await cur2.click();
    if (stale()) return;
    await typeInto(s2.modalName, 'Monthly Pool Cleaning', stale, function (t) {
      s2.chargeName.textContent = t;
    });
    await sleep(350);
    if (stale()) return;

    await cur2.moveTo(s2.tabPrice, 600);
    await cur2.click(s2.tabPrice);
    if (stale()) return;
    s2.tabDetails.classList.remove('is-active');
    s2.tabPrice.classList.add('is-active');
    s2.paneDetails.hidden = true;
    s2.panePrice.hidden = false;
    await sleep(550);
    if (stale()) return;

    // The charge-model dropdown — show the real pricing models
    await cur2.moveTo(s2.model, 600);
    await cur2.click();
    if (stale()) return;
    s2.modelList.hidden = false;
    await sleep(450);
    await cur2.moveTo(s2.modelOpt, 500);
    s2.modelOpt.classList.add('is-hover');
    await sleep(300);
    await cur2.click(s2.modelOpt);
    if (stale()) return;
    s2.modelList.hidden = true;
    s2.modelOpt.classList.remove('is-hover');
    await sleep(300);

    await cur2.moveTo(s2.amount, 500);
    await cur2.click();
    if (stale()) return;
    await typeInto(s2.amount, '15', stale);
    await sleep(350);
    if (stale()) return;

    await cur2.moveTo(s2.modalSave, 600);
    await cur2.click(s2.modalSave);
    if (stale()) return;
    s2.modal.classList.remove('is-open');
    await sleep(320);
    s2.modal.hidden = true;
    s2.chargePrice.textContent = '$15.00';
    await flash(s2.chargeRow);
    await sleep(500);
    if (stale()) return;

    // 4. Save → product appears in the catalog
    await cur2.moveTo(s2.save, 700);
    await cur2.click(s2.save);
    if (stale()) return;
    cur2.hide();
    s2.form.style.opacity = '0';
    await sleep(380);
    s2.form.hidden = true;
    s2.catalog.hidden = false;
    await sleep(500);
    if (stale()) return;

    s2.newRow.hidden = false;
    s2.newRow.classList.add('is-entering', 'is-new');
    s2.newRow.getBoundingClientRect();
    s2.newRow.classList.remove('is-entering');
    s2.toast.hidden = false;
    s2.toast.getBoundingClientRect();
    s2.toast.classList.add('is-visible');

    await sleep(3400);
  }

  /* ── Scene 3: create a customer account ───────────────────────────── */

  var s3root = document.getElementById('hero-demo3');
  var s3 = s3root && {
    form: document.getElementById('a-form'),
    list: document.getElementById('a-list'),
    first: document.getElementById('a-first'),
    last: document.getElementById('a-last'),
    email: document.getElementById('a-email'),
    phone: document.getElementById('a-phone'),
    address: document.getElementById('a-address'),
    city: document.getElementById('a-city'),
    locale: document.getElementById('a-locale'),
    localeField: document.getElementById('a-locale-field'),
    currency: document.getElementById('a-currency'),
    currencyField: document.getElementById('a-currency-field'),
    create: document.getElementById('a-create'),
    manage: document.getElementById('a-manage'),
    menu: document.getElementById('a-manage-menu'),
    newAccount: document.getElementById('a-new-account'),
    count: document.getElementById('a-count'),
    newRow: document.getElementById('a-new-row'),
    toast: document.getElementById('a-toast'),
    cursorEl: document.getElementById('a-cursor')
  };

  var cur3 = s3 && makeCursor(s3.cursorEl, s3root);

  function resetScene3() {
    if (!s3) return;
    s3.list.hidden = false;
    s3.list.style.opacity = '';
    s3.form.hidden = true;
    s3.form.style.opacity = '';
    s3.menu.hidden = true;
    s3.newAccount.classList.remove('is-hover');
    s3.count.textContent = 'All Accounts (52)';
    s3.newRow.hidden = true;
    s3.newRow.classList.remove('is-new');
    s3.toast.hidden = true;
    s3.toast.classList.remove('is-visible');
    setInput(s3.first, 'First Name', true);
    setInput(s3.last, 'Last Name', true);
    setInput(s3.email, 'Email', true);
    setInput(s3.phone, 'Phone Number', true);
    setInput(s3.address, 'Address', true);
    setInput(s3.city, 'City / State / Zip', true);
    setInput(s3.locale, 'Select locale ', true);
    setInput(s3.currency, 'Select currency ', true);
    s3.cursorEl.classList.remove('is-visible');
  }

  async function playScene3(stale) {
    await waitUntilVisible(stale);
    if (stale()) return;
    await sleep(250);
    if (stale()) return;

    cur3.jump(0.5, 0.5);
    cur3.show();

    // 0. Accounts list → Manage Accounts → New Account (the real entry path)
    await cur3.moveTo(s3.manage, 600);
    await cur3.click(s3.manage);
    if (stale()) return;
    s3.menu.hidden = false;
    await sleep(420);
    await cur3.moveTo(s3.newAccount, 420);
    s3.newAccount.classList.add('is-hover');
    await sleep(260);
    await cur3.click(s3.newAccount);
    if (stale()) return;
    s3.menu.hidden = true;
    s3.newAccount.classList.remove('is-hover');
    s3.list.style.opacity = '0';
    await sleep(380);
    s3.list.hidden = true;
    s3.form.hidden = false;
    await sleep(450);
    if (stale()) return;

    // 1. Profile
    await cur3.moveTo(s3.first, 550);
    await cur3.click();
    if (stale()) return;
    await typeInto(s3.first, 'Sarah', stale);
    await cur3.moveTo(s3.last, 400);
    await cur3.click();
    if (stale()) return;
    await typeInto(s3.last, 'Mitchell', stale);
    await cur3.moveTo(s3.email, 450);
    await cur3.click();
    if (stale()) return;
    await typeInto(s3.email, 'sarah.mitchell@example.com', stale);
    await cur3.moveTo(s3.phone, 400);
    await cur3.click();
    if (stale()) return;
    await typeInto(s3.phone, '(503) 555-0142', stale);
    await sleep(250);
    if (stale()) return;

    // 2. Location
    await cur3.moveTo(s3.address, 500);
    await cur3.click();
    if (stale()) return;
    await typeInto(s3.address, '2814 Lakeview Dr', stale);
    await cur3.moveTo(s3.city, 400);
    await cur3.click();
    if (stale()) return;
    await typeInto(s3.city, 'Portland, OR 97211', stale);
    await sleep(250);
    if (stale()) return;

    // 3. Settings — locale and currency picks
    await cur3.moveTo(s3.locale, 500);
    await cur3.click(s3.localeField);
    if (stale()) return;
    setInput(s3.locale, 'English (US)');
    await flash(s3.localeField);
    await cur3.moveTo(s3.currency, 450);
    await cur3.click(s3.currencyField);
    if (stale()) return;
    setInput(s3.currency, 'USD ($)');
    await flash(s3.currencyField);
    await sleep(300);
    if (stale()) return;

    // 4. Create → account appears in the list
    await cur3.moveTo(s3.create, 650);
    await cur3.click(s3.create);
    if (stale()) return;
    cur3.hide();
    s3.form.style.opacity = '0';
    await sleep(380);
    s3.form.hidden = true;
    s3.list.hidden = false;
    s3.list.style.opacity = '';
    s3.count.textContent = 'All Accounts (53)';
    await sleep(500);
    if (stale()) return;

    s3.newRow.hidden = false;
    s3.newRow.classList.add('is-entering', 'is-new');
    s3.newRow.getBoundingClientRect();
    s3.newRow.classList.remove('is-entering');
    s3.toast.hidden = false;
    s3.toast.getBoundingClientRect();
    s3.toast.classList.add('is-visible');

    await sleep(3400);
  }

  /* ── Main loop: play active scene, then auto-advance ──────────────── */

  if (reducedMotion) return; // manual swipe still works; no animations

  var scenes = [
    { play: function (stale) { return sleep(20000); }, ok: true },  /* scene 1 is now the promo video iframe (promo/promo-all.html) */
    { play: function (stale) { return sleep(14000); }, ok: true },  /* scene 2 is now a self-animating iframe (customer-experience demo) */
    { play: playScene3, ok: !!s3 }
  ];

  for (var s = 0; s < scenes.length; s++) {
    if (!scenes[s].ok) return; // markup changed — bail quietly
  }

  function resetAllScenes() {
    resetEpoch++;
    resetScene1();
    resetScene2();
    resetScene3();
  }

  (async function run() {
    var errors = 0;
    while (true) {
      var stale = token();
      var idx = current;
      try {
        resetAllScenes(); // safe: no other play can be running here
        await scenes[idx].play(stale);
        errors = 0;
      } catch (e) {
        // recover: re-sync state and keep the loop alive (give up only if
        // errors repeat back-to-back, so a real fault can't spin forever)
        window.__heroDemoLastError = (e && (e.stack || e.message)) || String(e);
        errors++;
        if (errors > 5) return;
        setScene(idx);
        await sleep(1500);
        continue;
      }
      if (!stale()) {
        setScene(idx + 1);
      }
      await sleep(700);
    }
  })();
})();
