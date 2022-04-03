import {drawText, LedColor, MatrixPaddingOption} from '..';
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
