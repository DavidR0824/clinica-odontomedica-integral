/* ==========================================================================
   Clínica Odonto-Médica Integral — script.js
   Vanilla JS, sin dependencias. Cargado con defer.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- 0. Configuración ---------- */
  var WA_NUMBER = '50557915768'; // WhatsApp con código de país (Nicaragua = 505)
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Activa las animaciones de scroll solo si hay JS (sin JS todo queda visible)
  document.documentElement.classList.add('js');

  /* ---------- 1. Enlaces de WhatsApp con mensaje contextual ----------
     Cada enlace tiene href="https://wa.me/NUMERO" (funciona sin JS)
     y data-wa="mensaje". Aquí se agrega el texto prellenado codificado. */
  document.querySelectorAll('a[data-wa]').forEach(function (a) {
    var msg = (a.getAttribute('data-wa') || '').trim();
    a.href = 'https://wa.me/' + WA_NUMBER + (msg ? '?text=' + encodeURIComponent(msg) : '');
  });

  /* ---------- 2. Header: compacto al hacer scroll + barra móvil ---------- */
  var header = document.getElementById('header');
  var mobileBar = document.querySelector('.mobile-bar');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    header.classList.toggle('is-compact', y > 40);
    if (mobileBar) mobileBar.classList.toggle('is-visible', y > 420);
    updateStepsProgress();
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });

  /* ---------- 3. Menú hamburguesa (accesible) ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    nav.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () {
    setMenu(burger.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); burger.focus(); }
  });
  window.addEventListener('resize', function () { if (window.innerWidth >= 1120) setMenu(false); });

  /* ---------- 4. Scroll reveal con IntersectionObserver ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- 5. Contadores animados ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var format = function (n) { return n.toFixed(decimals).replace('.', ','); };
    if (reduceMotion) { el.textContent = format(target); return; }
    var duration = 1400, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(target * eased);
      if (p < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animateCount(entry.target); co.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* ---------- 6. Línea de progreso de los pasos ---------- */
  var steps = document.getElementById('steps');
  var progress = document.getElementById('stepsProgress');
  function updateStepsProgress() {
    if (!steps || !progress || reduceMotion) return;
    var r = steps.getBoundingClientRect();
    var vh = window.innerHeight;
    // 0 cuando la sección entra por abajo, 1 cuando su final llega al 60% de la pantalla
    var p = (vh * 0.85 - r.top) / (r.height + vh * 0.25);
    p = Math.max(0, Math.min(1, p));
    var vertical = window.innerWidth < 900;
    progress.style.transform = vertical ? 'scaleY(' + p + ')' : 'scaleX(' + p + ')';
  }

  /* ---------- 7. FAQ: acordeón accesible ---------- */
  document.querySelectorAll('.faq__q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
    });
  });

  /* ---------- 8. Widget de reseñas estilo Google ---------- */
  // 8.1 Fechas relativas ("hace 2 semanas") calculadas desde datetime,
  //     así no quedan desactualizadas con el tiempo.
  function relDate(iso) {
    var days = Math.floor((Date.now() - new Date(iso + 'T12:00:00').getTime()) / 864e5);
    if (isNaN(days) || days < 0) return null;
    if (days < 1) return 'hoy';
    if (days < 7) return days === 1 ? 'hace 1 día' : 'hace ' + days + ' días';
    if (days < 30) { var w = Math.floor(days / 7); return w === 1 ? 'hace 1 semana' : 'hace ' + w + ' semanas'; }
    if (days < 365) { var m = Math.floor(days / 30); return m === 1 ? 'hace un mes' : 'hace ' + m + ' meses'; }
    var y = Math.floor(days / 365); return y === 1 ? 'hace un año' : 'hace ' + y + ' años';
  }
  document.querySelectorAll('time[data-rel]').forEach(function (t) {
    var txt = relDate(t.getAttribute('datetime'));
    if (txt) t.textContent = txt;
  });
  // La etiqueta "NUEVA" solo se muestra si la reseña tiene menos de 30 días
  document.querySelectorAll('.gw__card').forEach(function (card) {
    var t = card.querySelector('time[datetime]'), badge = card.querySelector('.gw__new');
    if (t && badge && (Date.now() - new Date(t.getAttribute('datetime')).getTime()) / 864e5 > 30) badge.remove();
  });

  // 8.2 "Leer más": recorta el texto largo y lo expande al hacer clic
  document.querySelectorAll('.gw__text').forEach(function (text) {
    var btn = text.parentNode.querySelector('.gw__more');
    if (!btn) return;
    text.classList.add('is-clamped');
    if (text.scrollHeight - text.clientHeight < 4) { text.classList.remove('is-clamped'); return; }
    btn.hidden = false;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      text.classList.toggle('is-clamped', open);
      btn.setAttribute('aria-expanded', String(!open));
      btn.textContent = open ? 'Leer más' : 'Leer menos';
    });
  });

  // 8.3 Carrusel: flechas + puntos + teclado (sin librerías, usa scroll-snap nativo)
  var track = document.getElementById('gwTrack');
  if (track) {
    var prev = document.querySelector('.gw__nav--prev');
    var next = document.querySelector('.gw__nav--next');
    var dotsWrap = document.querySelector('.gw__dots');
    var cards = track.children;
    var dots = [];
    for (var i = 0; i < cards.length; i++) { var d = document.createElement('span'); dotsWrap.appendChild(d); dots.push(d); }

    var cardStep = function () { return cards[0].getBoundingClientRect().width + 16; };
    var scrollByCards = function (n) { track.scrollBy({ left: n * cardStep(), behavior: reduceMotion ? 'auto' : 'smooth' }); };

    prev.hidden = next.hidden = false;
    prev.addEventListener('click', function () { scrollByCards(-1); });
    next.addEventListener('click', function () { scrollByCards(1); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); scrollByCards(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); scrollByCards(-1); }
    });

    var syncCarousel = function () {
      var max = track.scrollWidth - track.clientWidth;
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft > max - 4;
      var idx = Math.round(track.scrollLeft / cardStep());
      dots.forEach(function (dot, n) { dot.classList.toggle('is-active', n === idx); });
      // Oculta los puntos que ya caben en pantalla (no hay a dónde desplazarse)
      var visible = Math.max(1, Math.round(track.clientWidth / cardStep()));
      dots.forEach(function (dot, n) { dot.hidden = n > cards.length - visible; });
    };
    var raf = null;
    track.addEventListener('scroll', function () {
      if (raf) return;
      raf = window.requestAnimationFrame(function () { raf = null; syncCarousel(); });
    }, { passive: true });
    window.addEventListener('resize', syncCarousel);
    syncCarousel();
  }

  /* ---------- 9. Año dinámico en el footer ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Estado inicial
  onScroll();
})();
