// busca curta: node tools/buscar.mjs <puzzle> "<movimentos>" <prof> <condição js (s, pc)>
import { buildPuzzle, PuzzleState, moveToString } from '../src/engine/puzzle.js';
import { PUZZLES } from '../src/puzzles/index.js';
const [id, movesTxt, depthTxt, cond, limitTxt] = process.argv.slice(2);
const def = PUZZLES[id].def; const pieces = buildPuzzle(def);
const names = movesTxt.split(' '); const maxD = Number(depthTxt); const limit = Number(limitTxt||15);
const ok = new Function('s','pieces','solvedPiece','return ' + cond);
const solvedPiece = (s, faces) => { const i = pieces.findIndex(p => p.faces.slice().sort().join()===faces.split(',').sort().join()); return s.whereIs(i).every(x=>x.from===x.now); };
let found = 0;
function rec(s, seq, d) {
  if (found >= limit) return;
  if (seq.length && ok(s, pieces, solvedPiece)) { console.log(seq.map(moveToString).join(' ')); found++; }
  if (d === 0) return;
  for (const n of names) for (const t of [1,-1]) {
    const last = seq[seq.length-1]; if (last && last.name===n) continue;
    const c = s.clone(); c.apply({name:n,turns:t}); seq.push({name:n,turns:t}); rec(c, seq, d-1); seq.pop();
  }
}
for (let d=1; d<=maxD && found<limit; d++) { const s=new PuzzleState(def,pieces); rec2(s,[],d); }
function rec2(s, seq, d){ // apenas profundidade exata d
  if (found >= limit) return;
  if (d===0){ if (seq.length && ok(s,pieces,solvedPiece)){console.log(seq.map(moveToString).join(' ')); found++;} return; }
  for (const n of names) for (const t of [1,-1]) {
    const last = seq[seq.length-1]; if (last && last.name===n) continue;
    const c = s.clone(); c.apply({name:n,turns:t}); seq.push({name:n,turns:t}); rec2(c, seq, d-1); seq.pop();
  }
}
