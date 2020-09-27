<script lang="ts">
	import { result, tex } from './expression'
	import type { Maybe } from "./helpers";
	import { endSwitch, maxBy, minBy, orElse, range, sumBy } from "./helpers";
	import { onMount } from 'svelte';

	type Point = {
		x: number
		y: number
	}

	type Rectangle = {
		lowerLeftCorner: Point,
		width: number,
		height: number
	}

	// variables of graph 
	const DEFAULT_BOUND_MAGNITUDE = 10

	let xMaxBound = DEFAULT_BOUND_MAGNITUDE
	let xMinBound = -DEFAULT_BOUND_MAGNITUDE

	let yMaxBound: number
	$: yMaxBound = orElse(maxBy(points.map(point => point.y), y => y), DEFAULT_BOUND_MAGNITUDE) + 1

	let yMinBound: number
	$: yMinBound = orElse(minBy(points.map(point => point.y), y => y), -DEFAULT_BOUND_MAGNITUDE) - 1

	let integralUpperBound = DEFAULT_BOUND_MAGNITUDE
	let integralLowerBound = -DEFAULT_BOUND_MAGNITUDE
	
	let dx: number = 1;

	let f: (x: number) => number
	$: f = x => Math.sin(x)

	let numberOfPoints: number = 100;

	// -10 -> 5
	// offset => 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15
	// lowerBound + offset
	// -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5

	let points: Point[]
	$: points = [...range(numberOfPoints).map(n => {
		const x = xMinBound + (n * ((xMaxBound - xMinBound) / numberOfPoints))
		return {x: x, y: f(x)}
	}), {x: xMaxBound, y: f(xMaxBound)}];

	let numberRectangles: number;
	$: numberRectangles = (integralUpperBound - integralLowerBound) / dx;

	let riemannRectangles: Rectangle[]
	$: riemannRectangles = range(numberRectangles).map(n => {
		const x = integralLowerBound + (n * (integralUpperBound - integralLowerBound) / numberRectangles);
		const y = f(x);

		// SVG can't process negative height 
		return {
			height: Math.abs(y),
			width: dx,
			lowerLeftCorner: {x: x, y: (y > 0) ? 0 : y}
		};
	});

/*
	Todo list
		1. (X)Change the consts at the bottom 
		2. (-)Bounderies should be aligned on the axes or use scroll to zoom
		3. ( )Add automatically-updating LaTeX equations
		4. ( )Desktop and mobile friendliness
		5. ( )Negative areas and colors
			  Especially when the lower bound is greater than the upper bound
		6. ( )Add testing
			  Property based test: symbolic integration and riemann sum give similar results
		7. ( )Custom user equations
		8. ( )Automatically determine Y upper and lower bounds via min and max f(x) value
		9. ( )Dragging uppwer and lower bounds on graph 
		10.( ) Highlight over or under estimations as differnt color 
		11.( ) Math shold work out so scale varible is always 1 px
		12.( ) Copy out math as text
*/

type IncompleteExpression = {
	kind: 'Plus'
	left: IncompleteExpression
	right: IncompleteExpression
} | {
	kind: '1'
} | {
	kind: 'Active'
} | {
	kind: 'Inactive'
}

function render(expression: IncompleteExpression): string {
	switch (expression.kind) {
		case 'Plus': return `(${render(expression.left)} + ${render(expression.right)})`
		case '1': return '1'
		case 'Active': return '□'
		case 'Inactive': return '■'
	} endSwitch(expression)
}

function turnActiveIntoPlus(expression: IncompleteExpression): IncompleteExpression {
	console.log('Calling Jaffa')
	switch (expression.kind) {
		case '1': return {kind: '1'};
		case 'Inactive': return {kind: 'Inactive'};
		case 'Active': return {kind: 'Plus', left: {kind: 'Active'}, right: {kind: 'Inactive'}};
		case 'Plus': return {kind: 'Plus', left: turnActiveIntoPlus(expression.left), right: turnActiveIntoPlus(expression.right)}
	} endSwitch(expression)
}

function hasActive(expression: IncompleteExpression): boolean {
	switch (expression.kind) {
		case '1': return false;
		case 'Inactive': return false;
		case 'Active': return true;
		case 'Plus': return hasActive(expression.left) || hasActive(expression.right);
	} endSwitch(expression)
}

let expression: IncompleteExpression = {kind: 'Active'}

</script>

<main>
	<p><code>{ render(expression) }</code></p>
	<button on:click={() => expression = turnActiveIntoPlus(expression)}> Add Plus </button>

	<ul>
		<li>
			Should be \[ {tex} \]
		</li>

		<li>
			Should be 143.1407 : ..... {result}
		</li>
		<li>
			Rectangle Width {dx}
			<input type="range" min="0.1" step=".1" max={integralUpperBound - integralLowerBound} bind:value={dx}>
		</li>
		<li>
			Function
			<select bind:value={f}>
				<option default value={x => Math.sin(x)}>Sine</option>
				<option value={x => (x * x)}>Squared</option>	
			</select>
		</li>
		<li>
			The sum of the rectangles rounded to 1's place is {Math.round(sumBy(riemannRectangles, 
				rectangle => rectangle.width * rectangle.height))}
		</li>
		<li>{yMinBound} {yMaxBound}</li>
	</ul>

	<svg class="cartesian" viewBox="{xMinBound} {yMinBound} {(xMaxBound - xMinBound)} {(yMaxBound - yMinBound) }">
		<g>
			<!-- x and y axis -->
			<line stroke="black" fill="none" x1={xMinBound} y1="0" x2={xMaxBound} y2="0" />
			<line stroke="black" fill="none" x1="0" y1={yMinBound} x2="0" y2={yMaxBound} />

			<!-- bounds of intergral -->
			<line stroke="black" stroke-dasharray="2,2" fill="none" x1={integralLowerBound} y1={yMinBound} x2={integralLowerBound} y2={yMaxBound} />
			<line stroke="black" stroke-dasharray="2,2" fill="none" x1={integralUpperBound} y1={yMinBound} x2={integralUpperBound} y2={yMaxBound} />

			<!-- rectangles -->
			{#each riemannRectangles as rectangle}
					<rect
						class="riemann-rectangle"
						x={rectangle.lowerLeftCorner.x}
						y={rectangle.lowerLeftCorner.y}
						width={rectangle.width}
						height={rectangle.height}
					/>
			{/each}

			<!-- graph of function -->
			<polyline stroke="black" fill="none" points={points.map(point => `${point.x},${point.y}`).join(' ')} />

		</g>
	</svg>

	<input class="bound-range" type="range" min={xMinBound} max={xMaxBound} step=".01" bind:value={integralLowerBound}>
	<input class="bound-range" type="range" min={xMinBound} max={xMaxBound} step=".01" bind:value={integralUpperBound}>

	<input type="number" max={xMaxBound - 1} bind:value={xMinBound}>
	<input type="number" min={xMinBound + 1} bind:value={xMaxBound}>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	.riemann-rectangle {
		fill: gray;
		stroke: black;
		stroke-width: 1;
	}

	line, rect, polyline {
		stroke-width: 1px;
		vector-effect: non-scaling-stroke;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}

	.bound-range {
		width: 100%;
	}

	svg.cartesian {
		display: flex;
		width: 100%;
	}

	/* Flip the vertical axis in <g> to emulate cartesian. */
	svg.cartesian > g {
		width: 100%;
		transform: scaleY(-1);
	}

	/* Re-flip all <text> element descendants to their original side up. */
	svg.cartesian > g text {
		transform: scaleY(-1);
	}
</style>