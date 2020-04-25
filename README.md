# WS2812 Draw

Made for running on a Raspberry Pi, drawing to a ws2812 led matrix ([like this one](https://www.amazon.com/dp/B01DC0IPVU)). Uses the C library [rpi_ws281x](https://github.com/jgarff/rpi_ws281x).

# Install

```
npm install ws2812draw
```

# Example test

```bash
sudo su
npm run example
```

Root access is required to draw to the matrix. Read the console output to see instructions for this example. Use this to test if your pi + LED matrix setup.

# API

See [`index.ts`](https://github.com/electrovir/ws2812draw/blob/master/src/ts/index.ts) for exported members.

## Draw Image

Pass in a 2D array of colors to `drawStill`. This function has _relatively_ poor performance if drawing many frames in succession. Meaning, I get ~60fps on a 8x32 LED matrix. However, it is extremeley easy to use for a still image that doesn't change a lot.

```typescript
drawStill(brightness: number, imageArray: number[][]);
```

Example:

```typescript
import {drawStill, LedColor} from 'ws2812draw';
drawStill(50, [
    [LedColor.BLACK, LedColor.RED, LedColor.ORANGE],
    [LedColor.BLACK, LedColor.RED, LedColor.ORANGE],
]);
```

Note that on my 8x32 LED matrix this doesn't draw as a rectangle, it draws in a line since the array height doesn't match up correctly.

### Drawing a Scrolling Image

Draws and an image that can be bigger (or smaller) than the actual LED display. It then scrolls the image across the matrix. This function returns an `EventEmitter` which can be used to know when the scrolling is done or to instruct the scrolling to stop.

```typescript
export declare function drawScrollingImage(
    width: number,
    brightness: number,
    matrix: LedColor[][],
    scrollOptions?: DrawScrollOptions,
): ScrollEmitter;
```

```typescript
export interface ScrollEmitter extends EventEmitter {
    emit(type: 'stop'): boolean;
    on(type: 'done', listener: () => void): this;
    once(type: 'done', listener: () => void): this;
    on(type: 'loop', listener: (count: number) => void): this;
    once(type: 'loop', listener: (count: number) => void): this;
}
```

Example:

```typescript
import {drawScrollingImage} from 'ws2812draw';
// options is optional
// without options
drawScrollingImage(50, [
    [LedColor.BLACK, LedColor.RED, LedColor.ORANGE],
    [LedColor.BLACK, LedColor.RED, LedColor.ORANGE],
]);
// with options
cosnt emitter = drawScrollingImage(
    50,
    [
        [LedColor.BLACK, LedColor.RED, LedColor.ORANGE],
        [LedColor.BLACK, LedColor.RED, LedColor.ORANGE],
    ],
    {
        scrollCount: -1, // -1 means infinite
        frameDelayMs: 17,
        loopDelayMs: 100,
        padding: MatrixPaddingOption.LEFT,
        padBackgroundColor: LedColor.BLACK,
    },
);
emitter.emit('stop'); // do this to instantly stop the scrolling

```

## Draw Text

Draws text. All text is converted into uppercase. Supports numbers and some special characters and punctuation marks too. Options can be an array for each individual character or a single option for the whole string.

```typescript
function drawText(
    brightness: number,
    input: string,
    options?: LetterOptions | LetterOptions[],
    alignmentOptions?: AlignmentOptions,
);
```

Example:

```typescript
import {drawText} from 'ws2812draw';
// options are optional
// without options
drawText(50, 'Hi!');
// with options
drawText(50, 'Hi!', ({
    foregroundColor: LedColor.RED,
    backgroundColor: LedColor.BLUE,
    monospace: false,
});
// with alignment options
drawText(50, 'Hi!', ({
    padding: LedColor.RED,
    backgroundColor: LedColor.BLUE,
    monospace: false,
});
```

To get a full list of supported string characters use the following function:

```typescript
function getSupportedLetters(): string[];
```

Example:

```typescript
import {getSupportedLetters} from 'ws2812draw';
getSupportedLetters();
```

To register your own custom characters along with a matrix mask for that character, use the following function. The matrix mask must be 8 elements in height and from 2 to 6 (inclusive) elements wide.

```typescript
function registerCustomLetter(letter: string, matrix: LetterMatrix);
```

Example:

```typescript
import {registerCustomLetter} from 'ws2812draw';
registerCustomLetter('<', [
    [0, 0, 0, 1, 1],
    [0, 0, 1, 1, 0],
    [0, 1, 1, 0, 0],
    [1, 1, 0, 0, 0],
    [1, 1, 0, 0, 0],
    [0, 1, 1, 0, 0],
    [0, 0, 1, 1, 0],
    [0, 0, 0, 1, 1],
]);
```

### Draw Scrolling Text

The draw text function above isn't smart at all about a string being wider than the actual display, it just draws it and whatever fits end up such. The following function will scroll through strings, allowing pauses and speed control as well as color controls.

`letterOptions` is the same as in the `drawText` function explained above. `scrollOptions` is the same as in the `drawScrollingImage` function also explained above.

```typescript
function drawScrollingText(
    width: number,
    brightness: number,
    input: string,
    letterOptions?: LetterOptions | LetterOptions[],
    scrollOptions?: DrawScrollOptions,
): ScrollEmitter;
```

Example:

```typescript
draw.drawScrollingText(WIDTH, BRIGHTNESS, 'Hellow world!');
```

## High Performance Drawing

### Init the LED board once

```typescript
init(height: number, width: number, brightness: number): boolean;
```

Make sure to call `cleanUp` as shown below when done drawing.

Example:

```typescript
import {init} from 'ws2812draw';
const success = init(2, 3, 50);
```

### Draw a frame

```typescript
drawFrame(imageArray: number[][]): boolean;
```

This can be run within a loop for high frame rates. I'm getting nearly 100 fps on a 8x32 board. Larger boards lead to lower frame rates.

Any rows or cells larger than the initialized size are ignored. Fewer rows or cells will result in messed up LED colors.

Example:

```typescript
import {LedColor, drawFrame} from 'ws2812draw';
const success = drawFrame([
    [LedColor.BLACK, LedColor.RED, LedColor.ORANGE],
    [LedColor.BLACK, LedColor.RED, LedColor.ORANGE],
]);
```

### Clean up

```typescript
cleanUp(): void;
```

After `drawFrame` is done being used, run this to free up memory.

Example:

```typescript
import {cleanUp} from 'ws2812draw';
cleanUp();
```

## Colors

Colors are stored in Hex so they're easier to read. See the `LedColor` export for some examples. For custom colors, use the following format:

```
0x00BBGGRR
```

Note that doing `0x00FFFFFF` will be extremely bright. For example, the default white color is only `0x000c0c0c`.

## Permissions

Make sure anything that includes this package runs with root access or you'll get permission denied (root access on the Raspberry Pi is needed for driving the LEDs).

## Dev

### Running tests

```bash
# this will ask you for your password in order to use sudo
npm test [test-index]
```

If no test-index is given then all the tests will run. This may take several minutes, must run with a LED display attached, and must be inspected one-by-one manually.
