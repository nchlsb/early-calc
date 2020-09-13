<script lang="ts">
	import { result } from './expression'
	import {range, sumBy} from "./helpers";

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

	let yMaxBound = DEFAULT_BOUND_MAGNITUDE
	let yMinBound = -DEFAULT_BOUND_MAGNITUDE

	let integralUpperBound = DEFAULT_BOUND_MAGNITUDE
	let integralLowerBound = -DEFAULT_BOUND_MAGNITUDE
	
	let dx: number = 1

	let f: (x: number) => number
	$: f = function(x) {
		return (x * x);
	}

	let numberOfPoints: number = 50

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

	let scale = 500;
/*
	Todo list
		1. (X)Change the consts at the bottom 
		2. ( )Bounderies should be aligned on the axes or use scroll to zoom
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
*/

</script>

<main>
	<ul>
		<li>
			Should be 143.1407 : ..... {result}
		</li>
		<li>
			Scale {scale}
			<input class="bound-range" type="range" min={10} max={1000} bind:value={scale}>
		</li>
		<li>
			Rectangle Width {dx}
			<input type="range" min="0.1" step=".1" max={integralUpperBound - integralLowerBound} bind:value={dx}>
		</li>
		<li>
			Function
			<select bind:value={f}>
				<option value={x => (x * x)}>Squared</option>
				<option value={x => Math.sin(x)}>Sine</option>
			</select>
		</li>
		<li>
			The sum of the rectangles rounded to 1's place is {Math.round(sumBy(riemannRectangles, 
				rectangle => rectangle.width * rectangle.height))}
		</li>
	</ul>

	<svg class="cartesian" viewBox="{xMinBound * scale} {yMinBound * scale} {(xMaxBound - xMinBound) * scale} {(yMaxBound - yMinBound)  * scale}">
		<g>
			<line stroke="black" fill="none" x1={xMinBound * scale} y1="0" x2={xMaxBound * scale} y2="0" />
			<line stroke="black" fill="none" x1="0" y1={yMinBound * scale} x2="0" y2={yMaxBound * scale} />

			<line stroke="black" stroke-dasharray="2,2" fill="none" x1={integralLowerBound * scale} y1={yMinBound * scale} x2={integralLowerBound * scale} y2={yMaxBound * scale} />
			<line stroke="black" stroke-dasharray="2,2" fill="none" x1={integralUpperBound * scale} y1={yMinBound * scale} x2={integralUpperBound * scale} y2={yMaxBound * scale} />

			{#each riemannRectangles as rectangle}
					<rect
						class="riemann-rectangle"
						x={rectangle.lowerLeftCorner.x * scale}
						y={rectangle.lowerLeftCorner.y * scale}
						width={rectangle.width * scale}
						height={rectangle.height * scale}
					/>
			{/each}
			<polyline stroke="black" fill="none" points={points.map(point => `${point.x * scale},${point.y * scale}`).join(' ')} />

		</g>
	</svg>

	<input class="bound-range" type="range" min={xMinBound} max={xMaxBound} bind:value={integralLowerBound}>
	<input class="bound-range" type="range" min={xMinBound} max={xMaxBound} bind:value={integralUpperBound}>

	<input type="number" max={xMaxBound} bind:value={xMinBound}>
	<input type="number" min={xMinBound} bind:value={xMaxBound}>
	<input type="number" max={yMaxBound} bind:value={yMinBound}>
	<input type="number" min={yMinBound} bind:value={yMaxBound}>
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

	line {
		stroke-width: 1px;
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