// Etapas do "Montar comigo" para cada quebra-cabeça, com os mesmos
// algoritmos das lições e textos para quem nunca montou um cubo.

const key = (faces) => faces.slice().sort().join(',');

function finder(pieces) {
  return (...faces) => {
    const i = pieces.findIndex((p) => key(p.faces) === key(faces));
    if (i < 0) throw new Error('Peça não encontrada: ' + faces.join('-'));
    return i;
  };
}

const ARTIGO = { aresta: 'a', ponta: 'a', canto: 'o', centro: 'o' };
export const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);

// "a aresta branco-verde", "o canto branco-verde-laranja"...
function namer(def, pieces, kindOf, order) {
  return (i) => {
    const p = pieces[i];
    const kind = kindOf(p);
    const faces = p.faces.slice().sort((a, b) => order.indexOf(a) - order.indexOf(b));
    return `${ARTIGO[kind]} ${kind} ${faces.map((f) => def.colorNames[f]).join('-')}`;
  };
}

const cubeKind = (p) => (p.faces.length === 3 ? 'canto' : p.faces.length === 2 ? 'aresta' : 'centro');

// textos padrão de uma etapa "peça por peça"
function texts(extra) {
  return {
    extract: (n) => `A peça da vez (${n}) está presa num lugar errado. Primeiro vamos tirá-la de lá.`,
    bring: (n) => `Leve ${n} para a posição de encaixe. Siga a seta.`,
    direct: (n) => `Leve ${n} até o lugar certo. Siga a seta.`,
    insert: (n, t) => `Agora encaixe ${n}: ${t.label}.`,
    adjust: 'Gire o topo para deixar na posição certa.',
    ...extra,
  };
}

function cube3(def, pieces) {
  const f = finder(pieces);
  const uEdges = [f('U', 'F'), f('U', 'R'), f('U', 'B'), f('U', 'L')];
  const uCorners = [f('U', 'F', 'R'), f('U', 'R', 'B'), f('U', 'B', 'L'), f('U', 'L', 'F')];
  const ufr = f('U', 'F', 'R');
  return {
    symmetry: 4,
    turns: [1, -1, 2],
    alwaysSolved: pieces.map((p, i) => i).filter((i) => pieces[i].faces.length === 1),
    pieceName: namer(def, pieces, cubeKind, ['D', 'U', 'F', 'R', 'B', 'L']),
    stages: [
      {
        id: 'cruz',
        title: 'Cruz branca',
        intro: 'Vamos fazer uma cruz branca embaixo, uma aresta de cada vez. Cada aresta branca tem que ficar com a outra cor combinando com o centro do lado.',
        kind: 'pieces',
        targets: [f('D', 'F'), f('D', 'R'), f('D', 'B'), f('D', 'L')],
        texts: texts({ done: 'A cruz branca está pronta! Olhe embaixo: um "+" branco, e cada lateral combinando com o centro.' }),
      },
      {
        id: 'cantos',
        title: 'Cantos brancos',
        intro: 'Agora os 4 cantos brancos. Cada um sobe para cima do lugar dele e desce com o algoritmo R U R\' U\' (repetido).',
        kind: 'pieces',
        targets: [f('D', 'F', 'R'), f('D', 'R', 'B'), f('D', 'B', 'L'), f('D', 'L', 'F')],
        templates: [1, 3, 5].map((k) => ({ alg: `(R U R' U')${k}`, one: "R U R' U'", reps: k, target: f('D', 'F', 'R') })),
        texts: texts({
          bring: (n) => `Gire o topo para levar ${n} até em cima do lugar certo.`,
          insert: (n, t) => `Encaixe ${n}: ${t.label}.`,
          extract: (n) => `${cap(n)} está embaixo, mas no lugar errado ou torto. Primeiro vamos tirá-lo de lá.`,
          done: 'A face branca está pronta, e a primeira camada também!',
        }),
      },
      {
        id: 'meio',
        title: 'Segunda camada',
        intro: 'Agora as 4 arestas do meio (as que não têm amarelo).',
        kind: 'pieces',
        targets: [f('F', 'R'), f('R', 'B'), f('B', 'L'), f('L', 'F')],
        templates: [
          { alg: "U R U' R' U' F' U F", target: f('F', 'R') },
          { alg: "U' L' U L U F U' F'", target: f('F', 'L') },
        ],
        texts: texts({
          bring: (n) => `Gire o topo até ${n} ficar em cima, pronta para encaixar.`,
          insert: (n, t) => `Encaixe ${n}: ${t.label}.`,
          extract: (n) => `${cap(n)} está no meio, mas no lugar errado. Primeiro vamos tirá-la de lá.`,
          done: 'Duas camadas prontas! Só falta o topo amarelo.',
        }),
      },
      {
        id: 'cruz-amarela',
        title: 'Cruz amarela',
        intro: 'Agora vamos fazer uma cruz amarela em cima. Os lados ainda não importam.',
        kind: 'macro',
        algs: [{ alg: "F R U R' U' F'", text: 'Faça F R U R\' U\' F\' para virar as arestas amarelas para cima.' }],
        singles: ["U", "U'", 'U2'],
        goal: (fast, s) => uEdges.every((p) => fast.pieceSlots[p].some((k) => fast.slots[k].face === 'U' && fast.faceAt(s, k) === 'U')),
        solves: [],
        maxDepth: 6,
        texts: texts({ adjust: 'Gire o topo para deixar o desenho amarelo na posição certa.', done: 'Cruz amarela pronta!' }),
      },
      {
        id: 'arestas-amarelas',
        title: 'Arestas amarelas',
        intro: 'Agora cada aresta amarela tem que combinar com o centro do lado.',
        kind: 'macro',
        algs: [{ alg: "R U R' U R U2 R'", rotate: true, text: 'Faça o algoritmo para trocar as arestas de lugar.' }],
        singles: ["U", "U'", 'U2'],
        goal: (fast, s) => uEdges.every((p) => fast.pieceSolved(s, p)),
        solves: uEdges,
        maxDepth: 5,
        texts: texts({ adjust: 'Gire o topo para alinhar as arestas com os centros.', done: 'Todas as arestas estão no lugar!' }),
      },
      {
        id: 'cantos-lugar',
        title: 'Cantos amarelos no lugar',
        intro: 'Agora cada canto de cima vai para o lugar dele (ainda pode ficar torto).',
        kind: 'macro',
        algs: [{ alg: "U R U' L' U R' U' L", rotate: true, text: 'Este algoritmo troca 3 cantos de lugar, em roda.' }],
        singles: [],
        goal: (fast, s) => uCorners.every((p) => fast.piecePlaced(s, p)),
        solves: [],
        maxDepth: 3,
        texts: texts({ done: 'Os cantos estão nos lugares certos!' }),
      },
      {
        id: 'girar',
        title: 'Girar os cantos',
        intro: 'Último passo! Não vire o cubo. A base vai bagunçar no meio do caminho e voltar sozinha.',
        kind: 'twist',
        trig: "R' D' R D",
        up: 'U',
        count: 4,
        upFace: 'U',
        watchSlot: null, // preenchido abaixo
        alignCheck: uEdges[0],
        solves: [...uEdges, ...uCorners],
        texts: texts({
          twist: (r) => `Repita R' D' R D até o amarelo deste canto ficar em cima (${r} vezes). Não se assuste com a base!`,
          next: 'Gire só o topo para trazer o próximo canto para a frente-direita.',
          align: 'Gire o topo para alinhar com as laterais.',
          done: 'CUBO MONTADO! Parabéns!',
        }),
      },
    ],
    ufr,
  };
}

function cube2(def, pieces) {
  const f = finder(pieces);
  const uCorners = [f('U', 'F', 'R'), f('U', 'R', 'B'), f('U', 'B', 'L'), f('U', 'L', 'F')];
  return {
    symmetry: 4,
    turns: [1, -1, 2],
    alwaysSolved: [],
    pieceName: namer(def, pieces, cubeKind, ['D', 'U', 'F', 'R', 'B', 'L']),
    stages: [
      {
        id: 'camada',
        title: 'Primeira camada branca',
        intro: 'Vamos montar os 4 cantos brancos embaixo, um de cada vez.',
        kind: 'pieces',
        targets: [f('D', 'F', 'R'), f('D', 'R', 'B'), f('D', 'B', 'L'), f('D', 'L', 'F')],
        templates: [1, 3, 5].map((k) => ({ alg: `(R U R' U')${k}`, one: "R U R' U'", reps: k, target: f('D', 'F', 'R') })),
        texts: texts({
          bring: (n) => `Gire o topo para levar ${n} até em cima do lugar certo.`,
          insert: (n, t) => `Encaixe ${n}: ${t.label}.`,
          extract: (n) => `${cap(n)} está embaixo, mas no lugar errado ou torto. Primeiro vamos tirá-lo de lá.`,
          direct: (n) => `Leve ${n} até o lugar certo. Siga a seta.`,
          done: 'Primeira camada pronta!',
        }),
      },
      {
        id: 'cantos-lugar',
        title: 'Cantos de cima no lugar',
        intro: 'Agora cada canto de cima vai para o lugar dele (ainda pode ficar torto).',
        kind: 'macro',
        algs: [{ alg: "U R U' L' U R' U' L", rotate: true, text: 'Este algoritmo troca 3 cantos de lugar, em roda.' }],
        singles: ["U", "U'", 'U2'],
        goal: (fast, s) => uCorners.every((p) => fast.piecePlaced(s, p)),
        solves: [],
        maxDepth: 4,
        texts: texts({ adjust: 'Gire o topo.', done: 'Os cantos de cima estão nos lugares certos!' }),
      },
      {
        id: 'girar',
        title: 'Girar os cantos',
        intro: 'Último passo! Não vire o cubo. A base vai bagunçar no caminho e voltar sozinha.',
        kind: 'twist',
        trig: "R' D' R D",
        up: 'U',
        count: 4,
        upFace: 'U',
        watchSlot: null,
        alignCheck: uCorners[0],
        solves: uCorners,
        texts: texts({
          twist: (r) => `Repita R' D' R D até o amarelo deste canto ficar em cima (${r} vezes).`,
          next: 'Gire só o topo para trazer o próximo canto para a frente-direita.',
          align: 'Gire o topo para alinhar.',
          done: 'CUBO MONTADO! Parabéns!',
        }),
      },
    ],
    ufr: f('U', 'F', 'R'),
  };
}

function pyraminx(def, pieces) {
  const dist = (i) => Math.hypot(...pieces[i].center);
  const ids = pieces.map((p, i) => i);
  const tips = ids.filter((i) => pieces[i].faces.length === 3 && dist(i) > 1.2);
  const axials = ids.filter((i) => pieces[i].faces.length === 3 && dist(i) <= 1.2);
  const edges = ids.filter((i) => pieces[i].faces.length === 2);
  const bottom = edges.filter((i) => pieces[i].faces.includes('Y'));
  const kind = (p) => (p.faces.length === 2 ? 'aresta' : Math.hypot(...p.center) > 1.2 ? 'ponta' : 'centro');
  return {
    symmetry: 3,
    turns: [1, -1],
    alwaysSolved: [],
    pieceName: namer(def, pieces, kind, ['Y', 'F', 'E', 'Di']),
    stages: [
      {
        id: 'centros',
        title: 'Centros',
        intro: 'Primeiro os 4 centros (as peças de 3 cores logo abaixo das pontas). Cada um só gira no lugar.',
        kind: 'pieces',
        targets: axials,
        texts: texts({ direct: (n) => `Gire a camada até ${n} ficar com as cores certas.`, done: 'Centros prontos!' }),
      },
      {
        id: 'pontas',
        title: 'Pontas',
        intro: 'Agora gire cada pontinha para combinar com o centro logo abaixo dela.',
        kind: 'pieces',
        targets: tips,
        texts: texts({ direct: (n) => `Gire ${n} até ela combinar com o centro logo abaixo.`, done: 'Pontas prontas!' }),
      },
      {
        id: 'base',
        title: 'Base amarela',
        intro: 'Agora as 3 arestas da base amarela, uma de cada vez.',
        kind: 'search',
        targets: bottom,
        moves: ['U', 'L', 'R', 'B'],
        maxDepth: 8,
        texts: texts({ piece: (n) => `Leve ${n} para o lugar certo, embaixo. Siga as setas.`, done: 'Base amarela pronta!' }),
      },
      {
        id: 'ultimas',
        title: 'Últimas arestas',
        intro: 'Faltam só as 3 arestas de cima.',
        kind: 'macro',
        algs: [
          { alg: "R U' R' U' R U' R'", rotate: true, text: 'Este algoritmo roda as 3 arestas de cima.' },
          { alg: "R' U R U R' U R", rotate: true, text: 'Este algoritmo roda as 3 arestas para o outro lado.' },
          { alg: "R' L R L' U L' U' L", rotate: true, text: 'Este algoritmo vira duas arestas no lugar.' },
        ],
        singles: [],
        goal: (fast, s) => edges.every((p) => fast.pieceSolved(s, p)),
        solves: edges,
        maxDepth: 3,
        texts: texts({ done: 'PYRAMINX MONTADA! Parabéns!' }),
      },
    ],
    noTwist: true,
  };
}

function megaminx(def, pieces) {
  const f = finder(pieces);
  const ids = pieces.map((p, i) => i);
  const y = (i) => pieces[i].center[1];
  const n = (i) => pieces[i].faces.length;
  // em volta do eixo, começando pela frente
  const ang = (i) => (Math.atan2(pieces[i].center[0], pieces[i].center[2]) + 2 * Math.PI + 0.01) % (2 * Math.PI);
  const sortAround = (list) => list.sort((a, b) => ang(a) - ang(b));
  const layer = (lo, hi, k) => sortAround(ids.filter((i) => n(i) === k && y(i) > lo && y(i) < hi));
  const dEdges = layer(-2, -1.2, 2);
  const dCorners = layer(-2, -1.2, 3);
  const llEdges = layer(-1, -0.7, 2);
  const type2 = layer(-0.5, -0.2, 3);
  const equator = layer(-0.1, 0.1, 2);
  const type3 = layer(0.2, 0.5, 3);
  const upperEdges = layer(0.7, 1, 2);
  const uEdges = layer(1.2, 2, 2);
  const uCorners = layer(1.2, 2, 3);
  const order = ['D', 'U', 'F', 'R', 'L', 'BR', 'BL', 'DR', 'DL', 'DBR', 'DBL', 'B'];
  return {
    symmetry: 5,
    turns: [1, -1, 2, -2],
    alwaysSolved: ids.filter((i) => n(i) === 1),
    pieceName: namer(def, pieces, cubeKind, order),
    stages: [
      {
        id: 'estrela',
        title: 'Estrela branca',
        intro: 'Vamos fazer uma estrela branca embaixo: as 5 arestas brancas, uma de cada vez.',
        kind: 'pieces',
        targets: dEdges,
        texts: texts({ done: 'Estrela branca pronta!' }),
      },
      {
        id: 'cantos-brancos',
        title: 'Cantos brancos',
        intro: 'Agora os 5 cantos brancos, com o mesmo truque do 3x3.',
        kind: 'pieces',
        targets: dCorners,
        templates: [1, 3, 5].map((k) => ({ alg: `(DR F DR' F')${k}`, one: "DR F DR' F'", reps: k, target: f('D', 'DR', 'DL') })),
        texts: texts({ done: 'Face branca pronta!' }),
      },
      {
        id: 'segunda',
        title: 'Arestas de baixo',
        intro: 'Agora as 5 arestas entre duas faces de baixo.',
        kind: 'pieces',
        targets: llEdges,
        templates: [
          { alg: "F DR F' DR' F' DL' F DL", target: f('DR', 'DL') },
          { alg: "F' DL' F DL F DR F' DR'", target: f('DR', 'DL') },
        ],
        texts: texts({ done: 'Segunda camada pronta!' }),
      },
      {
        id: 'cantos-baixo',
        title: 'Cantos de baixo',
        intro: 'Agora os cantos com duas cores de baixo e uma de cima.',
        kind: 'pieces',
        targets: type2,
        templates: [
          { alg: "R' F R", target: f('F', 'DR', 'DL') },
          { alg: "U F' U F'", target: f('F', 'DR', 'DL') },
          { alg: 'F U F', target: f('F', 'DR', 'DL') },
        ],
        texts: texts({ done: 'Mais uma camada pronta!' }),
      },
      {
        id: 'equador',
        title: 'Arestas do meio',
        intro: 'Agora as 10 arestas da "cintura".',
        kind: 'pieces',
        targets: equator,
        // achados por busca (tools/casos.mjs): cobrem as duas viradas da aresta
        templates: [
          { alg: "F2 U F' U' F2'", target: f('F', 'DR') },
          { alg: "F2' U F R' F R", target: f('F', 'DR') },
          { alg: "F2' U' F U F2", target: f('F', 'DL') },
          { alg: "F2 U' F' L F' L'", target: f('F', 'DL') },
        ],
        texts: texts({ done: 'A metade de baixo está pronta!' }),
      },
      {
        id: 'cantos-meio',
        title: 'Cantos do meio',
        intro: 'Agora os cantos com duas cores de cima e uma de baixo.',
        kind: 'pieces',
        targets: type3,
        templates: [1, 3, 5].map((k) => ({ alg: `(R U R' U')${k}`, one: "R U R' U'", reps: k, target: f('F', 'R', 'DR') })),
        texts: texts({ done: 'Só faltam as arestas de cima e a face cinza!' }),
      },
      {
        id: 'arestas-altas',
        title: 'Arestas de cima',
        intro: 'Agora as 5 arestas entre duas faces da fileira de cima.',
        kind: 'pieces',
        targets: upperEdges,
        templates: [
          { alg: "U R U' R' U' F' U F", target: f('F', 'R') },
          { alg: "U' F' U F U R U' R'", target: f('F', 'R') },
        ],
        texts: texts({ done: 'Tudo pronto menos a face cinza!' }),
      },
      {
        id: 'estrela-cinza',
        title: 'Estrela cinza',
        intro: 'Agora vamos fazer uma estrela cinza em cima.',
        kind: 'macro',
        algs: [{ alg: "F R U R' U' F'", text: 'Faça F R U R\' U\' F\' para virar arestas cinza para cima.' }],
        singles: ["U", "U'", 'U2', "U2'"],
        goal: (fast, s) => uEdges.every((p) => fast.pieceSlots[p].some((k) => fast.slots[k].face === 'U' && fast.faceAt(s, k) === 'U')),
        solves: [],
        maxDepth: 7,
        texts: texts({ adjust: 'Gire o topo.', done: 'Estrela cinza pronta!' }),
      },
      {
        id: 'arestas-cinza',
        title: 'Arestas cinza no lugar',
        intro: 'Agora cada aresta de cima tem que combinar com o centro do lado.',
        kind: 'macro',
        algs: [{ alg: "R U R' U R U2' R'", rotate: true, text: 'Este algoritmo troca 3 arestas de lugar.' }],
        singles: ["U", "U'", 'U2', "U2'"],
        goal: (fast, s) => uEdges.every((p) => fast.pieceSolved(s, p)),
        solves: uEdges,
        maxDepth: 5,
        texts: texts({ adjust: 'Gire o topo para alinhar as arestas.', done: 'Arestas de cima prontas!' }),
      },
      {
        id: 'cantos-lugar',
        title: 'Cantos cinza no lugar',
        intro: 'Agora cada canto de cima vai para o lugar dele (ainda pode ficar torto).',
        kind: 'macro',
        algs: [{ alg: "U L U' R' U L' U' R", rotate: true, text: 'Este algoritmo troca 3 cantos de lugar, em roda.' }],
        singles: [],
        goal: (fast, s) => uCorners.every((p) => fast.piecePlaced(s, p)),
        solves: [],
        maxDepth: 4,
        texts: texts({ done: 'Os cantos estão nos lugares certos!' }),
      },
      {
        id: 'girar',
        title: 'Girar os cantos',
        intro: 'Último passo! Não vire o quebra-cabeça: o resto bagunça e volta sozinho no fim.',
        kind: 'twist',
        trig: "R' DR' R DR",
        up: 'U',
        count: 5,
        upFace: 'U',
        watchSlot: null,
        alignCheck: uEdges[0],
        solves: [...uEdges, ...uCorners],
        texts: texts({
          twist: (r) => `Repita R' DR' R DR até o cinza deste canto ficar em cima (${r} vezes). O resto vai bagunçar: continue!`,
          next: 'Gire só o topo para trazer o próximo canto para a frente-direita.',
          align: 'Gire o topo para alinhar.',
          done: 'MEGAMINX MONTADO! Parabéns!',
        }),
      },
    ],
    ufr: f('U', 'F', 'R'),
  };
}

const BUILDERS = { cubo3: cube3, cubo2: cube2, pyraminx, megaminx };

export function buildSpec(id, def, pieces, fast) {
  const spec = BUILDERS[id](def, pieces);
  for (const st of spec.stages) {
    if (st.kind === 'twist') {
      const ufr = spec.ufr;
      const idx = pieces[ufr].stickers.findIndex((s) => s.face === 'U');
      st.watchSlot = fast.pieceSlots[ufr][idx];
    }
  }
  return spec;
}
