/**
 * HARSH PATIL — PORTFOLIO ENGINE
 *
 * - Three.js point cloud behind the hero (lazy-loaded, guarded, pausable)
 * - GSAP ScrollTrigger for reveals and the hero scrub (no scroll listeners)
 * - Projects / certificates / contacts rendered from CONFIG
 * - Lightbox: PDF.js canvas rendering for the resume, image for certificates
 */

(function () {
  'use strict';

  /* =====================================================================
     CONFIG — all editable content lives here.
     ===================================================================== */
  const CONFIG = {
    resumePdf: 'uploads/Harsh_Patil_Resume.pdf',
    portrait: 'uploads/harsh-portrait.jpg',

    links: {
      github: 'https://github.com/harshislearning',
      linkedin: 'https://www.linkedin.com/in/harsh-patil-247195253',
      email: 'mailto:workidharsh29@gmail.com'
    },

    projects: [
      {
        title: 'HistoScope — Lung & Colon Cancer Histopathology Classifier',
        category: 'DL',
        tagline: 'Classifies H&E histopathology tiles into five lung and colon diagnostic classes at 98.93% test accuracy.',
        description: 'A MobileNetV2 transfer-learning model that separates benign tissue from adenocarcinoma and squamous cell carcinoma across lung and colon slides — 0.9998 ROC-AUC, 1.000 malignancy sensitivity, and 97.33% accuracy held under stain shift, served through a Streamlit app that returns the full probability distribution for every tile.',
        image: 'uploads/histoscope.webp',
        tech: ['Deep Learning', 'Computer Vision', 'Transfer Learning', 'MobileNetV2', 'TensorFlow', 'Medical Imaging', 'Streamlit', 'Python'],
        github: 'https://github.com/harshislearning/Lung-and-colon-cancer-image-classification'
      },
      {
        title: 'Ask My Docs',
        category: 'RAG',
        tagline: 'A production-grade RAG system that answers questions from your PDFs — with citations you can trust.',
        description: 'Hybrid retrieval (dense + keyword) + reranking + cited, verified answers — served via FastAPI and Streamlit, with an automated eval suite gating every change in CI.',
        image: 'uploads/Screenshot 2026-08-11 123718.png',
        tech: ['RAG', 'LLM', 'FastAPI', 'Streamlit', 'FAISS', 'BM25', 'Python', 'CI/CD'],
        github: 'https://github.com/harshislearning/Ask-My-Docs'
      },
      {
        title: 'Vendor Invoice Intelligence Platform',
        category: 'ML',
        tagline: 'ML-driven freight cost forecasting and invoice risk flagging for procurement & finance teams.',
        description: 'An end-to-end ML system that predicts vendor freight costs and automatically flags high-risk invoices for manual review — built on real invoice/purchase data with a live Streamlit dashboard.',
        image: 'uploads/Screenshot 2026-08-13 151213.png',
        tech: ['Machine Learning', 'Regression', 'Classification', 'Python', 'Scikit-learn', 'Pandas', 'SQLite', 'Streamlit'],
        github: 'https://github.com/harshislearning/-Vendor-Invoice-Intelligence-Platform'
      },
      {
        title: 'AI-Powered Synthetic Data Generator & Data Cleaning Tutor',
        category: 'GenAI',
        tagline: 'Generates messy, realistic datasets on demand — then teaches you exactly how to clean them.',
        description: 'A Streamlit app that creates domain-specific synthetic datasets with intentionally injected data quality issues, then uses an LLM to generate a step-by-step Python or SQL cleaning solution for the exact dataset you just made.',
        image: 'uploads/Screenshot (130).png',
        tech: ['LLM', 'Streamlit', 'Python', 'Pandas', 'Faker', 'Groq API', 'EdTech'],
        github: 'https://github.com/harshislearning/AI-Powered-Synthetic-Data-Generator-and-Data-Cleaning-Tutor'
      },
      {
        title: 'Prediction of FC Barcelona Football Matches',
        category: 'ML',
        tagline: 'Predicting Win / Draw / Loss for FC Barcelona matches — built on a self-made dataset, achieving 72.22% accuracy.',
        description: "A machine learning model trained on a custom-built dataset of FC Barcelona's 2023/24 and 2024/25 seasons, served through a Flask web app that predicts match outcomes from opponent and home/away input.",
        image: 'uploads/Screenshot 2026-08-11 122140.png',
        tech: ['Machine Learning', 'Flask', 'Python', 'Scikit-learn', 'Sports Analytics', 'Random Forest', 'XGBoost'],
        github: 'https://github.com/harshislearning/Prediction-of-Fc-Barcelona-Football-Matches'
      },
      {
        title: 'LinkedIn Post Generator',
        category: 'GenAI',
        tagline: 'AI that writes LinkedIn posts in your own voice — trained on your past posts, not a generic template.',
        description: 'An LLM-powered tool that generates LinkedIn posts matching a chosen topic, language, and length — using few-shot examples pulled from a real post history to keep the writing style human, not robotic.',
        image: 'uploads/Screenshot (80).png',
        tech: ['LLM', 'LangChain', 'Python', 'Prompt Engineering', 'Few-Shot Learning', 'NLP'],
        github: 'https://github.com/harshislearning/Linkedin-Post-Generator'
      }
    ],

    // Certificates preview from their thumbnail image — no PDF is shipped.
    certificates: [
      { title: 'Agentic AI Certified Foundations Associate', issuer: 'Oracle', thumb: 'uploads/Screenshot 2026-08-14 163015.png', credential: 'https://catalog-education.oracle.com/pls/certview/sharebadge?id=71AB7F72299E53E80A06EE54A74A431D1E0385C1102172112AE5DEE8805EA4E9' },
      { title: 'Generative AI: Prompt Engineering Basics', issuer: 'IBM · Coursera', thumb: 'uploads/Screenshot 2026-08-14 163318.png', credential: 'https://www.coursera.org/account/accomplishments/verify/AHHNVQ4GE0UA' },
      { title: 'Python for Data Science, AI & Development', issuer: 'IBM · Coursera', thumb: 'uploads/Screenshot 2026-08-14 164303.png', credential: 'https://www.coursera.org/account/accomplishments/certificate/FJHUVTUREM2S' },
      { title: 'Data Analytics Job Simulation', issuer: 'Deloitte · Forage', thumb: 'uploads/Screenshot 2026-08-14 165404-96c987ee.png', credential: 'https://forage-uploads-prod.s3.amazonaws.com/completion-certificates/9PBTqmSxAf6zZTseP/io9DzWKe3PTsiS6GG_9PBTqmSxAf6zZTseP_r75CDKr598N7pDSWf_1749637695306_completion_certificate.pdf' },
      { title: 'GenAI Powered Data Analytics Job Simulation', issuer: 'Tata · Forage', thumb: 'uploads/Screenshot 2026-08-14 165730.png', credential: 'https://www.theforage.com/completion-certificates/ifobHAoMjQs9s6bKS/gMTdCXwDdLYoXZ3wG_ifobHAoMjQs9s6bKS_r75CDKr598N7pDSWf_1780309910416_completion_certificate.pdf' },
      { title: 'SQL (Advanced)', issuer: 'HackerRank', thumb: 'uploads/Screenshot 2026-08-14 165942.png', credential: 'https://www.hackerrank.com/certificates/iframe/7e0f606b67ff' }
    ]
  };

  const CONTACTS = [
    { icon: '{ }', label: 'GitHub',   desc: 'Check out my code and open-source projects', meta: 'github.com/harshislearning',              href: CONFIG.links.github },
    { icon: 'in',  label: 'LinkedIn', desc: "Let's connect professionally on LinkedIn",   meta: 'linkedin.com/in/harsh-patil-247195253', href: CONFIG.links.linkedin },
    { icon: '@',   label: 'Email',    desc: "Drop me an email, I'll get back to you!",    meta: 'workidharsh29@gmail.com',               href: CONFIG.links.email }
  ];

  const NAV = [
    { label: 'Home', id: 'home' },
    { label: 'About', id: 'about' },
    { label: 'Projects', id: 'projects' },
    { label: 'Certifications', id: 'certifications' },
    { label: 'Contact', id: 'contact' }
  ];

  const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js';
  const PDFJS_URL = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js';
  const PDFJS_WORKER_URL = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const modalRoot = document.getElementById('modal-root');

  /* =====================================================================
     SMALL HELPERS
     ===================================================================== */
  function el(tag, attrs, html) {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (html != null) n.innerHTML = html;
    return n;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  /* =====================================================================
     SECTION RENDERING
     ===================================================================== */
  function renderProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    // Every card carries the same blocks in the same order, so the grid can
    // size them all identically.
    CONFIG.projects.forEach((p, i) => {
      const card = el('article', { class: 'proj reveal' });

      const media = el('div', { class: 'proj-media' });
      media.appendChild(el('img', {
        src: p.image,
        alt: esc(p.title) + ' screenshot',
        loading: i === 0 ? 'eager' : 'lazy',
        decoding: 'async'
      }));
      card.appendChild(media);

      const body = el('div', { class: 'proj-body' });
      body.appendChild(el('span', { class: 'proj-cat' }, esc(p.category)));
      body.appendChild(el('h3', { class: 'proj-title' }, esc(p.title)));
      body.appendChild(el('p', { class: 'proj-tagline' }, esc(p.tagline)));
      body.appendChild(el('p', { class: 'proj-desc' }, esc(p.description)));

      const tags = el('p', { class: 'tags' });
      p.tech.forEach(t => tags.appendChild(el('span', { class: 'tag' }, esc(t))));
      body.appendChild(tags);

      const foot = el('div', { class: 'proj-foot' });
      foot.appendChild(el('a', {
        class: 'proj-link', href: p.github, target: '_blank', rel: 'noopener'
      }, 'View on GitHub <span aria-hidden="true">&rarr;</span>'));
      body.appendChild(foot);

      card.appendChild(body);
      grid.appendChild(card);
    });
  }

  /* =====================================================================
     CERTIFICATES — hover-expand rows

     Each row's openness is a spring-driven 0..1 value; height, image scale
     and the scrim all read from it. Spring constants are integrated
     directly rather than eased, so the motion settles physically.
     ===================================================================== */
  const SPRING = { stiffness: 280, damping: 32, mass: 0.9 };
  const activeSprings = new Set();
  let springRaf = 0, springLast = 0;

  function springFrame(now) {
    const dt = Math.min((now - springLast) / 1000, 0.05);
    springLast = now;

    // Fixed sub-steps keep the integration stable regardless of frame rate.
    const h = 1 / 240;
    const steps = Math.min(24, Math.max(1, Math.round(dt / h)));

    activeSprings.forEach(s => {
      for (let i = 0; i < steps; i++) {
        const accel = (-SPRING.stiffness * (s.value - s.target) - SPRING.damping * s.velocity) / SPRING.mass;
        s.velocity += accel * h;
        s.value += s.velocity * h;
      }
      if (Math.abs(s.value - s.target) < 0.0015 && Math.abs(s.velocity) < 0.0015) {
        s.value = s.target;
        s.velocity = 0;
        activeSprings.delete(s);
      }
      s.render(s.value);
    });

    springRaf = activeSprings.size ? requestAnimationFrame(springFrame) : 0;
  }

  function springTo(state, target) {
    state.target = target;
    if (reduceMotion) {
      state.value = target;
      state.velocity = 0;
      activeSprings.delete(state);
      state.render(target);
      return;
    }
    activeSprings.add(state);
    if (!springRaf) {
      springLast = performance.now();
      springRaf = requestAnimationFrame(springFrame);
    }
  }

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  function renderCertificates() {
    const list = document.getElementById('certs-list');
    if (!list) return;

    const hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const rows = [];
    let activeRow = null;

    CONFIG.certificates.forEach((c, i) => {
      const row = el('article', { class: 'cert-row' });
      const panelId = 'cert-panel-' + i;

      const shot = el('img', {
        class: 'cert-shot', src: c.thumb, id: panelId,
        alt: esc(c.title) + ' certificate', loading: 'lazy', decoding: 'async'
      });
      const scrim = el('div', { class: 'cert-scrim' });

      const head = el('button', {
        class: 'cert-head', type: 'button',
        'aria-expanded': 'false', 'aria-controls': panelId
      });
      const meta = el('div', { class: 'cert-meta' });
      meta.appendChild(el('h3', { class: 'cert-title' }, esc(c.title)));
      meta.appendChild(el('p', { class: 'cert-issuer' }, esc(c.issuer)));
      head.appendChild(meta);

      const link = el('a', {
        class: 'cert-link', href: c.credential,
        target: '_blank', rel: 'noopener noreferrer'
      }, 'View Certificate <span aria-hidden="true">&rarr;</span>');
      // The link lives inside the row but must never toggle it.
      link.addEventListener('click', e => e.stopPropagation());

      // head and link are siblings in a flex bar: an anchor cannot be nested
      // inside a button.
      const bar = el('div', { class: 'cert-bar' });
      bar.appendChild(head);
      bar.appendChild(link);

      row.appendChild(shot);
      row.appendChild(scrim);
      row.appendChild(bar);

      const state = { value: 0, velocity: 0, target: 0, render: null };
      const size = { collapsed: 68, expanded: 312 };

      state.render = (p) => {
        row.style.height = (size.collapsed + (size.expanded - size.collapsed) * p) + 'px';
        // Lag the reveal behind the height so the image arrives after the row
        // has started opening (the spec's ~0.12s delay).
        const r = reduceMotion ? p : clamp01((p - 0.20) / 0.80);
        shot.style.opacity = r;
        shot.style.transform = reduceMotion
          ? 'none'
          : 'translateX(' + (-8 * (1 - r)).toFixed(2) + 'px) scale(' + (1.06 - 0.06 * r).toFixed(4) + ')';
        scrim.style.opacity = r;
      };

      const entry = { row, head, bar, state, size, shot, cert: c };
      rows.push(entry);

      shot.addEventListener('click', () => {
        if (state.target > 0.5) openImage(c.title, c.thumb, c.credential);
      });

      head.addEventListener('click', () => {
        if (activeRow === entry) collapseAll();
        else expand(entry);
      });

      if (hoverCapable) {
        row.addEventListener('pointerenter', (e) => {
          if (e.pointerType === 'touch') return;
          expand(entry);
        });
      }

      // Keyboard: focusing the row reveals it, leaving it collapses.
      head.addEventListener('focus', () => expand(entry));
      row.addEventListener('focusout', (e) => {
        if (!row.contains(e.relatedTarget)) {
          if (activeRow === entry) collapseAll();
        }
      });

      list.appendChild(row);
    });

    function measure() {
      const w = window.innerWidth;
      const target = w >= 1024 ? 312 : w >= 768 ? 286 : 248;
      rows.forEach(e => {
        // An open row's bar is an absolute overlay, so its height is the row
        // height, not the collapsed height. Leave that row's measurement
        // alone; it is re-measured when it closes.
        if (!e.row.classList.contains('is-open')) {
          e.size.collapsed = Math.max(68, e.bar.offsetHeight);
        }
        e.size.expanded = Math.max(target, e.size.collapsed + 140);
        e.state.render(e.state.value);
      });
    }

    function expand(entry) {
      if (activeRow === entry) return;
      activeRow = entry;
      rows.forEach(e => {
        const open = e === entry;
        e.row.classList.toggle('is-open', open);
        e.row.classList.toggle('is-dim', !open);
        e.head.setAttribute('aria-expanded', open ? 'true' : 'false');
        springTo(e.state, open ? 1 : 0);
      });
    }

    function collapseAll() {
      if (!activeRow) return;
      activeRow = null;
      rows.forEach(e => {
        e.row.classList.remove('is-open', 'is-dim');
        e.head.setAttribute('aria-expanded', 'false');
        springTo(e.state, 0);
      });
      // Bars are back in flow, so collapsed heights can be trusted again.
      requestAnimationFrame(measure);
    }

    if (hoverCapable) {
      list.addEventListener('pointerleave', (e) => {
        if (e.pointerType === 'touch') return;
        // Don't close a row a keyboard user is focused on just because the
        // mouse happens to be resting elsewhere.
        if (list.contains(document.activeElement)) return;
        collapseAll();
      });
    }

    // Heights depend on how the head wraps, so re-measure when it can change.
    measure();
    if (window.ResizeObserver) {
      let t = 0;
      const ro = new ResizeObserver(() => {
        clearTimeout(t);
        t = setTimeout(measure, 120);
      });
      ro.observe(list);
    }
    window.addEventListener('load', measure);
  }

  function renderContacts() {
    const list = document.getElementById('contact-list');
    if (list) {
      CONTACTS.forEach(c => {
        const a = el('a', {
          class: 'contact-card', href: c.href,
          target: c.href.startsWith('mailto:') ? '_self' : '_blank', rel: 'noopener'
        });
        a.appendChild(el('span', { class: 'contact-icon' }, esc(c.icon)));
        const txt = el('span');
        txt.appendChild(el('p', { class: 'contact-label' }, esc(c.label)));
        txt.appendChild(el('p', { class: 'contact-desc' }, esc(c.desc)));
        txt.appendChild(el('p', { class: 'contact-meta' }, esc(c.meta)));
        a.appendChild(txt);
        list.appendChild(a);
      });
    }

    const links = document.getElementById('footer-links');
    if (links) {
      NAV.forEach(n => {
        links.appendChild(el('a', { href: '#' + n.id, 'data-nav': n.id }, esc(n.label)));
      });
    }

    const connect = document.getElementById('footer-connect');
    if (connect) {
      CONTACTS.forEach(c => {
        connect.appendChild(el('a', {
          href: c.href,
          target: c.href.startsWith('mailto:') ? '_self' : '_blank',
          rel: 'noopener'
        }, esc(c.label)));
      });
    }
  }

  /* =====================================================================
     NAVIGATION
     ===================================================================== */
  function absTop(node) {
    // Document offset. offsetTop is relative to the offsetParent, so it
    // cannot be used directly as a scroll target.
    return node.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0);
  }

  function scrollToId(id) {
    const target = document.getElementById(id);
    if (!target) return;
    const top = Math.max(0, absTop(target) - (id === 'home' ? 0 : 78));
    window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  function setupNav() {
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');

    if (toggle && links) {
      toggle.addEventListener('click', () => {
        const open = links.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      });
    }

    document.addEventListener('click', (e) => {
      const resume = e.target.closest('[data-action="resume"]');
      if (resume) {
        e.preventDefault();
        openPdf('Harsh Patil — Resume', CONFIG.resumePdf);
        return;
      }

      const jump = e.target.closest('a[href^="#"]');
      if (jump) {
        const id = jump.getAttribute('href').slice(1);
        if (!id || !document.getElementById(id)) return;
        e.preventDefault();
        scrollToId(id);
        if (links && links.classList.contains('is-open')) {
          links.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (modalRoot.firstChild) closeModal();
        else if (links && links.classList.contains('is-open')) {
          links.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      }
    });
  }

  function setActiveNav(id) {
    document.querySelectorAll('.nav-link').forEach(a => {
      a.classList.toggle('is-active', a.getAttribute('data-nav') === id);
    });
  }

  /* =====================================================================
     SCROLL CHOREOGRAPHY (GSAP ScrollTrigger — no scroll listeners)
     ===================================================================== */
  let heroProgress = 0;

  function setupScroll() {
    const reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

    if (reduceMotion || !window.gsap || !window.ScrollTrigger) {
      reveals.forEach(n => n.classList.add('is-in'));
      setupSectionSpy();
      return;
    }

    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);

    // Reveals: batched so a grid of cards staggers as one group rather than
    // firing one trigger per card.
    ScrollTrigger.batch(reveals, {
      start: 'top 86%',
      once: true,
      onEnter: batch => {
        batch.forEach((n, i) => setTimeout(() => n.classList.add('is-in'), i * 70));
      }
    });

    const orbit = document.getElementById('hero-orbit');

    // The hero pins for a short distance and that distance is spent on the
    // text swap: the first scroll is consumed by the animation, a further
    // scroll releases the page. Native scroll drives it, so wheel, trackpad
    // and touch all behave, and the page can never end up stuck.
    if (heroSwap) {
      ScrollTrigger.create({
        trigger: '#home',
        start: 'top top',
        end: () => '+=' + Math.round(window.innerHeight * 0.85),
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: self => { heroSwap(self.progress); }
      });
    }

    // Point-cloud dispersion and portrait parallax are driven by About
    // rising into view, which is exactly the stretch after the pin releases.
    // Keeping them off the pinned range is what lets the hero sit completely
    // still while only the text moves.
    ScrollTrigger.create({
      trigger: '#about',
      start: 'top bottom',
      end: 'top top',
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: self => {
        heroProgress = self.progress;
        if (orbit) {
          orbit.style.transform =
            'translate3d(0,' + (self.progress * 64).toFixed(2) + 'px,0) scale(' +
            (1 - self.progress * 0.06).toFixed(4) + ')';
        }
      }
    });

    // Metric counters.
    document.querySelectorAll('.metric dd').forEach(node => {
      const target = parseFloat(node.getAttribute('data-count'));
      const decimals = parseInt(node.getAttribute('data-decimals') || '0', 10);
      const suffix = node.getAttribute('data-suffix') || '';
      if (isNaN(target)) return;

      const obj = { v: 0 };
      ScrollTrigger.create({
        trigger: node,
        start: 'top 92%',
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            v: target,
            duration: 1.1,
            ease: 'power2.out',
            onUpdate: () => { node.textContent = obj.v.toFixed(decimals) + suffix; }
          });
        }
      });
    });

    setupSectionSpy();
  }

  function setupSectionSpy() {
    const ids = NAV.map(n => n.id);
    const sections = ids.map(id => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return;

    // IntersectionObserver rather than a scroll handler. rootMargin biases
    // the "active" band toward the upper third of the viewport.
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) setActiveNav(en.target.id); });
    }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });

    sections.forEach(s => io.observe(s));
  }

  /* =====================================================================
     HERO POINT CLOUD (Three.js)

     A drifting cloud of points standing in for an embedding space: it is
     the shape of the work on this page, not decoration for its own sake.
     Three layers — ambient drift, pointer parallax, scroll dispersion.
     ===================================================================== */
  function webglAvailable() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
                (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) { return false; }
  }

  function dotTexture(THREE) {
    const size = 64;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grd.addColorStop(0.0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.35, 'rgba(255,255,255,0.55)');
    grd.addColorStop(1.0, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }

  function buildLayer(THREE, count, radius, size, texture, tight) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const near = new THREE.Color('#E9E2FF');
    const far = new THREE.Color('#7C5CE6');
    const tmp = new THREE.Color();

    for (let i = 0; i < count; i++) {
      // Even angular spread, random radius biased outward for a shell look.
      const u = Math.random() * 2 - 1;
      const theta = Math.random() * Math.PI * 2;
      const r = radius * (tight ? Math.cbrt(Math.random()) : 0.55 + Math.random() * 0.45);
      const s = Math.sqrt(1 - u * u);

      pos[i * 3]     = r * s * Math.cos(theta);
      pos[i * 3 + 1] = r * s * Math.sin(theta) * 0.82;   // slightly oblate
      pos[i * 3 + 2] = r * u;

      tmp.copy(far).lerp(near, Math.random() * 0.85);
      col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    const mat = new THREE.PointsMaterial({
      size: size,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    });

    return new THREE.Points(geo, mat);
  }

  async function initHero3D() {
    const host = document.getElementById('hero-canvas');
    if (!host || reduceMotion || !webglAvailable()) return;

    let THREE;
    try {
      THREE = await import(THREE_URL);
    } catch (e) {
      // CDN unreachable — the CSS gradient fallback is already showing.
      return;
    }

    const w0 = host.clientWidth || window.innerWidth;
    const h0 = host.clientHeight || window.innerHeight;
    const mobile = window.innerWidth < 768;
    const tablet = window.innerWidth < 1024;

    const renderer = new THREE.WebGLRenderer({ antialias: !mobile, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
    renderer.setSize(w0, h0, false);
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);
    host.classList.add('is-live');

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(58, w0 / h0, 0.1, 100);
    camera.position.z = 7.2;

    const tex = dotTexture(THREE);
    const group = new THREE.Group();

    const dense = mobile ? 620 : tablet ? 1250 : 2400;
    const sparse = mobile ? 90 : tablet ? 170 : 290;

    const core = buildLayer(THREE, dense, 4.1, mobile ? 0.055 : 0.045, tex, true);
    const halo = buildLayer(THREE, sparse, 5.4, mobile ? 0.13 : 0.115, tex, false);
    group.add(core, halo);

    // Offset toward the portrait side on wide screens; centred when stacked.
    group.position.x = window.innerWidth < 900 ? 0 : 1.9;
    scene.add(group);

    const pointer = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    if (!mobile) {
      window.addEventListener('pointermove', (e) => {
        target.x = (e.clientX / window.innerWidth - 0.5) * 2;
        target.y = (e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });
    }

    // Pause when the hero is off-screen or the tab is hidden. A WebGL loop
    // running behind the Projects section is pure battery cost.
    let visible = true;
    let hidden = document.hidden;
    const io = new IntersectionObserver(
      entries => { visible = entries[0].isIntersecting; },
      { threshold: 0 }
    );
    io.observe(host);
    document.addEventListener('visibilitychange', () => { hidden = document.hidden; });

    const ro = new ResizeObserver(() => {
      const w = host.clientWidth, h = host.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      group.position.x = window.innerWidth < 900 ? 0 : 1.9;
    });
    ro.observe(host);

    const clock = new THREE.Clock();
    let raf = 0;

    function frame() {
      raf = requestAnimationFrame(frame);
      if (!visible || hidden) return;

      const dt = Math.min(clock.getDelta(), 0.05);

      // Ambient: continuous slow drift.
      group.rotation.y += dt * 0.045;
      core.rotation.z += dt * 0.012;
      halo.rotation.z -= dt * 0.008;

      // Secondary: pointer parallax, eased rather than snapped.
      pointer.x += (target.x - pointer.x) * 0.045;
      pointer.y += (target.y - pointer.y) * 0.045;
      group.rotation.x = pointer.y * 0.22;
      camera.position.x = pointer.x * 0.45;
      camera.lookAt(0, 0, 0);

      // Primary: the cloud expands and fades as the hero scrolls away.
      const p = heroProgress;
      group.scale.setScalar(1 + p * 0.75);
      core.material.opacity = 0.9 * (1 - p);
      halo.material.opacity = 0.9 * (1 - p);

      renderer.render(scene, camera);
    }
    frame();

    window.addEventListener('pagehide', () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      core.geometry.dispose(); core.material.dispose();
      halo.geometry.dispose(); halo.material.dispose();
      tex.dispose();
      renderer.dispose();
    });
  }

  /* =====================================================================
     PROJECTS — pixel liquid background

     GPU fluid sim behind the project cards. Loaded only when the section is
     near, skipped entirely on touch, small screens and reduced motion: it is
     a second WebGL context on a page that already runs one for the hero.
     ===================================================================== */
  function setupProjectFluid() {
    const section = document.getElementById('projects');
    if (!section || reduceMotion) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.innerWidth < 900) return;
    if (!webglAvailable()) return;

    let started = false;
    const io = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting || started) return;
      started = true;
      io.disconnect();
      import('./fluid-bg.js')
        .then(m => m.createFluidBackground(section, {
          // The site's own violet ramp rather than the component's pink
          // default, so it reads as this page's background.
          palette: ['#08070C', '#140E2B', '#33207A', '#6D42E0', '#A78BFA'],
          pixelSize: 16,
          resolution: 0.32,
          mouseForce: 7,
          cursorSize: 120,
          // Restrained on purpose: this sits behind the section heading and
          // the cards, so it reads as a tint that follows the cursor rather
          // than a field competing with the content.
          intensity: 0.5,
          dissipation: 0.955,
          opacity: 0.34
        }))
        .catch(() => { /* CDN unreachable: the section keeps its flat bg */ });
    }, { rootMargin: '200px 0px' });

    io.observe(section);
  }

  /* =====================================================================
     HERO — scroll-driven text swap

     Two states share one fixed-height viewport. State A slides up and out
     while state B slides in from below, both driven by the hero's existing
     ScrollTrigger progress, so no extra scroll listener is added.
     ===================================================================== */
  // Progress here is the hero's PIN progress, not page scroll. The swap runs
  // over the first stretch of the pin; the remainder is the settled state the
  // hero holds before a further scroll releases it.
  const SWAP_FROM = 0.06;
  const SWAP_TO   = 0.62;

  let heroSwap = null;

  function setupHeroSwap() {
    const swap = document.getElementById('hero-swap');
    if (!swap) return;
    const a = swap.querySelector('[data-state="a"]');
    const b = swap.querySelector('[data-state="b"]');
    if (!a || !b) return;

    const bTitle = b.querySelector('.hero-title');
    const aTitle = a.querySelector('.hero-title');

    const figure = document.querySelector('.hero-figure');

    // How wide the second state's title may run. The text column is the
    // floor, but on the side-by-side layout the portrait is centred in a
    // wider column, so there is unused room between the two. Using it lets
    // the longer title render larger without ever reaching the portrait.
    function availableWidth() {
      let avail = swap.clientWidth;
      if (!figure) return avail;
      const s = swap.getBoundingClientRect();
      const f = figure.getBoundingClientRect();
      const sideBySide = f.top < s.bottom && f.bottom > s.top;
      if (sideBySide && f.left > s.left) {
        avail = Math.max(avail, Math.floor(f.left - s.left - 28));
      }
      return avail;
    }

    function fitTitle() {
      // "AI Research Intern" is much longer than "Harsh Patil". At the same
      // size it would wrap onto a second line and make the box taller, which
      // would push the buttons down. Scale it to one line instead so the
      // hero keeps its exact dimensions.
      bTitle.style.fontSize = '';
      bTitle.style.whiteSpace = 'nowrap';
      swap.style.removeProperty('width');

      const base = parseFloat(getComputedStyle(aTitle).fontSize);
      const avail = availableWidth();
      if (avail > swap.clientWidth) swap.style.width = avail + 'px';

      const natural = bTitle.scrollWidth;
      if (natural > avail && natural > 0) {
        bTitle.style.fontSize = Math.floor(base * (avail / natural) * 100) / 100 + 'px';
      }
    }

    function measure() {
      swap.classList.remove('is-ready');
      bTitle.style.whiteSpace = 'nowrap';
      swap.style.removeProperty('--swap-h');
      // eslint-disable-next-line no-unused-expressions
      swap.offsetHeight;
      fitTitle();
      const h = a.offsetHeight;
      if (!h) return;
      swap.style.setProperty('--swap-h', h + 'px');
      swap.classList.add('is-ready');
      render(lastQ);
    }

    let lastQ = 0;

    function render(q) {
      lastQ = q;
      // Smoothstep keeps the ends from starting and stopping abruptly while
      // staying tied to scroll position.
      const e = q * q * (3 - 2 * q);
      a.style.transform = 'translateY(' + (-e * 100).toFixed(2) + '%)';
      b.style.transform = 'translateY(' + ((1 - e) * 100).toFixed(2) + '%)';
      // Both reach a clean 0 at their own end: no ghost of the incoming text
      // sitting under the hero at rest, and none of the outgoing text left
      // behind once the swap has finished.
      a.style.opacity = (1 - e).toFixed(3);
      b.style.opacity = e.toFixed(3);
    }

    measure();
    window.addEventListener('load', measure);

    let rt = 0;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(measure, 160);
    });

    if (reduceMotion) { render(0); return; }

    heroSwap = (progress) => {
      const q = clamp01((progress - SWAP_FROM) / (SWAP_TO - SWAP_FROM));
      render(q);
    };
    render(0);
  }

  /* =====================================================================
     PROJECTS — hover-expand strip

     Animation reference: Skiper UI "skiper52" (HoverExpand_001) by
     @gurvinder-singh02, rebuilt in vanilla CSS and JS because this site
     carries no React and no Framer Motion. Same behaviour: the cards sit in
     one centred row with every card but one collapsed to a narrow slice,
     and the card under the pointer widens back to full size. The cards
     themselves are untouched — only their width and the row layout move.

     A click, and only a click, opens the full card.

     Phones get a swipe carousel instead. Six cards cannot collapse and
     expand side by side in a phone's width, and a widening card there gives
     no way back to the one you just left. So on a phone every card keeps
     its full size, laid out in one horizontal row you drag left and right,
     snapping card to card. A tap opens the card, as everywhere else.
     ===================================================================== */
  const STRIP_GAP = 6;          // matches the reference's gap-1
  const SWIPE_GAP = 12;
  const STRIP_SLICE_MIN = 40;   // narrowest a collapsed card may get
  const STRIP_SLICE_MAX = 96;

  function stripCardWidth() {
    const w = window.innerWidth;
    if (w >= 1200) return 360;
    if (w >= 1000) return 330;
    if (w >= 820) return 318;
    return 300;
  }

  function setupProjectStrip() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    const cards = Array.prototype.slice.call(grid.querySelectorAll('.proj'));
    if (!cards.length) return;

    let stripped = false;
    let swiping = false; // phone carousel: full-size cards, dragged sideways
    let active = 0;     // the widened card; hover moves it
    let expanded = -1;  // the opened card; only a click sets this
    let heights = { compact: 0, full: 0 };
    // Click carries no pointerType, so the last pointerdown stands in for it.
    let lastPointer = 'mouse';

    function paint() {
      // Only the strip has a widened card. On the carousel every card is
      // already full size, so none of them is singled out.
      cards.forEach((c, i) => {
        c.classList.toggle('is-active', !swiping && (i === active || i === expanded));
      });
    }

    function applyHeight() {
      if (!stripped && !swiping) return;
      const box = expanded >= 0 ? heights.each[expanded] : heights.compact;
      // The opened card's own height, so the row grows by exactly what that
      // card needs.
      grid.style.setProperty('--strip-h-full',
        Math.ceil(heights.each[Math.max(0, expanded)]) + 'px');
      grid.style.setProperty('--strip-h-box', Math.ceil(box) + 'px');
    }

    function setActive(i) {
      // Hover is ignored while a card is open: the open card stays open
      // until it is closed or another one is clicked.
      if (expanded >= 0 || active === i) return;
      active = i;
      paint();
      scrollActiveIntoView(true);
    }

    function setExpanded(i) {
      expanded = i;
      if (i >= 0) active = i;
      cards.forEach((c, n) => c.classList.toggle('is-expanded', n === i));
      // Equal rows are right for a grid of compact cards, but an opened card
      // must be free to grow without dragging every other row with it.
      grid.classList.toggle('has-expanded', i >= 0);
      applyHeight();
      paint();
      scrollActiveIntoView(true);

      // The measured height is taken in grid flow, which can be a line of
      // text out from what the card ends up wrapping to in the row. Once the
      // card has settled, take its real height and correct the row.
      clearTimeout(fitTimer);
      if (i >= 0) fitTimer = setTimeout(() => refit(i), 380);
    }

    let fitTimer = 0;
    function refit(i) {
      if ((!stripped && !swiping) || expanded !== i) return;
      const card = cards[i];
      const shot = card.querySelector('.proj-media');
      const body = card.querySelector('.proj-body');
      if (!shot || !body) return;
      const need = Math.ceil(
        shot.getBoundingClientRect().height +
        body.getBoundingClientRect().height + 2   // the card's own borders
      );
      if (Math.abs(need - heights.each[i]) < 2) return;
      heights.each[i] = need;
      applyHeight();
    }

    // Both card heights, measured in grid flow so they are the real wrapped
    // heights rather than the three-column ones.
    function measureHeights(cardW, openW) {
      const wasExpanded = cards.map(c => c.classList.contains('is-expanded'));
      grid.style.justifyContent = 'center';

      const at = (w, expandedState) => {
        grid.style.gridTemplateColumns = 'repeat(auto-fit, ' + w + 'px)';
        // Equal rows, and grid's default stretch, would both hand a card the
        // height of the tallest card beside it — the opposite of what the
        // per-card pass is measuring.
        grid.style.gridAutoRows = expandedState ? 'auto' : '';
        grid.style.alignItems = expandedState ? 'start' : '';
        cards.forEach(c => c.classList.toggle('is-expanded', expandedState));
        // eslint-disable-next-line no-unused-expressions
        grid.offsetHeight;
        return cards.map(c => c.offsetHeight);
      };

      const compact = Math.max.apply(null, at(cardW, false));
      // Per card, not the tallest of them: an opened card sizes to its own
      // content, so a short one is not left with a stretch of empty panel.
      const each = at(openW, true).map(h => Math.max(h, compact));

      cards.forEach((c, i) => c.classList.toggle('is-expanded', wasExpanded[i]));
      grid.style.removeProperty('grid-template-columns');
      grid.style.removeProperty('grid-auto-rows');
      grid.style.removeProperty('align-items');
      grid.style.removeProperty('justify-content');

      return { compact: compact, each: each };
    }

    // The strip widens a card in place, so nothing has to scroll. The
    // carousel does: an opened card is brought to the middle of the view.
    let scrollTimer = 0;
    function scrollActiveIntoView(smooth) {
      if (!swiping) return;
      const go = () => {
        const card = cards[expanded >= 0 ? expanded : active];
        if (!card || !swiping) return;
        // Measured against the carousel itself. offsetLeft is no use here:
        // the offset parent is the section wrapper, not the scroller, so it
        // carries the wrapper's own inset.
        const cardBox = card.getBoundingClientRect();
        const box = grid.getBoundingClientRect();
        const delta = (cardBox.left - box.left) -
                      (box.width - cardBox.width) / 2;
        grid.scrollTo({
          left: Math.max(0, grid.scrollLeft + delta),
          behavior: smooth && !reduceMotion ? 'smooth' : 'auto'
        });
      };
      go();
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(go, 360);
    }

    function teardown() {
      grid.classList.remove('is-strip', 'is-swipe');
      ['--strip-h', '--strip-h-full', '--strip-h-box', '--strip-card-w',
       '--strip-open-w', '--strip-slice', '--strip-media-h',
       '--strip-media-open-h', '--swipe-pad']
        .forEach(p => grid.style.removeProperty(p));
      cards.forEach(c => c.classList.remove('is-active'));
      grid.scrollLeft = 0;
      stripped = false;
      swiping = false;
    }

    function build() {
      teardown();

      const n = cards.length;
      const gaps = STRIP_GAP * (n - 1);
      const avail = grid.clientWidth;

      const cardW = stripCardWidth();
      const slice = Math.floor((avail - cardW - gaps) / (n - 1));

      // Not enough width for a row of slices plus a readable open card: the
      // phone carousel takes over instead of squeezing anything.
      if (slice < STRIP_SLICE_MIN) return buildSwipe(avail);

      heights = measureHeights(cardW, cardW);
      if (!heights.compact) return;

      grid.style.setProperty('--strip-card-w', cardW + 'px');
      grid.style.setProperty('--strip-open-w', cardW + 'px');
      grid.style.setProperty('--strip-slice',
        Math.min(STRIP_SLICE_MAX, slice) + 'px');
      grid.style.setProperty('--strip-h', Math.ceil(heights.compact) + 'px');
      // The shot's own 16/9 height at the widened width. A collapsed card
      // hands the whole card over to the shot instead, so no slice is left
      // as a bare panel.
      const shotH = Math.round((cardW - 2) * 9 / 16) + 'px';
      grid.style.setProperty('--strip-media-h', shotH);
      grid.style.setProperty('--strip-media-open-h', shotH);

      grid.classList.add('is-strip');
      stripped = true;
      applyHeight();
      paint();
    }

    // Phone carousel: every card at full size in one draggable row, snapping
    // card to card, so going back to an earlier card is the same gesture as
    // going forward. Nothing collapses, so nothing has to be recovered.
    function buildSwipe(avail) {
      const cardW = Math.max(200, Math.min(340, avail - 28));

      heights = measureHeights(cardW, cardW);
      if (!heights.compact) return;

      grid.style.setProperty('--strip-card-w', cardW + 'px');
      grid.style.setProperty('--strip-h', Math.ceil(heights.compact) + 'px');
      // Side padding of half the slack, so the first and last card can sit
      // in the middle of the view like every other one.
      grid.style.setProperty('--swipe-pad',
        Math.max(0, Math.round((avail - cardW) / 2)) + 'px');

      grid.classList.add('is-swipe');
      swiping = true;
      applyHeight();
      paint();
    }

    // A swipe that ends on a card still fires a click in some browsers, and
    // opening a card the visitor was only dragging past would be wrong.
    let dragged = false;
    let downX = 0, downY = 0;

    grid.addEventListener('pointerdown', (e) => {
      lastPointer = e.pointerType || 'mouse';
      dragged = false;
      downX = e.clientX;
      downY = e.clientY;
    }, true);

    grid.addEventListener('pointermove', (e) => {
      if (!e.buttons && e.pointerType !== 'touch') return;
      if (Math.abs(e.clientX - downX) > 10 ||
          Math.abs(e.clientY - downY) > 10) dragged = true;
    }, true);

    cards.forEach((card, i) => {
      // Hover widens a card. No pointerleave reset: the last card pointed at
      // stays open, exactly as in the reference.
      card.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'touch') return;
        setActive(i);
      });

      // Keyboard equivalent, so tabbing does not leave the focused card as a
      // 46px slice.
      card.addEventListener('focusin', () => setActive(i));

      card.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;   // the GitHub link still wins
        e.stopPropagation();
        if (dragged) return;   // this click is the end of a swipe
        // Touch has no hover to widen a card first, so the tap does that job
        // and the next one opens it. A slice carries only a sliver of a
        // screenshot: opening it straight from there would be a blind tap.
        // On the carousel the cards are already full size, so a tap opens.
        if (stripped && lastPointer === 'touch' && active !== i) {
          if (expanded >= 0) setExpanded(-1);
          setActive(i);
          return;
        }
        setExpanded(expanded === i ? -1 : i);
      });
    });

    document.addEventListener('click', (e) => {
      if (grid.contains(e.target)) return;
      if (expanded >= 0) setExpanded(-1);
    });

    function sync() {
      if (reduceMotion) { if (stripped || swiping) teardown(); return; }
      build();
    }

    sync();
    window.addEventListener('load', sync);

    let rt = 0;
    const requeue = () => { clearTimeout(rt); rt = setTimeout(sync, 180); };
    window.addEventListener('resize', requeue);
    // Belt and braces: the widths the card size steps at, so crossing one is
    // caught even where a resize event is missed.
    [1200, 1000, 820, 680].forEach(w => {
      const mq = window.matchMedia('(min-width: ' + w + 'px)');
      if (mq.addEventListener) mq.addEventListener('change', requeue);
    });
    window.addEventListener('orientationchange', requeue);
  }

  /* =====================================================================
     CURSOR IMAGE TRAIL

     Decorative only: a pointer-events:none layer behind everything from
     About through Education + Skills, dropping a logo every so many pixels
     of cursor travel. Older images shrink and fade; the layer is never
     built on touch devices or under reduced motion.
     ===================================================================== */
  const TRAIL_IMAGES = [
    'uploads/trail/hackerrank.webp',
    'uploads/trail/github.webp',
    'uploads/trail/claude.webp',
    'uploads/trail/vscode.webp',
    'uploads/trail/sql.webp',
    'uploads/trail/chatgpt.webp',
    'uploads/trail/python.webp'
  ];
  const TRAIL_LENGTH = 7;
  const TRAIL_SPAWN_DISTANCE = 78;   // px of cursor travel between spawns
  const TRAIL_ROTATION = 17;         // +/- degrees
  const TRAIL_FADE_MS = 560;

  function setupCursorTrail() {
    // The zone wraps About plus Education + Skills; the trail stops where it
    // ends, before Projects.
    const zone = document.getElementById('trail-zone');
    if (!zone || reduceMotion) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const layer = el('div', { class: 'trail-layer', 'aria-hidden': 'true' });
    zone.insertBefore(layer, zone.firstChild);

    // Warm the cache so the first few spawns are not blank.
    TRAIL_IMAGES.forEach(src => { const i = new Image(); i.src = src; });

    const items = [];
    let next = 0;
    let lastX = null, lastY = null;
    let pending = null, raf = 0;

    function restyle() {
      const n = items.length;
      items.forEach((it, i) => {
        // i counts from oldest; age 0 is the newest image.
        const age = (n - 1 - i) / Math.max(1, TRAIL_LENGTH - 1);
        const scale = 1 - age * 0.34;
        // Peak 0.72, not 1: these sit behind body copy and should read as
        // decoration rather than as stickers laid over the text.
        it.el.style.opacity = (0.72 - age * 0.55).toFixed(3);
        it.el.style.transform =
          'translate(-50%,-50%) rotate(' + it.rot.toFixed(1) + 'deg) scale(' + scale.toFixed(3) + ')';
      });
    }

    function retire(it) {
      it.el.style.opacity = '0';
      it.el.style.transform =
        'translate(-50%,-50%) rotate(' + it.rot.toFixed(1) + 'deg) scale(0.62)';
      setTimeout(() => { if (it.el.parentNode) it.el.parentNode.removeChild(it.el); }, TRAIL_FADE_MS);
    }

    function spawn(x, y) {
      const img = el('img', {
        class: 'trail-img',
        src: TRAIL_IMAGES[next % TRAIL_IMAGES.length],
        alt: '', role: 'presentation', draggable: 'false', decoding: 'async'
      });
      next++;

      const rot = (Math.random() * 2 - 1) * TRAIL_ROTATION;
      img.style.left = x + 'px';
      img.style.top = y + 'px';
      img.style.transform = 'translate(-50%,-50%) rotate(' + rot.toFixed(1) + 'deg) scale(0.8)';
      layer.appendChild(img);

      const it = { el: img, rot: rot };
      items.push(it);
      while (items.length > TRAIL_LENGTH) retire(items.shift());

      // Next frame so the browser has a start value to transition from.
      requestAnimationFrame(restyle);
    }

    function flush() {
      raf = 0;
      if (!pending) return;
      const { x, y } = pending;
      pending = null;

      if (lastX === null) { lastX = x; lastY = y; spawn(x, y); return; }
      const dx = x - lastX, dy = y - lastY;
      if (Math.sqrt(dx * dx + dy * dy) < TRAIL_SPAWN_DISTANCE) return;
      lastX = x; lastY = y;
      spawn(x, y);
    }

    // Coalesced to one spawn check per frame, however fast the pointer moves.
    zone.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = layer.getBoundingClientRect();
      pending = { x: e.clientX - r.left, y: e.clientY - r.top };
      if (!raf) raf = requestAnimationFrame(flush);
    }, { passive: true });

    zone.addEventListener('pointerleave', () => {
      lastX = lastY = null;
      pending = null;
      while (items.length) retire(items.shift());
    });
  }

  /* =====================================================================
     LIGHTBOX — PDF.js for the resume, plain image for certificates
     ===================================================================== */
  let pdfLibPromise = null;
  let pdfDoc = null, pdfDocSrc = '';
  let pdfToken = 0, pdfRenderedWidth = 0;
  let pdfRO = null, pdfResizeT = 0;

  function loadPdfJs() {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    if (pdfLibPromise) return pdfLibPromise;
    pdfLibPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = PDFJS_URL;
      s.onload = () => {
        if (!window.pdfjsLib) { reject(new Error('pdf.js loaded but did not initialise.')); return; }
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
        resolve(window.pdfjsLib);
      };
      s.onerror = () => reject(new Error('Could not reach the pdf.js CDN — check your connection.'));
      document.head.appendChild(s);
    });
    return pdfLibPromise;
  }

  function buildModal(title, credential, openHref, openLabel) {
    modalRoot.innerHTML = '';
    const backdrop = el('div', { class: 'modal-backdrop' });
    const panel = el('div', { class: 'modal-panel', role: 'dialog', 'aria-modal': 'true', 'aria-label': esc(title) });

    const head = el('div', { class: 'modal-head' });
    head.appendChild(el('p', { class: 'modal-title' }, esc(title)));
    if (credential) {
      head.appendChild(el('a', { class: 'modal-verify', href: credential, target: '_blank', rel: 'noopener' }, 'Verify credential ↗'));
    }
    const close = el('button', { class: 'modal-close', type: 'button', 'aria-label': 'Close' }, '✕');
    close.addEventListener('click', closeModal);
    head.appendChild(close);

    const body = el('div', { class: 'modal-body' });
    const scroll = el('div', { class: 'modal-scroll' });
    body.appendChild(scroll);

    if (openHref) {
      body.appendChild(el('a', { class: 'modal-open-btn', href: openHref, target: '_blank', rel: 'noopener' }, openLabel));
    }

    panel.appendChild(head);
    panel.appendChild(body);
    backdrop.appendChild(panel);
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeModal(); });
    modalRoot.appendChild(backdrop);
    document.body.classList.add('modal-lock');
    close.focus();
    return scroll;
  }

  function notice(host, title, detail) {
    host.innerHTML = '';
    const wrap = el('div', { class: 'modal-notice' });
    if (!detail) wrap.appendChild(el('div', { class: 'modal-spinner' }));
    wrap.appendChild(el('p', { style: "margin:0;font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:600;color:#F4F3F7" }, esc(title)));
    if (detail) wrap.appendChild(el('p', { style: 'margin:0;max-width:46ch;font-size:13.5px;line-height:1.7;color:#A7A3B8' }, esc(detail)));
    host.appendChild(wrap);
  }

  function openImage(title, src, credential) {
    const host = buildModal(title, credential, src, 'Open full image ↗');
    host.appendChild(el('img', { src: src, alt: esc(title) + ' certificate' }));
  }

  function openPdf(title, src) {
    const host = buildModal(title, null, src, 'Open / download PDF ↗');
    pdfRenderedWidth = 0;
    renderPdf(host, src);

    if (window.ResizeObserver) {
      if (pdfRO) pdfRO.disconnect();
      pdfRO = new ResizeObserver(() => {
        clearTimeout(pdfResizeT);
        pdfResizeT = setTimeout(() => {
          const w = host.clientWidth - 36;
          if (w > 80 && Math.abs(w - pdfRenderedWidth) > 24) renderPdf(host, src);
        }, 160);
      });
      pdfRO.observe(host);
    }
  }

  async function renderPdf(host, src) {
    const avail = host.clientWidth - 36;
    // Width is measured once the panel has settled; retry on the next frame
    // rather than rasterising at a mid-animation width.
    if (avail < 80) { requestAnimationFrame(() => renderPdf(host, src)); return; }

    const token = ++pdfToken;
    pdfRenderedWidth = avail;
    const cached = pdfDocSrc === src && pdfDoc;
    if (!cached) { host.scrollTop = 0; notice(host, 'Rendering PDF…', ''); }

    try {
      let doc = cached ? pdfDoc : null;
      if (!doc) {
        const lib = await loadPdfJs();
        if (token !== pdfToken) return;
        doc = await lib.getDocument(src).promise;
        if (token !== pdfToken) return;
        pdfDoc = doc; pdfDocSrc = src;
      }

      host.innerHTML = '';
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      for (let n = 1; n <= doc.numPages; n++) {
        const page = await doc.getPage(n);
        if (token !== pdfToken) return;
        const unit = page.getViewport({ scale: 1 });
        const vp = page.getViewport({ scale: (avail / unit.width) * dpr });
        const c = document.createElement('canvas');
        c.width = Math.floor(vp.width);
        c.height = Math.floor(vp.height);
        c.style.cssText = 'display:block;margin:0 auto 16px;border-radius:8px;box-shadow:0 10px 34px rgba(0,0,0,.55);max-width:100%;width:' +
          Math.floor(vp.width / dpr) + 'px;height:' + Math.floor(vp.height / dpr) + 'px';
        host.appendChild(c);
        await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
        if (token !== pdfToken) return;
      }
    } catch (err) {
      if (token !== pdfToken) return;
      notice(host, "Couldn't render the preview",
        ((err && err.message) || 'The file could not be read as a PDF.') + ' Use the button below to open it directly.');
    }
  }

  function closeModal() {
    pdfToken++;
    if (pdfRO) { pdfRO.disconnect(); pdfRO = null; }
    clearTimeout(pdfResizeT);
    modalRoot.innerHTML = '';
    document.body.classList.remove('modal-lock');
  }

  /* =====================================================================
     INIT
     ===================================================================== */
  function init() {
    document.body.classList.add('js');

    renderProjects();
    renderCertificates();
    renderContacts();
    setupNav();

    setupHeroSwap();
    setupScroll();
    setupProjectStrip();
    setupProjectFluid();
    setupCursorTrail();
    initHero3D();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
