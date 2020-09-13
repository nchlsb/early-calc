export function sumBy<T>(array: T[], getNumber: (a: T) => number): number {
    let sum = 0;
    for (let a of array) {
        sum += getNumber(a)
    }

    return sum;
}

export function range(n: number): number[] {
    let retVal: number[] = [];

    for (let i = 0; i < n; i++) {
        retVal.push(i);
    }

    return retVal;
}