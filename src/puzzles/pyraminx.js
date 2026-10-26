// Pyraminx: tetraedro com um vértice para cima (U), dois na frente
// (L e R) e um atrás (B). Cada face é oposta a um vértice.

import { norm, scale } from '../engine/math.js';

const R = 2.3; // distância do centro até a ponta
const r = (2 * Math.SQRT2 * R) / 3;
const VERT = {
  U: [0, R, 0],
  L: [-r * Math.sin(Math.PI / 3), -R / 3, r / 2],
  R: [r * Math.sin(Math.PI / 3), -R / 3, r / 2],
  B: [0, -R / 3, -r],
};

// face oposta a cada vértice
const FACES = [
  { name: 'F', opposite: 'B', color: '#00a651', where: 'Frente' }, // verde
  { name: 'E', opposite: 'R', color: '#e0162b', where: 'Esquerda' }, // vermelho
  { name: 'Di', opposite: 'L', color: '#0b5cff', where: 'Direita' }, // azul
  { name: 'Y', opposite: 'U', color: '#ffd60a', where: 'Base (embaixo)' }, // amarelo
];

export const PYRA_COLOR_NAMES = { F: 'verde', E: 'vermelho', Di: 'azul', Y: 'amarelo' };

const VERT_LABEL = {
  U: 'de cima',
  L: 'da esquerda',
  R: 'da direita',
  B: 'de trás',
};

const LEGEND = FACES.map((f) => ({
  letter: f.name,
  where: f.where,
  color: f.color,
  colorName: { F: 'verde', E: 'vermelho', Di: 'azul', Y: 'amarelo' }[f.name],
}));

function describe(mv) {
  const tip = mv.name === mv.name.toLowerCase();
  const v = mv.name.toUpperCase();
  const dir = mv.turns > 0 ? 'horário' : 'anti-horário';
  const what = tip ? `só a pontinha ${VERT_LABEL[v]}` : `a camada do vértice ${VERT_LABEL[v]} (ponta + centro)`;
  return `Gire ${what} 1/3 de volta, sentido ${dir} olhando para essa ponta.`;
}

const faces = FACES.map((f) => ({
  name: f.name,
  normal: scale(norm(VERT[f.opposite]), -1),
  dist: R / 3,
  color: f.color,
}));

const cuts = [];
const moves = {};
for (const [name, v] of Object.entries(VERT)) {
  cuts.push({ normal: v, dist: (5 * R) / 9 });
  cuts.push({ normal: v, dist: R / 9 });
  moves[name] = { axis: v, dist: R / 9 + 0.01, order: 3, arrow: { height: R * 0.36, radius: R * 0.62 } };
  moves[name.toLowerCase()] = {
    axis: v,
    dist: (5 * R) / 9 + 0.01,
    order: 3,
    arrow: { height: R * 0.74, radius: R * 0.3 },
  };
}

export const pyraminxDef = {
  id: 'pyraminx',
  name: 'Pyraminx (pirâmide)',
  faces,
  cuts,
  moves,
  describe,
  colorNames: PYRA_COLOR_NAMES,
  legend: LEGEND,
  moveGroups: [['U', 'L', 'R', 'B'], ['u', 'l', 'r', 'b']],
  camera: { position: [2.9, 1.4, 4.6] },
  // letras nas pontas, que é o que a notação usa
  labels: Object.entries(VERT).map(([text, v]) => ({ text, position: scale(v, 1.22) })),
  scrambleLength: 12,
  radius: R,
};
