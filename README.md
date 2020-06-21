# WS2812 Draw

Draw to a ws2812 LED matrix ([like this one](https://www.amazon.com/dp/B01DC0IPVU)) with a Raspberry Pi. Uses the C library [rpi_ws281x](https://github.com/jgarff/rpi_ws281x).

All testing has been done on a [Raspberry Pi 3 B+](https://www.raspberrypi.org/products/raspberry-pi-3-model-b-plus/).

# Install

```
npm install ws2812draw
```

# Hardware Setup

On a fresh install of Raspian Pi OS on a Raspberry Pi, no software setup beyond `npm install` is required.

Hardware wise, this uses [Pin 12 aka BCM 18](https://pinout.xyz/pinout/pin12_gpio18) for the LED matrix's data line.  Further explanations for which GPIO pins _can_ be used at the C library level are contained in the [rpi_ws281x library's README](https://github.com/jgarff/rpi_ws281x#gpio-usage). However, this package currently doesn't interface with that since I found it works easiest to just leave it on the default (`BCM 18`).

I found that my 32x8 LED matrix can be fully driven at _very high brightness_ by the Raspberry Pi's 5v power pin, no power supply needed besides the Pi's.

# Example

```bash
sudo su
npm run example
```

Root access is required to draw to the matrix. Read the console output to see instructions for this example. Use this to test if your pi + LED matrix setup.

# API

See [`index.ts`](https://github.com/electrovir/ws2812draw/blob/master/src/ts/index.ts) for exported members.

## Draw Image

Pass in a 2D array of colors to `drawStill`. This function has _relatively_ poor performance if drawing many frames in succession. Meaning, I get about 60 fps on a 8x32 LED matrix (bigger matrices quickly drop off). However, this method should be prefered for its ease of use for still image that doesn't change rapidly.

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

Note that on my 8x32 LED matrix this example above doesn't draw as a rectangle, it draws in a line. This is beacuse the array height doesn't match up correctly with the LED matrix height.

### Drawing a Scrolling Image

Draws an image that can be bigger (or smaller) than the actual LED display. It then scrolls the image across the LED matrix. This function returns an `EventEmitter` which can be used to know when the scrolling is done or to instruct the scrolling to stop.

```typescript
function drawScrollingImage(
    width: number,
    brightness: number,
    matrix: LedColor[][],
    scrollOptions?: DrawScrollOptions,
): ScrollEmitter;
```

```typescript
interface ScrollEmitter extends EventEmitter {
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
        loopCount: -1, // -1 means infinite
        frameDelayMs: 100,
        loopDelayMs: 0,
        padding: MatrixPaddingOption.LEFT,
        padBackgroundColor: LedColor.BLACK,
        emptyFrameBetweenLoops: false,
        scrollDirection: 'left',
    },
);

emitter.emit('stop'); // do this to instantly stop the scrolling
```

## Draw Text

Draws text. All text is converted into uppercase. Supports numbers in addition to some special characters and punctuation. Options can be an array for each individual character or a single option for the whole string.

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
import {drawText, LedColor, MatrixPaddingOption} from 'ws2812draw';
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
drawText(
    50,
    'Hi!',
    {
        foregroundColor: LedColor.RED,
        backgroundColor: LedColor.BLUE,
    },
    {
        width: 32,
        padding: MatrixPaddingOption.LEFT,
        padColor: LedColor.BLUE,
    },
);
```

### Supported characters

To get a full list of supported string characters use the following function:

```typescript
function getSupportedLetters(): string[];
```

Example:

```typescript
import {getSupportedLetters} from 'ws2812draw';
getSupportedLetters();
```

### Registering characters

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

This function can also be used to override any default character masks.

### Draw Scrolling Text

The draw text function above isn't smart at all about a string being wider than the actual display; it just draws the text and whatever fits is what you see. The following function will scroll through strings, allowing speed control among other configuration.

`letterOptions` is the same as in the `drawText` function explained above. `scrollOptions` is the same as in the `drawScrollingImage` function explained further above.

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

Example:

```typescript
import {init} from 'ws2812draw';
init(2, 3, 50);
```

Make sure to call `cleanUp`, as explained in a following section, when done drawing.

### Draw a frame

```typescript
drawFrame(imageArray: number[][]): boolean;
```

This can be run within a loop for high frame rates. I'm getting nearly 100 fps (vs `drawStill`'s 60 fps) on a 8x32 board. Larger boards lead to lower frame rates.

Any rows or cells larger than the initialized size are ignored. Fewer rows or cells will result in messed up LED colors.

Example:

```typescript
import {LedColor, drawFrame} from 'ws2812draw';
drawFrame([
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

Colors are stored in Hex so they're easier to read. See the [`LedColor` enum](https://github.com/electrovir/ws2812draw/blob/master/src/ts/color.ts) for the defaults. For custom colors, use the following format:

```
0xBBGGRR
```

Note that doing `0xFFFFFF` will be extremely bright. For comparison, the default white color is only `0x0c0c0c`.

# Permissions

Make sure anything that includes this package runs with root access or you'll get permission denied (root access on the Raspberry Pi is needed for driving the LEDs).

# Running tests

```bash
# this will ask you for your password in order to use sudo
npm test [test-index]
```

If no test-index is given, all the tests will run. This takes several minutes, must run with a LED display attached in order for anything to happen, and must be inspected manually.
