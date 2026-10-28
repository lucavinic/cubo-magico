import { buildPuzzle } from '../src/engine/puzzle.js';
import { PUZZLES } from '../src/puzzles/index.js';
import { createSolver } from '../src/solver/solver.js';
import { stateFromColors } from '../src/solver/fromColors.js';
for (const id of ['cubo3', 'pyraminx', 'megaminx']) {
  const def = PUZZLES[id].def; const pieces = buildPuzzle(def);
  const S = createSolver(id, def, pieces); const fast = S.fast; const names = Object.keys(def.moves);
  let refused = 0; let tmax = 0;
  for (let r = 0; r < 20; r++) {
    const scr = Array.from({ length: def.scrambleLength }, () => ({ name: names[Math.floor(Math.random() * names.length)], turns: 1 }));
    const fs = fast.applyAll(fast.solved(), scr);
    const paint = Array.from(fs, (st) => fast.slots[st].face);
    const e = pieces.findIndex((p) => p.stickers.length === 2); const sl = fast.pieceSlots[e];
    [paint[sl[0]], paint[sl[1]]] = [paint[sl[1]], paint[sl[0]]];
    const res = stateFromColors(fast, pieces, paint, (i) => S.spec.pieceName(i), (f) => def.colorNames[f]);
    const t = Date.now(); let threw = !!res.error;
    if (!res.error) { try { S.solve(res.state); } catch { threw = true; } }
    tmax = Math.max(tmax, Date.now() - t); if (threw) refused++;
  }
  console.log(`${id}: aresta virada recusada ${refused}/20, pior tempo ${tmax} ms`);
  if (refused < 20) process.exitCode = 1;
}
