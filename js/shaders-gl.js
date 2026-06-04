import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────────────────
// Shaders — technique extracted from lusion.co source bundle
//
// Key findings from bundle analysis:
// • Each card is a DOM-tracked WebGL mesh (UfxMesh pattern)
// • Fragment: SDF rounded corners that scale 70%→100% via u_showRatio
// • Ripple: baseUv.x -= (uv.x - 0.5) * (1 - sin(uv.y * PI)) * strength
// • RGB shift + motion blur driven by scroll velocity
// ─────────────────────────────────────────────────────────────────────────────

const CARD_VERT = /* glsl */ `
precision mediump float;
varying vec2 vUv;

void main() {
vUv = uv;
gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Shader ported directly from Lusion's frag$l (hoisted.CJiXW_YI.js)
// Key corrections vs previous version:
// 1. Ripple samples gl_FragCoord/u_resolution (screen UV) — NOT card UV
// This makes the wave curve across the WHOLE viewport simultaneously,
// which is the subtle Lusion feel (not a per-card wobble)
// 2. getRoundedCornerMask uses linearStep-based radius animation:
// at showRatio=0 corners are fully circular, opens to target radius as card reveals
const CARD_FRAG = /* glsl */ `
precision mediump float;

uniform sampler2D u_texture;
uniform vec2 u_domWH; // card pixel dimensions (matches frag$l naming)
uniform vec2 u_textureSize; // natural image dimensions
uniform float u_showRatio; // 0→1 entrance animation
uniform float u_rippleStrength;// abs(vel) * 0.18 from JS
uniform float u_globalRadius; // corner radius in px
uniform vec2 u_resolution; // viewport size in px (for screenUv)
uniform float ua; // master alpha

varying vec2 vUv;

// ── Helpers (exact copies from frag$l) ──────────────────────────────────

float linearStep(float edge0, float edge1, float x) {
return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

float sdRoundedBox(in vec2 p, in vec2 b, in float r) {
vec2 q = abs(p) - b + r;
return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

// From frag$l — radius starts at minSize (circle), opens to u_globalRadius
// as the card scales from 70% → 100%. ratio = 1.0 always.
float getRoundedCornerMask(vec2 uv, vec2 size, float radius, float ratio) {
vec2 halfSize = size * 0.5;
float maxDist = length(halfSize);
float minSize = min(halfSize.x, halfSize.y);
float maxSize = max(halfSize.x, halfSize.y);
float t = ratio * maxDist;
// Radius: circle at entrance, target radius when fully open
radius = mix(minSize * linearStep(0.0, minSize, t),
radius,
linearStep(maxSize, maxDist, t));
halfSize = min(halfSize, vec2(t));
float d = sdRoundedBox((uv - 0.5) * u_domWH, halfSize, radius);
return smoothstep(0.0, 0.0 - fwidth(d), d);
}

// CSS background-size: cover
vec2 coverUv(vec2 screen, vec2 img, vec2 uv) {
float sr = screen.x / screen.y;
float ir = img.x / img.y;
vec2 scale = sr < ir ? vec2(ir / sr, 1.0) : vec2(1.0, sr / ir);
return (uv - 0.5) / scale + 0.5;
}

void main() {
// ── Screen UV for ripple (frag$l line: screenUv = gl_FragCoord/u_resolution) ──
// Using screen UV makes the ripple wave span the FULL viewport height,
// not just the card — this is the authentic Lusion wave behaviour
vec2 screenUv = gl_FragCoord.xy / u_resolution;
vec2 baseUv = vUv;

// ── Horizontal ripple — exact formula from frag$l ─────────────────────
baseUv.x -= (screenUv.x - 0.5) * (1.0 - sin(screenUv.y * 3.141592)) * u_rippleStrength;

// ── Rounded-corner entrance mask ─────────────────────────────────────
float mask = getRoundedCornerMask(baseUv, u_domWH * mix(0.7, 1.0, u_showRatio), u_globalRadius, 1.0);

// ── Motion blur: 9 samples along scroll direction ─────────────────────
// u_rippleStrength doubles as a velocity proxy here (same magnitude)
float vel = u_rippleStrength; // already abs'd, keep sign for blur
vec3 color = vec3(0.0);
vec2 blurDir = vec2(0.0, vel * 0.005);
vec2 blurUv = baseUv - blurDir * 4.0;
for (int i = 0; i < 9; i++) {
vec2 cv = coverUv(u_domWH, u_textureSize, clamp(blurUv, 0.001, 0.999));
color += texture2D(u_texture, cv).rgb;
blurUv += blurDir;
}
color /= 9.0;

// ── RGB chromatic aberration ──────────────────────────────────────────
float shift = vel * 0.004;
color.r = texture2D(u_texture, coverUv(u_domWH, u_textureSize, clamp(baseUv + vec2(shift, 0.0), 0.001, 0.999))).r;
color.b = texture2D(u_texture, coverUv(u_domWH, u_textureSize, clamp(baseUv - vec2(shift, 0.0), 0.001, 0.999))).b;

gl_FragColor = vec4(color, mask * ua);
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// LusionGL — fixed full-page WebGL canvas tracking DOM card bounds
// ─────────────────────────────────────────────────────────────────────────────

class LusionGL {
  constructor() {
    this.meshes = [];
    this.rawVelocity = 0;
    this.smoothV = 0;
    this.time = 0;

    this.init();
  }

  get W() {
    return window.innerWidth;
  }
  get H() {
    return window.innerHeight;
  }

  // ── Setup ─────────────────────────────────────────────────────────────────

  init() {
    this.canvas = document.createElement("canvas");
    Object.assign(this.canvas.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: "3",
    });
    document.body.appendChild(this.canvas);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setSize(this.W, this.H);

    // Perspective camera calibrated so 1 Three.js unit === 1 CSS pixel at Z=0
    // This is the same projection Lusion uses — it lets the Z-wave in vertex
    // shaders produce visible foreshortening (orthographic would ignore it)
    this.cameraZ = this.H;
    const fov = 2 * Math.atan(this.H / 2 / this.cameraZ) * (180 / Math.PI);
    this.camera = new THREE.PerspectiveCamera(
      fov,
      this.W / this.H,
      0.01,
      10000,
    );
    this.camera.position.z = this.cameraZ;

    this.scene = new THREE.Scene();

    this.createMeshes();
    this.hookLenis();
    window.addEventListener("resize", () => this.onResize());
    this.animate();
  }

  // ── Card mesh creation ────────────────────────────────────────────────────

  createMeshes() {
    document.querySelectorAll("[data-work-media] img").forEach((img, i) => {
      const geo = new THREE.PlaneGeometry(1, 1, 1, 1);
      const uniforms = {
        u_texture: { value: null },
        u_domWH: { value: new THREE.Vector2(1, 1) },
        u_textureSize: { value: new THREE.Vector2(1, 1) },
        u_showRatio: { value: 0.0 },
        u_rippleStrength: { value: 0.0 },
        u_globalRadius: { value: 12.0 },
        u_resolution: { value: new THREE.Vector2(this.W, this.H) },
        ua: { value: 0.0 },
      };

      const mat = new THREE.ShaderMaterial({
        vertexShader: CARD_VERT,
        fragmentShader: CARD_FRAG,
        uniforms,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.renderOrder = i;
      this.scene.add(mesh);

      // Per-card entrance state
      mesh.userData.showRatio = 0;
      mesh.userData.showRatioTarget = 0;

      this.meshes.push({ mesh, uniforms, img });

      const applyTexture = () => {
        const tex = new THREE.Texture(img);
        tex.needsUpdate = true;
        uniforms.u_texture.value = tex;
        uniforms.u_textureSize.value.set(
          img.naturalWidth || img.width,
          img.naturalHeight || img.height,
        );
        uniforms.ua.value = 1.0;
        // Hide DOM image — the WebGL mesh renders it from now on
        img.style.opacity = "0";
        img.style.transition = "none";
      };

      if (img.complete && img.naturalWidth > 0) {
        applyTexture();
      } else {
        img.addEventListener("load", applyTexture, { once: true });
      }
    });
  }

  // ── Lenis scroll velocity hook ────────────────────────────────────────────

  hookLenis() {
    const poll = () => {
      if (typeof lenis !== "undefined") {
        lenis.on("scroll", (e) => {
          this.rawVelocity = e.velocity;
        });
      } else {
        setTimeout(poll, 80);
      }
    };
    poll();
  }

  // ── Resize ────────────────────────────────────────────────────────────────

  onResize() {
    this.cameraZ = this.H;
    const fov = 2 * Math.atan(this.H / 2 / this.cameraZ) * (180 / Math.PI);
    this.camera.fov = fov;
    this.camera.aspect = this.W / this.H;
    this.camera.position.z = this.cameraZ;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.W, this.H);
    // Update resolution uniform on all meshes
    this.meshes.forEach(({ uniforms }) => {
      uniforms.u_resolution.value.set(this.W, this.H);
    });
  }

  // ── DOM tracking + showRatio ───────────────────────────────────────────────

  updateMeshes(smoothV) {
    const H = this.H,
      W = this.W;

    this.meshes.forEach(({ mesh, uniforms, img }) => {
      if (!uniforms.u_texture.value) return;

      const wrap = img.closest("[data-work-media]");
      if (!wrap) return;

      const rect = wrap.getBoundingClientRect();

      // Off-screen — hide mesh
      if (rect.bottom < -100 || rect.top > H + 100) {
        uniforms.ua.value = 0;
        return;
      }
      uniforms.ua.value = 1;

      // Compute show ratio: card fully hidden below H*0.92, fully shown at H*0.1
      const showTarget = Math.max(
        0,
        Math.min(1, (H * 0.88 - rect.top) / (H * 0.55)),
      );
      mesh.userData.showRatioTarget = showTarget;
      mesh.userData.showRatio += (showTarget - mesh.userData.showRatio) * 0.05;

      uniforms.u_showRatio.value = mesh.userData.showRatio;

      const w = rect.width;
      const h = rect.height;

      // Scale unit plane to match DOM element pixel dimensions
      mesh.scale.set(w, h, 1);
      uniforms.u_domWH.value.set(w, h);

      // Lusion entrance: slide card up from 60px below as showRatio goes 0→1
      const entranceY = (1.0 - mesh.userData.showRatio) * 60;

      // Three.js world coords: origin at center, Y flipped vs DOM
      mesh.position.set(
        rect.left + w / 2 - W / 2,
        -(rect.top + h / 2 - H / 2) + entranceY,
        0,
      );
    });
  }

  // ── Render loop ───────────────────────────────────────────────────────────

  animate() {
    const tick = () => {
      requestAnimationFrame(tick);

      this.time += 0.01;

      // Velocity smoothing — same lerp + decay as Lusion's vs.getSpeed()
      this.smoothV += (this.rawVelocity - this.smoothV) * 0.07;
      this.rawVelocity *= 0.88;

      // Normalize to -1..1 (Lenis velocity is in px/frame; ~20px/frame = fast)
      const sv = Math.max(-1, Math.min(1, this.smoothV / 22));

      this.updateMeshes(sv);

      this.meshes.forEach(({ uniforms }) => {
        // rippleStrength is abs velocity — matches u_rippleStrength in frag$l
        uniforms.u_rippleStrength.value = Math.abs(sv) * 0.18;
      });

      this.renderer.render(this.scene, this.camera);
    };

    tick();
  }
}

new LusionGL();
