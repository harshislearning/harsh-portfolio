/**
 * PIXEL LIQUID BACKGROUND
 *
 * A real-time Navier-Stokes fluid solver running on the GPU, rendered as a
 * pixelated, dithered background. Velocity magnitude is mapped through a
 * colour ramp; the output pass adds block pixelation, a 4x4 Bayer dither to
 * kill banding, and film grain.
 *
 * Adapted from the PixelLiquidBg component spec (unlumen-ui, by Leo), which
 * is React + its own Three.js context. This project is vanilla with no build
 * step, so the simulation is reimplemented here against the Three.js module
 * the hero already loads. Inspired in turn by React Bits' Liquid Ether.
 *
 * Passes per frame: advect -> splat -> divergence -> pressure (Jacobi) ->
 * gradient subtract -> output.
 */

const VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const ADVECT = `
  precision highp float;
  uniform sampler2D uVelocity;
  uniform vec2 uTexel;
  uniform float uDt;
  uniform float uDissipation;
  varying vec2 vUv;
  void main() {
    vec2 coord = vUv - uDt * texture2D(uVelocity, vUv).xy * uTexel;
    gl_FragColor = vec4(texture2D(uVelocity, coord).xy * uDissipation, 0.0, 1.0);
  }
`;

const SPLAT = `
  precision highp float;
  uniform sampler2D uTarget;
  uniform vec2 uPoint;
  uniform vec2 uForce;
  uniform float uRadius;
  uniform float uAspect;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv - uPoint;
    p.x *= uAspect;
    float fall = exp(-dot(p, p) / uRadius);
    vec2 base = texture2D(uTarget, vUv).xy;
    gl_FragColor = vec4(base + uForce * fall, 0.0, 1.0);
  }
`;

const DIVERGENCE = `
  precision highp float;
  uniform sampler2D uVelocity;
  uniform vec2 uTexel;
  varying vec2 vUv;
  void main() {
    float l = texture2D(uVelocity, vUv - vec2(uTexel.x, 0.0)).x;
    float r = texture2D(uVelocity, vUv + vec2(uTexel.x, 0.0)).x;
    float b = texture2D(uVelocity, vUv - vec2(0.0, uTexel.y)).y;
    float t = texture2D(uVelocity, vUv + vec2(0.0, uTexel.y)).y;
    gl_FragColor = vec4(0.5 * (r - l + t - b), 0.0, 0.0, 1.0);
  }
`;

const PRESSURE = `
  precision highp float;
  uniform sampler2D uPressure;
  uniform sampler2D uDivergence;
  uniform vec2 uTexel;
  varying vec2 vUv;
  void main() {
    float l = texture2D(uPressure, vUv - vec2(uTexel.x, 0.0)).x;
    float r = texture2D(uPressure, vUv + vec2(uTexel.x, 0.0)).x;
    float b = texture2D(uPressure, vUv - vec2(0.0, uTexel.y)).x;
    float t = texture2D(uPressure, vUv + vec2(0.0, uTexel.y)).x;
    float d = texture2D(uDivergence, vUv).x;
    gl_FragColor = vec4((l + r + b + t - d) * 0.25, 0.0, 0.0, 1.0);
  }
`;

const GRADIENT = `
  precision highp float;
  uniform sampler2D uPressure;
  uniform sampler2D uVelocity;
  uniform vec2 uTexel;
  varying vec2 vUv;
  void main() {
    float l = texture2D(uPressure, vUv - vec2(uTexel.x, 0.0)).x;
    float r = texture2D(uPressure, vUv + vec2(uTexel.x, 0.0)).x;
    float b = texture2D(uPressure, vUv - vec2(0.0, uTexel.y)).x;
    float t = texture2D(uPressure, vUv + vec2(0.0, uTexel.y)).x;
    vec2 v = texture2D(uVelocity, vUv).xy - vec2(r - l, t - b) * 0.5;
    gl_FragColor = vec4(v, 0.0, 1.0);
  }
`;

const OUTPUT = `
  precision highp float;
  uniform sampler2D uVelocity;
  uniform sampler2D uPalette;
  uniform vec2 uResolution;
  uniform float uPixelSize;
  uniform float uIntensity;
  uniform float uDither;
  uniform float uGrain;
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;

  // Compact 4x4 Bayer: the 2x2 pattern nested inside itself.
  float bayer2(vec2 a) {
    a = floor(a);
    return fract(a.x / 2.0 + a.y * a.y * 0.75);
  }
  float bayer4(vec2 a) {
    return bayer2(0.5 * a) * 0.25 + bayer2(a);
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    // Snap to blocks before sampling, so the fluid itself is pixelated
    // rather than a sharp image being blurred down.
    vec2 block = vec2(uPixelSize) / uResolution;
    vec2 uv = (floor(vUv / block) + 0.5) * block;

    float mag = length(texture2D(uVelocity, uv).xy);
    float t = clamp(mag * uIntensity, 0.0, 1.0);

    vec4 col = texture2D(uPalette, vec2(t, 0.5));

    vec2 cell = floor(gl_FragCoord.xy / uPixelSize);
    col.rgb += (bayer4(cell) - 0.5) * uDither;
    col.rgb += (hash(cell + floor(uTime * 12.0)) - 0.5) * uGrain;

    gl_FragColor = vec4(col.rgb, col.a * uOpacity);
  }
`;

export async function createFluidBackground(container, options) {
  const opts = Object.assign({
    palette: ['#08070C', '#16102B', '#4C2C9E', '#8B5CF6', '#C4B5FD'],
    pixelSize: 16,
    resolution: 0.35,
    mouseForce: 8,
    cursorSize: 110,
    autoDemo: true,
    pressureIterations: 18,
    dissipation: 0.975,
    intensity: 0.85,
    dither: 0.045,
    grain: 0.035,
    opacity: 1
  }, options || {});

  const THREE = await import('https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js');

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);

  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none';
  container.insertBefore(canvas, container.firstChild);

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null);
  const scene = new THREE.Scene();
  scene.add(quad);

  function pass(fragment, uniforms) {
    return new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: fragment,
      uniforms: uniforms,
      depthTest: false,
      depthWrite: false,
      transparent: true
    });
  }

  function target(w, h) {
    return new THREE.WebGLRenderTarget(w, h, {
      type: THREE.HalfFloatType,
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      depthBuffer: false,
      stencilBuffer: false
    });
  }

  /* ---- palette ramp -------------------------------------------------- */
  // Alpha ramps with the stops, so still fluid is fully transparent and the
  // section's own background shows through.
  function buildPalette(stops) {
    const n = 128;
    const data = new Uint8Array(n * 4);
    const cols = stops.map(s => new THREE.Color(s));
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const f = t * (cols.length - 1);
      const i0 = Math.min(cols.length - 1, Math.floor(f));
      const i1 = Math.min(cols.length - 1, i0 + 1);
      const k = f - i0;
      const c = cols[i0].clone().lerp(cols[i1], k);
      data[i * 4] = Math.round(c.r * 255);
      data[i * 4 + 1] = Math.round(c.g * 255);
      data[i * 4 + 2] = Math.round(c.b * 255);
      data[i * 4 + 3] = Math.round(Math.min(1, t * 1.35) * 255);
    }
    const tex = new THREE.DataTexture(data, n, 1, THREE.RGBAFormat);
    tex.minFilter = tex.magFilter = THREE.LinearFilter;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;
    return tex;
  }

  const paletteTex = buildPalette(opts.palette);

  /* ---- buffers ------------------------------------------------------- */
  let simW = 1, simH = 1, aspect = 1;
  let velA, velB, divTex, prsA, prsB;

  const uTexel = new THREE.Vector2();

  const mAdvect = pass(ADVECT, {
    uVelocity: { value: null }, uTexel: { value: uTexel },
    uDt: { value: 0 }, uDissipation: { value: opts.dissipation }
  });
  const mSplat = pass(SPLAT, {
    uTarget: { value: null }, uPoint: { value: new THREE.Vector2() },
    uForce: { value: new THREE.Vector2() }, uRadius: { value: 0.0002 },
    uAspect: { value: 1 }
  });
  const mDiv = pass(DIVERGENCE, { uVelocity: { value: null }, uTexel: { value: uTexel } });
  const mPrs = pass(PRESSURE, {
    uPressure: { value: null }, uDivergence: { value: null }, uTexel: { value: uTexel }
  });
  const mGrad = pass(GRADIENT, {
    uPressure: { value: null }, uVelocity: { value: null }, uTexel: { value: uTexel }
  });
  const mOut = pass(OUTPUT, {
    uVelocity: { value: null }, uPalette: { value: paletteTex },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uPixelSize: { value: opts.pixelSize }, uIntensity: { value: opts.intensity },
    uDither: { value: opts.dither }, uGrain: { value: opts.grain },
    uTime: { value: 0 }, uOpacity: { value: opts.opacity }
  });

  function blit(material, to) {
    quad.material = material;
    renderer.setRenderTarget(to || null);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
  }

  function disposeTargets() {
    [velA, velB, divTex, prsA, prsB].forEach(t => { if (t) t.dispose(); });
  }

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    mOut.uniforms.uResolution.value.set(w * dpr, h * dpr);

    const next = Math.max(32, Math.round(Math.min(w, h) * opts.resolution));
    const nw = Math.max(32, Math.round(next * (w / Math.min(w, h))));
    const nh = Math.max(32, Math.round(next * (h / Math.min(w, h))));
    if (nw === simW && nh === simH) return;

    simW = nw; simH = nh;
    aspect = simW / simH;
    uTexel.set(1 / simW, 1 / simH);
    mSplat.uniforms.uAspect.value = aspect;

    disposeTargets();
    velA = target(simW, simH); velB = target(simW, simH);
    divTex = target(simW, simH);
    prsA = target(simW, simH); prsB = target(simW, simH);
  }

  resize();

  /* ---- input --------------------------------------------------------- */
  const pointer = { x: 0.5, y: 0.5, dx: 0, dy: 0, active: false };
  let lastMove = -Infinity;

  function onMove(clientX, clientY) {
    const r = container.getBoundingClientRect();
    const nx = (clientX - r.left) / r.width;
    const ny = 1 - (clientY - r.top) / r.height;
    if (pointer.active) {
      pointer.dx = nx - pointer.x;
      pointer.dy = ny - pointer.y;
    }
    pointer.x = nx; pointer.y = ny;
    pointer.active = true;
    lastMove = performance.now();
  }

  const onMouse = e => onMove(e.clientX, e.clientY);
  const onTouch = e => {
    if (e.touches && e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  window.addEventListener('mousemove', onMouse, { passive: true });
  window.addEventListener('touchmove', onTouch, { passive: true });
  window.addEventListener('touchstart', onTouch, { passive: true });

  // Autonomous driver: picks a target, eases toward it, picks another. Takes
  // over when the cursor has been still for a beat so the panel is never
  // completely dead.
  const auto = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, next: 0 };
  function driveAuto(now) {
    if (now > auto.next) {
      auto.tx = 0.15 + Math.random() * 0.7;
      auto.ty = 0.15 + Math.random() * 0.7;
      auto.next = now + 1200 + Math.random() * 1600;
    }
    const px = auto.x, py = auto.y;
    auto.x += (auto.tx - auto.x) * 0.022;
    auto.y += (auto.ty - auto.y) * 0.022;
    return { x: auto.x, y: auto.y, dx: auto.x - px, dy: auto.y - py };
  }

  /* ---- loop ---------------------------------------------------------- */
  let raf = 0;
  let visible = false;
  let hidden = document.hidden;
  let prev = performance.now();
  let elapsed = 0;

  const io = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
  }, { threshold: 0 });
  io.observe(container);

  const onVisibility = () => { hidden = document.hidden; };
  document.addEventListener('visibilitychange', onVisibility);

  function splat(x, y, fx, fy) {
    mSplat.uniforms.uTarget.value = velA.texture;
    mSplat.uniforms.uPoint.value.set(x, y);
    mSplat.uniforms.uForce.value.set(fx, fy);
    mSplat.uniforms.uRadius.value = Math.pow(opts.cursorSize / 1000, 2) * 0.35;
    blit(mSplat, velB);
    const t = velA; velA = velB; velB = t;
  }

  function frame() {
    raf = requestAnimationFrame(frame);
    const now = performance.now();
    const dt = Math.min((now - prev) / 1000, 1 / 30);
    prev = now;
    if (!visible || hidden || !velA) return;
    elapsed += dt;

    // advect
    mAdvect.uniforms.uVelocity.value = velA.texture;
    mAdvect.uniforms.uDt.value = dt * 60;
    blit(mAdvect, velB);
    let s = velA; velA = velB; velB = s;

    // force
    const idle = now - lastMove > 1200;
    if (opts.autoDemo && idle) {
      const a = driveAuto(now);
      if (Math.abs(a.dx) + Math.abs(a.dy) > 1e-5) {
        splat(a.x, a.y, a.dx * opts.mouseForce * 90, a.dy * opts.mouseForce * 90);
      }
    } else if (Math.abs(pointer.dx) + Math.abs(pointer.dy) > 1e-5) {
      splat(pointer.x, pointer.y, pointer.dx * opts.mouseForce * 90, pointer.dy * opts.mouseForce * 90);
      pointer.dx *= 0.82; pointer.dy *= 0.82;
    }

    // divergence
    mDiv.uniforms.uVelocity.value = velA.texture;
    blit(mDiv, divTex);

    // pressure, Jacobi
    renderer.setRenderTarget(prsA);
    renderer.clear();
    renderer.setRenderTarget(null);
    for (let i = 0; i < opts.pressureIterations; i++) {
      mPrs.uniforms.uPressure.value = prsA.texture;
      mPrs.uniforms.uDivergence.value = divTex.texture;
      blit(mPrs, prsB);
      s = prsA; prsA = prsB; prsB = s;
    }

    // project
    mGrad.uniforms.uPressure.value = prsA.texture;
    mGrad.uniforms.uVelocity.value = velA.texture;
    blit(mGrad, velB);
    s = velA; velA = velB; velB = s;

    // output
    mOut.uniforms.uVelocity.value = velA.texture;
    mOut.uniforms.uTime.value = elapsed;
    blit(mOut, null);
  }

  frame();

  const onResize = () => resize();
  window.addEventListener('resize', onResize);

  return {
    canvas: canvas,
    setOpacity(v) { mOut.uniforms.uOpacity.value = v; },
    destroy() {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      disposeTargets();
      paletteTex.dispose();
      [mAdvect, mSplat, mDiv, mPrs, mGrad, mOut].forEach(m => m.dispose());
      quad.geometry.dispose();
      renderer.dispose();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }
  };
}
