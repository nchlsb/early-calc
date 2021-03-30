export type Point = {
    x: number
    y: number
}

export type LimitStrategy = 'FromLeft' | 'FromRight'

export function twoPointForm(point1: Point, point2: Point): (x: number) => number {
    const m = slope(point1, point2);
    return (x) => m * (x - point1.x) + point1.y;
}

export function slope( point1: Point, point2: Point): number {
    return (point2.y - point1.y) / (point2.x - point1.x);
}

export function point(x, y): Point {
    return {x: x, y: y}
}