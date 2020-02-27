import bindings from 'bindings';
import {flattenMatrix, getMatrixSize, createMatrix} from './matrix';

const BRIGHTNESS_MAX = 255;
const BRIGHTNESS_MIN = 0;

const ws2812draw = bindings('ws2812draw');

function validateBrightness(brightness: any): asserts brightness is number {
    if (isNaN(brightness) || typeof brightness !== 'number') {
        throw new Error(`Invalid brightness value: "${brightness}"`);
    }
    if (brightness > BRIGHTNESS_MAX || brightness < BRIGHTNESS_MIN) {
        throw new Error('Brightness (${brightness}) is out of range: [${BRIGHTNESS_MIN}, ${BRIGHTNESS_MAX}]');
    }
}

/**
 * @param brightness    led brightness, a number between 0 and 255 inclusive
 * @param imageArray    an array of colors for each pixel
 * @returns             true on draw success, otherwise false
 */
export function drawStill(brightness: number, imageArray: number[][]): boolean {
    validateBrightness(brightness);
    const {height, width} = getMatrixSize(imageArray);
    return ws2812draw.drawStill(height, width, brightness, flattenMatrix(imageArray));
}

/**
 * @param height      number of rows in led matrix
 * @param width       number of columns in led matrix
 * @param brightness  led brightness, a number between 0 and 255 inclusive
 * @returns           true on init success, otherwise false
 */
export function init(height: number, width: number, brightness: number): boolean {
    validateBrightness(brightness);
    return ws2812draw.init(height, width, brightness);
}

/**
 * Frees up all memory allocated by init
 */
export function cleanUp() {
    ws2812draw.cleanUp();
}

/**
 * init must be called before this can be used.
 *
 * @param imageArray   The matrix of colors to draw. The dimensions of this matrix should match those passed to init.
 * @returns            true on draw success, otherwise false
 */
export function drawFrame(imageArray: number[][]): boolean {
    const {height, width} = getMatrixSize(imageArray);
    return ws2812draw.drawFrame(height, width, flattenMatrix(imageArray));
}

export function drawSolidColor(height: number, width: number, brightness: number, color: number) {
    return drawStill(brightness, createMatrix(height, width, color));
}
