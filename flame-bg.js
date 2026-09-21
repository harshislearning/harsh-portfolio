/**
 * FLAME FIELD BACKGROUND
 *
 * A bed of square dots along the foot of a section, drawn as flames: the
 * tongues rise and fall along the width, cells of heat travel upward
 * through them, and the flame leans toward the pointer.
 *
 * Reference: Originkit "Predictive Arc". That component is React and ships
 * from a registry behind an API key, so this is its technique rebuilt in
 * vanilla against the Three.js the page already loads rather than a port
 * of its source. What is kept is the way it draws: one fragment shader
 * evaluating the whole field per cell, a single intensity driving both a
 * dot's square side and its colour so the field gets soft shoulders with
 * no blur pass, crossing waves multiplied into that intensity, a Gaussian
 * around the cursor's x pulling the field toward the cursor's y and eased
 * in and out so it never snaps on enter or leave, phase measured in CSS
 * pixels with devicePixelRatio capped at 2, and the grid pitch taken from
 * the short edge.
 *
 * What is changed: the component's parabolic arc is replaced by a flame
 * field, and it is drawn at a much larger pitch. The palette is this
 * page's violet rather than the component's red, and nothing opaque is
 * painted behind the field, so the section keeps its own background.
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
  uniform float uHeight;    // how far up the section the tallest tongue reaches
  uniform float uFloor;     // fraction of a tongue that burns at full strength
  uniform vec3  uPointer;   // x, y in CSS px (origin bottom-left), z: eased 0..1
  uniform vec2  uPointerFalloff;  // stretch px, lift px
  uniform vec3  uBase;
  uniform vec3  uAccent;
  uniform vec3  uHighlight;
  uniform float uOpacity;

  void main() {
    // Measured in CSS pixels, so the grid and the flicker are the same size
    // on a retina screen as on a plain one.
    vec2 cssPx  = gl_FragCoord.xy / uDpr;
    vec2 cell   = floor(cssPx / uPitch);
    vec2 centre = (cell + 0.5) * uPitch;
    vec2 local  = cssPx - centre;

    float x = centre.x / uSize.x;

    // The tongues. Three waves at different rates, drifting in opposite
    // directions so the tips never settle into a repeating shape.
    float tongue = 0.50
      + 0.26 * sin(x *  5.7 + uTime * 0.75)
      + 0.16 * sin(x * 11.9 - uTime * 1.15)
      + 0.12 * sin(x * 21.3 + uTime * 1.65);

    float topPx = uHeight * uSize.y * tongue;

    // The pointer lifts the flame toward itself, hardest directly under the
    // cursor and falling away over uPointerFalloff.x. Capped at
    // uPointerFalloff.y so the flame leans rather than chases, and
    // uPointer.z eases the whole thing in and out.
    float d    = (centre.x - uPointer.x) / uPointerFalloff.x;
    float near = exp(-d * d);
    float lift = clamp(uPointer.y - topPx, -uPointerFalloff.y, uPointerFalloff.y);
    topPx += lift * near * uPointer.z;
    topPx = max(topPx, uPitch);

    // Solid at the floor, thinning out to nothing at the tip. The power
    // curve matters: a straight ramp keeps most of a tongue near full
    // strength, which fills the section with big dots instead of leaving
    // the dark between them that makes it read as fire.
    float body = 1.0 - smoothstep(topPx * uFloor, topPx, centre.y);
    body = pow(body, 1.15);
    if (body <= 0.0) discard;

    // Cells of heat travelling upward through the body. The inner sine
    // shears the bands along x so they climb in tongues rather than in one
    // flat sheet, and the swing is wide enough to put gaps between them.
    float rise  = sin(centre.y / uPitch * 1.25 - uTime * 2.40
                      + sin(x * 8.0 + uTime * 0.50) * 1.60);
    float flick = 0.26 + 0.74 * (0.5 + 0.5 * rise);

    // And a slow variation along the width, so the rows break into separate
    // tongues instead of burning as one flat bar across the section.
    float column = 0.52 + 0.48 * (0.5 + 0.5 *
      sin(x * 17.0 + uTime * 0.25 + sin(x * 6.3 - uTime * 0.45) * 2.20));

    float intensity = body * flick * column;
    if (intensity < 0.006) discard;

    // One intensity, two jobs: the square's side and its colour. That is
    // what gives the field soft shoulders without a blur pass.
    // "halfSide", not "half": half is a reserved word in GLSL ES.
    float halfSide = intensity * uPitch * 0.5 * uDotScale;
    float aa = 0.5 / uDpr;
    float inside = 1.0 - smoothstep(halfSide - aa, halfSide + aa, max(abs(local.x), abs(local.y)));
    if (inside <= 0.0) discard;

    // Hottest at the floor, cooling toward the tips.
    vec3 col = mix(uBase, uAccent, smoothstep(0.0, 0.55, intensity));
    col = mix(col, uHighlight, smoothstep(0.78, 1.0, intensity));

    gl_FragColor = vec4(col, inside * mix(0.45, 1.0, intensity) * uOpacity);
  }
`;

export async function createFlameBackground(container, options) {
  const opts = Object.assign({
    // The component's red swapped for this page's violet.
    baseColor: '#3A0CA3',
    accentColor: '#6A3BE8',
    highlight: '#FFFFFF',
    density: 26,      // cells across the short edge — the component's 78 is
                      // a fine mist at this size; this is the same field
                      // drawn big enough to read as flame.
    dotSize: 110,     // dot side, % of the pitch. Well under the component's
                      // 137, where the dots overlap their cells and the
                      // flame closes up into a sheet.
    speed: 100,       // flicker and travel rate; 0 freezes it
    height: 0.88,     // the tallest tongue, as a fraction of the section
    floorRatio: 0.05, // how much of a tongue burns at full strength
    pointer: { enabled: true, stretch: 236, lift: 150 },
    opacity: 0.8
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
      uHeight: { value: opts.height },
      uFloor: { value: opts.floorRatio },
      uPointer: { value: new THREE.Vector3(0, 0, 0) },
      uPointerFalloff: { value: new THREE.Vector2(opts.pointer.stretch, opts.pointer.lift) },
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
  let cssW = 0;

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

    cssW = w;
    // Pitch from the short edge, so the grid keeps its spacing whichever way
    // the section is shaped.
    const pitch = Math.max(9, Math.min(w, h) / opts.density);

    material.uniforms.uSize.value.set(w, h);
    material.uniforms.uDpr.value = dpr;
    material.uniforms.uPitch.value = pitch;
  }

  resize();

  /* ---- pointer ------------------------------------------------------- */
  // Held in CSS px with the origin at the bottom left, to match gl_FragCoord.
  // The pointer's screen position is what is stored; where that falls in the
  // section is worked out every frame. Worked out only on mousemove, a
  // cursor held still while the page scrolled kept the flame leaning at
  // where it used to be, and scrolling the section out from under it left
  // the lean on.
  const pointer = { x: 0, y: 0, want: 0, ease: 0, clientX: 0, clientY: 0, down: false };

  function place() {
    const r = container.getBoundingClientRect();
    if (!r.width || !r.height) return;
    pointer.x = pointer.clientX - r.left;
    pointer.y = r.height - (pointer.clientY - r.top);
    // Inside the section, or close enough that leaving eases out instead of
    // dropping the lean on the boundary.
    const inside = pointer.x > -80 && pointer.x < r.width + 80 &&
                   pointer.y > -80 && pointer.y < r.height + 80;
    pointer.want = pointer.down && inside ? 1 : 0;
  }

  function onMove(clientX, clientY) {
    if (!opts.pointer.enabled) return;
    pointer.clientX = clientX;
    pointer.clientY = clientY;
    pointer.down = true;
  }

  // Gone: the cursor has left the window, or the finger has lifted. A touch
  // has no cursor left behind to lean toward, so it used to stay leaning at
  // the last tap for good.
  const onGone = () => { pointer.down = false; };
  const onMouse = e => onMove(e.clientX, e.clientY);
  const onTouch = e => {
    if (e.touches && e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
  };
  const onOut = e => { if (!e.relatedTarget) onGone(); };

  window.addEventListener('mousemove', onMouse, { passive: true });
  window.addEventListener('touchmove', onTouch, { passive: true });
  window.addEventListener('touchstart', onTouch, { passive: true });
  window.addEventListener('touchend', onGone, { passive: true });
  window.addEventListener('touchcancel', onGone, { passive: true });
  document.addEventListener('mouseout', onOut);

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
    place();
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
      window.removeEventListener('touchend', onGone);
      window.removeEventListener('touchcancel', onGone);
      document.removeEventListener('mouseout', onOut);
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
