import {drawScrollingText, LedColor} from '..';
import {LetterOptions} from '../matrix/matrix-options';
import {DrawScrollOptions} from '../matrix/scroll-types';

function capitalCase(input: string): string {
    return `${input[0]?.toUpperCase}${input.slice(1)}`;
}

function testText() {
    const inputBrightness: number = Number(process.argv[2]) || 50;
    const inputColorKey: string = process.argv[3] ?? '';
    const inputString: string = process.argv[4] ?? 'test ';
    const frameDelay: number = Number(process.argv[5]) || 100;
    const iterationDelay: number = Number(process.argv[6]) || 0;
    const loopCount: number = Number(process.argv[7]) || -1;

    const colorKey = inputColorKey ? capitalCase(inputColorKey) : '';

    const foregroundColor: LedColor =
        colorKey && LedColor.hasOwnProperty(colorKey)
            ? (LedColor[colorKey as any] as any as LedColor)
            : LedColor.Red;

    const letterOptions: LetterOptions = {
        foregroundColor,
    };

    const scrollOptions: DrawScrollOptions = {
        frameDelayMs: frameDelay,
        loopCount: loopCount,
        loopDelayMs: iterationDelay,
    };

    console.info(`Drawing "${inputString}"`);
    drawScrollingText({
        width: 32,
        brightness: inputBrightness,
        text: inputString,
        letterOptions,
        scrollOptions,
    });
}

testText();
