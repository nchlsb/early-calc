// import { productBy, sumBy, endSwitch, Maybe, nothing, just } from "./helpers";

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

//     type IncompleteExpression = {
//         kind: 'Plus'
//         left: IncompleteExpression
//         right: IncompleteExpression
//     } | {
//         kind: '1'
//     } | {
//         kind: 'Active'
//     } | {
//         kind: 'Inactive'
//     }
    
// // Code versus data
// // Math.sin(10) <-- (kind: Sine, expr: 10)
// type Expression = {
//     kind: 'Add'
//     expressions: Expression[] // (1 + 2) + 3 === 1 + (2 + 3)
// } | {
//     kind: 'Subtract'
//     left: Expression
//     right: Expression
// } | {
//     kind: 'Multiply'
//     expressions: Expression[] // ((1)(2))(3) === (1)((2)(3))
// } | {
//     kind: 'Divide'
//     numerator: Expression
//     denominator: Expression
// } | {
//     kind: 'Negate'
//     argument: Expression
// } | {
//     kind: 'Power'
//     base: Expression
//     exponent: Expression
// } | {
//     kind: 'Radical'
//     radicand: Expression
//     index: Expression
// } | {
//     kind: 'Sine' 
//     argument: Expression
// } | {
//     kind: 'Cosine' 
//     argument: Expression
// } | {
//     kind: 'Tangent' 
//     argument: Expression
// } | {
//     kind: 'Log'
//     base: Expression
//     argument: Expression
// } | {
//     kind: 'AbsoulteValue'
//     argument: Expression
// } | {
//     kind: 'Modular'
//     left: Expression
//     right: Expression
// } | {
//     kind: 'Literal'
//     value: number
// } | {
//     kind: 'X'
// } | {
//     kind: 'Pi'
// } | {
//     kind: 'E'
// }


// // Brett's favorite expression
// // x^2 + (2x + e^pi)

// export const brettsFavorite: Expression = {
//     kind: 'Add',
//     expressions: [{
//         kind: 'Power',
//         base: {kind: 'X'},
//         exponent: {
//             kind: 'Literal',
//             value: 2
//         }
//     }, {
//         kind: 'Multiply',
//         expressions: [{
//             kind: 'Literal',
//             value: 2
//         }, {
//             kind: 'X'
//         }]
//     }, {
//         kind: 'Power',
//         base: {
//             kind: 'E'
//         },
//         exponent: {
//             kind: 'Pi'
//         }
//     }]
// }

// // f(x) = x^2 + (2x + e^pi)
// // f(10) = (10)^2 + ((2 * 10) + e^pi)
// // f(10) = 143.1407

// export const result = evaluate(brettsFavorite, 10);

// function evaluate(expression: Expression, x: number): number {
//     switch (expression.kind) {
//         case 'Pi':
//             return Math.PI;
//         case 'E':
//             return Math.E;
//         case 'Literal':
//             return expression.value;
//         case 'X':
//             return x;
//         case 'Sine':
//             return Math.sin(evaluate(expression.argument, x));
//         case 'Cosine':
//             return Math.cos(evaluate(expression.argument, x));
//         case 'Tangent':
//             return Math.tan(evaluate(expression.argument, x));
//         case 'Add':
//             return sumBy(expression.expressions, expression => evaluate(expression, x));
//         case 'Subtract':
//             return evaluate(expression.left, x) - evaluate(expression.right, x);
//         case 'Multiply':
//             return productBy(expression.expressions, expression => evaluate(expression, x))
//         case 'Divide':
//             return evaluate(expression.numerator, x) / evaluate(expression.denominator, x);
//         case 'Modular':
//             return evaluate(expression.left, x) % evaluate(expression.right, x);
//         case 'Negate':
//             return -evaluate(expression.argument, x);
//         case 'Power':
//             return Math.pow(evaluate(expression.base, x), evaluate(expression.exponent, x));
//         case 'Log':
//             return Math.log(evaluate(expression.argument, x)) / Math.log(evaluate(expression.base, x));
//         case 'Radical':
//             return Math.pow(evaluate(expression.radicand, x), 1 / evaluate(expression.index, x));
//         case 'AbsoulteValue':
//             return Math.abs(evaluate(expression.argument, x));
//     } endSwitch(expression)
// }

// /*

// data Maybe = Nothing | Just Int

// sum :: [Int] -> Int
// sum [] = 0
// sum (x:xs) = x + sum xs

// switch (list.kind) {
//     case NIL:
//         return 0

//     case CONS:
//         return list.first + sum (list.rest)
// }

// */

// export function toTeX(expression: Expression): string {
//     switch (expression.kind) {
//         case "Add":
//             return `\\left(${expression.expressions.map(toTeX).join(" + ")}\\right)`;
//         case "Divide":
//             return `\\frac{${toTeX(expression.numerator)}}{${toTeX(expression.denominator)}}`
//         case "Multiply":
//             return `${expression.expressions.map(toTeX).join('')}`;
//         case "Subtract":
//             return `\\left(${toTeX(expression.left)} - ${toTeX(expression.right)}\\right)`;
//         case "Sine":
//             return `\\sin\\left(${toTeX(expression.argument)}\\right)`;
//         case "Cosine":
//             return `\\cos\\left(${toTeX(expression.argument)}\\right)`;
//         case "Tangent":
//             return `\\tan\\left(${toTeX(expression.argument)}\\right)`;
//         case "E":
//             return `e`;
//         case "Pi":
//             return `\\pi`;
//         case "X":
//             return `x`;
//         case "Log":
//             return `\\log_{${toTeX(expression.base)}}\\left(${toTeX(expression.argument)}\\right)`;
//         case "Negate":
//             return `\\left(${toTeX(expression.argument)}\\right)`;
//         case "Modular":
//             return `\\left(${toTeX(expression.left)} \\mod ${toTeX(expression.right)}\\right)`;
//         case "Power":
//             return `${toTeX(expression.base)}^{${toTeX(expression.exponent)}}`;
//         case "Radical":
//             return `\\sqrt[{${toTeX(expression.index)}}]{${toTeX(expression.radicand)}}`;
//         case "Literal":
//             return `${expression.value}`;
//         case "AbsoulteValue":
//             return `\\left|${expression.argument}\\right|`;
//     } endSwitch(expression)
// }

// export const tex = toTeX(brettsFavorite);

// function turnActiveIntoPlus(expression: IncompleteExpression): IncompleteExpression {
// 	switch (expression.kind) {
// 		case '1': return {kind: '1'};
// 		case 'Inactive': return {kind: 'Inactive'};
// 		case 'Active': return {kind: 'Plus', left: {kind: 'Active'}, right: {kind: 'Inactive'}};
// 		case 'Plus': return {kind: 'Plus', left: turnActiveIntoPlus(expression.left), right: turnActiveIntoPlus(expression.right)}
// 	} endSwitch(expression)
// }

// function turnActiveInto1(expression: IncompleteExpression): IncompleteExpression {
// 	switch (expression.kind) {
// 		case '1': return {kind: '1'};
// 		case 'Inactive': return {kind: 'Inactive'};
// 		case 'Active': return {kind: '1'};
// 		case 'Plus': return {kind: 'Plus', left: turnActiveInto1(expression.left), right: turnActiveInto1(expression.right)}
// 	} endSwitch(expression)
// }

// function copyIncompleteExpression(expression: IncompleteExpression): IncompleteExpression {
// 	switch (expression.kind) {
// 		case '1': return {kind: '1'};
// 		case 'Inactive': return {kind: 'Inactive'};
// 		case 'Active': return {kind: 'Active'};
// 		case 'Plus': return {kind: 'Plus', left: copyIncompleteExpression(expression.left), right: copyIncompleteExpression(expression.right)}
// 	} endSwitch(expression)
// }

// function maybeGetLeft(expression: IncompleteExpression): Maybe<IncompleteExpression> {
// 	if (expression.kind === 'Plus') {
// 		return just(expression.left)
// 	}

// 	return nothing()
// }


// function maybeGetRight(expression: IncompleteExpression): Maybe<IncompleteExpression> {
// 	if (expression.kind === 'Plus') {
// 		return just(expression.right)
// 	}

// 	return nothing()
// }

// function turnFirstInactiveIntoActive(expression: IncompleteExpression): IncompleteExpression {
// 	const copy = copyIncompleteExpression(expression)

// 	/*
// 		iterativeInorder(firstNode)
// 			s ← empty stack
// 			node <- firstNode
// 			while (not s.isEmpty() or node ≠ null)
// 				if (node ≠ null)
// 					s.push(node)
// 					node ← node.left
// 				else
// 					node ← s.pop()
// 					visit(node)
// 					node ← node.right
// 	*/

// 	// let S be a stack
// 	let stack: IncompleteExpression[] = []
// 	// node <- firstNode
// 	let node = just(copy)
// 	while (stack.length !== 0 || node.kind !== 'Nothing') {
// 		if (node.kind !== 'Nothing') {
// 			stack.push(node.value)
// 			node = maybeGetLeft(node.value)
// 		} else {
// 			const value = stack.pop()
// 			// visit
// 			if (value.kind === 'Plus') {
// 				if (value.left.kind === 'Inactive') {
// 					// Guaranteed to be the first found, because it's an in-order traversal
// 					value.left = {kind: 'Active'}
// 					break
// 				} else if (value.right.kind === 'Inactive') {
// 					value.right = {kind: 'Active'}
// 					break
// 				}
// 			}
// 			node = maybeGetRight(value) // nullable expressionn
// 		}
// 	}

// 	return copy
// }
