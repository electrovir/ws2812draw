# WS2812 Draw

Made for running on a Raspberry Pi. Uses the C library [rpi_ws281x](https://github.com/jgarff/rpi_ws281x).

# Usage

## Install

```
npm install ws2812draw
```

## API

Exported members:

```typescript
# Functions
function drawStill(brightness: number, imageArray: number[][]): boolean;

function init(height: number, width: number, brightness: number): boolean;
function drawFrame(imageArray: number[][]): boolean;
function cleanUp(): void;

# Default colors
enum LedColor {
    BLACK,
    RED,
    ORANGE,
    YELLOW,
    YELLOW_GREEN,
    GREEN,
    TURQUOISE,
    CYAN,
    LIGHT_BLUE,
    BLUE,
    VIOLET,
    PINK,
    MAGENTA,
    WHITE,
}
```

## Draw Image

Pass in a 2D array of colors to `drawStill`. This is _relatively_ low performance. Meaning, I get ~60fps on a 8x32 LED matrix.

```typescript
drawStill(brightness: number, imageArray: number[][]): boolean;
```

Example:

```typescript
import {drawStill, LedColor} from 'ws2812draw';
const success = drawStill(50, [
    [LedColor.BLACK, LedColor.RED, LedColor.ORANGE],
    [LedColor.BLACK, LedColor.RED, LedColor.ORANGE],
]);
```

Note that on my 8x32 LED matrix this doesn't draw as a rectangle, it draws in a line since the array height doesn't match up correctly.

## High Performance Drawing

### Init the LED board once

```typescript
init(height: number, width: number, brightness: number): boolean;
```

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

After all frames are done being drawn run this to free up memory.

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

## Permissions

Make sure anything that includes this package runs with root access or you'll get permission denied (root access on the Raspberry Pi is needed for driving the LEDs).
