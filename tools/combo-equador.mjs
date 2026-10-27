// procura combinações de algoritmos que encaixam a aresta verde-rosa vinda de cima "virada"
import { buildPuzzle, parseAlg, invertMoves, moveToString } from '../src/engine/puzzle.js';
import { PUZZLES } from '../src/puzzles/index.js';
import { createSolver } from '../src/solver/solver.js';
const def = PUZZLES.megaminx.def; const pieces = buildPuzzle(def);
const S = createSolver('megaminx', def, pieces); const fast = S.fast;
const key = (f) => f.slice().sort().join();
const id = (...f) => pieces.findIndex((p) => key(p.faces) === key(f));
const T = id('F','DR');
const guard = pieces.map((p,i)=>i).filter(i => i!==T && pieces[i].stickers.length && pieces[i].center[1] < 0.1);
const A1 = parseAlg("U' F2' U F2 U F2' U' F2"), A2 = parseAlg("U F2 U' F2' U' F2 U F2'");
const rel = (m, r) => m.map(x => ({ name: S.sym[r].moveMap[x.name], turns: x.turns }));
const algs = []; for (let r=0;r<5;r++){ algs.push(rel(A1,r)); algs.push(rel(A2,r)); }
const us = [[],[{name:'U',turns:1}],[{name:'U',turns:-1}],[{name:'U',turns:2}],[{name:'U',turns:-2}]];
const solved = fast.solved(); const seen = new Set();
for (const a of algs) for (const u of us) for (const b of algs) {
  const seq = [...a, ...u, ...b];
  const end = fast.applyAll(solved, seq);
  if (!guard.every(g => fast.pieceSolved(end, g)) || fast.pieceSolved(end, T)) continue;
  // início do caso = inverso aplicado no resolvido
  const st = fast.applyAll(solved, invertMoves(seq));
  if (!guard.every(g => fast.pieceSolved(st, g))) continue;
  const pl = fast.placement(st, T); const faces = pl.map(k => fast.slots[k].face);
  const yy = pl.map(k => pieces[fast.slots[k].piece].center[1]);
  if (yy[0] < 1) continue; // queremos a aresta no topo
  const sig = faces.join('/');
  if (seen.has(sig)) continue; seen.add(sig);
  console.log(sig.padEnd(8), seq.length, seq.map(moveToString).join(' '));
}
