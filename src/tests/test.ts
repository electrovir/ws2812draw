import * as draw from '..';
import {getEnumTypedValues} from '../augments/object';
import {EventEmitter} from 'events';

type Test = {run: () => draw.ScrollEmitter | void; label: string; duration?: number};

const dimensions = {width: 32, height: 8};
const brightness = 100;
const defaultDuration = 5000;

function runScrollRainbowTest(options?: draw.DrawScrollOptions) {
    const colorValues = getEnumTypedValues(draw.LedColor);
    const colors = draw
        .createArray(dimensions.height, Array(colorValues.length).fill(0))
        .map(row => row.map((_, index) => colorValues[index]));
    return draw.drawScrollingImage(dimensions.width, brightness, colors, options);
}

const tests: Test[] = [
    // 0
    {
        run: () => {
            draw.drawStill(brightness, draw.createMatrix(dimensions, draw.LedColor.Cyan));
            setTimeout(() => {
                draw.drawStill(brightness, draw.createMatrix(dimensions, draw.LedColor.Red));
            }, defaultDuration / 3);
            setTimeout(() => {
                draw.drawStill(brightness, draw.createMatrix(dimensions, draw.LedColor.Green));
            }, (defaultDuration * 2) / 3);
        },
        label: 'Should draw multiple full colors on whole display',
    },
    // 1
    {
        run: () => {
            let stillGoing = true;
            const colorValues = getEnumTypedValues(draw.LedColor);
            const giantMatrix = colorValues.reduce((accum: draw.LedColor[][], color) => {
                return draw.appendMatrices(accum, draw.createMatrix(dimensions, color));
            }, []);

            let backwards = false;

            function animate(index: number, delay: number) {
                const windowedMatrixToDraw = draw.chopMatrix(giantMatrix, index, dimensions.width);
                draw.drawFrame(windowedMatrixToDraw);
                if (stillGoing) {
                    setTimeout(() => {
                        let nextIndex = index;
                        if (backwards) {
                            nextIndex--;
                        } else {
                            nextIndex++;
                        }

                        if (nextIndex >= giantMatrix[0].length - dimensions.width) {
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

            draw.initMatrix(50, dimensions);
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
        run: () => runScrollRainbowTest({padding: draw.MatrixPaddingOption.RIGHT, loopCount: 1}),
        label: 'Should scroll RIGHT padded rainbow once',
        duration: 10000,
    },
    // 5
    {
        run: () => runScrollRainbowTest({padding: draw.MatrixPaddingOption.BOTH, loopCount: 1}),
        label: 'Should scroll BOTH padded rainbow once',
        duration: 10000,
    },
    // 6
    {
        run: () => runScrollRainbowTest({padding: draw.MatrixPaddingOption.LEFT, loopCount: 1}),
        label: 'Should scroll LEFT padded rainbow once',
        duration: 10000,
    },
    // 7
    {
        run: () => runScrollRainbowTest({padding: draw.MatrixPaddingOption.LEFT, loopCount: 3}),
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
                padBackgroundColor: draw.LedColor.Turquoise,
            }),
        label: 'Should pad rainbow with color',
        duration: 10000,
    },
    // 11
    {
        run: () => {
            // this can't be too long or it clips
            draw.drawText(brightness, 'hi!');
        },
        label: 'Should draw text',
    },
    // 12
    {
        run: () => {
            draw.drawText(brightness, 'hi!', {
                foregroundColor: draw.LedColor.Cyan,
                backgroundColor: draw.LedColor.Red,
            });
        },
        label: 'Should draw text with colors',
    },
    // 13
    {
        run: () => {
            draw.drawText(brightness, "I'm!", {
                foregroundColor: draw.LedColor.Cyan,
                monospace: true,
            });
        },
        label: 'Should draw monospace text correctly',
    },
    // 14
    {
        run: () => {
            draw.drawText(brightness, "I'm!", [
                {foregroundColor: draw.LedColor.Cyan},
                {backgroundColor: draw.LedColor.Red, monospace: true},
                {foregroundColor: draw.LedColor.Red},
                {foregroundColor: draw.LedColor.Black, backgroundColor: draw.LedColor.Yellow},
            ]);
        },
        label: 'Should allow options for each character',
        duration: 15000,
    },
    // 15
    {
        run: () => {
            draw.drawText(brightness, "I'm!", [
                {foregroundColor: draw.LedColor.Cyan},
                {backgroundColor: draw.LedColor.Red, monospace: true},
            ]);
        },
        label: 'Should fall through options to following characters',
        duration: 10000,
    },
    // 16
    {
        run: () => {
            return draw.drawScrollingText(dimensions.width, brightness, 'Hellow!', {}, {});
        },
        label: 'Should scroll text',
        duration: 10000,
    },
    // 17
    {
        run: () => {
            return draw.drawScrollingText(
                dimensions.width,
                brightness,
                'Hellow!',
                {
                    backgroundColor: draw.LedColor.Yellow,
                    foregroundColor: draw.LedColor.Magenta,
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
                dimensions.width,
                brightness,
                'Hellow!',
                {
                    foregroundColor: draw.LedColor.Red,
                },
                {loopCount: 1},
            );
        },
        label: 'Should scroll text only once',
        duration: 10000,
    },
    // 19
    {
        run: () => {
            const matrix = draw.textToColorMatrix('hmm');
            draw.drawStill(brightness, matrix);
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

            draw.drawText(brightness, '< < <');
        },
        label: 'Should register custom letter',
    },
    // 21
    {
        run: () => {
            const supported = draw.getSupportedLetters().join('');
            return draw.drawScrollingText(
                dimensions.width,
                brightness,
                supported,
                {
                    foregroundColor: draw.LedColor.Cyan,
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
                brightness,
                'hi',
                {},
                {
                    padColor: draw.LedColor.Black,
                    padding: draw.MatrixPaddingOption.BOTH,
                    width: dimensions.width,
                },
            );
        },
        label: 'Should draw aligned text',
    },
    // 23
    {
        run: () => {
            let stillGoing = true;
            const colorValues = getEnumTypedValues(draw.LedColor).filter(
                color => color !== draw.LedColor.Black && color !== draw.LedColor.White,
            );
            let colorIndex = 0;
            let nextColorIndex = 1;
            const ratioIncrement = 0.05;
            let currentDiffRatio = 0;
            let colorMatrix = draw.createMatrix(dimensions, colorValues[colorIndex]);

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

                        const colorToDraw = draw.diffColors(
                            colorValues[colorIndex],
                            colorValues[nextColorIndex],
                            currentDiffRatio,
                        );

                        colorMatrix = draw.createMatrix(dimensions, colorToDraw);
                        animate(delay);
                    }, delay);
                } else {
                    (emitter as any).emit('done');
                }
            }

            draw.initMatrix(50, dimensions);
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
            const colorWidth = Math.floor(dimensions.width / colorValues.length);

            const colorMatrix = colorValues.reduce(
                (accum, currentColor) => {
                    return draw.appendMatrices(
                        accum,
                        draw.createMatrix(
                            {
                                ...dimensions,
                                width: colorWidth,
                            },
                            currentColor,
                        ),
                    );
                },
                draw.createMatrix(
                    {
                        ...dimensions,
                        width: 0,
                    },
                    draw.LedColor.Cyan,
                ) as draw.LedColor[][],
            );

            draw.drawStill(
                brightness,
                draw.padMatrix(
                    colorMatrix,
                    dimensions.width,
                    draw.LedColor.Black,
                    draw.MatrixPaddingOption.LEFT,
                ),
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
                loopCount: 2,
            }),
        label: 'Should have blank frame when scrolling RIGHT and only scroll TWICE',
        duration: 20000,
    },
    // 28
    {
        run: () =>
            runScrollRainbowTest({
                padding: draw.MatrixPaddingOption.NONE,
                scrollDirection: 'right',
            }),
        label: 'Should work scrolling right',
        duration: 10000,
    },
    // 29
    {
        run: () =>
            draw.drawScrollingText(
                dimensions.width,
                brightness,
                'Hi',
                {foregroundColor: draw.LedColor.Cyan},
                {
                    emptyFrameBetweenLoops: true,
                    loopDelayMs: 2000,
                    padding: draw.MatrixPaddingOption.LEFT,
                    loopCount: 2,
                },
            ),
        label: 'Should draw scrolling, padded, short text normally',
        duration: 10000,
    },
    // 30
    {
        run: () =>
            draw.drawText(
                brightness,
                'Hi',
                {
                    foregroundColor: draw.LedColor.Cyan,
                },
                {
                    width: dimensions.width,
                    padding: draw.MatrixPaddingOption.LEFT,
                },
            ),
        label: 'Should draw short, padded text normally',
        duration: 10000,
    },
    // 31
    {
        run: () => {
            const emitter = draw.drawScrollingText(
                dimensions.width,
                brightness,
                'this no fit on screen',
                {foregroundColor: draw.LedColor.Cyan},
                {
                    emptyFrameBetweenLoops: true,
                    loopDelayMs: 2000,
                    frameDelayMs: 16,
                    padding: draw.MatrixPaddingOption.LEFT,
                    loopCount: 2,
                    drawAfterLastScroll: false,
                },
            );
            emitter.on('done', () => {
                draw.drawText(
                    brightness,
                    'done',
                    {
                        foregroundColor: draw.LedColor.Red,
                    },
                    {
                        width: dimensions.width,
                        padding: draw.MatrixPaddingOption.BOTH,
                    },
                );
            });
        },
        label: 'Should scroll long text without absurdly long padding and should not draw after last loop',
        duration: 20000,
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
    const duration = test.duration || defaultDuration;
    countDown(duration);
    const emitter = test.run();
    return await Promise.all([
        new Promise<void>(resolve => {
            if (emitter) {
                emitter.on('done', () => {
                    resolve();
                });
            } else {
                resolve();
            }
        }),
        new Promise<void>(resolve => {
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
