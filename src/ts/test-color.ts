import {getEnumTypedValues} from './util/object';
import * as draw from './';

function testColorDiff() {
    let colorValues = getEnumTypedValues(draw.LedColor).filter(
        color => color !== draw.LedColor.BLACK && color !== draw.LedColor.WHITE,
    );

    colorValues.forEach((a, index) => {
        const b = colorValues[index + 1] || colorValues[0];
        console.log({a: draw.color.toHex(a), b: draw.color.toHex(b)});
        const diffColor = draw.color.diffColors(a, b, 0.25);
        console.log(
            `\na:\t${draw.color.toHex(a)}\nb:\t${draw.color.toHex(b)}\ndiff:\t${draw.color.toHex(diffColor)}\n`,
        );
    });
}

testColorDiff();
