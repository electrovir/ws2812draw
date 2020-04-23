import {LedColor} from './color';
import {stringToLetterMatrix, monospacePadLetter, emptyLetter, letterSpacer} from './letter';
import {getMatrixSize, createMatrix, maskMatrix, appendMatrices, MatrixPaddingOption, padMatrix} from './matrix';
import {drawStill} from './draw';
import {DrawScrollOptions, drawScrollingImage, ScrollEmitter} from './scroll';
import {overrideDefinedProperties} from './util/object';

/**
 * Options for drawing strings or characters.
 * defaults (copied from defaultTextOptions):
 *      foregroundColor: LedColor.WHITE,
 *      backgroundColor: LedColor.BLACK,
 *      monospace: false,
 */
export type LetterOptions = Partial<{
    foregroundColor: LedColor;
    backgroundColor: LedColor;
    monospace: boolean;
}>;

const defaultTextOptions: Required<LetterOptions> = {
    foregroundColor: LedColor.WHITE,
    backgroundColor: LedColor.BLACK,
    monospace: false,
};

export type AlignmentOptions = {
    width: number;
    padding: MatrixPaddingOption;
    padColor?: LedColor;
};

/**
 * Converts a string into a color array that can be passed directly into draw functions.
 *
 * @param input          string to convert
 * @param inputOptions   either an options object for the whole string or an array of options applied to each character
 *                          If this array has less elements that there are characters in the input string, the last
 *                          option will carry over into all following characters.
 *                          See LetterOptions type for available options.
 * @returns              array of color values to be passed into draw methods
 */
export function textToColorMatrix(input: string, inputOptions: LetterOptions | LetterOptions[] = {}): LedColor[][] {
    const options = Array.isArray(inputOptions)
        ? inputOptions.map(inputOption => overrideDefinedProperties(defaultTextOptions, inputOption))
        : overrideDefinedProperties(defaultTextOptions, inputOptions);

    const letters = stringToLetterMatrix(input);
    let lastOptions = {};
    const coloredTextMatrix = letters
        .map((currentLetter, index) => {
            const currentOptions = (Array.isArray(options) ? options[index] : options) || lastOptions;
            const isMonospace = currentOptions.monospace;
            const foregroundColor = currentOptions.foregroundColor;
            const backgroundColor = currentOptions.backgroundColor;

            const letterMatrix = isMonospace ? monospacePadLetter(currentLetter) : currentLetter;

            const {height, width} = getMatrixSize(letterMatrix);
            const colors = createMatrix(height, width, foregroundColor);

            if (currentOptions) {
                // save off the current character's options in case the options array is only partially full
                lastOptions = currentOptions;
            }
            return maskMatrix(colors, letterMatrix, backgroundColor);
        })
        .reduce((accum: LedColor[][] | undefined, currentLetterMatrix, index) => {
            const currentOptions = (Array.isArray(options) ? options[index] : options) || lastOptions;
            return appendMatrices(
                appendMatrices(!!accum ? accum : emptyLetter, letterSpacer(currentOptions.backgroundColor)),
                currentLetterMatrix,
            );
        });

    return coloredTextMatrix;
}

/**
 * Draw a string directly to the led display
 *
 * @param input          string to draw
 * @param brightness     LED brightness for the display
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
        const padColor = alignmentOptions.padColor == undefined ? LedColor.BLACK : alignmentOptions.padColor;
        matrix = padMatrix(matrix, alignmentOptions.width, padColor, alignmentOptions.padding);
    }
    drawStill(brightness, matrix);
}

/**
 * Draw text and have it scroll across the LED display like a <marquee>
 *
 * @param input             string to scroll
 * @param width             pixel count of LED display's width
 * @param brightness        brightness for LED display
 * @param letterOptions     either an array of LetterOptions to be applied to each character or a single LetterOptions to
 *                              be applied to the whole string. See LetterOptions type for available options.
 * @param scrollOptions     options for scrolling. See DrawScrollOptions type for available options.
 * @returns                 a promise that is resolved once the scrolling has finished. If the scroll count is set to
 *                              infinite (the default) it will never resolve.
 */
export function drawScrollingText(
    width: number,
    brightness: number,
    input: string,
    letterOptions: LetterOptions | LetterOptions[] = {},
    scrollOptions: DrawScrollOptions = {},
): ScrollEmitter {
    const matrix = textToColorMatrix(input + ' ', letterOptions);
    return drawScrollingImage(width, brightness, matrix, scrollOptions);
}
