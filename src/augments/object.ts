export function overrideDefinedProperties<T extends object, U extends object>(
    a: T,
    b: U,
): T & Partial<U> {
    const starter: T & Partial<U> = {...a};
    return getObjectTypedKeys(b)
        .filter((key) => b[key] != undefined)
        .reduce((accum, key) => {
            accum[key] = b[key] as any;
            return accum;
        }, starter);
}

export function getObjectTypedKeys<T extends object>(input: T): (keyof T)[] {
    return Object.keys(input) as (keyof T)[];
}

export function getEnumTypedKeys<T extends object>(input: T): (keyof T)[] {
    // keys are always strings
    return getObjectTypedKeys(input).filter((key) => isNaN(Number(key))) as (keyof T)[];
}

export function getEnumTypedValues<T extends object>(input: T): T[keyof T][] {
    const keys = getEnumTypedKeys(input);
    return keys.map((key) => input[key]);
}
