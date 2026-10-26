// Monta um quebra-cabeça a partir das faces externas e dos planos de corte,
// e guarda o estado (rotação de cada peça). Um movimento gira todas as peças
// que estão do lado de fora de um plano.

import { box, splitSolid, solidCenter, faceCenter } from './geometry.js';
import { dot, norm, scale, rotate, quatAxisAngle, quatMul, quatNormalize, QI } from './math.js';

export function buildPuzzle(def) {
  let solid = box(10);
  for (const f of def.faces) {
    const n = norm(f.normal);
    solid = splitSolid(solid, n, f.dist, f.name, null).back;
  }
  let pieces = [solid];
  for (const c of def.cuts) {
    const n = norm(c.normal);
    const next = [];
    for (const p of pieces) {
      const { front, back } = splitSolid(p, n, c.dist);
      if (front) next.push(front);
      if (back) next.push(back);
    }
    pieces = next;
  }
  return pieces.map((s, id) => {
    const stickers = s.faces
      .filter((f) => f.tag)
      .map((f) => ({ face: f.tag, normal: f.normal, verts: f.verts, center: faceCenter(f) }));
    return {
      id,
      solid: s,
      center: solidCenter(s),
      stickers,
      faces: stickers.map((st) => st.face),
    };
  });
}

// "(R U R' U')x3" vira a sequência repetida; aceita R, R', R2, R2', R'2
export function parseAlg(text) {
  if (!text) return [];
  let t = text;
  const rep = /\(([^()]*)\)\s*[x×]?\s*(\d+)?/;
  while (rep.test(t)) {
    t = t.replace(rep, (_, inner, n) => Array(Number(n || 1)).fill(inner).join(' '));
  }
  return t
    .split(/\s+/)
    .filter(Boolean)
    .map((tok) => {
      const m = tok.match(/^([A-Za-z]+)(\d*)('?)(\d*)$/);
      if (!m) throw new Error(`Movimento inválido: ${tok}`);
      const amount = Number(m[2] || m[4] || 1);
      return { name: m[1], turns: m[3] ? -amount : amount };
    });
}

export function moveToString(mv) {
  const a = Math.abs(mv.turns);
  return mv.name + (a > 1 ? a : '') + (mv.turns < 0 ? "'" : '');
}

export function invertMoves(moves) {
  return moves
    .slice()
    .reverse()
    .map((m) => ({ name: m.name, turns: -m.turns }));
}

export class PuzzleState {
  constructor(def, pieces) {
    this.def = def;
    this.pieces = pieces;
    this.reset();
  }

  reset() {
    this.quats = this.pieces.map(() => QI.slice());
  }

  clone() {
    const c = new PuzzleState(this.def, this.pieces);
    c.quats = this.quats.map((q) => q.slice());
    return c;
  }

  position(i) {
    return rotate(this.quats[i], this.pieces[i].center);
  }

  // Calcula o giro sem aplicar: eixo, ângulo e quais peças se mexem
  plan(mv) {
    const m = this.def.moves[mv.name];
    if (!m) throw new Error(`Movimento desconhecido: ${mv.name}`);
    const axis = norm(m.axis);
    const angle = (-mv.turns * 2 * Math.PI) / m.order;
    const ids = [];
    for (let i = 0; i < this.pieces.length; i++) {
      if (dot(this.position(i), axis) > m.dist) ids.push(i);
    }
    return { axis, angle, ids, move: m };
  }

  apply(mv) {
    const p = this.plan(mv);
    const q = quatAxisAngle(p.axis, p.angle);
    for (const i of p.ids) this.quats[i] = quatNormalize(quatMul(q, this.quats[i]));
    return p;
  }

  applyAlg(text) {
    for (const mv of typeof text === 'string' ? parseAlg(text) : text) this.apply(mv);
  }

  // Normal atual de um adesivo
  stickerNormal(i, s) {
    return rotate(this.quats[i], this.pieces[i].stickers[s].normal);
  }

  stickerOk(i, s) {
    return dot(this.stickerNormal(i, s), this.pieces[i].stickers[s].normal) > 0.999;
  }

  // Resolvido = todo adesivo aponta para a face de origem.
  // filtro(peça, face) limita a checagem a parte dos adesivos.
  isSolved(filter = null) {
    for (let i = 0; i < this.pieces.length; i++) {
      const p = this.pieces[i];
      for (let s = 0; s < p.stickers.length; s++) {
        if (filter && !filter(p, p.stickers[s].face)) continue;
        if (!this.stickerOk(i, s)) return false;
      }
    }
    return true;
  }

  // Em qual face (do quebra-cabeça parado) cada adesivo está agora
  whereIs(i) {
    const faces = this.def.faces;
    return this.pieces[i].stickers.map((st, s) => {
      const n = this.stickerNormal(i, s);
      let best = null;
      let bd = -2;
      for (const f of faces) {
        const d = dot(n, norm(f.normal));
        if (d > bd) {
          bd = d;
          best = f.name;
        }
      }
      return { from: st.face, now: best };
    });
  }
}

export function scaleVec(v, s) {
  return scale(v, s);
}
