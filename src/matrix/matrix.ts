import {MatrixPaddingOption} from './matrix-options';

export class MatrixError extends Error {
    public name = 'MatrixError';
}

export type MatrixDimensions = {
    height: number;
    width: number;
};

export function appendMatrices<T>(...matrices: T[][][]): T[][] {
    matrices.forEach(matrix => assertConsistentMatrixSize(matrix));
    return matrices.reduce((accum, current) => {
        return appendMatrixPair(accum, current);
    }, [] as T[][]);
}

/**
 * Don't export this, this assumes that matrix size consistency has already been asserted
 */
function appendMatrixPair<T>(a: T[][], b: T[][]): T[][] {
    if (a.length && [0].length) {
        return a.map((aRow, index) => aRow.concat(b[index]));
    } else {
        return b;
    }
}

export function flattenMatrix(inputArray: number[][]): number[] {
    return inputArray.reduce((flattened, innerArray) => {
        return flattened.concat(innerArray);
    }, []);
}

export function getMatrixSize<T>(matrix: T[][]): MatrixDimensions {
    assertConsistentMatrixSize(matrix);

    return {
        width: matrix[0].length,
        height: matrix.length,
    };
}

export function createArray<T>(width: number, fillValue: T): T[] {
    return Array(width).fill(fillValue);
}

export function createMatrix<T>(dimensions: MatrixDimensions, fillValue: T): T[][] {
    return Array(dimensions.height)
        .fill(0)
        .map(() => createArray(dimensions.width, fillValue));
}

export function chopMatrix<T>(matrix: T[][], index: number, length?: number): T[][] {
    return matrix.map(row =>
        row.filter((_, cellIndex) => {
            const endIndex = length ? index + length : row.length - 1 - index;
            return cellIndex >= index && cellIndex < endIndex;
        }),
    );
}

export function assertConsistentMatrixSize<T>(matrix: T[][]): void {
    if (matrix.length) {
        const width = matrix[0].length;
        if (matrix.some(row => row.length !== width)) {
            throw new MatrixError(`matrix rows are not all of equal length`);
        }
    }
}

export function getPadDifference<T>(
    matrix: T[][],
    width: number,
    paddingStyle: MatrixPaddingOption,
): {left: number; right: number} {
    assertConsistentMatrixSize(matrix);
    const difference = width - matrix[0].length;
    if (difference < 0) {
        return {
            left: 0,
            right: 0,
        };
    }
    switch (paddingStyle) {
        case MatrixPaddingOption.Left:
            return {
                left: difference,
                right: 0,
            };
        case MatrixPaddingOption.Right:
            return {
                left: 0,
                right: difference,
            };
        case MatrixPaddingOption.Both:
            return {
                left: Math.floor(difference / 2),
                right: Math.ceil(difference / 2),
            };
        case MatrixPaddingOption.None:
            return {
                left: 0,
                right: 0,
            };
    }
}

export function padMatrix<T>(
    matrix: T[][],
    width: number,
    paddingFill: T,
    paddingStyle: MatrixPaddingOption = MatrixPaddingOption.Left,
): T[][] {
    if (matrix[0].length < width && paddingStyle !== MatrixPaddingOption.None) {
        const {left, right} = getPadDifference(matrix, width, paddingStyle);
        const leftPadMatrix = createMatrix(
            {
                width: left,
                height: matrix.length,
            },
            paddingFill,
        );
        const rightPadMatrix = createMatrix(
            {
                width: right,
                height: matrix.length,
            },
            paddingFill,
        );
        const appendedMatrix = appendMatrices(leftPadMatrix, matrix, rightPadMatrix);

        return appendedMatrix;
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
