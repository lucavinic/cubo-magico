// Geometria de poliedros convexos: um sólido é uma lista de faces
// (polígonos convexos com normal para fora). Cortar por um plano gera
// duas peças, e a tampa do corte vira uma face nova.

import { dot, add, sub, scale, cross, norm, len, average } from './math.js';

const EPS = 1e-6;

function dedupe(points) {
  const out = [];
  for (const p of points) {
    if (!out.some((q) => len(sub(p, q)) < EPS * 10)) out.push(p);
  }
  return out;
}

function polygonArea(verts, normal) {
  let s = [0, 0, 0];
  for (let i = 0; i < verts.length; i++) {
    s = add(s, cross(verts[i], verts[(i + 1) % verts.length]));
  }
  return Math.abs(dot(s, normal)) / 2;
}

// Corta um polígono: devolve a parte com dot(p,n) > d (front) e a outra (back)
function clipPolygon(verts, n, d) {
  const front = [];
  const back = [];
  const onPlane = [];
  for (let i = 0; i < verts.length; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % verts.length];
    const da = dot(a, n) - d;
    const db = dot(b, n) - d;
    if (da >= -EPS) front.push(a);
    if (da <= EPS) back.push(a);
    if (Math.abs(da) <= EPS) onPlane.push(a);
    if ((da > EPS && db < -EPS) || (da < -EPS && db > EPS)) {
      const t = da / (da - db);
      const p = add(a, scale(sub(b, a), t));
      front.push(p);
      back.push(p);
      onPlane.push(p);
    }
  }
  return { front: dedupe(front), back: dedupe(back), onPlane };
}

function orderAround(points, normal) {
  const c = average(points);
  let u = sub(points[0], c);
  if (len(u) < EPS) u = sub(points[1], c);
  u = norm(u);
  const v = cross(normal, u);
  return points
    .map((p) => ({ p, a: Math.atan2(dot(sub(p, c), v), dot(sub(p, c), u)) }))
    .sort((x, y) => x.a - y.a)
    .map((x) => x.p);
}

export function volume(solid) {
  let v = 0;
  for (const f of solid.faces) v += (polygonArea(f.verts, f.normal) * dot(f.normal, f.verts[0])) / 3;
  return v;
}

function makeSolid(faces) {
  const good = faces.filter((f) => f.verts.length >= 3 && polygonArea(f.verts, f.normal) > EPS);
  if (good.length < 4) return null;
  const solid = { faces: good };
  return volume(solid) > EPS ? solid : null;
}

// Corta um sólido pelo plano dot(p,n)=d. tagFront/tagBack: etiqueta da tampa
// em cada lado (usada quando o plano é uma face externa do quebra-cabeça).
export function splitSolid(solid, n, d, tagBack = null, tagFront = null) {
  let allFront = true;
  let allBack = true;
  for (const f of solid.faces) {
    for (const p of f.verts) {
      const dist = dot(p, n) - d;
      if (dist < -EPS) allFront = false;
      if (dist > EPS) allBack = false;
    }
  }
  if (allFront) return { front: solid, back: null };
  if (allBack) return { front: null, back: solid };

  const frontFaces = [];
  const backFaces = [];
  let cap = [];
  for (const f of solid.faces) {
    const { front, back, onPlane } = clipPolygon(f.verts, n, d);
    cap.push(...onPlane);
    if (front.length >= 3) frontFaces.push({ ...f, verts: front });
    if (back.length >= 3) backFaces.push({ ...f, verts: back });
  }
  cap = dedupe(cap);
  if (cap.length >= 3) {
    const nb = norm(n);
    backFaces.push({ verts: orderAround(cap, nb), normal: nb, tag: tagBack });
    const nf = scale(nb, -1);
    frontFaces.push({ verts: orderAround(cap, nf), normal: nf, tag: tagFront });
  }
  return { front: makeSolid(frontFaces), back: makeSolid(backFaces) };
}

export function box(h) {
  const faces = [];
  const axes = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];
  for (const a of axes) {
    for (const s of [1, -1]) {
      const n = scale(a, s);
      const u = [a[1], a[2], a[0]];
      const v = cross(n, u);
      const c = scale(n, h);
      const verts = [
        add(c, add(scale(u, h), scale(v, h))),
        add(c, add(scale(u, -h), scale(v, h))),
        add(c, add(scale(u, -h), scale(v, -h))),
        add(c, add(scale(u, h), scale(v, -h))),
      ];
      faces.push({ verts: orderAround(verts, n), normal: n, tag: null });
    }
  }
  return { faces };
}

export function solidCenter(solid) {
  return average(solid.faces.flatMap((f) => f.verts));
}

export function faceCenter(face) {
  return average(face.verts);
}
