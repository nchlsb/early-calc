import type { Point } from "./graphablefunctions";

export type RectangleStrategy = 'Left' | 'Midpoint' | 'Right'

export type Rectangle = {
    lowerLeftCorner: Point,
    width: number,
    height: number
}

export function visitStrategy<T>(
    rectangleStrategy: RectangleStrategy,
    visitor: {whenLeft: T, whenMidpoint: T,	whenRight: T}
): T {
    switch (rectangleStrategy) {
        case 'Left':
            return visitor.whenLeft
        case 'Midpoint':
            return visitor.whenMidpoint
        case 'Right':
            return visitor.whenRight // visitor pattern
    }
}

// export function visitMaybe<A, B>(maybe: Maybe<A>, visitor: {whenJust: (a: A) => B, whenNothing: B}): B {
//     switch (maybe.kind) {
//         case 'Just':
//             return visitor.whenJust(maybe.value)

//         case 'Nothing':
//             return visitor.whenNothing
//     }
// }
