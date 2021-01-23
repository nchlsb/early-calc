export type Point = {
    x: number
    y: number
}

export type Context = "Derivative" | "Integral"

export function sumBy<T>(array: T[], getNumber: (a: T) => number): number {
    let sum = 0;
    for (let a of array) {
        sum += getNumber(a);
    }

    return sum;
}

export function productBy<T>(array: T[], getNumber: (a: T) => number): number {
    let product = 1;
    for (let a of array) {
        product *= getNumber(a);
    }

    return product;
}

export type Maybe<T> = {
    kind: 'Just'
    value: T
} | {
    kind: 'Nothing'
}

export function orElse<T>(maybe: Maybe<T>, alternative: T): T {
    return (maybe.kind === 'Just') ? maybe.value : alternative;
}

export function maxBy<T>(array: T[], getNumber: (a: T) => number): Maybe<T> {
    if (array.length === 0) {
        return {kind: 'Nothing'}
    }

    let max = array[0]

    for (let a of array) {
        max = (getNumber(a) > getNumber(max)) ? a : max;
    }

    return {kind: 'Just', value: max};
}

export function minBy<T>(array: T[], getNumber: (a: T) => number): Maybe<T> {
    if (array.length === 0) {
        return {kind: 'Nothing'}
    }

    let max = array[0]

    for (let a of array) {
        max = (getNumber(a) < getNumber(max)) ? a : max;
    }

    return {kind: 'Just', value: max};
}

export function range(n: number): number[] {
    let retVal: number[] = [];

    for (let i = 0; i < n; i++) {
        retVal.push(i);
    }

    return retVal;
}

export function endSwitch(x: never): never {
    throw Error('Shouldn\'t get here.');
}

export function just<T>(value: T): Maybe<T> {
    return {kind: 'Just', value: value}
}

export function nothing<T>(): Maybe<T> {
    return {kind: 'Nothing'}
}

export function twoPoints(point1: Point, point2: Point): (x: number) => number {
    const m = slope(point1, point2);
    return (x) => m * (x - point1.x) + point1.y;
}

export function slope( point1: Point, point2: Point): number {
    return (point2.y - point1.y) / (point2.x - point1.x);
}

export function point(x, y): Point {
    return {x: x, y: y}
}

// export function slope( x1: number, y1: number, x2: number, y2: number): Maybe<number>{
//     return (x2-x1 != 0) ? 
//     {kind: "Just", value: (y2 - y1) / (x2 - x1) } : 
//     {kind : 'Nothing'};
// }
