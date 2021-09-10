export function sumBy<T>(array: T[], getNumber: (a: T) => number): number {
    let sum = 0;
    for (let a of array) {
        sum += getNumber(a);
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


// export function productBy<T>(array: T[], getNumber: (a: T) => number): number {
//     let product = 1;
//     for (let a of array) {
//         product *= getNumber(a);
//     }

//     return product;
// }

// export type Maybe<T> = {
//     kind: 'Just'
//     value: T
// } | {
//     kind: 'Nothing'
// }

// export function orElse<T>(maybe: Maybe<T>, alternative: T): T {
//     return (maybe.kind === 'Just') ? maybe.value : alternative;
// }

// export function maxBy<T>(array: T[], getNumber: (a: T) => number): Maybe<T> {
//     if (array.length === 0) {
//         return {kind: 'Nothing'}
//     }

//     let max = array[0]

//     for (let a of array) {
//         max = (getNumber(a) > getNumber(max)) ? a : max;
//     }

//     return {kind: 'Just', value: max};
// }

// export function minBy<T>(array: T[], getNumber: (a: T) => number): Maybe<T> {
//     if (array.length === 0) {
//         return {kind: 'Nothing'}
//     }

//     let max = array[0]

//     for (let a of array) {
//         max = (getNumber(a) < getNumber(max)) ? a : max;
//     }

//     return {kind: 'Just', value: max};
// }

// export function endSwitch(x: never): never {
//     throw Error('Shouldn\'t get here.');
// }

// export function just<T>(value: T): Maybe<T> {
//     return {kind: 'Just', value: value}
// }

// export function nothing<T>(): Maybe<T> {
//     return {kind: 'Nothing'}
// }

// export function slope( x1: number, y1: number, x2: number, y2: number): Maybe<number>{
//     return (x2-x1 != 0) ? 
//     {kind: "Just", value: (y2 - y1) / (x2 - x1) } : 
//     {kind : 'Nothing'};
// }

/*
Then make a second function divideBoth that takes an a1, a2, and a b, and returns a Pair of 
[a1 / b, a2 / b]
*/

// function divide(a: number, b: number): Maybe<number> {
//     return (b !== 0) ? just(a / b): nothing(); 
// }

// type Psair<A, B> = {first: A, second: B}

// function pair<A, B>(a: A, b: B): Pair<A,B>{
//     return {first: a, second: b};
// }

// function divideBoth(a1: number, a2: number, b: number): Maybe<Pair<number, number>> {
//     return just(pair(divide(a1, b), divide(a2, b)));
// }



function longestCommonPrefix(strs) {
    for (let i = 0; i < strs.length; i++){
        
    const preFix = (str => str.substring(0, i + 1));
        
    if (!strs.map(s => preFix(s)).every(val => val === preFix))
        return preFix(strs[0]);
    }
    
    return '';
};


longestCommonPrefix(["flower","flow","flight"])