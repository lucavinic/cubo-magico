// node tools/buscar2.mjs <puzzle> "<faces>" <prof> "<peça alvo>" <alturaMax> [limite]
// acha sequências que mexem no alvo e em nada abaixo de alturaMax (altura = y do centro)
import { buildPuzzle, PuzzleState, moveToString } from '../src/engine/puzzle.js';
import { PUZZLES } from '../src/puzzles/index.js';
const [id, movesTxt, depthTxt, target, hTxt, limitTxt, turnsTxt] = process.argv.slice(2);
const def = PUZZLES[id].def; const pieces = buildPuzzle(def);
const names = movesTxt.split(' '); const maxD = Number(depthTxt); const hMax = Number(hTxt); const limit = Number(limitTxt||10);
const key = (f) => f.slice().sort().join();
const ti = pieces.findIndex(p => key(p.faces) === key(target.split('-')));
const gf = process.env.GUARD ? new Function('p','return '+process.env.GUARD) : ()=>true;
const guard = pieces.map((p,i)=>i).filter(i => i!==ti && pieces[i].stickers.length && pieces[i].center[1] < hMax && gf(pieces[i]));
const turns = turnsTxt ? turnsTxt.split(',').map(Number) : [1,-1];
let found = 0;
const okPiece = (s,i)=>s.pieces[i].stickers.every((_,k)=>s.stickerOk(i,k));
function rec(s, seq, d){
  if (found>=limit) return;
  if (d===0){ if (!okPiece(s,ti) && guard.every(i=>okPiece(s,i))){ console.log(seq.map(moveToString).join(' ')); found++; } return; }
  for (const n of names) for (const t of turns){
    const last=seq[seq.length-1]; if (last&&last.name===n) continue;
    const c=s.clone(); c.apply({name:n,turns:t}); seq.push({name:n,turns:t}); rec(c,seq,d-1); seq.pop();
  }
}
for (let d=1; d<=maxD && found<limit; d++) rec(new PuzzleState(def,pieces), [], d);
