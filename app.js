/**
 * HARSH PATIL — PORTFOLIO ENGINE
 *
 * - 120-frame responsive canvas scrubbing (desktop / tablet / mobile)
 * - AVIF frames with automatic WebP fallback
 * - Dual-buffer LERP interpolation for smooth scrubbing
 * - Step-by-step scroll choreography for Home & About
 * - Document sections (Projects / Certifications / Contact) rendered from CONFIG
 * - Lightbox: PDF.js for the resume, plain image for certificates
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

    // category: "RAG" | "ML" | "GenAI" — drives badge colour
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

  const BADGE = {
    RAG:   { color: '#C4B5FD', bg: 'rgba(139,92,246,.16)', border: 'rgba(139,92,246,.45)', thumbBg: 'linear-gradient(140deg,rgba(46,28,84,.95),rgba(13,11,20,.95))' },
    ML:    { color: '#A5B4FC', bg: 'rgba(99,102,241,.16)', border: 'rgba(99,102,241,.45)', thumbBg: 'linear-gradient(140deg,rgba(28,32,78,.95),rgba(13,11,20,.95))' },
    GenAI: { color: '#F0ABFC', bg: 'rgba(217,70,239,.14)', border: 'rgba(217,70,239,.42)', thumbBg: 'linear-gradient(140deg,rgba(62,24,74,.95),rgba(13,11,20,.95))' }
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

  /* =====================================================================
     CANVAS SCRUBBING ENGINE
     ===================================================================== */
  const TOTAL_FRAMES = 120;
  const LERP_FACTOR = 0.085;
  const PRIORITY_FRAMES = 24;   // reveal the page once these are in

  const canvas = document.getElementById('animation-canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const preloader = document.getElementById('preloader');
  const preloaderBar = document.getElementById('preloader-bar');
  const preloaderPercent = document.getElementById('preloader-percent');
  const timelineFill = document.getElementById('timeline-fill');

  const navLinks = document.querySelectorAll('.nav-link');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const exploreBtn = document.getElementById('explore-btn');

  const track = document.getElementById('scroll-track');
  const docSections = document.getElementById('doc-sections');

  const stageHome = document.getElementById('stage-home');
  const stageAbout = document.getElementById('stage-about');

  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');
  const step3 = document.getElementById('step-3');
  const step4 = document.getElementById('step-4');

  const aboutStep1 = document.getElementById('about-step-1');
  const aboutStep2 = document.getElementById('about-step-2');
  const aboutStep3 = document.getElementById('about-step-3');
  const aboutStep4 = document.getElementById('about-step-4');
  const eduCard = document.querySelector('.education-card');
  const skillCard = document.querySelector('.skills-card');
  const canvasWrapper = document.getElementById('canvas-wrapper');

  let frameExt = 'avif';
  let currentDevice = getDeviceType();
  const imageCache = { desktop: [], tablet: [], mobile: [] };

  let targetProgress = 0;
  let currentProgress = 0;
  let currentFrameIndex = 0;
  let storyDone = false;
  let stageAboutOpacity = 0;   // narrative opacity, before the handoff fade

  function getDeviceType() {
    const w = window.innerWidth;
    if (w > 1024) return 'desktop';
    if (w >= 768) return 'tablet';
    return 'mobile';
  }

  function getFramePath(device, index) {
    return 'frames/' + device + '/frame_' + String(index + 1).padStart(4, '0') + '.' + frameExt;
  }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    const next = getDeviceType();
    if (next !== currentDevice) {
      currentDevice = next;
      preloadDeviceFrames(currentDevice);
    }
    renderCurrentFrame();
  }

  function renderFrame(img) {
    if (!img || !img.complete || img.naturalWidth === 0) return;
    const cw = canvas.width, ch = canvas.height;
    const ir = img.naturalWidth / img.naturalHeight;
    const cr = cw / ch;
    let rw, rh, ox, oy;
    if (cr > ir) { rw = cw; rh = cw / ir; ox = 0; oy = (ch - rh) / 2; }
    else { rh = ch; rw = ch * ir; oy = 0; ox = (cw - rw) / 2; }
    ctx.drawImage(img, ox, oy, rw, rh);
  }

  function renderCurrentFrame() {
    const frames = imageCache[currentDevice];
    const img = frames && frames[currentFrameIndex];
    if (img && img.complete && img.naturalWidth > 0) {
      renderFrame(img);
      return;
    }
    // Requested frame not in yet — fall back to the nearest earlier one.
    for (let i = currentFrameIndex - 1; i >= 0; i--) {
      const f = frames && frames[i];
      if (f && f.complete && f.naturalWidth > 0) { renderFrame(f); return; }
    }
  }

  function preloadDeviceFrames(device, onPriority) {
    if (imageCache[device].length === TOTAL_FRAMES) {
      if (onPriority) onPriority();
      return;
    }
    let loaded = 0;
    let priorityFired = false;
    const frames = [];
    imageCache[device] = frames;

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      const done = () => {
        loaded++;
        if (i === 0) renderCurrentFrame();
        if (!priorityFired && loaded >= Math.min(PRIORITY_FRAMES, TOTAL_FRAMES)) {
          priorityFired = true;
          if (onPriority) onPriority();
        }
        if (onPriority && !priorityFired) {
          const pct = Math.round((loaded / PRIORITY_FRAMES) * 100);
          if (preloaderBar) preloaderBar.style.width = pct + '%';
          if (preloaderPercent) preloaderPercent.textContent = pct + '%';
        }
      };
      img.onload = done;
      img.onerror = done;
      img.src = getFramePath(device, i);
      frames.push(img);
    }
  }

  /* =====================================================================
     SCROLL NARRATIVE — timings exactly as authored
     ===================================================================== */
  function interpolateRange(p, start, full, exitStart, exitEnd) {
    if (p < start) return 0;
    // start === full means "already fully in" — used by the hero so the page
    // is not blank at rest on first load (progress is exactly 0 there).
    if (p <= full) return full === start ? 1 : (p - start) / (full - start);
    if (p <= exitStart) return 1;
    if (p <= exitEnd) return 1 - ((p - exitStart) / (exitEnd - exitStart));
    return 0;
  }

  // Opacity + interactivity together. The stylesheet used to gate clicks behind
  // a .visible class that was never applied, which made every hero button dead.
  // `collapse` takes a faded-out block out of layout flow, so the block that
  // replaces it can occupy the stage instead of being pushed below it.
  function paint(node, opacity, offsetY, collapse) {
    if (!node) return;
    node.style.opacity = opacity;
    if (offsetY != null) node.style.transform = 'translateY(' + offsetY + 'px)';
    node.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
    if (collapse) node.style.display = opacity <= 0.01 ? 'none' : '';
  }

  function updateScrollNarrative(progress) {
    if (timelineFill) timelineFill.style.width = Math.min(100, progress * 100) + '%';

    // STAGE 1: HOME (0.00 → 0.44)
    const homeOpacity = interpolateRange(progress, 0.00, 0.00, 0.38, 0.44);
    if (stageHome) {
      stageHome.style.opacity = homeOpacity;
      stageHome.style.pointerEvents = homeOpacity > 0.2 ? 'auto' : 'none';
      stageHome.style.transform = 'translateY(' + (progress * -30) + 'px)';
    }

    paint(step1, interpolateRange(progress, 0.00, 0.00, 0.38, 0.44), 0);
    paint(step2, interpolateRange(progress, 0.03, 0.10, 0.38, 0.44), (1 - clamp01((progress - 0.03) / 0.07)) * 16);
    paint(step3, interpolateRange(progress, 0.10, 0.20, 0.38, 0.44), (1 - clamp01((progress - 0.10) / 0.10)) * 18);
    paint(step4, interpolateRange(progress, 0.20, 0.32, 0.38, 0.44), (1 - clamp01((progress - 0.20) / 0.12)) * 16);

    // STAGE 2: ABOUT (0.44 → 1.00)
    const aboutOpacity = interpolateRange(progress, 0.44, 0.50, 1.0, 1.0);
    stageAboutOpacity = aboutOpacity;
    if (stageAbout) {
      // Final opacity is applied in tick(), which also folds in the handoff fade.
      stageAbout.style.pointerEvents = aboutOpacity > 0.2 ? 'auto' : 'none';
      stageAbout.classList.toggle('active', aboutOpacity > 0.01);
    }
    // The intro block (header + narrative + stats) hands over to the
    // Education/Skills cards rather than stacking with them — otherwise the
    // section is taller than any real viewport and needs a nested scrollbar.
    paint(aboutStep1, interpolateRange(progress, 0.45, 0.51, 0.72, 0.78), (1 - clamp01((progress - 0.45) / 0.06)) * 22, true);
    paint(aboutStep2, interpolateRange(progress, 0.52, 0.59, 0.72, 0.78), (1 - clamp01((progress - 0.52) / 0.07)) * 22, true);
    paint(aboutStep3, interpolateRange(progress, 0.60, 0.67, 0.72, 0.78), (1 - clamp01((progress - 0.60) / 0.07)) * 20, true);

    // Below the 2-column breakpoint the two cards stack, which again overflows,
    // so on narrow screens they take the stage one at a time.
    const twoCol = window.innerWidth > 1024;
    let eduOp, skillOp;
    if (twoCol) {
      eduOp = skillOp = interpolateRange(progress, 0.78, 0.88, 1.0, 1.0);
    } else {
      // Stacked on one grid cell (see layoutAboutCards), so they can overlap
      // through a true cross-fade with no blank frame between them.
      eduOp = interpolateRange(progress, 0.76, 0.83, 0.87, 0.92);
      skillOp = interpolateRange(progress, 0.87, 0.92, 1.0, 1.0);
    }

    const wrap = Math.max(eduOp, skillOp);
    paint(aboutStep4, wrap, (1 - clamp01((progress - 0.76) / 0.10)) * 22, true);
    if (eduCard) {
      eduCard.style.opacity = eduOp;
      eduCard.style.pointerEvents = eduOp > 0.5 ? 'auto' : 'none';
    }
    if (skillCard) {
      skillCard.style.opacity = skillOp;
      skillCard.style.pointerEvents = skillOp > 0.5 ? 'auto' : 'none';
    }
  }

  /* Below the 2-column breakpoint the Education and Skills cards share one grid
     cell, stacked on top of each other, so they can cross-fade without the
     section growing taller than the stage. The cell is pinned to the taller of
     the two, measured while both are still in normal flow. */
  function layoutAboutCards() {
    const grid = document.querySelector('.about-split-grid');
    if (!grid || !eduCard || !skillCard) return;
    const cards = [eduCard, skillCard];

    cards.forEach(c => { c.style.position = ''; c.style.top = ''; c.style.left = ''; c.style.width = ''; });
    grid.style.position = '';
    grid.style.minHeight = '';

    if (window.innerWidth > 1024) return;

    const h = Math.max(eduCard.offsetHeight, skillCard.offsetHeight);
    grid.style.position = 'relative';
    grid.style.minHeight = h + 'px';
    cards.forEach(c => { c.style.position = 'absolute'; c.style.top = '0'; c.style.left = '0'; c.style.width = '100%'; });
  }

  function clamp01(v) { return Math.min(1, Math.max(0, v)); }

  /* =====================================================================
     SCROLL SPY — spans the fixed story track and the document sections
     ===================================================================== */
  function setActiveNav(id) {
    navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('data-nav') === id));
  }

  function updateActiveSection(progress) {
    if (!storyDone) {
      setActiveNav(progress < 0.46 ? 'home' : 'about');
      return;
    }
    let active = 'projects';
    ['projects', 'certifications', 'contact'].forEach(id => {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.45) active = id;
    });
    setActiveNav(active);
  }

  /* =====================================================================
     MAIN LOOP
     ===================================================================== */
  function trackScrollable() {
    return Math.max(1, track.offsetHeight - window.innerHeight);
  }

  function tick() {
    const y = window.scrollY || window.pageYOffset || 0;
    targetProgress = clamp01(y / trackScrollable());
    currentProgress += (targetProgress - currentProgress) * LERP_FACTOR;

    // Hand the screen over to the document sections proportionally, so the
    // fixed layers cross-fade smoothly in BOTH directions rather than snapping
    // at a threshold when you scroll back up from Projects.
    let handoff = 0;
    if (docSections) {
      const top = docSections.getBoundingClientRect().top;
      const vh = window.innerHeight;
      handoff = clamp01((vh - top) / (vh * 0.75));
    }
    if (canvasWrapper) {
      canvasWrapper.style.opacity = 1 - handoff;
      canvasWrapper.style.pointerEvents = handoff > 0.5 ? 'none' : '';
    }
    if (stageHome) stageHome.style.visibility = handoff >= 1 ? 'hidden' : '';
    if (stageAbout) {
      stageAbout.style.visibility = handoff >= 1 ? 'hidden' : '';
      stageAbout.style.opacity = stageAboutOpacity * (1 - handoff);
    }

    if ((handoff >= 1) !== storyDone) {
      storyDone = handoff >= 1;
      document.body.classList.toggle('story-done', storyDone);
    }

    if (!storyDone) {
      const frame = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(currentProgress * (TOTAL_FRAMES - 1))));
      if (frame !== currentFrameIndex) {
        currentFrameIndex = frame;
        renderCurrentFrame();
      }
      updateScrollNarrative(currentProgress);
    }

    updateActiveSection(currentProgress);
    requestAnimationFrame(tick);
  }

  /* =====================================================================
     NAVIGATION
     ===================================================================== */
  // Document offset. offsetTop is relative to the offsetParent (.doc-sections
  // is positioned), so it cannot be used directly as a scroll target.
  function absTop(node) {
    return node.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0);
  }

  function scrollToTarget(id) {
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (id === 'about') {
      window.scrollTo({ top: trackScrollable() * 0.50, behavior: 'smooth' });
    } else {
      const node = document.getElementById(id);
      if (node) window.scrollTo({ top: Math.max(0, absTop(node) - 90), behavior: 'smooth' });
    }
  }

  function setupInteractions() {
    document.addEventListener('click', (e) => {
      // Resume buttons (navbar + hero)
      const resumeBtn = e.target.closest('[data-action="resume"]');
      if (resumeBtn) {
        e.preventDefault();
        openPdf('Resume — Harsh Patil', CONFIG.resumePdf);
        return;
      }

      // Nav links and brand
      const navEl = e.target.closest('[data-nav]');
      if (navEl) {
        e.preventDefault();
        const id = navEl.getAttribute('data-nav');
        if (navMenu) navMenu.classList.remove('open');
        setActiveNav(id);
        scrollToTarget(id);
      }
    });

    if (exploreBtn) {
      exploreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToTarget('projects');
      });
    }

    if (mobileToggle && navMenu) {
      mobileToggle.addEventListener('click', () => navMenu.classList.toggle('open'));
    }

    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  }

  /* =====================================================================
     DOCUMENT SECTIONS — rendered from CONFIG
     ===================================================================== */
  function el(tag, attrs, html) {
    const n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(k => n.setAttribute(k, attrs[k]));
    if (html != null) n.innerHTML = html;
    return n;
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function renderProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    CONFIG.projects.forEach(p => {
      const b = BADGE[p.category] || BADGE.ML;
      const card = el('article', { class: 'proj-card reveal' });
      card.innerHTML =
        '<div style="position:relative;aspect-ratio:16/9;background:' + b.thumbBg + '">' +
          '<img src="' + esc(p.image) + '" alt="' + esc(p.title) + ' screenshot" loading="lazy" ' +
            'style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top left;display:block" />' +
          '<span style="position:absolute;top:14px;left:14px;padding:5px 12px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.10em;text-transform:uppercase;color:' + b.color + ';background:' + b.bg + ';border:1px solid ' + b.border + '">' + esc(p.category) + '</span>' +
        '</div>' +
        '<div style="padding:22px;display:flex;flex-direction:column;gap:14px;flex:1">' +
          '<h3 style="margin:0;font-family:\'Space Grotesk\',sans-serif;font-size:19px;font-weight:600;letter-spacing:-0.01em;line-height:1.3;color:#F5F5F7">' + esc(p.title) + '</h3>' +
          '<p style="margin:-4px 0 0;font-size:14px;line-height:1.6;font-weight:500;color:#C4B5FD">' + esc(p.tagline) + '</p>' +
          '<p style="margin:0;font-size:14.5px;line-height:1.7;color:#9CA3AF">' + esc(p.description) + '</p>' +
          '<div style="display:flex;flex-wrap:wrap;gap:7px">' +
            p.tech.map(t => '<span class="doc-chip">' + esc(t) + '</span>').join('') +
          '</div>' +
          '<div style="margin-top:auto;padding-top:8px;display:flex;align-items:center;justify-content:space-between;gap:12px">' +
            '<a href="' + esc(p.github) + '" target="_blank" rel="noopener" style="display:flex;align-items:center;min-height:44px;font-size:14px;font-weight:600">View Details →</a>' +
          '</div>' +
        '</div>';
      grid.appendChild(card);
    });
  }

  function renderCertificates() {
    const grid = document.getElementById('certs-grid');
    if (!grid) return;
    CONFIG.certificates.forEach(c => {
      const card = el('button', { class: 'cert-card reveal', type: 'button' });
      card.innerHTML =
        '<div style="position:relative;aspect-ratio:4/3;background:linear-gradient(150deg,rgba(30,22,54,.95),rgba(14,12,24,.95))">' +
          '<img src="' + esc(c.thumb) + '" alt="' + esc(c.title) + ' certificate" loading="lazy" ' +
            'style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block" />' +
        '</div>' +
        '<div style="padding:18px;display:flex;flex-direction:column;gap:7px;flex:1">' +
          '<p style="margin:0;font-size:15px;font-weight:600;line-height:1.4;color:#F5F5F7">' + esc(c.title) + '</p>' +
          '<p style="margin:0;font-size:13px;color:#8B8798">' + esc(c.issuer) + '</p>' +
          '<span style="margin-top:auto;padding-top:10px;font-size:13.5px;font-weight:600;color:#A855F7">View Certificate →</span>' +
        '</div>';
      card.addEventListener('click', () => openImage(c.title, c.thumb, c.credential));
      grid.appendChild(card);
    });
  }

  function renderContacts() {
    const list = document.getElementById('contact-list');
    if (list) {
      CONTACTS.forEach(c => {
        const a = el('a', { class: 'contact-card', href: c.href, target: '_blank', rel: 'noopener' });
        a.innerHTML =
          '<span style="flex:0 0 44px;width:44px;height:44px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:17px;font-family:ui-monospace,Menlo,monospace;font-weight:600;color:#EDE9FE;background:linear-gradient(135deg,rgba(139,92,246,.30),rgba(99,102,241,.20));border:1px solid rgba(139,92,246,.35)">' + esc(c.icon) + '</span>' +
          '<span style="flex:1">' +
            '<span style="display:block;font-size:15.5px;font-weight:600;color:#F5F5F7">' + esc(c.label) + '</span>' +
            '<span style="display:block;margin-top:3px;font-size:13.5px;color:#8B8798">' + esc(c.desc) + '</span>' +
            '<span style="display:block;margin-top:4px;font-size:12.5px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#A855F7;word-break:break-all">' + esc(c.meta) + '</span>' +
          '</span>' +
          '<span style="font-size:17px;color:#A855F7">→</span>';
        list.appendChild(a);
      });
    }

    const fl = document.getElementById('footer-links');
    if (fl) {
      NAV.forEach(n => {
        const a = el('a', { href: '#' + n.id, 'data-nav': n.id, style: 'display:flex;align-items:center;min-height:44px;font-size:14.5px;color:#9CA3AF' }, esc(n.label));
        fl.appendChild(a);
      });
    }

    const fc = document.getElementById('footer-connect');
    if (fc) {
      CONTACTS.forEach(c => {
        const a = el('a', { href: c.href, target: '_blank', rel: 'noopener', style: 'display:flex;align-items:center;gap:11px;min-height:44px;font-size:14.5px;color:#9CA3AF' },
          '<span style="font-family:ui-monospace,Menlo,monospace;font-size:13px;color:#A855F7">' + esc(c.icon) + '</span><span>' + esc(c.label) + '</span>');
        fc.appendChild(a);
      });
    }
  }

  function setupReveals() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('shown');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach(n => io.observe(n));
  }

  /* =====================================================================
     LIGHTBOX — PDF.js for the resume, plain image for certificates
     ===================================================================== */
  const PDFJS_URL = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js';
  const PDFJS_WORKER_URL = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
  const modalRoot = document.getElementById('modal-root');

  let pdfLibPromise = null;
  let pdfDoc = null, pdfDocSrc = null;
  let pdfToken = 0, pdfRenderedWidth = 0, pdfRO = null, pdfResizeT = 0;

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
    const panel = el('div', { class: 'modal-panel' });

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
    return scroll;
  }

  function notice(host, title, detail) {
    host.innerHTML = '';
    const wrap = el('div', { class: 'modal-notice' });
    if (!detail) wrap.appendChild(el('div', { class: 'modal-spinner' }));
    wrap.appendChild(el('p', { style: "margin:0;font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:600;color:#F5F5F7" }, esc(title)));
    if (detail) wrap.appendChild(el('p', { style: 'margin:0;max-width:46ch;font-size:13.5px;line-height:1.7;color:#9CA3AF' }, esc(detail)));
    host.appendChild(wrap);
  }

  function openImage(title, src, credential) {
    const host = buildModal(title, credential, src, 'Open full image ↗');
    const img = el('img', { src: src, alt: esc(title) + ' certificate' });
    host.appendChild(img);
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
  function reveal() {
    if (preloader) preloader.classList.add('hidden');
    document.body.classList.remove('loading-state');
  }

  function start() {
    resizeCanvas();
    setupInteractions();
    renderProjects();
    renderCertificates();
    renderContacts();
    setupReveals();
    layoutAboutCards();
    window.addEventListener('resize', resizeCanvas, { passive: true });
    window.addEventListener('resize', layoutAboutCards, { passive: true });

    preloadDeviceFrames(currentDevice, () => setTimeout(reveal, 200));

    // Safety net: never trap the visitor behind the preloader.
    setTimeout(reveal, 8000);

    requestAnimationFrame(tick);
  }

  function init() {
    // Probe a real frame to choose the format — AVIF where supported, else WebP.
    const probe = new Image();
    probe.onload = () => { frameExt = 'avif'; start(); };
    probe.onerror = () => { frameExt = 'webp'; start(); };
    probe.src = 'frames/' + currentDevice + '/frame_0001.avif';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
