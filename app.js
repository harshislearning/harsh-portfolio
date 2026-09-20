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
        title: 'HistoScope - Lung & Colon Cancer Histopathology Classifier',
        category: 'DL',
        tagline: 'Classifies H&E histopathology tiles into five lung and colon diagnostic classes at 98.93% test accuracy.',
        description: 'A MobileNetV2 transfer-learning model that separates benign tissue from adenocarcinoma and squamous cell carcinoma across lung and colon slides, at 0.9998 ROC-AUC, 1.000 malignancy sensitivity, and 97.33% accuracy held under stain shift, served through a Streamlit app that returns the full probability distribution for every tile.',
        image: 'uploads/histoscope.webp',
        tech: ['Deep Learning', 'Computer Vision', 'Transfer Learning', 'MobileNetV2', 'TensorFlow', 'Medical Imaging', 'Streamlit', 'Python'],
        github: 'https://github.com/harshislearning/Lung-and-colon-cancer-image-classification'
      },
      {
        title: 'Ask My Docs',
        category: 'RAG',
        tagline: 'A production-grade RAG system that answers questions from your PDFs, with citations you can trust.',
        description: 'Hybrid retrieval (dense + keyword) + reranking + cited, verified answers, served via FastAPI and Streamlit, with an automated eval suite gating every change in CI.',
        image: 'uploads/Screenshot 2026-08-11 123718.png',
        tech: ['RAG', 'LLM', 'FastAPI', 'Streamlit', 'FAISS', 'BM25', 'Python', 'CI/CD'],
        github: 'https://github.com/harshislearning/Ask-My-Docs'
      },
      {
        title: 'Vendor Invoice Intelligence Platform',
        category: 'ML',
        tagline: 'ML-driven freight cost forecasting and invoice risk flagging for procurement & finance teams.',
        description: 'An end-to-end ML system that predicts vendor freight costs and automatically flags high-risk invoices for manual review, built on real invoice/purchase data with a live Streamlit dashboard.',
        image: 'uploads/Screenshot 2026-08-13 151213.png',
        tech: ['Machine Learning', 'Regression', 'Classification', 'Python', 'Scikit-learn', 'Pandas', 'SQLite', 'Streamlit'],
        github: 'https://github.com/harshislearning/-Vendor-Invoice-Intelligence-Platform'
      },
      {
        title: 'AI-Powered Synthetic Data Generator & Data Cleaning Tutor',
        category: 'GenAI',
        tagline: 'Generates messy, realistic datasets on demand, then teaches you exactly how to clean them.',
        description: 'A Streamlit app that creates domain-specific synthetic datasets with intentionally injected data quality issues, then uses an LLM to generate a step-by-step Python or SQL cleaning solution for the exact dataset you just made.',
        image: 'uploads/Screenshot (130).png',
        tech: ['LLM', 'Streamlit', 'Python', 'Pandas', 'Faker', 'Groq API', 'EdTech'],
        github: 'https://github.com/harshislearning/AI-Powered-Synthetic-Data-Generator-and-Data-Cleaning-Tutor'
      },
      {
        title: 'Prediction of FC Barcelona Football Matches',
        category: 'ML',
        tagline: 'Predicting Win / Draw / Loss for FC Barcelona matches, built on a self-made dataset, achieving 72.22% accuracy.',
        description: "A machine learning model trained on a custom-built dataset of FC Barcelona's 2023/24 and 2024/25 seasons, served through a Flask web app that predicts match outcomes from opponent and home/away input.",
        image: 'uploads/Screenshot 2026-08-11 122140.png',
        tech: ['Machine Learning', 'Flask', 'Python', 'Scikit-learn', 'Sports Analytics', 'Random Forest', 'XGBoost'],
        github: 'https://github.com/harshislearning/Prediction-of-Fc-Barcelona-Football-Matches'
      },
      {
        title: 'LinkedIn Post Generator',
        category: 'GenAI',
        tagline: 'AI that writes LinkedIn posts in your own voice, trained on your past posts, not a generic template.',
        description: 'An LLM-powered tool that generates LinkedIn posts matching a chosen topic, language, and length, using few-shot examples pulled from a real post history to keep the writing style human, not robotic.',
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
    { label: 'Experience', id: 'experience' },
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
  // attrs are set with setAttribute, which stores the string verbatim: values
  // passed here must NOT go through esc(), or the entities land in the
  // attribute itself. html is assigned to innerHTML, which always needs it.
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
      // The card is the control that opens itself, so it has to be reachable
      // by keyboard. Nothing inside a closed card is focusable — the GitHub
      // link is display:none until the card opens — so without this there is
      // no way to a project without a pointer.
      const card = el('article', {
        class: 'proj reveal', tabindex: '0', 'aria-expanded': 'false'
      });

      const media = el('div', { class: 'proj-media' });
      media.appendChild(el('img', {
        src: p.image,
        // Not esc(): setAttribute stores the string as given and never parses
        // entities, so escaping here puts a literal "&amp;" in the alt text.
        alt: p.title + ' screenshot',
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
    // A row that has finished opening or closing has changed the page's
    // height, and everything below it has moved with it.
    if (!springRaf) refreshScroll(120);
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
        // Attribute, not markup: esc() here would read out as "&amp;".
        alt: c.title + ' certificate', loading: 'lazy', decoding: 'async'
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
    // Home is the top of the page, full stop. Measuring it lands wherever
    // the pinned hero happens to be sitting, which is the end of its
    // animation rather than the start of the page.
    const top = id === 'home' ? 0 : Math.max(0, absTop(target) - 78);
    window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  function setupNav() {
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');

    // One place that owns the menu's state. The two closers below used to set
    // aria-expanded and leave the label behind, so after a link was tapped the
    // button still announced itself as "Close navigation" while it opened.
    function setMenu(open) {
      if (!links) return;
      links.classList.toggle('is-open', open);
      if (!toggle) return;
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    }

    if (toggle && links) {
      toggle.addEventListener('click', () => {
        setMenu(!links.classList.contains('is-open'));
      });
    }

    document.addEventListener('click', (e) => {
      const resume = e.target.closest('[data-action="resume"]');
      if (resume) {
        e.preventDefault();
        openPdf('Harsh Patil - Resume', CONFIG.resumePdf);
        return;
      }

      const jump = e.target.closest('a[href^="#"]');
      if (jump) {
        const id = jump.getAttribute('href').slice(1);
        if (!id || !document.getElementById(id)) return;
        e.preventDefault();
        scrollToId(id);
        if (links && links.classList.contains('is-open')) setMenu(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (modalRoot.firstChild) closeModal();
        else if (links && links.classList.contains('is-open')) setMenu(false);
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

    // A phone's address bar sliding away is a viewport resize, and
    // recomputing a pin in the middle of the scroll that caused it is how
    // the hero ends up jumping. Width changes still refresh.
    ScrollTrigger.config({ ignoreMobileResize: true });

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

    // Everything that arrives after the first measurement moves the page
    // under it: the web fonts, the project screenshots, the row collapsing
    // into a strip. A trigger measured mid-change keeps those numbers, and
    // for a pinned hero that is not a small error — a start measured
    // against the wrong page puts the hero's pin past its end while the
    // visitor is at the top of the page, which leaves the hero pushed a
    // screen down and the top of the page empty. So: measure again once
    // each of those has landed, and once more after everything has.
    window.addEventListener('load', () => refreshScroll(300));
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => refreshScroll(300)).catch(() => {});
    }
    setTimeout(() => refreshScroll(0), 1400);

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
  // Probed once, and the probe hands its context straight back. Browsers cap
  // how many WebGL contexts can be live at a time, and each probe was
  // holding one open for the life of the page — two probes for the two
  // contexts this page actually wants, the hero and the projects
  // background. Whichever renderer asked last could be refused, which is
  // why the background sometimes only turned up after a reload or three.
  let webglProbe = null;

  /* ---------------------------------------------------------------------
     ScrollTrigger measures the page once and caches where every trigger
     starts and ends. Anything that changes the page's height afterwards
     leaves those numbers describing a page that no longer exists — and the
     hero is pinned, so a stale measurement strands it: the pin holds its
     end transform, the hero sits a screen further down than it should, and
     the top of the page is an empty field of stars.

     The projects row alone changes the section's height by well over a
     thousand pixels when it becomes a strip, and again whenever a card is
     opened. So every such change asks for a refresh here, debounced, since
     several of them tend to land together.
     --------------------------------------------------------------------- */
  let refreshTimer = 0;
  let refreshAt = 0;

  function refreshScroll(delay) {
    if (!window.ScrollTrigger) return;
    const wait = delay == null ? 180 : delay;
    const when = performance.now() + wait;
    // The longest outstanding wait wins. These used to share one timer, so a
    // short request cancelled a long one — a certificate row settling at 120ms
    // would pull the refresh in ahead of a card that was still growing for
    // another 440, and the page was measured mid-change.
    if (refreshTimer && when <= refreshAt) return;
    clearTimeout(refreshTimer);
    refreshAt = when;
    refreshTimer = setTimeout(() => {
      refreshTimer = 0;
      window.ScrollTrigger.refresh();
    }, wait);
  }

  function webglAvailable() {
    if (webglProbe !== null) return webglProbe;
    try {
      const c = document.createElement('canvas');
      const gl = window.WebGLRenderingContext &&
                 (c.getContext('webgl') || c.getContext('experimental-webgl'));
      if (gl) {
        const lose = gl.getExtension('WEBGL_lose_context');
        if (lose) lose.loseContext();
      }
      webglProbe = !!gl;
    } catch (e) {
      webglProbe = false;
    }
    return webglProbe;
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
    // entries.some, not entries[0]: a callback can carry several records for
    // the same target, and reading only the first can take a stale one — the
    // loop then stops with the hero in plain view and nothing to start it
    // again until the next crossing.
    const io = new IntersectionObserver(
      entries => { visible = entries.some(e => e.isIntersecting); },
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

    window.addEventListener('pagehide', (e) => {
      // A page going into the back/forward cache is coming back alive, with
      // this same document. Disposing the renderer there leaves the hero
      // empty on the way back, and .is-live has already hidden the CSS
      // fallback, so there would be nothing behind it at all.
      if (e.persisted) return;
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
    if (!webglAvailable()) return;

    // Phones carry the same background, on a cheaper budget: a coarser
    // simulation and fewer pressure iterations. It is the section's
    // backdrop, so leaving it out on a phone made the section look like a
    // different page, and it only ever ran there by accident — the width
    // was read once, at load, so narrowing a window kept it while loading
    // narrow lost it until the next reload from a wider window.
    function settings() {
      const small = window.innerWidth < 900;
      return {
        // The site's own violet ramp rather than the component's pink
        // default, so it reads as this page's background.
        palette: ['#08070C', '#140E2B', '#33207A', '#6D42E0', '#A78BFA'],
        pixelSize: small ? 12 : 16,
        resolution: small ? 0.24 : 0.32,
        pressureIterations: small ? 12 : 18,
        mouseForce: 7,
        cursorSize: small ? 90 : 120,
        // Restrained on purpose: this sits behind the section heading and
        // the cards, so it reads as a tint that follows the pointer rather
        // than a field competing with the content.
        intensity: 0.5,
        dissipation: 0.955,
        opacity: 0.34
      };
    }

    let started = false;
    let tries = 0;

    function start() {
      if (started) return;
      started = true;
      import('./fluid-bg.js')
        .then(m => m.createFluidBackground(section, settings()))
        .catch(() => {
          // A dropped module or CDN fetch used to end it for good, and a
          // reload was the only way back. Two retries cover the flake;
          // after that the section keeps its flat background.
          started = false;
          if (++tries < 3) setTimeout(start, 2000 * tries);
        });
    }

    // A screen's warning, so the module and Three.js are fetched and the
    // shaders compiled before the section arrives rather than while the
    // visitor is already looking at it.
    //
    // entries.some, not entries[0]: a callback can carry several records,
    // and reading only the first meant an arriving section could be
    // reported behind a stale record and missed. The observer then never
    // fired again, because by that point nothing was crossing any more —
    // which is what left the background out on some loads and not others.
    const io = new IntersectionObserver(entries => {
      if (!entries.some(e => e.isIntersecting)) return;
      io.disconnect();
      start();
    }, { rootMargin: '900px 0px' });

    io.observe(section);

    // And a backstop, so the background never depends on that callback
    // landing at all. The module pauses its own loop whenever the section
    // is off screen, and Three.js is already being fetched for the hero,
    // so starting early costs nothing either way.
    const kick = () => { io.disconnect(); start(); };
    if (window.requestIdleCallback) {
      window.requestIdleCallback(kick, { timeout: 3000 });
    } else {
      setTimeout(kick, 2200);
    }
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
      // Two pixels in hand. Fitting the text to exactly the width available
      // leaves nothing for rounding or for a font whose metrics settle a
      // hair wider than they measured, and the box clips what it cannot
      // hold — which is how the last letter of "Intern" went missing.
      const avail = availableWidth() - 2;
      if (avail > swap.clientWidth) swap.style.width = avail + 'px';

      const natural = bTitle.scrollWidth;
      if (natural > avail && natural > 0) {
        bTitle.style.fontSize = Math.floor(base * (avail / natural) * 100) / 100 + 'px';
      }

      // Measure again and shave if it still does not fit: one pass is a
      // prediction, and a proportional guess at a new font size is not
      // exact. This one checks.
      for (let i = 0; i < 3 && bTitle.scrollWidth > avail; i++) {
        const now = parseFloat(getComputedStyle(bTitle).fontSize);
        bTitle.style.fontSize = (Math.floor(now * 100) / 100 - 1) + 'px';
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
    // The fitting is measured in whatever font is on screen at the time. If
    // that was the fallback, every measurement is wrong the moment the real
    // one arrives.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    let rt = 0;
    const requeue = () => { clearTimeout(rt); rt = setTimeout(measure, 160); };
    window.addEventListener('resize', requeue);
    window.addEventListener('orientationchange', requeue);

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

  // The phone carousel's swing, from Skiper UI "skiper50" (Carousel_004 by
  // @gurvinder-singh02), which drives Swiper's creative effect with
  // prev/next translate ["±5%", 0, -200] and rotate ±100deg about the
  // inner edge. Applied here straight to the scroll position instead, so
  // the cards answer the finger rather than a library's own drag handling.
  const SWIPE_ROTATE = 100;   // degrees at a full card's distance
  const SWIPE_DEPTH = 200;    // px pushed back at that distance
  const SWIPE_SHIFT = 5;      // % of the card's own width

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
      cards.forEach((c, n) => {
        const open = n === i;
        c.classList.toggle('is-expanded', open);
        c.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      // Equal rows are right for a grid of compact cards, but an opened card
      // must be free to grow without dragging every other row with it.
      grid.classList.toggle('has-expanded', i >= 0);
      applyHeight();
      paint();
      if (swiping) { settle(); paintSwipe(); }
      scrollActiveIntoView(true);

      // The measured height is taken in grid flow, which can be a line of
      // text out from what the card ends up wrapping to in the row. Once the
      // card has settled, take its real height and correct the row.
      clearTimeout(fitTimer);
      if (i >= 0) fitTimer = setTimeout(() => refit(i), 380);

      // An opened card is several hundred pixels taller than a closed one.
      // Measured once the row has finished growing, not during.
      refreshScroll(560);
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

    // Where the row has to sit for card i to be in the middle of the view.
    // Derived from the layout, never measured: a card's own box has been
    // turned by the swing, so its rect is not where it started.
    function centreTarget(i) {
      const m = swipeMetrics;
      if (!m) return 0;
      const max = grid.scrollWidth - grid.clientWidth;
      const want = m.pad + i * m.step + m.cardW / 2 - grid.clientWidth / 2;
      return Math.max(0, Math.min(max, want));
    }

    // The strip widens a card in place, so nothing has to scroll. The
    // carousel does: an opened card is brought to the middle of the view.
    function scrollActiveIntoView(smooth) {
      if (!swiping) return;
      grid.scrollTo({
        left: centreTarget(expanded >= 0 ? expanded : active),
        behavior: smooth && !reduceMotion ? 'smooth' : 'auto'
      });
    }

    function teardown() {
      grid.classList.remove('is-strip', 'is-swipe');
      ['--strip-h', '--strip-h-full', '--strip-h-box', '--strip-card-w',
       '--strip-slice', '--strip-media-h', '--swipe-pad']
        .forEach(p => grid.style.removeProperty(p));
      grid.classList.remove('is-settling');
      cards.forEach(c => {
        c.classList.remove('is-active');
        c.style.transform = '';
        c.style.transformOrigin = '';
        c.style.zIndex = '';
      });
      grid.scrollLeft = 0;
      stripped = false;
      swiping = false;
      swipeMetrics = null;
      hideHints();
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
      grid.style.setProperty('--strip-slice',
        Math.min(STRIP_SLICE_MAX, slice) + 'px');
      grid.style.setProperty('--strip-h', Math.ceil(heights.compact) + 'px');
      // The shot's own 16/9 height at the widened width. A collapsed card
      // hands the whole card over to the shot instead, so no slice is left
      // as a bare panel.
      grid.style.setProperty('--strip-media-h',
        Math.round((cardW - 2) * 9 / 16) + 'px');

      grid.classList.add('is-strip');
      stripped = true;
      applyHeight();
      paint();
      showHints('strip');
      refreshScroll();   // the section just lost most of its height
    }

    // Phone carousel: every card at full size in one draggable row, snapping
    // card to card, so going back to an earlier card is the same gesture as
    // going forward. Nothing collapses, so nothing has to be recovered.
    let swipeMetrics = null;

    function buildSwipe(avail) {
      const cardW = Math.max(200, Math.min(340, avail - 28));

      heights = measureHeights(cardW, cardW);
      if (!heights.compact) return;

      const pad = Math.max(0, Math.round((avail - cardW) / 2));

      grid.style.setProperty('--strip-card-w', cardW + 'px');
      grid.style.setProperty('--strip-h', Math.ceil(heights.compact) + 'px');
      // Side padding of half the slack, so the first and last card can sit
      // in the middle of the view like every other one.
      grid.style.setProperty('--swipe-pad', pad + 'px');

      grid.classList.add('is-swipe');
      swiping = true;
      swipeMetrics = { cardW: cardW, pad: pad, step: cardW + SWIPE_GAP };
      applyHeight();
      paint();
      paintSwipe();
      showHints('swipe');
      refreshScroll();   // the section just lost most of its height
    }

    /* ---- the hints under the row ---------------------------------------
       Neither arrangement says what it wants done to it, so the gestures
       are spelled out: both of them on a phone, where a card has to be
       dragged to as well as opened, and the one that applies anywhere
       else. Each hint also does what it says when pressed, so no label
       points at something you cannot simply press instead. */
    let hints = null;
    let hintOpen = null;
    let hintNext = null;

    function buildHints() {
      hints = el('div', { class: 'proj-hints' });

      hintOpen = el('button', { type: 'button', class: 'proj-hint' },
        '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">' +
        '<circle cx="8" cy="8" r="2.4"/><path d="M3.6 3.6a6.2 6.2 0 0 0 0 8.8M12.4 3.6a6.2 6.2 0 0 1 0 8.8"/>' +
        '</svg><span></span>');

      hintNext = el('button', { type: 'button', class: 'proj-hint' },
        '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">' +
        '<path d="M1.6 8h12.8M4.6 4.8 1.4 8l3.2 3.2M11.4 4.8 14.6 8l-3.2 3.2"/>' +
        '</svg><span>Swipe for more projects</span>');

      hintOpen.addEventListener('click', (e) => {
        e.stopPropagation();
        setExpanded(expanded >= 0 ? -1 : active);
      });

      hintNext.addEventListener('click', (e) => {
        e.stopPropagation();
        if (expanded >= 0) setExpanded(-1);
        active = (active + 1) % cards.length;
        paint();
        scrollActiveIntoView(true);
      });

      hints.appendChild(hintOpen);
      hints.appendChild(hintNext);
      grid.parentNode.insertBefore(hints, grid.nextSibling);
    }

    // A phone is tapped and a laptop is clicked, and the row only has to be
    // swiped where the cards do not all fit at once.
    function showHints(mode) {
      if (!hints) buildHints();
      hints.hidden = false;
      hintOpen.querySelector('span').textContent =
        mode === 'swipe' ? 'Tap a card for details' : 'Click a card for details';
      hintNext.hidden = mode !== 'swipe';
    }

    function hideHints() {
      if (hints) hints.hidden = true;
    }

    // Each card's swing is read from where it sits relative to the middle of
    // the view: 0 at the centre, a full turn one card's distance away. The
    // geometry is computed from the layout rather than measured, since a
    // card's own box has already been rotated by the previous frame.
    function paintSwipe() {
      if (!swiping || !swipeMetrics) return;
      const m = swipeMetrics;
      const mid = grid.scrollLeft + grid.clientWidth / 2;
      const flat = expanded >= 0;

      cards.forEach((card, i) => {
        if (flat) {
          card.style.transform = '';
          card.style.transformOrigin = '';
          card.style.zIndex = '';
          return;
        }
        const centre = m.pad + i * m.step + m.cardW / 2;
        // Clamped at one card's distance, so everything further out holds
        // the same turn and stacks behind, as the reference's does.
        const p = clamp1((centre - mid) / m.step);
        const t = Math.abs(p);
        const dir = p < 0 ? 1 : -1;   // the card turns away from the centre

        card.style.transformOrigin = p < 0 ? 'left center' : 'right center';
        card.style.transform =
          'translate3d(' + (-dir * SWIPE_SHIFT * t).toFixed(2) + '%, 0, ' +
          (-SWIPE_DEPTH * t).toFixed(1) + 'px) rotateY(' +
          (dir * SWIPE_ROTATE * t).toFixed(2) + 'deg)';
        card.style.zIndex = String(Math.round(100 - t * 50));
      });
    }

    function clamp1(v) { return v < -1 ? -1 : v > 1 ? 1 : v; }

    let swipeRaf = 0;
    grid.addEventListener('scroll', () => {
      if (!swiping) return;
      if (!swipeRaf) {
        swipeRaf = requestAnimationFrame(() => { swipeRaf = 0; paintSwipe(); });
      }
      snapSoon();
    }, { passive: true });

    // Snapping is done here rather than with CSS scroll-snap. Snap points
    // are taken from a card's rendered box, and the swing has already
    // turned that box away, so CSS would snap to the wrong places. This
    // waits for the drag and its momentum to finish, then eases the nearest
    // card to the middle.
    let snapTimer = 0;
    let holding = false;

    function nearestIndex() {
      const m = swipeMetrics;
      if (!m) return 0;
      const mid = grid.scrollLeft + grid.clientWidth / 2;
      return Math.max(0, Math.min(cards.length - 1,
        Math.round((mid - m.pad - m.cardW / 2) / m.step)));
    }

    function snapSoon() {
      clearTimeout(snapTimer);
      snapTimer = setTimeout(() => {
        if (!swiping || holding || expanded >= 0) return;
        const i = nearestIndex();
        active = i;
        const target = centreTarget(i);
        if (Math.abs(grid.scrollLeft - target) < 1.5) return;
        grid.scrollTo({
          left: target,
          behavior: reduceMotion ? 'auto' : 'smooth'
        });
      }, 140);
    }

    // A finger still on the glass is still dragging, momentum or not.
    grid.addEventListener('pointerdown', () => { holding = true; }, true);
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => {
      grid.addEventListener(ev, () => { holding = false; snapSoon(); }, true);
    });

    // Opening or closing a card flattens or restores the swing, and that one
    // change should ease rather than jump. Dragging must not, so the
    // transition is only in place while it settles.
    let settleTimer = 0;
    function settle() {
      grid.classList.add('is-settling');
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => grid.classList.remove('is-settling'), 400);
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
      // 46px slice. The card itself carries the tabindex: nothing inside a
      // closed one is focusable, since the GitHub link is display:none until
      // the card opens.
      card.addEventListener('focusin', () => setActive(i));

      // Enter and Space open and close it, the way the click does. Only when
      // the card itself holds focus — the link inside keeps its own keys.
      card.addEventListener('keydown', (e) => {
        if (e.target !== card) return;
        if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
        e.preventDefault();   // Space would otherwise page down
        setExpanded(expanded === i ? -1 : i);
      });

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
     EXPERIENCE — aurora bars

     Animation reference: Unlumen UI "aurora-bars", rebuilt in vanilla
     because this site carries no React and no Motion. The shape of it is
     the component's own: an arch envelope across the row, two sine waves
     per bar, the same ratios, speed and vignette.

     Two deliberate departures. The bars are scaled rather than resized,
     since twenty-four height writes a frame is twenty-four layouts a
     frame and a vertical scale paints the gradient identically. And the
     palette is this page's violet rather than the component's pink, with
     no opaque backdrop behind it, so the section keeps its own colour.
     ===================================================================== */
  const AURORA = {
    maxHeightRatio: 0.92,
    minHeightRatio: 0.18,
    speed: 0.5
  };

  function auroraHeight(i, total, t) {
    // Arch envelope: tallest in the centre, shorter at the edges.
    const arch = Math.sin((i / (total - 1)) * Math.PI);
    const phase1 = (i / total) * Math.PI * 2;
    const phase2 = (i / total) * Math.PI * 5.3;
    const wave = 0.5 +
      0.25 * Math.sin(t * 1.1 + phase1) +
      0.25 * Math.sin(t * 0.7 + phase2);
    const blended = arch * 0.65 + wave * 0.35;
    return AURORA.minHeightRatio +
      blended * (AURORA.maxHeightRatio - AURORA.minHeightRatio);
  }

  function setupExperienceAurora() {
    const section = document.getElementById('experience');
    if (!section) return;

    // Fewer bars on a narrow screen: two dozen inside a phone's width are
    // hairlines, and the blur would smear them into one band.
    const count = window.innerWidth < 700 ? 14 : 24;

    const layer = el('div', { class: 'aurora', 'aria-hidden': 'true' });
    const bars = [];
    for (let i = 0; i < count; i++) {
      const bar = el('span', { class: 'aurora-bar' });
      bar.style.transform = 'scaleY(' + auroraHeight(i, count, 0).toFixed(4) + ')';
      layer.appendChild(bar);
      bars.push(bar);
    }
    layer.appendChild(el('span', { class: 'aurora-veil' }));
    section.insertBefore(layer, section.firstChild);

    // Reduced motion keeps the arrangement and drops the movement.
    if (reduceMotion) return;

    let raf = 0;
    let t = 0;
    let last = performance.now();
    let visible = false;

    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      t += dt * AURORA.speed;
      for (let i = 0; i < count; i++) {
        bars[i].style.transform =
          'scaleY(' + auroraHeight(i, count, t).toFixed(4) + ')';
      }
    }

    function run(on) {
      if (on && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
      else if (!on && raf) { cancelAnimationFrame(raf); raf = 0; }
    }

    // Nothing is drawn while the section is off screen or the tab is in the
    // background: it is a backdrop, and it should cost nothing to scroll past.
    const io = new IntersectionObserver(entries => {
      visible = entries.some(e => e.isIntersecting);
      run(visible && !document.hidden);
    }, { rootMargin: '120px 0px' });
    io.observe(section);

    document.addEventListener('visibilitychange', () => {
      run(visible && !document.hidden);
    });
  }

  /* =====================================================================
     EXPERIENCE → PROJECTS HANDOFF

     Two sections with backdrops of their own used to meet on a flat dark
     band: the aurora stopped, nothing happened, the fluid field started.
     This carries the light across the boundary instead.

     One scrubbed crossing, from the moment the boundary appears at the
     foot of the screen to the moment it leaves the top. A pool of violet
     centred on the seam swells and dissolves while the aurora above it
     sinks and dims, so the colour drains downward out of Experience and
     into Projects rather than being cut off by the section edge.

     Scrub means it is the same effect in reverse on the way back up: the
     glow blooms again and the aurora rises and brightens as Experience
     returns. Nothing here is a one-shot, so scrolling up is not a
     different path — it is the same one, run backwards.
     ===================================================================== */
  const SEAM = {
    peak: 0.45,   // where in the crossing the glow is at full strength
    lift: 90,     // px the pool drifts up across the crossing (parallax)
    grow: 0.4,    // how much it spreads between rest and full
    auroraSink: 44,
    auroraDim: 0.7
  };

  function setupSectionSeam() {
    const projects = document.getElementById('projects');
    const experience = document.getElementById('experience');
    if (!projects || !experience || !projects.parentNode) return;

    const seam = el('div', { class: 'seam', 'aria-hidden': 'true' });
    seam.appendChild(el('span', { class: 'seam-glow' }));
    projects.parentNode.insertBefore(seam, projects);

    const aurora = experience.querySelector('.aurora');

    // Reduced motion keeps the light and drops the movement: a steady pool
    // at the boundary, which is still a softer join than a hard edge.
    if (reduceMotion || !window.gsap || !window.ScrollTrigger) {
      seam.style.setProperty('--seam-opacity', '0.5');
      seam.style.setProperty('--seam-scale', '1');
      return;
    }

    function paint(p) {
      // Rise and fall across the crossing, peaking just before the middle
      // so the pool fades out slowly on the Projects side and some violet
      // is still in the air under the heading.
      const raw = p < SEAM.peak
        ? p / SEAM.peak
        : 1 - (p - SEAM.peak) / (1 - SEAM.peak);
      const b = Math.min(1, Math.max(0, raw));
      const s = b * b * (3 - 2 * b);   // smoothstep, so there are no corners

      seam.style.setProperty('--seam-opacity', s.toFixed(3));
      seam.style.setProperty('--seam-scale', (1 - SEAM.grow + s * SEAM.grow).toFixed(3));
      // Drifting up slower than the page reads as depth rather than as a
      // second thing scrolling.
      seam.style.setProperty('--seam-y', (-p * SEAM.lift).toFixed(1) + 'px');

      if (aurora) {
        aurora.style.opacity = (1 - p * SEAM.auroraDim).toFixed(3);
        aurora.style.transform =
          'translate3d(0,' + (p * SEAM.auroraSink).toFixed(1) + 'px,0)';
      }
    }

    const st = window.ScrollTrigger.create({
      trigger: seam,
      start: 'top bottom',
      end: 'top top',
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: self => paint(self.progress)
    });

    // A reload partway down the page starts mid-crossing, and onUpdate only
    // fires once something scrolls.
    paint(st.progress);
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
      s.onerror = () => reject(new Error('Could not reach the pdf.js CDN. Check your connection.'));
      document.head.appendChild(s);
    });
    return pdfLibPromise;
  }

  function buildModal(title, credential, openHref, openLabel) {
    modalRoot.innerHTML = '';
    const backdrop = el('div', { class: 'modal-backdrop' });
    const panel = el('div', { class: 'modal-panel', role: 'dialog', 'aria-modal': 'true', 'aria-label': title });

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
    host.appendChild(el('img', { src: src, alt: title + ' certificate' }));
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
    setupExperienceAurora();
    // After the aurora: the handoff dims and sinks that layer, so it has to
    // exist by the time this looks for it.
    setupSectionSeam();
    setupCursorTrail();
    initHero3D();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
