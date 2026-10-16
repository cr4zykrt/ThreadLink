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

  const PNG_W = 1027, PNG_H = 1532;   // mannequin.png size
  // where the mannequin lands in each seated picture: chairX = centre (left → right), seatY = bottom edge of mannequin.png (top → bottom), size = mannequin.png height / picture height
  const DESK  = { w: 1679, h: 894,  chairX: 0.489, seatY: 0.85,  size: 0.564  };   // about-seated.png (computer)
  const PHONE = { w: 940,  h: 1672, chairX: 0.642, seatY: 0.606, size: 0.2584 };   // phone-about-us-bg-seated.png (phone)

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
    const phone = window.matchMedia('(max-width: 900px)').matches;
    const C = phone ? PHONE : DESK;
    let iw, ih, ox, oy;
    if (phone) {                                        // phone picture is enlarged and nudged up (see the CSS)
      ih = Math.max(1.18 * H, W * C.h / C.w); iw = ih * C.w / C.h;
      ox = (W - iw) / 2; oy = -0.23 * H;
    } else {                                            // computer: background-size: cover
      const k = Math.max(W / C.w, H / C.h);
      iw = C.w * k; ih = C.h * k;
      ox = (W - iw) / 2; oy = (H - ih) / 2;
    }
    const chairX = ox + C.chairX * iw;
    const seatY  = aboutTop + oy + C.seatY * ih;

    const c = Math.min(r.width / PNG_W, r.height / PNG_H);  // object-fit: contain
    const imgH = PNG_H * c;
    gap = (r.height - imgH) / 2;                            // empty space under the picture
    endScale = (C.size * ih) / imgH;
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
  about.querySelectorAll('.commit-list li').forEach((el, i) => el.style.setProperty('--d', i + 3));
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
  const HOLD_VH = 0.7;   // extra scrolling while Services stays pinned (0.7 = 70% of a screen). Bigger = longer lock

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
 window.tlHold = vh * HOLD_VH;
spacer.style.height = (D + window.tlHold) + 'px';   // the extra distance is the lock
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
  const w = document.querySelector('.about-wrap');
return w.offsetTop + w.offsetHeight - window.innerHeight - (window.tlHold || 0);// end of the wipe, not end of page
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
 const armed = [true, true, true];
  let locked = false, stop = 0, lockStart = 0, lastDownInput = 0, lastY = window.scrollY;

  function stops() {
const top = Math.round(wrap.getBoundingClientRect().top + window.scrollY);
const pr = document.getElementById('pricing');
return [top, Math.round(top + wrap.offsetHeight - window.innerHeight - (window.tlHold || 0)), pr ? Math.round(pr.getBoundingClientRect().top + window.scrollY) : 1e9];
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
  const phone = () => window.matchMedia('(max-width: 900px)').matches;
  const lean  = (W, y, span) => {                    // phones: the helix hugs the right edge beside the text, then swings left underneath it
    if (!phone()) return 0;
    const t = y / span + 0.5, s = Math.min(1, Math.max(0, (t - 0.68) / 0.32));
    return W * (0.22 - 0.42 * s * s * (3 - 2 * s));
  };
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
        const x = W / 2 + Math.sin(ang) * R + lean(W, (i / (N - 1) - 0.5) * span, span);
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
    const R = Math.min(W * (phone() ? 0.15 : 0.28), 300);   // helix radius
    const span = H * 0.78;               // vertical length of the helix
    cards.forEach((el, i) => {
      const a = i * STEP + (i % 2) * Math.PI + p * TURNS * 2 * Math.PI + extra;
      angles[i] = a;
      const depth = Math.cos(a);
      const y = (i / (N - 1) - 0.5) * span;
      const x = Math.sin(a) * R + lean(W, y, span);
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
// ===== PRICING SLIDER =====
(function () {
  const stage = document.getElementById('prStage');
  if (!stage) return;

  // >>> EDIT YOUR GARMENTS HERE <<<
  // img   : transparent PNG in images/pricing/
  // color : background color of that slide    tone: 'light' = white text, 'dark' = black text
  // price : type your real price              ghost: the big faded word behind the garment
const items = [
  { name: 'Barong Tagalog', ghost: 'Barong',      price: '₱000', color: '#3a2c1f', ink: '#efe3c8', img: 'images/pricing/barong.png',      desc: 'Short description of this service.' },
{ name: 'Filipiniana', ghost: 'Filipiniana', price: '₱000', color: '#14241c', ink: '#e8d9a8', img: 'images/pricing/filipiniana.png', desc: 'Short description of this service.' },
{ name: 'Uniform',        ghost: 'Uniform',     price: '₱000', color: '#2b2830', ink: '#d9bde6', img: 'images/pricing/uniform.png',     desc: 'Short description of this service.' },
{ name: 'Dress',          ghost: 'Dress',       price: '₱000', color: '#566176', ink: '#f1f3f7', img: 'images/pricing/dress.png',       desc: 'Short description of this service.' }
];

  const $ = id => document.getElementById(id);
  const name = $('prName'), desc = $('prDesc'), ghost = $('prGhost'), img = $('prImg'),
        hero = $('prHero'), ph = $('prPh'), thumbs = $('prThumbs'), dots = $('prDots'), wipe = $('prWipe');
  let cur = 0, busy = false;

  thumbs.innerHTML = items.map((it, i) =>
    `<button type="button" class="pr-thumb" data-i="${i}"><img src="${it.img}" alt="" onerror="this.outerHTML='<div class=&quot;t-ph&quot;></div>'"><div><b>${it.name}</b><span>${it.price}</span></div></button>`).join('');
  dots.innerHTML = items.map(() => '<i></i>').join('');

  function fill(i) {
    const it = items[i];
    name.textContent = it.name;
    desc.textContent = it.desc;
    ghost.textContent = it.ghost;
    $('prAmount').textContent = it.price;
    ph.textContent = 'Put ' + it.img.split('/').pop() + ' in images/pricing/';
    hero.classList.remove('noimg');
    img.hidden = false;
    img.onerror = () => { img.hidden = true; hero.classList.add('noimg'); };
    img.src = it.img; img.alt = it.name;
    stage.style.setProperty('--pr-ink', it.ink);
    thumbs.querySelectorAll('.pr-thumb').forEach((b, k) => b.classList.toggle('on', k === i));
    dots.querySelectorAll('i').forEach((d, k) => d.classList.toggle('on', k === i));
  }

  function go(i) {
    i = (i + items.length) % items.length;
    if (busy || i === cur) return;
    busy = true;
    stage.style.setProperty('--pr-next', items[i].color);
    stage.classList.add('swap', 'wiping');                                  // old content blurs out, new color slides in
    setTimeout(() => { fill(i); stage.classList.remove('swap'); }, 380);    // swap while the color covers the middle
    setTimeout(() => {
      stage.style.setProperty('--pr-bg', items[i].color);                   // new color becomes permanent
      wipe.style.transition = 'none';
      stage.classList.remove('wiping');                                     // snap the wipe layer back off-screen
      void wipe.offsetWidth;
      wipe.style.transition = '';
      cur = i; busy = false;
    }, 800);
  }

  thumbs.addEventListener('click', e => { const b = e.target.closest('.pr-thumb'); if (b) go(+b.dataset.i); });
  $('prPrev').addEventListener('click', () => go(cur - 1));
  $('prNext').addEventListener('click', () => go(cur + 1));

  stage.style.setProperty('--pr-bg', items[0].color);
  fill(0);
  new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) stage.classList.add('drop');
  else if (e.intersectionRatio === 0) stage.classList.remove('drop');
}), { threshold: [0, 0.2] }).observe(stage);
})();
// fall-in: play when the section comes into view, reset when it is fully off-screen so it replays
// ===== CONTACT FORM + "BOOK A SERVICE" + MAP ZOOM (front end only, not connected to a backend yet) =====
(function () {
  const form = document.getElementById('ctForm');
  if (form) {
    const note = document.getElementById('ctNote');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const d = new FormData(form);
      if (!d.get('name').trim() || !d.get('message').trim()) { note.textContent = 'Please enter your name and a message.'; return; }
      // >>> CONNECT YOUR BACKEND HERE <<<
      note.textContent = "Thanks! The form isn't connected to the system yet.";
      form.reset();
    });
  }
  const chat = document.getElementById('ctChat'), fab = document.getElementById('chatFab');
  if (chat && fab) chat.addEventListener('click', () => {
    if (fab.getAttribute('aria-expanded') !== 'true') fab.click();   // opens the ThreadLink assistant
  });
  const frame = document.getElementById('ctMapFrame');
  if (frame) {
    let z = 16;
    const set = n => { z = Math.max(12, Math.min(19, n)); frame.src = 'https://maps.google.com/maps?q=11.2115629,125.0016377&z=' + z + '&output=embed'; };
    document.getElementById('ctZin').addEventListener('click', () => set(z + 1));
    document.getElementById('ctZout').addEventListener('click', () => set(z - 1));
  }
})();

// ===== PHONES: menu button, and a touch version of the "stop at each section" scroll gate =====
(function () {
  if (!window.matchMedia('(pointer: coarse)').matches) return;
  Object.defineProperty(window, 'tlAutoScroll', { get: () => true, set: () => {} });   // turns off the desktop (mouse-wheel) gate

  const wrap = document.querySelector('.about-wrap');
  const pr = document.getElementById('pricing'), ct = document.getElementById('contact');
  const HOLD = 700;                                   // ms the page stays stopped at each section
  const armed = [true, true, true, true];
  let locked = false, lastY = window.scrollY, navUntil = 0, stopY = 0;

  const abs = el => Math.round(el.getBoundingClientRect().top + window.scrollY);
  function stops() {
    if (!wrap) return [];
    return [
      abs(wrap),                                                                         // About
      Math.round(abs(wrap) + wrap.offsetHeight - window.innerHeight - (window.tlHold || 0)),   // Services (fill is full)
      pr ? abs(pr) : 1e9,                                                                // Pricing
      ct ? abs(ct) : 1e9                                                                 // Contact
    ];
  }
  function lock(i, y) {
    locked = true; armed[i] = false; stopY = y;
    window.scrollTo({ top: y, behavior: 'instant' });
    setTimeout(() => { locked = false; lastY = window.scrollY; }, HOLD);
  }
  window.addEventListener('scroll', () => {
    const y = window.scrollY, list = stops();
    list.forEach((s, i) => { if (y < s - 80) armed[i] = true; else if (performance.now() < navUntil && y >= s - 1) armed[i] = false; });
    if (locked) {
      if (y < stopY - 2) { locked = false; lastY = y; return; }          // scrolled up: release at once
      if (y > stopY + 1) window.scrollTo({ top: stopY, behavior: 'instant' });   // pushed down: hold the stop
      return;
    }
    if (performance.now() < navUntil) { lastY = y; return; }          // menu glide: don't interfere
    const i = list.findIndex((s, k) => armed[k] && lastY <= s && y > s + 1);
    if (i !== -1) lock(i, list[i]);
    lastY = y;
  }, { passive: true });

  // ----- menu button + full-screen menu -----
  const links = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!links.length) return;
  const burger = document.createElement('button');
  burger.className = 'm-burger'; burger.type = 'button'; burger.setAttribute('aria-label', 'Menu');
  burger.innerHTML = '<span></span><span></span><span></span>';
  const menu = document.createElement('nav');
  menu.className = 'm-menu';
  function close() { burger.classList.remove('open'); menu.classList.remove('open'); }
  links.forEach(a => {
    const m = document.createElement('a');
    m.href = a.getAttribute('href'); m.textContent = a.textContent;
    m.addEventListener('click', e => {
      e.preventDefault(); close();
      navUntil = performance.now() + 1900;                            // the glide below must not trigger the gate
      setTimeout(() => a.click(), 250);                               // reuse the page's own smooth scroll
    });
    menu.appendChild(m);
  });
  burger.addEventListener('click', () => { burger.classList.toggle('open'); menu.classList.toggle('open'); });
  document.body.append(menu, burger);
})();