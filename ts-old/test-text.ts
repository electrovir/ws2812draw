import {LedColor} from '.';
import {drawScrollingText} from './text';

if (!module.parent) {
    const inputBrightness = process.argv[2];
    const inputColor = process.argv[3].toUpperCase();
    const inputString = process.argv[4];
    const frameDelay = Number(process.argv[5]) || undefined;
    const iterationDelay = Number(process.argv[6]) || undefined;
    const count = Number(process.argv[7]);

    if (!LedColor.hasOwnProperty(inputColor)) {
        throw new Error(`Invalid color: "${inputColor}"`);
    }
    const color = (LedColor[inputColor as any] as any) as LedColor;
    console.log(count);
    const options = {
        loopCount: count == undefined || isNaN(count) ? -1 : count,
        foregroundColor: color,
        frameDelayMs: frameDelay,
        loopDelayMs: iterationDelay,
    };
    console.log(`Printing "${inputString}" with options "${JSON.stringify(options, null, 4)}"`);
    // drawString(inputString, color, Number(inputBrightness));
    drawScrollingText(32, Number(inputBrightness), inputString, options);
}
