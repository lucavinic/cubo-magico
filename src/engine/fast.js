// Modelo rápido para o resolvedor: cada adesivo tem um "lugar" (slot) e o
// estado diz qual adesivo está em cada lugar. Um giro vira uma permutação
// de lugares, calculada uma vez a partir da geometria.

import { dot, norm, len, sub, rotate, quatAxisAngle } from './math.js';

export function buildFast(def, pieces) {
  const slots = []; // { piece, sticker, center, face }
  const pieceSlots = []; // lugares de cada peça (na ordem dos adesivos)
  pieces.forEach((p, i) => {
    pieceSlots.push(
      p.stickers.map((st, s) => {
        slots.push({ piece: i, sticker: s, center: st.center, face: st.face });
        return slots.length - 1;
      }),
    );
  });
  const findSlot = (c) => {
    let best = -1;
    let bd = Infinity;
    for (let k = 0; k < slots.length; k++) {
      const d = len(sub(slots[k].center, c));
      if (d < bd) {
        bd = d;
        best = k;
      }
    }
    return best;
  };

  // permutação de 1 giro (sentido horário) de cada movimento
  const quarter = {};
  for (const [name, m] of Object.entries(def.moves)) {
    const axis = norm(m.axis);
    const q = quatAxisAngle(axis, (-2 * Math.PI) / m.order);
    const map = new Int16Array(slots.length);
    for (let k = 0; k < slots.length; k++) {
      const pc = pieces[slots[k].piece].center;
      map[k] = dot(pc, axis) > m.dist ? findSlot(rotate(q, slots[k].center)) : k;
    }
    quarter[name] = map;
  }

  const mapCache = new Map();
  function moveMap(name, turns) {
    const order = def.moves[name].order;
    const t = ((turns % order) + order) % order;
    const key = name + ':' + t;
    if (mapCache.has(key)) return mapCache.get(key);
    let map = Int16Array.from({ length: slots.length }, (_, k) => k);
    for (let i = 0; i < t; i++) {
      const q = quarter[name];
      map = map.map((v) => q[v]);
    }
    mapCache.set(key, map);
    return map;
  }

  const n = slots.length;
  return {
    def,
    pieces,
    slots,
    pieceSlots,
    size: n,
    solved: () => Int16Array.from({ length: n }, (_, k) => k),
    // estado[k] = adesivo que está no lugar k
    apply(state, mv) {
      const map = moveMap(mv.name, mv.turns);
      const out = new Int16Array(n);
      for (let k = 0; k < n; k++) out[map[k]] = state[k];
      return out;
    },
    applyAll(state, moves) {
      let s = state;
      for (const mv of moves) s = this.apply(s, mv);
      return s;
    },
    moveMap,
    // lugares atuais dos adesivos de uma peça
    placement(state, piece) {
      const want = pieceSlots[piece];
      const out = new Array(want.length);
      for (let k = 0; k < n; k++) {
        const idx = want.indexOf(state[k]);
        if (idx >= 0) out[idx] = k;
      }
      return out;
    },
    pieceSolved(state, piece) {
      return pieceSlots[piece].every((k) => state[k] === k);
    },
    // peça no lugar certo, mesmo que girada
    piecePlaced(state, piece) {
      const home = pieceSlots[piece];
      return home.every((k) => slots[state[k]].piece === piece);
    },
    faceAt(state, slot) {
      return slots[state[slot]].face;
    },
  };
}
