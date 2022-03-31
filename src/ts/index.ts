import bindings from 'bindings';
import {createArray} from './matrix';
import {LedColor} from './color';

export interface CApi {
    initMatrix(width: number, height: number, brightness: number): boolean;
    drawStill(width: number, height: number, brightness: number, colors: number[]): boolean;
    cleanUp(): boolean;
}

const cApi: CApi = bindings('ws2812draw');

export {};

// console.log(nodeApi.hello());
console.log(cApi.initMatrix(32, 8, 255));
console.log(cApi.drawStill(32, 8, 100, createArray(8 * 32, LedColor.BLACK)));
console.log(cApi.cleanUp());
// Prints: 'world'
