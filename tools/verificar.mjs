// Confere todas as lições: no início, o que já deveria estar pronto está;
// a peça em foco está fora do lugar; no fim, tudo que aparece colorido está certo.
import { buildPuzzle, PuzzleState, parseAlg, invertMoves } from '../src/engine/puzzle.js';
import { PUZZLES } from '../src/puzzles/index.js';
let problems = 0;
for (const [id, { def, lessons }] of Object.entries(PUZZLES)) {
  const pieces = buildPuzzle(def);
  for (const lesson of lessons) {
    const colored = lesson.colored;
    for (const step of lesson.steps) {
      const moves = parseAlg(step.alg.replace(/\|/g, ' '));
      const s = new PuzzleState(def, pieces);
      s.applyAlg(step.setup !== undefined ? parseAlg(step.setup) : invertMoves(moves));
      const tag = `${id} / ${lesson.title} / ${step.title}`;
      const warn = (m) => { problems++; console.log('PROBLEMA', tag, '-', m); };
      if (step.setup === undefined) {
        const focus = step.focus || (() => false);
        if (!s.isSolved((p, f) => colored(p, f) && !focus(p))) warn('início: peças já prontas estão fora do lugar');
        if (step.focus && s.isSolved((p, f) => colored(p, f) && focus(p))) warn('início: peça em foco já está certa');
        if (s.isSolved((p, f) => colored(p, f))) warn('início já resolvido');
      }
      s.applyAlg(moves);
      if (step.setup === undefined && !s.isSolved((p, f) => colored(p, f))) warn('fim: não resolve');
      if (step.notes && step.notes.length > moves.length) warn('mais notas que movimentos');
      if (step.focus && !pieces.some((p) => step.focus(p))) warn('foco não acha peça');
    }
  }
  console.log(id, 'ok:', lessons.length, 'lições');
}
console.log(problems ? `${problems} problema(s)` : 'Tudo certo.');
