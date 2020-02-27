export function appendMatrices<T>(a: T[][], b: T[][]): T[][] {
    return a.map((aRow, index) => aRow.concat(b[index]));
}

export function flattenMatrix(inputArray: number[][]): number[] {
    return inputArray.reduce(function(flattened, innerArray) {
        return flattened.concat(innerArray);
    }, []);
}

export function getMatrixSize<T>(imageArray: T[][]) {
    const width = imageArray[0].length;
    if (
        imageArray.some(function(row) {
            return row.length != width;
        })
    ) {
        throw new Error(`imageArray rows are not all of equal length for drawStill`);
    }

    return {
        height: imageArray.length,
        width,
    };
}

export function createArray<T>(width: number, fillValue: T): T[] {
    return Array(width).fill(fillValue);
}

export function createMatrix<T>(height: number, width: number, fillValue: T): T[][] {
    return Array(height)
        .fill(0)
        .map(() => createArray(width, fillValue));
}

export function chopMatrix<T>(matrix: T[][], index: number, length?: number): T[][] {
    return matrix.map(row =>
        row.filter((_, cellIndex) => {
            const endIndex = length ? index + length : row.length - 1 - index;
            return cellIndex >= index && cellIndex < endIndex;
        }),
    );
}

/**
 * Used to determine how to pad matrices.
 * LEFT:   add padding on the left side (image gets pushed to right side)
 * RIGHT:  add padding on the right side (image gets pushed to left side)
 * BOTH:   add padding to both sides evenly (image gets centered)
 * NONE:   don't add any padding
 */
export enum MatrixPaddingOption {
    LEFT = 'left',
    RIGHT = 'right',
    BOTH = 'both',
    NONE = 'none',
}

export function padMatrix<T>(
    matrix: T[][],
    width: number,
    paddingFill: T,
    paddingStyle: MatrixPaddingOption = MatrixPaddingOption.LEFT,
): T[][] {
    if (matrix[0].length < width) {
        return matrix.map(row => {
            const difference = width - row.length;
            switch (paddingStyle) {
                case MatrixPaddingOption.LEFT:
                    return createArray(difference, paddingFill).concat(row);
                case MatrixPaddingOption.RIGHT:
                    return row.concat(createArray(difference, paddingFill));
                case MatrixPaddingOption.BOTH:
                    return createArray(Math.floor(difference / 2), paddingFill).concat(
                        row,
                        createArray(Math.ceil(difference / 2), paddingFill),
                    );
                case MatrixPaddingOption.NONE:
                    return row;
            }
        });
    } else {
        return matrix;
    }
}

export function maskMatrix<T>(
    colorMatrix: T[][],
    mask: (boolean | number | undefined | null)[][],
    emptyFill: T,
): T[][] {
    return colorMatrix.map((row, rowIndex) =>
        row.map((cell, cellIndex) => (!!mask[rowIndex][cellIndex] ? cell : emptyFill)),
    );
}
