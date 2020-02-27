import * as draw from './';
import {getEnumTypedValues} from './util/object';

type Test = {run: (stop: Promise<any>) => any; label: string; duration?: number};

const HEIGHT = 8;
const WIDTH = 32;
const BRIGHTNESS = 100;
const DEFAULT_DURATION = 5000;

function runScrollRainbowTest(stop: Promise<void>, options?: draw.DrawScrollOptions) {
    const colorValues = getEnumTypedValues(draw.LedColor);
    const colors = draw.matrix
        .createArray(HEIGHT, Array(colorValues.length).fill(0))
        .map(row => row.map((_, index) => colorValues[index]));
    draw.drawScrollingImage(WIDTH, BRIGHTNESS, colors, {
        ...options,
        stopPromise: stop,
    });
}

const tests: Test[] = [
    // 0
    {
        run: () => draw.drawStill(BRIGHTNESS, draw.matrix.createMatrix(HEIGHT, WIDTH, draw.LedColor.LIGHT_BLUE)),
        label: 'Should draw light blue on whole display',
    },
    // 1
    {
        run: async stop => {
            let stillGoing = true;
            const colorValues = getEnumTypedValues(draw.LedColor);
            const giantMatrix = colorValues.reduce(
                (accum: draw.LedColor[][], color) => {
                    return draw.matrix.appendMatrices(accum, draw.matrix.createMatrix(HEIGHT, WIDTH, color));
                },
                [[], [], [], [], [], [], [], []],
            );
            let backwards = false;
            function animate(index: number) {
                draw.drawFrame(draw.matrix.chopMatrix(giantMatrix, index, WIDTH));
                if (stillGoing) {
                    setTimeout(() => {
                        let nextIndex = index;
                        if (backwards) {
                            nextIndex--;
                        } else {
                            nextIndex++;
                        }

                        if (nextIndex >= giantMatrix[0].length - WIDTH) {
                            nextIndex--;
                            backwards = true;
                        } else if (nextIndex < 0) {
                            nextIndex = 0;
                            backwards = false;
                        }
                        animate(nextIndex);
                    }, 0);
                }
            }

            if (draw.init(HEIGHT, WIDTH, 50)) {
                setTimeout(() => animate(0), 0);
                await stop;
                stillGoing = false;
                draw.cleanUp();
            } else {
                throw new Error(`Init failed.`);
            }
        },
        label: 'Should render frames quickly',
        duration: 20000,
    },
    // 2
    {
        run: stop => runScrollRainbowTest(stop),
        label: 'Should scroll padded rainbow',
        duration: 10000,
    },
    // 3
    {
        run: stop => runScrollRainbowTest(stop, {padding: draw.MatrixPaddingOption.NONE}),
        label: 'Should scroll unpadded rainbow',
        duration: 10000,
    },
    // 4
    {
        run: stop => runScrollRainbowTest(stop, {padding: draw.MatrixPaddingOption.RIGHT, scrollCount: 1}),
        label: 'Should scroll RIGHT padded rainbow once',
        duration: 10000,
    },
    // 5
    {
        run: stop => runScrollRainbowTest(stop, {padding: draw.MatrixPaddingOption.BOTH, scrollCount: 1}),
        label: 'Should scroll BOTH padded rainbow once',
        duration: 10000,
    },
    // 6
    {
        run: stop => runScrollRainbowTest(stop, {padding: draw.MatrixPaddingOption.LEFT, scrollCount: 1}),
        label: 'Should scroll LEFT padded rainbow once',
        duration: 10000,
    },
    // 7
    {
        run: stop => runScrollRainbowTest(stop, {padding: draw.MatrixPaddingOption.LEFT, scrollCount: 3}),
        label: 'Should scroll LEFT padded rainbow THRICE',
        duration: 15000,
    },
    // 8
    {
        run: stop =>
            runScrollRainbowTest(stop, {
                padding: draw.MatrixPaddingOption.NONE,
                frameDelayMs: 0,
            }),
        label: 'Should scroll unpadded rainbow REALLY FAST',
    },
    // 9
    {
        run: stop =>
            runScrollRainbowTest(stop, {
                padding: draw.MatrixPaddingOption.NONE,
                iterationDelayMs: 1000,
            }),
        label: 'Should scroll unpadded rainbow and pause on iterations',
        duration: 20000,
    },
    // 10
    {
        run: stop =>
            runScrollRainbowTest(stop, {
                padding: draw.MatrixPaddingOption.LEFT,
                padBackgroundColor: draw.LedColor.TURQUOISE,
            }),
        label: 'Should pad rainbow with color',
        duration: 10000,
    },
    // 11
    {
        run: () => {
            // this can't be too long or it clips
            draw.drawText(BRIGHTNESS, 'hi!');
        },
        label: 'Should draw text',
    },
    // 12
    {
        run: () => {
            draw.drawText(BRIGHTNESS, 'hi!', {
                foregroundColor: draw.LedColor.CYAN,
                backgroundColor: draw.LedColor.RED,
            });
        },
        label: 'Should draw text with colors',
    },
    // 13
    {
        run: () => {
            draw.drawText(BRIGHTNESS, "I'm!", {
                foregroundColor: draw.LedColor.CYAN,
                monospace: true,
            });
        },
        label: 'Should draw monospace text correctly',
    },
    // 14
    {
        run: () => {
            draw.drawText(BRIGHTNESS, "I'm!", [
                {foregroundColor: draw.LedColor.CYAN},
                {backgroundColor: draw.LedColor.RED, monospace: true},
                {foregroundColor: draw.LedColor.RED},
                {foregroundColor: draw.LedColor.BLACK, backgroundColor: draw.LedColor.YELLOW},
            ]);
        },
        label: 'Should allow options for each character',
        duration: 15000,
    },
    // 15
    {
        run: () => {
            draw.drawText(BRIGHTNESS, "I'm!", [
                {foregroundColor: draw.LedColor.CYAN},
                {backgroundColor: draw.LedColor.RED, monospace: true},
            ]);
        },
        label: 'Should fall through options to following characters',
        duration: 10000,
    },
    // 16
    {
        run: stop => {
            draw.drawScrollingText(WIDTH, BRIGHTNESS, 'Hellow!', {}, {stopPromise: stop});
        },
        label: 'Should scroll text',
        duration: 10000,
    },
    // 17
    {
        run: stop => {
            draw.drawScrollingText(
                WIDTH,
                BRIGHTNESS,
                'Hellow!',
                {
                    backgroundColor: draw.LedColor.YELLOW,
                    foregroundColor: draw.LedColor.PINK,
                },
                {stopPromise: stop},
            );
        },
        label: 'Should scroll text with color',
        duration: 10000,
    },
    // 18
    {
        run: stop => {
            draw.drawScrollingText(
                WIDTH,
                BRIGHTNESS,
                'Hellow!',
                {
                    foregroundColor: draw.LedColor.RED,
                },
                {scrollCount: 1, stopPromise: stop},
            );
        },
        label: 'Should scroll text only once',
        duration: 10000,
    },
    // 19
    {
        run: () => {
            const matrix = draw.textToColorMatrix('hmm');
            draw.drawStill(BRIGHTNESS, matrix);
        },
        label: 'Should generate text image and draw',
    },
    // 20
    {
        run: () => {
            draw.registerCustomLetter('<', [
                [0, 0, 0, 1, 1],
                [0, 0, 1, 1, 0],
                [0, 1, 1, 0, 0],
                [1, 1, 0, 0, 0],
                [1, 1, 0, 0, 0],
                [0, 1, 1, 0, 0],
                [0, 0, 1, 1, 0],
                [0, 0, 0, 1, 1],
            ]);

            draw.drawText(BRIGHTNESS, '< < <');
        },
        label: 'Should register custom letter',
    },
    // 21
    {
        run: stop => {
            const supported = draw.getSupportedLetters().join('');
            draw.drawScrollingText(
                WIDTH,
                BRIGHTNESS,
                supported,
                {
                    foregroundColor: draw.LedColor.CYAN,
                },
                {stopPromise: stop, frameDelayMs: 200},
            );
        },
        label: 'All characters should look decent',
        duration: 70000,
    },
    // 22
    {
        run: () => {
            draw.drawText(
                BRIGHTNESS,
                'hi',
                {},
                {padColor: draw.LedColor.BLACK, padding: draw.MatrixPaddingOption.BOTH, width: WIDTH},
            );
        },
        label: 'Should draw aligned text',
    },
];

function countDown(time: number) {
    console.log(`${time / 1000}...`);
    const nextTime = time - 1000;
    if (nextTime > 0) {
        setTimeout(() => countDown(time - 1000), 1000);
    }
}

async function runTest(test: Test) {
    console.log(`Testing: ${test.label}`);
    const duration = test.duration || DEFAULT_DURATION;
    const promise = new Promise(resolve => setTimeout(() => resolve(), duration));
    countDown(duration);
    test.run(promise);
    return promise;
}

async function runAllTests(testArray: Test[], index = 0) {
    if (index < testArray.length) {
        console.log(`index ${index} out of ${testArray.length - 1} total`);
        await runTest(testArray[index]);
        runAllTests(testArray, index + 1);
    }
}

async function runTestsCli(testArray: Test[], exclusiveIndex?: number) {
    if (exclusiveIndex == undefined) {
        runAllTests(testArray);
    } else {
        console.log(`Only testing index ${exclusiveIndex}`);
        await runTest(testArray[exclusiveIndex]);
    }
}

const testNumber = Number(process.argv[2]);

runTestsCli(tests, isNaN(testNumber) || testNumber == undefined ? undefined : testNumber);
