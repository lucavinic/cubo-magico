// Transforma as cores que a pessoa pintou (uma por adesivo, com o
// quebra-cabeça "parado" na posição montada) no estado das peças.
// Também diz, em português, o que está errado quando a pintura não fecha.

import { cross, dot, len, norm, scale, sub, rotate } from '../engine/math.js';

const sortKey = (faces) => faces.slice().sort().join(',');
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);

// rotação que leva a1->b1 e a2->b2 (vetores unitários), como quatérnio
function rotationFrom(a1, a2, b1, b2) {
  const frame = (u, v) => {
    const e1 = norm(u);
    const e2 = norm(sub(v, scale(e1, dot(v, e1))));
    return [e1, e2, cross(e1, e2)];
  };
  const A = frame(a1, a2);
  const B = frame(b1, b2);
  // M = B * A^T
  const m = [0, 1, 2].map((r) => [0, 1, 2].map((c) => A[0][c] * B[0][r] + A[1][c] * B[1][r] + A[2][c] * B[2][r]));
  const tr = m[0][0] + m[1][1] + m[2][2];
  let q;
  if (tr > 0) {
    const s = Math.sqrt(tr + 1) * 2;
    q = [(m[2][1] - m[1][2]) / s, (m[0][2] - m[2][0]) / s, (m[1][0] - m[0][1]) / s, s / 4];
  } else if (m[0][0] > m[1][1] && m[0][0] > m[2][2]) {
    const s = Math.sqrt(1 + m[0][0] - m[1][1] - m[2][2]) * 2;
    q = [s / 4, (m[0][1] + m[1][0]) / s, (m[0][2] + m[2][0]) / s, (m[2][1] - m[1][2]) / s];
  } else if (m[1][1] > m[2][2]) {
    const s = Math.sqrt(1 + m[1][1] - m[0][0] - m[2][2]) * 2;
    q = [(m[0][1] + m[1][0]) / s, s / 4, (m[1][2] + m[2][1]) / s, (m[0][2] - m[2][0]) / s];
  } else {
    const s = Math.sqrt(1 + m[2][2] - m[0][0] - m[1][1]) * 2;
    q = [(m[0][2] + m[2][0]) / s, (m[1][2] + m[2][1]) / s, s / 4, (m[1][0] - m[0][1]) / s];
  }
  const l = Math.hypot(...q);
  return q.map((x) => x / l);
}

// paint[slot] = nome da face (cor) pintada naquele adesivo, ou null
// pieceName(i) = nome da peça para as mensagens; colorName(face) = nome da cor
export function stateFromColors(fast, pieces, paint, pieceName, colorName) {
  const missing = paint.filter((c) => !c).length;
  if (missing) return { error: `Faltam ${missing} quadradinho(s) para pintar.` };

  // cada cor tem que aparecer o número certo de vezes
  const want = {};
  const got = {};
  fast.slots.forEach((sl, k) => {
    want[sl.face] = (want[sl.face] || 0) + 1;
    got[paint[k]] = (got[paint[k]] || 0) + 1;
  });
  const counts = Object.keys(want)
    .filter((f) => (got[f] || 0) !== want[f])
    .map((f) => `${colorName(f)}: ${got[f] || 0} (devem ser ${want[f]})`);
  if (counts.length) return { error: `A quantidade de cores não bate. ${counts.join('; ')}.` };

  const orbit = (p) => `${p.stickers.length}:${len(p.center).toFixed(2)}`;
  const state = new Int16Array(fast.size);
  const quats = pieces.map(() => [0, 0, 0, 1]);
  const used = new Map();

  for (let i = 0; i < pieces.length; i++) {
    const slotsHere = fast.pieceSlots[i];
    if (!slotsHere.length) continue;
    const colors = slotsHere.map((k) => paint[k]);
    if (new Set(colors).size !== colors.length) {
      return { error: `Uma peça ficou com a mesma cor duas vezes (${colors.map(colorName).join('-')}). Confira a pintura.` };
    }
    const j = pieces.findIndex((p) => orbit(p) === orbit(pieces[i]) && sortKey(p.faces) === sortKey(colors));
    if (j < 0) {
      return { error: `Existe uma peça ${colors.map(colorName).join('-')}, mas ela não existe neste quebra-cabeça. Confira essas cores.` };
    }
    if (used.has(j)) return { error: `${cap(pieceName(j))} aparece duas vezes. Alguma cor foi pintada trocada.` };
    used.set(j, i);

    // qual adesivo da peça j foi para cada lugar
    const pairs = slotsHere.map((k) => {
      const s = pieces[j].stickers.findIndex((st) => st.face === paint[k]);
      state[k] = fast.pieceSlots[j][s];
      return { from: pieces[j].stickers[s].normal, to: pieces[i].stickers[slotsHere.indexOf(k)].normal };
    });

    if (pairs.length === 1) {
      if (i !== j) return { error: 'Um centro ficou com a cor errada.' };
      continue;
    }
    const q = rotationFrom(pairs[0].from, pairs[1].from, pairs[0].to, pairs[1].to);
    // confere todos os adesivos e a posição: com as cores em ordem impossível não fecha
    const ok =
      pairs.every((pr) => dot(rotate(q, pr.from), pr.to) > 0.99) && len(sub(rotate(q, pieces[j].center), pieces[i].center)) < 1e-3;
    if (!ok) {
      return { error: `${cap(pieceName(j))} está com as cores numa ordem que não existe. Confira as cores dessa peça.` };
    }
    quats[j] = q;
  }
  return { state, quats };
}
