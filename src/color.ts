/**
 * Color examples.
 * The format is WWBBGGRR. WW is unused.
 * These directly affect the brightness of each colored LED. Thus, if you turn these values way up, the lights will be,
 * in general, brighter. There's a direct impact on how effective the brightness parameter is. For example, low color
 * values here might not even show up if the brightness is too low.
 * These colors are picked so that they'll mostly even out at higher brightnesses but they may not be unique in
 * lower brightness. For example, at brightness 7 ORANGE and RED look the same.
 */
export enum LedColor {
    Black /*         */ = 0x00000000,
    Red /*           */ = 0x0000002d,
    Orange /*        */ = 0x0000082d,
    Yellow /*        */ = 0x00001719,
    Green /*         */ = 0x00001c00,
    Turquoise /*     */ = 0x00081e00,
    Cyan /*          */ = 0x00121200,
    Blue /*          */ = 0x00200000,
    Violet /*        */ = 0x001a0009,
    Magenta /*       */ = 0x00080017,
    White /*         */ = 0x000c0c0c,
}

export function diffColors(a: LedColor, b: LedColor, ratio: number | ColorChannels = 0.5) {
    const aChannels = splitIntoColorChannels(a);
    const bChannels = splitIntoColorChannels(b);

    const diff: ColorChannels =
        typeof ratio === 'number'
            ? {
                  red: (bChannels.red - aChannels.red) * ratio,
                  green: (bChannels.green - aChannels.green) * ratio,
                  blue: (bChannels.blue - aChannels.blue) * ratio,
              }
            : {
                  red: (bChannels.red - aChannels.red) * ratio.red,
                  green: (bChannels.green - aChannels.green) * ratio.green,
                  blue: (bChannels.blue - aChannels.blue) * ratio.blue,
              };

    const added = {
        red: aChannels.red + diff.red,
        green: aChannels.green + diff.green,
        blue: aChannels.blue + diff.blue,
    };

    return combineColorChannels(added);
}

export type ColorChannels = {
    red: LedColor;
    green: LedColor;
    blue: LedColor;
};

export function toHex(color: LedColor): string {
    return color.toString(16).padStart(6, '0');
}

export function combineColorChannels(channels: ColorChannels): LedColor {
    const combinedString =
        '0x' +
        Math.floor(channels.blue).toString(16).padStart(2, '0') +
        Math.floor(channels.green).toString(16).padStart(2, '0') +
        Math.floor(channels.red).toString(16).padStart(2, '0');
    const combined = Number(combinedString);

    return combined;
}

export function splitIntoColorChannels(color: LedColor): ColorChannels {
    const hexColor = toHex(color);
    const split = {
        red: Number('0x' + hexColor.substring(4, 6)),
        green: Number('0x' + hexColor.substring(2, 4)),
        blue: Number('0x' + hexColor.substring(0, 2)),
    };

    return split;
}
