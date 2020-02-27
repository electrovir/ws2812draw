import {LedColor} from './color';
import {padMatrix, chopMatrix, appendMatrices, MatrixPaddingOption} from './matrix';
import {drawStill} from './draw';
import {overrideDefinedProperties} from './util/object';

/**
 * Options for scrolling.
 * defaults (copied from defaultScrollOptions):
 *     scrollCount: -1, // -1 means infinite
 *     frameDelayMs: 100,
 *     iterationDelayMs: 0,
 *     padding: MatrixPaddingOption.LEFT,
 *     backgroundColor: LedColor.BLACK,
 *     stopPromise: null;
 */
export type DrawScrollOptions = Partial<{
    scrollCount: number;
    frameDelayMs: number;
    iterationDelayMs: number;
    padding: MatrixPaddingOption;
    padBackgroundColor: LedColor;
    stopPromise: Promise<void> | null | undefined;
}>;

const defaultScrollOptions: Required<DrawScrollOptions> = {
    scrollCount: -1, // -1 means infinite
    frameDelayMs: 100,
    iterationDelayMs: 0,
    padding: MatrixPaddingOption.LEFT,
    padBackgroundColor: LedColor.BLACK,
    stopPromise: null,
};

/**
 * Scrolls an image (color matrix) horizontally leftwards across the LED display
 *
 * @param matrix             color matrix to scroll
 * @param width              width of the LED display
 * @param brightness         set the LED brightness
 * @param scrollOptions      options for scrolling, see DrawScrollOptions type for available options
 */
export async function drawScrollingImage(
    width: number,
    brightness: number,
    matrix: LedColor[][],
    scrollOptions: DrawScrollOptions = {},
): Promise<void> {
    const options: Required<DrawScrollOptions> = overrideDefinedProperties(defaultScrollOptions, scrollOptions);
    let fullMatrix = matrix;

    if (options.padding === MatrixPaddingOption.NONE) {
        // append the image itself until it fills the display
        while (fullMatrix[0].length < width) {
            fullMatrix = appendMatrices(fullMatrix, matrix);
        }
    } else {
        fullMatrix = padMatrix(matrix, width, options.padBackgroundColor, options.padding);
    }

    let promiseResolve: () => void;
    const returnPromise = new Promise<void>(resolve => (promiseResolve = resolve));
    let keepScrolling = true;
    if (options.stopPromise) {
        options.stopPromise.then(() => (keepScrolling = false));
    }

    function innerDrawScrollingString(pixelIndex: number, currentIteration: number) {
        drawStill(
            brightness,
            chopMatrix(
                // append the matrix to itself to make sure it never clips
                appendMatrices(fullMatrix, fullMatrix),
                pixelIndex,
                width,
            ),
        );
        setTimeout(() => {
            if (keepScrolling) {
                if (pixelIndex < fullMatrix[0].length) {
                    if (currentIteration < 1) {
                        setTimeout(() => {
                            innerDrawScrollingString(pixelIndex + 1, currentIteration + 1);
                        }, options.iterationDelayMs);
                    } else {
                        innerDrawScrollingString(pixelIndex + 1, currentIteration);
                    }
                } else if (options.scrollCount < 0 || currentIteration < options.scrollCount) {
                    setTimeout(() => {
                        innerDrawScrollingString(1, currentIteration + 1);
                    }, options.iterationDelayMs);
                } else {
                    // no longer scrolling
                    // note: if scrollCount < 0 this will never happen becasue it will (intentionally) scroll forever
                    promiseResolve();
                }
            } else {
                promiseResolve();
            }
        }, options.frameDelayMs);
    }

    innerDrawScrollingString(0, 0);
    return returnPromise;
}
