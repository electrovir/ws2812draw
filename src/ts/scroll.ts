import {LedColor} from './color';
import {padMatrix, chopMatrix, appendMatrices, MatrixPaddingOption} from './matrix';
import {init, drawFrame} from './draw';
import {overrideDefinedProperties} from './util/object';
import {EventEmitter} from 'events';

/**
 * Options for scrolling.
 * defaults (copied from defaultScrollOptions):
 *     scrollCount: -1, // -1 means infinite
 *     frameDelayMs: 100,
 *     iterationDelayMs: 0,
 *     padding: MatrixPaddingOption.LEFT,
 *     backgroundColor: LedColor.BLACK,
 */
export type DrawScrollOptions = Partial<{
    scrollCount: number;
    frameDelayMs: number;
    iterationDelayMs: number;
    padding: MatrixPaddingOption;
    padBackgroundColor: LedColor;
}>;

const defaultScrollOptions: Required<DrawScrollOptions> = {
    scrollCount: -1, // -1 means infinite
    frameDelayMs: 100,
    iterationDelayMs: 0,
    padding: MatrixPaddingOption.LEFT,
    padBackgroundColor: LedColor.BLACK,
};

/**
 * stop event: emit this to stop the scrolling
 *
 * done event: listen to this to know when the scrolling is done
 * loop event: listen to this to know when the scroll loops (and how many times it has looped)
 */
export interface ScrollEmitter extends EventEmitter {
    emit(type: 'stop'): boolean;

    on(type: 'done', listener: () => void): this;
    once(type: 'done', listener: () => void): this;

    on(type: 'loop', listener: (count: number) => void): this;
    once(type: 'loop', listener: (count: number) => void): this;
}

// for internal use only
interface InternalScrollingEventEmitter extends EventEmitter {
    on(type: 'stop', listener: () => void): this;

    emit(type: 'done'): boolean;

    emit(type: 'loop', count: number): boolean;
}

/**
 * Scrolls an image (color matrix) horizontally leftwards across the LED display
 *
 * @param matrix             color matrix to scroll
 * @param width              width of the LED display
 * @param brightness         set the LED brightness
 * @param scrollOptions      options for scrolling, see DrawScrollOptions type for available options
 */
export function drawScrollingImage(
    width: number,
    brightness: number,
    matrix: LedColor[][],
    scrollOptions: DrawScrollOptions = {},
): ScrollEmitter {
    const emitter = new EventEmitter() as InternalScrollingEventEmitter;

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

    let keepScrolling = true;
    emitter.on('stop', () => {
        keepScrolling = false;
    });

    init(matrix.length, width, brightness);

    function innerDrawScrollingString(pixelIndex: number, currentScrollLoop: number) {
        if (keepScrolling) {
            drawFrame(
                chopMatrix(
                    // append the matrix to itself to make sure it never clips
                    appendMatrices(fullMatrix, fullMatrix),
                    pixelIndex,
                    width,
                ),
            );
            // still within current loop
            if (pixelIndex < fullMatrix[0].length) {
                setTimeout(() => {
                    innerDrawScrollingString(pixelIndex + 1, currentScrollLoop);
                }, options.frameDelayMs);
            }
            // current loop is over
            else {
                // there shouldn't be another loop
                // note that options.scrollCount < 0 indicates that it should loop forever
                if (options.scrollCount >= 0 && currentScrollLoop + 1 >= options.scrollCount) {
                    keepScrolling = false;
                }
                // the next loop should start
                else {
                    emitter.emit('loop', currentScrollLoop);
                }
                setTimeout(() => {
                    innerDrawScrollingString(0, currentScrollLoop + 1);
                }, options.iterationDelayMs);
            }
        } else {
            emitter.emit('done');
        }
    }

    innerDrawScrollingString(0, 0);
    // the exported value should only be of the public interface
    return (emitter as any) as ScrollEmitter;
}
