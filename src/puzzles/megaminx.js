// Megaminx: dodecaedro com 12 faces. Uma face em cima (U), um anel de 5
// faces logo abaixo dela, outro anel de 5 faces embaixo e a face D.

const RI = 1.7; // distância do centro até cada face
const THETA = Math.acos(1 / Math.sqrt(5)); // ângulo entre faces vizinhas

function dir(polar, azimuthDeg) {
  const a = (azimuthDeg * Math.PI) / 180;
  return [Math.sin(polar) * Math.sin(a), Math.cos(polar), Math.sin(polar) * Math.cos(a)];
}

const FACE_LIST = [
  { name: 'U', normal: [0, 1, 0], color: '#b4b9c2', label: 'de cima', cor: 'cinza' },
  { name: 'F', normal: dir(THETA, 0), color: '#00a651', label: 'da frente', cor: 'verde' },
  { name: 'R', normal: dir(THETA, 72), color: '#d0112b', label: 'da direita', cor: 'vermelho' },
  { name: 'BR', normal: dir(THETA, 144), color: '#0b4fe0', label: 'de trás à direita', cor: 'azul' },
  { name: 'BL', normal: dir(THETA, 216), color: '#ffd60a', label: 'de trás à esquerda', cor: 'amarelo' },
  { name: 'L', normal: dir(THETA, 288), color: '#8a3ffc', label: 'da esquerda', cor: 'roxo' },
  { name: 'DR', normal: dir(Math.PI - THETA, 36), color: '#ff6fb5', label: 'de baixo à direita', cor: 'rosa' },
  { name: 'DBR', normal: dir(Math.PI - THETA, 108), color: '#ff7b00', label: 'de baixo, atrás à direita', cor: 'laranja' },
  { name: 'B', normal: dir(Math.PI - THETA, 180), color: '#9be22d', label: 'de trás (embaixo)', cor: 'verde-limão' },
  { name: 'DBL', normal: dir(Math.PI - THETA, 252), color: '#4fd2ff', label: 'de baixo, atrás à esquerda', cor: 'azul-claro' },
  { name: 'DL', normal: dir(Math.PI - THETA, 324), color: '#a0682e', label: 'de baixo à esquerda', cor: 'marrom' },
  { name: 'D', normal: [0, -1, 0], color: '#ffffff', label: 'de baixo', cor: 'branco' },
];

const WHERE = {
  U: 'Cima', F: 'Frente', R: 'Direita', L: 'Esquerda', BR: 'Trás-direita', BL: 'Trás-esquerda',
  DR: 'Baixo-direita', DL: 'Baixo-esquerda', DBR: 'Baixo-trás-direita', DBL: 'Baixo-trás-esquerda', B: 'Trás (baixo)', D: 'Baixo',
};
const LEGEND = FACE_LIST.map((f) => ({ letter: f.name, where: WHERE[f.name], color: f.color, colorName: f.cor }));

export const MEGA_COLOR_NAMES = Object.fromEntries(FACE_LIST.map((f) => [f.name, f.cor]));
const LABEL = Object.fromEntries(FACE_LIST.map((f) => [f.name, f.label]));

export const MEGA_CUT = 0.62; // fração da distância até a face onde fica o corte

function describe(mv) {
  const a = Math.abs(mv.turns);
  const dirTxt = mv.turns > 0 ? 'horário' : 'anti-horário';
  const amount = a === 1 ? '1/5 de volta (72°)' : `${a}/5 de volta (${a * 72}°)`;
  return `Gire a face ${LABEL[mv.name]} (${MEGA_COLOR_NAMES[mv.name]}) ${amount}, sentido ${dirTxt} olhando para ela.`;
}

const faces = FACE_LIST.map((f) => ({ name: f.name, normal: f.normal, dist: RI, color: f.color }));
const cuts = FACE_LIST.map((f) => ({ normal: f.normal, dist: RI * MEGA_CUT }));
const moves = Object.fromEntries(
  FACE_LIST.map((f) => [
    f.name,
    { axis: f.normal, dist: RI * MEGA_CUT + 0.01, order: 5, arrow: { height: RI + 0.1, radius: RI * 0.5 } },
  ]),
);

export const megaminxDef = {
  id: 'megaminx',
  name: 'Megaminx (12 faces)',
  faces,
  cuts,
  moves,
  describe,
  colorNames: MEGA_COLOR_NAMES,
  legend: LEGEND,
  moveGroups: [
    ['U', 'F', 'R', 'L', 'BR', 'BL'],
    ['D', 'DR', 'DL', 'DBR', 'DBL', 'B'],
  ],
  camera: { position: [1.8, 3.4, 5.4] },
  scrambleLength: 40,
  radius: RI * 1.26,
};
