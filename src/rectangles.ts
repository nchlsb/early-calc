import type { Point } from "./graphablefunctions";

export type RectangleStrategy = 'Left' | 'Midpoint' | 'Right'

export type Rectangle = {
    lowerLeftCorner: Point,
    width: number,
    height: number
}

export function visitStrategy<X extends string | number | symbol, Y>(x: X, whatToDo: Record<X, Y>): Y {
    return whatToDo[x]
}