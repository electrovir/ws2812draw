import * as draw from '..';
import {getEnumTypedValues} from '../augments/object';

function testColor() {
    let colorValues = getEnumTypedValues(draw.LedColor).filter(
        (color) => color !== draw.LedColor.Black && color !== draw.LedColor.White,
    );

    colorValues.forEach((a, index) => {
        const b: draw.LedColor = colorValues[index + 1]! || colorValues[0]!;
        console.log({a: draw.toHex(a), b: draw.toHex(b)});
        const diffColor = draw.diffColors(a, b, 0.25);
        console.log(
            `\na:\t${draw.toHex(a)}\nb:\t${draw.toHex(b)}\ndiff:\t${draw.toHex(diffColor)}\n`,
        );
    });
}

testColor();
