import {EventEmitter} from 'events';
import {LedColor} from '../color';
import {MatrixPaddingOption} from './matrix-options';

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

/**
 * Options for scrolling.
 */
export type DrawScrollOptions = Partial<{
    /**
     * scroll this number of times before stopping. -1 indicates it should never stop
     * default is -1
     */
    loopCount: number;
    /**
     * delay in milliseconds between each pixel increment of the scroll
     * default is 100
     */
    frameDelayMs: number;
    /**
     * delay in milliseconds between each full loop
     * defaults to 0
     */
    loopDelayMs: number;
    /**
     * options for padding the given image
     * default is MatrixPaddingOption.left
     */
    padding: MatrixPaddingOption;
    /**
     * color for the padding created by the the padding or the emptyFrameBetweenLoops properties
     * default is LedColor.BLACK
     */
    padBackgroundColor: LedColor;
    /**
     * causes each loop to end with padding the width of the whole LED matrix
     * useful for looping text so that the loop position is obvious
     * default is false
     */
    emptyFrameBetweenLoops: boolean;
    /**
     * chooses the direction of scrolling, to the left or to the right
     * default is 'left'
     */
    scrollDirection: 'left' | 'right';
    /**
     * determines whether the scrolling image should be drawn again after the last loop is finished
     * default is true
     */
    drawAfterLastScroll: boolean;
}>;
