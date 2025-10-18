import type { CharacterMap } from '../types';
import { doubleStruckMap } from './maps/doubleStruckMap';
import { frakturMap } from './maps/frakturMap';
import { italicBoldMap } from './maps/italicBoldMap';
import { monospaceMap } from './maps/monospaceMap';
import { sansSerifMap } from './maps/sansSerifMap';
import { scriptMap } from './maps/scriptMap';

export const fancyCharMap: CharacterMap = {
  ...scriptMap,
  ...frakturMap,
  ...doubleStruckMap,
  ...sansSerifMap,
  ...monospaceMap,
  ...italicBoldMap,
};

export {
    doubleStruckMap, frakturMap, italicBoldMap, monospaceMap, sansSerifMap, scriptMap
};

