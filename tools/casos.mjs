// node tools/casos.mjs <puzzle> "<faces>" <prof> "<alvo>" <alturaMax> [turns]
// para cada lugar/orientação do alvo (no início = inverso do alg), o alg mais curto
import { buildPuzzle, PuzzleState, moveToString, invertMoves } from '../src/engine/puzzle.js';
import { PUZZLES } from '../src/puzzles/index.js';
const [id, movesTxt, depthTxt, target, hTxt, turnsTxt] = process.argv.slice(2);
const def = PUZZLES[id].def; const pieces = buildPuzzle(def);
const key = (f) => f.slice().sort().join();
const ti = pieces.findIndex(p => key(p.faces) === key(target.split('-')));
const hMax = Number(hTxt);
const gf = process.env.GUARD ? new Function('p','return '+process.env.GUARD) : ()=>true;
const guard = pieces.map((p,i)=>i).filter(i => i!==ti && pieces[i].stickers.length && pieces[i].center[1] < hMax && gf(pieces[i]));
const okPiece = (s,i)=>s.pieces[i].stickers.every((_,k)=>s.stickerOk(i,k));
const names = movesTxt.split(' '); const turns = turnsTxt ? turnsTxt.split(',').map(Number) : [1,-1];
const best = new Map();
function rec(s, seq, d){
  if (seq.length && !okPiece(s,ti) && guard.every(i=>okPiece(s,i))) {
    // onde o alvo está no início: aplica o inverso a partir do resolvido
    const t = new PuzzleState(def,pieces); t.applyAlg(invertMoves(seq));
    const sig = t.whereIs(ti).map(x=>x.from+'@'+x.now).join(' ');
    if (!best.has(sig)) best.set(sig, seq.map(moveToString).join(' '));
  }
  if (d===0) return;
  for (const n of names) for (const tt of turns){
    const last=seq[seq.length-1]; if (last&&last.name===n) continue;
    const c=s.clone(); c.apply({name:n,turns:tt}); seq.push({name:n,turns:tt}); rec(c,seq,d-1); seq.pop();
  }
}
// busca por profundidade crescente para pegar o mais curto
for (let d=1; d<=Number(depthTxt); d++) { const s=new PuzzleState(def,pieces); (function r(s,seq,dd){ if(dd===0){ rec(s,seq,0); return;} for (const n of names) for (const tt of turns){ const last=seq[seq.length-1]; if(last&&last.name===n) continue; const c=s.clone(); c.apply({name:n,turns:tt}); seq.push({name:n,turns:tt}); r(c,seq,dd-1); seq.pop(); } })(s,[],d); }
for (const [sig, alg] of best) console.log(sig.padEnd(28), '|', alg);
