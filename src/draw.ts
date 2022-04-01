import bindings from 'bindings';
import {flattenMatrix, getMatrixSize, createMatrix, MatrixDimensions} from './matrix';

interface CApi {
    initMatrix(width: number, height: number, brightness: number): boolean;
    drawStill(width: number, height: number, brightness: number, colors: number[]): boolean;
    drawFrame(colors: number[]): boolean;
    cleanUp(): boolean;
    test(): string;
}

function wrapApiCall<T>(callback: () => T): T {
    try {
        return callback();
    } catch (error) {
        throw error;
    }
}

const ws2812drawApi: CApi = bindings('ws2812draw');

const brightnessMax = 255;
const brightnessMin = 0;

export class Ws2812drawError extends Error {
    public name = 'Ws2812drawError';
}

function validateBrightness(brightness: any): asserts brightness is number {
    if (isNaN(brightness) || typeof brightness !== 'number') {
        throw new Ws2812drawError(`invalid brightness value: "${brightness}"`);
    }
    if (brightness > brightnessMax || brightness < brightnessMin) {
        throw new Ws2812drawError('brightness (${brightness}) is out of range: [${BRIGHTNESS_MIN}, ${BRIGHTNESS_MAX}]');
    }
}

/**
 * @param brightness    led brightness, a number between 0 and 255 inclusive
 * @param colorMatrix    an array of colors for each pixel
 * @returns             true on draw success, otherwise false
 */
export function drawStill(brightness: number, colorMatrix: number[][]): boolean {
    validateBrightness(brightness);
    const dimensions = getMatrixSize(colorMatrix);
    const result = ws2812drawApi.drawStill(dimensions.width, dimensions.height, brightness, flattenMatrix(colorMatrix));
    if (!result) {
        throw new Ws2812drawError('initialization for drawStill failed');
    }
    return result;
}

/**
 * @param dimensions  size of the LED matrix
 * @param brightness  led brightness, a number between 0 and 255 inclusive
 * @returns           true on init success, otherwise false
 */
export function initMatrix(dimensions: MatrixDimensions, brightness: number): boolean {
    validateBrightness(brightness);
    const result = ws2812drawApi.initMatrix(dimensions.width, dimensions.height, brightness);
    if (!result) {
        throw new Ws2812drawError(`initialization failed`);
    }
    return result;
}

/**
 * Frees up all memory allocated by init
 */
export function cleanUp() {
    ws2812drawApi.cleanUp();
}

/**
 * initMatrix must be called before this can be used.
 *
 * @param colorMatrix   The matrix of colors to draw. The dimensions of this matrix should match those passed to init.
 * @returns            true on draw success, otherwise false
 */
export function drawFrame(colorMatrix: number[][]): boolean {
    const result = ws2812drawApi.drawFrame(flattenMatrix(colorMatrix));
    if (!result) {
        throw new Ws2812drawError(`must be initialized before drawing a frame`);
    }
    return result;
}

export function drawSolidColor(dimensions: MatrixDimensions, brightness: number, color: number): boolean {
    return drawStill(brightness, createMatrix(dimensions, color));
}
