import { buildPuzzle, PuzzleState, parseAlg, invertMoves, moveToString } from './engine/puzzle.js';
import { PUZZLES } from './puzzles/index.js';
import { PuzzleView } from './render/view.js';

const $ = (sel) => document.querySelector(sel);
const view = new PuzzleView($('#canvas'));
const built = {};

const app = {
  puzzleId: 'cubo3',
  mode: 'aprender',
  lessonIdx: 0,
  stepIdx: 0,
  moves: [],
  setup: [],
  cursor: 0,
  playing: false,
  speed: 0.55,
  trying: false, // "Tentar sozinho" dentro da lição
  queue: [],
  history: [],
  scrambled: false,
};

let state;
const current = () => PUZZLES[app.puzzleId];
const lesson = () => current().lessons[app.lessonIdx];
const step = () => lesson().steps[app.stepIdx];

function toast(msg, ms = 2600) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => (t.hidden = true), ms);
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}

// ---------- quebra-cabeça ----------

function loadPuzzle(id) {
  app.puzzleId = id;
  const { def } = current();
  if (!built[id]) built[id] = buildPuzzle(def);
  state = new PuzzleState(def, built[id]);
  view.setPuzzle(def, built[id]);
  view.showLabels($('#letras').checked);
  app.queue = [];
  app.playing = false;
  renderPuzzleTabs();
  if (app.mode === 'aprender') selectLesson(Math.min(app.lessonIdx, current().lessons.length - 1));
  else startPractice();
}

function renderPuzzleTabs() {
  $('#puzzles').innerHTML = Object.entries(PUZZLES)
    .map(([id, p]) => `<button data-id="${id}" class="${id === app.puzzleId ? 'ativo' : ''}">${esc(p.def.name)}</button>`)
    .join('');
}

$('#puzzles').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (b && b.dataset.id !== app.puzzleId && !view.busy) {
    app.lessonIdx = 0;
    loadPuzzle(b.dataset.id);
  }
});

document.querySelectorAll('.modo').forEach((b) =>
  b.addEventListener('click', () => {
    if (view.busy) return;
    app.mode = b.dataset.modo;
    document.querySelectorAll('.modo').forEach((x) => x.classList.toggle('ativo', x === b));
    if (app.mode === 'aprender') selectLesson(app.lessonIdx);
    else startPractice();
  }),
);

$('#letras').addEventListener('change', (e) => view.showLabels(e.target.checked));
$('#centralizar').addEventListener('click', () => view.resetCamera());

// ---------- lições ----------

function renderLessonList() {
  const list = $('#licoes');
  if (app.mode !== 'aprender') {
    list.innerHTML = `<li class="teclas" style="padding:4px 6px">Embaralhe e tente montar sozinho, usando o que aprendeu nas lições.</li>`;
    return;
  }
  list.innerHTML = current()
    .lessons.map(
      (l, i) => `<li><button data-i="${i}" class="${i === app.lessonIdx ? 'ativo' : ''}">${esc(l.title)}</button></li>`,
    )
    .join('');
}

$('#licoes').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-i]');
  if (b && !view.busy) selectLesson(Number(b.dataset.i));
});

function selectLesson(i) {
  app.lessonIdx = i;
  renderLessonList();
  selectStep(0);
}

function selectStep(j) {
  app.stepIdx = j;
  app.playing = false;
  app.trying = false;
  app.queue = [];
  const s = step();
  app.moves = parseAlg(s.alg);
  app.setup = s.setup !== undefined ? parseAlg(s.setup) : invertMoves(app.moves);
  view.paint(lesson().colored, s.focus);
  goTo(0);
}

function goTo(k) {
  state.reset();
  state.applyAlg(app.setup);
  state.applyAlg(app.moves.slice(0, k));
  app.cursor = k;
  view.sync(state);
  updateArrow();
  renderLessonPanel();
}

function updateArrow() {
  if (app.mode === 'aprender' && !app.trying && app.cursor < app.moves.length) {
    view.showArrow(state.plan(app.moves[app.cursor]));
  } else view.clearArrow();
}

function forward() {
  if (view.busy || app.cursor >= app.moves.length) return;
  const mv = app.moves[app.cursor];
  const plan = state.plan(mv);
  view.showArrow(plan);
  view.animate(plan, app.speed * (Math.abs(mv.turns) > 1 ? 1.4 : 1), () => {
    state.apply(mv);
    view.sync(state);
    app.cursor++;
    if (app.cursor >= app.moves.length) app.playing = false;
    updateArrow();
    renderLessonPanel();
    if (app.playing) setTimeout(forward, app.speed * 350);
  });
}

function backward() {
  if (view.busy || app.cursor === 0) return;
  app.playing = false;
  const mv = app.moves[app.cursor - 1];
  const inv = { name: mv.name, turns: -mv.turns };
  const plan = state.plan(inv);
  view.showArrow(plan);
  view.animate(plan, app.speed, () => {
    state.apply(inv);
    view.sync(state);
    app.cursor--;
    updateArrow();
    renderLessonPanel();
  });
}

function togglePlay() {
  if (app.cursor >= app.moves.length) {
    goTo(0);
    app.playing = true;
    setTimeout(forward, 250);
  } else {
    app.playing = !app.playing;
    if (app.playing) forward();
  }
  renderLessonPanel();
}

function moveButtons() {
  const { def } = current();
  return def.moveGroups
    .flat()
    .flatMap((n) => [n, n + "'"])
    .map((m) => `<button data-mv="${m}" title="${esc(def.describe(parseAlg(m)[0]))}">${m}</button>`)
    .join('');
}

function renderLessonPanel() {
  const { def } = current();
  const l = lesson();
  const s = step();
  const total = app.moves.length;
  const next = app.moves[app.cursor];
  const note = s.notes && s.notes[app.cursor];
  const atEnd = app.cursor >= total;

  let legenda;
  if (app.trying) {
    legenda = `<p>Sua vez! Use os botões abaixo (ou o teclado) para chegar no objetivo. A seta não aparece aqui.</p>`;
  } else if (!atEnd) {
    legenda = `<span class="mv">${esc(moveToString(next))}</span>${esc(def.describe(next))}${
      note ? `<span class="nota">${esc(note)}</span>` : ''
    }`;
  } else {
    legenda = `<p><strong>Pronto!</strong> Assim deve ficar. Use ◀ para voltar ou ▶ para ver de novo.</p>`;
  }

  $('#painel').innerHTML = `
    <h2>${esc(l.title)}</h2>
    <p>${esc(l.intro)}</p>
    <div class="objetivo"><strong>Como deve ficar</strong>${esc(l.goal)}</div>

    ${l.steps.length > 1 ? `<h3>Casos</h3><div class="casos">${l.steps
      .map((st, i) => `<button data-step="${i}" class="${i === app.stepIdx ? 'ativo' : ''}">${esc(st.title)}</button>`)
      .join('')}</div>` : ''}

    <h3>${esc(s.title)}</h3>
    <p>${esc(s.text)}</p>
    <div class="alg">${app.moves
      .map((m, i) => `<span class="${i < app.cursor ? 'feito' : i === app.cursor && !app.trying ? 'atual' : ''}">${esc(moveToString(m))}</span>`)
      .join('')}</div>

    <div class="legenda">${legenda}</div>

    ${app.trying ? `
      <h3>Seus movimentos</h3>
      <div class="movs" id="movs">${moveButtons()}</div>
      <div class="controles">
        <button class="btn" id="tentarDeNovo">Recomeçar o caso</button>
        <button class="btn" id="sairTentar">Voltar à demonstração</button>
      </div>
      <p class="teclas">Teclado: letra do giro (ex.: <kbd>R</kbd>), com <kbd>Shift</kbd> para o contrário (R').</p>
    ` : `
      <div class="controles">
        <button class="btn" id="inicio" title="Voltar ao começo">⟲</button>
        <button class="btn" id="voltar" ${app.cursor === 0 ? 'disabled' : ''} title="Movimento anterior">◀</button>
        <button class="btn primario" id="tocar">${app.playing ? 'Pausar' : atEnd ? 'Ver de novo' : 'Tocar'}</button>
        <button class="btn" id="avancar" ${atEnd ? 'disabled' : ''} title="Próximo movimento">▶</button>
        <button class="btn" id="objetivo">${atEnd ? 'Ver o começo' : 'Ver o objetivo'}</button>
      </div>
      <div class="progresso">Movimento ${Math.min(app.cursor + (atEnd ? 0 : 1), total)} de ${total}</div>
      <label class="velocidade">Velocidade
        <input type="range" id="vel" min="0.15" max="1.3" step="0.05" value="${1.45 - app.speed}" />
      </label>
      <div class="controles"><button class="btn" id="tentar">Tentar sozinho</button></div>
      <p class="teclas">Atalhos: <kbd>Espaço</kbd> tocar/pausar, <kbd>→</kbd> próximo, <kbd>←</kbd> anterior.</p>
    `}
  `;
}

$('#painel').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (app.mode === 'praticar') return practiceClick(b);
  if (b.dataset.step && !view.busy) return selectStep(Number(b.dataset.step));
  if (b.dataset.mv) return enqueue(parseAlg(b.dataset.mv)[0]);
  if (view.busy && b.id !== 'tocar') return;
  switch (b.id) {
    case 'inicio':
      app.playing = false;
      goTo(0);
      break;
    case 'voltar':
      backward();
      break;
    case 'avancar':
      app.playing = false;
      forward();
      break;
    case 'tocar':
      togglePlay();
      break;
    case 'objetivo':
      app.playing = false;
      goTo(app.cursor >= app.moves.length ? 0 : app.moves.length);
      break;
    case 'tentar':
    case 'tentarDeNovo':
      app.playing = false;
      app.queue = [];
      app.trying = true;
      goTo(0);
      break;
    case 'sairTentar':
      app.trying = false;
      app.queue = [];
      goTo(0);
      break;
  }
});

$('#painel').addEventListener('input', (e) => {
  if (e.target.id === 'vel') app.speed = 1.45 - Number(e.target.value);
});

// ---------- movimentos do usuário (tentar sozinho e praticar) ----------

function enqueue(mv) {
  app.queue.push(mv);
  if (!view.busy) runQueue();
}

function runQueue(fast = false) {
  const mv = app.queue.shift();
  if (!mv) return;
  const plan = state.plan(mv);
  view.animate(plan, fast ? 0.07 : Math.min(app.speed, 0.35), () => {
    state.apply(mv);
    view.sync(state);
    afterUserMove(mv, fast);
    if (app.queue.length) runQueue(fast);
  });
}

function afterUserMove(mv, fast) {
  if (app.mode === 'aprender' && app.trying) {
    if (state.isSolved(lesson().colored)) toast('Isso! Você chegou no objetivo.');
    return;
  }
  if (app.mode === 'praticar') {
    if (!fast && !mv.undo) app.history.push(mv); // desfazer não conta como movimento novo
    renderPracticePanel();
    if (!fast && app.scrambled && state.isSolved()) {
      app.scrambled = false;
      toast('Montado! Parabéns!', 3500);
      renderPracticePanel();
    }
  }
}

// ---------- praticar ----------

function startPractice() {
  app.playing = false;
  app.trying = false;
  app.queue = [];
  app.history = [];
  app.scrambled = false;
  renderLessonList();
  state.reset();
  view.sync(state);
  view.paint(null, null);
  view.clearArrow();
  renderPracticePanel();
}

function scramble() {
  const { def } = current();
  const names = Object.keys(def.moves);
  const seq = [];
  let last = null;
  // pontas da pyraminx entram no fim, como no embaralhamento oficial
  const main = names.filter((n) => !(app.puzzleId === 'pyraminx' && n === n.toLowerCase()));
  for (let i = 0; i < def.scrambleLength; i++) {
    let n;
    do n = main[Math.floor(Math.random() * main.length)];
    while (n === last);
    last = n;
    const order = def.moves[n].order;
    const t = 1 + Math.floor(Math.random() * Math.floor(order / 2));
    seq.push({ name: n, turns: Math.random() < 0.5 ? t : -t });
  }
  if (app.puzzleId === 'pyraminx') {
    for (const tip of ['u', 'l', 'r', 'b']) {
      const r = Math.floor(Math.random() * 3);
      if (r) seq.push({ name: tip, turns: r === 1 ? 1 : -1 });
    }
  }
  app.history = [];
  app.queue = seq;
  app.scrambled = true;
  app.lastScramble = seq.map(moveToString).join(' ');
  renderPracticePanel();
  runQueue(true);
}

function renderPracticePanel() {
  const solved = state.isSolved();
  $('#painel').innerHTML = `
    <h2>Praticar</h2>
    <p>Embaralhe e tente montar. Gire o modelo arrastando com o mouse e use os botões (ou o teclado) para girar as faces.</p>
    <div class="controles">
      <button class="btn primario" id="embaralhar">Embaralhar</button>
      <button class="btn" id="desfazer" ${app.history.length ? '' : 'disabled'}>Desfazer</button>
      <button class="btn" id="montar">Montar (reiniciar)</button>
    </div>
    ${app.lastScramble && app.scrambled ? `<h3>Embaralhamento</h3><div class="alg">${app.lastScramble
      .split(' ')
      .map((m) => `<span>${esc(m)}</span>`)
      .join('')}</div>` : ''}
    <h3>Movimentos</h3>
    <div class="movs">${moveButtons()}</div>
    <p class="status ${solved ? 'ok' : ''}">${solved ? 'Montado.' : `Embaralhado · ${app.history.length} movimento(s) seus`}</p>
    <p class="teclas">Teclado: letra do giro (ex.: <kbd>R</kbd>, <kbd>U</kbd>), com <kbd>Shift</kbd> para o contrário. Passe o mouse num botão para ver o que ele faz.</p>
  `;
}

function practiceClick(b) {
  if (b.dataset.mv) return enqueue(parseAlg(b.dataset.mv)[0]);
  if (view.busy) return;
  if (b.id === 'embaralhar') scramble();
  if (b.id === 'montar') startPractice();
  if (b.id === 'desfazer' && app.history.length) {
    const mv = app.history.pop();
    app.queue.push({ name: mv.name, turns: -mv.turns, undo: true });
    runQueue(false);
  }
}

// ---------- teclado ----------

document.addEventListener('keydown', (e) => {
  if (e.target.closest('input, textarea') || e.ctrlKey || e.metaKey || e.altKey) return;
  const { def } = current();
  const userMoves = app.mode === 'praticar' || app.trying;
  if (userMoves && e.key.length === 1) {
    const name = e.key.toUpperCase();
    if (def.moves[name]) {
      e.preventDefault();
      enqueue({ name, turns: e.shiftKey ? -1 : 1 });
    }
    return;
  }
  if (app.mode !== 'aprender' || app.trying) return;
  if (e.key === ' ') {
    e.preventDefault();
    togglePlay();
  } else if (e.key === 'ArrowRight') {
    app.playing = false;
    forward();
  } else if (e.key === 'ArrowLeft') backward();
});

loadPuzzle('cubo3');

// para inspeção no console durante o desenvolvimento
if (import.meta.env.DEV) window.__cubo = { app, view, state: () => state };
