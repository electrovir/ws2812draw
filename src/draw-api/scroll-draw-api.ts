import {EventEmitter} from 'events';
import {overrideDefinedProperties} from '../augments/object';
import {LedColor} from '../color';
import {
    appendMatrices,
    assertConsistentMatrixSize,
    chopMatrix,
    createMatrix,
    getPadDifference,
    padMatrix,
} from '../matrix/matrix';
import {LetterOptions, MatrixPaddingOption} from '../matrix/matrix-options';
import {textToColorMatrix} from '../matrix/matrix-text';
import {DrawScrollOptions, ScrollEmitter} from '../matrix/scroll-types';
import {drawFrame, initMatrix} from './base-draw-api';

/**
 * Draw text and have it scroll across the LED display like a <marquee>
 *
 * @param input String to scroll
 * @param width Pixel count of LED display's width
 * @param brightness Brightness for LED display
 * @param letterOptions Either an array of LetterOptions to be applied to each character or a single
 *   LetterOptions to be applied to the whole string. See LetterOptions type for available options.
 * @param scrollOptions Options for scrolling. See DrawScrollOptions type for available options.
 * @returns A promise that is resolved once the scrolling has finished. If the scroll count is set
 *   to infinite (the default) it will never resolve.
 */
export function drawScrollingText(
    width: number,
    brightness: number,
    input: string,
    letterOptions: LetterOptions | LetterOptions[] = {},
    scrollOptions: DrawScrollOptions = {},
): ScrollEmitter {
    const matrix = textToColorMatrix(input, letterOptions);
    return drawScrollingImage(width, brightness, matrix, scrollOptions);
}

const defaultScrollOptions: Required<DrawScrollOptions> = {
    loopCount: -1, // -1 means infinite
    frameDelayMs: 100,
    loopDelayMs: 0,
    padding: MatrixPaddingOption.Left,
    padBackgroundColor: LedColor.Black,
    emptyFrameBetweenLoops: false,
    scrollDirection: 'left',
    drawAfterLastScroll: true,
};

// for internal use only
interface InternalScrollingEventEmitter extends EventEmitter {
    on(type: 'stop', listener: () => void): this;

    emit(type: 'done'): boolean;

    emit(type: 'loop', count: number): boolean;
}

/**
 * Scrolls an image (color matrix) horizontally leftwards across the LED display
 *
 * @param matrix Color matrix to scroll
 * @param width Width of the LED display
 * @param brightness Set the LED brightness
 * @param rawInputScrollOptions Options for scrolling, see DrawScrollOptions type for available options
 */
export function drawScrollingImage(
    width: number,
    brightness: number,
    matrix: LedColor[][],
    rawInputScrollOptions: DrawScrollOptions = {},
): ScrollEmitter {
    const emitter = new EventEmitter() as InternalScrollingEventEmitter;

    const options: Required<DrawScrollOptions> = overrideDefinedProperties(
        defaultScrollOptions,
        rawInputScrollOptions,
    );
    function isLastLoop(loopCount: number) {
        return loopCount + 1 >= options.loopCount;
    }
    let fullMatrix = [...matrix];
    assertConsistentMatrixSize(fullMatrix);

    if (options.padding === MatrixPaddingOption.None) {
        // append the image itself until it fills the display
        while (fullMatrix[0]!.length < width) {
            fullMatrix = appendMatrices(fullMatrix, matrix);
        }
    } else {
        fullMatrix = padMatrix(matrix, width, options.padBackgroundColor, options.padding);
    }

    if (options.emptyFrameBetweenLoops) {
        const {left, right} = getPadDifference(matrix, width, options.padding);
        fullMatrix = appendMatrices(
            fullMatrix,
            createMatrix(
                {
                    width: width - (right + left),
                    height: matrix.length,
                },
                options.padBackgroundColor,
            ),
        );
    }

    const startingIndex = options.scrollDirection === 'left' ? 0 : fullMatrix[0]!.length;
    const increment = options.scrollDirection === 'left' ? 1 : -1;

    let keepScrolling = true;
    emitter.on('stop', () => {
        keepScrolling = false;
    });

    initMatrix(brightness, {
        width,
        height: matrix.length,
    });

    function innerDrawScrollingString(pixelIndex: number, currentScrollLoop: number) {
        if (keepScrolling) {
            const matrixToChop = appendMatrices(
                fullMatrix,
                !options.drawAfterLastScroll && isLastLoop(currentScrollLoop)
                    ? createMatrix(
                          {
                              width: fullMatrix[0]!.length,
                              height: fullMatrix.length,
                          },
                          options.padBackgroundColor,
                      )
                    : fullMatrix,
            );
            drawFrame(
                chopMatrix(
                    // append the matrix to itself to make sure it never clips
                    matrixToChop,
                    pixelIndex === startingIndex ? 0 : pixelIndex,
                    width,
                ),
            );
            // still within current loop
            if (
                (pixelIndex < fullMatrix[0]!.length && options.scrollDirection === 'left') ||
                (pixelIndex > 0 && options.scrollDirection === 'right')
            ) {
                // pause on the first frame of the first loop
                if (pixelIndex === startingIndex && currentScrollLoop === 0) {
                    setTimeout(() => {
                        innerDrawScrollingString(pixelIndex + increment, currentScrollLoop);
                    }, options.loopDelayMs);
                }
                // don't pause on any other frames
                else {
                    setTimeout(() => {
                        innerDrawScrollingString(pixelIndex + increment, currentScrollLoop);
                    }, options.frameDelayMs);
                }
            }
            // current loop is over
            else {
                // there shouldn't be another loop
                // note that options.loopCount < 0 indicates that it should loop forever
                if (options.loopCount >= 0 && isLastLoop(currentScrollLoop)) {
                    keepScrolling = false;
                }
                // the next loop should start
                else {
                    emitter.emit('loop', currentScrollLoop);
                }
                setTimeout(
                    () => {
                        innerDrawScrollingString(startingIndex, currentScrollLoop + 1);
                    },
                    !options.drawAfterLastScroll && isLastLoop(currentScrollLoop)
                        ? 0
                        : options.loopDelayMs,
                );
            }
        } else {
            emitter.emit('done');
        }
    }

    innerDrawScrollingString(startingIndex, 0);
    // the exported value should only be of the public interface
    return emitter as any as ScrollEmitter;
}
