/* =============================
   Scroll Animation Site — JS
   (Keep top visible; hide only when scrolling UP & element leaves at bottom)
   ============================= */
const certScroller = document.querySelector('.certificate-scroller');
if(certScroller){
  certScroller.addEventListener('wheel', (e)=>{
    if(Math.abs(e.deltaY) > Math.abs(e.deltaX)){  // ถ้าเลื่อนลง
      e.preventDefault();
      certScroller.scrollLeft += e.deltaY;       // เปลี่ยนเป็นเลื่อนไปขวา
    }
  }, {passive:false});
}

(function(){
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    const progress = document.getElementById('scrollProgress');
    const backTop  = document.getElementById('backTop');

    let lastY = window.scrollY;
    let scrollDir = 'down'; // 'down' | 'up'
    function updateScrollDirNow() {
    const y = window.scrollY;
    scrollDir = (y > lastY) ? 'down' : (y < lastY) ? 'up' : scrollDir;
    lastY = y;
    }

  /* -------- Intersection Observer -------- */
    const io = new IntersectionObserver((entries) => {
    updateScrollDirNow();
        for (const e of entries) {
            const el = e.target;

            // ขอบจริงของกรอบสังเกต (มีผลจาก rootMargin แล้ว)
            const rootTop    = e.rootBounds ? e.rootBounds.top    : 0;
            const rootBottom = e.rootBounds ? e.rootBounds.bottom : window.innerHeight;

            // element อยู่นอกเฟรมด้านไหน
            const rect = e.boundingClientRect;
            const exitedAtBottom = rect.top >= rootBottom;

            // จัดการ delay ต่อ element
            const delay = parseInt(el.getAttribute('data-anim-delay') || '0', 10);
            el.style.transitionDelay = delay ? `${delay}ms` : '';

            if (e.isIntersecting) {
            // เข้า viewport -> แสดง และล้างสถานะ exit ถ้ามี
            el.classList.add('in');
            el.classList.remove('exit-side');
            el.removeAttribute('data-exiting');

            if (el.matches('.skill')) startBar(el);
            } else {
            // ออกจาก viewport
            // เลื่อนขึ้น และหลุดเฟรมด้านล่าง -> ให้สลายไปด้านข้าง
            if (scrollDir === 'up' && exitedAtBottom) {
                // กันสั่งซ้ำ
                if (el.dataset.exiting === '1') continue;
                el.dataset.exiting = '1';

                // ถ้าเป็น skill ให้รีเซ็ตตัวเลข/บาร์หลังอนิเมชันจบ (ไม่ใช่ทันที)
                const isSkill = el.matches('.skill');

                // ใส่คลาสเอฟเฟกต์สลายด้านข้าง
                el.classList.remove('in');
                el.classList.add('exit-side');

                const onDone = () => {
                el.classList.remove('exit-side');
                el.removeEventListener('animationend', onDone);
                el.removeAttribute('data-exiting');
                if (isSkill) resetBar(el);
                };
                el.addEventListener('animationend', onDone);
            }
            }
        }
        }, { rootMargin: '0px 0px -5% 0px', threshold: [0, 0.15] });

/* === Bubble Nav: fixed layout + motion === */
(function(){
  const container = document.querySelector('.bubble-nav');
  if (!container) return;

  const bubbles = [...container.querySelectorAll('.bubble-link')];

  // 🔒 พิกัด fix (ปรับเลขได้เลย)
  const positions = [
    {x: 20,  y:  3},   // bubble 1
    {x: 120, y: 20},   // bubble 2
    {x: 10,  y: 35},   // bubble 3
    {x: 140, y: 50},   // bubble 4
    {x: 5,  y: 70},   // bubble 5
    {x: 160, y: 85},   // bubble 6
    {x: 0,  y: 100}    // bubble 7
  ];

  bubbles.forEach((el, i) => {
    if (positions[i]) {
      el.style.setProperty('--x', positions[i].x + 'px');
      el.style.setProperty('--y', positions[i].y + '%');
    }
    // z-index ตามขนาด (ฟองใหญ่ชั้นบน)
    const sz = parseFloat(getComputedStyle(el).getPropertyValue('--sz')) || (90 - i*8);
    el.style.zIndex = String(100 + Math.round(sz));
  });

  // 🎈 Motion (pulse + sway) ยังคงสุ่มเพื่อไม่ให้ฟองแกว่งพร้อมกัน
  bubbles.forEach((el) => {
    const durY  = (4.8 + Math.random()*2.8).toFixed(2) + 's';
    const durX  = (3.0 + Math.random()*2.4).toFixed(2) + 's';
    const amp   = (8 + Math.random()*14).toFixed(1) + 'px';
    const shift = (6 + Math.random()*14).toFixed(1) + 'px';
    const delay = (Math.random()*-2).toFixed(2) + 's';

    el.style.setProperty('--durY',  durY);
    el.style.setProperty('--durX',  durX);
    el.style.setProperty('--amp',   amp);
    el.style.setProperty('--shift', shift);
    el.style.setProperty('--delay', delay);
  });

  // ScrollSpy (active bubble)
  const ids = ['home','about','skills','gallery','timeline','projects','contact'];
  const map = new Map(ids.map(id => [id, container.querySelector(`.bubble-link[data-target="${id}"]`)]));
  function setActive(id){
    bubbles.forEach(b => b.classList.remove('active'));
    if (id && map.get(id)) map.get(id).classList.add('active');
  }
  window.__setActiveBubble = setActive;
})();
document.querySelectorAll('.bubble-link').forEach(bubble => {
  bubble.addEventListener('click', e => {
    e.preventDefault();

    // 1. แตกก่อน
    bubble.classList.add('burst');

    // 2. หลังแตกเสร็จ → reset แล้ว respawn
    const inner = bubble.querySelector('.inner');
    inner.addEventListener('animationend', function handler() {
      if (bubble.classList.contains('burst')) {
        bubble.classList.remove('burst');
        bubble.classList.add('respawn');

        // ลบ respawn หลังเสร็จ
        inner.addEventListener('animationend', function respawnDone() {
          bubble.classList.remove('respawn');
          inner.removeEventListener('animationend', respawnDone);
        });
      }
      inner.removeEventListener('animationend', handler);
    });

    // 3. Scroll ไปยัง section
    const targetId = bubble.getAttribute('href');
    const targetEl = document.querySelector(targetId);
    if (targetEl) {
      const navHeight = document.querySelector('.navbar')?.offsetHeight || 0;
      const top = targetEl.getBoundingClientRect().top + window.scrollY - navHeight - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
// ===== Bubble burst particles on click =====
(() => {
  const container = document.querySelector('.bubble-nav');
  if (!container) return;

  const bubbles = container.querySelectorAll('.bubble-link');

  bubbles.forEach(bubble => {
    bubble.addEventListener('click', (e) => {
      // ถ้าต้องการเลื่อนไป section ด้วย ให้คง preventDefault แล้วเลื่อนเองด้านล่าง
      e.preventDefault();

      // จุดกำเนิดอนุภาค = กึ่งกลางฟอง (ภายใน .bubble-link)
      const r = bubble.getBoundingClientRect();
      const cx = r.width  / 2;
      const cy = r.height / 2;

      // ทำสถานะ "กำลังแตก"
      bubble.classList.add('bursting');

      // จำนวนอนุภาค + สุ่มทิศ/ระยะ/ขนาด/เวลา
      const N = 18; // ปรับได้
      const frag = document.createDocumentFragment();

      for (let i = 0; i < N; i++) {
        const p = document.createElement('span');
        p.className = 'bubble-particle';

        // มุม: กระจายรอบวง + jitter
        const angle = (i / N) * Math.PI * 2 + (Math.random() * 0.45 - 0.225);
        // ระยะพุ่ง (px)
        const dist = 40 + Math.random() * 90;
        // ออฟเซ็ตปลายทาง
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist * (0.85 + Math.random()*0.3); // ยืดแนวตั้งนิด

        // ขนาดเม็ดฟอง
        const ps = 8 + Math.random() * 14; // 8..22px
        // ระยะเวลา
        const dur = 520 + Math.random() * 260; // 520..780ms

        // center relative to bubble
        p.style.setProperty('--cx',  cx + 'px');
        p.style.setProperty('--cy',  cy + 'px');
        p.style.setProperty('--dx',  dx + 'px');
        p.style.setProperty('--dy',  dy + 'px');
        p.style.setProperty('--ps',  ps + 'px');
        p.style.setProperty('--dur', dur + 'ms');

        // วาง particle โดย relative กับ bubble เอง (position: absolute ของ .bubble-link ใช้ได้)
        bubble.appendChild(p);

        // ลบตัวเองเมื่อจบแอนิเมชัน
        p.addEventListener('animationend', () => p.remove());
      }

      // หลังแตกเสร็จนิดหน่อย → respawn ฟอง
      const RESPAWN_DELAY = 420; // ms
      setTimeout(() => {
        bubble.classList.remove('bursting');
        bubble.classList.add('respawn');
        // เอา respawn ออกหลังจบ
        const inner = bubble.querySelector('.inner');
        const onEnd = () => {
          bubble.classList.remove('respawn');
          inner && inner.removeEventListener('animationend', onEnd);
        };
        inner && inner.addEventListener('animationend', onEnd);
      }, RESPAWN_DELAY);

      // เลื่อนไปยัง section เป้าหมาย
      const href = bubble.getAttribute('href');
      const tgt = href ? document.querySelector(href) : null;
      if (tgt) {
        const nav = document.querySelector('.navbar');
        const NAV_OFFSET = nav ? nav.offsetHeight : 0;
        const top = Math.max(0, tgt.getBoundingClientRect().top + window.scrollY - NAV_OFFSET - 8);
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
})();


        // ผูก element ที่มี data-anim
    document.querySelectorAll('[data-anim]').forEach(el => io.observe(el));

        // คำนวณกรอบ root ที่สอดคล้องกับ rootMargin: '0px 0px -5% 0px'
    function getRootBoundsNow() {
    const top = 0;
    const bottom = window.innerHeight * 0.95; // -5% ด้านล่าง
    return { top, bottom };
    }

    function isInViewNow(el) {
    const { top, bottom } = getRootBoundsNow();
    const r = el.getBoundingClientRect();
    return r.bottom > top && r.top < bottom;
    }

    // บังคับโชว์ item ที่กำลังอยู่ในจอ “ตอนนี้เลย”
    // และรีสตาร์ทสกิลบาร์ให้ตรงกับสถานะ .in
    function revealInViewNow() {
    document.querySelectorAll('[data-anim]').forEach(el => {
      if (isInViewNow(el)) {
        el.classList.add('in');
        el.classList.remove('exit-side');
        el.removeAttribute('data-exiting');

        if (el.matches('.skill')) {
          startBar(el); // ให้บาร์ไปตามค่าปัจจุบัน // PATCH
        }
      }
    });
  }
  function getTargetPercent(skillEl){
    // 1) data-percent ถ้ามี
    const dataPct = skillEl.getAttribute('data-percent');
    if (dataPct != null) {
      const n = parseInt(dataPct, 10);
      if (!Number.isNaN(n)) return n;
    }
    // 2) CSS var --pct (เช่น "72%")
    const val = getComputedStyle(skillEl).getPropertyValue('--pct').trim();
    if (val.endsWith('%')) {
      const n = parseFloat(val.slice(0, -1));
      if (!Number.isNaN(n)) return n;
    }
    return 0;
  }
  

  /* -------- Parallax -------- */
    const pxLayers = [...document.querySelectorAll('[data-parallax]')];
    function parallax(){
        const y = window.scrollY;
        for (const el of pxLayers) {
        const sp = parseFloat(el.getAttribute('data-parallax')) || 0.2;
        el.style.transform = `translateY(${y * sp}px)`;
        }
    }

    let ticking = false;
    function onScroll(){
        if (!ticking) {
        requestAnimationFrame(() => {
            updateScrollDirNow();

            const docH = document.documentElement.scrollHeight - window.innerHeight;
            const p = docH > 0 ? (window.scrollY / docH) * 100 : 0;
            if (progress) progress.style.width = `${p}%`;

            backTop?.classList.toggle('show', window.scrollY > 600);

            parallax();
            pinHorizontal();

            ticking = false;
            const bubbleNav = document.querySelector('.bubble-nav');
            if (bubbleNav) {
              bubbleNav.classList.toggle('is-visible', window.scrollY > 120);
            }
        });
        ticking = true;
        }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* -------- Back to top -------- */
    backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    /* -------- Smooth in-page nav (with true top & offset) -------- */
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;

      const id = a.getAttribute('href').slice(1);
      const tgt = id ? document.getElementById(id) : null;

      // กันกระพริบ/กระตุกจากการกระโดด hash เอง
      e.preventDefault();

      // คำนวณความสูง navbar (ถ้ามี)
      const nav = document.querySelector('.navbar');
      const NAV_OFFSET = nav && getComputedStyle(nav).display !== 'none'
        ? nav.offsetHeight
        : 0;

      // ถ้าคลิก Home ให้เลื่อนขึ้นบนสุดจริงๆ
      if (id === 'home' || !tgt) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        history.replaceState(null, '', '#home'); // อัปเดต hash ให้สวย
        return;
      }

      // ตำแหน่งที่จะเลื่อนไป = ตำแหน่งจริงของ element - offset ของ navbar - เผื่ออีกนิด
      const targetTop = Math.max(
        0,
        tgt.getBoundingClientRect().top + window.pageYOffset - NAV_OFFSET - 8
      );

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
      history.replaceState(null, '', `#${id}`);
});

    /* -------- Skills bars & counters (replay-safe) -------- */
  const rafs = new WeakMap();

  function startBar(skillEl){
    cancelBarRAF(skillEl);

    const bar = skillEl.querySelector('.bar i');
    const countEl = skillEl.querySelector('.count');
    const target = getTargetPercent(skillEl); // PATCH

    if (bar) {
      bar.style.transition = 'none';
      // เริ่มจาก 0 เพื่อให้เห็นการไหลชัดขึ้น
      bar.style.width = '0%';
      void bar.offsetWidth; // force reflow
      bar.style.transition = 'width 1.1s cubic-bezier(.22,1,.36,1)'; // PATCH
      bar.style.width = target + '%';
    }

    if (!countEl) return;
    const dur = 1100; // นานขึ้นนิดให้ sync กับ bar // PATCH
    const t0 = performance.now();
    function tick(t){
      const k = Math.min(1, (t - t0) / dur);
      const n = Math.round(target * (1 - Math.pow(1 - k, 3))); // easeOutCubic
      countEl.textContent = n + '%';
      if (k < 1) {
        const id = requestAnimationFrame(tick);
        rafs.set(skillEl, id);
      }
    }
    const id = requestAnimationFrame(tick);
    rafs.set(skillEl, id);
  }

    function resetBar(skillEl){
        cancelBarRAF(skillEl);
        const bar = skillEl.querySelector('.bar i');
        const countEl = skillEl.querySelector('.count');
        if (bar) {
        bar.style.transition = 'none';
        bar.style.width = '0%';
        }
        if (countEl) countEl.textContent = '0%';
    }

    function cancelBarRAF(el){
        const id = rafs.get(el);
        if (id) cancelAnimationFrame(id);
        rafs.delete(el);
    }

    function easeOutCubic(x){ return 1 - Math.pow(1 - x, 3); }

    /* -------- Pinned horizontal scrolling (คงเดิม) -------- */
    const pinSection = document.querySelector('[data-pin]');
    const hTrack = document.getElementById('hScroll');
    let pinTop = 0, pinHeight = 0, maxShift = 0;

    function measurePin(){
        if (!pinSection || !hTrack) return;
        const rect = pinSection.getBoundingClientRect();
        const pageTop = window.scrollY + rect.top;
        pinTop = pageTop;
        pinHeight = rect.height;
        const trackWidth = hTrack.scrollWidth;
        maxShift = Math.max(0, trackWidth - window.innerWidth);
    }

    function pinHorizontal(){
        if (!pinSection || !hTrack) return;
        const y = window.scrollY;
        const start = pinTop - window.innerHeight * 0.1;
        const end   = pinTop + pinHeight;
        if (y < start || y > end) return;
        const prog = Math.min(1, Math.max(0, (y - start) / (end - start)));
        const x = -maxShift * prog;
        hTrack.style.transform = `translateX(${x}px)`;
    }
    window.addEventListener('load', () => {
      measurePin();
      pinHorizontal();
      revealInViewNow();
      onScroll(); // sync bubble-nav visibility ตอนเริ่มโหลด
    });
    })();

    /* === Anime Hover JS pack === */
(function(){
  // เป้าหมายที่อยากให้มีเอฟเฟกต์
  const hoverTargets = document.querySelectorAll('.card, .skill, .t-card, .shot, .btn');

  // 1) Focus-light: อัปเดต --mx/--my ตามตำแหน่งเมาส์ภายในกล่อง
  hoverTargets.forEach(el=>{
    el.addEventListener('mousemove', (ev)=>{
      const r = el.getBoundingClientRect();
      const x = ((ev.clientX - r.left) / r.width) * 100;
      const y = ((ev.clientY - r.top)  / r.height) * 100;
      el.style.setProperty('--mx', x + '%');
      el.style.setProperty('--my', y + '%');
    });
  });

  // 2) Ripple สำหรับปุ่ม
  document.addEventListener('click', (ev)=>{
    const btn = ev.target.closest('.btn');
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const x = ev.clientX - r.left;
    const y = ev.clientY - r.top;
    const span = document.createElement('span');
    span.className = 'ripple';
    span.style.left = x + 'px';
    span.style.top  = y + 'px';
    // ขยายตามขนาดปุ่ม
    const maxD = Math.max(r.width, r.height) * 2.2;
    span.style.width = span.style.height = maxD + 'px';
    btn.appendChild(span);
    span.addEventListener('animationend', ()=> span.remove());
  });

  // 3) Tilt อินเทอร์แอคทีฟ (แทน hover-rotate เดิมให้ลื่นขึ้น)
  const tiltEls = document.querySelectorAll('[data-tilt]');
  tiltEls.forEach(el=>{
    let rafId = 0, ax=0, ay=0, tx=0, ty=0;

    const damp = 0.12; // แรงหน่วง (ยิ่งน้อยยิ่งหนึบ)
    const maxDeg = 8;  // องศาสูงสุด

    function animate(){
      // ไล่เข้าเป้าด้วย easing
      tx += (ax - tx) * damp;
      ty += (ay - ty) * damp;
      el.style.transform = `rotateX(${ty}deg) rotateY(${tx}deg)`;
      rafId = requestAnimationFrame(animate);
    }

    function onEnter(){
      el.classList.add('is-tilting');
      if (!rafId) rafId = requestAnimationFrame(animate);
    }
    function onMove(ev){
      const r = el.getBoundingClientRect();
      const px = (ev.clientX - r.left) / r.width - 0.5;  // -0.5..0.5
      const py = (ev.clientY - r.top)  / r.height - 0.5;
      ax =  (px * 2) * maxDeg;  // แนวนอน → rotateY
      ay = -(py * 2) * maxDeg;  // แนวตั้ง → rotateX
    }
    function onLeave(){
      el.classList.remove('is-tilting');
      ax = ay = 0; // กลับศูนย์
      // รอให้ easing กลับศูนย์เสร็จแล้วค่อยหยุด rAF
      setTimeout(()=>{ cancelAnimationFrame(rafId); rafId = 0; }, 180);
    }

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
  });
})();

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

// เปิด Lightbox
document.querySelectorAll('.cert img').forEach(img=>{
  img.addEventListener('click', ()=>{
    lightbox.classList.add('active');
    lightboxImg.src = img.src;
    lightboxImg.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg)";
  });
});

// ปิดเมื่อคลิกพื้นหลังดำ
lightbox.addEventListener('click', (e)=>{
  if(e.target === lightbox){
    lightbox.classList.remove('active');
  }
});

// ===== 3D Tilt effect =====
lightbox.addEventListener('mousemove', (e)=>{
  const rect = lightbox.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;   // 0..1
  const y = (e.clientY - rect.top) / rect.height;  // 0..1

  const rotateX = (0.5 - y) * 20;  // เอียงขึ้นลง
  const rotateY = (x - 0.5) * 20;  // เอียงซ้ายขวา

  lightboxImg.style.transform =
    `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
});

// รีเซ็ตตอน mouse ออก
lightbox.addEventListener('mouseleave', ()=>{
  lightboxImg.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg)";
});
