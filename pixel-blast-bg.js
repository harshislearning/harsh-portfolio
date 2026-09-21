/**
 * PIXEL BLAST BACKGROUND
 *
 * A field of dithered pixels breathing through slow noise, with ripples
 * that ring out from every click and a liquid smear that follows the
 * pointer.
 *
 * Reference: React Bits "PixelBlast" (itself inspired by
 * github.com/zavalit/bayer-dithering-webgl-demo). That component is React
 * and draws its liquid pass through the postprocessing library. This site
 * is vanilla with no build step, so it is rebuilt here against the Three.js
 * the page already loads. The pattern shader is the component's own,
 * unchanged. The liquid effect is the component's too — the same touch
 * texture and the same distortion — but run as a second pass of our own
 * rather than through postprocessing's EffectComposer.
 */

const VERTEX_SRC = `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

// The component's fragment shader, verbatim.
const FRAGMENT_SRC = `
precision highp float;

uniform vec3  uColor;
uniform vec2  uResolution;
uniform float uTime;
uniform float uPixelSize;
uniform float uScale;
uniform float uDensity;
uniform float uPixelJitter;
uniform int   uEnableRipples;
uniform float uRippleSpeed;
uniform float uRippleThickness;
uniform float uRippleIntensity;
uniform float uEdgeFade;

uniform int   uShapeType;
const int SHAPE_SQUARE   = 0;
const int SHAPE_CIRCLE   = 1;
const int SHAPE_TRIANGLE = 2;
const int SHAPE_DIAMOND  = 3;

const int   MAX_CLICKS = 10;

uniform vec2  uClickPos  [MAX_CLICKS];
uniform float uClickTimes[MAX_CLICKS];

out vec4 fragColor;

float Bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2. + a.y * a.y * .75);
}
#define Bayer4(a) (Bayer2(.5*(a))*0.25 + Bayer2(a))
#define Bayer8(a) (Bayer4(.5*(a))*0.25 + Bayer2(a))

#define FBM_OCTAVES     5
#define FBM_LACUNARITY  1.25
#define FBM_GAIN        1.0

float hash11(float n){ return fract(sin(n)*43758.5453); }

float vnoise(vec3 p){
  vec3 ip = floor(p);
  vec3 fp = fract(p);
  float n000 = hash11(dot(ip + vec3(0.0,0.0,0.0), vec3(1.0,57.0,113.0)));
  float n100 = hash11(dot(ip + vec3(1.0,0.0,0.0), vec3(1.0,57.0,113.0)));
  float n010 = hash11(dot(ip + vec3(0.0,1.0,0.0), vec3(1.0,57.0,113.0)));
  float n110 = hash11(dot(ip + vec3(1.0,1.0,0.0), vec3(1.0,57.0,113.0)));
  float n001 = hash11(dot(ip + vec3(0.0,0.0,1.0), vec3(1.0,57.0,113.0)));
  float n101 = hash11(dot(ip + vec3(1.0,0.0,1.0), vec3(1.0,57.0,113.0)));
  float n011 = hash11(dot(ip + vec3(0.0,1.0,1.0), vec3(1.0,57.0,113.0)));
  float n111 = hash11(dot(ip + vec3(1.0,1.0,1.0), vec3(1.0,57.0,113.0)));
  vec3 w = fp*fp*fp*(fp*(fp*6.0-15.0)+10.0);
  float x00 = mix(n000, n100, w.x);
  float x10 = mix(n010, n110, w.x);
  float x01 = mix(n001, n101, w.x);
  float x11 = mix(n011, n111, w.x);
  float y0  = mix(x00, x10, w.y);
  float y1  = mix(x01, x11, w.y);
  return mix(y0, y1, w.z) * 2.0 - 1.0;
}

float fbm2(vec2 uv, float t){
  vec3 p = vec3(uv * uScale, t);
  float amp = 1.0;
  float freq = 1.0;
  float sum = 1.0;
  for (int i = 0; i < FBM_OCTAVES; ++i){
    sum  += amp * vnoise(p * freq);
    freq *= FBM_LACUNARITY;
    amp  *= FBM_GAIN;
  }
  return sum * 0.5 + 0.5;
}

float maskCircle(vec2 p, float cov){
  float r = sqrt(cov) * .25;
  float d = length(p - 0.5) - r;
  float aa = 0.5 * fwidth(d);
  return cov * (1.0 - smoothstep(-aa, aa, d * 2.0));
}

float maskTriangle(vec2 p, vec2 id, float cov){
  bool flip = mod(id.x + id.y, 2.0) > 0.5;
  if (flip) p.x = 1.0 - p.x;
  float r = sqrt(cov);
  float d  = p.y - r*(1.0 - p.x);
  float aa = fwidth(d);
  return cov * clamp(0.5 - d/aa, 0.0, 1.0);
}

float maskDiamond(vec2 p, float cov){
  float r = sqrt(cov) * 0.564;
  return step(abs(p.x - 0.49) + abs(p.y - 0.49), r);
}

void main(){
  float pixelSize = uPixelSize;
  vec2 fragCoord = gl_FragCoord.xy - uResolution * .5;
  float aspectRatio = uResolution.x / uResolution.y;

  vec2 pixelId = floor(fragCoord / pixelSize);
  vec2 pixelUV = fract(fragCoord / pixelSize);

  float cellPixelSize = 8.0 * pixelSize;
  vec2 cellId = floor(fragCoord / cellPixelSize);
  vec2 cellCoord = cellId * cellPixelSize;
  vec2 uv = cellCoord / uResolution * vec2(aspectRatio, 1.0);

  float base = fbm2(uv, uTime * 0.05);
  base = base * 0.5 - 0.65;

  float feed = base + (uDensity - 0.5) * 0.3;

  float speed     = uRippleSpeed;
  float thickness = uRippleThickness;
  const float dampT     = 1.0;
  const float dampR     = 10.0;

  if (uEnableRipples == 1) {
    for (int i = 0; i < MAX_CLICKS; ++i){
      vec2 pos = uClickPos[i];
      if (pos.x < 0.0) continue;
      float cellPixelSize = 8.0 * pixelSize;
      vec2 cuv = (((pos - uResolution * .5 - cellPixelSize * .5) / (uResolution))) * vec2(aspectRatio, 1.0);
      float t = max(uTime - uClickTimes[i], 0.0);
      float r = distance(uv, cuv);
      float waveR = speed * t;
      float ring  = exp(-pow((r - waveR) / thickness, 2.0));
      float atten = exp(-dampT * t) * exp(-dampR * r);
      feed = max(feed, ring * atten * uRippleIntensity);
    }
  }

  float bayer = Bayer8(fragCoord / uPixelSize) - 0.5;
  float bw = step(0.5, feed + bayer);

  float h = fract(sin(dot(floor(fragCoord / uPixelSize), vec2(127.1, 311.7))) * 43758.5453);
  float jitterScale = 1.0 + (h - 0.5) * uPixelJitter;
  float coverage = bw * jitterScale;
  float M;
  if      (uShapeType == SHAPE_CIRCLE)   M = maskCircle (pixelUV, coverage);
  else if (uShapeType == SHAPE_TRIANGLE) M = maskTriangle(pixelUV, pixelId, coverage);
  else if (uShapeType == SHAPE_DIAMOND)  M = maskDiamond(pixelUV, coverage);
  else                                   M = coverage;

  if (uEdgeFade > 0.0) {
    vec2 norm = gl_FragCoord.xy / uResolution;
    float edge = min(min(norm.x, norm.y), min(1.0 - norm.x, 1.0 - norm.y));
    float fade = smoothstep(0.0, uEdgeFade, edge);
    M *= fade;
  }

  vec3 color = uColor;

  // sRGB gamma correction - convert linear to sRGB for accurate color output
  vec3 srgbColor = mix(
    color * 12.92,
    1.055 * pow(color, vec3(1.0 / 2.4)) - 0.055,
    step(0.0031308, color)
  );

  fragColor = vec4(srgbColor, M);
}
`;

// The component's LiquidEffect, as a pass of its own: the same mainUv
// distortion, applied to the pattern before it is drawn to the screen.
const LIQUID_VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const LIQUID_FRAG = `
precision highp float;
uniform sampler2D tDiffuse;
uniform sampler2D uTexture;
uniform float uStrength;
uniform float uTime;
uniform float uFreq;
varying vec2 vUv;

void mainUv(inout vec2 uv) {
  vec4 tex = texture2D(uTexture, uv);
  float vx = tex.r * 2.0 - 1.0;
  float vy = tex.g * 2.0 - 1.0;
  float intensity = tex.b;

  float wave = 0.5 + 0.5 * sin(uTime * uFreq + intensity * 6.2831853);

  float amt = uStrength * intensity * wave;

  uv += vec2(vx, vy) * amt;
}

void main() {
  vec2 uv = vUv;
  mainUv(uv);
  gl_FragColor = texture2D(tDiffuse, uv);
}
`;

const SHAPE_MAP = { square: 0, circle: 1, triangle: 2, diamond: 3 };
const MAX_CLICKS = 10;

// The component's touch trail, unchanged: a small canvas that records the
// pointer's recent path as velocity (red, green) and strength (blue).
function createTouchTexture(THREE) {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.Texture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  const trail = [];
  let last = null;
  const maxAge = 64;
  let radius = 0.1 * size;
  const speed = 1 / maxAge;
  const clear = () => {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };
  const drawPoint = p => {
    const pos = { x: p.x * size, y: (1 - p.y) * size };
    let intensity = 1;
    const easeOutSine = t => Math.sin((t * Math.PI) / 2);
    const easeOutQuad = t => -t * (t - 2);
    if (p.age < maxAge * 0.3) intensity = easeOutSine(p.age / (maxAge * 0.3));
    else intensity = easeOutQuad(1 - (p.age - maxAge * 0.3) / (maxAge * 0.7)) || 0;
    intensity *= p.force;
    const color = `${((p.vx + 1) / 2) * 255}, ${((p.vy + 1) / 2) * 255}, ${intensity * 255}`;
    const offset = size * 5;
    ctx.shadowOffsetX = offset;
    ctx.shadowOffsetY = offset;
    ctx.shadowBlur = radius;
    ctx.shadowColor = `rgba(${color},${0.22 * intensity})`;
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,0,0,1)';
    ctx.arc(pos.x - offset, pos.y - offset, radius, 0, Math.PI * 2);
    ctx.fill();
  };
  const addTouch = norm => {
    let force = 0;
    let vx = 0;
    let vy = 0;
    if (last) {
      const dx = norm.x - last.x;
      const dy = norm.y - last.y;
      if (dx === 0 && dy === 0) return;
      const dd = dx * dx + dy * dy;
      const d = Math.sqrt(dd);
      vx = dx / (d || 1);
      vy = dy / (d || 1);
      force = Math.min(dd * 10000, 1);
    }
    last = { x: norm.x, y: norm.y };
    trail.push({ x: norm.x, y: norm.y, age: 0, force, vx, vy });
  };
  const update = () => {
    clear();
    for (let i = trail.length - 1; i >= 0; i--) {
      const point = trail[i];
      const f = point.force * speed * (1 - point.age / maxAge);
      point.x += point.vx * f;
      point.y += point.vy * f;
      point.age++;
      if (point.age > maxAge) trail.splice(i, 1);
    }
    for (let i = 0; i < trail.length; i++) drawPoint(trail[i]);
    texture.needsUpdate = true;
  };
  // A stroke that ends and another that starts elsewhere are two strokes,
  // not one long drag between them.
  const lift = () => { last = null; };
  return {
    texture, addTouch, update, lift,
    set radiusScale(v) { radius = 0.1 * size * v; }
  };
}

/**
 * @param {HTMLElement} host     the box the canvas fills
 * @param {HTMLElement} surface  where clicks and pointer moves are read from
 */
export async function createPixelBlast(host, surface, options) {
  const opts = Object.assign({
    variant: 'square',
    pixelSize: 3,
    color: '#B497CF',
    patternScale: 2,
    patternDensity: 1,
    pixelSizeJitter: 0,
    enableRipples: true,
    rippleSpeed: 0.3,
    rippleThickness: 0.1,
    rippleIntensityScale: 1,
    liquid: false,
    liquidStrength: 0.1,
    liquidRadius: 1,
    liquidWobbleSpeed: 4.5,
    speed: 0.5,
    edgeFade: 0.5,
    antialias: true
  }, options || {});

  const THREE = await import('https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js');

  const renderer = new THREE.WebGLRenderer({
    antialias: opts.antialias, alpha: true, powerPreference: 'low-power'
  });
  // The component's shader is GLSL 3; without WebGL 2 there is nothing to run.
  if (!renderer.capabilities.isWebGL2) {
    renderer.dispose();
    throw new Error('PixelBlast needs WebGL 2');
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearAlpha(0);

  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  // Faded in on its first frame, like the page's other backgrounds.
  canvas.style.cssText = 'display:block;width:100%;height:100%;opacity:0;transition:opacity 700ms ease';
  host.appendChild(canvas);

  const uniforms = {
    uResolution: { value: new THREE.Vector2(0, 0) },
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(opts.color) },
    uClickPos: { value: Array.from({ length: MAX_CLICKS }, () => new THREE.Vector2(-1, -1)) },
    uClickTimes: { value: new Float32Array(MAX_CLICKS) },
    uShapeType: { value: SHAPE_MAP[opts.variant] || 0 },
    uPixelSize: { value: opts.pixelSize * renderer.getPixelRatio() },
    uScale: { value: opts.patternScale },
    uDensity: { value: opts.patternDensity },
    uPixelJitter: { value: opts.pixelSizeJitter },
    uEnableRipples: { value: opts.enableRipples ? 1 : 0 },
    uRippleSpeed: { value: opts.rippleSpeed },
    uRippleThickness: { value: opts.rippleThickness },
    uRippleIntensity: { value: opts.rippleIntensityScale },
    uEdgeFade: { value: opts.edgeFade }
  };

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const scene = new THREE.Scene();
  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX_SRC,
    fragmentShader: FRAGMENT_SRC,
    uniforms: uniforms,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    glslVersion: THREE.GLSL3
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(quad);

  // The liquid pass: the pattern is drawn into a buffer, and the buffer is
  // drawn to the screen through the touch trail's distortion.
  let touch = null, target = null, liquidScene = null, liquidMat = null, liquidQuad = null;
  if (opts.liquid) {
    touch = createTouchTexture(THREE);
    touch.radiusScale = opts.liquidRadius;
    target = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: false, stencilBuffer: false });
    liquidMat = new THREE.ShaderMaterial({
      vertexShader: LIQUID_VERT,
      fragmentShader: LIQUID_FRAG,
      uniforms: {
        tDiffuse: { value: target.texture },
        uTexture: { value: touch.texture },
        uStrength: { value: opts.liquidStrength },
        uTime: { value: 0 },
        uFreq: { value: opts.liquidWobbleSpeed }
      },
      // The buffer already holds exactly what the canvas should show.
      blending: THREE.NoBlending,
      depthTest: false,
      depthWrite: false
    });
    liquidQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), liquidMat);
    liquidScene = new THREE.Scene();
    liquidScene.add(liquidQuad);
  }

  function setSize() {
    const w = host.clientWidth || 1;
    const h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    uniforms.uResolution.value.set(canvas.width, canvas.height);
    uniforms.uPixelSize.value = opts.pixelSize * renderer.getPixelRatio();
    if (target) target.setSize(canvas.width, canvas.height);
  }
  setSize();
  const ro = window.ResizeObserver ? new ResizeObserver(setSize) : null;
  if (ro) ro.observe(host);
  window.addEventListener('resize', setSize);

  /* ---- input --------------------------------------------------------- */
  // Read from the section rather than the canvas: the canvas sits behind
  // the section's content, so it would only ever hear the gaps between it.
  function toPixels(e) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const fx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const fy = (rect.height - (e.clientY - rect.top)) * (canvas.height / rect.height);
    if (fx < 0 || fy < 0 || fx > canvas.width || fy > canvas.height) return null;
    return { fx: fx, fy: fy };
  }

  let clickIx = 0;
  const onDown = e => {
    if (!opts.enableRipples) return;
    const p = toPixels(e);
    if (!p) return;
    uniforms.uClickPos.value[clickIx].set(p.fx, p.fy);
    uniforms.uClickTimes.value[clickIx] = uniforms.uTime.value;
    clickIx = (clickIx + 1) % MAX_CLICKS;
  };
  const onMove = e => {
    if (!touch) return;
    const p = toPixels(e);
    if (!p) { touch.lift(); return; }
    touch.addTouch({ x: p.fx / canvas.width, y: p.fy / canvas.height });
  };
  const onLeave = () => { if (touch) touch.lift(); };
  surface.addEventListener('pointerdown', onDown, { passive: true });
  surface.addEventListener('pointermove', onMove, { passive: true });
  surface.addEventListener('pointerleave', onLeave, { passive: true });

  /* ---- loop ---------------------------------------------------------- */
  let visible = false;
  let hidden = document.hidden;
  let lost = false;
  const io = new IntersectionObserver(entries => {
    visible = entries.some(e => e.isIntersecting);
  }, { threshold: 0 });
  // The canvas's own box, not the section's. Below the mobile width the
  // layer is display:none, and a section still on screen kept a hidden
  // field rendering every frame after a window was narrowed.
  io.observe(host);
  const onVisibility = () => { hidden = document.hidden; };
  document.addEventListener('visibilitychange', onVisibility);

  // A random start, as in the component, so the pattern is not the same
  // shape on every visit.
  const timeOffset = Math.random() * 1000;
  let elapsed = 0;
  let prev = performance.now();
  let raf = 0;

  function frame() {
    raf = requestAnimationFrame(frame);
    const now = performance.now();
    const dt = Math.min((now - prev) / 1000, 1 / 20);
    prev = now;
    if (!visible || hidden || lost) return;
    elapsed += dt;

    uniforms.uTime.value = timeOffset + elapsed * opts.speed;
    if (touch) {
      touch.update();
      liquidMat.uniforms.uTime.value = uniforms.uTime.value;
      renderer.setRenderTarget(target);
      renderer.clear();
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      renderer.render(liquidScene, camera);
    } else {
      renderer.render(scene, camera);
    }
    if (canvas.style.opacity !== '1') canvas.style.opacity = '1';
  }
  raf = requestAnimationFrame(frame);

  const onLost = e => { e.preventDefault(); lost = true; };
  const onRestored = () => { lost = false; setSize(); };
  canvas.addEventListener('webglcontextlost', onLost);
  canvas.addEventListener('webglcontextrestored', onRestored);

  return {
    canvas: canvas,
    destroy() {
      cancelAnimationFrame(raf);
      io.disconnect();
      if (ro) ro.disconnect();
      window.removeEventListener('resize', setSize);
      document.removeEventListener('visibilitychange', onVisibility);
      surface.removeEventListener('pointerdown', onDown);
      surface.removeEventListener('pointermove', onMove);
      surface.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      quad.geometry.dispose();
      material.dispose();
      if (liquidQuad) { liquidQuad.geometry.dispose(); liquidMat.dispose(); }
      if (target) target.dispose();
      if (touch) touch.texture.dispose();
      renderer.dispose();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }
  };
}
