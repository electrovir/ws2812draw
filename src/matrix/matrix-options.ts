import {LedColor} from '../color';
/**
 * Used to determine how to pad matrices. The value name (ex. LEFT) is the side of the given matrix
 * that the padding is added to. The opposite side remains unchanged. (ex. LEFT padding will result
 * in the left side of the matrix being filled up)
 */
export enum MatrixPaddingOption {
    /** Add padding on the left side (image gets pushed to right side) */
    Left = 'left',
    /** Add padding on the right side (image gets pushed to left side) */
    Right = 'right',
    /** Add padding to both sides evenly (image gets centered) */
    Both = 'both',
    /** Don't add any padding */
    None = 'none',
}

/**
 * Options for drawing strings or characters. defaults (copied from defaultTextOptions):
 * foregroundColor: LedColor.WHITE, backgroundColor: LedColor.BLACK, monospace: false,
 */
export type LetterOptions = Partial<{
    foregroundColor: LedColor;
    backgroundColor: LedColor;
    monospace: boolean;
}>;

export const defaultTextOptions: Required<LetterOptions> = {
    foregroundColor: LedColor.White,
    backgroundColor: LedColor.Black,
    monospace: false,
};

export type AlignmentOptions = {
    /** Width of the LED board. */
    width: number;
    padding: MatrixPaddingOption;
    /** The background color of the padding. Defaults to black (no color). */
    padColor?: LedColor | undefined;
};
