import bindings from 'bindings';
import {createArray} from './matrix';
import {LedColor} from './color';

export interface CApi {
    initMatrix(width: number, height: number, brightness: number): boolean;
    drawStill(width: number, height: number, brightness: number, colors: number[]): boolean;
    drawFrame(colors: number[]): boolean;
    cleanUp(): boolean;
    test(): string;
}

const cApi: CApi = bindings('ws2812draw');

export {};

// console.log(nodeApi.hello());
console.log(cApi.test());
console.log(cApi.initMatrix(32, 8, 255));
console.log(cApi.drawStill(32, 8, 30, createArray(8 * 32, LedColor.GREEN)));
setTimeout(() => {
    console.log(cApi.drawFrame(createArray(8 * 32, LedColor.CYAN)));
    console.log(cApi.cleanUp());
}, 1000);
// Prints: 'world'
