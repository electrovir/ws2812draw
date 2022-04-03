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
import {drawFrame, DrawStillInputs, initLedBoard} from './base-draw-api';

/**
 * Draw text and have it scroll across the LED display like a <marquee>
 *
 * @returns An event emitter that can be used to control and react to the scrolling.
 */
export function drawScrollingText({
    width,
    brightness,
    text,
    letterOptions = {},
    scrollOptions = {},
}: Omit<DrawScrollingImageInputs, 'imageMatrix'> & {
    /** Text to draw on the LEDs and scroll. */
    text: string;
    /**
     * Options for how the text will be rendered. Either a single object for the whole text string
     * or an array of objects, for each letter.
     */
    letterOptions?: LetterOptions | LetterOptions[] | undefined;
}): ScrollEmitter {
    const matrix = textToColorMatrix(text || ' ', letterOptions);
    return drawScrollingImage({
        width,
        brightness,
        imageMatrix: matrix,
        scrollOptions: scrollOptions,
    });
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

export type DrawScrollingImageInputs = DrawStillInputs & {
    /**
     * LED width count of the LED board so the scrolling logic knows when to wrap the image (2D
     * array of colors).
     */
    width: number;
    /** Options for how the image will be scrolled. */
    scrollOptions?: DrawScrollOptions | undefined;
};

/**
 * Scrolls an image (a 2D array of colors) horizontally leftwards (configurable) across the LED display.
 *
 * @returns An event emitter that can be used to control and react to the scrolling.
 */
export function drawScrollingImage({
    width,
    brightness,
    imageMatrix,
    scrollOptions: rawInputScrollOptions = {},
}: DrawScrollingImageInputs): ScrollEmitter {
    const emitter = new EventEmitter() as InternalScrollingEventEmitter;

    const options: Required<DrawScrollOptions> = overrideDefinedProperties(
        defaultScrollOptions,
        rawInputScrollOptions,
    );
    function isLastLoop(loopCount: number) {
        return loopCount + 1 >= options.loopCount;
    }
    let fullMatrix = [...imageMatrix];
    assertConsistentMatrixSize(fullMatrix);

    if (options.padding === MatrixPaddingOption.None) {
        // append the image itself until it fills the display
        while (fullMatrix[0]!.length < width) {
            fullMatrix = appendMatrices(fullMatrix, imageMatrix);
        }
    } else {
        fullMatrix = padMatrix(imageMatrix, width, options.padBackgroundColor, options.padding);
    }

    if (options.emptyFrameBetweenLoops) {
        const {left, right} = getPadDifference(imageMatrix, width, options.padding);
        fullMatrix = appendMatrices(
            fullMatrix,
            createMatrix(
                {
                    width: width - (right + left),
                    height: imageMatrix.length,
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

    initLedBoard({
        brightness,
        dimensions: {
            width,
            height: imageMatrix.length,
        },
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
    return emitter as unknown as ScrollEmitter;
}
