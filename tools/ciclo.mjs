// procura 3-ciclo de cantos do topo do megaminx: padrão a b a' c a b' a' c'
import { buildPuzzle, PuzzleState, moveToString } from '../src/engine/puzzle.js';
import { PUZZLES } from '../src/puzzles/index.js';
const def = PUZZLES.megaminx.def; const pieces = buildPuzzle(def);
const okPiece = (s,i)=>s.pieces[i].stickers.every((_,k)=>s.stickerOk(i,k));
const F = ['U','F','R','L','BR','BL','DR','DL']; const T=[1,-1,2,-2];
for (const a of F) for (const b of F) for (const c of F) { if (a===b||a===c||b===c) continue;
 for (const i of T) for (const j of T) for (const k of T) {
  const seq=[[a,i],[b,j],[a,-i],[c,k],[a,i],[b,-j],[a,-i],[c,-k]].map(([name,turns])=>({name,turns}));
  const s=new PuzzleState(def,pieces); s.applyAlg(seq);
  const bad = pieces.map((p,x)=>x).filter(x=>pieces[x].stickers.length && !okPiece(s,x));
  if (bad.length===3 && bad.every(x=>pieces[x].stickers.length===3 && pieces[x].faces.includes('U'))) console.log(seq.map(moveToString).join(' '));
 }}
