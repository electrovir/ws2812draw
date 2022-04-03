import {drawScrollingImage, LedColor, MatrixPaddingOption} from '..';

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
