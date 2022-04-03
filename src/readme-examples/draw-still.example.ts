import {drawStillImage, LedColor} from '..';

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
