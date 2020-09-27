import { productBy, sumBy, endSwitch } from "./helpers";

export let brett = 'brett'

// x^2 => 
// x + 2


// NOTE: All of these should be valid inputs, useable by the computer
// f (x) = x + 2
// f (x) = x^2
// f (x) = x^(x + x)
// f (x) = 3 + (x * 21)^3
// f (x) = (e * (pi ^ sin(x))) + cos(log17(x))

// Converted into LISP notation
// (plus x 2)
// (power x 2)
// (power x (plus x x))
// (plus 3 (power (times x 21) 3))
// (plus
    // (times e (power pi (sin x)))
    // (cos (log 17 x))
// )

// data Maybe = Just Int | Nothing
// data List = Cons Int List | Nil

// f(x) = -x + -(2 * 4)

// data Expression
    // = Add Expression Expression
    // | Subtract Expression Expression
    // | Multiply Expression Expression
    // | Divide Expression Expression
    // | Negate Expression
    // | Power Expression Expression
    // | Radical Expression Expression
    // | Sine Expression
    // | Cosine Expression
    // | Tangent Expression
    // | Log Expression Expression
    // | Absolutevaluateue Expression
    // | Mod Expression Expression
    // | Literal Number
    // | X
    // | Pi
    // | E 


// Code versus data
// Math.sin(10) <-- (kind: Sine, expr: 10)
type Expression = {
    kind: 'Add'
    expressions: Expression[] // (1 + 2) + 3 === 1 + (2 + 3)
} | {
    kind: 'Subtract'
    left: Expression
    right: Expression
} | {
    kind: 'Multiply'
    expressions: Expression[] // ((1)(2))(3) === (1)((2)(3))
} | {
    kind: 'Divide'
    numerator: Expression
    denominator: Expression
} | {
    kind: 'Negate'
    argument: Expression
} | {
    kind: 'Power'
    base: Expression
    exponent: Expression
} | {
    kind: 'Radical'
    radicand: Expression
    index: Expression
} | {
    kind: 'Sine' 
    argument: Expression
} | {
    kind: 'Cosine' 
    argument: Expression
} | {
    kind: 'Tangent' 
    argument: Expression
} | {
    kind: 'Log'
    base: Expression
    argument: Expression
} | {
    kind: 'AbsoulteValue'
    argument: Expression
} | {
    kind: 'Modular'
    left: Expression
    right: Expression
} | {
    kind: 'Literal'
    value: number
} | {
    kind: 'X'
} | {
    kind: 'Pi'
} | {
    kind: 'E'
}


// Brett's favorite expression
// x^2 + (2x + e^pi)

export const brettsFavorite: Expression = {
    kind: 'Add',
    expressions: [{
        kind: 'Power',
        base: {kind: 'X'},
        exponent: {
            kind: 'Literal',
            value: 2
        }
    }, {
        kind: 'Multiply',
        expressions: [{
            kind: 'Literal',
            value: 2
        }, {
            kind: 'X'
        }]
    }, {
        kind: 'Power',
        base: {
            kind: 'E'
        },
        exponent: {
            kind: 'Pi'
        }
    }]
}

// f(x) = x^2 + (2x + e^pi)
// f(10) = (10)^2 + ((2 * 10) + e^pi)
// f(10) = 143.1407

export const result = evaluate(brettsFavorite, 10);

function evaluate(expression: Expression, x: number): number {
    switch (expression.kind) {
        case 'Pi':
            return Math.PI;
        case 'E':
            return Math.E;
        case 'Literal':
            return expression.value;
        case 'X':
            return x;
        case 'Sine':
            return Math.sin(evaluate(expression.argument, x));
        case 'Cosine':
            return Math.cos(evaluate(expression.argument, x));
        case 'Tangent':
            return Math.tan(evaluate(expression.argument, x));
        case 'Add':
            return sumBy(expression.expressions, expression => evaluate(expression, x));
        case 'Subtract':
            return evaluate(expression.left, x) - evaluate(expression.right, x);
        case 'Multiply':
            return productBy(expression.expressions, expression => evaluate(expression, x))
        case 'Divide':
            return evaluate(expression.numerator, x) / evaluate(expression.denominator, x);
        case 'Modular':
            return evaluate(expression.left, x) % evaluate(expression.right, x);
        case 'Negate':
            return -evaluate(expression.argument, x);
        case 'Power':
            return Math.pow(evaluate(expression.base, x), evaluate(expression.exponent, x));
        case 'Log':
            return Math.log(evaluate(expression.argument, x)) / Math.log(evaluate(expression.base, x));
        case 'Radical':
            return Math.pow(evaluate(expression.radicand, x), 1 / evaluate(expression.index, x));
        case 'AbsoulteValue':
            return Math.abs(evaluate(expression.argument, x));
    } endSwitch(expression)
}

/*

data Maybe = Nothing | Just Int

sum :: [Int] -> Int
sum [] = 0
sum (x:xs) = x + sum xs

switch (list.kind) {
    case NIL:
        return 0

    case CONS:
        return list.first + sum (list.rest)
}

*/

export function toTeX(expression: Expression): string {
    switch (expression.kind) {
        case "Add":
            return `\\left(${expression.expressions.map(toTeX).join(" + ")}\\right)`;
        case "Divide":
            return `\\frac{${toTeX(expression.numerator)}}{${toTeX(expression.denominator)}}`
        case "Multiply":
            return `${expression.expressions.map(toTeX).join('')}`;
        case "Subtract":
            return `\\left(${toTeX(expression.left)} - ${toTeX(expression.right)}\\right)`;
        case "Sine":
            return `\\sin\\left(${toTeX(expression.argument)}\\right)`;
        case "Cosine":
            return `\\cos\\left(${toTeX(expression.argument)}\\right)`;
        case "Tangent":
            return `\\tan\\left(${toTeX(expression.argument)}\\right)`;
        case "E":
            return `e`;
        case "Pi":
            return `\\pi`;
        case "X":
            return `x`;
        case "Log":
            return `\\log_{${toTeX(expression.base)}}\\left(${toTeX(expression.argument)}\\right)`;
        case "Negate":
            return `\\left(${toTeX(expression.argument)}\\right)`;
        case "Modular":
            return `\\left(${toTeX(expression.left)} \\mod ${toTeX(expression.right)}\\right)`;
        case "Power":
            return `${toTeX(expression.base)}^{${toTeX(expression.exponent)}}`;
        case "Radical":
            return `\\sqrt[{${toTeX(expression.index)}}]{${toTeX(expression.radicand)}}`;
        case "Literal":
            return `${expression.value}`;
        case "AbsoulteValue":
            return `\\left|${expression.argument}\\right|`;
    } endSwitch(expression)
}

export const tex = toTeX(brettsFavorite);
