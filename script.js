/* ==========================================
   ROSETTO ARQUITETURA — SCRIPTS
   ========================================== */

// ---------- NAV SCROLL ----------
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// ---------- MOBILE MENU ----------
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
const mobileLinks = mobileMenu.querySelectorAll('.mobile-menu__link');

navToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});

mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ---------- SCROLL REVEAL ----------
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, (entry.target.dataset.delay || 0));
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

// Stagger siblings
document.querySelectorAll('.reveal').forEach((el, i) => {
  const siblings = el.parentElement.querySelectorAll('.reveal');
  const siblingIndex = Array.from(siblings).indexOf(el);
  el.dataset.delay = siblingIndex * 80;
  revealObserver.observe(el);
});

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

// ---------- DEPOIMENTOS CAROUSEL ----------
const track = document.getElementById('depoimentosTrack');
const dotsContainer = document.getElementById('depoimentosDots');
const cards = track.querySelectorAll('.depoimento-card');
let currentSlide = 0;
let autoSlide;

function isMobile() { return window.innerWidth <= 768; }

// Número de cards visíveis ao mesmo tempo (desktop)
const VISIBLE = 3;

// Total de posições de slide possíveis
function totalSlides() { return cards.length - VISIBLE + 1; } // 4 - 3 + 1 = 2

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
  // gap: 1.5rem — pega valor real do CSS computado
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
  // Limpa qualquer transform inline antes de tudo
  track.style.transform = '';
  if (!isMobile()) {
    goTo(0);
    buildDots();
    startAuto();
  }
}

initCarousel();
track.addEventListener('mouseenter', () => clearInterval(autoSlide));
track.addEventListener('mouseleave', startAuto);
window.addEventListener('resize', () => { currentSlide = 0; initCarousel(); });

// ---------- CONTACT FORM ----------
const form = document.getElementById('contatoForm');
const formSuccess = document.getElementById('formSuccess');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Enviando...';
  btn.disabled = true;

  setTimeout(() => {
    form.reset();
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

// ---------- SMOOTH ANCHOR SCROLL ----------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ---------- FADE-IN KEYFRAMES (injected) ----------
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);
