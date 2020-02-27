export {drawStill, cleanUp, drawFrame, init, drawSolidColor} from './draw';
export {LedColor} from './color';
export {drawScrollingImage, DrawScrollOptions} from './scroll';
export {drawText, drawScrollingText, textToColorMatrix, LetterOptions, AlignmentOptions} from './text';
export {registerCustomLetter, getSupportedLetters} from './letter';
export {MatrixPaddingOption} from './matrix';
import * as matrixImport from './matrix';

/**
 * A set of abstracted matrix operations
 */
export const matrix = matrixImport;
