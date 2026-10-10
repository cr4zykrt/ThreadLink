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

  const BG_W = 1679, BG_H = 937;      // about-seated.png size
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
    const aboutTop = about.getBoundingClientRect().top + sy;
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