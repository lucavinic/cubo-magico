// Lições do Megaminx: branco embaixo, montando de baixo para cima até a
// face cinza. Todas as sequências foram conferidas por simulação
// (tools/verificar.mjs): cada uma só mexe no que ainda não está pronto.

const y = (p) => p.center[1];
const isCenter = (p) => p.faces.length === 1;
const piece = (...faces) => (p) => p.faces.length === faces.length && faces.every((f) => p.faces.includes(f));
const upTo = (h) => (p) => isCenter(p) || y(p) < h;
const ALL = () => true;

export const megaminxLessons = [
  {
    id: 'notacao',
    title: 'Movimentos',
    intro:
      'Cada face tem um nome: U (cima, cinza), F (frente, verde), R (direita, vermelho), L (esquerda, roxo), BR e BL (atrás), D (baixo, branco) e as cinco de baixo DR, DL, DBR, DBL e B. Letra = 1/5 de volta (72°) no sentido horário olhando para a face. Apóstrofo = anti-horário. 2 = duas vezes (144°).',
    goal: 'Aprender os giros. Mantenha o branco embaixo e o verde de frente.',
    colored: ALL,
    steps: [
      { title: 'U e U\'', text: 'U gira o topo.', setup: '', alg: "U U'" },
      { title: 'F e R', text: 'F gira a frente, R a face da direita.', setup: '', alg: "F F' R R'" },
      { title: 'Dois quintos', text: 'R2 = dois giros de uma vez (144°).', setup: '', alg: "R2 R2'" },
    ],
  },
  {
    id: 'estrela',
    title: '1. Estrela branca',
    intro:
      'Como a cruz do 3x3, mas com 5 arestas: leve cada aresta branca para baixo, com a outra cor batendo com o centro do lado.',
    goal: 'Uma estrela branca embaixo, com as laterais combinando com os centros.',
    colored: (p) => isCenter(p) || (p.faces.length === 2 && p.faces.includes('D')),
    steps: [
      {
        title: 'Aresta já na face certa',
        text: 'A aresta branco-rosa já está na face rosa: gire essa face até ela descer (DR2\').',
        alg: "DR2'",
        focus: piece('D', 'DR'),
      },
      {
        title: 'Aresta em cima',
        text: 'Ela está em cima da frente, com o branco para a frente. Gire a face onde ela está (aqui a verde, F2) para levá-la à face da cor dela, e então desça (DR2\').',
        alg: "F2 DR2'",
        focus: piece('D', 'DR'),
      },
    ],
  },
  {
    id: 'cantos-brancos',
    title: '2. Cantos brancos',
    intro:
      'Mesmo truque do 3x3. Coloque o canto acima do lugar dele, na face verde (F). A face rosa (DR) faz o papel do R e a verde o do U: repita DR F DR\' F\' até ele descer certo.',
    goal: 'A face branca inteira embaixo.',
    colored: upTo(-1.2),
    steps: [
      {
        title: 'Branco para a direita: 1 vez',
        text: 'DR F DR\' F\' uma vez.',
        alg: "DR F DR' F'",
        focus: piece('D', 'DR', 'DL'),
      },
      {
        title: 'Branco para a frente: 3 vezes',
        text: 'Repita 3 vezes.',
        alg: "(DR F DR' F')3",
        focus: piece('D', 'DR', 'DL'),
      },
      {
        title: 'Branco para a esquerda: 5 vezes',
        text: 'Repita 5 vezes.',
        alg: "(DR F DR' F')5",
        focus: piece('D', 'DR', 'DL'),
      },
    ],
  },
  {
    id: 'segunda',
    title: '3. Arestas entre as faces de baixo',
    intro:
      'Agora as 5 arestas que ficam entre duas faces de baixo (logo acima dos cantos brancos). É o algoritmo da segunda camada do 3x3, com a face verde no papel do U.',
    goal: 'Base branca e as 5 arestas de baixo prontas.',
    colored: upTo(-0.7),
    steps: [
      {
        title: 'Aresta na verde, lado esquerdo',
        text: 'A aresta rosa-creme está na face verde, encostada na creme, com o rosa para a frente: F DR F\' DR\' F\' DL\' F DL.',
        alg: "F DR F' DR' F' DL' F DL",
        focus: piece('DR', 'DL'),
      },
      {
        title: 'Aresta na verde, lado direito',
        text: 'Encostada na rosa, com o creme para a frente: F\' DL\' F DL F DR F\' DR\'.',
        alg: "F' DL' F DL F DR F' DR'",
        focus: piece('DR', 'DL'),
      },
    ],
  },
  {
    id: 'cantos-baixo',
    title: '4. Cantos de baixo',
    intro:
      'Os 5 cantos que têm duas cores de baixo e uma de cima. Cada um fica embaixo de uma face de cima: gire essa face para descê-lo.',
    goal: 'Tudo da base até esses cantos pronto.',
    colored: upTo(-0.2),
    steps: [
      {
        title: 'Canto já na face verde',
        text: 'O canto está na face verde, ao lado do lugar dele: só girar a verde (F\').',
        alg: "F'",
        focus: piece('F', 'DR', 'DL'),
      },
      {
        title: 'Canto em cima, com verde para cima',
        text: 'O canto está em cima, na frente-direita: R\' F R.',
        alg: "R' F R",
        focus: piece('F', 'DR', 'DL'),
      },
    ],
  },
  {
    id: 'equador',
    title: '5. Arestas do meio',
    intro:
      'As 10 arestas da "cintura", entre uma face de cima e uma de baixo. Traga a aresta para a face de cima e use o caso certo.',
    goal: 'Metade de baixo pronta até a cintura.',
    colored: upTo(0.2),
    steps: [
      {
        title: 'Vai para baixo à direita',
        text: 'Aresta verde-rosa em cima, à esquerda, com o rosa para cima: U\' F2\' U F2 U F2\' U\' F2.',
        alg: "U' F2' U F2 U F2' U' F2",
        focus: piece('F', 'DR'),
      },
      {
        title: 'Vai para baixo à esquerda',
        text: 'Aresta verde-creme em cima, à direita, com o creme para cima: U F2 U\' F2\' U\' F2 U F2\'.',
        alg: "U F2 U' F2' U' F2 U F2'",
        focus: piece('F', 'DL'),
      },
    ],
  },
  {
    id: 'cantos-meio',
    title: '6. Cantos do meio',
    intro:
      'Os cantos com duas cores de cima e uma de baixo. Igual aos cantos brancos do 3x3: canto em cima da frente-direita e repita R U R\' U\'.',
    goal: 'Só faltam as arestas de cima e a face cinza.',
    colored: upTo(0.5),
    steps: [
      { title: 'Rosa para a direita: 1 vez', text: 'R U R\' U\' uma vez.', alg: "R U R' U'", focus: piece('F', 'R', 'DR') },
      { title: 'Rosa para cima: 3 vezes', text: 'Repita 3 vezes.', alg: "(R U R' U')3", focus: piece('F', 'R', 'DR') },
      { title: 'Rosa para a frente: 5 vezes', text: 'Repita 5 vezes.', alg: "(R U R' U')5", focus: piece('F', 'R', 'DR') },
    ],
  },
  {
    id: 'arestas-altas',
    title: '7. Arestas de cima das laterais',
    intro: 'Igual à segunda camada do 3x3, com os mesmos algoritmos.',
    goal: 'Tudo pronto menos a face cinza.',
    colored: upTo(1.0),
    steps: [
      {
        title: 'Vai para a direita',
        text: 'Aresta em cima da frente, com o vermelho para cima: U R U\' R\' U\' F\' U F.',
        alg: "U R U' R' U' F' U F",
        focus: piece('F', 'R'),
      },
      {
        title: 'Vem da direita',
        text: 'Aresta em cima da direita, com o verde para cima: U\' F\' U F U R U\' R\'.',
        alg: "U' F' U F U R U' R'",
        focus: piece('F', 'R'),
      },
    ],
  },
  {
    id: 'estrela-cinza',
    title: '8. Estrela cinza',
    intro: 'Só o cinza de cima importa agora. Faça F R U R\' U\' F\', gire o topo e repita até as 5 arestas mostrarem cinza.',
    goal: 'Estrela cinza em cima.',
    colored: (p, face) => upTo(1.0)(p) || (p.faces.length === 2 && face === 'U'),
    steps: [
      {
        title: 'Virando arestas',
        text: 'F R U R\' U\' F\'.',
        alg: "F R U R' U' F'",
        focus: (p) => y(p) > 1 && p.faces.length === 2,
      },
    ],
  },
  {
    id: 'arestas-cinza',
    title: '9. Arestas cinza no lugar',
    intro:
      'Deixe duas arestas certas, uma ao lado da outra, na frente e à esquerda. R U R\' U R U2\' R\' roda as outras três. Repita até todas baterem.',
    goal: 'Estrela cinza com as laterais combinando.',
    colored: (p) => upTo(1.0)(p) || p.faces.length === 2,
    steps: [
      {
        title: 'Três arestas rodando',
        text: 'Frente e esquerda ficam paradas: R U R\' U R U2\' R\'.',
        alg: "R U R' U R U2' R'",
        focus: (p) => y(p) > 1 && p.faces.length === 2,
      },
    ],
  },
  {
    id: 'cantos-lugar',
    title: '10. Cantos cinza no lugar',
    intro:
      'Os dois cantos de trás à esquerda ficam parados e os outros três rodam: U L U\' R\' U L\' U\' R. Gire o topo para escolher quais ficam.',
    goal: 'Os 5 cantos de cima no lugar certo, mesmo que girados.',
    colored: ALL,
    steps: [
      {
        title: 'Três cantos rodando',
        text: 'U L U\' R\' U L\' U\' R.',
        alg: "U L U' R' U L' U' R",
        focus: (p) => y(p) > 1 && p.faces.length === 3,
      },
    ],
  },
  {
    id: 'cantos-girar',
    title: '11. Girar os cantos cinza',
    intro:
      'Como no 3x3, sem virar o quebra-cabeça: canto torto na frente-direita, repita R\' DR\' R DR até o cinza subir, gire só o topo (U) e continue. O resto bagunça e volta no fim.',
    goal: 'Megaminx montado!',
    colored: ALL,
    steps: [
      {
        title: 'Dois cantos tortos',
        text: 'Siga as fases.',
        alg: "(R' DR' R DR)2 U (R' DR' R DR)4 U'",
        notes: [
          'Repita R\' DR\' R DR até o cinza ficar em cima (aqui, 2 vezes).',
          '', '', '', '', '', '', '',
          'Gire só o topo para trazer o próximo canto torto.',
          'Repita de novo (aqui, 4 vezes).',
          '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
          'Alinhe o topo. Pronto!',
        ],
        focus: (p) => y(p) > 1 && p.faces.length === 3,
      },
    ],
  },
];
