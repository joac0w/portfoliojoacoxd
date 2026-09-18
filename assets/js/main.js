/* =========================================================
   Joaco XD — Portfolio
   Galería infinita, visor a pantalla completa y parallax
   ========================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none)').matches;
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  // PRNG con semilla: el orden de las miniaturas cambia por columna pero es estable
  var rng = function (seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  };
  var shuffled = function (arr, seed) {
    var a = arr.slice(), r = rng(seed);
    for (var i = a.length - 1; i > 0; i--) {
      var k = Math.floor(r() * (i + 1));
      var tmp = a[i]; a[i] = a[k]; a[k] = tmp;
    }
    return a;
  };

  /* ---------------- Piezas ---------------- */
  // s: archivo · t: título · c: canal · cat: filtro
  var MEDIA = [
    { s: 'goncho-f1', t: 'Pole position', c: 'Goncho Banzas', cat: 'irl' },
    { s: 'pokemon-chatgpt', t: 'ChatGPT arma mi equipo', c: 'Pokémon Emerald', cat: 'faceless' },
    { s: 'bauti-quien-es-quien', t: 'Quién es quién', c: 'Bauti Agnone', cat: 'irl' },
    { s: 'dlorean-mercadona', t: 'DeLorean en Mercadona', c: 'Dlorean', cat: 'irl' },
    { s: 'crilon-02', t: 'OXXO en CDMX', c: 'El Crilón', cat: 'irl' },
    { s: 'alan-03', t: 'Tétrico', c: 'Alan Villalva', cat: 'faceless' },
    { s: 'alan-04', t: 'Detalles de Manhunt', c: 'Alan Villalva', cat: 'faceless' },
    { s: 'alan-05', t: 'Dark Souls III', c: 'Alan Villalva', cat: 'faceless' },
    { s: 'alan-06', t: '5 detalles de Fallout 3', c: 'Alan Villalva', cat: 'faceless' },
    { s: 'alan-07', t: 'Los 82 de PlayStation 2', c: 'Alan Villalva', cat: 'faceless' },
    { s: 'alan-08', t: 'GTA IV filtrado', c: 'Alan Villalva', cat: 'faceless' }
  ];
  var thumbOf = function (i) { return 'assets/thumbs/' + MEDIA[i].s + '.webp'; };
  var fullOf = function (i) { return 'assets/full/' + MEDIA[i].s + '.webp'; };
  var INDEXES = MEDIA.map(function (_, i) { return i; });

  // Clientes del carrusel.
  // Los números son de ejemplo: cambialos por los reales, y si ponés una foto en
  // assets/clients/<archivo>.webp, sumá su ruta en "img" y reemplaza a la inicial.
  var CLIENTS = [
    { n: 'Alan Villalva', s: '320K', img: '' },
    { n: 'Goncho Banzas', s: '180K', img: '' },
    { n: 'Bauti Agnone', s: '95K', img: '' },
    { n: 'Dlorean', s: '240K', img: '' },
    { n: 'El Crilón', s: '150K', img: '' },
    { n: 'Sumá tu canal', s: 'Quedan lugares este mes', slot: true },
    { n: 'Tu próximo video', s: 'Escribime y lo armamos', slot: true }
  ];

  var TICKER_WORDS = ['Miniaturas', 'Branding de canal', 'Packaging de video', 'Tests A/B', 'Retoque', 'Dirección de arte'];

  /* ---------------- Preloader ---------------- */
  var pre = document.getElementById('preloader');
  var preBar = document.getElementById('preBar');
  var preNum = document.getElementById('preNum');
  var progress = 0;
  var preTimer = setInterval(function () {
    progress = Math.min(97, progress + Math.random() * 14);
    preBar.style.width = progress + '%';
    preNum.textContent = Math.round(progress);
  }, 120);

  function finishPreloader() {
    clearInterval(preTimer);
    preBar.style.width = '100%';
    preNum.textContent = '100';
    setTimeout(function () {
      pre.classList.add('is-done');
      document.body.classList.remove('is-locked');
    }, 320);
  }
  document.body.classList.add('is-locked');
  window.addEventListener('load', function () { setTimeout(finishPreloader, 420); });
  setTimeout(finishPreloader, 4200); // red lenta: nunca bloquear

  /* ---------------- Cursor ---------------- */
  if (!isTouch) {
    var cur = document.getElementById('cursor');
    var dot = document.getElementById('cursorDot');
    var cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;

    window.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      cur.classList.add('is-on'); dot.classList.add('is-on');
      dot.style.transform = 'translate(' + (tx - 2.5) + 'px,' + (ty - 2.5) + 'px)';
    });
    (function follow() {
      cx = lerp(cx, tx, 0.16); cy = lerp(cy, ty, 0.16);
      cur.style.transform = 'translate(' + (cx - 17) + 'px,' + (cy - 17) + 'px)';
      requestAnimationFrame(follow);
    })();

    document.addEventListener('mouseover', function (e) {
      var hit = e.target.closest('a,button,.gthumb,.tile,.acc__head,input,textarea');
      cur.classList.toggle('is-hover', !!hit);
    });
  }

  /* ---------------- Galería infinita ---------------- */
  var galleryCols = document.getElementById('galleryCols');
  var columns = [];

  function buildGallery() {
    galleryCols.innerHTML = '';
    columns = [];

    var count = innerWidth <= 760 ? 3 : (innerWidth <= 1080 ? 4 : 5);
    galleryCols.style.gridTemplateColumns = 'repeat(' + count + ',1fr)';

    // La altura del contenedor manda: cada columna necesita suficientes
    // miniaturas para cubrirlo dos veces y que el loop no deje huecos.
    var gap = parseFloat(getComputedStyle(galleryCols).rowGap) || 16;
    var boxW = galleryCols.offsetWidth || innerWidth;
    var boxH = galleryCols.offsetHeight || innerHeight;
    var colW = (boxW - gap * (count - 1)) / count;
    var tileH = colW * 9 / 16 + gap;
    var perCol = clamp(Math.ceil((boxH + tileH * 2) / tileH), 5, 14);

    for (var c = 0; c < count; c++) {
      var col = document.createElement('div');
      col.className = 'gcol';
      var inner = document.createElement('div');
      inner.className = 'gcol__inner';

      var pool = shuffled(INDEXES, 1337 + c * 101);

      // duplicado para el loop infinito
      for (var pass = 0; pass < 2; pass++) {
        for (var k = 0; k < perCol; k++) {
          var idx = pool[k % pool.length];
          var fig = document.createElement('div');
          fig.className = 'gthumb';
          fig.dataset.i = idx;
          fig.setAttribute('role', 'button');
          fig.setAttribute('tabindex', '0');
          fig.setAttribute('aria-label', 'Ver ' + MEDIA[idx].t + ' en grande');
          var img = document.createElement('img');
          img.src = thumbOf(idx);
          img.alt = MEDIA[idx].t + ' — ' + MEDIA[idx].c;
          img.decoding = 'async';
          img.draggable = false;
          fig.appendChild(img);
          inner.appendChild(fig);
        }
      }

      col.appendChild(inner);
      galleryCols.appendChild(col);

      columns.push({
        el: inner,
        dir: c % 2 === 0 ? -1 : 1,        // columnas alternadas
        speed: 16 + (c % 3) * 8,          // px por segundo
        seed: Math.random() * tileH * perCol,
        offset: 0,
        loop: 0
      });
    }
    measureGallery();
  }

  function measureGallery() {
    columns.forEach(function (c) {
      var loop = c.el.scrollHeight / 2;
      if (!loop) return;
      c.loop = loop;
      c.offset = c.seed % loop;
    });
  }

  buildGallery();
  window.addEventListener('resize', function () {
    clearTimeout(window.__rz);
    window.__rz = setTimeout(function () { buildGallery(); buildTicker(); }, 220);
  });
  window.addEventListener('load', measureGallery);

  /* ---------------- Ticker (nunca queda vacío) ---------------- */
  var tickerTrack = document.getElementById('tickerTrack');
  var tickerRow = { el: tickerTrack, dir: -1, speed: 42, offset: 0, loop: 0 };

  function tickerUnit() {
    var frag = document.createDocumentFragment();
    TICKER_WORDS.forEach(function (w) {
      var s = document.createElement('span');
      s.textContent = w;
      var i = document.createElement('i');
      i.textContent = '✦';
      frag.appendChild(s);
      frag.appendChild(i);
    });
    return frag;
  }

  function buildTicker() {
    tickerTrack.innerHTML = '';
    tickerTrack.appendChild(tickerUnit());
    var unitW = tickerTrack.scrollWidth || innerWidth;
    // una "copia" tiene que ser más ancha que la pantalla; después van tres copias
    var reps = Math.max(1, Math.ceil((innerWidth + 260) / unitW));
    var total = reps * 3;
    for (var k = 1; k < total; k++) tickerTrack.appendChild(tickerUnit());
    tickerRow.loop = tickerTrack.scrollWidth / 3;
    tickerRow.offset = 0;
  }
  buildTicker();
  window.addEventListener('load', buildTicker);

  // filas horizontales que mueve el bucle principal (hoy sólo la cinta)
  var rows = [tickerRow];

  /* ---------------- Carrusel de clientes ---------------- */
  var rail = document.getElementById('clientRail');
  var railPrev = document.getElementById('railPrev');
  var railNext = document.getElementById('railNext');

  CLIENTS.forEach(function (cl) {
    var card = document.createElement('article');
    card.className = 'client' + (cl.slot ? ' is-slot' : '');
    var pic = cl.img
      ? '<img src="' + cl.img + '" alt="' + cl.n + '" loading="lazy" decoding="async" />'
      : (cl.slot ? '+' : cl.n.charAt(0));
    card.innerHTML =
      '<span class="client__pic">' + pic + '</span>' +
      '<span class="client__txt">' +
      '<span class="client__name">' + cl.n + '</span>' +
      '<span class="client__subs">' + (cl.slot ? cl.s : '<b>' + cl.s + '</b> suscriptores') + '</span>' +
      '</span>';
    rail.appendChild(card);
  });

  function railStep() {
    var card = rail.querySelector('.client');
    if (!card) return 320;
    return card.getBoundingClientRect().width + 16;
  }
  function railState() {
    railPrev.disabled = rail.scrollLeft < 8;
    railNext.disabled = rail.scrollLeft > rail.scrollWidth - rail.clientWidth - 8;
  }
  railPrev.addEventListener('click', function () { rail.scrollBy({ left: -railStep(), behavior: 'smooth' }); });
  railNext.addEventListener('click', function () { rail.scrollBy({ left: railStep(), behavior: 'smooth' }); });
  rail.addEventListener('scroll', railState, { passive: true });
  window.addEventListener('resize', railState);
  railState();

  /* ---------------- Proyectos ---------------- */
  var grid = document.getElementById('projectGrid');
  MEDIA.forEach(function (m, i) {
    var tile = document.createElement('article');
    tile.className = 'tile reveal';
    tile.dataset.cat = m.cat;
    tile.dataset.i = i;
    tile.setAttribute('role', 'button');
    tile.setAttribute('tabindex', '0');
    tile.innerHTML =
      '<img src="' + thumbOf(i) + '" alt="' + m.t + ' — ' + m.c + '" loading="lazy" decoding="async" draggable="false" />' +
      '<span class="tile__shine" aria-hidden="true"></span>' +
      '<div class="tile__meta"><h3>' + m.t + '</h3><span>' + (m.cat === 'irl' ? 'IRL' : 'Faceless') + ' · ' + m.c + '</span></div>';
    grid.appendChild(tile);
  });

  var chips = document.querySelectorAll('.chip:not(.is-soon)');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('is-active'); c.setAttribute('aria-selected', 'false'); });
      chip.classList.add('is-active');
      chip.setAttribute('aria-selected', 'true');
      var f = chip.dataset.filter;
      document.querySelectorAll('.tile').forEach(function (t) {
        t.classList.toggle('is-hidden', !(f === 'todas' || t.dataset.cat === f));
      });
    });
  });

  /* ---------------- Visor a pantalla completa ---------------- */
  var lb = document.getElementById('lightbox');
  var lbFrame = document.getElementById('lbFrame');
  var lbImg = document.getElementById('lbImg');
  var lbCaption = document.getElementById('lbCaption');
  var lbGlow = document.getElementById('lbGlow');
  var flash = document.getElementById('flash');
  var current = -1;
  var sourceEl = null;
  var tilt = { x: 0, y: 0, tx: 0, ty: 0, active: false };

  function flashAt(x, y) {
    flash.classList.remove('is-on');
    flash.style.left = (x - 5) + 'px';
    flash.style.top = (y - 5) + 'px';
    void flash.offsetWidth; // reinicia la animación
    flash.classList.add('is-on');
  }

  function rushBlur() {
    lbFrame.classList.remove('is-rush');
    void lbFrame.offsetWidth;
    lbFrame.classList.add('is-rush');
  }

  function fillLb(i) {
    var m = MEDIA[i];
    lbImg.src = fullOf(i);
    lbImg.alt = m.t + ' — ' + m.c;
    lbCaption.innerHTML = '<b>' + m.t + '</b><i>' + m.c + '</i>';
    lbGlow.style.backgroundImage = 'url(' + thumbOf(i) + ')';
  }

  function openLb(i, el, px, py) {
    if (current === i && lb.classList.contains('is-open')) return;
    current = i;
    sourceEl = el || null;
    fillLb(i);

    var rect = el ? el.getBoundingClientRect() : null;
    flashAt(px != null ? px : (rect ? rect.left + rect.width / 2 : innerWidth / 2),
            py != null ? py : (rect ? rect.top + rect.height / 2 : innerHeight / 2));

    var sbw = innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = sbw > 0 ? sbw + 'px' : '';
    document.body.classList.add('is-locked');

    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    tilt.x = tilt.y = tilt.tx = tilt.ty = 0;
    tilt.active = false;

    // FLIP: arranca en la posición de la miniatura y vuela al centro
    var to = lbFrame.getBoundingClientRect();
    if (rect && to.width && !reduced) {
      var sx = rect.width / to.width;
      var sy = rect.height / to.height;
      var dx = (rect.left + rect.width / 2) - (to.left + to.width / 2);
      var dy = (rect.top + rect.height / 2) - (to.top + to.height / 2);
      lbFrame.style.transition = 'none';
      lbFrame.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')';
      void lbFrame.offsetWidth;
      lbFrame.style.transition = 'transform .74s cubic-bezier(.16,1,.3,1)';
      lbFrame.style.transform = 'translate(0,0) scale(1)';
      rushBlur();
    } else {
      lbFrame.style.transition = 'none';
      lbFrame.style.transform = 'scale(.92)';
      void lbFrame.offsetWidth;
      lbFrame.style.transition = 'transform .5s var(--ease)';
      lbFrame.style.transform = 'scale(1)';
    }
    setTimeout(function () { tilt.active = true; }, 760);
    document.getElementById('lbClose').focus({ preventScroll: true });
  }

  function closeLb() {
    if (!lb.classList.contains('is-open')) return;
    tilt.active = false;
    var rect = sourceEl ? sourceEl.getBoundingClientRect() : null;
    var to = lbFrame.getBoundingClientRect();
    var visible = rect && rect.width > 0 && rect.bottom > 0 && rect.top < innerHeight;

    if (visible && !reduced) {
      var sx = rect.width / to.width;
      var sy = rect.height / to.height;
      var dx = (rect.left + rect.width / 2) - (to.left + to.width / 2);
      var dy = (rect.top + rect.height / 2) - (to.top + to.height / 2);
      lbFrame.style.transition = 'transform .6s cubic-bezier(.4,0,.2,1)';
      lbFrame.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')';
      rushBlur();
    } else {
      lbFrame.style.transition = 'transform .45s var(--ease)';
      lbFrame.style.transform = 'scale(.9)';
    }

    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    document.body.style.paddingRight = '';
    current = -1;
  }

  function stepLb(dir) {
    if (current < 0) return;
    var next = (current + dir + MEDIA.length) % MEDIA.length;
    current = next;
    tilt.active = false;
    tilt.x = tilt.y = tilt.tx = tilt.ty = 0;
    sourceEl = document.querySelector('.tile[data-i="' + next + '"]') || sourceEl;
    lbFrame.style.transition = 'transform .28s var(--ease)';
    lbFrame.style.transform = 'translateX(' + (dir * -40) + 'px) scale(.97)';
    rushBlur();
    setTimeout(function () {
      fillLb(next);
      lbFrame.style.transition = 'none';
      lbFrame.style.transform = 'translateX(' + (dir * 40) + 'px) scale(.97)';
      void lbFrame.offsetWidth;
      lbFrame.style.transition = 'transform .45s var(--ease)';
      lbFrame.style.transform = 'translateX(0) scale(1)';
      setTimeout(function () { tilt.active = true; }, 460);
    }, 240);
  }

  function onThumbActivate(e) {
    var el = e.target.closest ? e.target.closest('.gthumb,.tile') : null;
    // Las columnas viven en una capa 3D animada: a veces el click cae en el
    // contenedor, así que buscamos la pieza por coordenadas como respaldo.
    if (!el && e.clientX != null && document.elementsFromPoint) {
      var stack = document.elementsFromPoint(e.clientX, e.clientY);
      for (var s = 0; s < stack.length; s++) {
        var hit = stack[s].closest && stack[s].closest('.gthumb,.tile');
        if (hit) { el = hit; break; }
      }
    }
    if (!el || !lb) return;
    var i = parseInt(el.dataset.i, 10);
    if (isNaN(i)) return;
    e.preventDefault();
    openLb(i, el, e.clientX, e.clientY);
  }
  document.addEventListener('click', onThumbActivate);
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && document.activeElement &&
        document.activeElement.matches('.gthumb,.tile')) {
      onThumbActivate({ target: document.activeElement, preventDefault: function () { e.preventDefault(); } });
    }
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowRight') stepLb(1);
    if (e.key === 'ArrowLeft') stepLb(-1);
  });

  document.getElementById('lbClose').addEventListener('click', closeLb);
  document.getElementById('lbNext').addEventListener('click', function () { stepLb(1); });
  document.getElementById('lbPrev').addEventListener('click', function () { stepLb(-1); });
  lb.querySelector('[data-close]').addEventListener('click', closeLb);

  // parallax 3D: la pieza levita y sigue el mouse
  lb.addEventListener('mousemove', function (e) {
    if (!tilt.active) return;
    tilt.tx = ((e.clientY / innerHeight) - 0.5) * -12;
    tilt.ty = ((e.clientX / innerWidth) - 0.5) * 16;
  });
  lb.addEventListener('mouseleave', function () { tilt.tx = 0; tilt.ty = 0; });

  /* ---------------- Reveal ---------------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('.reveal').forEach(function (el, idx) {
    el.style.transitionDelay = (idx % 4) * 70 + 'ms';
    io.observe(el);
  });

  /* ---------------- Nav ---------------- */
  var nav = document.getElementById('nav');
  var burger = document.getElementById('burger');
  var navLinks = document.getElementById('navLinks');
  var lastY = 0;

  burger.addEventListener('click', function () {
    var open = navLinks.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
  });
  navLinks.addEventListener('click', function (e) {
    if (e.target.closest('a')) {
      navLinks.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });

  var navIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      document.querySelectorAll('.nav__links a').forEach(function (a) {
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id);
      });
    });
  }, { threshold: 0.35 });
  ['proyectos', 'clientes', 'contacto'].forEach(function (id) {
    var s = document.getElementById(id);
    if (s) navIO.observe(s);
  });

  /* ---------------- Acordeón ---------------- */
  document.querySelectorAll('.acc__item').forEach(function (item) {
    var head = item.querySelector('.acc__head');
    var body = item.querySelector('.acc__body');
    head.addEventListener('click', function () {
      var open = item.classList.contains('is-open');
      document.querySelectorAll('.acc__item').forEach(function (other) {
        other.classList.remove('is-open');
        other.querySelector('.acc__body').style.maxHeight = null;
        other.querySelector('.acc__head').setAttribute('aria-expanded', 'false');
      });
      if (!open) {
        item.classList.add('is-open');
        body.style.maxHeight = body.scrollHeight + 'px';
        head.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------------- Embudo de contacto ---------------- */
  var funnel = document.getElementById('funnel');
  var fBar = document.getElementById('funnelBar');
  var fSteps = document.getElementById('funnelSteps').children;
  var fPrev = document.getElementById('fPrev');
  var fNext = document.getElementById('fNext');
  var fHint = document.getElementById('funnelHint');
  var panels = funnel.querySelectorAll('.panel');

  var pick = { servicio: [], volumen: '', nicho: '', fecha: null, hora: '' };
  var step = 1;

  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
    'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var SLOTS = ['09:00', '10:00', '11:00', '12:00', '15:00', '16:00', '17:00', '18:00'];

  // --- opciones (chips)
  funnel.querySelectorAll('.opts').forEach(function (group) {
    var key = group.dataset.group;
    var multi = group.dataset.multi === '1';
    group.querySelectorAll('.opt').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (multi) {
          btn.classList.toggle('is-on');
          var list = pick[key];
          var v = btn.dataset.value;
          var at = list.indexOf(v);
          if (at >= 0) list.splice(at, 1); else list.push(v);
        } else {
          group.querySelectorAll('.opt').forEach(function (o) { o.classList.remove('is-on'); });
          btn.classList.add('is-on');
          pick[key] = btn.dataset.value;
        }
        fHint.textContent = '';
      });
    });
  });

  // --- calendario
  var calGrid = document.getElementById('calGrid');
  var calMonth = document.getElementById('calMonth');
  var slotList = document.getElementById('slotList');
  var slotTitle = document.getElementById('slotTitle');
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var view = new Date(today.getFullYear(), today.getMonth(), 1);

  function sameDay(a, b) {
    return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function renderCal() {
    calMonth.textContent = MESES[view.getMonth()] + ' ' + view.getFullYear();
    document.getElementById('calPrev').disabled =
      view.getFullYear() === today.getFullYear() && view.getMonth() === today.getMonth();

    calGrid.innerHTML = '';
    var first = new Date(view.getFullYear(), view.getMonth(), 1);
    var offset = (first.getDay() + 6) % 7;            // lunes primero
    var days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();

    for (var k = 0; k < offset; k++) {
      var hole = document.createElement('span');
      hole.className = 'cal__day is-empty';
      calGrid.appendChild(hole);
    }
    for (var d = 1; d <= days; d++) {
      var date = new Date(view.getFullYear(), view.getMonth(), d);
      var weekend = date.getDay() === 0 || date.getDay() === 6;
      var past = date < today;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cal__day' + (sameDay(date, pick.fecha) ? ' is-sel' : '');
      btn.textContent = d;
      btn.disabled = weekend || past;
      btn.dataset.d = date.toISOString();
      calGrid.appendChild(btn);
    }
  }

  function fechaLarga(d) {
    var dow = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][d.getDay()];
    return dow + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()];
  }

  function renderSlots() {
    slotList.innerHTML = '';
    if (!pick.fecha) {
      slotTitle.textContent = 'Elegí un día para ver los horarios';
      return;
    }
    slotTitle.textContent = 'Horarios del ' + fechaLarga(pick.fecha);
    SLOTS.forEach(function (h) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'slot' + (pick.hora === h ? ' is-on' : '');
      b.textContent = h;
      b.addEventListener('click', function () {
        pick.hora = h;
        renderSlots();
        fHint.textContent = '';
      });
      slotList.appendChild(b);
    });
  }

  calGrid.addEventListener('click', function (e) {
    var b = e.target.closest('.cal__day');
    if (!b || b.disabled || !b.dataset.d) return;
    pick.fecha = new Date(b.dataset.d);
    pick.hora = '';
    renderCal();
    renderSlots();
    fHint.textContent = '';
  });
  document.getElementById('calPrev').addEventListener('click', function () {
    view.setMonth(view.getMonth() - 1); renderCal();
  });
  document.getElementById('calNext').addEventListener('click', function () {
    view.setMonth(view.getMonth() + 1); renderCal();
  });
  renderCal();
  renderSlots();

  // --- pasos
  function renderSummary() {
    var box = document.getElementById('summary');
    var rows = [
      ['Proyecto', pick.servicio.join(', ') || '—'],
      ['Volumen', pick.volumen || '—'],
      ['Temática', pick.nicho || '—'],
      ['Reunión', pick.fecha ? fechaLarga(pick.fecha) + ' · ' + pick.hora + ' hs' : '—']
    ];
    box.innerHTML = rows.map(function (r) {
      return '<div><span>' + r[0] + '</span><b>' + r[1] + '</b></div>';
    }).join('');
  }

  function goTo(n) {
    step = n;
    panels.forEach(function (pl) { pl.classList.toggle('is-active', +pl.dataset.step === step); });
    for (var i = 0; i < fSteps.length; i++) {
      fSteps[i].classList.toggle('is-active', i === step - 1);
      fSteps[i].classList.toggle('is-done', i < step - 1);
    }
    fBar.style.width = (step / 3 * 100) + '%';
    fPrev.disabled = step === 1;
    fNext.textContent = step === 3 ? 'Confirmar reunión' : 'Siguiente';
    fHint.textContent = '';
    if (step === 3) renderSummary();
  }

  fPrev.addEventListener('click', function () { if (step > 1) goTo(step - 1); });

  fNext.addEventListener('click', function () {
    if (step === 1) {
      if (!pick.servicio.length) { fHint.className = 'form__hint is-bad'; fHint.textContent = 'Elegí al menos una cosa en la que pueda ayudarte.'; return; }
      return goTo(2);
    }
    if (step === 2) {
      if (!pick.fecha || !pick.hora) { fHint.className = 'form__hint is-bad'; fHint.textContent = 'Elegí un día y un horario para la reunión.'; return; }
      return goTo(3);
    }

    var nombre = document.getElementById('fName').value.trim();
    var mail = document.getElementById('fMail').value.trim();
    if (nombre.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      fHint.className = 'form__hint is-bad';
      fHint.textContent = 'Necesito tu nombre y un email válido para confirmarte.';
      return;
    }

    var body =
      'Quiero agendar una reunión.\n\n' +
      'Nombre: ' + nombre + '\n' +
      'Email: ' + mail + '\n' +
      'Canal: ' + (document.getElementById('fChannel').value.trim() || '—') + '\n' +
      'Proyecto: ' + (pick.servicio.join(', ') || '—') + '\n' +
      'Volumen: ' + (pick.volumen || '—') + '\n' +
      'Temática: ' + (pick.nicho || '—') + '\n' +
      'Reunión: ' + fechaLarga(pick.fecha) + ' a las ' + pick.hora + ' hs (GMT-3)\n\n' +
      (document.getElementById('fMsg').value.trim() || '');

    fHint.className = 'form__hint is-ok';
    fHint.textContent = 'Listo: se abre tu correo con la reunión del ' + fechaLarga(pick.fecha) + ' a las ' + pick.hora + ' hs.';
    window.location.href = 'mailto:equinox.dgrafico@gmail.com' +
      '?subject=' + encodeURIComponent('Reunión ' + fechaLarga(pick.fecha) + ' ' + pick.hora + ' — ' + nombre) +
      '&body=' + encodeURIComponent(body);
  });

  goTo(1);

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------------- Bucle de scroll / parallax ---------------- */
  var parallaxEls = [].slice.call(document.querySelectorAll('[data-parallax]')).map(function (el) {
    return { el: el, k: parseFloat(el.dataset.parallax) || 0.1, cur: 0 };
  });
  var stage = document.querySelector('.gallery__stage');
  var gallerySection = document.querySelector('.gallery');
  var blurTargets = [].slice.call(document.querySelectorAll('.grid,.acc'));
  var lastBlur = -1;

  var scrollY = window.scrollY;
  var smoothY = scrollY;
  var velocity = 0;
  var last = performance.now();

  var heroEl = document.querySelector('.hero');
  var ctaEl = document.querySelector('.floating-cta');
  var toolsEl = document.getElementById('tools');

  var titles = [].slice.call(document.querySelectorAll('.stitle'));
  var mouse = { x: 0, y: 0, tx: 0, ty: 0 };

  if (!isTouch) {
    window.addEventListener('mousemove', function (e) {
      mouse.tx = (e.clientX / innerWidth - 0.5) * 2;
      mouse.ty = (0.5 - e.clientY / innerHeight) * 2;
      if (toolsEl) {
        toolsEl.style.setProperty('--mx', mouse.tx.toFixed(3));
        toolsEl.style.setProperty('--my', mouse.ty.toFixed(3));
      }
    });
  }

  // los títulos entran en 3D y después acompañan al mouse
  var titleIO = new IntersectionObserver(function (en) {
    en.forEach(function (x) {
      if (x.isIntersecting) { x.target.classList.add('is-in'); titleIO.unobserve(x.target); }
    });
  }, { threshold: 0.35 });
  titles.forEach(function (t) { titleIO.observe(t); });

  function onScroll() {
    scrollY = window.scrollY;
    var light = scrollY < (heroEl ? heroEl.offsetHeight - 100 : 0);
    nav.classList.toggle('nav--light', light);
    ctaEl.classList.toggle('floating-cta--light', light);
    // en mobile el CTA tapa las herramientas del hero: aparece al scrollear
    ctaEl.classList.toggle('is-away', light && isTouch);
    nav.classList.toggle('is-stuck', scrollY > 40);
    nav.classList.toggle('is-hidden', scrollY > lastY && scrollY > 400 && !navLinks.classList.contains('is-open'));
    lastY = scrollY;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    var prev = smoothY;
    smoothY = lerp(smoothY, scrollY, 0.12);
    velocity = (smoothY - prev);

    // Columnas de la galería: movimiento propio + empuje del scroll
    for (var i = 0; i < columns.length; i++) {
      var c = columns[i];
      if (!c.loop) continue;
      c.offset += (c.speed * dt + velocity * 0.55) * c.dir * (reduced ? 0 : 1);
      var y = ((c.offset % c.loop) + c.loop) % c.loop;
      c.el.style.transform = 'translate3d(0,' + (-y).toFixed(2) + 'px,0)';
    }

    // Inclinación 3D de la galería según el scroll
    if (stage && gallerySection) {
      var rect = gallerySection.getBoundingClientRect();
      var p = clamp(1 - (rect.top + rect.height) / (innerHeight + rect.height), -1, 1);
      var rot = clamp(21 - p * 16, 6, 23);
      stage.style.transform = 'translateX(-50%) rotateX(' + rot.toFixed(2) + 'deg) scale(' + (1 + Math.abs(p) * 0.03).toFixed(3) + ')';
    }

    // Parallax genérico
    for (var j = 0; j < parallaxEls.length; j++) {
      var it = parallaxEls[j];
      var r = it.el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > innerHeight + 200) continue;
      var center = r.top + r.height / 2 - innerHeight / 2;
      var target = reduced ? 0 : -center * it.k;
      it.cur = lerp(it.cur, target, 0.1);
      it.el.style.transform = 'translate3d(0,' + it.cur.toFixed(2) + 'px,0)';
    }

    // Filas horizontales: reseñas + ticker (siempre con contenido en pantalla)
    for (var k = 0; k < rows.length; k++) {
      var r2 = rows[k];
      if (!r2.loop) continue;
      var push = r2 === tickerRow ? velocity * 0.5 : velocity * 0.9;
      r2.offset += (r2.speed * dt + push) * r2.dir * (reduced ? 0 : 1);
      var x = ((r2.offset % r2.loop) + r2.loop) % r2.loop;
      r2.el.style.transform = 'translate3d(' + (-x).toFixed(2) + 'px,0,0)';
    }

    // Títulos: inclinación 3D suave según el mouse y la posición en pantalla
    if (!reduced && !isTouch) {
      mouse.x = lerp(mouse.x, mouse.tx, 0.06);
      mouse.y = lerp(mouse.y, mouse.ty, 0.06);
      for (var ti = 0; ti < titles.length; ti++) {
        var tr = titles[ti].getBoundingClientRect();
        if (tr.bottom < 0 || tr.top > innerHeight) continue;
        var depth = clamp((innerHeight * 0.5 - (tr.top + tr.height / 2)) / innerHeight, -1, 1);
        titles[ti].style.transform =
          'rotateX(' + (mouse.y * 4 - depth * 5).toFixed(2) + 'deg) rotateY(' + (mouse.x * 5).toFixed(2) + 'deg)';
      }
    }

    // Motion blur al scrollear (cuantizado para no repintar de más)
    if (!reduced && !isTouch) {
      var vb = clamp((Math.abs(velocity) - 2) * 0.22, 0, 3);
      vb = Math.round(vb * 2) / 2;
      if (vb !== lastBlur) {
        lastBlur = vb;
        for (var t = 0; t < blurTargets.length; t++) {
          blurTargets[t].style.filter = vb > 0 ? 'blur(' + vb + 'px)' : '';
        }
      }
    }

    // Levitación con parallax 3D del visor
    if (tilt.active) {
      tilt.x = lerp(tilt.x, tilt.tx, 0.08);
      tilt.y = lerp(tilt.y, tilt.ty, 0.08);
      lbFrame.style.transition = '';
      lbFrame.style.transform = 'rotateX(' + tilt.x.toFixed(2) + 'deg) rotateY(' + tilt.y.toFixed(2) + 'deg)';
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
