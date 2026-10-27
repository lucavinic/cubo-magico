// node tools/testar-solver.mjs [puzzle] [quantos]
// embaralha muitas vezes, resolve e confere no motor de verdade
import { buildPuzzle, PuzzleState } from '../src/engine/puzzle.js';
import { PUZZLES } from '../src/puzzles/index.js';
import { createSolver } from '../src/solver/solver.js';
const ids = process.argv[2] && process.argv[2] !== 'todos' ? [process.argv[2]] : Object.keys(PUZZLES);
const N = Number(process.argv[3] || 50);
let fails = 0;
for (const id of ids) {
  const def = PUZZLES[id].def; const pieces = buildPuzzle(def);
  const solver = createSolver(id, def, pieces);
  const names = Object.keys(def.moves).filter((n) => !(id === 'pyraminx' && n === n.toLowerCase()));
  const lens = []; let tmax = 0; const t0 = Date.now();
  for (let r = 0; r < N; r++) {
    const scr = [];
    for (let i = 0; i < def.scrambleLength; i++) { const n = names[Math.floor(Math.random()*names.length)]; scr.push({ name: n, turns: Math.random() < .5 ? 1 : -1 }); }
    if (id === 'pyraminx') for (const t of ['u','l','r','b']) scr.push({ name: t, turns: Math.random()<.5?1:-1 });
    const t1 = Date.now();
    try {
      const segs = solver.solve(solver.fast.applyAll(solver.fast.solved(), scr));
      tmax = Math.max(tmax, Date.now()-t1);
      const all = segs.flatMap((s) => s.moves);
      const st = new PuzzleState(def, pieces); st.applyAlg(scr); st.applyAlg(all);
      if (!st.isSolved()) { fails++; console.log(id, 'NÃO MONTOU no motor'); }
      lens.push(all.length);
    } catch (e) { fails++; console.log(id, 'ERRO', e.message); }
  }
  const avg = lens.reduce((a,b)=>a+b,0)/Math.max(1,lens.length);
  console.log(`${id}: ${lens.length}/${N} ok, média ${avg.toFixed(0)} giros, máx ${Math.max(...lens)}, pior tempo ${tmax} ms, total ${Date.now()-t0} ms`);
}
console.log(fails ? `${fails} falha(s)` : 'Tudo certo.');
