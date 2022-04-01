import {LedColor} from '../color';
import {padMatrix} from '../matrix/matrix';
import {AlignmentOptions, LetterOptions} from '../matrix/matrix-options';
import {textToColorMatrix} from '../matrix/matrix-text';
import {drawStill} from './base-draw-api';

/**
 * Draw a string directly to the led display
 *
 * @param brightness     LED brightness for the display
 * @param input          string to draw
 * @param options        either an array of LetterOptions to be applied to each character or a single LetterOptions to
 *                          be applied to the whole string. See LetterOptions type for available options.
 * @returns              true if success, otherwise false
 */
export function drawText(
    brightness: number,
    input: string,
    options: LetterOptions | LetterOptions[] = {},
    alignmentOptions?: AlignmentOptions,
): void {
    let matrix = textToColorMatrix(input, options);
    if (alignmentOptions) {
        const padColor =
            alignmentOptions.padColor == undefined ? LedColor.Black : alignmentOptions.padColor;
        matrix = padMatrix(matrix, alignmentOptions.width, padColor, alignmentOptions.padding);
    }
    drawStill(brightness, matrix);
}
