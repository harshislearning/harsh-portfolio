/**
 * PREDICTIVE ARC BACKGROUND
 *
 * A field of square dots on a fixed grid. Dots grow and brighten as they
 * approach a parabolic curve, a slow diagonal shimmer crosses the lit band,
 * and the curve bends toward the pointer.
 *
 * Reference: Originkit "Predictive Arc". That component is React and ships
 * from a registry behind an API key, so this is the technique rebuilt from
 * its documented behaviour rather than a port of its source. What is kept
 * is the component's own shape: one fragment shader evaluating the whole
 * field per cell, a single intensity driving both a dot's square side and
 * its colour so the band gets soft shoulders with no blur pass, crossing
 * sine and cosine waves multiplied into that intensity, a Gaussian around
 * the cursor's x pulling the curve toward the cursor's y, eased in and out
 * so it never snaps on enter or leave, the wave phase measured in CSS
 * pixels with devicePixelRatio capped at 2, and the grid pitch taken from
 * the short edge. Its defaults are kept too: density 78, dot size 137%,
 * speed 100, pointer stretch 236 and travel 34.
 *
 * Two departures. The palette is this page's violet rather than the
 * component's red, and nothing opaque is painted behind the field — the
 * canvas stays transparent so the section keeps its own background.
 */

const VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAG = `
  precision highp float;

  uniform vec2  uSize;      // container, CSS px
  uniform float uDpr;
  uniform float uTime;
  uniform float uPitch;     // grid spacing, CSS px
  uniform float uDotScale;  // dot side as a multiple of the pitch
  uniform vec4  uArch;      // x: vertex x 0..1, y: vertex y 0..1, z: rise, w: band px
  uniform float uTails;     // how fast the band fades toward the edges
  uniform vec3  uPointer;   // x, y in CSS px (origin bottom-left), z: eased 0..1
  uniform vec2  uPointerFalloff;  // stretch px, travel px
  uniform vec3  uBase;
  uniform vec3  uAccent;
  uniform vec3  uHighlight;
  uniform float uOpacity;

  void main() {
    // Everything is measured in CSS pixels, so the grid and the shimmer are
    // the same size on a retina screen as on a plain one.
    vec2 cssPx  = gl_FragCoord.xy / uDpr;
    vec2 cell   = floor(cssPx / uPitch);
    vec2 centre = (cell + 0.5) * uPitch;
    vec2 local  = cssPx - centre;

    // The curve: a parabola with its low point at uArch.xy, rising by
    // uArch.z of the height by the time it reaches the left and right edges.
    float nx = (centre.x - uArch.x * uSize.x) / uSize.x;
    float curveY = uArch.y * uSize.y + uArch.z * nx * nx * uSize.y;

    // The pointer pulls the curve toward itself, hardest directly under the
    // cursor and falling away over uPointerFalloff.x. The pull is capped at
    // uPointerFalloff.y so the curve leans rather than chases, and uPointer.z
    // eases the whole thing in and out.
    float d    = (centre.x - uPointer.x) / uPointerFalloff.x;
    float near = exp(-d * d);
    float pull = clamp(uPointer.y - curveY, -uPointerFalloff.y, uPointerFalloff.y);
    curveY += pull * near * uPointer.z;

    // Distance from the curve, as a Gaussian across the band's thickness.
    float dy   = (centre.y - curveY) / uArch.w;
    float band = exp(-dy * dy);
    band *= exp(-uTails * nx * nx * 4.0);

    // Crossing waves multiplied together, which sends the shimmer through
    // the band diagonally rather than straight along it.
    float ph   = (centre.x * 0.55 + centre.y * 0.38) / uPitch;
    float s    = sin(ph * 0.42 - uTime * 1.10);
    float c    = cos(ph * 0.27 + uTime * 0.70);
    float shim = 0.5 + 0.5 * s * c;

    float intensity = band * mix(0.42, 1.0, shim);
    if (intensity < 0.004) discard;

    // One intensity, two jobs: the square's side and its colour. That is
    // what gives the band soft shoulders without a blur pass.
    // "halfSide", not "half": half is a reserved word in GLSL ES.
    float halfSide = intensity * uPitch * 0.5 * uDotScale;
    float aa = 0.5 / uDpr;
    float inside = 1.0 - smoothstep(halfSide - aa, halfSide + aa, max(abs(local.x), abs(local.y)));
    if (inside <= 0.0) discard;

    vec3 col = mix(uBase, uAccent, smoothstep(0.0, 0.55, intensity));
    col = mix(col, uHighlight, smoothstep(0.62, 1.0, intensity));

    gl_FragColor = vec4(col, inside * mix(0.5, 1.0, intensity) * uOpacity);
  }
`;

export async function createArcBackground(container, options) {
  const opts = Object.assign({
    // The component's red swapped for this page's violet.
    baseColor: '#3B2A7A',
    accentColor: '#8B5CF6',
    highlight: '#D9CCFF',
    density: 78,      // cells across the short edge
    dotSize: 137,     // dot side, % of the pitch
    speed: 100,       // shimmer travel; 0 freezes it
    arch: { x: 0.5, y: 0.34, rise: 1.15, band: 0.085, tails: 1.4 },
    pointer: { enabled: true, stretch: 236, travel: 34 },
    opacity: 0.85
  }, options || {});

  const THREE = await import('https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js');

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);

  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  // Faded in on the first frame it draws, so a backdrop that arrives a beat
  // after the section reads as part of the design rather than as a pop-in.
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;' +
    'display:block;pointer-events:none;opacity:0;transition:opacity 700ms ease';
  container.insertBefore(canvas, container.firstChild);

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const scene = new THREE.Scene();

  const material = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: {
      uSize: { value: new THREE.Vector2(1, 1) },
      uDpr: { value: 1 },
      uTime: { value: 0 },
      uPitch: { value: 10 },
      uDotScale: { value: opts.dotSize / 100 },
      uArch: { value: new THREE.Vector4(opts.arch.x, opts.arch.y, opts.arch.rise, 20) },
      uTails: { value: opts.arch.tails },
      uPointer: { value: new THREE.Vector3(0, 0, 0) },
      uPointerFalloff: { value: new THREE.Vector2(opts.pointer.stretch, opts.pointer.travel) },
      uBase: { value: new THREE.Color(opts.baseColor) },
      uAccent: { value: new THREE.Color(opts.accentColor) },
      uHighlight: { value: new THREE.Color(opts.highlight) },
      uOpacity: { value: opts.opacity }
    },
    depthTest: false,
    depthWrite: false,
    transparent: true
  });

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(quad);

  /* ---- sizing -------------------------------------------------------- */
  let cssW = 0, cssH = 0;

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    // No box yet. The observers below call back the moment there is one, so
    // this is a wait rather than a dead end.
    if (!w || !h) return;

    // Capped at 2: past that the grid costs four times the fragments for a
    // dot nobody can see the edge of.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);

    cssW = w; cssH = h;
    const short = Math.min(w, h);
    // Pitch from the short edge, so the grid keeps its spacing whichever way
    // the section is shaped.
    const pitch = Math.max(6, short / opts.density);

    material.uniforms.uSize.value.set(w, h);
    material.uniforms.uDpr.value = dpr;
    material.uniforms.uPitch.value = pitch;
    material.uniforms.uArch.value.w = Math.max(8, short * opts.arch.band);
  }

  resize();

  /* ---- pointer ------------------------------------------------------- */
  // Held in CSS px with the origin at the bottom left, to match gl_FragCoord.
  const pointer = { x: 0, y: 0, want: 0, ease: 0 };

  function onMove(clientX, clientY) {
    if (!opts.pointer.enabled) return;
    const r = container.getBoundingClientRect();
    if (!r.width || !r.height) return;
    pointer.x = clientX - r.left;
    pointer.y = r.height - (clientY - r.top);
    // Inside the section, or close enough that leaving eases out instead of
    // dropping the bend on the boundary.
    const inside = pointer.x > -80 && pointer.x < r.width + 80 &&
                   pointer.y > -80 && pointer.y < r.height + 80;
    pointer.want = inside ? 1 : 0;
  }

  const onMouse = e => onMove(e.clientX, e.clientY);
  const onTouch = e => {
    if (e.touches && e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  window.addEventListener('mousemove', onMouse, { passive: true });
  window.addEventListener('touchmove', onTouch, { passive: true });
  window.addEventListener('touchstart', onTouch, { passive: true });

  /* ---- loop ---------------------------------------------------------- */
  let raf = 0;
  let visible = false;
  let lost = false;
  let hidden = document.hidden;
  let prev = performance.now();
  let elapsed = 0;

  // entries.some, not entries[0]: one callback can carry several records for
  // the same target, and the first can be a stale one.
  const io = new IntersectionObserver(entries => {
    visible = entries.some(e => e.isIntersecting);
  }, { threshold: 0 });
  io.observe(container);

  const onVisibility = () => { hidden = document.hidden; };
  document.addEventListener('visibilitychange', onVisibility);

  const rate = opts.speed / 100;

  function frame() {
    raf = requestAnimationFrame(frame);
    const now = performance.now();
    const dt = Math.min((now - prev) / 1000, 1 / 30);
    prev = now;
    if (!visible || hidden || lost || !cssW) return;

    elapsed += dt * rate;
    pointer.ease += (pointer.want - pointer.ease) * Math.min(1, dt * 4.5);

    material.uniforms.uTime.value = elapsed;
    material.uniforms.uPointer.value.set(pointer.x, pointer.y, pointer.ease);

    renderer.render(scene, camera);

    if (canvas.style.opacity !== '1') canvas.style.opacity = '1';
  }

  frame();

  const onResize = () => resize();
  window.addEventListener('resize', onResize);

  // The section is not a fixed height — the contact cards and the portrait
  // reflow — so the drawing buffer follows the container rather than the
  // window.
  let ro = null;
  if (window.ResizeObserver) {
    ro = new ResizeObserver(() => resize());
    ro.observe(container);
  }

  // A lost context invalidates the buffer. Hold the loop until the browser
  // hands it back, then re-size into the new one.
  const onLost = (e) => { e.preventDefault(); lost = true; };
  const onRestored = () => { lost = false; cssW = 0; resize(); };
  canvas.addEventListener('webglcontextlost', onLost);
  canvas.addEventListener('webglcontextrestored', onRestored);

  return {
    canvas: canvas,
    destroy() {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      if (ro) ro.disconnect();
      material.dispose();
      quad.geometry.dispose();
      renderer.dispose();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }
  };
}
