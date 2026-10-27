// Lições do Megaminx: branco embaixo, montando de baixo para cima até a
// face cinza. Todas as sequências foram conferidas por simulação
// (tools/verificar.mjs): cada uma só mexe no que ainda não está pronto.

const y = (p) => p.center[1];
const isCenter = (p) => p.faces.length === 1;
const isEdge = (p) => p.faces.length === 2;
const isCorner = (p) => p.faces.length === 3;
const piece = (...faces) => (p) => p.faces.length === faces.length && faces.every((f) => p.faces.includes(f));
const upTo = (h) => (p) => isCenter(p) || y(p) < h;
const topEdge = (p) => y(p) > 1 && isEdge(p);
const topCorner = (p) => y(p) > 1 && isCorner(p);
const ALL = () => true;

export const megaminxLessons = [
  {
    id: 'comece',
    title: 'Comece aqui',
    intro:
      'O Megaminx é um "3x3 de 12 faces". Ele parece assustador, mas usa as mesmas ideias do cubo 3x3: montar de baixo para cima, uma camada de cada vez. Se ainda não monta o 3x3, recomendo começar por ele.',
    goal: 'Conhecer as peças, as cores e como segurar.',
    tips: [
      'Arraste o modelo para ver todos os lados.',
      'A barra "Cores" mostra as 12 cores, a letra e a posição de cada face.',
      'Leva mais tempo que o 3x3 porque são mais peças, mas os passos se repetem muito.',
    ],
    colored: ALL,
    steps: [
      {
        title: 'O objetivo',
        text: 'Montado, cada uma das 12 faces tem uma cor só.\nAs cores: branco, cinza, verde, vermelho, azul, amarelo, roxo, rosa, laranja, verde-limão, azul-claro e marrom.',
        setup: '',
        alg: '',
      },
      {
        title: 'Centros',
        text: 'O pentágono do meio de cada face é o centro. Ele nunca sai do lugar e diz a cor daquela face.',
        setup: '',
        alg: '',
        colored: isCenter,
        focus: isCenter,
      },
      {
        title: 'Arestas',
        text: 'Peças de 2 cores entre dois centros. São 30.',
        setup: '',
        alg: '',
        colored: (p) => isCenter(p) || isEdge(p),
        focus: isEdge,
      },
      {
        title: 'Cantos',
        text: 'Peças de 3 cores nas pontas. São 20.',
        setup: '',
        alg: '',
        colored: (p) => isCenter(p) || isCorner(p),
        focus: isCorner,
      },
      {
        title: 'Como segurar',
        text: 'Nas lições: branco embaixo, cinza em cima, verde de frente para você (na fileira de cima), vermelho à direita e roxo à esquerda.\nEmbaixo do verde ficam o rosa (à direita) e o marrom (à esquerda).\nCada face tem uma letra: U cima, F frente, R direita, L esquerda, BR e BL atrás, D baixo, DR baixo-direita, DL baixo-esquerda e assim por diante. As bolinhas coloridas no modelo mostram cada uma.',
        setup: '',
        alg: '',
      },
      {
        title: 'O caminho',
        text: 'De baixo para cima:\n1-2. Estrela e cantos brancos (como a cruz e os cantos do 3x3)\n3 a 7. As camadas do meio, aos poucos, sempre com algoritmos parecidos com os do 3x3\n8 a 11. A face cinza de cima, como o fim do 3x3.',
        setup: '',
        alg: '',
      },
    ],
  },
  {
    id: 'notacao',
    title: 'Movimentos',
    intro:
      'Cada letra é uma face. Letra sozinha = girar 1/5 de volta (72°) no sentido horário, olhando de frente para aquela face. Apóstrofo (R\') = sentido contrário. 2 (R2) = dois giros (144°).',
    goal: 'Ler os algoritmos e fazer cada giro.',
    tips: ['Siga mais a seta rosa e as cores do que as letras: as faces de baixo têm nomes compridos.'],
    colored: ALL,
    steps: [
      { title: 'U e U\'', text: 'U: o topo cinza gira para a esquerda. U\': para a direita.', setup: '', alg: "U U'" },
      { title: 'F e F\'', text: 'F: a face verde da frente gira no sentido horário. F\': contrário.', setup: '', alg: "F F'" },
      { title: 'R e R\'', text: 'R: a face vermelha da direita. Siga a seta para ver o sentido.', setup: '', alg: "R R'" },
      { title: 'DR', text: 'DR: a face rosa, de baixo à direita.', setup: '', alg: "DR DR'" },
      { title: 'Dois giros', text: 'R2 = dois giros de uma vez (144°).', setup: '', alg: "R2 R2'" },
    ],
  },
  {
    id: 'estrela',
    title: '1. Estrela branca',
    intro:
      'Como a cruz do 3x3, mas com 5 arestas: leve cada aresta branca para baixo, em volta do centro branco, com a outra cor batendo com o centro do lado. Não tem fórmula: uma aresta de cada vez.',
    goal: 'Uma estrela branca embaixo, com a outra cor de cada aresta igual ao centro da lateral.',
    tips: [
      'Encontre a aresta, veja qual é a outra cor dela e leve-a até a face daquela cor.',
      'Depois gire essa face até a aresta descer.',
      'Tudo bem as outras peças bagunçarem nesta etapa.',
    ],
    colored: (p) => isCenter(p) || (isEdge(p) && p.faces.includes('D')),
    steps: [
      {
        title: 'Já na face certa',
        look: 'A aresta branco-rosa já está na face rosa (encostada na verde), com o branco virado para a verde.',
        text: 'Gire a face rosa até a aresta descer: DR2\' (dois giros).',
        alg: "DR2'",
        focus: piece('D', 'DR'),
      },
      {
        title: 'Em cima',
        look: 'A aresta branco-rosa está em cima da frente, com o branco virado para você.',
        text: 'Gire a face verde (F2) para levá-la até a face rosa e depois desça girando a rosa (DR2\').',
        alg: "F2 DR2'",
        notes: ['Leve a aresta até a face rosa', 'Desça a aresta'],
        focus: piece('D', 'DR'),
      },
    ],
  },
  {
    id: 'cantos-brancos',
    title: '2. Cantos brancos',
    intro:
      'Mesmo truque do 3x3. O canto branco vai para a face verde, logo acima do lugar dele (entre o rosa e o marrom). Aqui a face rosa (DR) faz o papel do R e a verde (F) o do U.',
    goal: 'A face branca inteira embaixo.',
    tips: [
      'Coloque o canto sobre o lugar dele (as 3 cores do canto = os 3 centros em volta do lugar).',
      'Repita DR F DR\' F\' até ele descer certo: 1, 3 ou 5 vezes.',
      'No seu Megaminx, vire o quebra-cabeça inteiro (branco embaixo) para trabalhar cada canto na frente.',
    ],
    colored: upTo(-1.2),
    steps: [
      {
        title: 'Branco para o rosa',
        look: 'O canto está na face verde, logo acima do lugar, com o branco virado para a face rosa.',
        text: 'DR F DR\' F\' uma vez.',
        alg: "DR F DR' F'",
        focus: piece('D', 'DR', 'DL'),
      },
      {
        title: 'Branco para a frente',
        look: 'O canto está na face verde, com o branco virado para você.',
        text: 'Repita DR F DR\' F\' 3 vezes.',
        alg: "(DR F DR' F')3",
        notes: ['1ª vez', '', '', '', '2ª vez', '', '', '', '3ª vez'],
        focus: piece('D', 'DR', 'DL'),
      },
      {
        title: 'Branco para o marrom',
        look: 'O canto está na face verde, com o branco virado para a face marrom.',
        text: 'Repita DR F DR\' F\' 5 vezes.',
        alg: "(DR F DR' F')5",
        focus: piece('D', 'DR', 'DL'),
      },
    ],
  },
  {
    id: 'segunda',
    title: '3. Arestas entre as faces de baixo',
    intro:
      'Agora as 5 arestas logo acima dos cantos brancos, entre duas faces de baixo (por exemplo, a aresta rosa-marrom). É o algoritmo da segunda camada do 3x3, com a face verde no papel do U.',
    goal: 'A base branca e as 5 arestas logo acima dela prontas.',
    tips: [
      'Leve a aresta para a face de cima daquele par (aqui, a verde), encostada numa das duas faces.',
      'Escolha o caso pelo lado em que ela está.',
    ],
    colored: upTo(-0.7),
    steps: [
      {
        title: 'Encostada no marrom',
        look: 'A aresta rosa-marrom está na face verde, encostada na marrom, com o rosa virado para a frente.',
        text: 'F DR F\' DR\' F\' DL\' F DL',
        alg: "F DR F' DR' F' DL' F DL",
        notes: ['Primeira metade: abre o espaço', '', '', '', 'Segunda metade: encaixa a aresta'],
        focus: piece('DR', 'DL'),
      },
      {
        title: 'Encostada no rosa',
        look: 'A aresta rosa-marrom está na face verde, encostada na rosa, com o marrom virado para a frente.',
        text: 'F\' DL\' F DL F DR F\' DR\'',
        alg: "F' DL' F DL F DR F' DR'",
        notes: ['Primeira metade: abre o espaço', '', '', '', 'Segunda metade: encaixa a aresta'],
        focus: piece('DR', 'DL'),
      },
    ],
  },
  {
    id: 'cantos-baixo',
    title: '4. Cantos de baixo',
    intro:
      'Os 5 cantos com duas cores de baixo e uma de cima (por exemplo, verde-rosa-marrom). Cada um fica na ponta de baixo de uma face de cima. Muitas vezes basta girar essa face.',
    goal: 'Tudo da base até esses cantos pronto.',
    tips: [
      'O canto verde-rosa-marrom fica na ponta de baixo da face verde.',
      'Se ele já estiver na face verde, com o verde para a frente, gire a verde até ele descer.',
    ],
    colored: upTo(-0.2),
    steps: [
      {
        title: 'Já na face verde',
        look: 'O canto está na face verde, à esquerda do lugar, com o verde para a frente.',
        text: 'Só girar a verde: F\'.',
        alg: "F'",
        focus: piece('F', 'DR', 'DL'),
      },
      {
        title: 'Em cima, verde para cima',
        look: 'O canto está em cima, na frente-direita, com o verde virado para o teto.',
        text: 'R\' F R: a vermelha abre caminho, a verde desce o canto e a vermelha volta.',
        alg: "R' F R",
        focus: piece('F', 'DR', 'DL'),
      },
    ],
  },
  {
    id: 'equador',
    title: '5. Arestas do meio',
    intro:
      'As 10 arestas da "cintura", entre uma face de cima e uma de baixo (por exemplo, verde-rosa). Traga a aresta para o topo cinza e use o caso certo.',
    goal: 'Metade de baixo pronta até a cintura.',
    tips: [
      'Gire o topo (U) até a aresta ficar na posição do caso.',
      'Repare na cor que fica para cima: ela diz qual caso usar.',
    ],
    colored: upTo(0.2),
    steps: [
      {
        title: 'Verde-rosa, rosa para cima',
        look: 'A aresta verde-rosa está em cima, sobre a face vermelha, com o rosa virado para o teto.',
        text: "F2 U F' U' F2'",
        alg: "F2 U F' U' F2'",
        focus: piece('F', 'DR'),
      },
      {
        title: 'Verde-rosa, verde para cima',
        look: 'A aresta verde-rosa está em cima, sobre a face azul (atrás à direita), com o verde virado para o teto.',
        text: "F2' U F R' F R",
        alg: "F2' U F R' F R",
        focus: piece('F', 'DR'),
      },
      {
        title: 'Verde-marrom, marrom para cima',
        look: 'A aresta verde-marrom está em cima, sobre a face roxa, com o marrom virado para o teto.',
        text: "F2' U' F U F2",
        alg: "F2' U' F U F2",
        focus: piece('F', 'DL'),
      },
      {
        title: 'Verde-marrom, verde para cima',
        look: 'A aresta verde-marrom está em cima, sobre a face amarela (atrás à esquerda), com o verde virado para o teto.',
        text: "F2 U' F' L F' L'",
        alg: "F2 U' F' L F' L'",
        focus: piece('F', 'DL'),
      },
    ],
  },
  {
    id: 'cantos-meio',
    title: '6. Cantos do meio',
    intro:
      'Os cantos com duas cores de cima e uma de baixo (por exemplo, verde-vermelho-rosa). Igual aos cantos brancos do 3x3: canto em cima da frente-direita e repita R U R\' U\'.',
    goal: 'Só faltam as arestas de cima das laterais e a face cinza.',
    tips: ['Coloque o canto em cima, sobre o lugar dele, na frente-direita, e repita R U R\' U\' (1, 3 ou 5 vezes).'],
    colored: upTo(0.5),
    steps: [
      {
        title: 'Rosa para a direita',
        look: 'O canto está em cima da frente-direita, com o rosa virado para a direita.',
        text: 'R U R\' U\' uma vez.',
        alg: "R U R' U'",
        focus: piece('F', 'R', 'DR'),
      },
      {
        title: 'Rosa para cima',
        look: 'O canto está em cima da frente-direita, com o rosa para o teto.',
        text: 'Repita 3 vezes.',
        alg: "(R U R' U')3",
        notes: ['1ª vez', '', '', '', '2ª vez', '', '', '', '3ª vez'],
        focus: piece('F', 'R', 'DR'),
      },
      {
        title: 'Rosa para a frente',
        look: 'O canto está em cima da frente-direita, com o rosa para você.',
        text: 'Repita 5 vezes.',
        alg: "(R U R' U')5",
        focus: piece('F', 'R', 'DR'),
      },
    ],
  },
  {
    id: 'arestas-altas',
    title: '7. Arestas de cima das laterais',
    intro: 'As 5 arestas entre duas faces da fileira de cima (por exemplo, verde-vermelho). Igual à segunda camada do 3x3, com os mesmos algoritmos.',
    goal: 'Tudo pronto, menos a face cinza.',
    tips: ['Gire o topo até a aresta ficar sobre a cor certa, e veja para que lado ela vai.'],
    colored: upTo(1.0),
    steps: [
      {
        title: 'Vai para a direita',
        look: 'A aresta verde-vermelha está em cima da frente, com o verde para a frente e o vermelho para cima.',
        text: 'U R U\' R\' U\' F\' U F',
        alg: "U R U' R' U' F' U F",
        notes: ['Primeira metade: abre o espaço', '', '', '', 'Segunda metade: encaixa a aresta'],
        focus: piece('F', 'R'),
      },
      {
        title: 'Vem da direita',
        look: 'A aresta verde-vermelha está em cima da direita, com o vermelho para a direita e o verde para cima.',
        text: 'U\' F\' U F U R U\' R\'',
        alg: "U' F' U F U R U' R'",
        notes: ['Primeira metade: abre o espaço', '', '', '', 'Segunda metade: encaixa a aresta'],
        focus: piece('F', 'R'),
      },
    ],
  },
  {
    id: 'estrela-cinza',
    title: '8. Estrela cinza',
    intro: 'Agora a face de cima. Primeiro só o cinza de cima das arestas importa: queremos uma estrela cinza.',
    goal: 'Estrela cinza em cima.',
    tips: [
      'Faça F R U R\' U\' F\', gire o topo e veja de novo.',
      'Repita até as 5 arestas mostrarem cinza em cima.',
    ],
    colored: (p, face) => upTo(1.0)(p) || (isEdge(p) && face === 'U'),
    steps: [
      {
        title: 'Virando arestas',
        look: 'Algumas arestas de cima mostram a cor da lateral em vez do cinza.',
        text: 'F R U R\' U\' F\'',
        alg: "F R U R' U' F'",
        focus: topEdge,
      },
    ],
  },
  {
    id: 'arestas-cinza',
    title: '9. Arestas cinza no lugar',
    intro: 'Agora a cor de lado de cada aresta de cima tem que bater com o centro da lateral.',
    goal: 'Estrela cinza com as laterais combinando.',
    tips: [
      'Gire o topo até achar duas arestas certas, uma ao lado da outra.',
      'Deixe essas duas na frente e à esquerda e faça R U R\' U R U2\' R\'. As outras três rodam.',
      'Repita até todas baterem.',
    ],
    colored: (p) => upTo(1.0)(p) || isEdge(p),
    steps: [
      {
        title: 'Três rodando',
        look: 'As arestas da frente e da esquerda estão certas; as outras três estão trocadas em roda.',
        text: 'R U R\' U R U2\' R\'',
        alg: "R U R' U R U2' R'",
        focus: topEdge,
      },
    ],
  },
  {
    id: 'cantos-lugar',
    title: '10. Cantos cinza no lugar',
    intro: 'Agora cada canto de cima vai para o lugar certo, mesmo que torto.',
    goal: 'Os 5 cantos de cima nos lugares certos, mesmo que girados.',
    tips: [
      'U L U\' R\' U L\' U\' R deixa parados os dois cantos de trás à esquerda e roda os outros três.',
      'Gire o topo para escolher quais ficam parados.',
    ],
    colored: ALL,
    steps: [
      {
        title: 'Três cantos rodando',
        look: 'Os dois cantos de trás à esquerda estão no lugar; os outros três estão trocados em roda.',
        text: 'U L U\' R\' U L\' U\' R',
        alg: "U L U' R' U L' U' R",
        focus: topCorner,
      },
    ],
  },
  {
    id: 'cantos-girar',
    title: '11. Girar os cantos cinza',
    intro: 'Último passo, igual ao do 3x3, sem virar o quebra-cabeça.',
    goal: 'Megaminx montado!',
    tips: [
      'Canto torto na frente-direita: repita R\' DR\' R DR até o cinza ficar em cima.',
      'O resto bagunça no caminho. É normal, continue.',
      'Gire só o topo (U) para trazer o próximo canto torto e repita.',
      'No fim, tudo volta sozinho.',
    ],
    colored: ALL,
    steps: [
      {
        title: 'Dois cantos tortos',
        look: 'Dois cantos de cima com o cinza virado para o lado.',
        text: 'Siga as fases abaixo da animação.',
        alg: "(R' DR' R DR)2 U (R' DR' R DR)4 U'",
        notes: [
          'Repita R\' DR\' R DR até o cinza ficar em cima (aqui, 2 vezes).',
          '', '', '', '', '', '', '',
          'Gire só o topo para trazer o próximo canto torto.',
          'Repita de novo (aqui, 4 vezes).',
          '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
          'Alinhe o topo. Pronto!',
        ],
        focus: topCorner,
      },
    ],
  },
];
