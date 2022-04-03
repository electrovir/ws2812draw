import {extractErrorMessage} from 'augment-vir';
import bindings from 'bindings';
import {createMatrix, flattenMatrix, getMatrixSize, MatrixDimensions} from '../matrix/matrix';
import {checkSudo} from '../sudo';

let shouldCheckSudo = true;

/**
 * This library checks for sudo permissions to assist in debugging. To disable those checks, call
 * this function. Note that if you don't run this library with sudo permissions, it probably won't work.
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
    public override name = 'Ws2812drawError';
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

export type DrawStillInputs = {
    /** Brightness of the LEDs. */
    brightness: number;
    /** 2D array of colors which comprise the still image to be drawn. */
    imageMatrix: number[][];
};

/**
 * Draws an image to the LED board. Automatically initializes the board using the size of the given
 * image matrix. This is only medium performance drawing because it has a convenient API and
 * automatically initializes the LED board on each run. For higher performance drawing, use
 * drawFrame (which requires the LED board to be initialized first).
 *
 * @returns True on draw success, otherwise false
 */
export function drawStillImage({brightness, imageMatrix}: DrawStillInputs): boolean {
    validateBrightness(brightness);
    const dimensions = getMatrixSize(imageMatrix);
    const result = makeApiCall((api) =>
        api.drawStill(dimensions.width, dimensions.height, brightness, flattenMatrix(imageMatrix)),
    );
    if (!result) {
        throw new Ws2812drawError('initialization for drawStill failed');
    }
    return result;
}

export type InitInputs = {
    /** Brightness of the LEDs. */
    brightness: number;
    /** Size of the LED matrix in LED count. */
    dimensions: MatrixDimensions;
};

/**
 * Setup the matrix for drawing. This function must be called before using drawFrame. It is called
 * automatically as part of drawStill.
 *
 * @returns True on init success, otherwise false
 */
export function initLedBoard({brightness, dimensions}: InitInputs): boolean {
    validateBrightness(brightness);
    const result = makeApiCall((api) =>
        api.initMatrix(dimensions.width, dimensions.height, brightness),
    );
    if (!result) {
        throw new Ws2812drawError(`initialization failed`);
    }
    return result;
}

/** Frees up all memory allocated by init. */
export function cleanUp() {
    makeApiCall((api) => api.cleanUp());
}

/**
 * Draws the given image to the LED board. This is higher performance than drawStill because it does
 * not initialize the board on each draw. Thus, initLedBoard must be called before this is called.
 *
 * @param imageMatrix The matrix of colors to draw. The dimensions of this matrix should match those
 *   previously passed to initLedBoard.
 * @returns True on draw success, otherwise false
 */
export function drawFrame(imageMatrix: number[][]): boolean {
    const result = makeApiCall((api) => api.drawFrame(flattenMatrix(imageMatrix)));
    if (!result) {
        throw new Ws2812drawError(`must be initialized before drawing a frame`);
    }
    return result;
}

/**
 * Uses drawStillImage (thus this has lower performance than drawFrame) to conveniently fill the
 * whole LED board with a single color.
 */
export function drawSolidColor({
    brightness,
    dimensions,
    color,
}: InitInputs & {
    /** Color to fill the LED board with. */
    color: number;
}): boolean {
    return drawStillImage({brightness, imageMatrix: createMatrix(dimensions, color)});
}
