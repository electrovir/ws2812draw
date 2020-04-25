import * as draw from './';
import {getEnumTypedValues} from './util/object';
import {EventEmitter} from 'events';

type Test = {run: () => draw.ScrollEmitter | void; label: string; duration?: number};

const HEIGHT = 8;
const WIDTH = 32;
const BRIGHTNESS = 100;
const DEFAULT_DURATION = 5000;

function runScrollRainbowTest(options?: draw.DrawScrollOptions) {
    const colorValues = getEnumTypedValues(draw.LedColor);
    const colors = draw.matrix
        .createArray(HEIGHT, Array(colorValues.length).fill(0))
        .map(row => row.map((_, index) => colorValues[index]));
    return draw.drawScrollingImage(WIDTH, BRIGHTNESS, colors, options);
}

const tests: Test[] = [
    // 0
    {
        run: () => {
            draw.drawStill(BRIGHTNESS, draw.matrix.createMatrix(HEIGHT, WIDTH, draw.LedColor.CYAN));
            setTimeout(() => {
                draw.drawStill(BRIGHTNESS, draw.matrix.createMatrix(HEIGHT, WIDTH, draw.LedColor.RED));
            }, DEFAULT_DURATION / 3);
            setTimeout(() => {
                draw.drawStill(BRIGHTNESS, draw.matrix.createMatrix(HEIGHT, WIDTH, draw.LedColor.GREEN));
            }, (DEFAULT_DURATION * 2) / 3);
        },
        label: 'Should draw multiple full colors on whole display',
    },
    // 1
    {
        run: () => {
            let stillGoing = true;
            const colorValues = getEnumTypedValues(draw.LedColor);
            const giantMatrix = colorValues.reduce((accum: draw.LedColor[][], color) => {
                return draw.matrix.appendMatrices(accum, draw.matrix.createMatrix(HEIGHT, WIDTH, color));
            }, []);

            let backwards = false;

            function animate(index: number, delay: number) {
                const windowedMatrixToDraw = draw.matrix.chopMatrix(giantMatrix, index, WIDTH);
                draw.drawFrame(windowedMatrixToDraw);
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
                        animate(nextIndex, delay);
                    }, delay);
                } else {
                    (emitter as any).emit('done');
                }
            }

            draw.init(HEIGHT, WIDTH, 50);
            animate(0, 0);

            const emitter = new EventEmitter() as draw.ScrollEmitter;
            emitter.on('stop' as any, () => {
                stillGoing = false;
            });
            return emitter;
        },
        label: 'Should render frames quickly',
        duration: 20000,
    },
    // 2
    {
        run: () => runScrollRainbowTest(),
        label: 'Should scroll padded rainbow',
        duration: 10000,
    },
    // 3
    {
        run: () => runScrollRainbowTest({padding: draw.MatrixPaddingOption.NONE}),
        label: 'Should scroll unpadded rainbow',
        duration: 10000,
    },
    // 4
    {
        run: () => runScrollRainbowTest({padding: draw.MatrixPaddingOption.RIGHT, scrollCount: 1}),
        label: 'Should scroll RIGHT padded rainbow once',
        duration: 10000,
    },
    // 5
    {
        run: () => runScrollRainbowTest({padding: draw.MatrixPaddingOption.BOTH, scrollCount: 1}),
        label: 'Should scroll BOTH padded rainbow once',
        duration: 10000,
    },
    // 6
    {
        run: () => runScrollRainbowTest({padding: draw.MatrixPaddingOption.LEFT, scrollCount: 1}),
        label: 'Should scroll LEFT padded rainbow once',
        duration: 10000,
    },
    // 7
    {
        run: () => runScrollRainbowTest({padding: draw.MatrixPaddingOption.LEFT, scrollCount: 3}),
        label: 'Should scroll LEFT padded rainbow THRICE',
        duration: 15000,
    },
    // 8
    {
        run: () =>
            runScrollRainbowTest({
                padding: draw.MatrixPaddingOption.NONE,
                frameDelayMs: 0,
            }),
        label: 'Should scroll unpadded rainbow REALLY FAST',
    },
    // 9
    {
        run: () =>
            runScrollRainbowTest({
                padding: draw.MatrixPaddingOption.NONE,
                loopDelayMs: 1000,
            }),
        label: 'Should scroll unpadded rainbow and pause on iterations',
        duration: 20000,
    },
    // 10
    {
        run: () =>
            runScrollRainbowTest({
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
        run: () => {
            return draw.drawScrollingText(WIDTH, BRIGHTNESS, 'Hellow!', {}, {});
        },
        label: 'Should scroll text',
        duration: 10000,
    },
    // 17
    {
        run: () => {
            return draw.drawScrollingText(
                WIDTH,
                BRIGHTNESS,
                'Hellow!',
                {
                    backgroundColor: draw.LedColor.YELLOW,
                    foregroundColor: draw.LedColor.MAGENTA,
                },
                {},
            );
        },
        label: 'Should scroll text with color',
        duration: 10000,
    },
    // 18
    {
        run: () => {
            return draw.drawScrollingText(
                WIDTH,
                BRIGHTNESS,
                'Hellow!',
                {
                    foregroundColor: draw.LedColor.RED,
                },
                {scrollCount: 1},
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
        run: () => {
            const supported = draw.getSupportedLetters().join('');
            return draw.drawScrollingText(
                WIDTH,
                BRIGHTNESS,
                supported,
                {
                    foregroundColor: draw.LedColor.CYAN,
                },
                {frameDelayMs: 200},
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
    // 23
    {
        run: () => {
            let stillGoing = true;
            const colorValues = getEnumTypedValues(draw.LedColor).filter(
                color => color !== draw.LedColor.BLACK && color !== draw.LedColor.WHITE,
            );
            let colorIndex = 0;
            let nextColorIndex = 1;
            const ratioIncrement = 0.05;
            let currentDiffRatio = 0;
            let colorMatrix = draw.matrix.createMatrix(HEIGHT, WIDTH, colorValues[colorIndex]);

            const emitter = new EventEmitter() as draw.ScrollEmitter;

            function animate(delay: number) {
                draw.drawFrame(colorMatrix);

                if (stillGoing) {
                    setTimeout(() => {
                        currentDiffRatio += ratioIncrement;
                        if (currentDiffRatio >= 1) {
                            colorIndex = nextColorIndex;
                            nextColorIndex++;
                            if (nextColorIndex >= colorValues.length) {
                                nextColorIndex = 0;
                            }

                            currentDiffRatio = ratioIncrement;
                        }

                        const colorToDraw = draw.color.diffColors(
                            colorValues[colorIndex],
                            colorValues[nextColorIndex],
                            currentDiffRatio,
                        );

                        colorMatrix = draw.matrix.createMatrix(HEIGHT, WIDTH, colorToDraw);
                        animate(delay);
                    }, delay);
                } else {
                    (emitter as any).emit('done');
                }
            }

            draw.init(HEIGHT, WIDTH, 50);
            animate(0);

            emitter.on('stop' as any, () => {
                stillGoing = false;
            });
            return emitter;
        },
        label: 'Should smootly transition over all colors',
        duration: 20000,
    },
    // 24
    {
        run: () => {
            const colorValues = getEnumTypedValues(draw.LedColor);
            const colorWidth = Math.floor(WIDTH / colorValues.length);

            const colorMatrix = colorValues.reduce((accum, currentColor) => {
                return draw.matrix.appendMatrices(accum, draw.matrix.createMatrix(HEIGHT, colorWidth, currentColor));
            }, draw.matrix.createMatrix(HEIGHT, 0, draw.LedColor.CYAN) as draw.LedColor[][]);

            draw.drawStill(
                BRIGHTNESS,
                draw.matrix.padMatrix(colorMatrix, WIDTH, draw.LedColor.BLACK, draw.MatrixPaddingOption.LEFT),
            );
        },
        label: 'Color brightness comparisons',
        duration: 15000,
    },
    // 25
    {
        run: () =>
            runScrollRainbowTest({
                padding: draw.MatrixPaddingOption.LEFT,
                emptyFrameBetweenLoops: true,
                loopDelayMs: 1000,
            }),
        label: 'Should have blank frame in between scrolling',
        duration: 10000,
    },
    // 26
    {
        run: () =>
            runScrollRainbowTest({
                padding: draw.MatrixPaddingOption.LEFT,
                emptyFrameBetweenLoops: true,
                scrollDirection: 'right',
                loopDelayMs: 1000,
            }),
        label: 'Should have blank frame when scrolling RIGHT',
        duration: 10000,
    },
    // 27
    {
        run: () =>
            runScrollRainbowTest({
                padding: draw.MatrixPaddingOption.LEFT,
                emptyFrameBetweenLoops: true,
                scrollDirection: 'right',
                loopDelayMs: 1000,
                scrollCount: 2,
            }),
        label: 'Should have blank frame when scrolling RIGHT and only scroll TWICE',
        duration: 20000,
    },
    // 28
    {
        run: () => runScrollRainbowTest({padding: draw.MatrixPaddingOption.NONE, scrollDirection: 'right'}),
        label: 'Should work scrolling right',
        duration: 10000,
    },
    // 29
    {
        run: () =>
            draw.drawScrollingText(
                WIDTH,
                BRIGHTNESS,
                'Hi',
                {foregroundColor: draw.LedColor.CYAN},
                {
                    emptyFrameBetweenLoops: true,
                    loopDelayMs: 2000,
                    padding: draw.MatrixPaddingOption.LEFT,
                    scrollCount: 2,
                },
            ),
        label: 'Should draw scrolling, padded, short text normally',
        duration: 10000,
    },
    // 29
    {
        run: () =>
            draw.drawText(
                BRIGHTNESS,
                'Hi',
                {foregroundColor: draw.LedColor.CYAN},
                {width: WIDTH, padding: draw.MatrixPaddingOption.LEFT},
            ),
        label: 'Should draw short, padded text normally',
        duration: 10000,
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
    countDown(duration);
    const emitter = test.run();
    return await Promise.all([
        new Promise(resolve => {
            if (emitter) {
                emitter.on('done', () => {
                    resolve();
                });
            } else {
                resolve();
            }
        }),
        new Promise(resolve => {
            setTimeout(() => {
                if (emitter) {
                    emitter.emit('stop');
                }
                resolve();
            }, duration);
        }),
    ]);
}

async function runTestsCli(testArray: Test[], exclusiveIndex?: number) {
    if (exclusiveIndex == undefined) {
        for (let index = 0; index < testArray.length; index++) {
            console.log(`index ${index} out of ${testArray.length - 1} total`);
            await runTest(testArray[index]);
            draw.cleanUp();
        }
    } else {
        console.log(`Only testing index ${exclusiveIndex}`);
        await runTest(testArray[exclusiveIndex]);
    }
}

const testNumber = Number(process.argv[2]);

runTestsCli(tests, isNaN(testNumber) || testNumber == undefined ? undefined : testNumber);
