(function(){
  var toggle = document.getElementById('navToggle');
  var panel = document.getElementById('mobilePanel');
  if(!toggle || !panel) return;
  function closePanel(){
    toggle.classList.remove('active');
    panel.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
  }
  toggle.addEventListener('click', function(){
    var isActive = toggle.classList.toggle('active');
    panel.classList.toggle('active', isActive);
    toggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
  });
  panel.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', closePanel);
  });
})();

document.querySelectorAll('.filter-btn').forEach(function(btn){
  btn.addEventListener('click', function(){
    document.querySelectorAll('.filter-btn').forEach(function(b){ b.classList.remove('active'); });
    btn.classList.add('active');
    var f = btn.dataset.filter;
    document.querySelectorAll('.world-card').forEach(function(card){
      var cats = card.dataset.cats.split(' ');
      card.style.display = (f === 'all' || cats.indexOf(f) !== -1) ? '' : 'none';
    });
  });
});

/* ---------- SCROLL REVEAL: TEXTOS E IMAGENES DESDE LA IZQUIERDA ---------- */
(function(){
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  var selector = [
    '.hero .eyebrow', '.hero h1', '.hero p', '.hero .btn-primary',
    '.section-head .eyebrow', '.section-head h2', '.section-head p',
    '.filter-btn',
    '.world-card',
    '.step',
    '.contact .eyebrow', '.contact h2', '.contact p', '.contact .btn-primary',
    'footer .wrap span'
  ].join(', ');

  var els = Array.prototype.slice.call(document.querySelectorAll(selector));

  // Escalonado local: cada elemento se retrasa según su posición dentro de su
  // propio contenedor (ciclando cada 4), asi las grillas cascadean sin que
  // los elementos de filas lejanas hereden un retraso enorme.
  var counters = new Map();
  els.forEach(function(el){
    var parent = el.parentElement;
    var idx = counters.get(parent) || 0;
    counters.set(parent, idx + 1);
    el.classList.add('reveal');
    el.style.animationDelay = (idx % 4) * 70 + 'ms';
  });

  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting){
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  els.forEach(function(el){ observer.observe(el); });
})();
(function(){
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  if(reduceMotion || coarsePointer) return;

  var wrap = document.getElementById('cursorFollow');
  var lead = wrap ? wrap.querySelector('.dot-lead') : null;
  var trail = wrap ? wrap.querySelector('.dot-trail') : null;
  if(!wrap || !lead || !trail) return;

  var mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  var leadPos = { x: mouse.x, y: mouse.y };
  var trailPos = { x: mouse.x, y: mouse.y };

  window.addEventListener('pointermove', function(e){
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    wrap.classList.add('active');
  }, { passive: true });

  window.addEventListener('pointerleave', function(){
    wrap.classList.remove('active');
  });

  function loop(){
    leadPos.x += (mouse.x - leadPos.x) * 0.35;
    leadPos.y += (mouse.y - leadPos.y) * 0.35;
    trailPos.x += (mouse.x - trailPos.x) * 0.10;
    trailPos.y += (mouse.y - trailPos.y) * 0.10;
    lead.style.transform = 'translate3d(' + leadPos.x + 'px,' + leadPos.y + 'px,0) translate(-50%,-50%)';
    trail.style.transform = 'translate3d(' + trailPos.x + 'px,' + trailPos.y + 'px,0) translate(-50%,-50%)';
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

/* ---------- HERO: EL ANILLO VIBRA COMO UNA CUERDA AL RASPARLO ---------- */
(function(){
  var svg = document.querySelector('.orbits');
  var ring = document.getElementById('heroRing');
  if(!svg || !ring) return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var CX = 450, CY = 450, R = 260, N = 160;
  var A0 = 16, TAU = 0.55, FREQ = 5.5, K = 4.5, SIGMA = 0.55;
  var pluckTime = -Infinity;
  var pluckAngle = 0;
  var lastPluck = 0;
  var running = false;

  function angleDiff(a, b){
    var d = a - b;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return d;
  }

  function frame(now){
    var t = (now - pluckTime) / 1000;
    if (t > 2.2){
      running = false;
      return;
    }
    var env = Math.exp(-t / TAU);
    var d = '';
    for (var i = 0; i <= N; i++){
      var a = (i / N) * Math.PI * 2;
      var ad = angleDiff(a, pluckAngle);
      var spatial = Math.exp(-(ad * ad) / (2 * SIGMA * SIGMA));
      var wave = Math.sin(K * Math.abs(ad) - FREQ * t);
      var offset = A0 * env * spatial * wave;
      var r = R + offset;
      var x = CX + r * Math.cos(a);
      var y = CY + r * Math.sin(a);
      d += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ',' + y.toFixed(2) + ' ';
    }
    ring.setAttribute('d', d + 'Z');
    requestAnimationFrame(frame);
  }

  svg.addEventListener('pointermove', function(e){
    var pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    var ctm = svg.getScreenCTM();
    if (!ctm) return;
    var loc = pt.matrixTransform(ctm.inverse());
    var dx = loc.x - CX, dy = loc.y - CY;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (Math.abs(dist - R) < 14){
      var now = performance.now();
      if (now - lastPluck > 90){
        lastPluck = now;
        pluckAngle = Math.atan2(dy, dx);
        pluckTime = now;
        if (!running){
          running = true;
          requestAnimationFrame(frame);
        }
      }
    }
  }, { passive: true });
})();

/* ---------- DIVISOR: LA LINEA VIBRA COMO UNA CUERDA AL RASPARLA ---------- */
(function(){
  var svg = document.querySelector('.string-divider');
  var line = document.getElementById('stringLine');
  if(!svg || !line) return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var W = 1000, MID = 15, N = 160;
  var A0 = 22, TAU = 0.55, FREQ = 5.5, K = 0.028, SIGMA = 70;
  var pluckTime = -Infinity;
  var pluckX = W / 2;
  var lastPluck = 0;
  var running = false;

  function frame(now){
    var t = (now - pluckTime) / 1000;
    if (t > 2.2){
      running = false;
      line.setAttribute('d', 'M0,' + MID + ' L' + W + ',' + MID);
      return;
    }
    var env = Math.exp(-t / TAU);
    var d = '';
    for (var i = 0; i <= N; i++){
      var x = (i / N) * W;
      var dx = x - pluckX;
      var spatial = Math.exp(-(dx * dx) / (2 * SIGMA * SIGMA));
      var wave = Math.sin(K * Math.abs(dx) - FREQ * t);
      var y = MID + A0 * env * spatial * wave;
      d += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ',' + y.toFixed(2) + ' ';
    }
    line.setAttribute('d', d);
    requestAnimationFrame(frame);
  }

  svg.addEventListener('pointermove', function(e){
    var pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    var ctm = svg.getScreenCTM();
    if (!ctm) return;
    var loc = pt.matrixTransform(ctm.inverse());
    if (Math.abs(loc.y - MID) < 14){
      var now = performance.now();
      if (now - lastPluck > 90){
        lastPluck = now;
        pluckX = loc.x;
        pluckTime = now;
        if (!running){
          running = true;
          requestAnimationFrame(frame);
        }
      }
    }
  }, { passive: true });
})();
