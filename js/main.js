(function () {
  'use strict';

  var doc = document.documentElement;
  doc.classList.add('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile menu
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
      }
    });
  }

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // US-03: count up to the real value. The final value is already in the HTML,
  // so if this never runs the number is still correct.
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target) || reduceMotion) return;
    var duration = 1200;
    var start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      // Count up from half the real value, so a "0" is never shown
      el.textContent = Math.round(target / 2 + (target / 2) * eased) + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(frame);
    // rAF pauses in background tabs; never leave a counter part-way
    setTimeout(function () { el.textContent = target + suffix; }, duration + 300);
  }

  var counters = document.querySelectorAll('[data-count]');
  var reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    // Counters already on screen at load keep their final value (no layout churn during
    // page load); the rest count up when they scroll into view.
    var firstReport = true;
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          if (!firstReport) animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
      firstReport = false;
    }, { threshold: 0.5 });
    counters.forEach(function (el) { countObserver.observe(el); });

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  // Scroll story: highlight the step in view, and load the 3D scene when the reader nears it
  var story = document.getElementById('story');
  var visual = document.querySelector('.story-visual');
  if (story && 'IntersectionObserver' in window) {
    var stepObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { entry.target.classList.toggle('is-active', entry.isIntersecting); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    story.querySelectorAll('.story-step').forEach(function (el) { stepObserver.observe(el); });
  }
  if (story && visual) {
    var loadScene = function () {
      import('/js/scene.js')
        .then(function (mod) { mod.initScene(visual, story); })
        .catch(function () { visual.classList.add('no-webgl'); });
    };
    // WebGL start-up is the heaviest thing on the page, so it waits for the visitor's first
    // scroll, tap or keypress; the story section is a screen below the hero, so it's ready in time.
    var armed = false;
    var arm = function () {
      if (armed) return;
      armed = true;
      ['scroll', 'pointerdown', 'keydown', 'touchstart'].forEach(function (t) { window.removeEventListener(t, arm); });
      if ('IntersectionObserver' in window) {
        var sceneObserver = new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) {
            sceneObserver.disconnect();
            loadScene();
          }
        }, { rootMargin: '600px 0px' });
        sceneObserver.observe(story);
      } else {
        loadScene();
      }
    };
    ['scroll', 'pointerdown', 'keydown', 'touchstart'].forEach(function (t) { window.addEventListener(t, arm, { passive: true }); });
    // Already scrolled (e.g. reload mid-page or a #link): start straight away
    if (window.scrollY > 0 || location.hash) arm();
  }

  // US-08 / US-14: recruiter vs client path. Hiring hides the budget field.
  var form = document.getElementById('contact-form');
  var budgetField = document.getElementById('budget-field');
  var budget = document.getElementById('budget');
  var messageLabel = document.getElementById('message-label');

  function setIntent(intent) {
    if (!form) return;
    var hiring = intent === 'hiring';
    var radio = document.getElementById(hiring ? 'intent-hiring' : 'intent-project');
    if (radio) radio.checked = true;
    if (budgetField) budgetField.hidden = hiring;
    if (hiring && budget) budget.value = '';
    if (messageLabel) messageLabel.textContent = hiring ? 'About the role' : 'Project details';
  }

  if (form) {
    form.addEventListener('change', function (e) {
      if (e.target.name === 'intent') setIntent(e.target.id === 'intent-hiring' ? 'hiring' : 'project');
    });
  }
  document.querySelectorAll('[data-intent]').forEach(function (el) {
    el.addEventListener('click', function () { setIntent(el.getAttribute('data-intent')); });
  });
  var params = new URLSearchParams(window.location.search);
  if (params.get('intent') === 'hiring') setIntent('hiring');

  // US-15: named events for the hero paths
  document.querySelectorAll('.audience [data-intent]').forEach(function (el) {
    el.addEventListener('click', function () {
      window.plausible(el.getAttribute('data-intent') === 'hiring' ? 'Recruiter Path' : 'Client Path');
    });
  });

  // US-14: submit to Netlify Forms without leaving the page, show confirmation.
  if (form) {
    var status = form.querySelector('.form-status');
    var submit = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submit.disabled = true;
      submit.textContent = 'Sending…';
      var body = new URLSearchParams(new FormData(form)).toString();
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body
      }).then(function (res) {
        if (!res.ok) throw new Error(res.status);
        status.className = 'form-status success';
        status.textContent = 'Thanks! Your message has been sent. I\'ll reply within 24 hours.';
        status.hidden = false;
        window.plausible('Contact Form Submit', { props: { intent: form.intent.value } });
        form.reset();
        setIntent('project');
      }).catch(function () {
        status.className = 'form-status error';
        status.innerHTML = 'Sorry, that didn\'t send. Please email <a href="mailto:talhaather.freelance@gmail.com">talhaather.freelance@gmail.com</a> instead.';
        status.hidden = false;
      }).finally(function () {
        submit.disabled = false;
        submit.textContent = 'Send message';
      });
    });
  }
})();
