/* Reality Architecture · interazioni leggere (nessuna libreria) */
(function () {
  var d = document, w = window, root = d.documentElement;
  root.classList.add('js');
  var ridotto = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header che si compatta allo scroll */
  var nav = d.getElementById('nav');
  function onScroll() { nav.classList.toggle('is-scrolled', w.scrollY > 24); }
  onScroll();
  w.addEventListener('scroll', onScroll, { passive: true });

  /* Menu mobile */
  var burger = d.getElementById('burger'), menu = d.getElementById('menu');
  function chiudi() {
    menu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Apri il menu');
    d.body.style.overflow = '';
  }
  burger.addEventListener('click', function () {
    var aperto = menu.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', aperto ? 'true' : 'false');
    burger.setAttribute('aria-label', aperto ? 'Chiudi il menu' : 'Apri il menu');
    d.body.style.overflow = aperto ? 'hidden' : '';
    if (aperto) { var primo = menu.querySelector('a'); if (primo) primo.focus(); }
  });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) chiudi(); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { chiudi(); burger.focus(); } });
  w.addEventListener('resize', function () { if (w.innerWidth > 960) chiudi(); });

  /* Comparsa elementi */
  var els = [].slice.call(d.querySelectorAll('.reveal'));
  if (!('IntersectionObserver' in w) || ridotto) {
    els.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (voci) {
      voci.forEach(function (v) { if (v.isIntersecting) { v.target.classList.add('is-in'); io.unobserve(v.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* Parallax sottile */
  if (!ridotto) {
    var px = [].slice.call(d.querySelectorAll('[data-parallax]')), attesa = false;
    function muovi() {
      var vh = w.innerHeight;
      px.forEach(function (el) {
        var box = el.parentElement.getBoundingClientRect();
        if (box.bottom < -100 || box.top > vh + 100) return;
        var k = parseFloat(el.getAttribute('data-parallax')) || 0.1;
        var y = (box.top + box.height / 2 - vh / 2) * -k;
        el.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)' + (el.classList.contains('hero__img') ? ' scale(1.06)' : '');
      });
      attesa = false;
    }
    w.addEventListener('scroll', function () { if (!attesa) { attesa = true; w.requestAnimationFrame(muovi); } }, { passive: true });
    w.addEventListener('load', muovi);
  }

  /* Anno nel footer */
  var anno = d.getElementById('anno');
  if (anno) anno.textContent = new Date().getFullYear();
})();
