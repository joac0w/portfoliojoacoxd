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

  /* ---------------- Idiomas ---------------- */
  var LANG = 'es';
  var T = {
    es: {
      'doc.title': 'Joaco — Diseño de miniaturas',
      'nav.aria': 'Navegación principal', 'nav.menu': 'Abrir menú',
      'nav.works': 'Trabajos', 'nav.clients': 'Clientes', 'nav.contact': 'Contacto',
      'cta.book': 'Agendar reunión',
      'hero.tagline': '+6 años de <em>experiencia real</em>',
      'hero.sub': 'Miniaturas y edición de video desde una perspectiva real.',
      'gallery.aria': 'Miniaturas', 'gallery.hint': 'Tocá cualquier miniatura para verla en grande',
      'works.t1': 'todas', 'works.t2': 'mis', 'works.t3': 'miniaturas',
      'filters.aria': 'Categorías',
      'chip.all': 'Todas', 'chip.finance': 'Finanzas', 'chip.ai': 'IA', 'chip.soon': 'pronto',
      'more.more': 'Ver más', 'more.less': 'Ver menos',
      'clients.t1': 'mis', 'clients.t2': 'clientes',
      'rail.prev': 'Anterior', 'rail.next': 'Siguiente',
      'client.subs': 'suscriptores',
      'client.slot1': 'Sumá tu canal', 'client.slot1b': 'Quedan lugares este mes',
      'client.slot2': 'Tu próximo video', 'client.slot2b': 'Escribime y lo armamos',
      'faq.t1': 'dudas', 'faq.t2': 'frecuentes',
      'faq.q1': '¿Cuánto tardás en entregar?',
      'faq.a1': 'Entre 24 y 48 horas por miniatura. Si tenés un lanzamiento con fecha, reservamos el lugar en la agenda y te confirmo el horario exacto de entrega.',
      'faq.q2': '¿Cuántas revisiones incluye?',
      'faq.a2': 'Ilimitadas dentro del concepto elegido. Si querés cambiar de idea por completo, lo tomamos como una pieza nueva y te paso el precio antes de arrancar.',
      'faq.q3': '¿Trabajás con cualquier temática?',
      'faq.a3': 'Sí. Gaming, autos, finanzas, viajes, entretenimiento o lo que tengas en la cabeza. Si el nicho es nuevo para mí, arranco investigando referencias antes de diseñar.',
      'faq.q4': '¿Cómo son los precios?',
      'faq.a4': 'Por pieza o por paquete mensual. El paquete mensual baja el precio por miniatura y te asegura prioridad en la cola. Agendá la reunión y te paso la lista completa.',
      'faq.q5': '¿Me pasás los archivos editables?',
      'faq.a5': 'Sí, PSD organizado por capas más los PNG exportados en 1280×720. Son tuyos, sin letra chica.',
      'contact.t1': 'agendemos', 'contact.t2': '15 minutos',
      'step.1': 'Proyecto', 'step.2': 'Día y hora', 'step.3': 'Tus datos',
      'q.help': '¿Con qué te doy una mano?', 'q.volume': '¿Cuántas piezas por mes?', 'q.niche': '¿De qué temática es el canal?',
      'o.thumbs': 'Miniaturas', 'o.branding': 'Branding de canal', 'o.packaging': 'Packaging de video', 'o.other': 'Otra cosa',
      'o.more10': 'Más de 10', 'o.dunno': 'Todavía no sé',
      'o.enter': 'Entretenimiento', 'o.cars': 'Autos y motor', 'o.finance': 'Finanzas', 'o.otherf': 'Otra',
      'cal.prev': 'Mes anterior', 'cal.next': 'Mes siguiente',
      'cal.note': 'Días hábiles, huso horario de Argentina (GMT−3).',
      'cal.pick': 'Elegí un día para ver los horarios', 'cal.slots': 'Horarios del ',
      'cal.dow': ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
      'cal.months': ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
      'cal.days': ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
      'cal.of': ' de ',
      'f.name': 'Nombre', 'f.namePh': 'Cómo te llamás',
      'f.mail': 'Email', 'f.mailPh': 'vos@correo.com',
      'f.channel': 'Canal o link', 'f.channelPh': 'youtube.com/@tucanal',
      'f.more': 'Algo más que quieras contarme', 'f.morePh': 'Opcional',
      'btn.back': 'Atrás', 'btn.next': 'Siguiente', 'btn.confirm': 'Confirmar reunión',
      'sum.project': 'Proyecto', 'sum.volume': 'Volumen', 'sum.niche': 'Temática', 'sum.meeting': 'Reunión',
      'err.services': 'Elegí al menos una cosa en la que pueda ayudarte.',
      'err.when': 'Elegí un día y un horario para la reunión.',
      'err.contact': 'Necesito tu nombre y un email válido para confirmarte.',
      'ok.mail': 'Listo: se abre tu correo con la reunión del ',
      'ok.mail2': ' a las ',
      'mail.subject': 'Reunión ', 'mail.intro': 'Quiero agendar una reunión.',
      'mail.name': 'Nombre', 'mail.mail': 'Email', 'mail.channel': 'Canal',
      'mail.project': 'Proyecto', 'mail.volume': 'Volumen', 'mail.niche': 'Temática', 'mail.meeting': 'Reunión',
      'footer.rights': '— Diseño de miniaturas. Hecho en Argentina.', 'footer.top': 'Volver arriba ↑',
      'lb.aria': 'Miniatura ampliada', 'lb.close': 'Cerrar', 'lb.prev': 'Anterior', 'lb.next': 'Siguiente',
      'lb.see': 'Ver ', 'lb.see2': ' en grande',
      'ticker': ['Miniaturas', 'Branding de canal', 'Packaging de video', 'Tests A/B', 'Retoque', 'Dirección de arte']
    },
    en: {
      'doc.title': 'Joaco — Thumbnail design',
      'nav.aria': 'Main navigation', 'nav.menu': 'Open menu',
      'nav.works': 'Work', 'nav.clients': 'Clients', 'nav.contact': 'Contact',
      'cta.book': 'Book a call',
      'hero.tagline': '+6 years of <em>real experience</em>',
      'hero.sub': 'Thumbnails and video editing from a real perspective.',
      'gallery.aria': 'Thumbnails', 'gallery.hint': 'Tap any thumbnail to see it full screen',
      'works.t1': 'all', 'works.t2': 'my', 'works.t3': 'thumbnails',
      'filters.aria': 'Categories',
      'chip.all': 'All', 'chip.finance': 'Finance', 'chip.ai': 'AI', 'chip.soon': 'soon',
      'more.more': 'See more', 'more.less': 'See less',
      'clients.t1': 'my', 'clients.t2': 'clients',
      'rail.prev': 'Previous', 'rail.next': 'Next',
      'client.subs': 'subscribers',
      'client.slot1': 'Add your channel', 'client.slot1b': 'Spots left this month',
      'client.slot2': 'Your next video', 'client.slot2b': 'Write me and we build it',
      'faq.t1': 'frequent', 'faq.t2': 'questions',
      'faq.q1': 'How long does delivery take?',
      'faq.a1': 'Between 24 and 48 hours per thumbnail. If you have a launch date, we book the slot and I confirm the exact delivery time.',
      'faq.q2': 'How many revisions are included?',
      'faq.a2': 'Unlimited within the chosen concept. If you want to change the idea completely, we treat it as a new piece and I quote it before starting.',
      'faq.q3': 'Do you work with any niche?',
      'faq.a3': 'Yes. Gaming, cars, finance, travel, entertainment or whatever you have in mind. If the niche is new to me, I start by researching references before designing.',
      'faq.q4': 'How does pricing work?',
      'faq.a4': 'Per piece or per monthly package. The monthly package lowers the price per thumbnail and gives you priority in the queue. Book the call and I send you the full list.',
      'faq.q5': 'Do I get the editable files?',
      'faq.a5': 'Yes, a layered PSD plus the PNGs exported at 1280×720. They are yours, no small print.',
      'contact.t1': "let's book", 'contact.t2': '15 minutes',
      'step.1': 'Project', 'step.2': 'Date & time', 'step.3': 'Your details',
      'q.help': 'What can I help you with?', 'q.volume': 'How many pieces per month?', 'q.niche': "What's the channel about?",
      'o.thumbs': 'Thumbnails', 'o.branding': 'Channel branding', 'o.packaging': 'Video packaging', 'o.other': 'Something else',
      'o.more10': 'More than 10', 'o.dunno': "I don't know yet",
      'o.enter': 'Entertainment', 'o.cars': 'Cars & motor', 'o.finance': 'Finance', 'o.otherf': 'Other',
      'cal.prev': 'Previous month', 'cal.next': 'Next month',
      'cal.note': 'Weekdays only, Argentina time (GMT−3).',
      'cal.pick': 'Pick a day to see the times', 'cal.slots': 'Times for ',
      'cal.dow': ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
      'cal.months': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      'cal.days': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      'cal.of': ' ',
      'f.name': 'Name', 'f.namePh': 'Your name',
      'f.mail': 'Email', 'f.mailPh': 'you@mail.com',
      'f.channel': 'Channel or link', 'f.channelPh': 'youtube.com/@yourchannel',
      'f.more': 'Anything else you want to tell me', 'f.morePh': 'Optional',
      'btn.back': 'Back', 'btn.next': 'Next', 'btn.confirm': 'Confirm meeting',
      'sum.project': 'Project', 'sum.volume': 'Volume', 'sum.niche': 'Niche', 'sum.meeting': 'Meeting',
      'err.services': 'Pick at least one thing I can help you with.',
      'err.when': 'Pick a day and a time for the meeting.',
      'err.contact': 'I need your name and a valid email to confirm.',
      'ok.mail': 'Done: your mail app opens with the meeting on ',
      'ok.mail2': ' at ',
      'mail.subject': 'Meeting ', 'mail.intro': 'I would like to book a meeting.',
      'mail.name': 'Name', 'mail.mail': 'Email', 'mail.channel': 'Channel',
      'mail.project': 'Project', 'mail.volume': 'Volume', 'mail.niche': 'Niche', 'mail.meeting': 'Meeting',
      'footer.rights': '— Thumbnail design. Made in Argentina.', 'footer.top': 'Back to top ↑',
      'lb.aria': 'Enlarged thumbnail', 'lb.close': 'Close', 'lb.prev': 'Previous', 'lb.next': 'Next',
      'lb.see': 'See ', 'lb.see2': ' full screen',
      'ticker': ['Thumbnails', 'Channel branding', 'Video packaging', 'A/B tests', 'Retouching', 'Art direction']
    }
  };
  function t(k) {
    var v = T[LANG] && T[LANG][k];
    return v === undefined ? (T.es[k] === undefined ? k : T.es[k]) : v;
  }

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
    { s: 'alan-08', t: 'GTA IV filtrado', c: 'Alan Villalva', cat: 'faceless' },
    { s: 'goncho-f1-2', t: 'Stake F1 Team', c: 'Goncho Banzas', cat: 'irl' },
    { s: 'goncho-f1-3', t: 'Max Verstappen', c: 'Goncho Banzas', cat: 'irl' },
    { s: 'goncho-f1-4', t: 'DNF', c: 'Goncho Banzas', cat: 'irl' },
    { s: 'jotabe-river', t: 'River Plate en FC 26', c: 'Jotabe', cat: 'irl' },
    { s: 'hansi-flick', t: 'Hansi Flick en FC 26', c: 'Fútbol', cat: 'irl' },
    { s: 'jacob-elordi', t: 'La redención de Jacob Elordi', c: 'Cine', cat: 'irl' },
    { s: 'simpsons', t: 'Un futuro muy loco', c: 'Series', cat: 'faceless' },
    { s: 'fortnite', t: 'Hiedra botánica', c: 'Fortnite', cat: 'faceless' },
    { s: 'kevs-01', t: 'Consecuencias de ser simp', c: 'Kevs', cat: 'faceless' },
    { s: 'kevs-04', t: '¿Buen jefe?', c: 'Kevs', cat: 'faceless' },
    { s: 'spar-16', t: 'Un 39 en Metacritic', c: 'Spar', cat: 'faceless' }
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
    { slot: 1 },
    { slot: 2 }
  ];


  /* ---------------- Portada: carga + idioma ---------------- */
  var gate = document.getElementById('gate');
  var preBar = document.getElementById('preBar');
  var preNum = document.getElementById('preNum');
  var progress = 0;
  var ready = false;
  var preTimer = setInterval(function () {
    progress = Math.min(97, progress + Math.random() * 14);
    preBar.style.width = progress + '%';
    preNum.textContent = Math.round(progress);
  }, 120);

  function showChoice() {
    if (ready) return;
    ready = true;
    clearInterval(preTimer);
    preBar.style.width = '100%';
    preNum.textContent = '100';
    setTimeout(function () { gate.classList.add('is-ready'); }, 260);
  }
  document.body.classList.add('is-locked');
  window.addEventListener('load', function () { setTimeout(showChoice, 380); });
  setTimeout(showChoice, 4200);                  // red lenta: nunca bloquear

  function applyLang(lang) {
    LANG = T[lang] ? lang : 'es';
    document.documentElement.lang = LANG;
    document.title = t('doc.title');

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      el.innerHTML = t(el.dataset.i18nHtml);
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      el.placeholder = t(el.dataset.i18nPh);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      el.setAttribute('aria-label', t(el.dataset.i18nAria));
    });

    // iniciales de los días en el calendario
    var dow = document.querySelectorAll('.cal__dow span');
    t('cal.dow').forEach(function (d, i) { if (dow[i]) dow[i].textContent = d; });

    // lo que arma JavaScript
    buildTicker();
    buildGallery();
    renderClients();
    renderCal();
    renderSlots();
    goTo(1);
    moreBtn.querySelector('.more__txt').textContent = expanded ? t('more.less') : t('more.more');
    applyCollapse(false);
    railState();
  }

  function enterSite(lang) {
    applyLang(lang);
    gate.classList.add('is-done');
    document.body.classList.remove('is-locked');
    setTimeout(function () { gate.style.display = 'none'; }, 900);
  }

  document.getElementById('gateChoice').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-lang]');
    if (btn) enterSite(btn.dataset.lang);
  });

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
          fig.setAttribute('aria-label', t('lb.see') + MEDIA[idx].t + t('lb.see2'));
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
    t('ticker').forEach(function (w) {
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

  function renderClients() {
    rail.innerHTML = '';
    CLIENTS.forEach(function (cl) {
      var name = cl.slot ? t('client.slot' + cl.slot) : cl.n;
      var subs = cl.slot ? t('client.slot' + cl.slot + 'b') : '<b>' + cl.s + '</b> ' + t('client.subs');
      var card = document.createElement('article');
      card.className = 'client' + (cl.slot ? ' is-slot' : '');
      var pic = cl.img
        ? '<img src="' + cl.img + '" alt="' + name + '" loading="lazy" decoding="async" />'
        : (cl.slot ? '+' : name.charAt(0));
      card.innerHTML =
        '<span class="client__pic">' + pic + '</span>' +
        '<span class="client__txt">' +
        '<span class="client__name">' + name + '</span>' +
        '<span class="client__subs">' + subs + '</span>' +
        '</span>';
      rail.appendChild(card);
    });
  }
  renderClients();

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

  /* ---------------- Ver más ---------------- */
  var gridWrap = document.getElementById('gridWrap');
  var moreBtn = document.getElementById('moreBtn');
  var expanded = false;

  function collapsedHeight() {
    var tiles = [].filter.call(grid.children, function (t) { return !t.classList.contains('is-hidden'); });
    if (!tiles.length) return 0;
    var gap = parseFloat(getComputedStyle(grid).rowGap) || 18;
    var h = tiles[0].getBoundingClientRect().height;
    var perRow = Math.max(1, Math.round(grid.getBoundingClientRect().width / (tiles[0].getBoundingClientRect().width + gap)));
    // en una sola columna conviene mostrar más filas
    var show = perRow >= 3 ? 2 : (perRow === 2 ? 3 : 4);
    var rows = Math.ceil(tiles.length / perRow);
    if (rows <= show) return 0;                         // no hace falta plegar
    return h * show + gap * show + h * 0.62;            // deja asomar la fila siguiente
  }

  function applyCollapse(animate) {
    var ch = collapsedHeight();
    if (!ch) {                                          // entra todo: sin botón ni velo
      gridWrap.style.maxHeight = '';
      gridWrap.classList.add('is-open');
      moreBtn.style.display = 'none';
      return;
    }
    moreBtn.style.display = '';
    if (expanded) {
      gridWrap.classList.add('is-open');
      gridWrap.style.maxHeight = animate ? grid.scrollHeight + 40 + 'px' : '';
      if (animate) setTimeout(function () { if (expanded) gridWrap.style.maxHeight = ''; }, 900);
    } else {
      gridWrap.classList.remove('is-open');
      if (animate) {
        gridWrap.style.maxHeight = grid.scrollHeight + 40 + 'px';
        void gridWrap.offsetWidth;
      }
      gridWrap.style.maxHeight = ch + 'px';
    }
  }

  moreBtn.addEventListener('click', function () {
    expanded = !expanded;
    moreBtn.setAttribute('aria-expanded', String(expanded));
    moreBtn.querySelector('.more__txt').textContent = expanded ? t('more.less') : t('more.more');
    applyCollapse(true);
    if (!expanded) {
      var top = document.getElementById('proyectos').getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }
  });

  applyCollapse(false);
  window.addEventListener('load', function () { applyCollapse(false); });
  window.addEventListener('resize', function () {
    clearTimeout(window.__gz);
    window.__gz = setTimeout(function () { applyCollapse(false); }, 200);
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
      applyCollapse(false);
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
    calMonth.textContent = t('cal.months')[view.getMonth()] + ' ' + view.getFullYear();
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
    var dow = t('cal.days')[d.getDay()];
    return LANG === 'en'
      ? dow + ', ' + t('cal.months')[d.getMonth()] + ' ' + d.getDate()
      : dow + ' ' + d.getDate() + ' de ' + t('cal.months')[d.getMonth()];
  }

  function renderSlots() {
    slotList.innerHTML = '';
    if (!pick.fecha) {
      slotTitle.textContent = t('cal.pick');
      return;
    }
    slotTitle.textContent = t('cal.slots') + fechaLarga(pick.fecha);
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
      [t('sum.project'), pick.servicio.join(', ') || '—'],
      [t('sum.volume'), pick.volumen || '—'],
      [t('sum.niche'), pick.nicho || '—'],
      [t('sum.meeting'), pick.fecha ? fechaLarga(pick.fecha) + ' · ' + pick.hora : '—']
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
    fNext.textContent = step === 3 ? t('btn.confirm') : t('btn.next');
    fHint.textContent = '';
    if (step === 3) renderSummary();
  }

  fPrev.addEventListener('click', function () { if (step > 1) goTo(step - 1); });

  fNext.addEventListener('click', function () {
    if (step === 1) {
      if (!pick.servicio.length) { fHint.className = 'form__hint is-bad'; fHint.textContent = t('err.services'); return; }
      return goTo(2);
    }
    if (step === 2) {
      if (!pick.fecha || !pick.hora) { fHint.className = 'form__hint is-bad'; fHint.textContent = t('err.when'); return; }
      return goTo(3);
    }

    var nombre = document.getElementById('fName').value.trim();
    var mail = document.getElementById('fMail').value.trim();
    if (nombre.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      fHint.className = 'form__hint is-bad';
      fHint.textContent = t('err.contact');
      return;
    }

    var body =
      t('mail.intro') + '\n\n' +
      t('mail.name') + ': ' + nombre + '\n' +
      t('mail.mail') + ': ' + mail + '\n' +
      t('mail.channel') + ': ' + (document.getElementById('fChannel').value.trim() || '—') + '\n' +
      t('mail.project') + ': ' + (pick.servicio.join(', ') || '—') + '\n' +
      t('mail.volume') + ': ' + (pick.volumen || '—') + '\n' +
      t('mail.niche') + ': ' + (pick.nicho || '—') + '\n' +
      t('mail.meeting') + ': ' + fechaLarga(pick.fecha) + t('ok.mail2') + pick.hora + ' (GMT-3)\n\n' +
      (document.getElementById('fMsg').value.trim() || '');

    fHint.className = 'form__hint is-ok';
    fHint.textContent = t('ok.mail') + fechaLarga(pick.fecha) + t('ok.mail2') + pick.hora + '.';
    window.location.href = 'mailto:equinox.dgrafico@gmail.com' +
      '?subject=' + encodeURIComponent(t('mail.subject') + fechaLarga(pick.fecha) + ' ' + pick.hora + ' — ' + nombre) +
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
