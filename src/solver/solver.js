// Resolvedor pelo método de camadas das lições. Ele monta o quebra-cabeça
// peça por peça, e cada trecho vira um "segmento" com texto explicando
// o que está acontecendo, para o modo "Montar comigo".
//
// Tipos de etapa (definidas em specs.js):
//  pieces: uma peça de cada vez. Primeiro leva a peça com giros "livres"
//          (que não estragam o que já está pronto), depois usa um algoritmo
//          da lição para encaixar. Se a peça estiver presa, tira antes.
//  search: procura curta com giros simples (ex.: arestas da Pyraminx).
//  macro:  combina algoritmos inteiros até a condição da etapa valer.
//  twist:  o último passo (repetir R' D' R D em cada canto e girar o topo).

import { parseAlg, invertMoves, moveToString } from '../engine/puzzle.js';
import { buildFast } from '../engine/fast.js';
import { buildSpec } from './specs.js';
import { norm, dot, len, sub, rotate, quatAxisAngle } from '../engine/math.js';

const algText = (moves) => moves.map(moveToString).join(' ');

// simetria: girar o quebra-cabeça inteiro em volta do eixo vertical
function buildSymmetry(def, pieces, order) {
  const names = Object.keys(def.moves);
  const maps = [];
  for (let r = 0; r < order; r++) {
    const q = quatAxisAngle([0, 1, 0], (-2 * Math.PI * r) / order);
    const moveMap = {};
    for (const n of names) {
      const a = rotate(q, norm(def.moves[n].axis));
      moveMap[n] = names.find(
        (m) => Math.abs(def.moves[m].dist - def.moves[n].dist) < 1e-6 && dot(norm(def.moves[m].axis), a) > 0.999,
      );
    }
    const pieceMap = pieces.map((p) => {
      const c = rotate(q, p.center);
      let best = -1;
      let bd = Infinity;
      pieces.forEach((o, j) => {
        const d = len(sub(o.center, c));
        if (d < bd && o.stickers.length === p.stickers.length) {
          bd = d;
          best = j;
        }
      });
      return best;
    });
    maps.push({ moveMap, pieceMap });
  }
  return maps;
}

export function createSolver(id, def, pieces) {
  const fast = buildFast(def, pieces);
  const spec = buildSpec(id, def, pieces, fast);
  const sym = buildSymmetry(def, pieces, spec.symmetry);
  const solvedState = fast.solved();
  const names = Object.keys(def.moves);

  const relabel = (moves, r) => moves.map((m) => ({ name: sym[r].moveMap[m.name], turns: m.turns }));

  // modelos de encaixe (algoritmo + onde a peça precisa estar), em todas as rotações
  function expandTemplates(list) {
    const out = [];
    for (const t of list || []) {
      const base = parseAlg(t.alg);
      for (let r = 0; r < spec.symmetry; r++) {
        const moves = relabel(base, r);
        const target = sym[r].pieceMap[t.target];
        const start = fast.applyAll(solvedState, invertMoves(moves));
        const one = t.reps ? relabel(parseAlg(t.one), r) : null;
        out.push({
          moves,
          target,
          placement: fast.placement(start, target).join(','),
          label: t.reps > 1 ? `Repita ${algText(one)} — ${t.reps} vezes` : algText(moves),
          hint: t.hint,
        });
      }
    }
    return out;
  }

  const singles = [];
  for (const n of names) for (const t of spec.turns) singles.push({ name: n, turns: t });

  function movesTouch(mv, slotSet) {
    const map = fast.moveMap(mv.name, mv.turns);
    for (const k of slotSet) if (map[k] !== k) return true;
    return false;
  }

  // caminho mais curto de uma peça só, usando giros livres
  function bfsPiece(state, piece, free, goals) {
    const startPl = fast.placement(state, piece);
    const startKey = startPl.join(',');
    if (goals.has(startKey)) return { path: [], goal: startKey };
    const seen = new Map([[startKey, null]]);
    let frontier = [startPl];
    for (let depth = 0; depth < 8 && frontier.length; depth++) {
      const next = [];
      for (const pl of frontier) {
        for (const mv of free) {
          const map = fast.moveMap(mv.name, mv.turns);
          const np = pl.map((k) => map[k]);
          const key = np.join(',');
          if (seen.has(key)) continue;
          seen.set(key, { from: pl.join(','), mv });
          if (goals.has(key)) {
            const path = [];
            let cur = key;
            while (seen.get(cur)) {
              path.unshift(seen.get(cur).mv);
              cur = seen.get(cur).from;
            }
            return { path, goal: key };
          }
          next.push(np);
        }
      }
      frontier = next;
    }
    return null;
  }

  function solvePiece(state, target, preserved, templates, stage) {
    const preservedSlots = preserved.flatMap((p) => fast.pieceSlots[p]);
    const free = singles.filter((mv) => !movesTouch(mv, preservedSlots));
    const goalsFor = templates.filter((t) => t.target === target);
    const goals = new Map();
    goals.set(fast.pieceSlots[target].join(','), null); // já no lugar
    for (const g of goalsFor) if (!goals.has(g.placement)) goals.set(g.placement, g);
    const keep = (s) => preserved.every((p) => fast.pieceSolved(s, p));

    const attempt = (s, prefix) => {
      const r = bfsPiece(s, target, free, new Set(goals.keys()));
      if (!r) return null;
      const g = goals.get(r.goal);
      const insert = g ? g.moves : [];
      const end = fast.applyAll(fast.applyAll(s, r.path), insert);
      if (!fast.pieceSolved(end, target) || !keep(end)) return null;
      return { extract: prefix, path: r.path, template: g, end, total: prefix.length + r.path.length + insert.length };
    };

    let best = attempt(state, []);
    if (best) return best;

    // peça presa: tirar com um algoritmo da etapa ou com "abre, gira, fecha"
    const nonFree = singles.filter((mv) => movesTouch(mv, preservedSlots) && Math.abs(mv.turns) === 1);
    const extractors = [
      ...templates.map((t) => t.moves),
      ...(stage.extractTemplates || []).map((t) => t.moves),
      ...nonFree.flatMap((a) => free.map((b) => [a, b, { name: a.name, turns: -a.turns }])),
    ];
    for (let level = 1; level <= 2 && !best; level++) {
      const queue = level === 1 ? extractors.map((e) => [e]) : extractors.flatMap((e) => extractors.map((f) => [e, f]));
      for (const combo of queue) {
        const moves = combo.flat();
        if (best && moves.length >= best.total) continue;
        const s1 = fast.applyAll(state, moves);
        if (!keep(s1) || fast.pieceSolved(s1, target)) {
          if (fast.pieceSolved(s1, target) && keep(s1)) {
            const r = { extract: [], path: moves, template: null, end: s1, total: moves.length };
            if (!best || r.total < best.total) best = r;
          }
          continue;
        }
        const r = attempt(s1, moves);
        if (r && (!best || r.total < best.total)) best = r;
      }
    }
    return best;
  }

  // procura com giros simples (profundidade crescente)
  function searchPiece(state, ok, moves, maxDepth) {
    const seq = [];
    function rec(s, d) {
      if (d === 0) return ok(s);
      for (const mv of moves) {
        const last = seq[seq.length - 1];
        if (last && last.name === mv.name) continue;
        seq.push(mv);
        if (rec(fast.apply(s, mv), d - 1)) return true;
        seq.pop();
      }
      return false;
    }
    for (let d = 0; d <= maxDepth; d++) if (rec(state, d)) return seq.slice();
    return null;
  }

  // combina algoritmos inteiros (com giros do topo entre eles)
  function searchMacro(state, ok, macros, maxDepth) {
    const used = [];
    function rec(s, d) {
      if (d === 0) return ok(s);
      for (const m of macros) {
        const last = used[used.length - 1];
        if (last && last.single && m.single) continue;
        used.push(m);
        if (rec(fast.applyAll(s, m.moves), d - 1)) return true;
        used.pop();
      }
      return false;
    }
    for (let d = 0; d <= maxDepth; d++) if (rec(state, d)) return used.slice();
    return null;
  }

  function solve(startState) {
    let state = startState;
    const segments = [];
    const done = [...(spec.alwaysSolved || [])];
    const push = (seg) => {
      if (!seg.moves.length) return;
      segments.push(seg);
      state = fast.applyAll(state, seg.moves);
    };

    for (const stage of spec.stages) {
      const keep = (s) => done.every((p) => fast.pieceSolved(s, p));
      if (stage.kind === 'pieces') {
        const templates = expandTemplates(stage.templates);
        stage.extractTemplates = expandTemplates(stage.extract);
        for (const target of stage.targets) {
          if (fast.pieceSolved(state, target)) {
            done.push(target);
            continue;
          }
          const r = solvePiece(state, target, done, templates, stage);
          if (!r) throw new Error(`Não achei solução: ${stage.id} / peça ${target}`);
          const name = spec.pieceName(target);
          if (r.extract.length) push({ stage, target, kind: 'tirar', moves: r.extract, text: stage.texts.extract(name) });
          if (r.path.length) push({ stage, target, kind: 'levar', moves: r.path, text: r.template ? stage.texts.bring(name) : stage.texts.direct(name) });
          if (r.template) push({ stage, target, kind: 'encaixar', moves: r.template.moves, text: stage.texts.insert(name, r.template), label: r.template.label });
          if (!fast.pieceSolved(state, target)) throw new Error(`Peça não ficou certa: ${stage.id}`);
          done.push(target);
        }
      } else if (stage.kind === 'search') {
        const moves = singles.filter((m) => stage.moves.includes(m.name));
        for (const target of stage.targets) {
          if (fast.pieceSolved(state, target)) {
            done.push(target);
            continue;
          }
          const ok = (s) => fast.pieceSolved(s, target) && keep(s);
          const seq = searchPiece(state, ok, moves, stage.maxDepth);
          if (!seq) throw new Error(`Não achei solução: ${stage.id}`);
          push({ stage, target, kind: 'encaixar', moves: seq, text: stage.texts.piece(spec.pieceName(target)) });
          done.push(target);
        }
      } else if (stage.kind === 'macro') {
        const macros = [];
        for (const a of stage.algs) {
          const base = parseAlg(a.alg);
          const rots = a.rotate ? spec.symmetry : 1;
          for (let r = 0; r < rots; r++) {
            const moves = relabel(base, r);
            macros.push({ moves, label: algText(moves), text: a.text, single: false });
          }
        }
        for (const s of stage.singles || []) {
          const moves = parseAlg(s);
          macros.push({ moves, label: s, text: stage.texts.adjust, single: true });
        }
        const ok = (s) => stage.goal(fast, s) && keep(s);
        if (!ok(state)) {
          const used = searchMacro(state, ok, macros, stage.maxDepth);
          if (!used) throw new Error(`Não achei solução: ${stage.id}`);
          for (const m of used) push({ stage, kind: m.single ? 'levar' : 'encaixar', moves: m.moves, text: m.text, label: m.label });
        }
        for (const p of stage.solves) if (!done.includes(p)) done.push(p);
      } else if (stage.kind === 'twist') {
        const trig = parseAlg(stage.trig);
        const up = parseAlg(stage.up);
        for (let i = 0; i < stage.count; i++) {
          let reps = 0;
          let probe = state;
          while (fast.faceAt(probe, stage.watchSlot) !== stage.upFace) {
            probe = fast.applyAll(probe, trig);
            reps++;
            if (reps > 12) throw new Error('Giro de canto sem fim');
          }
          if (reps) {
            const moves = Array.from({ length: reps }, () => trig).flat();
            push({ stage, kind: 'encaixar', moves, text: stage.texts.twist(reps), label: `Repita ${algText(trig)} — ${reps} vezes` });
          }
          if (i < stage.count - 1) push({ stage, kind: 'levar', moves: up, text: stage.texts.next });
        }
        // alinhar o topo no fim
        for (let k = 0; k < stage.count; k++) {
          if (fast.pieceSolved(state, stage.alignCheck)) break;
          push({ stage, kind: 'levar', moves: up, text: stage.texts.align });
        }
        for (const p of stage.solves) if (!done.includes(p)) done.push(p);
      }
      segments.push({ stage, kind: 'fim', moves: [], text: stage.texts.done });
    }
    const allSolved = fast.pieces.every((p, i) => !p.stickers.length || fast.pieceSolved(state, i));
    if (!allSolved) throw new Error('Terminou sem montar tudo');
    return segments;
  }

  return { fast, solve, sym, spec };
}
