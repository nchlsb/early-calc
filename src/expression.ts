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
    left: Expression
    right: Expression
} | {
    kind: 'Subtract'
    left: Expression
    right: Expression
} | {
    kind: 'Multiply'
    left: Expression
    right: Expression
} | {
    kind: 'Divide'
    left: Expression
    right: Expression
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
    kind: 'Absoultevaluateue'
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
    right: {
        kind: 'Power',
        base: {kind: 'X'},
        exponent: {
            kind: 'Literal',
            value: 2
        }
    },
    left: {
        kind: 'Add',
        left: {
            kind: 'Multiply',
            left: {
                kind: 'Literal',
                value: 2
            },
            right: {
                kind: 'X'
            }
        },
        right: {
            kind: 'Power',
            base: {
                kind: 'E'
            },
            exponent: {
                kind: 'Pi'
            }
        }
    }
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
            return evaluate(expression.left, x) + evaluate(expression.right, x);
        case 'Subtract':
            return evaluate(expression.left, x) - evaluate(expression.right, x);
        case 'Multiply':
            return evaluate(expression.left, x) * evaluate(expression.right, x);    
        case 'Divide':
            return evaluate(expression.left, x) / evaluate(expression.right, x);
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
        case 'Absoultevaluateue':
            return Math.abs(evaluate(expression.argument, x));
    } endSwitch(expression)
}

function endSwitch(x: never): never {
    throw Error('Shouldn\'t get here.');
}