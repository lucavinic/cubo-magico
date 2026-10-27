// Modo "Montar comigo": embaralha junto com a pessoa e depois guia a
// montagem inteira, um giro de cada vez, continuando de onde parou.

import { moveToString } from './engine/puzzle.js';
import { createSolver } from './solver/solver.js';

const solvers = {};

export function createGuide(ctx) {
  const { view, esc, toast, $ } = ctx;
  const g = {
    phase: 'inicio', // inicio | embaralhar | montar
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
    const names = Object.keys(d.moves).filter((n) => !(id === 'pyraminx' && n === n.toLowerCase()));
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

  function beginSolve() {
    const s = solver();
    const fs = s.fast.applyAll(s.fast.solved(), g.scramble);
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
          <li><strong>Pegue seu ${esc(def().name.split(' (')[0].toLowerCase())} montado</strong> e segure igual à tela: ${esc(ctx.holdText())}</li>
          <li><strong>Embaralhe junto comigo:</strong> eu mostro um giro de cada vez e você faz o mesmo no seu.</li>
          <li><strong>Depois eu te guio na montagem inteira</strong>, um giro de cada vez, com uma seta mostrando para onde girar. Cada etapa continua de onde a anterior parou.</li>
        </ol>
        <div class="controles">
          <button class="btn primario grande" id="g-com">Embaralhar junto comigo</button>
        </div>
        <div class="controles">
          <button class="btn" id="g-tela">Só na tela (embaralhar de uma vez)</button>
        </div>
        <p class="teclas">Seu cubo já está bagunçado? Por enquanto eu só sei guiar a partir do embaralhamento que eu mesmo faço. Monte o seu uma vez seguindo o modo "Aprender", ou acompanhe aqui na tela para treinar.</p>
      `;
      return;
    }
    if (g.phase === 'embaralhar') {
      const doneAll = g.scrIdx >= g.scramble.length;
      p.innerHTML = `
        <p class="passo">Embaralhando · giro ${Math.min(g.scrIdx + 1, g.scramble.length)} de ${g.scramble.length}</p>
        <h2>Embaralhe junto comigo</h2>
        <p>Faça no seu exatamente o giro que aparece. Siga a seta rosa no modelo. Vá com calma: se errar um giro, a montagem não vai bater.</p>
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
    switch (b.id) {
      case 'g-com':
        return beginScramble(true);
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
