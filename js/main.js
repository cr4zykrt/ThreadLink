// ---------- Scroll reveal ----------
document.addEventListener('DOMContentLoaded', () => {
  // ===== HERO CAROUSEL IMAGES =====
  // Put your photo paths here, e.g. ['images/work1.jpg','images/work2.jpg']. Leave empty to show gray placeholders.
  const carouselImages = [
  { src: 'images/alter.jpg',  title: 'Alterations' },
  { src: 'images/custom.jpg', title: 'Custom Tailoring' },
  { src: 'images/made.jpg',   title: 'Made-to-Order' },
  { src: 'images/repair.jpg', title: 'Repair' }
  ];
  const rt = document.getElementById('reelTrack');
  if (rt) {
    const n = Math.max(8, carouselImages.length);
const card = i => {
  const it = carouselImages.length ? carouselImages[i % carouselImages.length] : null;
  return `<div class="rc slot" data-label="Image" style="--i:${i};--r:${(i%2?1:-1)*(8+(i*5)%9)}deg;--y:${Math.round(34*Math.sin(i*1.1))}px">${it ? `<img src="${it.src}" alt="${it.title}" onload="this.parentNode.classList.add('has')" onerror="this.remove()"><span class="rc-title">${it.title}</span>` : ''}</div>`;
};
    rt.innerHTML = Array.from({length: n * 2}, (_, i) => card(i % n)).join('');
  }

  // Mark elements for reveal
  const revealTargets = document.querySelectorAll(
    
    '.service-card, .availability-card, .availability-copy, .how-steps li, .section-head, .testimonials .carousel, .about-card'
  );
  revealTargets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(i % 4) * 80}ms`;
  });

  // ---------- Intro loader ----------
  const loader = document.getElementById('loader');
  const start = performance.now();
  const MIN_SHOW = 1800; // ms the logo stays on screen

  function openSite() {
    const wait = Math.max(0, MIN_SHOW - (performance.now() - start));
    setTimeout(() => {
      loader.classList.add('hide');                 // panel slides up
      document.body.classList.remove('loading');    // unlock scroll
      document.body.classList.add('loaded');        // cards start popping
      loader.addEventListener('transitionend', () => loader.remove(), { once: true });
    }, wait);
  }
  if (document.readyState === 'complete') openSite();
  else window.addEventListener('load', openSite);


  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealTargets.forEach(el => observer.observe(el));

  // ---------- Testimonial carousel ----------
  const track = document.getElementById('carouselTrack');
  const dotsContainer = document.getElementById('carouselDots');
  if (track && dotsContainer) {
    const slides = Array.from(track.querySelectorAll('.testimonial'));
    let current = 0;
    let autoTimer;

    slides.forEach((_, i) => {
      const dot = document.createElement('span');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });
    const dots = Array.from(dotsContainer.children);

    function goTo(index) {
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('active');
      dots[current].classList.add('active');
    }

    function startAuto() {
      autoTimer = setInterval(() => goTo(current + 1), 5000);
    }
    function stopAuto() {
      clearInterval(autoTimer);
    }

    slides[0].classList.add('active');
    startAuto();

    track.addEventListener('mouseenter', stopAuto);
    track.addEventListener('mouseleave', startAuto);
  }
});

// ===== AI CHATBOT =====
(function () {
  const fab = document.getElementById('chatFab'), box = document.getElementById('chatBox');
  const msgs = document.getElementById('chatMsgs'), form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput'), chips = document.getElementById('chatChips');
  let greeted = false;

  function toggle(open) {
    const o = open === undefined ? !box.classList.contains('open') : open;
    box.classList.toggle('open', o);
    fab.classList.toggle('open', o);
    fab.setAttribute('aria-expanded', o);
    box.setAttribute('aria-hidden', !o);
    if (o) {
      if (!greeted) { add('bot', "Hi! I'm the ThreadLink assistant. Ask me about availability, your order status, or booking."); greeted = true; }
      setTimeout(() => input.focus(), 300);
    }
  }

  function add(who, text) {
    const d = document.createElement('div');
    d.className = 'msg ' + who;
    d.textContent = text;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    return d;
  }

  // >>> CONNECT YOUR BACKEND HERE <<<
  async function getBotReply(text) {
    // When your backend is ready, replace the lines below with something like:
    // const r = await fetch('http://localhost:3000/api/chatbot/message', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ message: text })
    // });
    // return (await r.json()).reply;
    await new Promise(r => setTimeout(r, 900));
    return "Thanks for your message! The assistant isn't connected to the system yet.";
  }

  async function send(text) {
    text = text.trim();
    if (!text) return;
    add('user', text);
    input.value = '';
    chips.style.display = 'none';
    const t = add('bot typing', '');
    t.innerHTML = '<i></i><i></i><i></i>';
    try { const reply = await getBotReply(text); t.remove(); add('bot', reply); }
    catch (e) { t.remove(); add('bot', 'Sorry, something went wrong. Please try again.'); }
  }

  fab.addEventListener('click', () => toggle());
  document.getElementById('chatClose').addEventListener('click', () => toggle(false));
  form.addEventListener('submit', e => { e.preventDefault(); send(input.value); });
  chips.addEventListener('click', e => { if (e.target.tagName === 'BUTTON') send(e.target.textContent); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
})();

// ===== MANNEQUIN SCROLL: hero -> seated end frame =====
(function () {
  const m = document.querySelector('.mannequin');
  const about = document.getElementById('about');
  if (!m || !about) return;

  const BG_W = 1679, BG_H = 894;     // about-seated.png size
  const PNG_W = 1027, PNG_H = 1532;   // mannequin.png size
  const CHAIR_X = 0.489;  // mannequin centre in the seated image (left → right)
  const SEAT_Y  = 0.85;   // bottom edge of mannequin.png in the seated image (top → bottom)
  const SIZE    = 0.564;  // mannequin.png height / seated image height

  let dx = 0, dy = 0, endScale = 1, range = 1, gap = 0;

  function update() {
    const p = Math.min(1, Math.max(0, window.scrollY / range));
    m.style.transform =
      `translate(calc(-50% + ${dx * p}px), ${dy * p}px) scale(${1 + (endScale - 1) * p})`;
    const done = p >= 0.985;                 // scroll complete → swap to the seated image
    about.classList.toggle('seated', done);
        about.classList.toggle('in', p >= 0.9);
    m.classList.toggle('seated', done);
  }

  function measure() {
    m.style.transform = '';
    const r = m.getBoundingClientRect();
    const sy = window.scrollY;
    const aboutTop = about.parentElement.getBoundingClientRect().top + sy;
    const W = about.clientWidth, H = about.offsetHeight;
    const k = Math.max(W / BG_W, H / BG_H);            // background-size: cover
    const iw = BG_W * k, ih = BG_H * k;
    const chairX = (W - iw) / 2 + CHAIR_X * iw;
    const seatY  = aboutTop + (H - ih) / 2 + SEAT_Y * ih;

    const c = Math.min(r.width / PNG_W, r.height / PNG_H);  // object-fit: contain
    const imgH = PNG_H * c;
    gap = (r.height - imgH) / 2;                            // empty space under the picture
    endScale = (SIZE * ih) / imgH;
    dx = chairX - (r.left + r.width / 2);
    dy = seatY - (r.bottom + sy) + gap * endScale;
    range = Math.max(1, aboutTop);
    update();
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  measure();
})();
// ===== ABOUT US: slide-in (left from left, right from right, bottom rises) =====
(function () {
  const about = document.getElementById('about');
  if (!about) return;
  about.classList.add('anim');
  about.querySelectorAll('.about-left > *').forEach((el, i) => el.style.setProperty('--d', i));
  about.querySelectorAll('.about-right > *').forEach((el, i) => el.style.setProperty('--d', i + 1));
  about.querySelectorAll('.ruler.wide, .commit-label, .commit-list li').forEach((el, i) => el.style.setProperty('--d', i + 3));
})();
// ===== SCROLL WIPE: fill rises from the bottom as you scroll =====
(function () {
  const wrap = document.querySelector('.about-wrap');
  const about = document.getElementById('about');
  const wipe = document.getElementById('wipe');
  const spacer = document.querySelector('.wipe-spacer');
  if (!wrap || !about || !wipe || !spacer) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const svc = wipe.querySelector('.wipe-services');
    wipe.remove();
    if (svc) { svc.style.cssText = 'position:relative;bottom:auto;height:100vh;'; about.parentElement.appendChild(svc); }
    about.style.position = 'relative';
    return;
  }

  let t = 0, D = 1, H = 0, E = 0;

  function update() {
    const scrolled = -wrap.getBoundingClientRect().top;
    const p = Math.min(1, Math.max(0, (scrolled + t) / D));      // 0 → 1 while the fill rises
    const r = E * (1 - p);                                        // curve flattens as it rises
    wipe.style.transform = `translateY(${(1 - p) * (H + E)}px)`;
    wipe.style.borderRadius = `50% 50% 0 0 / ${r}px ${r}px 0 0`;
    if (window.tlHelix) window.tlHelix(p);                        // spin the helix with the fill
  }

  function measure() {
    const vh = window.innerHeight;
    H = about.offsetHeight;
    E = vh * 0.3;                                  // height of the curved edge
    D = vh;                                        // how much scrolling the fill takes
    t = Math.min(0, vh - H);                       // keeps the bottom visible if About is taller than the screen
    about.style.top = t + 'px';
    spacer.style.height = D + 'px';
    wipe.style.height = (H + E) + 'px';
    update();
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  measure();
})();
// ===== NAV LINKS: scroll slowly so the scroll-driven animations can play =====
(function () {
  const links = document.querySelectorAll('.nav-links a[href^="#"]');
  const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

  function targetY(id) {
    // Services now lives inside the white fill, so it sits at the very end of the page
    if (id === 'services' && document.getElementById('wipe')) {
      return document.documentElement.scrollHeight - window.innerHeight;
    }
    const el = document.getElementById(id);
    if (!el) return null;
    const host = id === 'about' ? el.parentElement : el;   // About is pinned, so use its wrapper
    return host.getBoundingClientRect().top + window.scrollY;
  }

  links.forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const y = targetY(id);
    if (y === null) return;
    e.preventDefault();
    const from = window.scrollY, dist = y - from;
const dur = Math.min(1200, Math.max(350, Math.abs(dist) * 0.7));   // faster glide
    const t0 = performance.now();
    window.tlAutoScroll = true;
    (function step(now) {
      const k = Math.min(1, (now - t0) / dur);
      window.scrollTo({ top: from + dist * ease(k), behavior: 'instant' });
      if (k < 1) requestAnimationFrame(step);
      else setTimeout(() => { window.tlAutoScroll = false; }, 100);
    })(t0);
  }));
})();
// ===== SCROLL GATE: manual scroll stops at About, then when the wipe is full =====
(function () {
  const wrap  = document.querySelector('.about-wrap');
  const about = document.getElementById('about');
  if (!wrap || !about) return;

  const HOLD_MIN = 600;   // ms minimum hold at a stop
  const QUIET    = 150;   // ms of no downward input before it releases
  const HOLD_MAX = 900;   // hard cap: never locked longer than this
  const armed = [true, true];
  let locked = false, stop = 0, lockStart = 0, lastDownInput = 0, lastY = window.scrollY;

  function stops() {
    return [Math.round(wrap.getBoundingClientRect().top + window.scrollY)];
  }
  function unlock() { locked = false; lastY = window.scrollY; }

  function lock(i, y) {
    locked = true; stop = y; armed[i] = false;  // each stop fires once per pass
    lockStart = lastDownInput = performance.now();
    window.scrollTo({ top: stop, behavior: 'instant' });
    (function check() {
      if (!locked) return;
      const now = performance.now();
      if (now - lockStart >= HOLD_MAX ||
         (now - lockStart >= HOLD_MIN && now - lastDownInput >= QUIET)) unlock();
      else setTimeout(check, 50);
    })();
  }

  window.addEventListener('scroll', () => {
    const y = window.scrollY, list = stops();

    // re-arm a stop once you're back above it; disarm stops you're already at/past
    list.forEach((s, i) => {
      if (y < s - 80) armed[i] = true;
      else if (window.tlAutoScroll && y >= s - 1) armed[i] = false;
    });

    if (window.tlAutoScroll) { lastY = y; return; }   // nav glide: don't interfere

    if (locked) {
      if (y < stop - 2) { unlock(); lastY = y; return; }          // scrolled up: release at once
      if (y > stop + 1) window.scrollTo({ top: stop, behavior: 'instant' });  // pushed past: pull back
      return;
    }

    const i = list.findIndex((s, k) => armed[k] && lastY <= s && y > s + 1);
    if (i !== -1) lock(i, list[i]);
    lastY = y;
  }, { passive: true });

  // block only downward input while locked (scrolling up is always free)
  window.addEventListener('wheel', e => {
    if (locked && e.deltaY > 0) { lastDownInput = performance.now(); e.preventDefault(); }
  }, { passive: false });
  window.addEventListener('keydown', e => {
    if (locked && ['PageDown', 'ArrowDown', 'End', ' '].includes(e.key)) {
      lastDownInput = performance.now(); e.preventDefault();
    }
  });
})();
// ===== SERVICES HELIX: vertical DNA of cards that swirls with the white fill =====
(function () {
  const host = document.getElementById('helix');
  if (!host) return;

  const services = [
    { src: 'images/alter.jpg',  title: 'Alterations',
      desc: 'Adjustments to clothes you already own: hemming, taking in or letting out seams, shortening sleeves, and resizing so a piece fits you properly.' },
    { src: 'images/custom.jpg', title: 'Custom Tailoring',
      desc: 'Garments made around your own measurements and design ideas, so the fit and finish are made for you.' },
    { src: 'images/made.jpg',   title: 'Made-to-Order',
      desc: 'A new piece sewn to order from the style you choose, made by hand with attention on every stitch.' },
    { src: 'images/repair.jpg', title: 'Repair',
      desc: 'Fixing damaged clothing: torn seams, broken zippers, loose buttons and worn spots, so a favorite piece lasts longer.' }
  ];
  const N     = 10;    // total cards (two strands, interleaved)
  const TURNS = 1.5;   // full rotations from first scroll to full fill
  const STEP  = 0.62;  // twist between neighbouring cards (radians)

  const cards = Array.from({ length: N }, (_, i) => {
    const s = services[i % services.length];
    const el = document.createElement('div');
    el.className = 'hc';
    el.innerHTML = `<img src="${s.src}" alt="${s.title}"><span>${s.title}</span>`;
    host.appendChild(el);
    return el;
  });

  let lastP = 0, extra = 0, speed = 0, lastT = 0;   // extra = angle added by the auto-spin
  let isOpen = false;                               // true while a service panel is showing
  let hovering = false;                             // true while the mouse is on a card

  // ----- comet trails -----
  const TRAIL     = 60;    // tail length vs. speed (bigger = longer tails)
  const TRAIL_MAX = 1.4;   // longest possible tail, in radians of rotation
  const noTrails  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = document.createElement('canvas');
  cv.className = 'hc-trails';
  host.insertBefore(cv, host.firstChild);
  const cx = cv.getContext('2d');
  const angles = new Array(N).fill(0);
  let geo = { W: 0, H: 0, R: 0, span: 0 };
  let trailLen = 0, dir = 1, prevA = null, rendered = false;

  function drawTrails() {
    const { W, H, R, span } = geo;
    const dpr = window.devicePixelRatio || 1;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    }
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx.clearRect(0, 0, W, H);
    if (noTrails || trailLen < 0.01) return;
    cx.globalCompositeOperation = 'lighter';
    cx.lineCap = 'round';
    const SEG = 14;
    for (let i = 0; i < N; i++) {
      const y = H / 2 + (i / (N - 1) - 0.5) * span;
      let px = null;
      for (let s = 0; s <= SEG; s++) {
        const t = s / SEG;                              // 0 = head, 1 = tail tip
        const ang = angles[i] - dir * trailLen * t;     // where the card was a moment ago
        const x = W / 2 + Math.sin(ang) * R;
        const k = (Math.cos(ang) + 1) / 2;              // front cards glow brighter
        if (px !== null) {
          cx.strokeStyle = `rgba(255,214,140,${(1 - t) * (0.25 + 0.55 * k)})`;
          cx.lineWidth = 1 + (1 - t) * 13 * (0.72 + 0.28 * k);
          cx.beginPath(); cx.moveTo(px, y); cx.lineTo(x, y); cx.stroke();
        }
        px = x;
      }
    }
  }

  function updateTrails(W, H, R, span) {
    geo = { W, H, R, span };
    if (prevA !== null) {
      const d = angles[0] - prevA;
      if (Math.abs(d) > 1e-4) dir = Math.sign(d);
      trailLen += (Math.min(TRAIL_MAX, Math.abs(d) * TRAIL) - trailLen) * 0.3;
    }
    prevA = angles[0];
    rendered = true;
    drawTrails();
  }
  function render(p) {
    lastP = p;
    host.classList.toggle('ready', p >= 0.98);      // cards are clickable only when the fill is complete
    host.parentElement.classList.toggle('done', p >= 0.98);   // slide the helix right and the text in
    const W = host.clientWidth, H = host.clientHeight;
    const R = Math.min(W * 0.28, 300);   // helix radius
    const span = H * 0.78;               // vertical length of the helix
    cards.forEach((el, i) => {
      const a = i * STEP + (i % 2) * Math.PI + p * TURNS * 2 * Math.PI + extra;
      angles[i] = a;
      const depth = Math.cos(a);
      const x = Math.sin(a) * R;
      const y = (i / (N - 1) - 0.5) * span;
      const k = (depth + 1) / 2;                       // 0..1
      el.style.transform =
        `translate(-50%, -50%) translate(${x}px, ${y}px) rotateY(${Math.sin(a) * 35}deg) scale(${0.72 + 0.28 * k})`;
      el.style.zIndex = Math.round(k * 100);
      el.style.opacity = 0.45 + 0.55 * k;
    });
    updateTrails(W, H, R, span);
  }

  window.tlHelix = render;
  window.addEventListener('resize', () => render(lastP));

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FULL = 0.98;        // fill progress at which the auto-spin starts
  const AUTO_SPEED = 0.6;   // radians per second (about one turn every 10 s)

  function tick(now) {
    const dt = Math.min(0.05, (now - lastT) / 1000 || 0);
    lastT = now;
    const target = (!reduce && lastP >= FULL && !isOpen && !hovering) ? AUTO_SPEED : 0;
    speed += (target - speed) * Math.min(1, dt * 3);       // ease in and out
    if (speed > 0.001) { extra += speed * dt; render(lastP); }
    if (!rendered && trailLen > 0.005) { trailLen *= 0.86; drawTrails(); }   // tails fade out when still
    rendered = false;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // ----- service detail panel -----
  const detail = document.getElementById('svcDetail');
  const dImg = document.getElementById('svcImg'), dTitle = document.getElementById('svcTitle');
  const dText = document.getElementById('svcText'), dClose = document.getElementById('svcClose');

  function openSvc(s) {
    if (lastP < 0.98) return;
    dImg.src = s.src; dImg.alt = s.title;
    dTitle.textContent = s.title; dText.textContent = s.desc;
    detail.classList.add('open'); detail.setAttribute('aria-hidden', 'false');
    isOpen = true;
    dClose.focus();
  }
  function closeSvc() {
    detail.classList.remove('open'); detail.setAttribute('aria-hidden', 'true');
    isOpen = false;
  }

  cards.forEach((el, i) => el.addEventListener('click', () => openSvc(services[i % services.length])));
  cards.forEach(el => {
    el.addEventListener('mouseenter', () => { hovering = true; });
    el.addEventListener('mouseleave', () => { hovering = false; });
  });
  dClose.addEventListener('click', closeSvc);
  detail.addEventListener('click', e => { if (e.target === detail) closeSvc(); });   // click outside also closes
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) closeSvc(); });

  // lock page scroll while a panel is open (without touching overflow, which breaks the sticky layout)
  const lockScroll = e => { if (isOpen && !e.target.closest('.svc-panel')) e.preventDefault(); };
  window.addEventListener('wheel', lockScroll, { passive: false });
  window.addEventListener('touchmove', lockScroll, { passive: false });
  window.addEventListener('keydown', e => {
    if (isOpen && ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.key)) e.preventDefault();
  });

  render(reduce ? 1 : 0);
})();