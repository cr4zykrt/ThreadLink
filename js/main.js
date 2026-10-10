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
  return `<div class="rc slot" data-label="Image" style="--r:${(i%2?1:-1)*(8+(i*5)%9)}deg;--y:${Math.round(34*Math.sin(i*1.1))}px">${it ? `<img src="${it.src}" alt="${it.title}" onload="this.parentNode.classList.add('has')" onerror="this.remove()"><span class="rc-title">${it.title}</span>` : ''}</div>`;
};
    rt.innerHTML = Array.from({length: n * 2}, (_, i) => card(i % n)).join('');
  }

  // Mark elements for reveal
  const revealTargets = document.querySelectorAll(
    '.service-card, .availability-card, .availability-copy, .how-steps li, .section-head, .testimonials .carousel'
  );
  revealTargets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(i % 4) * 80}ms`;
  });

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