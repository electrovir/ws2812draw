import {extractErrorMessage} from 'augment-vir';
import bindings from 'bindings';
import {createMatrix, flattenMatrix, getMatrixSize, MatrixDimensions} from './matrix/matrix';
import {checkSudo} from './sudo';

let shouldCheckSudo = true;

/**
 * This library checks for sudo perimssions to assist in debugging. To disable those checks, call this function. Note that if you don't run this library with sudo permissions, it probably won't work.
 */
export function ignoreSudoCheck() {
    shouldCheckSudo = false;
}

interface CApi {
    initMatrix(width: number, height: number, brightness: number): boolean;
    drawStill(width: number, height: number, brightness: number, colors: number[]): boolean;
    drawFrame(colors: number[]): boolean;
    cleanUp(): boolean;
    test(): string;
}

export class Ws2812drawError extends Error {
    public name = 'Ws2812drawError';
}

function createApiCaller(): <T>(callback: (api: CApi) => T) => T {
    const ws2812drawApi: CApi = bindings('ws2812draw');

    return <T>(callback: (api: CApi) => T) => {
        try {
            if (shouldCheckSudo) {
                checkSudo();
            }

            const callbackResult: T = callback(ws2812drawApi);
            return callbackResult;
        } catch (error) {
            const errorMessage = extractErrorMessage(error);
            throw new Ws2812drawError(errorMessage);
        }
    };
}

const makeApiCall = createApiCaller();

const brightnessMax = 255;
const brightnessMin = 0;

function validateBrightness(brightness: any): asserts brightness is number {
    if (isNaN(brightness) || typeof brightness !== 'number') {
        throw new Ws2812drawError(`invalid brightness value: "${brightness}"`);
    }
    if (brightness > brightnessMax || brightness < brightnessMin) {
        throw new Ws2812drawError(
            'brightness (${brightness}) is out of range: [${BRIGHTNESS_MIN}, ${BRIGHTNESS_MAX}]',
        );
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
    const result = makeApiCall(api =>
        api.drawStill(dimensions.width, dimensions.height, brightness, flattenMatrix(colorMatrix)),
    );
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
export function initMatrix(brightness: number, dimensions: MatrixDimensions): boolean {
    validateBrightness(brightness);
    const result = makeApiCall(api =>
        api.initMatrix(dimensions.width, dimensions.height, brightness),
    );
    if (!result) {
        throw new Ws2812drawError(`initialization failed`);
    }
    return result;
}

/**
 * Frees up all memory allocated by init
 */
export function cleanUp() {
    makeApiCall(api => api.cleanUp());
}

/**
 * initMatrix must be called before this can be used.
 *
 * @param colorMatrix   The matrix of colors to draw. The dimensions of this matrix should match those passed to init.
 * @returns            true on draw success, otherwise false
 */
export function drawFrame(colorMatrix: number[][]): boolean {
    const result = makeApiCall(api => api.drawFrame(flattenMatrix(colorMatrix)));
    if (!result) {
        throw new Ws2812drawError(`must be initialized before drawing a frame`);
    }
    return result;
}

export function drawSolidColor(
    brightness: number,
    dimensions: MatrixDimensions,
    color: number,
): boolean {
    return drawStill(brightness, createMatrix(dimensions, color));
}
