// testa o padrão a b a' b' a' c a c' (como U R U' R' U' F' U F) com todas as faces
import { buildPuzzle, PuzzleState, moveToString } from '../src/engine/puzzle.js';
import { PUZZLES } from '../src/puzzles/index.js';
const [id, target, hTxt, facesTxt] = process.argv.slice(2);
const def = PUZZLES[id].def; const pieces = buildPuzzle(def);
const key = (f) => f.slice().sort().join();
const ti = pieces.findIndex(p => key(p.faces) === key(target.split('-')));
const hMax = Number(hTxt);
const guard = pieces.map((p,i)=>i).filter(i => i!==ti && pieces[i].stickers.length && pieces[i].center[1] < hMax);
const okPiece = (s,i)=>s.pieces[i].stickers.every((_,k)=>s.stickerOk(i,k));
const F = facesTxt ? facesTxt.split(' ') : Object.keys(def.moves);
const T = [1,-1,2,-2];
const out = new Set();
for (const a of F) for (const b of F) for (const c of F) {
  if (a===b||a===c) continue;
  for (const i of T) for (const j of T) for (const k of T) {
    const seq=[[a,i],[b,j],[a,-i],[b,-j],[a,-i],[c,k],[a,i],[c,-k]].map(([name,turns])=>({name,turns}));
    const s=new PuzzleState(def,pieces); s.applyAlg(seq);
    if (!okPiece(s,ti) && guard.every(g=>okPiece(s,g))) out.add(seq.map(moveToString).join(' '));
  }
}
console.log([...out].slice(0,20).join('\n'), '\ntotal', out.size);
