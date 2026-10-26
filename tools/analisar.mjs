// uso: node tools/analisar.mjs cubo3 "R U R' U'" [setup]
// mostra quais peças o algoritmo muda (partindo do resolvido)
import { buildPuzzle, PuzzleState, parseAlg, invertMoves } from '../src/engine/puzzle.js';
import { PUZZLES } from '../src/puzzles/index.js';
const [id, alg, mode] = process.argv.slice(2);
const def = PUZZLES[id].def;
const pieces = buildPuzzle(def);
const s = new PuzzleState(def, pieces);
let mv = parseAlg(alg);
if (mode === 'inv') mv = invertMoves(mv);
s.applyAlg(mv);
for (let i=0;i<pieces.length;i++){
  const w = s.whereIs(i);
  if (w.every(x=>x.from===x.now)) continue;
  console.log(w.map(x=>x.from).join('') .padEnd(9), '->', w.map(x=>x.from+'@'+x.now).join(' '));
}
