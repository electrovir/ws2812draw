# WS2812 Draw

Draw to a ws2812 LED matrix ([like this one](https://www.amazon.com/dp/B01DC0IPVU)) with a Raspberry Pi. Uses the C library [rpi_ws281x](https://github.com/jgarff/rpi_ws281x).

Tested on a [Raspberry Pi 4 model b](https://www.raspberrypi.com/products/raspberry-pi-4-model-b/).

# Install

```
npm install ws2812draw
```

# Hardware Setup

On a fresh install of Raspian Pi OS on a Raspberry Pi, no software setup is required beyond installing Node.js and running `npm install` in this directory.

Hardware wise, this uses [Pin 12 aka BCM 18](https://pinout.xyz/pinout/pin12_gpio18) for the LED matrix's data line. Further explanations for which GPIO pins _can_ be used at the C library level are contained in the [rpi_ws281x library's README](https://github.com/jgarff/rpi_ws281x#gpio-usage). However, this package currently doesn't interface with that since I found it works easiest to just leave it on the default (`BCM 18`).

I found that my 32x8 LED matrix can be fully driven at _very high brightness_ by the Raspberry Pi's 5v power pin: No external power supply is needed for the LEDs.

# Sudo

Root access is required to access the Raspberry Pi's lower levels and draw to the matrix.

When running your scripts, you can prefix your commands with `sudo -E env "PATH=$PATH"` so you don't need to install Node.js inside your root user.

Example:

```bash
sudo -E env \"PATH=$PATH\" node dist/tests/example-simple.js
```

# API

See [`index.ts`](https://github.com/electrovir/ws2812draw/blob/master/src/index.ts) for exported members.

## Draw Still Image

Pass in a 2D array of colors to `drawStill`. This function has _relatively_ poor performance if drawing many frames in succession. Poor performance here means about 60 fps on a 8x32 LED matrix (bigger matrices quickly drop off). However, this method should be preferred for its ease of use for still images that doesn't change rapidly.

<!-- example-link: src/readme-examples/draw-still.example.ts -->

```TypeScript
import {drawStillImage, LedColor} from 'ws2812draw';

// must be between 0 and 255 inclusive
const brightness: number = 100;
const imageMatrix: LedColor[][] = [
    [
        LedColor.Black,
        LedColor.Red,
        LedColor.Orange,
    ],
    [
        LedColor.Black,
        LedColor.Red,
        LedColor.Orange,
    ],
];

drawStillImage({brightness, imageMatrix});
```

Note that on my 8x32 LED matrix this example above doesn't draw as a rectangle, it draws in a line. This is because the array height doesn't match up correctly with the LED matrix height.

### Drawing a Scrolling Image

Draws an image that can be wider (or thinner) than the actual LED display. It then scrolls the image across the LED matrix. This function returns an `EventEmitter` which can be used to detect when the scrolling is done or to instruct the scrolling to stop.

<!-- example-link: src/readme-examples/draw-scrolling-image.example.ts -->

```TypeScript
import {drawScrollingImage, LedColor, MatrixPaddingOption} from 'ws2812draw';

// without options
drawScrollingImage({
    width: 32,
    brightness: 50,
    imageMatrix: [
        [
            LedColor.Black,
            LedColor.Red,
            LedColor.Orange,
        ],
        [
            LedColor.Black,
            LedColor.Red,
            LedColor.Orange,
        ],
    ],
});

const emitter = drawScrollingImage({
    width: 32,
    brightness: 50,
    imageMatrix: [
        [
            LedColor.Black,
            LedColor.Red,
            LedColor.Orange,
        ],
        [
            LedColor.Black,
            LedColor.Red,
            LedColor.Orange,
        ],
    ],
    // the options input is optional
    scrollOptions: {
        loopCount: -1,
        frameDelayMs: 100,
        loopDelayMs: 0,
        padding: MatrixPaddingOption.Left,
        padBackgroundColor: LedColor.Black,
        emptyFrameBetweenLoops: false,
        scrollDirection: 'left',
    },
});

emitter.on('loop', (loopCount) => {
    console.log(`Loop ${loopCount} finished!`);
});

setTimeout(() => {
    emitter.emit('stop'); // do this to instantly stop the scrolling
}, 5000);
```

## Draw Text

Draws text. All text is converted into uppercase. Supports a-z and 0-9, in addition to some special characters and punctuation. Options passed in can be an array for each individual character or a single option for the whole string.

<!-- example-link: src/readme-examples/draw-text.example.ts -->

```TypeScript
import {drawText, LedColor, MatrixPaddingOption} from 'ws2812draw';
// options are optional

// without options
drawText({brightness: 50, text: 'Hi!'});

// with options
drawText({
    brightness: 50,
    text: 'Hi!',
    letterOptions: {
        foregroundColor: LedColor.Red,
        backgroundColor: LedColor.Blue,
        monospace: false,
    },
});

// with alignment options
drawText({
    brightness: 50,
    text: 'Hi!',
    letterOptions: {
        foregroundColor: LedColor.Red,
        backgroundColor: LedColor.Blue,
    },
    alignmentOptions: {
        width: 32,
        padding: MatrixPaddingOption.Left,
        padColor: LedColor.Blue,
    },
});
```

### Supported characters

To get a full list of supported string characters use the following function:

<!-- example-link: src/readme-examples/get-supported-characters.example.ts -->

```TypeScript
import {getSupportedLetters} from 'ws2812draw';

console.log(getSupportedLetters());
```

### Registering characters

To register your own custom characters along with a matrix mask for that character, use the following function. The matrix mask must be 8 elements in height and 2-6 (inclusive) elements wide.

Example:

<!-- example-link: src/readme-examples/register-custom-letter.example.ts -->

```TypeScript
import {registerCustomLetter} from 'ws2812draw';

registerCustomLetter('<', [
    // prettier-multiline-arrays-set-threshold: 8
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

This function can also be used to override any default character masks. (For example, registering a custom letter to `'a'` will override the mask for the letter `a`.)

### Draw Scrolling Text

The draw text function above isn't smart at all about a string being wider than the actual display; it just draws the text and whatever fits is what you see. The following function will scroll a string of text with speed control and other configuration options.

`letterOptions` is the same as in the `drawText` function explained above. `scrollOptions` is the same as in the `drawScrollingImage` function explained further above.

Example:

<!-- example-link: src/readme-examples/draw-scrolling-text.example.ts -->

```TypeScript
import {drawScrollingText} from 'ws2812draw';

drawScrollingText({
    brightness: 100,
    text: 'Hello world!',
    width: 32,
});
```

## High Performance Drawing

`drawStillImage` has relatively low performance because it re-initializes the LED board on every call. For high performance drawing, manually initialize the board and then call `drawFrame` as many times as desired afterwards.

### Initialize the LED board once

<!-- example-link: src/readme-examples/init-board.example.ts -->

```TypeScript
import {initLedBoard} from 'ws2812draw';

initLedBoard({
    brightness: 100,
    dimensions: {
        width: 32,
        height: 8,
    },
});
```

Make sure to call `cleanUp`, as explained in a later section, when done drawing.

### Draw a frame

This can be run within a loop for high frame rates. I'm getting nearly 100 fps (vs `drawStillImage`'s 60 fps) on a 8x32 board. Larger boards will have lower frame rates.

Any rows or cells beyond than the initialized dimensions previously given to `initLedBoard` are ignored. Fewer rows or cells will result in a messed up drawing.

Example:

<!-- example-link: src/readme-examples/draw-frame.example.ts -->

```TypeScript
import {drawFrame, LedColor} from 'ws2812draw';

drawFrame([
    [
        LedColor.Black,
        LedColor.Red,
        LedColor.Orange,
    ],
    [
        LedColor.Black,
        LedColor.Red,
        LedColor.Orange,
    ],
]);
```

### Clean up

<!-- example-link: src/readme-examples/clean-up.example.ts -->

```TypeScript
import {cleanUp} from 'ws2812draw';

cleanUp();
```

After `drawFrame` is done being used, run this to free up memory.

## Colors

Colors are stored in hex so they're easier to read. See the [`LedColor` enum](https://github.com/electrovir/ws2812draw/blob/master/src/color.ts) for defaults. For custom colors, use the following format with blue, green, and red channels:

```
0xBBGGRR
```

Note that drawing `0xFFFFFF` will be a _very_ bright white. For comparison, the default white color is only `0x0c0c0c`. You'll need to experiment with custom colors to calibrate their brightnesses with each other. The `LedColor` enum has been calibrated to provide colors that are all nearly the same in brightness.

# Running tests

## Examples

There are several smaller example scripts to showcase and test the LED board's functionality. Each script will ask for sudo permissions as they are required to access the LED board.

-   `npm run example`
-   `npm run example:simple`
-   `npm run example:text`

## Full tests

```bash
# this will ask you for your password in order to use sudo
npm test [test-index]
```

If no test-index is given, all the tests will run. This takes several minutes, must run with a LED display attached in order for anything to happen, and must be inspected manually.

# Speed stats

-   WxH: average fps with zero delay between drawFrame calls (using `npm run example`)
-   32x8: ~100 fps
-   64x8: ~50 fps
-   96x8: ~33 fps

As you can see, the framerate is directly related to the number of LEDs which the board is cycling through.
