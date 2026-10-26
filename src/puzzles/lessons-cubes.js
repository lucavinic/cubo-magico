// Lições do 3x3 e do 2x2 pelo método de camadas (branco embaixo).
// Cada passo mostra um caso: o cubo começa montado "ao contrário" do
// algoritmo (setup = inverso) e a animação leva até o objetivo.
// colored(peça, face): quais adesivos aparecem coloridos (o resto fica cinza).

const y = (p) => p.center[1];
const has = (...faces) => (p) => faces.every((f) => p.faces.includes(f)) && p.faces.length === faces.length;

// 3x3
const bottom = (p) => y(p) < -0.5;
const middle = (p) => Math.abs(y(p)) < 0.5;
const top = (p) => y(p) > 0.5;
const isCenter = (p) => p.faces.length === 1;
const isEdge = (p) => p.faces.length === 2;
const crossPieces = (p) => isCenter(p) || (isEdge(p) && p.faces.includes('D'));
const f2l = (p) => bottom(p) || middle(p);

const ALL = () => true;

export const cube3Lessons = [
  {
    id: 'notacao',
    title: 'Movimentos',
    intro:
      'Cada letra é uma face: R direita, L esquerda, U cima, D baixo, F frente, B trás. Letra sozinha = 1/4 de volta no sentido horário olhando para aquela face. Com apóstrofo (R\') = anti-horário. Com 2 (R2) = meia volta.',
    goal: 'Aprender a ler os algoritmos. Segure sempre com o verde de frente para você e o amarelo em cima.',
    colored: ALL,
    steps: [
      { title: 'R e R\'', text: 'R sobe a coluna da direita. R\' desce.', setup: '', alg: "R R'" },
      { title: 'U e U\'', text: 'U gira o topo para a esquerda. U\' para a direita.', setup: '', alg: "U U'" },
      { title: 'F e F\'', text: 'F gira a frente como um volante para a direita. F\' para a esquerda.', setup: '', alg: "F F'" },
      { title: 'L, D e B', text: 'L desce a coluna da esquerda, D gira a base para a direita, B gira a face de trás.', setup: '', alg: "L L' D D' B B'" },
      { title: 'Meia volta', text: 'R2 é a mesma coisa que R R.', setup: '', alg: 'R2 R2' },
    ],
  },
  {
    id: 'cruz',
    title: '1. Cruz branca',
    intro:
      'Comece pelas 4 arestas brancas (peças de 2 cores). Elas vão para baixo, em volta do centro branco, e a outra cor de cada uma precisa bater com o centro do lado.',
    goal: 'Embaixo: uma cruz branca. Nas laterais: a cor de cada aresta combinando com o centro.',
    colored: (p) => crossPieces(p),
    steps: [
      {
        title: 'Aresta em cima, branco para cima',
        text: 'Gire o topo (U) até a aresta ficar em cima do centro da cor dela. Depois gire essa face meia volta (F2).',
        alg: 'U F2',
        focus: has('D', 'F'),
      },
      {
        title: 'Aresta em cima, branco para a frente',
        text: 'A aresta está certa em cima da frente, mas com o branco virado para você. Use U\' R\' F R.',
        alg: "U' R' F R",
        focus: has('D', 'F'),
      },
      {
        title: 'Aresta na camada do meio',
        text: 'Se a aresta está no meio, gire a face onde a outra cor dela já combina para descê-la. Aqui: F.',
        alg: 'F',
        focus: has('D', 'F'),
      },
    ],
  },
  {
    id: 'cantos-brancos',
    title: '2. Cantos brancos',
    intro:
      'Agora os 4 cantos brancos (peças de 3 cores). Coloque o canto em cima, bem acima do lugar dele (entre os dois centros das cores dele), segure esse lugar na frente-direita e repita R U R\' U\' até ele descer certo.',
    goal: 'A face branca inteira embaixo, e a primeira camada das laterais com as cores dos centros.',
    colored: (p) => bottom(p) || isCenter(p),
    steps: [
      {
        title: 'Branco para a direita: 1 vez',
        text: 'Com o branco virado para a direita, basta 1 vez: R U R\' U\'.',
        alg: "R U R' U'",
        focus: has('D', 'F', 'R'),
      },
      {
        title: 'Branco para cima: 3 vezes',
        text: 'Com o branco para cima, repita 3 vezes. No meio parece que bagunça, mas o resto da base volta.',
        alg: "(R U R' U')3",
        notes: ['1ª vez', '', '', '', '2ª vez', '', '', '', '3ª vez'],
        focus: has('D', 'F', 'R'),
      },
      {
        title: 'Branco para a frente: 5 vezes',
        text: 'Com o branco virado para você, repita 5 vezes.',
        alg: "(R U R' U')5",
        focus: has('D', 'F', 'R'),
      },
    ],
  },
  {
    id: 'segunda-camada',
    title: '3. Segunda camada',
    intro:
      'Procure em cima uma aresta sem amarelo. Gire o topo até a cor da frente dela bater com o centro da frente. Veja para que lado ela precisa ir (a cor de cima dela diz) e use o algoritmo daquele lado.',
    goal: 'As duas primeiras camadas prontas: base branca e a faixa do meio com as cores certas.',
    colored: (p) => f2l(p),
    steps: [
      {
        title: 'Aresta vai para a direita',
        text: 'A cor de cima da aresta é a do centro da direita: U R U\' R\' U\' F\' U F.',
        alg: "U R U' R' U' F' U F",
        focus: has('F', 'R'),
      },
      {
        title: 'Aresta vai para a esquerda',
        text: 'A cor de cima é a do centro da esquerda: U\' L\' U L U F U\' F\'.',
        alg: "U' L' U L U F U' F'",
        focus: has('F', 'L'),
      },
    ],
  },
  {
    id: 'cruz-amarela',
    title: '4. Cruz amarela',
    intro:
      'Agora só importa o amarelo em cima. Olhe o desenho das arestas: ponto, "L" ou linha. O mesmo algoritmo resolve todos: F R U R\' U\' F\'.',
    goal: 'Uma cruz amarela em cima (os cantos ainda não importam).',
    colored: (p, face) => f2l(p) || (top(p) && isCenter(p)) || (top(p) && isEdge(p) && face === 'U'),
    steps: [
      {
        title: 'Linha',
        text: 'Deixe a linha deitada (esquerda-direita) e faça F R U R\' U\' F\' uma vez.',
        alg: "F R U R' U' F'",
        focus: (p) => top(p) && isEdge(p),
      },
      {
        title: '"L"',
        text: 'Deixe o L apontando para trás e para a esquerda e faça o algoritmo 2 vezes.',
        alg: "F R U R' U' F' F R U R' U' F'",
        notes: ['1ª vez: o L vira linha', '', '', '', '', '', '2ª vez: a linha vira cruz'],
        focus: (p) => top(p) && isEdge(p),
      },
      {
        title: 'Ponto',
        text: 'Só o centro amarelo: faça uma vez (vira L), gire o topo para o L ficar atrás à esquerda (U2) e faça mais 2 vezes.',
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
      'Gire o topo até o máximo de arestas baterem com o centro da lateral. O algoritmo é R U R\' U R U2 R\'.',
    goal: 'Cruz amarela com a cor de cada aresta combinando com o centro da lateral.',
    colored: (p) => f2l(p) || (top(p) && !(p.faces.length === 3)),
    steps: [
      {
        title: 'Duas certas, uma do lado da outra',
        text: 'Deixe as duas certas atrás e à direita. Faça R U R\' U R U2 R\' e termine com U.',
        alg: "R U R' U R U2 R' U",
        focus: (p) => top(p) && isEdge(p),
      },
      {
        title: 'Só a da frente certa',
        text: 'Deixe a certa na frente e faça R U R\' U R U2 R\'. Se ainda não deu, repita.',
        alg: "R U R' U R U2 R'",
        focus: (p) => top(p) && isEdge(p),
      },
    ],
  },
  {
    id: 'cantos-lugar',
    title: '6. Cantos amarelos no lugar',
    intro:
      'Agora cada canto de cima precisa ir para o lugar certo (mesmo que torto). Ache um canto que já está no lugar, segure-o na frente-direita e faça U R U\' L\' U R\' U\' L até os outros encaixarem.',
    goal: 'Os 4 cantos de cima no lugar certo, mesmo que girados.',
    colored: ALL,
    steps: [
      {
        title: 'Um canto certo na frente-direita',
        text: 'O canto da frente-direita fica parado e os outros três rodam. Pode precisar repetir.',
        alg: "U R U' L' U R' U' L",
        focus: (p) => top(p) && p.faces.length === 3,
      },
    ],
  },
  {
    id: 'cantos-girar',
    title: '7. Girar os cantos amarelos',
    intro:
      'Último passo, e aqui você NÃO vira o cubo. Coloque um canto torto na frente-direita e repita R\' D\' R D até o amarelo ficar em cima. Depois gire só o topo (U) para trazer o próximo canto torto. A base bagunça no caminho e volta sozinha no final.',
    goal: 'Cubo montado!',
    colored: ALL,
    steps: [
      {
        title: 'Dois cantos tortos',
        text: 'Siga as fases abaixo. Confie: a base volta quando o último canto ficar certo.',
        alg: "(R' D' R D)2 U (R' D' R D)4 U'",
        notes: [
          'Repita R\' D\' R D até este canto mostrar amarelo em cima (aqui, 2 vezes).',
          '', '', '', '', '', '', '',
          'Gire só o topo para trazer o próximo canto torto para a frente-direita.',
          'Repita R\' D\' R D de novo (aqui, 4 vezes).',
          '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
          'Gire o topo para alinhar com as laterais. Pronto!',
        ],
        focus: (p) => top(p) && p.faces.length === 3,
      },
    ],
  },
];

// 2x2: só cantos. Branco embaixo.
const bottom2 = (p) => y(p) < 0;
const top2 = (p) => y(p) > 0;

export const cube2Lessons = [
  {
    id: 'notacao',
    title: 'Movimentos',
    intro:
      'Mesma notação do 3x3: R direita, L esquerda, U cima, D baixo, F frente, B trás. Apóstrofo = anti-horário, 2 = meia volta.',
    goal: 'Aprender a ler os algoritmos. Não há centros: quem manda nas cores é a primeira peça que você montar.',
    colored: ALL,
    steps: [
      { title: 'R e R\'', text: 'R sobe a direita, R\' desce.', setup: '', alg: "R R'" },
      { title: 'U e U\'', text: 'U gira o topo para a esquerda, U\' para a direita.', setup: '', alg: "U U'" },
      { title: 'F, L, D e B', text: 'Os outros giros seguem a mesma regra.', setup: '', alg: "F F' L L' D D' B B'" },
    ],
  },
  {
    id: 'primeira-camada',
    title: '1. Primeira camada branca',
    intro:
      'Monte a face branca embaixo com as laterais combinando entre si. Coloque o canto em cima, acima do lugar dele, segure esse lugar na frente-direita e repita R U R\' U\'.',
    goal: 'Face branca embaixo e cada lateral da camada de baixo com uma cor só.',
    colored: (p) => bottom2(p),
    steps: [
      { title: 'Branco para a direita: 1 vez', text: 'R U R\' U\' uma vez.', alg: "R U R' U'", focus: has('D', 'F', 'R') },
      { title: 'Branco para cima: 3 vezes', text: 'Repita 3 vezes.', alg: "(R U R' U')3", focus: has('D', 'F', 'R') },
      { title: 'Branco para a frente: 5 vezes', text: 'Repita 5 vezes.', alg: "(R U R' U')5", focus: has('D', 'F', 'R') },
    ],
  },
  {
    id: 'cantos-lugar',
    title: '2. Cantos de cima no lugar',
    intro:
      'Gire o topo até pelo menos um canto estar no lugar certo (as cores dele batem com as laterais de baixo, mesmo torto). Segure-o na frente-direita e faça U R U\' L\' U R\' U\' L.',
    goal: 'Os 4 cantos de cima no lugar, mesmo que girados.',
    colored: ALL,
    steps: [
      {
        title: 'Um canto certo na frente-direita',
        text: 'Os outros três rodam. Repita se precisar.',
        alg: "U R U' L' U R' U' L",
        focus: (p) => top2(p),
      },
    ],
  },
  {
    id: 'cantos-girar',
    title: '3. Girar os cantos de cima',
    intro:
      'Igual ao último passo do 3x3: canto torto na frente-direita, repita R\' D\' R D até o amarelo subir, depois U para trazer o próximo. Não vire o cubo.',
    goal: 'Cubo montado!',
    colored: ALL,
    steps: [
      {
        title: 'Dois cantos tortos',
        text: 'A base bagunça no caminho e volta no fim.',
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

