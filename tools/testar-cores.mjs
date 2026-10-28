// confere a leitura das cores pintadas: embaralha, "pinta" igual, reconstrói e monta
import { buildPuzzle, PuzzleState } from '../src/engine/puzzle.js';
import { PUZZLES } from '../src/puzzles/index.js';
import { createSolver } from '../src/solver/solver.js';
import { stateFromColors } from '../src/solver/fromColors.js';
import { dot, rotate } from '../src/engine/math.js';
let fails = 0;
for (const id of Object.keys(PUZZLES)) {
  const def = PUZZLES[id].def; const pieces = buildPuzzle(def);
  const S = createSolver(id, def, pieces); const fast = S.fast;
  const names = Object.keys(def.moves);
  const nm = (i) => S.spec.pieceName(i); const cn = (f) => def.colorNames[f];
  let ok = 0, unsolvable = 0, mirrored = 0;
  for (let r = 0; r < 40; r++) {
    const scr = Array.from({ length: def.scrambleLength }, () => ({ name: names[Math.floor(Math.random() * names.length)], turns: Math.random() < .5 ? 1 : -1 }));
    const fs = fast.applyAll(fast.solved(), scr);
    const paint = Array.from(fs, (st) => fast.slots[st].face);
    const res = stateFromColors(fast, pieces, paint, nm, cn);
    if (res.error) { fails++; console.log(id, 'erro inesperado:', res.error); continue; }
    const same = res.state.every((v, k) => v === fs[k]);
    // quatérnios batem com o motor 3D?
    const ps = new PuzzleState(def, pieces); ps.applyAlg(scr);
    const qok = pieces.every((p, i) => p.stickers.every((st) => dot(rotate(res.quats[i], st.normal), rotate(ps.quats[i], st.normal)) > 0.99));
    if (!same || !qok) { fails++; console.log(id, 'estado diferente', same, qok); continue; }
    const segs = S.solve(res.state);
    const ps2 = new PuzzleState(def, pieces); ps2.quats = res.quats.map((q) => q.slice()); ps2.applyAlg(segs.flatMap((s) => s.moves));
    if (!ps2.isSolved()) { fails++; console.log(id, 'não montou a partir da pintura'); continue; }
    ok++;
    // erro 1: girar as cores de um canto (impossível de montar)
    const c = pieces.findIndex((p) => p.stickers.length === 3);
    const sl = fast.pieceSlots[c]; const bad = paint.slice();
    [bad[sl[0]], bad[sl[1]], bad[sl[2]]] = [paint[sl[1]], paint[sl[2]], paint[sl[0]]];
    const r1 = stateFromColors(fast, pieces, bad, nm, cn);
    let threw = false; if (!r1.error) { try { S.solve(r1.state); } catch { threw = true; } }
    if (r1.error || threw) unsolvable++;
    // erro 2: trocar duas cores de um canto (ordem espelhada)
    const bad2 = paint.slice(); [bad2[sl[0]], bad2[sl[1]]] = [paint[sl[1]], paint[sl[0]]];
    if (stateFromColors(fast, pieces, bad2, nm, cn).error) mirrored++;
  }
  // na Pyraminx girar uma ponta ou um centro é permitido, então esse teste não se aplica
  const torcido = id === 'pyraminx' ? 'não se aplica' : `${unsolvable}/40`;
  if (id !== 'pyraminx' && unsolvable < 40) fails++;
  if (mirrored < 40) fails++;
  console.log(`${id}: ${ok}/40 reconstruídos e montados; canto torcido recusado ${torcido}; cores espelhadas recusadas ${mirrored}/40`);
}
console.log(fails ? `${fails} falha(s)` : 'Tudo certo.');
