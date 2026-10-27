// Desenho 3D com three.js: peças, adesivos, seta do próximo giro e animação.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { sub, cross, dot, norm, add, scale, len } from '../engine/math.js';

// adesivo que ainda não importa na etapa: escuro, para não parecer uma cor
const GRAY = new THREE.Color('#2c3038');
const BODY = new THREE.Color('#111316');
const BASE_GLOW = 0.28;

function insetPolygon(verts, normal, m) {
  // tira vértices repetidos
  const pts = [];
  for (const v of verts) if (!pts.length || len(sub(v, pts[pts.length - 1])) > 1e-4) pts.push(v);
  if (pts.length > 2 && len(sub(pts[0], pts[pts.length - 1])) < 1e-4) pts.pop();
  const n = pts.length;
  const u = norm(sub(pts[1], pts[0]));
  const w = cross(normal, u);
  const o = pts[0];
  const to2 = (p) => [dot(sub(p, o), u), dot(sub(p, o), w)];
  const P = pts.map(to2);
  const lines = [];
  for (let i = 0; i < n; i++) {
    const a = P[i];
    const b = P[(i + 1) % n];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy);
    const inx = -dy / l;
    const iny = dx / l; // normal para dentro (polígono anti-horário)
    lines.push({ p: [a[0] + inx * m, a[1] + iny * m], d: [dx / l, dy / l] });
  }
  const out = [];
  for (let i = 0; i < n; i++) {
    const L1 = lines[(i - 1 + n) % n];
    const L2 = lines[i];
    const den = L1.d[0] * L2.d[1] - L1.d[1] * L2.d[0];
    if (Math.abs(den) < 1e-9) continue;
    const t = ((L2.p[0] - L1.p[0]) * L2.d[1] - (L2.p[1] - L1.p[1]) * L2.d[0]) / den;
    out.push([L1.p[0] + L1.d[0] * t, L1.p[1] + L1.d[1] * t]);
  }
  // confere se continuou convexo e do mesmo lado; senão encolhe pelo centro
  let area = 0;
  for (let i = 0; i < out.length; i++) {
    const a = out[i];
    const b = out[(i + 1) % out.length];
    area += a[0] * b[1] - b[0] * a[1];
  }
  const back = (q) => add(o, add(scale(u, q[0]), scale(w, q[1])));
  if (out.length < 3 || area <= 0) {
    const c = verts.reduce((s, v) => add(s, v), [0, 0, 0]).map((x) => x / verts.length);
    return verts.map((v) => add(c, scale(sub(v, c), 0.8)));
  }
  return out.map(back);
}

function polyGeometry(polys) {
  const pos = [];
  for (const poly of polys) {
    for (let i = 1; i < poly.length - 1; i++) pos.push(...poly[0], ...poly[i], ...poly[i + 1]);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

// etiqueta redonda; com cor, vira uma "bolinha" da cor da face com a letra
function labelSprite(text, color) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = color || 'rgba(15,17,21,0.78)';
  ctx.beginPath();
  ctx.arc(64, 64, 54, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#111316';
  ctx.stroke();
  const rgb = new THREE.Color(color || '#000000');
  const light = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b > 0.55;
  ctx.fillStyle = color && light ? '#111316' : '#ffffff';
  ctx.font = `bold ${text.length > 2 ? 40 : text.length > 1 ? 52 : 64}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 64, 68);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  return s;
}

const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export class PuzzleView {
  constructor(container) {
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.rotateSpeed = 0.9;
    // até a pessoa mexer na câmera, ela se reajusta quando a tela muda de tamanho
    this.userMoved = false;
    this.controls.addEventListener('start', () => (this.userMoved = true));

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x445066, 1.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(4, 8, 6);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.7);
    fill.position.set(-6, -3, -4);
    this.scene.add(fill);

    this.root = new THREE.Group();
    this.scene.add(this.root);
    this.labels = new THREE.Group();
    this.scene.add(this.labels);
    this.arrow = null;
    this.anim = null;
    this.clock = new THREE.Clock();

    new ResizeObserver(() => this.resize()).observe(container);
    this.resize();
    this.renderer.setAnimationLoop(() => this.frame());
  }

  resize() {
    const w = this.container.clientWidth || 1;
    const h = this.container.clientHeight || 1;
    this.size = `${w}x${h}`;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this.def && !this.userMoved) this.resetCamera();
  }

  setPuzzle(def, pieces) {
    this.def = def;
    this.pieces = pieces;
    this.root.clear();
    this.labels.clear();
    this.clearArrow();
    this.anim = null;
    const faceColor = Object.fromEntries(def.faces.map((f) => [f.name, new THREE.Color(f.color)]));
    const bodyMat = new THREE.MeshStandardMaterial({ color: BODY, roughness: 0.55, metalness: 0.05 });
    const inset = def.radius * 0.035;
    this.groups = pieces.map((p) => {
      const g = new THREE.Group();
      const shrink = (v) => add(p.center, scale(sub(v, p.center), 0.985));
      const body = new THREE.Mesh(polyGeometry(p.solid.faces.map((f) => f.verts.map(shrink))), bodyMat);
      g.add(body);
      g.userData.stickers = p.stickers.map((st) => {
        const poly = insetPolygon(st.verts, st.normal, inset).map((v) => add(shrink(v), scale(st.normal, 0.004)));
        const mat = new THREE.MeshStandardMaterial({
          color: faceColor[st.face],
          roughness: 0.45,
          metalness: 0,
          // brilho próprio leve: a cor não escurece nas faces em sombra
          emissive: faceColor[st.face].clone(),
          emissiveIntensity: BASE_GLOW,
        });
        const mesh = new THREE.Mesh(polyGeometry([poly]), mat);
        g.add(mesh);
        return { mesh, face: st.face, color: faceColor[st.face] };
      });
      this.root.add(g);
      return g;
    });
    // letras das faces (fixas no espaço, como a notação)
    const labels =
      def.labels ||
      def.faces.map((f) => ({ text: f.name, color: f.color, position: scale(norm(f.normal), f.dist + def.radius * 0.32) }));
    for (const l of labels) {
      const s = labelSprite(l.text, l.color);
      s.position.set(...l.position);
      s.scale.setScalar(def.radius * 0.17);
      this.labels.add(s);
    }
    this.controls.minDistance = def.radius * 1.8;
    this.controls.maxDistance = def.radius * 9;
    this.resetCamera();
  }

  showLabels(on) {
    this.labels.visible = on;
  }

  // afasta a câmera o suficiente para o quebra-cabeça caber na tela
  resetCamera() {
    const vfov = (this.camera.fov * Math.PI) / 180;
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * this.camera.aspect);
    const dist = (this.def.radius * 1.3) / Math.sin(Math.min(vfov, hfov) / 2);
    this.camera.position.set(...scale(norm(this.def.camera.position), dist));
    this.controls.target.set(0, 0, 0);
    this.controls.update();
    this.userMoved = false;
  }

  // colored(peça, face) define cor ou cinza; focus(peça) pisca
  paint(colored, focus) {
    this.focusMats = [];
    this.pieces.forEach((p, i) => {
      const isFocus = focus && focus(p);
      for (const st of this.groups[i].userData.stickers) {
        const on = !colored || colored(p, st.face);
        st.mesh.material.color.copy(on ? st.color : GRAY);
        st.mesh.material.emissive.copy(on ? st.color : GRAY);
        st.mesh.material.emissiveIntensity = BASE_GLOW;
        if (isFocus && on) this.focusMats.push(st.mesh.material);
      }
    });
  }

  sync(state) {
    state.quats.forEach((q, i) => this.groups[i].quaternion.set(q[0], q[1], q[2], q[3]));
  }

  clearArrow() {
    if (this.arrow) {
      this.scene.remove(this.arrow);
      this.arrow = null;
    }
  }

  // seta circular em volta do eixo do giro, no sentido do giro
  showArrow(plan) {
    this.clearArrow();
    if (!plan) return;
    const { axis, angle, move } = plan;
    const r = move.arrow.radius;
    const tube = this.def.radius * 0.035;
    const arc = Math.min(Math.abs(angle), Math.PI) * 0.9 + Math.PI * 0.55;
    const mat = new THREE.MeshStandardMaterial({ color: '#ff3b6b', emissive: '#ff3b6b', emissiveIntensity: 0.55, roughness: 0.4 });
    const g = new THREE.Group();
    const torus = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 10, 64, arc), mat);
    g.add(torus);
    const head = new THREE.Mesh(new THREE.ConeGeometry(tube * 2.6, tube * 6, 16), mat);
    head.position.set(r * Math.cos(arc), r * Math.sin(arc), 0);
    head.rotation.z = arc;
    g.add(head);
    const inner = new THREE.Group();
    inner.add(g);
    if (angle < 0) inner.scale.set(1, -1, 1); // espelha: vira horário
    inner.position.z = 0;
    const outer = new THREE.Group();
    outer.add(inner);
    outer.position.set(...scale(axis, move.arrow.height));
    outer.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(...axis));
    this.arrow = outer;
    this.scene.add(outer);
  }

  // anima um giro já planejado; chama done() no fim
  animate(plan, duration, done) {
    const q0 = plan.ids.map((i) => this.groups[i].quaternion.clone());
    this.anim = { plan, q0, t: 0, duration: Math.max(duration, 0.01), done, axis: new THREE.Vector3(...plan.axis) };
  }

  get busy() {
    return !!this.anim;
  }

  frame() {
    // garantia: se a página abriu escondida, o ResizeObserver pode não ter avisado
    if (`${this.container.clientWidth || 1}x${this.container.clientHeight || 1}` !== this.size) this.resize();
    const dt = Math.min(this.clock.getDelta(), 0.1);
    if (this.anim) {
      const a = this.anim;
      a.t += dt / a.duration;
      const k = easeInOut(Math.min(a.t, 1));
      const rot = new THREE.Quaternion().setFromAxisAngle(a.axis, a.plan.angle * k);
      a.plan.ids.forEach((id, j) => this.groups[id].quaternion.copy(rot).multiply(a.q0[j]));
      if (a.t >= 1) {
        this.anim = null;
        a.done && a.done();
      }
    }
    if (this.focusMats && this.focusMats.length) {
      const v = BASE_GLOW + 0.3 + 0.3 * Math.sin(performance.now() / 260);
      for (const m of this.focusMats) m.emissiveIntensity = v;
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
