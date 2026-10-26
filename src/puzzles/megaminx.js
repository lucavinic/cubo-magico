// Megaminx: dodecaedro com 12 faces. Uma face em cima (U), um anel de 5
// faces logo abaixo dela, outro anel de 5 faces embaixo e a face D.

const RI = 1.7; // distância do centro até cada face
const THETA = Math.acos(1 / Math.sqrt(5)); // ângulo entre faces vizinhas

function dir(polar, azimuthDeg) {
  const a = (azimuthDeg * Math.PI) / 180;
  return [Math.sin(polar) * Math.sin(a), Math.cos(polar), Math.sin(polar) * Math.cos(a)];
}

const FACE_LIST = [
  { name: 'U', normal: [0, 1, 0], color: '#c9c9c9', label: 'de cima', cor: 'cinza' },
  { name: 'F', normal: dir(THETA, 0), color: '#12a150', label: 'da frente', cor: 'verde' },
  { name: 'R', normal: dir(THETA, 72), color: '#d81f26', label: 'da direita', cor: 'vermelho' },
  { name: 'BR', normal: dir(THETA, 144), color: '#1e5bd6', label: 'de trás à direita', cor: 'azul' },
  { name: 'BL', normal: dir(THETA, 216), color: '#ffd500', label: 'de trás à esquerda', cor: 'amarelo' },
  { name: 'L', normal: dir(THETA, 288), color: '#7d3cc8', label: 'da esquerda', cor: 'roxo' },
  { name: 'DR', normal: dir(Math.PI - THETA, 36), color: '#ff8fc4', label: 'de baixo à direita', cor: 'rosa' },
  { name: 'DBR', normal: dir(Math.PI - THETA, 108), color: '#ff7a00', label: 'de baixo, atrás à direita', cor: 'laranja' },
  { name: 'B', normal: dir(Math.PI - THETA, 180), color: '#97e04a', label: 'de trás (embaixo)', cor: 'verde-claro' },
  { name: 'DBL', normal: dir(Math.PI - THETA, 252), color: '#5fcdff', label: 'de baixo, atrás à esquerda', cor: 'azul-claro' },
  { name: 'DL', normal: dir(Math.PI - THETA, 324), color: '#f4e7a6', label: 'de baixo à esquerda', cor: 'creme' },
  { name: 'D', normal: [0, -1, 0], color: '#ffffff', label: 'de baixo', cor: 'branco' },
];

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
  moveGroups: [
    ['U', 'F', 'R', 'L', 'BR', 'BL'],
    ['D', 'DR', 'DL', 'DBR', 'DBL', 'B'],
  ],
  camera: { position: [1.8, 3.4, 5.4] },
  scrambleLength: 40,
  radius: RI * 1.26,
};
