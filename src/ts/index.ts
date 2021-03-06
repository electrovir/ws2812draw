export {drawStill, cleanUp, drawFrame, init, drawSolidColor, Ws2812drawError} from './draw';
export {LedColor} from './color';
export {drawScrollingImage} from './scroll';
export type {DrawScrollOptions, ScrollEmitter} from './scroll';
export {drawText, drawScrollingText, textToColorMatrix} from './text';
export type {LetterOptions, AlignmentOptions} from './text';
export {registerCustomLetter, getSupportedLetters} from './letter';
export {MatrixPaddingOption} from './matrix';
import * as matrixImport from './matrix';
import * as colorImport from './color';

/**
 * A set of abstracted matrix operations
 */
export const matrix = matrixImport;
export const color = colorImport;
