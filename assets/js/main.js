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
    { s: 'goncho-f1', t: 'Pole position', c: 'Goncho Banzas', cat: 'motor' },
    { s: 'pokemon-chatgpt', t: 'ChatGPT arma mi equipo', c: 'Pokémon Emerald', cat: 'gaming' },
    { s: 'bauti-quien-es-quien', t: 'Quién es quién', c: 'Bauti Agnone', cat: 'entretenimiento' },
    { s: 'dlorean-mercadona', t: 'DeLorean en Mercadona', c: 'Dlorean', cat: 'motor' },
    { s: 'crilon-02', t: 'OXXO en CDMX', c: 'El Crilón', cat: 'entretenimiento' },
    { s: 'alan-03', t: 'Tétrico', c: 'Alan Villalva', cat: 'gaming' },
    { s: 'alan-04', t: 'Detalles de Manhunt', c: 'Alan Villalva', cat: 'gaming' },
    { s: 'alan-05', t: 'Dark Souls III', c: 'Alan Villalva', cat: 'gaming' },
    { s: 'alan-06', t: '5 detalles de Fallout 3', c: 'Alan Villalva', cat: 'gaming' },
    { s: 'alan-07', t: 'Los 82 de PlayStation 2', c: 'Alan Villalva', cat: 'gaming' },
    { s: 'alan-08', t: 'GTA IV filtrado', c: 'Alan Villalva', cat: 'gaming' }
  ];
  var thumbOf = function (i) { return 'assets/thumbs/' + MEDIA[i].s + '.webp'; };
  var fullOf = function (i) { return 'assets/full/' + MEDIA[i].s + '.webp'; };
  var INDEXES = MEDIA.map(function (_, i) { return i; });

  var REVIEWS = [
    { q: 'Subimos el CTR de 4,1% a 9,3% en tres semanas. No cambiamos nada más que las miniaturas.', n: 'Martín Guzmán', r: 'Canal de finanzas · 240K subs' },
    { q: 'Entiende el video sin que se lo expliques dos veces. Mandás el brief y vuelve algo mejor de lo que tenías en la cabeza.', n: 'Sofía Rinaldi', r: 'Productora de contenido' },
    { q: 'Entrega siempre antes de la fecha. En dos años nunca tuve que correr a último momento.', n: 'Nico Ferreyra', r: 'Gaming · 1,1M subs' },
    { q: 'Las variantes para testear son oro. Aprendí más de mi audiencia en un mes que en todo el año anterior.', n: 'Caro Méndez', r: 'Lifestyle · 85K subs' },
    { q: 'Mi canal pasó de verse improvisado a verse como una marca. Eso cambió hasta el tipo de sponsor que me escribe.', n: 'Lucas Ibarra', r: 'Tech · 420K subs' },
    { q: 'Trabajé con cuatro diseñadores antes. Este es el primero que mira las métricas después de entregar.', n: 'Flor Acosta', r: 'Educación · 60K subs' },
    { q: 'Precio justo, cero vueltas, y responde el mismo día. Para mí eso ya vale la contratación.', n: 'Diego Salas', r: 'Podcast · 150K subs' },
    { q: 'Le mandé un video sin idea de portada y volvió con dos conceptos que no se me habrían ocurrido nunca.', n: 'Vale Duarte', r: 'Viajes · 95K subs' }
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

  /* ---------------- Reseñas en movimiento ---------------- */
  function reviewCard(r) {
    var el = document.createElement('article');
    el.className = 'review';
    el.innerHTML =
      '<p>“' + r.q + '”</p>' +
      '<footer>' +
      '<span class="av">' + r.n.charAt(0) + '</span>' +
      '<span><b>' + r.n + '</b><small>' + r.r + '</small></span>' +
      '<span class="stars">★★★★★</span>' +
      '</footer>';
    return el;
  }

  var trackA = document.getElementById('reviewTrackA');
  var trackB = document.getElementById('reviewTrackB');
  [[trackA, REVIEWS.slice(0, 4)], [trackB, REVIEWS.slice(4)]].forEach(function (pair) {
    for (var pass = 0; pass < 3; pass++) {
      pair[1].forEach(function (r) { pair[0].appendChild(reviewCard(r)); });
    }
  });

  var rows = [
    { el: trackA, dir: -1, speed: 34, offset: 0, loop: 0 },
    { el: trackB, dir: 1, speed: 28, offset: 0, loop: 0 },
    tickerRow
  ];
  function measureRows() {
    rows.forEach(function (r) {
      if (r === tickerRow) return;
      r.loop = r.el.scrollWidth / 3;
      if (r.dir > 0 && r.loop) r.offset = r.loop;
    });
  }
  measureRows();
  window.addEventListener('load', measureRows);
  window.addEventListener('resize', measureRows);

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
      '<div class="tile__meta"><h3>' + m.t + '</h3><span>' + m.c + '</span></div>';
    grid.appendChild(tile);
  });

  var chips = document.querySelectorAll('.chip');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('is-active'); c.setAttribute('aria-selected', 'false'); });
      chip.classList.add('is-active');
      chip.setAttribute('aria-selected', 'true');
      var f = chip.dataset.filter;
      document.querySelectorAll('.tile').forEach(function (t) {
        t.classList.toggle('is-hidden', !(f === 'todos' || t.dataset.cat === f));
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

  /* ---------------- Contadores ---------------- */
  var counterIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      counterIO.unobserve(el);
      var to = parseFloat(el.dataset.to);
      var suffix = el.dataset.suffix || '';
      var start = performance.now();
      (function tick(now) {
        var p = clamp((now - start) / 1700, 0, 1);
        var val = Math.round(to * (1 - Math.pow(1 - p, 3)));
        el.textContent = (val >= 1000 ? val.toLocaleString('es-AR') : val) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      })(start);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.counter').forEach(function (el) { counterIO.observe(el); });

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
  ['resultados', 'proyectos', 'resenas', 'contacto'].forEach(function (id) {
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

  /* ---------------- Formulario ---------------- */
  var form = document.getElementById('form');
  var hint = document.getElementById('formHint');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    ['nombre', 'email', 'mensaje'].forEach(function (name) {
      var input = form.elements[name];
      var valid = input.value.trim().length > 1 &&
        (name !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()));
      input.closest('.field').classList.toggle('is-error', !valid);
      if (!valid) ok = false;
    });

    if (!ok) {
      hint.textContent = 'Revisá los campos marcados antes de enviar.';
      hint.className = 'form__hint is-bad';
      return;
    }

    var body = 'Nombre: ' + form.elements.nombre.value +
      '\nEmail: ' + form.elements.email.value +
      '\nCanal: ' + form.elements.canal.value +
      '\n\n' + form.elements.mensaje.value;

    hint.textContent = 'Listo, se abre tu cliente de correo con el mensaje cargado.';
    hint.className = 'form__hint is-ok';
    window.location.href = 'mailto:equinox.dgrafico@gmail.com' +
      '?subject=' + encodeURIComponent('Consulta de ' + form.elements.nombre.value) +
      '&body=' + encodeURIComponent(body);
  });

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------------- Bucle de scroll / parallax ---------------- */
  var parallaxEls = [].slice.call(document.querySelectorAll('[data-parallax]')).map(function (el) {
    return { el: el, k: parseFloat(el.dataset.parallax) || 0.1, cur: 0 };
  });
  var stage = document.querySelector('.gallery__stage');
  var gallerySection = document.querySelector('.gallery');

  var scrollY = window.scrollY;
  var smoothY = scrollY;
  var velocity = 0;
  var last = performance.now();

  function onScroll() {
    scrollY = window.scrollY;
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
