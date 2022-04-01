import {overrideDefinedProperties} from '../augments/object';
import {LedColor} from '../color';
import {letterSpacer, monospacePadLetter, stringToLetterMatrix} from './letter';
import {appendMatrices, createMatrix, getMatrixSize, maskMatrix} from './matrix';
import {defaultTextOptions, LetterOptions} from './matrix-options';

/**
 * Converts a string into a color array that can be passed directly into draw functions.
 *
 * @param input String to convert
 * @param inputOptions Either an options object for the whole string or an array of options applied
 *   to each character If this array has less elements that there are characters in the input
 *   string, the last option will carry over into all following characters. See LetterOptions type
 *   for available options.
 * @returns Array of color values to be passed into draw methods
 */
export function textToColorMatrix(
    input: string,
    inputOptions: LetterOptions | LetterOptions[] = {},
): LedColor[][] {
    const options = Array.isArray(inputOptions)
        ? inputOptions.map((inputOption) =>
              overrideDefinedProperties(defaultTextOptions, inputOption),
          )
        : overrideDefinedProperties(defaultTextOptions, inputOptions);

    const letters = stringToLetterMatrix(input);
    let lastOptions: LetterOptions = defaultTextOptions;
    const coloredTextMatrix = letters
        .map((currentLetter, index) => {
            const currentOptions: LetterOptions =
                (Array.isArray(options) ? options[index] : options) || lastOptions;
            const isMonospace: boolean = !!currentOptions.monospace;
            const foregroundColor: LedColor =
                currentOptions.foregroundColor ??
                lastOptions.foregroundColor ??
                defaultTextOptions.foregroundColor;
            const backgroundColor: LedColor =
                currentOptions.backgroundColor ??
                lastOptions.backgroundColor ??
                defaultTextOptions.backgroundColor;

            const letterMatrix = isMonospace ? monospacePadLetter(currentLetter) : currentLetter;

            const dimensions = getMatrixSize(letterMatrix);
            const colors = createMatrix(dimensions, foregroundColor);

            // save off the current character's options in case the options array is only partially full
            lastOptions = currentOptions;
            const masked = maskMatrix(colors, letterMatrix, backgroundColor);
            return masked;
        })
        .reduce((accum: LedColor[][], currentLetterMatrix, index) => {
            const currentOptions =
                (Array.isArray(options) ? options[index] : options) ?? lastOptions;
            return appendMatrices(
                accum,
                letterSpacer(
                    currentOptions.backgroundColor ??
                        lastOptions.backgroundColor ??
                        defaultTextOptions.backgroundColor,
                ),
                currentLetterMatrix,
            );
        }, []);

    return coloredTextMatrix;
}
