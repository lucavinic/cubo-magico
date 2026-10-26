// Lições do 3x3 e do 2x2 pelo método de camadas (branco embaixo).
// Cada passo mostra um caso: o cubo começa montado "ao contrário" do
// algoritmo (setup = inverso) e a animação leva até o objetivo.
// colored(peça, face): quais adesivos aparecem coloridos (o resto fica escuro).
// Campos de texto: intro, goal, tips (lista) e, em cada passo, text e look
// ("como reconhecer"). Use \n para quebrar parágrafo.

const y = (p) => p.center[1];
const has = (...faces) => (p) => faces.every((f) => p.faces.includes(f)) && p.faces.length === faces.length;

// 3x3
const bottom = (p) => y(p) < -0.5;
const middle = (p) => Math.abs(y(p)) < 0.5;
const top = (p) => y(p) > 0.5;
const isCenter = (p) => p.faces.length === 1;
const isEdge = (p) => p.faces.length === 2;
const isCorner = (p) => p.faces.length === 3;
const crossPieces = (p) => isCenter(p) || (isEdge(p) && p.faces.includes('D'));
const f2l = (p) => bottom(p) || middle(p);

const ALL = () => true;

export const cube3Lessons = [
  {
    id: 'comece',
    title: 'Comece aqui',
    intro:
      'Nunca montou um cubo? Sem problema. Antes de girar qualquer coisa, vale entender de que ele é feito. Clique em cada item abaixo: as peças daquele tipo piscam no modelo. Arraste o cubo com o mouse para olhar por todos os lados.',
    goal: 'Saber o que são centros, arestas e cantos, e como segurar o cubo durante as lições.',
    tips: [
      'Não precisa decorar nada agora.',
      'Se tiver um cubo de verdade, pegue-o e acompanhe junto.',
      'A barra "Cores" mostra o nome de cada cor e de que lado ela fica.',
    ],
    colored: ALL,
    steps: [
      {
        title: 'O objetivo',
        text: 'Cubo montado é assim: cada uma das 6 faces com uma cor só.\nSão 6 cores: branco, amarelo, verde, azul, vermelho e laranja.',
        setup: '',
        alg: '',
      },
      {
        title: 'Centros (1 cor)',
        text: 'A peça do meio de cada face é o centro. Ela tem 1 cor e nunca sai do lugar: só gira em volta de si mesma.\nPor isso o centro diz qual cor aquela face vai ter no final. Se o centro é verde, aquela face vai ser toda verde.\nPares opostos: branco × amarelo, verde × azul, vermelho × laranja.',
        setup: '',
        alg: '',
        colored: (p) => isCenter(p),
        focus: isCenter,
      },
      {
        title: 'Arestas (2 cores)',
        text: 'As peças com 2 cores, no meio de cada borda, são as arestas. São 12.\nCada aresta tem um lugar certo: a aresta branco-verde fica entre o centro branco e o centro verde.',
        setup: '',
        alg: '',
        colored: (p) => isCenter(p) || isEdge(p),
        focus: isEdge,
      },
      {
        title: 'Cantos (3 cores)',
        text: 'As peças com 3 cores, nas pontas, são os cantos. São 8.\nO canto branco-verde-laranja fica onde se encontram os centros branco, verde e laranja.',
        setup: '',
        alg: '',
        colored: (p) => isCenter(p) || isCorner(p),
        focus: isCorner,
      },
      {
        title: 'Como segurar',
        text: 'Em todas as lições segure assim: verde de frente para você, amarelo em cima e branco embaixo. Então o laranja fica à direita e o vermelho à esquerda.\nCada lado tem uma letra (vem do inglês): F frente, B trás, R direita, L esquerda, U cima, D baixo. As bolinhas coloridas em volta do modelo mostram a letra e a cor de cada lado.',
        setup: '',
        alg: '',
      },
      {
        title: 'O caminho',
        text: 'Vamos montar de baixo para cima, uma camada de cada vez, em 7 etapas:\n1. Cruz branca embaixo\n2. Cantos brancos (a primeira camada fica pronta)\n3. Segunda camada (a faixa do meio)\n4. Cruz amarela em cima\n5. Arestas amarelas no lugar\n6. Cantos amarelos no lugar\n7. Girar os cantos amarelos, e pronto!\nComece pela lição "Movimentos" para aprender a ler os giros.',
        setup: '',
        alg: '',
      },
    ],
  },
  {
    id: 'notacao',
    title: 'Movimentos',
    intro:
      'Os passos são escritos com letras. Cada letra é um lado do cubo, e você gira aquele lado 1/4 de volta (90°). Veja cada um e repita no seu cubo até ficar natural.',
    goal: 'Ler um algoritmo (uma sequência como R U R\' U\') e saber fazer cada giro.',
    tips: [
      'Letra sozinha (R) = girar no sentido horário, olhando de frente para aquele lado.',
      'Letra com apóstrofo (R\', fala-se "R linha") = sentido contrário.',
      'Letra com 2 (R2) = meia volta (dois giros).',
      'O cubo inteiro não muda de posição: só a camada daquela letra gira.',
    ],
    colored: ALL,
    steps: [
      { title: 'R', text: 'R (Right = direita): a coluna da direita sobe. Com a mão direita, empurre a coluna da direita para cima.', setup: '', alg: 'R' },
      { title: 'R\'', text: 'R\' (R linha): o contrário, a coluna da direita desce.', setup: 'R', alg: "R'" },
      { title: 'U', text: 'U (Up = cima): o topo gira para a esquerda. Use o dedo indicador da mão direita para puxar a frente do topo para a esquerda.', setup: '', alg: 'U' },
      { title: 'U\'', text: 'U\': o topo gira para a direita.', setup: 'U', alg: "U'" },
      { title: 'F e F\'', text: 'F (Front = frente): a face da frente gira como um volante para a direita. F\' gira para a esquerda.', setup: '', alg: "F F'" },
      { title: 'L e L\'', text: 'L (Left = esquerda): a coluna da esquerda desce (é o espelho do R). L\' sobe.', setup: '', alg: "L L'" },
      { title: 'D e D\'', text: 'D (Down = baixo): a base gira para a direita. D\' para a esquerda.', setup: '', alg: "D D'" },
      { title: 'B e B\'', text: 'B (Back = trás): a face de trás. Olhando de frente, parece girar para a esquerda. É o menos usado.', setup: '', alg: "B B'" },
      { title: 'Meia volta (R2)', text: 'R2 = girar a direita duas vezes. Tanto faz para que lado.', setup: '', alg: 'R2' },
      {
        title: 'Lendo um algoritmo',
        text: 'Um algoritmo é uma lista de giros, feitos em ordem, da esquerda para a direita.\n"R U R\' U\'" quer dizer: direita sobe, topo para a esquerda, direita desce, topo para a direita. Clique em ▶ e acompanhe: a seta rosa mostra cada giro antes dele acontecer.',
        setup: '',
        alg: "R U R' U'",
      },
    ],
  },
  {
    id: 'cruz',
    title: '1. Cruz branca',
    intro:
      'Primeira etapa: as 4 arestas brancas (peças de 2 cores com branco) vão para baixo, em volta do centro branco, formando uma cruz. A outra cor de cada aresta tem que bater com o centro do lado.\nAqui não tem fórmula: você leva uma aresta de cada vez. Nas animações, só as peças que importam agora estão coloridas; as escuras ainda não importam.',
    goal: 'Embaixo, uma cruz branca. Nas laterais, a cor de cada aresta igual à do centro logo acima dela (um "T" de cada lado).',
    tips: [
      'Faça uma aresta de cada vez. Tudo bem as outras peças bagunçarem: só as arestas brancas importam agora.',
      'Antes de descer uma aresta, confira se a outra cor dela bate com o centro daquele lado.',
      'Aresta branca embaixo no lugar errado? Gire aquela face meia volta (ex.: R2) para trazê-la para cima, e resolva como no primeiro caso.',
      'Muita gente faz a cruz em cima (em volta do amarelo) e depois vira. Aqui fazemos direto embaixo, que dá menos trabalho.',
    ],
    colored: (p) => crossPieces(p),
    steps: [
      {
        title: 'Em cima, branco para cima',
        look: 'A aresta branco-verde está na camada de cima, com o branco virado para o teto.',
        text: '1. Gire o topo (U) até a aresta ficar em cima do centro verde.\n2. Gire a frente meia volta (F2). Ela desce no lugar certo.',
        alg: 'U F2',
        focus: has('D', 'F'),
      },
      {
        title: 'Em cima, branco para a frente',
        look: 'A aresta está em cima da frente, mas o branco está virado para você (o verde aponta para o teto).',
        text: 'Se você descesse com F2, o branco ficaria do lado errado. Use U\' R\' F R: tira a aresta do caminho, desce pela direita e entra virada certinha.',
        alg: "U' R' F R",
        focus: has('D', 'F'),
      },
      {
        title: 'Na camada do meio',
        look: 'A aresta está na faixa do meio, entre a frente e a direita, com o branco virado para a direita.',
        text: 'Gire a face onde a outra cor dela (verde) vai ficar. Um giro da frente (F) desce a aresta direto para o lugar.',
        alg: 'F',
        focus: has('D', 'F'),
      },
      {
        title: 'Embaixo, mas virada',
        look: 'A aresta está no lugar certo, mas com as cores trocadas: o verde para baixo e o branco para a frente.',
        text: 'Suba ela com F2 e caia no caso "branco para a frente": U\' R\' F R.',
        alg: "F2 U' R' F R",
        notes: ['Leve a aresta para cima', 'Agora é o caso "branco para a frente"'],
        focus: has('D', 'F'),
      },
    ],
  },
  {
    id: 'cantos-brancos',
    title: '2. Cantos brancos',
    intro:
      'Agora os 4 cantos brancos (peças de 3 cores com branco). Quando terminar, a face branca está completa e a primeira camada pronta.\nAqui aparece o primeiro algoritmo de verdade: R U R\' U\'. Vale treinar até sair rápido, porque ele volta mais tarde.',
    goal: 'A face branca inteira embaixo, e nas laterais a primeira fileira com a cor do centro de cada lado.',
    tips: [
      'Ache um canto branco na camada de cima.',
      'Gire o topo (U) até ele ficar exatamente em cima do lugar dele: as outras duas cores do canto batem com os centros dos dois lados.',
      'No seu cubo, vire o cubo inteiro na mão (mantendo o branco embaixo) para que esse lugar fique na frente-direita.',
      'Repita R U R\' U\' até o canto descer certo. São 1, 3 ou 5 vezes, conforme para onde o branco aponta.',
      'Canto branco embaixo, mas no lugar errado ou torto? Faça R U R\' U\' uma vez com ele na frente-direita: ele sobe, e aí você resolve como nos casos.',
    ],
    colored: (p) => bottom(p) || isCenter(p),
    steps: [
      {
        title: 'Branco para a direita',
        look: 'O canto está em cima da frente-direita, com o branco virado para a direita.',
        text: 'Basta 1 vez: R U R\' U\'.',
        alg: "R U R' U'",
        focus: has('D', 'F', 'R'),
      },
      {
        title: 'Branco para cima',
        look: 'O canto está em cima da frente-direita, com o branco virado para o teto.',
        text: 'Repita R U R\' U\' 3 vezes. No meio parece que bagunçou a base: confie, ela volta.',
        alg: "(R U R' U')3",
        notes: ['1ª vez', '', '', '', '2ª vez', '', '', '', '3ª vez'],
        focus: has('D', 'F', 'R'),
      },
      {
        title: 'Branco para a frente',
        look: 'O canto está em cima da frente-direita, com o branco virado para você.',
        text: 'Repita R U R\' U\' 5 vezes.',
        alg: "(R U R' U')5",
        notes: ['1ª vez', '', '', '', '2ª vez', '', '', '', '3ª vez', '', '', '', '4ª vez', '', '', '', '5ª vez'],
        focus: has('D', 'F', 'R'),
      },
    ],
  },
  {
    id: 'segunda-camada',
    title: '3. Segunda camada',
    intro:
      'Agora as 4 arestas da faixa do meio. São as arestas sem amarelo. Elas estão na camada de cima (ou presas no meio, no lugar errado). Para cada uma, há um algoritmo para a direita e outro para a esquerda.',
    goal: 'Duas camadas prontas: a base branca e a faixa do meio, com as laterais combinando até a metade de cima.',
    tips: [
      'Procure em cima uma aresta sem amarelo.',
      'Gire o topo até a cor da frente da aresta bater com o centro da frente (forma um "T" de cabeça para baixo).',
      'Olhe a cor de cima da aresta: ela diz para que lado a aresta vai. Se for a cor do centro da direita, use o caso "direita"; se for a da esquerda, o caso "esquerda".',
      'Aresta presa no meio, no lugar errado ou virada? Faça o algoritmo da direita com qualquer aresta amarela: ela sai e vai para cima.',
      'Se todas as arestas de cima têm amarelo, só sobrou a que está presa.',
    ],
    colored: (p) => f2l(p),
    steps: [
      {
        title: 'Vai para a direita',
        look: 'A aresta verde-laranja está em cima da frente, com o verde para a frente e o laranja para cima. O laranja é o centro da direita.',
        text: 'U R U\' R\' U\' F\' U F\nA primeira metade (U R U\' R\') abre espaço; a segunda (U\' F\' U F) encaixa a aresta.',
        alg: "U R U' R' U' F' U F",
        notes: ['Primeira metade: abre o espaço', '', '', '', 'Segunda metade: encaixa a aresta'],
        focus: has('F', 'R'),
      },
      {
        title: 'Vai para a esquerda',
        look: 'A aresta verde-vermelha está em cima da frente, com o vermelho para cima. O vermelho é o centro da esquerda.',
        text: 'U\' L\' U L U F U\' F\'\nÉ o espelho do caso da direita.',
        alg: "U' L' U L U F U' F'",
        notes: ['Primeira metade: abre o espaço', '', '', '', 'Segunda metade: encaixa a aresta'],
        focus: has('F', 'L'),
      },
    ],
  },
  {
    id: 'cruz-amarela',
    title: '4. Cruz amarela',
    intro:
      'Agora o topo. Primeiro só importa o amarelo de cima das arestas: queremos uma cruz amarela. As laterais e os cantos ainda não importam (estão escuros).\nOlhe o topo: o amarelo forma um ponto, um "L" ou uma linha. Um único algoritmo resolve todos: F R U R\' U\' F\'.',
    goal: 'Uma cruz amarela em cima.',
    tips: [
      'O algoritmo F R U R\' U\' F\' não estraga as duas camadas de baixo.',
      'A posição importa: a linha tem que estar deitada (esquerda-direita) e o L tem que apontar para trás e para a esquerda (como os ponteiros às 9 horas e 12 horas).',
      'Se der um caso diferente desses três, olhe de novo: com as duas camadas certas, sempre vai ser ponto, L ou linha.',
    ],
    colored: (p, face) => f2l(p) || (top(p) && isCenter(p)) || (top(p) && isEdge(p) && face === 'U'),
    steps: [
      {
        title: 'Linha',
        look: 'Duas arestas amarelas em linha com o centro.',
        text: 'Deixe a linha deitada (da esquerda para a direita) e faça F R U R\' U\' F\' uma vez.',
        alg: "F R U R' U' F'",
        focus: (p) => top(p) && isEdge(p),
      },
      {
        title: '"L"',
        look: 'Duas arestas amarelas vizinhas, formando um L com o centro.',
        text: 'Deixe o L apontando para trás e para a esquerda e faça o algoritmo 2 vezes.',
        alg: "F R U R' U' F' F R U R' U' F'",
        notes: ['1ª vez: o L vira linha', '', '', '', '', '', '2ª vez: a linha vira cruz'],
        focus: (p) => top(p) && isEdge(p),
      },
      {
        title: 'Ponto',
        look: 'Só o centro é amarelo. Nenhuma aresta mostra amarelo em cima.',
        text: 'Faça o algoritmo uma vez (vira L), gire o topo para o L ficar atrás à esquerda (aqui, U2) e faça mais 2 vezes.',
        alg: "F R U R' U' F' U2 F R U R' U' F' F R U R' U' F'",
        notes: [
          '1ª vez: o ponto vira L',
          '', '', '', '', '',
          'Leve o L para trás à esquerda',
          '2ª vez: o L vira linha',
          '', '', '', '', '',
          '3ª vez: a linha vira cruz',
        ],
        focus: (p) => top(p) && isEdge(p),
      },
    ],
  },
  {
    id: 'arestas-amarelas',
    title: '5. Arestas amarelas no lugar',
    intro:
      'A cruz amarela está feita, mas a cor de lado de cada aresta pode não bater com o centro da lateral. Gire o topo (U) até o máximo de arestas baterem, e veja qual caso é.',
    goal: 'Cruz amarela com cada aresta combinando com o centro da lateral.',
    tips: [
      'Gire o topo devagar e conte quantas arestas batem com a lateral a cada giro. Sempre dá para ter pelo menos 2 certas, ou só 1 em algum ângulo.',
      'O algoritmo R U R\' U R U2 R\' bagunça os cantos amarelos, mas eles serão arrumados nas próximas etapas.',
    ],
    colored: (p) => f2l(p) || (top(p) && !isCorner(p)),
    steps: [
      {
        title: 'Duas certas, vizinhas',
        look: 'Duas arestas vizinhas batem com as laterais, e as outras duas estão trocadas.',
        text: 'Segure as duas certas atrás e à direita. Faça R U R\' U R U2 R\' e termine com U.',
        alg: "R U R' U R U2 R' U",
        notes: ['', '', '', '', '', '', '', 'Ajuste o topo'],
        focus: (p) => top(p) && isEdge(p),
      },
      {
        title: 'Só uma certa',
        look: 'Só a aresta da frente bate com a lateral, e as outras três estão rodadas.',
        text: 'Deixe a certa na frente e faça R U R\' U R U2 R\'. Se ainda não deu, gire o topo, veja de novo e repita.',
        alg: "R U R' U R U2 R'",
        focus: (p) => top(p) && isEdge(p),
      },
    ],
  },
  {
    id: 'cantos-lugar',
    title: '6. Cantos amarelos no lugar',
    intro:
      'Agora cada canto de cima vai para o lugar certo, mesmo que ainda torto (o amarelo pode estar de lado).\nUm canto está "no lugar" quando as 3 cores dele são as 3 cores dos centros em volta, em qualquer ordem.',
    goal: 'Os 4 cantos de cima nos lugares certos, mesmo que girados.',
    tips: [
      'Procure um canto que já está no lugar e segure-o na frente-direita.',
      'Faça U R U\' L\' U R\' U\' L: o canto da frente-direita fica parado e os outros 3 trocam de lugar em roda.',
      'Repita (com o mesmo canto na frente-direita) até os 4 estarem no lugar.',
      'Nenhum canto no lugar? Faça o algoritmo uma vez de qualquer posição e procure de novo.',
    ],
    colored: ALL,
    steps: [
      {
        title: 'Um canto certo na frente-direita',
        look: 'Só o canto da frente-direita está no lugar. Os outros três estão trocados em roda.',
        text: 'U R U\' L\' U R\' U\' L',
        alg: "U R U' L' U R' U' L",
        focus: (p) => top(p) && isCorner(p),
      },
    ],
  },
  {
    id: 'cantos-girar',
    title: '7. Girar os cantos amarelos',
    intro:
      'Último passo! Os cantos estão no lugar, mas alguns estão tortos (o amarelo virado para o lado). Aqui você NÃO vira o cubo: o branco fica embaixo o tempo todo.',
    goal: 'Cubo montado!',
    tips: [
      'Coloque um canto torto na frente-direita.',
      'Repita R\' D\' R D até o amarelo desse canto ficar em cima (2 ou 4 vezes).',
      'A base vai bagunçar. É normal! Não pare no meio e não vire o cubo.',
      'Gire só o topo (U) para trazer o próximo canto torto para a frente-direita e repita R\' D\' R D.',
      'Quando o último canto ficar certo, a base volta sozinha. Gire o topo para alinhar e pronto.',
    ],
    colored: ALL,
    steps: [
      {
        title: 'Dois cantos tortos',
        look: 'Dois cantos com o amarelo virado para o lado.',
        text: 'Siga as fases abaixo da animação.',
        alg: "(R' D' R D)2 U (R' D' R D)4 U'",
        notes: [
          'Repita R\' D\' R D até este canto mostrar amarelo em cima (aqui, 2 vezes).',
          '', '', '', '', '', '', '',
          'Gire só o topo para trazer o próximo canto torto para a frente-direita.',
          'Repita R\' D\' R D de novo (aqui, 4 vezes). A base vai voltando.',
          '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
          'Gire o topo para alinhar com as laterais. Pronto!',
        ],
        focus: (p) => top(p) && isCorner(p),
      },
    ],
  },
];

// 2x2: só cantos. Branco embaixo.
const bottom2 = (p) => y(p) < 0;
const top2 = (p) => y(p) > 0;

export const cube2Lessons = [
  {
    id: 'comece',
    title: 'Comece aqui',
    intro:
      'O 2x2 é a melhor porta de entrada: tem só 8 peças, todas cantos (3 cores). Se você aprender o 2x2, já sabe a primeira e a última etapa do 3x3.',
    goal: 'Entender as peças e como segurar.',
    tips: ['Arraste o modelo com o mouse para ver todos os lados.', 'Se tiver um 2x2 de verdade, acompanhe junto.'],
    colored: ALL,
    steps: [
      {
        title: 'O objetivo',
        text: 'Montado, cada face tem uma cor só: branco, amarelo, verde, azul, vermelho e laranja.',
        setup: '',
        alg: '',
      },
      {
        title: 'Só cantos',
        text: 'Todas as 8 peças são cantos, com 3 cores cada.\nNão existe centro, então nenhuma cor tem lugar fixo: quem define as cores das laterais é a primeira camada que você montar.',
        setup: '',
        alg: '',
        focus: ALL,
      },
      {
        title: 'Como segurar',
        text: 'Nas lições: branco embaixo, amarelo em cima, verde de frente. As letras são as mesmas do 3x3: F frente, R direita, U cima, L esquerda, D baixo, B trás.',
        setup: '',
        alg: '',
      },
      {
        title: 'O caminho',
        text: 'São 3 etapas:\n1. Primeira camada branca (com as laterais combinando)\n2. Cantos de cima no lugar\n3. Girar os cantos de cima\nAprenda antes os movimentos na próxima lição.',
        setup: '',
        alg: '',
      },
    ],
  },
  {
    id: 'notacao',
    title: 'Movimentos',
    intro: 'Mesma notação do 3x3: letra = 1/4 de volta no sentido horário olhando para aquele lado; apóstrofo (R\') = sentido contrário; 2 (R2) = meia volta.',
    goal: 'Ler um algoritmo e fazer cada giro.',
    tips: ['Repita cada giro no seu cubo até ficar natural.'],
    colored: ALL,
    steps: [
      { title: 'R e R\'', text: 'R: a metade da direita sobe. R\': desce.', setup: '', alg: "R R'" },
      { title: 'U e U\'', text: 'U: o topo gira para a esquerda. U\': para a direita.', setup: '', alg: "U U'" },
      { title: 'F e F\'', text: 'F: a frente gira como um volante para a direita. F\': para a esquerda.', setup: '', alg: "F F'" },
      { title: 'L, D e B', text: 'L: a esquerda desce. D: a base vai para a direita. B: a face de trás.', setup: '', alg: "L L' D D' B B'" },
    ],
  },
  {
    id: 'primeira-camada',
    title: '1. Primeira camada branca',
    intro:
      'Monte os 4 cantos brancos embaixo. Cuidado: não basta a face branca, as laterais da camada de baixo também têm que combinar entre si (cada lateral com uma cor só).',
    goal: 'Face branca embaixo e, em cada lateral, a fileira de baixo com uma cor só.',
    tips: [
      'Comece por qualquer canto branco e deixe-o embaixo. Ele define as cores das laterais.',
      'Para cada próximo canto: coloque-o em cima, sobre o lugar onde as cores dele combinam com os cantos já montados.',
      'Segure esse lugar na frente-direita e repita R U R\' U\' até o canto descer certo (1, 3 ou 5 vezes).',
    ],
    colored: (p) => bottom2(p),
    steps: [
      {
        title: 'Branco para a direita',
        look: 'O canto está em cima da frente-direita, com o branco virado para a direita.',
        text: 'R U R\' U\' uma vez.',
        alg: "R U R' U'",
        focus: has('D', 'F', 'R'),
      },
      {
        title: 'Branco para cima',
        look: 'O canto está em cima da frente-direita, com o branco para o teto.',
        text: 'Repita R U R\' U\' 3 vezes.',
        alg: "(R U R' U')3",
        notes: ['1ª vez', '', '', '', '2ª vez', '', '', '', '3ª vez'],
        focus: has('D', 'F', 'R'),
      },
      {
        title: 'Branco para a frente',
        look: 'O canto está em cima da frente-direita, com o branco para você.',
        text: 'Repita R U R\' U\' 5 vezes.',
        alg: "(R U R' U')5",
        notes: ['1ª vez', '', '', '', '2ª vez', '', '', '', '3ª vez', '', '', '', '4ª vez', '', '', '', '5ª vez'],
        focus: has('D', 'F', 'R'),
      },
    ],
  },
  {
    id: 'cantos-lugar',
    title: '2. Cantos de cima no lugar',
    intro:
      'Agora os 4 cantos de cima. Primeiro, cada um vai para o lugar certo, mesmo que torto. Um canto está no lugar quando as cores dele combinam com as laterais de baixo, em qualquer ordem.',
    goal: 'Os 4 cantos de cima no lugar, mesmo que girados.',
    tips: [
      'Gire o topo (U) até pelo menos um canto ficar no lugar.',
      'Segure esse canto na frente-direita e faça U R U\' L\' U R\' U\' L. Os outros três trocam de lugar em roda.',
      'Repita se precisar. Nenhum no lugar? Faça uma vez de qualquer jeito e procure de novo.',
    ],
    colored: ALL,
    steps: [
      {
        title: 'Um canto certo na frente-direita',
        look: 'Só o canto da frente-direita está no lugar.',
        text: 'U R U\' L\' U R\' U\' L',
        alg: "U R U' L' U R' U' L",
        focus: (p) => top2(p),
      },
    ],
  },
  {
    id: 'cantos-girar',
    title: '3. Girar os cantos de cima',
    intro: 'Último passo, igual ao do 3x3. Não vire o cubo: o branco fica embaixo o tempo todo.',
    goal: 'Cubo montado!',
    tips: [
      'Canto torto na frente-direita: repita R\' D\' R D até o amarelo ficar em cima.',
      'A base bagunça no caminho. É normal, continue.',
      'Gire só o topo (U) para trazer o próximo canto torto e repita.',
      'No fim, a base volta sozinha.',
    ],
    colored: ALL,
    steps: [
      {
        title: 'Dois cantos tortos',
        look: 'Dois cantos com o amarelo virado para o lado.',
        text: 'Siga as fases abaixo da animação.',
        alg: "(R' D' R D)2 U (R' D' R D)4 U'",
        notes: [
          'Repita R\' D\' R D até o amarelo ficar em cima (aqui, 2 vezes).',
          '', '', '', '', '', '', '',
          'Gire só o topo para trazer o próximo canto torto.',
          'Repita R\' D\' R D de novo (aqui, 4 vezes).',
          '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
          'Alinhe o topo. Pronto!',
        ],
        focus: (p) => top2(p),
      },
    ],
  },
];
