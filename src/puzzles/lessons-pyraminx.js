// Lições da Pyraminx: centros, pontas, base amarela e as 3 últimas arestas.
// Faces: F frente (verde), E esquerda (vermelho), Di direita (azul), Y base (amarelo).

const dist = (p) => Math.hypot(...p.center);
const isTip = (p) => p.faces.length === 3 && dist(p) > 1.2;
const isAxial = (p) => p.faces.length === 3 && dist(p) <= 1.2;
const isEdge = (p) => p.faces.length === 2;
const edge = (a, b) => (p) => isEdge(p) && p.faces.includes(a) && p.faces.includes(b);
const bottomEdge = (p) => isEdge(p) && p.faces.includes('Y');

const ALL = () => true;

export const pyraminxLessons = [
  {
    id: 'notacao',
    title: 'Movimentos',
    intro:
      'Segure com uma face de frente e uma ponta para cima. U, L, R e B são as pontas de cima, esquerda, direita e de trás. Letra maiúscula gira a camada inteira daquela ponta (1/3 de volta, horário olhando para a ponta). Minúscula (u, l, r, b) gira só a pontinha. Apóstrofo = anti-horário.',
    goal: 'Aprender os giros. Mantenha a face verde de frente e o amarelo embaixo.',
    colored: ALL,
    steps: [
      { title: 'U e U\'', text: 'U gira a camada de cima.', setup: '', alg: "U U'" },
      { title: 'R e R\'', text: 'R gira a camada da ponta da direita.', setup: '', alg: "R R'" },
      { title: 'L e L\'', text: 'L gira a camada da ponta da esquerda.', setup: '', alg: "L L'" },
      { title: 'Pontinhas', text: 'u, r, l e b giram só a ponta. Elas não atrapalham nada.', setup: '', alg: "u u' r r' l l' b b'" },
    ],
  },
  {
    id: 'centros',
    title: '1. Centros',
    intro:
      'Logo abaixo de cada ponta há um centro de 3 cores que só gira no lugar. Gire cada camada (U, L, R, B) até as cores dos 4 centros formarem as faces: o mesmo verde na frente, o mesmo amarelo embaixo etc.',
    goal: 'Os 4 centros combinando entre si. O resto ainda não importa.',
    colored: (p) => isAxial(p),
    steps: [
      { title: 'Acertando os centros', text: 'Cada giro de camada acerta um centro.', alg: "U R' L B", focus: isAxial },
    ],
  },
  {
    id: 'pontas',
    title: '2. Pontas',
    intro: 'Agora gire cada pontinha (u, l, r, b) até as cores dela baterem com o centro logo abaixo.',
    goal: 'Pontas e centros combinando.',
    colored: (p) => isAxial(p) || isTip(p),
    steps: [{ title: 'Acertando as pontas', text: 'É só girar a ponta para um lado ou para o outro.', alg: "u l' r b'", focus: isTip }],
  },
  {
    id: 'base',
    title: '3. Base amarela',
    intro:
      'Monte as 3 arestas da base (amarela). Ache uma aresta com amarelo nas camadas de cima, leve-a para a frente, ao lado do lugar dela, e use um dos dois casos abaixo.',
    goal: 'A face amarela inteira embaixo, com as laterais da base combinando com os centros.',
    colored: (p) => isAxial(p) || isTip(p) || bottomEdge(p),
    steps: [
      {
        title: 'Aresta na frente-direita',
        text: 'A aresta verde-amarela está em cima, na frente-direita, com o amarelo virado para você: U R U\' R\'.',
        alg: "U R U' R'",
        focus: edge('F', 'Y'),
      },
      {
        title: 'Aresta na frente-esquerda',
        text: 'Mesmo caso do outro lado (espelhado): U\' L\' U L.',
        alg: "U' L' U L",
        focus: edge('F', 'Y'),
      },
    ],
  },
  {
    id: 'ultimas',
    title: '4. Últimas 3 arestas',
    intro:
      'Sobram as 3 arestas em volta da ponta de cima. Segure com a base amarela embaixo e use um destes algoritmos, conforme o caso.',
    goal: 'Pyraminx montada!',
    colored: ALL,
    steps: [
      {
        title: 'Três arestas rodando (sentido 1)',
        text: 'As três estão nos lugares errados: R U\' R\' U\' R U\' R\'.',
        alg: "R U' R' U' R U' R'",
        focus: (p) => isEdge(p) && !p.faces.includes('Y'),
      },
      {
        title: 'Três arestas rodando (sentido 2)',
        text: 'Se rodou para o lado errado, use o espelho: R\' U R U R\' U R.',
        alg: "R' U R U R' U R",
        focus: (p) => isEdge(p) && !p.faces.includes('Y'),
      },
      {
        title: 'Duas arestas viradas',
        text: 'No lugar certo, mas com as cores trocadas: R\' L R L\' U L\' U\' L.',
        alg: "R' L R L' U L' U' L",
        focus: (p) => isEdge(p) && !p.faces.includes('Y'),
      },
    ],
  },
];
