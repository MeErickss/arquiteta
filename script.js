/* ==========================================
   ROSETTO ARQUITETURA — SCRIPTS
   ========================================== */

// ---------- NAV SCROLL ----------
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// ---------- MOBILE MENU (drawer lateral) ----------
const navToggle    = document.getElementById('navToggle');
const mobileMenu   = document.getElementById('mobileMenu');
const mobileClose  = document.getElementById('mobileClose');
const mobileBackdrop = document.getElementById('mobileBackdrop');
const mobileLinks  = mobileMenu.querySelectorAll('.mobile-menu__link');

function openMenu() {
  mobileMenu.classList.add('open');
  mobileBackdrop.classList.add('open');
  navToggle.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeMenu() {
  mobileMenu.classList.remove('open');
  mobileBackdrop.classList.remove('open');
  navToggle.classList.remove('active');
  document.body.style.overflow = '';
}
navToggle.addEventListener('click', () => {
  mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
});
mobileClose.addEventListener('click', closeMenu);
mobileBackdrop.addEventListener('click', closeMenu);
mobileLinks.forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMenu();
});

// ---------- SCROLL REVEAL ----------
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'),
                   (entry.target.dataset.delay || 0));
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);
document.querySelectorAll('.reveal').forEach((el) => {
  const siblings = el.parentElement.querySelectorAll('.reveal');
  el.dataset.delay = Array.from(siblings).indexOf(el) * 80;
  revealObserver.observe(el);
});

// ---------- PINCELADA AMARELA ATRÁS DOS TÍTULOS ----------
// Injeta uma SVG de pincelada em cada .section-header e revela quando entra no viewport
const brushSVG = `
<svg class="brushstroke" viewBox="0 0 220 38" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M5 22 C 30 8, 60 32, 95 18 S 160 6, 215 20"
        stroke="#F6E7A6" stroke-width="22" fill="none"
        stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
  <path d="M10 26 C 45 18, 80 30, 130 22 S 200 18, 212 24"
        stroke="#C9A84C" stroke-width="3" fill="none"
        stroke-linecap="round" opacity="0.5"/>
</svg>`;
document.querySelectorAll('.section-header').forEach(h => {
  h.insertAdjacentHTML('afterbegin', brushSVG);
});
const paintObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('painted'), 200);
      paintObs.unobserve(e.target);
    }
  });
}, { threshold: 0.4 });
document.querySelectorAll('.section-header').forEach(h => paintObs.observe(h));

// ---------- CONTADORES ANIMADOS NAS STATS ----------
const counters = document.querySelectorAll('.sobre__stat-num');
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const raw = el.textContent.trim();
    // captura prefixo, número e sufixo (+120, 8, 100%)
    const m = raw.match(/^([^\d-]*)(-?\d+(?:[.,]\d+)?)(.*)$/);
    if (!m) return;
    const prefix = m[1], target = parseFloat(m[2].replace(',', '.')), suffix = m[3];
    const dur = 1500, start = performance.now();
    function tick(t) {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(target * eased);
      el.textContent = prefix + val + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.classList.add('counted');
    }
    requestAnimationFrame(tick);
    counterObs.unobserve(el);
  });
}, { threshold: 0.5 });
counters.forEach(c => counterObs.observe(c));

// ---------- PORTFOLIO FILTER ----------
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioCards = document.querySelectorAll('.portfolio-card');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    portfolioCards.forEach(card => {
      if (filter === 'all' || card.dataset.category === filter) {
        card.classList.remove('hidden');
        card.style.animation = 'none';
        requestAnimationFrame(() => {
          card.style.animation = 'fadeIn 0.4s ease forwards';
        });
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// ---------- TILT 3D NOS CARDS DO PORTFÓLIO ----------
portfolioCards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(900px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-4px)`;
    const img = card.querySelector('.portfolio-card__img');
    if (img) img.style.transform = `scale(1.04) translate(${x * 8}px, ${y * 8}px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    const img = card.querySelector('.portfolio-card__img');
    if (img) img.style.transform = '';
  });
});

// ---------- DEPOIMENTOS CAROUSEL ----------
const track = document.getElementById('depoimentosTrack');
const dotsContainer = document.getElementById('depoimentosDots');
const cards = track.querySelectorAll('.depoimento-card');
let currentSlide = 0;
let autoSlide;
function isMobile() { return window.innerWidth <= 768; }
const VISIBLE = 3;
function totalSlides() { return cards.length - VISIBLE + 1; }
function buildDots() {
  dotsContainer.innerHTML = '';
  if (isMobile()) return;
  for (let i = 0; i < totalSlides(); i++) {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Depoimento ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  }
}
function goTo(index) {
  if (isMobile()) return;
  currentSlide = Math.min(Math.max(index, 0), totalSlides() - 1);
  const gap = parseFloat(getComputedStyle(track).gap) || 24;
  const cardWidth = cards[0].getBoundingClientRect().width + gap;
  track.style.transform = `translateX(-${currentSlide * cardWidth}px)`;
  dotsContainer.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentSlide);
  });
}
function startAuto() {
  clearInterval(autoSlide);
  if (isMobile()) return;
  autoSlide = setInterval(() => {
    goTo(currentSlide + 1 >= totalSlides() ? 0 : currentSlide + 1);
  }, 4500);
}
function initCarousel() {
  track.style.transform = '';
  if (!isMobile()) { goTo(0); buildDots(); startAuto(); }
}
initCarousel();
track.addEventListener('mouseenter', () => clearInterval(autoSlide));
track.addEventListener('mouseleave', startAuto);
window.addEventListener('resize', () => { currentSlide = 0; initCarousel(); });

// Drag to scroll
let isDragging = false;
let startPos = 0;
let currentTranslate = 0;
let prevTranslate = 0;

track.style.cursor = 'grab';

track.addEventListener('mousedown', (e) => {
  if (isMobile()) return;
  isDragging = true;
  startPos = e.pageX;
  track.style.cursor = 'grabbing';
  clearInterval(autoSlide);
  track.style.transition = 'none';
  const gap = parseFloat(getComputedStyle(track).gap) || 24;
  const cardWidth = cards[0].getBoundingClientRect().width + gap;
  prevTranslate = -currentSlide * cardWidth;
});

window.addEventListener('mouseup', () => {
  if (!isDragging || isMobile()) return;
  isDragging = false;
  track.style.cursor = 'grab';
  track.style.transition = 'transform 0.5s ease';
  
  const gap = parseFloat(getComputedStyle(track).gap) || 24;
  const cardWidth = cards[0].getBoundingClientRect().width + gap;
  const movedBy = currentTranslate - prevTranslate;
  
  if (movedBy < -100 && currentSlide < totalSlides() - 1) currentSlide += 1;
  else if (movedBy > 100 && currentSlide > 0) currentSlide -= 1;
  
  goTo(currentSlide);
  startAuto();
});

window.addEventListener('mousemove', (e) => {
  if (isDragging && !isMobile()) {
    const currentPosition = e.pageX;
    currentTranslate = prevTranslate + currentPosition - startPos;
    track.style.transform = `translateX(${currentTranslate}px)`;
  }
});

// ---------- CONTACT FORM ----------
const form = document.getElementById('contatoForm');
const formSuccess = document.getElementById('formSuccess');
const projectChips = document.querySelectorAll('.project-chip');
const tipoSelect = document.getElementById('tipo');
const mensagemField = document.getElementById('mensagem');
const projectGuideNote = document.getElementById('projectGuideNote');

const projectGuideCopy = {
  reformar: {
    note: 'Conte o que hoje não funciona no espaço. A gente começa escutando antes de desenhar.',
    placeholder: 'Me conte o que você quer transformar: cômodos, incômodos, estilo desejado, prazo e se a obra já tem data.'
  },
  decorar: {
    note: 'Vamos entender o clima que você quer sentir ao entrar no ambiente.',
    placeholder: 'Me conte quais ambientes precisam de decoração, o estilo que você imagina e o que deseja manter.'
  },
  construir: {
    note: 'Do terreno ao primeiro croqui, organizamos as decisões para a casa nascer com intenção.',
    placeholder: 'Me conte sobre o terreno, metragem desejada, rotina da família e principais sonhos para a construção.'
  }
};

function setProjectGuide(chip) {
  const project = chip.dataset.project;
  const copy = projectGuideCopy[project];
  projectChips.forEach(item => item.classList.toggle('active', item === chip));
  if (tipoSelect && chip.dataset.tipo) tipoSelect.value = chip.dataset.tipo;
  if (copy && projectGuideNote) projectGuideNote.textContent = copy.note;
  if (copy && mensagemField) mensagemField.placeholder = copy.placeholder;
}

projectChips.forEach(chip => {
  chip.addEventListener('click', () => setProjectGuide(chip));
});
const initialProjectChip = document.querySelector('.project-chip.active');
if (initialProjectChip) setProjectGuide(initialProjectChip);

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Enviando...';
  btn.disabled = true;
  setTimeout(() => {
    form.reset();
    const defaultChip = document.querySelector('.project-chip[data-project="reformar"]');
    if (defaultChip) setProjectGuide(defaultChip);
    btn.textContent = 'Enviar mensagem ♥';
    btn.disabled = false;
    formSuccess.classList.add('visible');
    setTimeout(() => formSuccess.classList.remove('visible'), 5000);
  }, 1200);
});

// ---------- SCROLL TO TOP ----------
const scrollTopBtn = document.getElementById('scrollTop');
window.addEventListener('scroll', () => {
  scrollTopBtn.classList.toggle('visible', window.scrollY > 600);
});
scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ---------- SMOOTH ANCHOR ----------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ---------- HERO PARALLAX (sol amarelo) ----------
const sun = document.querySelector('.hero__sun');
const heroLogo = document.querySelector('.hero__logo-img');
window.addEventListener('mousemove', (e) => {
  if (!sun) return;
  const x = (e.clientX / window.innerWidth - 0.5) * 30;
  const y = (e.clientY / window.innerHeight - 0.5) * 30;
  sun.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
}, { passive: true });
window.addEventListener('scroll', () => {
  if (!sun) return;
  const off = Math.min(window.scrollY * 0.25, 200);
  sun.style.opacity = Math.max(0, 1 - window.scrollY / 700);
  sun.style.marginTop = -off + 'px';
}, { passive: true });

// ---------- HERO PARTÍCULAS (poeirinha dourada) ----------
const particles = document.getElementById('heroParticles');
if (particles) {
  for (let i = 0; i < 14; i++) {
    const p = document.createElement('span');
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (10 + Math.random() * 10) + 's';
    p.style.animationDelay = (-Math.random() * 14) + 's';
    p.style.width = p.style.height = (2 + Math.random() * 4) + 'px';
    p.style.opacity = 0.3 + Math.random() * 0.5;
    particles.appendChild(p);
  }
}

// Logo do nav volta ao topo
const navLogo = document.querySelector('.nav__logo');
if (navLogo) {
  navLogo.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ---------- BOTÕES MAGNÉTICOS ----------
document.querySelectorAll('.btn, .filter-btn, .project-chip').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    btn.style.transform = `translate(${x * 0.18}px, ${y * 0.25}px)`;
    btn.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    btn.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

// ---------- CURSOR PERSONALIZADO & MOBA RIPPLE ----------
const fineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (fineHover) {
  const cursor = document.createElement('div'); cursor.className = 'custom-cursor';
  const trail = document.createElement('div'); trail.className = 'cursor-trail';
  document.body.appendChild(cursor); document.body.appendChild(trail);
  
  let mx = 0, my = 0, rx = 0, ry = 0;
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
  });
  
  function follow() {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    trail.style.left = rx + 'px';
    trail.style.top = ry + 'px';
    requestAnimationFrame(follow);
  }
  follow();
  
  const hoverables = 'a, button, .filter-btn, .project-chip, .portfolio-card, .valor-card, input, select, textarea, .nav__logo, .hero__logo-img, .mobile-menu__link, .mobile-menu__close';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverables)) {
      cursor.classList.add('hovering'); trail.classList.add('hovering');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverables)) {
      cursor.classList.remove('hovering'); trail.classList.remove('hovering');
    }
  });
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = 0; trail.style.opacity = 0;
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = ''; trail.style.opacity = '';
  });
}

// MOBA / Drop Click Ripple
window.addEventListener('click', (e) => {
  const isMobileView = window.innerWidth <= 768;
  const ripple = document.createElement('div');
  ripple.className = isMobileView ? 'drop-ripple' : 'moba-ripple';
  ripple.style.left = e.clientX + 'px';
  ripple.style.top = e.clientY + 'px';
  document.body.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
});

// ---------- BADGE RETRÔ ----------
const badge = document.createElement('div');
badge.className = 'retro-badge';
badge.innerHTML = `
  <span class="blink"></span>
  <span id="retroText">Estúdio aberto</span>
`;
document.body.appendChild(badge);
setTimeout(() => badge.classList.add('visible'), 1200);

// rotaciona pequenas frases retrô
const retroPhrases = [
  'Estúdio aberto',
  'Tracejando ideias',
  'Pintando espaços',
  'Café & projetos',
  'Modo criação: ON'
];
let rIdx = 0;
const retroText = badge.querySelector('#retroText');
setInterval(() => {
  rIdx = (rIdx + 1) % retroPhrases.length;
  retroText.style.opacity = '0';
  setTimeout(() => {
    retroText.textContent = retroPhrases[rIdx];
    retroText.style.opacity = '1';
  }, 300);
}, 4500);
retroText.style.transition = 'opacity 0.3s ease';



// ---------- FADE-IN KEYFRAMES ----------
const styleEl = document.createElement('style');
styleEl.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(styleEl);
