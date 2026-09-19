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

  function renderCertificates() {
    const grid = document.getElementById('certs-grid');
    if (!grid) return;

    CONFIG.certificates.forEach(c => {
      const card = el('button', { class: 'cert reveal', type: 'button' });

      const media = el('div', { class: 'cert-media' });
      media.appendChild(el('img', {
        src: c.thumb, alt: esc(c.title) + ' certificate', loading: 'lazy', decoding: 'async'
      }));
      card.appendChild(media);

      const body = el('div', { class: 'cert-body' });
      body.appendChild(el('h3', { class: 'cert-title' }, esc(c.title)));
      body.appendChild(el('p', { class: 'cert-issuer' }, esc(c.issuer)));
      card.appendChild(body);

      card.addEventListener('click', () => openImage(c.title, c.thumb, c.credential));
      grid.appendChild(card);
    });
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

    // Hero scrub drives both the portrait parallax and the point-cloud
    // dispersion, so the 3D reacts to scroll without its own listener.
    const portrait = document.getElementById('hero-portrait');
    ScrollTrigger.create({
      trigger: '#home',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: self => {
        heroProgress = self.progress;
        if (portrait) {
          portrait.style.transform =
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

    // A hero portrait that fails to load should leave the layout clean
    // rather than showing a broken-image glyph over the 3D.
    const portrait = document.getElementById('hero-portrait');
    if (portrait) portrait.addEventListener('error', () => { portrait.style.display = 'none'; });

    setupScroll();
    initHero3D();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
