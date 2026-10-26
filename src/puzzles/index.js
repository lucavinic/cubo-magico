import { cube3Def, cube2Def } from './cubes.js';
import { pyraminxDef } from './pyraminx.js';
import { megaminxDef } from './megaminx.js';
import { cube3Lessons, cube2Lessons } from './lessons-cubes.js';
import { pyraminxLessons } from './lessons-pyraminx.js';
import { megaminxLessons } from './lessons-megaminx.js';

export const PUZZLES = {
  cubo3: { def: cube3Def, lessons: cube3Lessons },
  cubo2: { def: cube2Def, lessons: cube2Lessons },
  pyraminx: { def: pyraminxDef, lessons: pyraminxLessons },
  megaminx: { def: megaminxDef, lessons: megaminxLessons },
};
