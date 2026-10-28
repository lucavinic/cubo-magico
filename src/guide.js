// Modo "Montar comigo": embaralha junto com a pessoa e depois guia a
// montagem inteira, um giro de cada vez, continuando de onde parou.

import { moveToString } from './engine/puzzle.js';
import { rotate, dot } from './engine/math.js';
import { createSolver } from './solver/solver.js';
import { stateFromColors } from './solver/fromColors.js';

const solvers = {};

// como segurar: em que lado fica cada cor (vale para todos os passos)
const GRIP = {
  cubo3: [['Em cima', 'U'], ['De frente para você', 'F'], ['À direita', 'R'], ['À esquerda', 'L'], ['Embaixo', 'D'], ['Atrás', 'B']],
  cubo2: [['Em cima', 'U'], ['De frente para você', 'F'], ['À direita', 'R'], ['À esquerda', 'L'], ['Embaixo', 'D'], ['Atrás', 'B']],
  pyraminx: [['De frente para você', 'F'], ['À esquerda', 'E'], ['À direita', 'Di'], ['Embaixo (a base)', 'Y']],
  megaminx: [['Em cima', 'U'], ['De frente para você', 'F'], ['À direita', 'R'], ['À esquerda', 'L'], ['Embaixo', 'D']],
};

// faces mostradas em quadradinhos para comparar (só cubos)
const GRID_FACES = [
  { name: 'Frente', axis: [0, 0, 1], col: [1, 0, 0], row: [0, -1, 0] },
  { name: 'Cima', axis: [0, 1, 0], col: [1, 0, 0], row: [0, 0, 1] },
  { name: 'Direita', axis: [1, 0, 0], col: [0, 0, -1], row: [0, -1, 0] },
];

export function createGuide(ctx) {
  const { view, esc, toast, $ } = ctx;
  const g = {
    phase: 'inicio', // inicio | segurar | embaralhar | pintar | montar
    scramble: [],
    scrIdx: 0,
    frames: [],
    cursor: 0,
    playing: false,
  };

  const def = () => ctx.current().def;
  const solver = () => {
    const id = ctx.puzzleId();
    if (!solvers[id]) solvers[id] = createSolver(id, def(), ctx.pieces());
    return solvers[id];
  };

  function randomScramble() {
    const d = def();
    const id = ctx.puzzleId();
    // no cubo, o embaralhamento não usa a face de trás (B), que confunde quem está começando
    const names = Object.keys(d.moves).filter(
      (n) => !(id === 'pyraminx' && n === n.toLowerCase()) && !(id.startsWith('cubo') && n === 'B'),
    );
    const seq = [];
    let last = null;
    for (let i = 0; i < d.scrambleLength; i++) {
      let n;
      do n = names[Math.floor(Math.random() * names.length)];
      while (n === last);
      last = n;
      seq.push({ name: n, turns: Math.random() < 0.5 ? 1 : -1 });
    }
    if (id === 'pyraminx') for (const t of ['u', 'l', 'r', 'b']) if (Math.random() < 0.67) seq.push({ name: t, turns: Math.random() < 0.5 ? 1 : -1 });
    return seq;
  }

  function start() {
    view.onPick = null;
    g.phase = 'inicio';
    g.playing = false;
    ctx.state().reset();
    view.sync(ctx.state());
    view.paint(null, null);
    view.clearArrow();
    render();
  }

  function beginScramble(withMe) {
    g.scramble = randomScramble();
    g.scrIdx = 0;
    ctx.state().reset();
    view.sync(ctx.state());
    if (withMe) {
      g.phase = 'embaralhar';
      showArrow();
      render();
    } else {
      ctx.state().applyAlg(g.scramble);
      view.sync(ctx.state());
      beginSolve();
    }
  }

  function beginSolve(fromState = null) {
    const s = solver();
    const fs = fromState || s.fast.applyAll(s.fast.solved(), g.scramble);
    const segments = s.solve(fs);
    g.frames = [];
    for (const seg of segments) {
      if (seg.kind === 'fim') g.frames.push({ seg, move: null });
      else seg.moves.forEach((m, i) => g.frames.push({ seg, move: m, i }));
    }
    g.totalMoves = g.frames.filter((f) => f.move).length;
    g.cursor = 0;
    g.phase = 'montar';
    focusCurrent();
    showArrow();
    render();
  }

  const frame = () => g.frames[g.cursor];

  // ---------- pintar as cores do cubo da pessoa ----------

  const fixedCenters = () => ['cubo3', 'megaminx'].includes(ctx.puzzleId());

  function beginPaint() {
    const fast = solver().fast;
    g.paint = fast.slots.map((sl) => (fixedCenters() && ctx.pieces()[sl.piece].stickers.length === 1 ? sl.face : null));
    g.brush = def().faces[0].name;
    g.paintError = '';
    g.phase = 'pintar';
    g.playing = false;
    ctx.state().reset();
    view.sync(ctx.state());
    view.clearArrow();
    view.resetCamera();
    view.onPick = (hit) => {
      if (ctx.mode() !== 'montar' || g.phase !== 'pintar') return;
      const slot = fast.pieceSlots[hit.piece][hit.sticker];
      if (fixedCenters() && ctx.pieces()[hit.piece].stickers.length === 1) {
        toast('Os centros não mudam de cor: eles mostram de que cor é cada face.');
        return;
      }
      g.paint[slot] = g.paint[slot] === g.brush ? null : g.brush;
      g.paintError = '';
      refreshPaint();
      render();
    };
    refreshPaint();
    render();
  }

  function refreshPaint() {
    const fast = solver().fast;
    view.setStickerColors((i, k) => {
      const c = g.paint[fast.pieceSlots[i][k]];
      return c ? faceColor(c) : null;
    });
  }

  function finishPaint() {
    const s = solver();
    const res = stateFromColors(s.fast, ctx.pieces(), g.paint, (i) => s.spec.pieceName(i), colorName);
    if (res.error) {
      g.paintError = res.error;
      return render();
    }
    let ok = true;
    try {
      s.solve(res.state);
    } catch {
      ok = false;
    }
    if (!ok) {
      g.paintError =
        'Essas cores não formam um quebra-cabeça possível de montar. Normalmente é uma peça pintada trocada (confira as cores de cada canto e de cada aresta) ou uma peça que foi tirada e colocada de volta virada.';
      return render();
    }
    view.onPick = null;
    const st = ctx.state();
    st.quats = res.quats.map((q) => q.slice());
    view.sync(st);
    beginSolve(res.state);
  }

  function paintHtml() {
    const fast = solver().fast;
    const total = g.paint.length;
    const done = g.paint.filter(Boolean).length;
    const want = {};
    const got = {};
    fast.slots.forEach((sl, k) => {
      want[sl.face] = (want[sl.face] || 0) + 1;
      if (g.paint[k]) got[g.paint[k]] = (got[g.paint[k]] || 0) + 1;
    });
    const palette = def()
      .faces.map((f) => {
        const n = got[f.name] || 0;
        const over = n > want[f.name];
        return `<button class="pincel ${g.brush === f.name ? 'ativo' : ''}" data-cor="${f.name}">
          <span class="amostra" style="background:${f.color}"></span>
          <span>${esc(colorName(f.name))}<small class="${over ? 'demais' : ''}">${n} de ${want[f.name]}</small></span>
        </button>`;
      })
      .join('');
    return `
      <p class="passo">Pintar meu cubo · ${done} de ${total} quadradinhos</p>
      <h2>Pinte as cores do seu</h2>
      <div class="barra"><span style="width:${(100 * done) / total}%"></span></div>
      <ol class="como">
        <li><strong>Segure o seu</strong> ${fixedCenters()
          ? `com o centro <strong>${esc(colorName('U'))}</strong> em cima e o centro <strong>${esc(colorName('F'))}</strong> virado para você (os centros já estão pintados na tela).`
          : 'de um jeito e não vire mais. A frente do modelo é a frente do seu.'}</li>
        <li><strong>Escolha uma cor</strong> abaixo e <strong>clique nos quadradinhos</strong> do modelo que têm essa cor no seu.</li>
        <li><strong>Arraste o modelo</strong> para pintar os outros lados. As bolinhas com letras mostram cada lado. Clicar de novo com a mesma cor apaga.</li>
      </ol>
      <div class="paleta">${palette}</div>
      ${g.paintError ? `<div class="aviso-erro">${esc(g.paintError)}</div>` : ''}
      <div class="controles">
        <button class="btn" id="g-inicio">◀ Voltar</button>
        <button class="btn primario grande" id="g-pintado" ${done < total ? 'disabled' : ''}>${done < total ? `Faltam ${total - done}` : 'Pronto, me ajude a montar ▶'}</button>
      </div>
      <div class="controles"><button class="btn" id="g-limpar">Limpar tudo</button></div>
    `;
  }

  function focusCurrent() {
    const f = frame();
    const target = f && f.seg.target;
    view.paint(null, target === undefined ? null : (p) => p.id === target);
  }

  function showArrow() {
    const st = ctx.state();
    if (g.phase === 'embaralhar' && g.scrIdx < g.scramble.length) view.showArrow(st.plan(g.scramble[g.scrIdx]));
    else if (g.phase === 'montar' && frame() && frame().move) view.showArrow(st.plan(frame().move));
    else view.clearArrow();
  }

  function animateMove(mv, done) {
    const st = ctx.state();
    const plan = st.plan(mv);
    view.showArrow(plan);
    view.animate(plan, ctx.speed() * (Math.abs(mv.turns) > 1 ? 1.4 : 1), () => {
      st.apply(mv);
      view.sync(st);
      done();
    });
  }

  function next() {
    if (view.busy) return;
    if (g.phase === 'embaralhar') {
      if (g.scrIdx >= g.scramble.length) return beginSolve();
      animateMove(g.scramble[g.scrIdx], () => {
        g.scrIdx++;
        showArrow();
        render();
        if (g.playing && g.scrIdx < g.scramble.length) setTimeout(next, ctx.speed() * 300);
        else g.playing = false;
      });
      return;
    }
    if (g.phase !== 'montar' || g.cursor >= g.frames.length) return;
    const f = frame();
    if (!f.move) {
      // fim de etapa: só avança
      g.cursor++;
      g.playing = false;
      focusCurrent();
      showArrow();
      render();
      return;
    }
    animateMove(f.move, () => {
      g.cursor++;
      const nf = frame();
      // toca sozinho só até o fim do trecho atual
      if (!nf || nf.seg !== f.seg) g.playing = false;
      if (nf && nf.seg !== f.seg) focusCurrent();
      showArrow();
      render();
      if (!nf) toast('Montado! Parabéns!', 4000);
      if (g.playing) setTimeout(next, ctx.speed() * 300);
    });
  }

  function back() {
    if (view.busy) return;
    g.playing = false;
    if (g.phase === 'embaralhar') {
      if (g.scrIdx === 0) return;
      const mv = g.scramble[g.scrIdx - 1];
      animateMove({ name: mv.name, turns: -mv.turns }, () => {
        g.scrIdx--;
        showArrow();
        render();
      });
      return;
    }
    if (g.phase !== 'montar' || g.cursor === 0) return;
    const f = g.frames[g.cursor - 1];
    if (!f.move) {
      g.cursor--;
      focusCurrent();
      showArrow();
      render();
      return;
    }
    animateMove({ name: f.move.name, turns: -f.move.turns }, () => {
      g.cursor--;
      focusCurrent();
      showArrow();
      render();
    });
  }

  function play() {
    if (g.playing) {
      g.playing = false;
      render();
      return;
    }
    g.playing = true;
    render();
    next();
  }

  // ---------- tela ----------

  function stagesInfo() {
    const stages = solver().spec.stages;
    const cur = frame() ? stages.indexOf(frame().seg.stage) : stages.length;
    return { stages, cur };
  }

  function renderSidebar() {
    const list = $('#licoes');
    if (g.phase !== 'montar') {
      const stages = solver().spec.stages;
      list.innerHTML =
        `<li class="teclas" style="padding:4px 6px">As etapas que vamos fazer:</li>` +
        stages.map((s, i) => `<li><span class="etapa">${i + 1}. ${esc(s.title)}</span></li>`).join('');
      return;
    }
    const { stages, cur } = stagesInfo();
    list.innerHTML = stages
      .map((s, i) => {
        const cls = i < cur ? 'feita' : i === cur ? 'agora' : '';
        return `<li><span class="etapa ${cls}">${i < cur ? '✓ ' : `${i + 1}. `}${esc(s.title)}</span></li>`;
      })
      .join('');
  }

  const isCube = () => ctx.puzzleId().startsWith('cubo');
  const faceColor = (name) => def().faces.find((f) => f.name === name).color;
  const colorName = (name) => def().colorNames[name];

  function gripList() {
    return `<ul class="segurar">${GRIP[ctx.puzzleId()]
      .map(
        ([where, f]) =>
          `<li><span class="amostra" style="background:${faceColor(f)}"></span><span>${esc(where)}: <strong>${esc(colorName(f))}</strong></span></li>`,
      )
      .join('')}</ul>`;
  }

  function gripStrip() {
    const items = GRIP[ctx.puzzleId()].slice(0, 3);
    return `<div class="lembrete">
      <span>Segure sempre assim:</span>
      ${items
        .map(([where, f]) => `<span class="item"><span class="amostra mini" style="background:${faceColor(f)}"></span>${esc(where.replace(' para você', ''))}: ${esc(colorName(f))}</span>`)
        .join('')}
      <span class="nao-vire">Não vire o cubo inteiro: gire só a face que a seta mostra.</span>
    </div>`;
  }

  // desenho do cubo montado visto de cima, de frente e da direita
  function cubeDrawing() {
    const n = ctx.puzzleId() === 'cubo2' ? 2 : 3;
    const s = 26; // tamanho do quadradinho
    const ox = 40;
    const oy = 20 + n * s;
    const iso = (x, y, z) => [ox + (x - z) * s * 0.87 + n * s * 0.87, oy + (x + z) * s * 0.5 - y * s];
    const poly = (pts, color) =>
      `<polygon points="${pts.map((p) => p.join(',')).join(' ')}" fill="${color}" stroke="#111316" stroke-width="3" stroke-linejoin="round"/>`;
    let out = '';
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        out += poly([iso(i, n, j), iso(i + 1, n, j), iso(i + 1, n, j + 1), iso(i, n, j + 1)], faceColor('U'));
        out += poly([iso(i, n - j, n), iso(i + 1, n - j, n), iso(i + 1, n - j - 1, n), iso(i, n - j - 1, n)], faceColor('F'));
        out += poly([iso(n, n - j, n - i), iso(n, n - j, n - i - 1), iso(n, n - j - 1, n - i - 1), iso(n, n - j - 1, n - i)], faceColor('R'));
      }
    const w = 2 * n * s * 0.87 + 80;
    const h = 2 * n * s + 40;
    return `<svg class="desenho" viewBox="0 0 ${w} ${h}" role="img" aria-label="Cubo com amarelo em cima, verde na frente e laranja à direita">${out}</svg>`;
  }

  // cores atuais de uma face do cubo, em quadradinhos
  function faceGridHtml(face) {
    const st = ctx.state();
    const pieces = ctx.pieces();
    const n = ctx.puzzleId() === 'cubo2' ? 2 : 3;
    const h = n / 2;
    const cells = Array(n * n).fill('#333');
    pieces.forEach((p, i) => {
      p.stickers.forEach((sk, k) => {
        if (dot(st.stickerNormal(i, k), face.axis) < 0.99) return;
        const pos = rotate(st.quats[i], sk.center);
        const c = Math.round(dot(pos, face.col) + h - 0.5);
        const r = Math.round(dot(pos, face.row) + h - 0.5);
        if (c >= 0 && c < n && r >= 0 && r < n) cells[r * n + c] = faceColor(sk.face);
      });
    });
    return `<div class="grade-face"><span>${face.name}</span><div class="grade" style="grid-template-columns:repeat(${n},1fr)">${cells
      .map((c) => `<i style="background:${c}"></i>`)
      .join('')}</div></div>`;
  }

  function compareHtml() {
    if (!isCube()) return '';
    return `<details class="comparar" open>
      <summary>Compare com o seu cubo</summary>
      <div class="grades">${GRID_FACES.map(faceGridHtml).join('')}</div>
      <p class="teclas">É assim que o seu deve estar agora. Se alguma cor não bater, volte (◀) até onde estava igual.</p>
    </details>`;
  }

  function moveCard(mv, note) {
    return `<div class="giro-grande">
      <span class="mv">${esc(moveToString(mv))}</span>
      <span class="giro-texto">${esc(def().describe(mv))}${note ? `<small>${esc(note)}</small>` : ''}</span>
    </div>`;
  }

  function render() {
    renderSidebar();
    const p = $('#painel');
    if (g.phase === 'inicio') {
      p.innerHTML = `
        <p class="passo">Montar comigo</p>
        <h2>Vamos montar juntos, do começo ao fim!</h2>
        <ol class="como">
          <li><strong>Pegue seu ${esc(def().name.split(' (')[0].toLowerCase())} montado</strong> (cada face com uma cor só).</li>
          <li><strong>Segure do jeito certo:</strong> na próxima tela eu mostro qual cor fica em cima e qual fica de frente. Isso é muito importante!</li>
          <li><strong>Embaralhe junto comigo:</strong> eu mostro um giro de cada vez e você faz o mesmo no seu.</li>
          <li><strong>Depois eu te guio na montagem inteira</strong>, um giro de cada vez, com uma seta mostrando para onde girar. Cada etapa continua de onde a anterior parou.</li>
        </ol>
        <div class="controles">
          <button class="btn primario grande" id="g-com">Embaralhar junto comigo</button>
        </div>
        <div class="controles">
          <button class="btn primario grande" id="g-pintar">Meu cubo já está embaralhado: pintar as cores</button>
        </div>
        <div class="controles">
          <button class="btn" id="g-tela">Só na tela (embaralhar de uma vez)</button>
        </div>
        <p class="teclas">Seu cubo já está bagunçado? Escolha "pintar as cores": você pinta no modelo igual ao seu e eu te guio dali até o fim.</p>
      `;
      return;
    }
    if (g.phase === 'pintar') {
      p.innerHTML = paintHtml();
      return;
    }
    if (g.phase === 'segurar') {
      p.innerHTML = `
        <p class="passo">Antes de embaralhar</p>
        <h2>Segure o seu assim</h2>
        ${isCube() ? cubeDrawing() : ''}
        ${gripList()}
        <div class="agora-box"><strong>Importante</strong>${esc(ctx.holdText().charAt(0).toUpperCase() + ctx.holdText().slice(1))} Gire o seu inteiro na mão (sem mexer nas faces) até ficar igual. Depois disso, não vire mais: só gire a face que a seta mostrar.</div>
        ${ctx.puzzleId() === 'cubo3' ? '<p class="teclas">Dica: olhe as peças do meio de cada face (os centros). Elas nunca saem do lugar. O centro amarelo vai para cima e o centro verde fica virado para você.</p>' : ''}
        <div class="controles">
          <button class="btn" id="g-inicio">◀ Voltar</button>
          <button class="btn primario grande" id="g-segurei">Estou segurando assim ▶</button>
        </div>
      `;
      return;
    }
    if (g.phase === 'embaralhar') {
      const doneAll = g.scrIdx >= g.scramble.length;
      p.innerHTML = `
        <p class="passo">Embaralhando · giro ${Math.min(g.scrIdx + 1, g.scramble.length)} de ${g.scramble.length}</p>
        <h2>Embaralhe junto comigo</h2>
        <p>Faça no seu exatamente o giro que aparece. Siga a seta rosa no modelo. Vá com calma: se errar um giro, a montagem não vai bater.</p>
        ${gripStrip()}
        <div class="barra"><span style="width:${(100 * g.scrIdx) / g.scramble.length}%"></span></div>
        ${doneAll ? `<div class="parabens">Pronto, embaralhado! Confira se o seu está igual ao da tela (gire o modelo com o mouse para ver todos os lados).</div>` : moveCard(g.scramble[g.scrIdx])}
        <div class="alg">${g.scramble
          .map((m, i) => `<span class="${i < g.scrIdx ? 'feito' : i === g.scrIdx ? 'atual' : ''}">${esc(moveToString(m))}</span>`)
          .join('')}</div>
        <div class="controles">
          <button class="btn" id="g-voltar" ${g.scrIdx === 0 ? 'disabled' : ''}>◀ Voltar</button>
          <button class="btn primario grande" id="g-prox">${doneAll ? 'Agora vamos montar! ▶' : 'Próximo giro ▶'}</button>
        </div>
        ${doneAll ? '' : `<div class="controles"><button class="btn" id="g-tocar">${g.playing ? 'Pausar' : 'Fazer todos sozinho'}</button></div>`}
        ${compareHtml()}
        ${speedHtml()}
      `;
      return;
    }
    // montar
    const f = frame();
    const { stages, cur } = stagesInfo();
    const movesDone = g.frames.slice(0, g.cursor).filter((x) => x.move).length;
    if (!f) {
      p.innerHTML = `
        <p class="passo">Terminou!</p>
        <h2>Montado! Parabéns!</h2>
        <div class="parabens">Você montou com ${g.totalMoves} giros. Quer de novo? Cada vez o embaralhamento é diferente.</div>
        <div class="controles"><button class="btn primario grande" id="g-novo">Montar outro</button></div>
        <div class="controles"><button class="btn" id="g-voltar">◀ Voltar o último giro</button></div>
      `;
      return;
    }
    const seg = f.seg;
    const stage = seg.stage;
    const segFrames = g.frames.filter((x) => x.seg === seg && x.move);
    const isEnd = !f.move;
    const note = f.move && seg.label && f.i === 0 && seg.moves.length > 1 ? seg.label : '';
    p.innerHTML = `
      <p class="passo">Etapa ${cur + 1} de ${stages.length} · giro ${Math.min(movesDone + 1, g.totalMoves)} de ${g.totalMoves}</p>
      <h2>${esc(stage.title)}</h2>
      <div class="barra"><span style="width:${(100 * movesDone) / g.totalMoves}%"></span></div>
      ${gripStrip()}
      ${isEnd ? `<div class="parabens">${esc(seg.text)}</div>` : `
        <p class="etapa-intro">${esc(stage.intro)}</p>
        <div class="agora-box"><strong>Agora</strong>${esc(seg.text)}</div>
        ${moveCard(f.move, note)}
        <div class="alg">${segFrames
          .map((x) => `<span class="${x.i < f.i ? 'feito' : x.i === f.i ? 'atual' : ''}">${esc(moveToString(x.move))}</span>`)
          .join('')}</div>
        <p class="teclas">Neste trecho: giro ${f.i + 1} de ${segFrames.length}. A peça da vez está piscando.</p>
      `}
      <div class="controles">
        <button class="btn" id="g-voltar" ${g.cursor === 0 ? 'disabled' : ''}>◀ Voltar</button>
        <button class="btn primario grande" id="g-prox">${isEnd ? 'Continuar ▶' : 'Próximo giro ▶'}</button>
      </div>
      ${isEnd ? '' : `<div class="controles"><button class="btn" id="g-tocar">${g.playing ? 'Pausar' : 'Fazer este trecho sozinho'}</button></div>`}
      ${compareHtml()}
      ${speedHtml()}
      <p class="teclas">Atalhos: <kbd>→</kbd> próximo giro, <kbd>←</kbd> voltar. <button class="link" id="g-reiniciar">Recomeçar do zero</button></p>
    `;
  }

  function speedHtml() {
    return `<label class="velocidade">Velocidade
      <input type="range" id="vel" min="0.15" max="1.3" step="0.05" value="${1.45 - ctx.speed()}" />
    </label>`;
  }

  function click(b) {
    if (b.dataset.cor) {
      g.brush = b.dataset.cor;
      return render();
    }
    switch (b.id) {
      case 'g-com':
        g.phase = 'segurar';
        ctx.state().reset();
        view.sync(ctx.state());
        view.paint(null, null);
        view.clearArrow();
        view.resetCamera();
        return render();
      case 'g-segurei':
        return beginScramble(true);
      case 'g-inicio':
        return start();
      case 'g-pintar':
        return beginPaint();
      case 'g-pintado':
        return finishPaint();
      case 'g-limpar':
        g.paint = g.paint.map((c, k) => (fixedCenters() && ctx.pieces()[solver().fast.slots[k].piece].stickers.length === 1 ? c : null));
        g.paintError = '';
        refreshPaint();
        return render();
      case 'g-tela':
        return beginScramble(false);
      case 'g-prox':
        g.playing = false;
        return next();
      case 'g-voltar':
        return back();
      case 'g-tocar':
        return play();
      case 'g-novo':
      case 'g-reiniciar':
        return start();
    }
  }

  function key(e) {
    if (e.key === 'ArrowRight') {
      g.playing = false;
      next();
    } else if (e.key === 'ArrowLeft') back();
    else if (e.key === ' ') {
      e.preventDefault();
      play();
    }
  }

  return { start, render, click, key, renderSidebar };
}
