// Lições da Pyraminx: centros, pontas, base amarela e as 3 últimas arestas.
// Faces: F frente (verde), E esquerda (vermelho), Di direita (azul), Y base (amarelo).

const dist = (p) => Math.hypot(...p.center);
const isTip = (p) => p.faces.length === 3 && dist(p) > 1.2;
const isAxial = (p) => p.faces.length === 3 && dist(p) <= 1.2;
const isEdge = (p) => p.faces.length === 2;
const edge = (a, b) => (p) => isEdge(p) && p.faces.includes(a) && p.faces.includes(b);
const bottomEdge = (p) => isEdge(p) && p.faces.includes('Y');
const topEdge = (p) => isEdge(p) && !p.faces.includes('Y');

const ALL = () => true;

export const pyraminxLessons = [
  {
    id: 'comece',
    title: 'Comece aqui',
    intro:
      'A Pyraminx é uma pirâmide de 4 faces e é bem mais fácil que o cubo 3x3. Clique em cada item abaixo para ver as peças piscando, e arraste o modelo para olhar por todos os lados.',
    goal: 'Conhecer as pontas, os centros e as arestas, e como segurar.',
    tips: ['Não precisa decorar nada agora.', 'A barra "Cores" mostra cada cor e de que lado ela fica.'],
    colored: ALL,
    steps: [
      {
        title: 'O objetivo',
        text: 'Montada, cada uma das 4 faces tem uma cor só: verde, vermelho, azul e amarelo.',
        setup: '',
        alg: '',
      },
      {
        title: 'Pontas',
        text: 'As 4 pontinhas giram sozinhas, sem mexer em mais nada. São as mais fáceis: ficam para o fim de cada etapa ou para o começo, tanto faz.',
        setup: '',
        alg: '',
        colored: isTip,
        focus: isTip,
      },
      {
        title: 'Centros',
        text: 'Logo abaixo de cada ponta há um centro de 3 cores (são 4). Ele nunca sai do lugar: só gira junto com a camada.\nAs cores dos centros dizem qual cor cada face vai ter.',
        setup: '',
        alg: '',
        colored: isAxial,
        focus: isAxial,
      },
      {
        title: 'Arestas',
        text: 'As peças de 2 cores entre os centros são as arestas. São 6, e são elas que dão trabalho de verdade.',
        setup: '',
        alg: '',
        colored: (p) => isAxial(p) || isEdge(p),
        focus: isEdge,
      },
      {
        title: 'Como segurar',
        text: 'Nas lições: amarelo embaixo, verde de frente para você e uma ponta apontando para cima.\nAs letras são as pontas: U (de cima), L (da esquerda), R (da direita) e B (de trás). Elas aparecem em bolinhas no modelo.',
        setup: '',
        alg: '',
      },
      {
        title: 'O caminho',
        text: 'São 4 etapas:\n1. Centros: acertar os 4 centros\n2. Pontas: girar cada pontinha para combinar\n3. Base amarela: as 3 arestas de baixo\n4. Últimas 3 arestas\nAntes, veja a lição "Movimentos".',
        setup: '',
        alg: '',
      },
    ],
  },
  {
    id: 'notacao',
    title: 'Movimentos',
    intro:
      'Cada letra é uma ponta. Letra maiúscula (U, L, R, B) gira a camada inteira daquela ponta: a pontinha e o centro, 1/3 de volta (120°). Letra minúscula (u, l, r, b) gira só a pontinha.',
    goal: 'Ler os algoritmos e fazer cada giro.',
    tips: [
      'Sentido horário = como os ponteiros do relógio, olhando de frente para aquela ponta (olhando a ponta "de cima").',
      'Apóstrofo (R\') = sentido contrário.',
      'Repita no seu quebra-cabeça até ficar natural.',
    ],
    colored: ALL,
    steps: [
      { title: 'U', text: 'U: a camada de cima gira 1/3 de volta para a esquerda (olhando de frente).', setup: '', alg: 'U' },
      { title: 'U\'', text: 'U\': a camada de cima gira para a direita.', setup: 'U', alg: "U'" },
      { title: 'R e R\'', text: 'R: a camada da ponta da direita (a de baixo à direita). R\' é o contrário.', setup: '', alg: "R R'" },
      { title: 'L e L\'', text: 'L: a camada da ponta da esquerda. L\' é o contrário.', setup: '', alg: "L L'" },
      { title: 'B e B\'', text: 'B: a camada da ponta de trás. Gire o modelo para ver.', setup: '', alg: "B B'" },
      { title: 'Pontinhas', text: 'u, r, l e b giram só a pontinha. Elas não estragam nada.', setup: '', alg: "u u' r r' l l' b b'" },
    ],
  },
  {
    id: 'centros',
    title: '1. Centros',
    intro:
      'Comece pelos 4 centros (as peças de 3 cores logo abaixo das pontas). Cada um só gira no lugar, então basta girar a camada de cada ponta até o centro ficar com as cores certas.',
    goal: 'Os 4 centros combinando entre si: o verde de todos para a frente, o amarelo de todos para baixo, e assim por diante.',
    tips: [
      'Escolha uma face (por exemplo, a amarela de baixo) e vire as 3 camadas de baixo (L, R e B) até os 3 centros mostrarem amarelo embaixo.',
      'Depois gire a camada de cima (U) até o centro de cima combinar com os outros.',
      'Nesta etapa as arestas ainda não importam (estão escuras).',
    ],
    colored: (p) => isAxial(p),
    steps: [
      {
        title: 'Acertando os centros',
        look: 'Cada centro está girado de um jeito: as cores não formam faces.',
        text: 'Cada giro de camada acerta um centro. Aqui: U, R\', L e B.',
        alg: "U R' L B",
        focus: isAxial,
      },
    ],
  },
  {
    id: 'pontas',
    title: '2. Pontas',
    intro: 'Agora gire cada pontinha (u, l, r, b) até as cores dela baterem com o centro logo abaixo. É o passo mais fácil!',
    goal: 'Pontas e centros combinando.',
    tips: ['Cada pontinha está certa, ou precisa de 1 giro para um lado ou para o outro.'],
    colored: (p) => isAxial(p) || isTip(p),
    steps: [
      {
        title: 'Acertando as pontas',
        look: 'As pontinhas estão com as cores diferentes do centro logo abaixo.',
        text: 'Gire cada ponta para o lado que encaixa: aqui u, l\', r e b\'.',
        alg: "u l' r b'",
        focus: isTip,
      },
    ],
  },
  {
    id: 'base',
    title: '3. Base amarela',
    intro:
      'Agora as 3 arestas da base, as que têm amarelo. Leve cada uma para a camada de cima, coloque-a na frente, ao lado do lugar dela, e use um dos dois casos.',
    goal: 'A face amarela inteira embaixo, e a fileira de baixo de cada lateral com a cor do centro.',
    tips: [
      'O lugar da aresta verde-amarela é embaixo da face verde.',
      'Use U para levar a aresta até a frente-direita ou a frente-esquerda.',
      'Confira o lado do amarelo: neste método ele tem que estar virado para você, na frente.',
      'Se a aresta estiver embaixo no lugar errado, faça um dos algoritmos para tirá-la de lá.',
    ],
    colored: (p) => isAxial(p) || isTip(p) || bottomEdge(p),
    steps: [
      {
        title: 'Aresta na frente-direita',
        look: 'A aresta verde-amarela está em cima, na borda entre a frente e a direita, com o amarelo virado para você.',
        text: 'U R U\' R\'\nA camada de cima abre o caminho e a camada da direita desce a aresta.',
        alg: "U R U' R'",
        focus: edge('F', 'Y'),
      },
      {
        title: 'Aresta na frente-esquerda',
        look: 'A aresta verde-amarela está em cima, na borda entre a frente e a esquerda, com o amarelo virado para você.',
        text: 'U\' L\' U L\nÉ o espelho do outro caso.',
        alg: "U' L' U L",
        focus: edge('F', 'Y'),
      },
    ],
  },
  {
    id: 'ultimas',
    title: '4. Últimas 3 arestas',
    intro:
      'Sobram as 3 arestas em volta da ponta de cima. Mantenha o amarelo embaixo e veja qual caso é: as 3 rodando, ou 2 viradas no lugar.',
    goal: 'Pyraminx montada!',
    tips: [
      'Para ver se as arestas "rodam", olhe as cores: cada aresta está no lugar de outra.',
      'Se as arestas rodaram para o lado errado, faça o mesmo algoritmo mais uma vez: na segunda vez elas chegam no lugar.',
      'Nos casos com 2 viradas, segure as viradas na frente-esquerda e na frente-direita.',
    ],
    colored: ALL,
    steps: [
      {
        title: '3 rodando (sentido 1)',
        look: 'As três arestas de cima estão nos lugares errados, uma no lugar da outra.',
        text: 'R U\' R\' U\' R U\' R\'',
        alg: "R U' R' U' R U' R'",
        focus: topEdge,
      },
      {
        title: '3 rodando (sentido 2)',
        look: 'Como o anterior, mas rodando para o outro lado.',
        text: 'R\' U R U R\' U R (é o espelho do sentido 1)',
        alg: "R' U R U R' U R",
        focus: topEdge,
      },
      {
        title: '2 viradas',
        look: 'As arestas da frente-esquerda e da frente-direita estão no lugar, mas com as cores trocadas.',
        text: 'R\' L R L\' U L\' U\' L',
        alg: "R' L R L' U L' U' L",
        focus: topEdge,
      },
    ],
  },
];
