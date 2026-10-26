// Cubos 3x3 e 2x2. Branco embaixo, amarelo em cima, verde na frente.

// Cores bem separadas entre si: laranja puxado para o amarelo e vermelho
// mais escuro, para não confundir os dois.
const COLORS = {
  U: '#ffd60a', // amarelo
  D: '#f7f7f7', // branco
  F: '#00a651', // verde
  B: '#0b5cff', // azul
  R: '#ff7b00', // laranja
  L: '#c8102e', // vermelho
};

export const COLOR_NAMES = {
  U: 'amarelo',
  D: 'branco',
  F: 'verde',
  B: 'azul',
  R: 'laranja',
  L: 'vermelho',
};

const AXES = {
  U: [0, 1, 0],
  D: [0, -1, 0],
  R: [1, 0, 0],
  L: [-1, 0, 0],
  F: [0, 0, 1],
  B: [0, 0, -1],
};

const FACE_LABEL = {
  U: 'de cima',
  D: 'de baixo',
  R: 'da direita',
  L: 'da esquerda',
  F: 'da frente',
  B: 'de trás',
};

const WHERE = { U: 'Cima', D: 'Baixo', F: 'Frente', B: 'Trás', R: 'Direita', L: 'Esquerda' };

// Direção "para onde vai" vista de frente, para cada giro horário
const CLOCKWISE_HINT = {
  R: 'para cima (a coluna da direita sobe)',
  L: 'para baixo (a coluna da esquerda desce)',
  U: 'para a esquerda (o topo vai para a esquerda)',
  D: 'para a direita (a base vai para a direita)',
  F: 'no sentido horário, como um volante virando para a direita',
  B: 'no sentido horário olhando por trás (de frente parece que vai para a esquerda)',
};
const COUNTER_HINT = {
  R: 'para baixo (a coluna da direita desce)',
  L: 'para cima (a coluna da esquerda sobe)',
  U: 'para a direita (o topo vai para a direita)',
  D: 'para a esquerda (a base vai para a esquerda)',
  F: 'no sentido anti-horário, como um volante virando para a esquerda',
  B: 'no sentido anti-horário olhando por trás',
};

function describeCube(mv) {
  const a = Math.abs(mv.turns);
  const where = `${FACE_LABEL[mv.name]} (${COLOR_NAMES[mv.name]})`;
  if (a === 2) return `Gire a face ${where} meia volta (180°). Tanto faz o lado.`;
  const hint = mv.turns > 0 ? CLOCKWISE_HINT[mv.name] : COUNTER_HINT[mv.name];
  return `Gire a face ${where} ${hint}.`;
}

const LEGEND = ['F', 'R', 'U', 'L', 'B', 'D'].map((k) => ({
  letter: k,
  where: WHERE[k],
  color: COLORS[k],
  colorName: COLOR_NAMES[k],
}));

function cube(n) {
  const h = n / 2; // meia aresta (cada peça mede 1)
  const faces = Object.keys(AXES).map((name) => ({
    name,
    normal: AXES[name],
    dist: h,
    color: COLORS[name],
  }));
  const cuts = [];
  for (const ax of [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]) {
    for (let k = 1; k < n; k++) cuts.push({ normal: ax, dist: -h + k });
  }
  const moves = {};
  for (const [name, axis] of Object.entries(AXES)) {
    moves[name] = {
      axis,
      dist: h - 1 + 0.01, // só a camada de fora (além do último corte)
      order: 4,
      arrow: { height: h + 0.12, radius: h * 0.62 },
    };
  }
  return {
    faces,
    cuts,
    moves,
    describe: describeCube,
    colorNames: COLOR_NAMES,
    legend: LEGEND,
    moveGroups: [['U', 'D'], ['R', 'L'], ['F', 'B']],
    camera: { position: [n * 1.55, n * 1.35, n * 2.2] },
    scrambleLength: n === 2 ? 11 : 22,
    radius: h * Math.sqrt(3),
  };
}

export const cube3Def = { id: 'cubo3', name: 'Cubo 3x3', ...cube(3) };
export const cube2Def = { id: 'cubo2', name: 'Cubo 2x2', ...cube(2) };
