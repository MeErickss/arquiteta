/* ==========================================
   ROSETTO — EXTRAS (interações) — versão 2
   Configurável via window.ROSETTO_CONFIG
   ========================================== */
(function () {
  const CFG = window.ROSETTO_CONFIG || {};

  /* ============================================================
     1) CURSOR — desenha traços no hero
        - arquitetura: croqui técnico (linhas retas, esquadros)
        - psicologia:  ondas concêntricas suaves
     ============================================================ */
  (function heroTrail() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const style = CFG.heroTrail === undefined ? 'blueprint' : CFG.heroTrail; // 'blueprint' | 'ripple' | 'none'
    if (style === 'none' || style === false) return;
    const wrap = document.createElement('div');
    wrap.className = 'hero__blueprint';
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('preserveAspectRatio', 'none');
    wrap.appendChild(svg);
    hero.insertBefore(wrap, hero.firstChild);

    let lastPoint = null;
    const MIN_DIST = style === 'ripple' ? 60 : 35;

    function size() {
      const r = hero.getBoundingClientRect();
      svg.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`);
    }
    size();
    window.addEventListener('resize', size);

    function fadeAndRemove(el, life = 1800) {
      setTimeout(() => { el.style.opacity = '0'; }, 80);
      setTimeout(() => el.remove(), life);
    }
    function addNode(tag, attrs) {
      const el = document.createElementNS(ns, tag);
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      svg.appendChild(el);
      return el;
    }

    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (!lastPoint) { lastPoint = { x, y }; return; }
      const dx = x - lastPoint.x;
      const dy = y - lastPoint.y;
      const dist = Math.hypot(dx, dy);
      if (dist < MIN_DIST) return;

      if (style === 'ripple') {
        // ondas concêntricas
        for (let i = 0; i < 3; i++) {
          const c = addNode('circle', {
            cx: x, cy: y, r: 4 + i * 8,
            'stroke-width': i === 0 ? 1.2 : 0.7,
            opacity: 0.55 - i * 0.15
          });
          fadeAndRemove(c, 2200 + i * 200);
        }
      } else {
        // croqui técnico
        const line = addNode('line', {
          x1: lastPoint.x, y1: lastPoint.y, x2: x, y2: y,
          'stroke-dasharray': Math.random() > 0.6 ? '3 4' : '0',
        });
        fadeAndRemove(line);
        if (Math.random() > 0.78) {
          const dot = addNode('circle', { cx: x, cy: y, r: 3, 'stroke-width': 1 });
          fadeAndRemove(dot, 2000);
        }
        if (Math.random() > 0.85) {
          const off = 22;
          addNode('line', { x1: x, y1: y, x2: x + off, y2: y, 'stroke-width': 0.8 });
          addNode('line', { x1: x, y1: y, x2: x, y2: y + off, 'stroke-width': 0.8 });
          [...svg.querySelectorAll('line')].slice(-2).forEach(l => fadeAndRemove(l, 1200));
        }
      }
      lastPoint = { x, y };
    });
    hero.addEventListener('mouseleave', () => { lastPoint = null; });
  })();

  /* ============================================================
     2) SCROLL RAIL — minimapa lateral
     ============================================================ */
  (function scrollRail() {
    const sections = CFG.railSections || [
      { id: 'sobre', label: 'Sobre' },
      { id: 'portfolio', label: 'Portfólio' },
      { id: 'processo', label: 'Processo' },
      { id: 'contato', label: 'Contato' }
    ];
    const rail = document.createElement('aside');
    rail.className = 'scroll-rail';
    rail.setAttribute('aria-label', 'Navegação rápida');
    sections.forEach((s) => {
      const t = document.createElement('button');
      t.className = 'scroll-rail__tick';
      t.dataset.target = s.id;
      t.setAttribute('aria-label', s.label);
      const lab = document.createElement('span');
      lab.className = 'scroll-rail__label';
      lab.textContent = s.label;
      t.appendChild(lab);
      t.addEventListener('click', () => {
        const tg = document.getElementById(s.id);
        if (!tg) return;
        const top = tg.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      });
      rail.appendChild(t);
    });
    document.body.appendChild(rail);

    const ticks = rail.querySelectorAll('.scroll-rail__tick');
    function update() {
      const y = window.scrollY + window.innerHeight * 0.3;
      let activeIdx = -1;
      sections.forEach((s, i) => {
        const el = document.getElementById(s.id);
        if (!el) return;
        if (el.offsetTop <= y) activeIdx = i;
      });
      ticks.forEach((t, i) => t.classList.toggle('active', i === activeIdx));
      rail.classList.toggle('visible', window.scrollY > window.innerHeight * 0.4);
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  })();

  /* ============================================================
     3) ANTES & DEPOIS — slider arrastável
     ============================================================ */
  (function antesDepois() {
    const cmp = document.querySelector('.compare');
    if (!cmp) return;
    const after  = cmp.querySelector('.compare__layer--after');
    const handle = cmp.querySelector('.compare__handle');
    let pct = 50, dragging = false;

    function setPct(p) {
      pct = Math.max(2, Math.min(98, p));
      after.style.clipPath = `inset(0 0 0 ${pct}%)`;
      handle.style.left = pct + '%';
    }
    function fromEvent(e) {
      const r = cmp.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      return (x / r.width) * 100;
    }
    cmp.addEventListener('mousedown',  (e) => { dragging = true; setPct(fromEvent(e)); });
    cmp.addEventListener('touchstart', (e) => { dragging = true; setPct(fromEvent(e)); }, { passive: true });
    window.addEventListener('mousemove', (e) => { if (dragging) setPct(fromEvent(e)); });
    window.addEventListener('touchmove', (e) => { if (dragging) setPct(fromEvent(e)); }, { passive: true });
    window.addEventListener('mouseup',  () => dragging = false);
    window.addEventListener('touchend', () => dragging = false);

    let teased = false;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting && !teased) {
          teased = true;
          let t = 0;
          const id = setInterval(() => {
            t++;
            if (!dragging) setPct(50 + Math.sin(t / 3) * 14);
            if (t > 14) clearInterval(id);
          }, 70);
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.5 });
    obs.observe(cmp);
  })();

  /* ============================================================
     4) QUIZ — configurável
     ============================================================ */
  (function quiz() {
    const root = document.querySelector('.quiz__inner');
    if (!root) return;
    const Q = CFG.quizQuestions;
    const R = CFG.quizResults;
    if (!Q || !R) return;

    const progress = document.createElement('div');
    progress.className = 'quiz__progress';
    Q.forEach(() => progress.appendChild(document.createElement('span')));
    root.appendChild(progress);

    const stepsWrap = document.createElement('div');
    root.appendChild(stepsWrap);

    const answers = [];
    let step = 0;

    function render() {
      stepsWrap.innerHTML = '';
      [...progress.children].forEach((b, i) => {
        b.className = i < step ? 'done' : (i === step ? 'current' : '');
      });
      if (step < Q.length) {
        const q = Q[step];
        const wrap = document.createElement('div');
        wrap.className = 'quiz__step active';
        wrap.innerHTML = `
          <h3 class="quiz__q">${q.q}</h3>
          <p class="quiz__sub">${q.sub}</p>
          <div class="quiz__options"></div>
        `;
        const opts = wrap.querySelector('.quiz__options');
        q.options.forEach(o => {
          const btn = document.createElement('button');
          btn.className = 'quiz__option';
          btn.innerHTML = `
            <div class="quiz__option-thumb" style="background-image:url('${o.img}')"></div>
            <span class="quiz__option-label">${o.label}</span>
          `;
          btn.addEventListener('click', () => {
            btn.classList.add('selected');
            setTimeout(() => { answers.push(o.id); step++; render(); }, 220);
          });
          opts.appendChild(btn);
        });
        stepsWrap.appendChild(wrap);
      } else {
        const tally = {};
        answers.forEach(a => { tally[a] = (tally[a] || 0) + 1; });
        const winner = Object.keys(tally).sort((a, b) => tally[b] - tally[a])[0];
        const r = R[winner];
        const res = document.createElement('div');
        res.className = 'quiz__step active quiz__result';
        const labelTxt = CFG.quizResultLabel || 'Seu resultado';
        res.innerHTML = `
          <p class="quiz__result-label">${labelTxt}</p>
          <h3 class="quiz__result-name">${r.name}</h3>
          <p class="quiz__result-body">${r.body}</p>
          <div class="quiz__result-tags">${r.tags.map(t => `<span>${t}</span>`).join('')}</div>
          <div class="quiz__result-actions">
            <button class="btn btn--outline" data-action="see">${r.cta || 'Ver mais'}</button>
            <button class="btn btn--outline" data-action="redo">Refazer</button>
          </div>
        `;
        stepsWrap.appendChild(res);
        [...progress.children].forEach(c => c.className = 'done');

        res.querySelector('[data-action="see"]').addEventListener('click', () => {
          if (r.filter) {
            const fbtn = document.querySelector(`.filter-btn[data-filter="${r.filter}"]`);
            if (fbtn) fbtn.click();
          }
          const target = r.scrollTo || 'portfolio';
          const port = document.getElementById(target);
          if (port) {
            const top = port.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top, behavior: 'smooth' });
          }
        });
        res.querySelector('[data-action="redo"]').addEventListener('click', () => {
          answers.length = 0; step = 0; render();
        });
      }
    }
    render();
  })();

  /* ============================================================
     5) ESTIMADOR DE INVESTIMENTO (apenas arquitetura)
     ============================================================ */
  (function estimator() {
    const root = document.querySelector('.estimator');
    if (!root) return;
    const STYLE_MULT  = CFG.estimatorStyle  || { basico: 1, aconchego: 1.25, refinado: 1.55 };
    const FINISH_BASE = CFG.estimatorFinish || { basico: 3200, medio: 5500, premium: 9000 };
    const state = { area: 80, style: 'aconchego', finish: 'medio' };

    const areaInput   = root.querySelector('[data-est="area"]');
    const areaOut     = root.querySelector('[data-est-val="area"]');
    const styleChips  = root.querySelectorAll('[data-est-style]');
    const finishChips = root.querySelectorAll('[data-est-finish]');
    const rangeOut    = root.querySelector('[data-est-range]');

    const fmt = n => 'R$ ' + Math.round(n).toLocaleString('pt-BR');
    function update() {
      const sqm = FINISH_BASE[state.finish] * STYLE_MULT[state.style];
      const total = state.area * sqm;
      areaOut.textContent = state.area + ' m²';
      rangeOut.innerHTML = `${fmt(total * 0.85)} <em>—</em> ${fmt(total * 1.15)}`;
      styleChips.forEach(c => c.classList.toggle('active', c.dataset.estStyle === state.style));
      finishChips.forEach(c => c.classList.toggle('active', c.dataset.estFinish === state.finish));
    }
    areaInput.addEventListener('input', (e) => { state.area = +e.target.value; update(); });
    styleChips.forEach(c => c.addEventListener('click',  () => { state.style  = c.dataset.estStyle;  update(); }));
    finishChips.forEach(c => c.addEventListener('click', () => { state.finish = c.dataset.estFinish; update(); }));
    update();
  })();

  /* ============================================================
     6) PORTFOLIO LIGHTBOX
     ============================================================ */
  (function lightbox() {
    const PROJECTS = CFG.projects;
    const cards = document.querySelectorAll('.portfolio-card');
    if (!cards.length || !PROJECTS) return;

    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = `
      <div class="lightbox__inner">
        <div class="lightbox__gallery">
          <div class="lightbox__main"></div>
          <div class="lightbox__thumbs"></div>
        </div>
        <div class="lightbox__info">
          <p class="lightbox__cat"></p>
          <h3 class="lightbox__title"></h3>
          <p class="lightbox__loc"></p>
          <p class="lightbox__desc"></p>
          <div class="lightbox__specs"></div>
        </div>
        <button class="lightbox__close" aria-label="Fechar">✕</button>
      </div>
    `;
    document.body.appendChild(lb);

    const main   = lb.querySelector('.lightbox__main');
    const thumbs = lb.querySelector('.lightbox__thumbs');
    const cat    = lb.querySelector('.lightbox__cat');
    const title  = lb.querySelector('.lightbox__title');
    const loc    = lb.querySelector('.lightbox__loc');
    const desc   = lb.querySelector('.lightbox__desc');
    const specs  = lb.querySelector('.lightbox__specs');

    function open(idx) {
      const p = PROJECTS[idx];
      if (!p) return;
      cat.textContent = p.cat;
      title.textContent = p.title;
      loc.textContent = p.loc;
      desc.textContent = p.desc;
      specs.innerHTML = p.specs.map(s => `<div class="lightbox__spec"><b>${s[0]}</b><span>${s[1]}</span></div>`).join('');
      thumbs.innerHTML = '';
      p.imgs.forEach((src, i) => {
        const t = document.createElement('div');
        t.className = 'lightbox__thumb' + (i === 0 ? ' active' : '');
        t.style.backgroundImage = `url('${src}')`;
        t.addEventListener('click', () => {
          main.style.backgroundImage = `url('${src}')`;
          thumbs.querySelectorAll('.lightbox__thumb').forEach(x => x.classList.remove('active'));
          t.classList.add('active');
        });
        thumbs.appendChild(t);
      });
      main.style.backgroundImage = `url('${p.imgs[0]}')`;
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function close() { lb.classList.remove('open'); document.body.style.overflow = ''; }
    lb.querySelector('.lightbox__close').addEventListener('click', close);
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lb.classList.contains('open')) close();
    });
    cards.forEach((c, i) => c.addEventListener('click', () => open(i + 1)));
  })();

  /* ============================================================
     7) MODAL GENÉRICO + abridores via [data-open-modal]
     ============================================================ */
  function makeModal(id, extraClass) {
    const m = document.createElement('div');
    m.className = 'modal' + (extraClass ? ' ' + extraClass : '');
    m.id = id;
    m.innerHTML = `
      <div class="modal__inner">
        <button class="modal__close" aria-label="Fechar">✕</button>
        <div class="modal__content"></div>
      </div>
    `;
    document.body.appendChild(m);
    m.querySelector('.modal__close').addEventListener('click', () => closeModal(m));
    m.addEventListener('click', (e) => { if (e.target === m) closeModal(m); });
    return m;
  }
  function openModal(m) {
    m.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(m) {
    m.classList.remove('open');
    document.body.style.overflow = '';
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.open').forEach(closeModal);
    }
  });

  /* ============================================================
     8) MODAL — Conheça a profissional (com abas)
     ============================================================ */
  (function profissionalModal() {
    const data = CFG.profissional;
    if (!data) return;

    const m = makeModal('profModal', 'prof-modal');
    const content = m.querySelector('.modal__content');
    content.innerHTML = `
      <div class="prof-modal__hero">
        <div class="prof-modal__photo" style="background-image:url('${data.photo}')" data-caption="${data.photoCaption || 'foto institucional'}"></div>
        <div class="prof-modal__intro">
          <p class="modal__label">${data.kicker || 'Conheça'}</p>
          <h2 class="prof-modal__name">${data.name}</h2>
          <p class="prof-modal__role">${data.role}</p>
          <p class="prof-modal__lead">${data.lead}</p>
          <p class="prof-modal__credentials">${data.credentials}</p>
          <div class="prof-modal__contact">
            ${(data.contact || []).map(c => `<a href="${c.href}" target="_blank" rel="noopener">${c.label}</a>`).join('')}
          </div>
        </div>
      </div>
      <div class="prof-modal__body">
        <div class="tabs">
          <nav class="tabs__nav">
            ${data.tabs.map((t, i) => `<button class="tabs__btn ${i === 0 ? 'active' : ''}" data-tab="${i}">${t.label}</button>`).join('')}
          </nav>
          <div class="tabs__panels">
            ${data.tabs.map((t, i) => `
              <div class="tabs__panel ${i === 0 ? 'active' : ''}" data-panel="${i}">
                ${t.body}
                ${t.list ? `<ul class="prof-modal__list">${t.list.map(li => `<li>${li}</li>`).join('')}</ul>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    content.querySelectorAll('.tabs__btn').forEach(btn => {
      btn.addEventListener('click', () => {
        content.querySelectorAll('.tabs__btn').forEach(b => b.classList.remove('active'));
        content.querySelectorAll('.tabs__panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        content.querySelector(`.tabs__panel[data-panel="${btn.dataset.tab}"]`).classList.add('active');
      });
    });
    document.querySelectorAll('[data-open-modal="prof"]').forEach(el => {
      el.addEventListener('click', (e) => { e.preventDefault(); openModal(m); });
    });
  })();

  /* ============================================================
     9) MODAL — FAQ (accordion)
     ============================================================ */
  (function faqModal() {
    const items = CFG.faq;
    if (!items || !items.length) return;
    const m = makeModal('faqModal');
    const content = m.querySelector('.modal__content');
    content.innerHTML = `
      <div class="modal__head">
        <p class="modal__label">Dúvidas frequentes</p>
        <h2 class="modal__title">${CFG.faqTitle || 'Antes de você nos escrever'}</h2>
        <p class="modal__sub">${CFG.faqSub || 'As perguntas que mais ouvimos por aqui.'}</p>
      </div>
      <div class="modal__body">
        ${items.map(it => `
          <div class="faq__item">
            <button class="faq__q" type="button">
              <span>${it.q}</span>
              <span class="faq__icon" aria-hidden="true"></span>
            </button>
            <div class="faq__a"><div class="faq__a-inner">${it.a}</div></div>
          </div>
        `).join('')}
      </div>
    `;
    content.querySelectorAll('.faq__q').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq__item');
        const wasOpen = item.classList.contains('open');
        content.querySelectorAll('.faq__item.open').forEach(i => i.classList.remove('open'));
        if (!wasOpen) item.classList.add('open');
      });
    });
    document.querySelectorAll('[data-open-modal="faq"]').forEach(el => {
      el.addEventListener('click', (e) => { e.preventDefault(); openModal(m); });
    });
  })();

  /* ============================================================
     10) MODAL — Agendar (calendário + horários, mock)
     ============================================================ */
  (function agendarModal() {
    if (!CFG.agendar) return;
    const A = CFG.agendar;
    const m = makeModal('agendarModal');
    const content = m.querySelector('.modal__content');
    content.innerHTML = `
      <div class="modal__head">
        <p class="modal__label">${A.label || 'Agendar'}</p>
        <h2 class="modal__title">${A.title || 'Escolha um melhor horário'}</h2>
        <p class="modal__sub">${A.sub || ''}</p>
      </div>
      <div class="modal__body" style="padding:0;">
        <div class="agenda">
          <div class="agenda__calendar">
            <div class="agenda__cal-head">
              <span class="agenda__cal-month" data-cal-month></span>
              <div class="agenda__cal-nav">
                <button type="button" data-cal-prev>‹</button>
                <button type="button" data-cal-next>›</button>
              </div>
            </div>
            <div class="agenda__cal-grid" data-cal-grid></div>
          </div>
          <div class="agenda__slots">
            <p class="agenda__slots-label">Horários disponíveis</p>
            <p class="agenda__slots-date" data-slots-date>Escolha uma data</p>
            <div class="agenda__slots-list" data-slots-list></div>
            <div class="agenda__empty" data-slots-empty>Selecione uma data no calendário para ver horários.</div>
            <div class="agenda__cta">
              <p class="agenda__summary" data-summary>Nenhuma data selecionada.</p>
              <button type="button" class="btn btn--primary agenda__confirm" data-confirm disabled>Confirmar agendamento</button>
              <div class="agenda__success" data-success>Pedido enviado. Em breve a Rosetto confirma seu horário ♥</div>
            </div>
          </div>
        </div>
      </div>
    `;

    const DOW = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const grid       = content.querySelector('[data-cal-grid]');
    const monthLabel = content.querySelector('[data-cal-month]');
    const slotsDate  = content.querySelector('[data-slots-date]');
    const slotsList  = content.querySelector('[data-slots-list]');
    const slotsEmpty = content.querySelector('[data-slots-empty]');
    const summary    = content.querySelector('[data-summary]');
    const confirmBtn = content.querySelector('[data-confirm]');
    const success    = content.querySelector('[data-success]');

    let viewYear, viewMonth;
    let selectedDate = null; // {y,m,d}
    let selectedSlot = null;

    const today = new Date();
    viewYear = today.getFullYear();
    viewMonth = today.getMonth();

    const SLOTS = A.slots || ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
    const taken = A.taken || {}; // 'yyyy-mm-dd' -> ['09:00', ...]

    function pad(n) { return String(n).padStart(2, '0'); }
    function keyOf(y, m, d) { return `${y}-${pad(m + 1)}-${pad(d)}`; }
    function isWeekend(y, m, d) {
      const w = new Date(y, m, d).getDay();
      return w === 0 || w === 6;
    }
    function isPast(y, m, d) {
      const t = new Date(); t.setHours(0, 0, 0, 0);
      return new Date(y, m, d) < t;
    }
    function renderCal() {
      grid.innerHTML = '';
      monthLabel.textContent = `${MONTHS[viewMonth]} ${viewYear}`;
      DOW.forEach(d => {
        const el = document.createElement('div');
        el.className = 'agenda__cal-dow';
        el.textContent = d;
        grid.appendChild(el);
      });
      const first = new Date(viewYear, viewMonth, 1).getDay();
      const last  = new Date(viewYear, viewMonth + 1, 0).getDate();
      for (let i = 0; i < first; i++) {
        const e = document.createElement('div');
        e.className = 'agenda__cal-day muted';
        grid.appendChild(e);
      }
      for (let d = 1; d <= last; d++) {
        const e = document.createElement('button');
        e.type = 'button';
        e.className = 'agenda__cal-day';
        e.textContent = d;
        const isToday = (d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear());
        if (isToday) e.classList.add('today');
        if (isPast(viewYear, viewMonth, d) || isWeekend(viewYear, viewMonth, d)) {
          e.classList.add('unavailable');
        }
        if (selectedDate && selectedDate.y === viewYear && selectedDate.m === viewMonth && selectedDate.d === d) {
          e.classList.add('selected');
        }
        e.addEventListener('click', () => {
          selectedDate = { y: viewYear, m: viewMonth, d };
          selectedSlot = null;
          renderCal();
          renderSlots();
          updateSummary();
        });
        grid.appendChild(e);
      }
    }
    function renderSlots() {
      slotsList.innerHTML = '';
      if (!selectedDate) {
        slotsEmpty.style.display = '';
        slotsDate.textContent = 'Escolha uma data';
        return;
      }
      slotsEmpty.style.display = 'none';
      const dateObj = new Date(selectedDate.y, selectedDate.m, selectedDate.d);
      slotsDate.textContent = dateObj.toLocaleDateString('pt-BR', {
        weekday: 'long', day: '2-digit', month: 'long'
      }).replace(/^./, c => c.toUpperCase());
      const k = keyOf(selectedDate.y, selectedDate.m, selectedDate.d);
      const isTaken = (s) => (taken[k] || []).includes(s);
      // adicionar 2 horários ocupados pseudo-aleatórios pra parecer real
      const seed = (selectedDate.d * 7 + selectedDate.m) % SLOTS.length;
      const pseudoTaken = new Set([SLOTS[seed], SLOTS[(seed + 3) % SLOTS.length]]);
      SLOTS.forEach(s => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'agenda__slot';
        b.textContent = s;
        if (isTaken(s) || pseudoTaken.has(s)) b.classList.add('unavailable');
        if (selectedSlot === s) b.classList.add('selected');
        b.addEventListener('click', () => {
          selectedSlot = s;
          slotsList.querySelectorAll('.agenda__slot').forEach(x => x.classList.remove('selected'));
          b.classList.add('selected');
          updateSummary();
        });
        slotsList.appendChild(b);
      });
    }
    function updateSummary() {
      if (selectedDate && selectedSlot) {
        const dateObj = new Date(selectedDate.y, selectedDate.m, selectedDate.d);
        const dateStr = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
        summary.innerHTML = `Você quer reservar <b>${dateStr}</b> às <b>${selectedSlot}</b>.`;
        confirmBtn.disabled = false;
      } else if (selectedDate) {
        summary.textContent = 'Escolha um horário disponível.';
        confirmBtn.disabled = true;
      } else {
        summary.textContent = 'Nenhuma data selecionada.';
        confirmBtn.disabled = true;
      }
    }

    content.querySelector('[data-cal-prev]').addEventListener('click', () => {
      viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; } renderCal();
    });
    content.querySelector('[data-cal-next]').addEventListener('click', () => {
      viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; } renderCal();
    });
    confirmBtn.addEventListener('click', () => {
      confirmBtn.textContent = 'Enviando...';
      setTimeout(() => {
        confirmBtn.textContent = 'Confirmar agendamento';
        success.classList.add('visible');
        setTimeout(() => {
          success.classList.remove('visible');
          closeModal(m);
          selectedDate = null;
          selectedSlot = null;
          renderCal();
          renderSlots();
          updateSummary();
        }, 2200);
      }, 900);
    });

    renderCal();
    renderSlots();
    updateSummary();

    document.querySelectorAll('[data-open-modal="agendar"]').forEach(el => {
      el.addEventListener('click', (e) => { e.preventDefault(); openModal(m); });
    });
  })();

  /* ============================================================
     11) FAB STACK — botões flutuantes (FAQ + Agendar)
     ============================================================ */
  (function fabStack() {
    const fabs = CFG.fabs;
    if (!fabs || !fabs.length) return;
    const stack = document.createElement('div');
    stack.className = 'fab-stack';
    fabs.forEach((f) => {
      const b = document.createElement('button');
      b.className = 'fab';
      b.type = 'button';
      b.setAttribute('data-open-modal', f.modal);
      b.innerHTML = `<span class="fab__dot"></span>${f.label}`;
      b.addEventListener('click', () => {
        const t = document.getElementById(f.modal === 'faq' ? 'faqModal' :
                                          f.modal === 'agendar' ? 'agendarModal' :
                                          f.modal === 'prof' ? 'profModal' : '');
        if (t) {
          t.classList.add('open');
          document.body.style.overflow = 'hidden';
        }
      });
      stack.appendChild(b);
    });
    document.body.appendChild(stack);
    setTimeout(() => stack.querySelectorAll('.fab').forEach((b, i) => {
      setTimeout(() => b.classList.add('visible'), i * 120);
    }), 1400);
  })();

  /* ============================================================
     12) EASTER EGG — silencioso. Digite ROSETTO em qualquer lugar
     ============================================================ */
  (function easterEgg() {
    const TARGET = 'rosetto';
    let buf = '';

    function rain() {
      const wrap = document.createElement('div');
      wrap.className = 'petal-rain';
      document.body.appendChild(wrap);
      for (let i = 0; i < 60; i++) {
        const p = document.createElement('span');
        p.className = 'petal-rain__petal';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDuration = (4 + Math.random() * 4) + 's';
        p.style.animationDelay = (Math.random() * 2) + 's';
        p.style.setProperty('--drift', (Math.random() * 200 - 100) + 'px');
        const s = 8 + Math.random() * 14;
        p.style.width = s + 'px';
        p.style.height = s + 'px';
        p.style.opacity = 0.5 + Math.random() * 0.5;
        wrap.appendChild(p);
      }
      const msg = document.createElement('div');
      msg.className = 'easter-hint';
      msg.innerHTML = (CFG.easterMsg || `Obrigado por brincar com a gente. <small>♥ projetos que acolhem</small>`);
      document.body.appendChild(msg);
      requestAnimationFrame(() => msg.classList.add('visible'));
      setTimeout(() => msg.classList.remove('visible'), 2500);
      setTimeout(() => { msg.remove(); wrap.remove(); }, 8500);
    }
    document.addEventListener('keydown', (e) => {
      if (e.key.length !== 1) return;
      buf = (buf + e.key.toLowerCase()).slice(-TARGET.length);
      if (buf === TARGET) { rain(); buf = ''; }
    });
  })();

})();
