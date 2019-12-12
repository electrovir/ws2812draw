import bindings from 'bindings';
const BRIGHTNESS_MAX = 255;
const BRIGHTNESS_MIN = 0;

/**
 * Color examples.
 * The format is WWBBGGRR. WW is unused.
 * These directly affect the brightness of each colored LED. Thus, if you turn these values way up, the lights will be,
 * in general, brighter. There's a direct impact on how effective the brightness parameter is. For example, low color
 * values here might not even show up if the brightness is too low.
 * These colors are picked so that they'll mostly even out at higher brightnesses but they may not be unique in
 * lower brightness. For example, at brightness 7 ORANGE and RED look the same.
 */
export enum LedColor {
    BLACK /*         */ = 0x00000000,
    RED /*           */ = 0x00000020,
    ORANGE /*        */ = 0x00000720,
    YELLOW /*        */ = 0x00001720,
    YELLOW_GREEN /*  */ = 0x00002010,
    GREEN /*         */ = 0x00002000,
    TURQUOISE /*     */ = 0x00052000,
    CYAN /*          */ = 0x00171700,
    LIGHT_BLUE /*    */ = 0x00200700,
    BLUE /*          */ = 0x00200000,
    VIOLET /*        */ = 0x00200007,
    PINK /*          */ = 0x00170017,
    MAGENTA /*       */ = 0x00070020,
    WHITE /*         */ = 0x00070707,
}

function flatten2dArray(inputArray: number[][]): number[] {
    return inputArray.reduce(function(flattened, innerArray) {
        return flattened.concat(innerArray);
    }, []);
}

const ws2812draw = bindings('ws2812draw');

function checkBrightness(brightness: number) {
    if (brightness > BRIGHTNESS_MAX || brightness < BRIGHTNESS_MIN) {
        throw new Error('Brightness (${brightness}) is out of range: [${BRIGHTNESS_MIN}, ${BRIGHTNESS_MAX}]');
    }
}

function getArraySizes(imageArray: number[][]) {
    const width = imageArray[0].length;
    if (
        imageArray.some(function(row) {
            return row.length != width;
        })
    ) {
        throw new Error(`imageArray rows are not all of equal length for drawStill`);
    }

    return {
        height: imageArray.length,
        width,
    };
}

/**
 * @param brightness    led brightness, a number between 0 and 255 inclusive
 * @param imageArray    an array of colors for each pixel
 * @returns             true on draw success, otherwise false
 */
export function drawStill(brightness: number, imageArray: number[][]): boolean {
    checkBrightness(brightness);
    const {height, width} = getArraySizes(imageArray);
    return ws2812draw.drawStill(height, width, brightness, imageArray);
}

/**
 * @param height      number of rows in led matrix
 * @param width       number of columns in led matrix
 * @param brightness  led brightness, a number between 0 and 255 inclusive
 * @returns           true on init success, otherwise false
 */
export function init(height: number, width: number, brightness: number): boolean {
    checkBrightness(brightness);
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
    const {height, width} = getArraySizes(imageArray);
    return ws2812draw.drawFrame(height, width, flatten2dArray(imageArray));
}
