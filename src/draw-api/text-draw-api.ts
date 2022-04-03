import {LedColor} from '../color';
import {padMatrix} from '../matrix/matrix';
import {AlignmentOptions, LetterOptions} from '../matrix/matrix-options';
import {textToColorMatrix} from '../matrix/matrix-text';
import {drawStillImage} from './base-draw-api';

/**
 * Draw a string directly to the led display.
 *
 * @returns True if success, otherwise false
 */
export function drawText({
    brightness,
    text,
    letterOptions = {},
    alignmentOptions,
}: {
    /** Brightness of the LEDs. */
    brightness: number;
    /** Text to draw on the LEDs. */
    text: string;
    /**
     * Options for how the text will be rendered. Either a single object for the whole text string
     * or an array of objects, for each letter.
     */
    letterOptions?: LetterOptions | LetterOptions[] | undefined;
    /** Options for how the text will be aligned. */
    alignmentOptions?: AlignmentOptions | undefined;
}): boolean {
    let matrix = textToColorMatrix(text, letterOptions);
    if (alignmentOptions) {
        const padColor =
            alignmentOptions.padColor == undefined ? LedColor.Black : alignmentOptions.padColor;
        matrix = padMatrix(matrix, alignmentOptions.width, padColor, alignmentOptions.padding);
    }
    return drawStillImage({brightness, imageMatrix: matrix});
}
