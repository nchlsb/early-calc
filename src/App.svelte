<script lang="ts">
	import { result, tex } from './expression'
	import { Maybe, yAt } from "./helpers";
	import { endSwitch, maxBy, minBy, orElse, range, sumBy, just, nothing } from "./helpers";
	import * as katex from "katex";
import { each, onMount } from 'svelte/internal';
	

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
	const DEFAULT_BOUND_MAGNITUDE = Math.ceil(Math.PI);
	const GRAPH_AXIS_MARK_LENGTH = 0.08;

	const xMaxBound = DEFAULT_BOUND_MAGNITUDE
	const xMinBound = -DEFAULT_BOUND_MAGNITUDE

	const yMaxBound = DEFAULT_BOUND_MAGNITUDE
	const yMinBound = -DEFAULT_BOUND_MAGNITUDE

	const DELTX_X_APPROACHES_0 = 0.000000001;

	let sliderX = 0;
	let x: number;
	$: x = sliderX;

	let sliderDeltaX = Math.log((xMaxBound - xMinBound) / 2);
	let deltaX: number;
	$: deltaX = Math.exp(sliderDeltaX) - 1;

	let integralBound1 = -DEFAULT_BOUND_MAGNITUDE
	let integralBound2 = DEFAULT_BOUND_MAGNITUDE
	
	let integralLowerBound: number;
	$: integralLowerBound = Math.min(integralBound1, integralBound2);

	let integralUpperBound: number;
	$: integralUpperBound = Math.max(integralBound1, integralBound2);
	
	let sliderRectangleWidth = Math.log((xMaxBound - xMinBound) / 2);
	let dx: number;
	$: dx = Math.exp(sliderRectangleWidth) - 1;

	let f: (x: number) => number
	$: f = functions[selectedIndex].implementation

	let numberOfPoints: number = 100;

	let secantLine: {x1: number, y1: number, x2: number, y2: number}
	$: secantLine = {
		x1: xMinBound, y1: yAt(xMinBound, x, f(x), x + deltaX, f(x + deltaX)),
		x2: xMaxBound, y2: yAt(xMaxBound, x, f(x), x + deltaX, f(x + deltaX))
	}

	let tangentLine: {x1: number, y1: number, x2: number, y2: number}
	$: tangentLine = {
		x1: xMinBound, y1: yAt(xMinBound, x, f(x), x + DELTX_X_APPROACHES_0, f(x + DELTX_X_APPROACHES_0)),
		x2: xMaxBound, y2: yAt(xMaxBound, x, f(x), x + DELTX_X_APPROACHES_0, f(x + DELTX_X_APPROACHES_0))
	}

	function leftmostY(x1: number, y1: number, x2: number, y2: number): number {
		const lineFunction: (x: number) => number = function (x) {
			const m = (y2 - y1) / (x2 - x1)
			return m * (x - x1) + y1
		}

		return lineFunction(xMinBound)
	}

	function rightmostY(x1: number, y1: number, x2: number, y2: number): number {
		const lineFunction: (x: number) => number = function (x) {
			const m = (y2 - y1) / (x2 - x1)
			return m * (x - x1) + y1
		}

		return lineFunction(xMaxBound)
	}


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

	const functions = [
		{id: 'sine', implementation: (x: number) => Math.sin(x), representation: 'f(x) = \\sin(x)'},
		{id: 'const', implementation: (x: number) => 1, representation: 'f(x) = 1'},
		{id: 'linear', implementation: (x: number) => x, representation: 'f(x) = x'},
		{id: 'quadratic', implementation: (x: number) => x * x, representation: 'f(x) = x^2'},
		{id: 'exponential', implementation: (x: number) => Math.exp(x), representation: 'f(x) = e^x'},
		{id: 'cubic', implementation: (x: number) => (x - 1) * (x) * (x + 1), representation: 'f(x) = (x - 1)(x)(x + 1)'},
	];

	onMount(() => {

		// functions at the top
		for (let f of functions) {
			katex.render(f.representation, document.getElementById(`${f.id}`), {output: 'html'});
		}

		// input for location of tangent line
		katex.render("x:", document.getElementById("labelX"), {output: 'html'});

		// input for delta x
		katex.render("\\Delta x:", document.getElementById("labelDeltaXSymbol"), {output: 'html'});
	});


let selectedIndex = 0;

</script>
<div class="outer">
<div class="container">
	{#each functions as f, index}
		<button class={index === selectedIndex ? 'highlighted' : ''} on:click={_ => selectedIndex = index}><span id={f.id}>{f.representation}</span></button>
	{/each}

	<!-- derivatives -->
	<svg class="cartesian" viewBox="{xMinBound} {yMinBound} {(xMaxBound - xMinBound)} {(yMaxBound - yMinBound)}">
		<g>
			<!-- x and y axis -->
			<line stroke="black" fill="none" x1={xMinBound} y1="0" x2={xMaxBound} y2="0" />
			<line stroke="black" fill="none" x1="1"  y1={GRAPH_AXIS_MARK_LENGTH} x2="1"  y2={-GRAPH_AXIS_MARK_LENGTH} />
			<line stroke="black" fill="none" x1="2"  y1={GRAPH_AXIS_MARK_LENGTH} x2="2"  y2={-GRAPH_AXIS_MARK_LENGTH} />
			<line stroke="black" fill="none" x1="3"  y1={GRAPH_AXIS_MARK_LENGTH} x2="3"  y2={-GRAPH_AXIS_MARK_LENGTH} />
			<line stroke="black" fill="none" x1="4"  y1={GRAPH_AXIS_MARK_LENGTH} x2="4"  y2={-GRAPH_AXIS_MARK_LENGTH} />
			<line stroke="black" fill="none" x1="-1" y1={GRAPH_AXIS_MARK_LENGTH} x2="-1" y2={-GRAPH_AXIS_MARK_LENGTH} />
			<line stroke="black" fill="none" x1="-2" y1={GRAPH_AXIS_MARK_LENGTH} x2="-2" y2={-GRAPH_AXIS_MARK_LENGTH} />
			<line stroke="black" fill="none" x1="-3" y1={GRAPH_AXIS_MARK_LENGTH} x2="-3" y2={-GRAPH_AXIS_MARK_LENGTH} />
			<line stroke="black" fill="none" x1="-4" y1={GRAPH_AXIS_MARK_LENGTH} x2="-4" y2={-GRAPH_AXIS_MARK_LENGTH} />
			<line stroke="black" fill="none" x1="0" y1={yMinBound} x2="0" y2={yMaxBound} />
			<line stroke="black" fill="none" x1={-GRAPH_AXIS_MARK_LENGTH} y1="1"  x2={GRAPH_AXIS_MARK_LENGTH} y2="1" />
			<line stroke="black" fill="none" x1={-GRAPH_AXIS_MARK_LENGTH} y1="2"  x2={GRAPH_AXIS_MARK_LENGTH} y2="2" />
			<line stroke="black" fill="none" x1={-GRAPH_AXIS_MARK_LENGTH} y1="3"  x2={GRAPH_AXIS_MARK_LENGTH} y2="3" />
			<line stroke="black" fill="none" x1={-GRAPH_AXIS_MARK_LENGTH} y1="4"  x2={GRAPH_AXIS_MARK_LENGTH} y2="4" />
			<line stroke="black" fill="none" x1={-GRAPH_AXIS_MARK_LENGTH} y1="-1" x2={GRAPH_AXIS_MARK_LENGTH} y2="-1" />
			<line stroke="black" fill="none" x1={-GRAPH_AXIS_MARK_LENGTH} y1="-2" x2={GRAPH_AXIS_MARK_LENGTH} y2="-2" />
			<line stroke="black" fill="none" x1={-GRAPH_AXIS_MARK_LENGTH} y1="-3" x2={GRAPH_AXIS_MARK_LENGTH} y2="-3" />
			<line stroke="black" fill="none" x1={-GRAPH_AXIS_MARK_LENGTH} y1="-4" x2={GRAPH_AXIS_MARK_LENGTH} y2="-4" />

			<!-- graph of function -->
			<polyline stroke="black" fill="none" points={points.map(point => `${point.x},${point.y}`).join(' ')} />

			<line stroke="black" stroke-dasharray="2,2" fill="none"
				x1={secantLine.x1} y1={secantLine.y1}
				x2={secantLine.x2} y2={secantLine.y2}
			/>
			<!-- <line stroke="grey" stroke-dasharray="2,2" fill="none"
				x1={tangentLine.x1} y1={tangentLine.y1}
				x2={tangentLine.x2} y2={tangentLine.y2}
			/> -->

			<circle cx={x} cy={f(x)} r=".075" fill="red"></circle>
			<circle cx={x + deltaX} cy={f(x + deltaX)} r=".075" fill="red"></circle>

			<!-- <text x={x} y={-f(x)} font-size=".4">Delt X</text> -->
		</g>
	</svg>
	
	<label id="labelX" for="x">x: {x}</label>
	<input id="x" type="range" step="0.01" min={xMinBound} max={xMaxBound} bind:value={sliderX}>

	<!-- todo - is there a better way to in-line this?-->
	<span style="display: inline-block;">
		<label id="labelDeltaXSymbol" for="deltaX">Delta x:</label>
	</span>
	<span style="display: inline-block;">
		<label id="labelDeltaXValue" for="deltaX">{deltaX.toFixed(2)}</label>
	</span>
	
	<input id="deltaX" type="range" min="0.001" step="0.01" max={Math.log(xMaxBound - xMinBound).toFixed(2)}  bind:value={sliderDeltaX}>



	<!-- integrals -->

	<svg class="cartesian" viewBox="{xMinBound} {yMinBound} {(xMaxBound - xMinBound)} {(yMaxBound - yMinBound)}">
		<g>
			<!-- x and y axis -->
			<line stroke="black" fill="none" x1={xMinBound} y1="0" x2={xMaxBound} y2="0" />
			<line stroke="black" fill="none" x1="1"  y1={GRAPH_AXIS_MARK_LENGTH} x2="1"  y2={-GRAPH_AXIS_MARK_LENGTH} />
			<line stroke="black" fill="none" x1="2"  y1={GRAPH_AXIS_MARK_LENGTH} x2="2"  y2={-GRAPH_AXIS_MARK_LENGTH} />
			<line stroke="black" fill="none" x1="3"  y1={GRAPH_AXIS_MARK_LENGTH} x2="3"  y2={-GRAPH_AXIS_MARK_LENGTH} />
			<line stroke="black" fill="none" x1="4"  y1={GRAPH_AXIS_MARK_LENGTH} x2="4"  y2={-GRAPH_AXIS_MARK_LENGTH} />
			<line stroke="black" fill="none" x1="-1" y1={GRAPH_AXIS_MARK_LENGTH} x2="-1" y2={-GRAPH_AXIS_MARK_LENGTH} />
			<line stroke="black" fill="none" x1="-2" y1={GRAPH_AXIS_MARK_LENGTH} x2="-2" y2={-GRAPH_AXIS_MARK_LENGTH} />
			<line stroke="black" fill="none" x1="-3" y1={GRAPH_AXIS_MARK_LENGTH} x2="-3" y2={-GRAPH_AXIS_MARK_LENGTH} />
			<line stroke="black" fill="none" x1="-4" y1={GRAPH_AXIS_MARK_LENGTH} x2="-4" y2={-GRAPH_AXIS_MARK_LENGTH} />
			<line stroke="black" fill="none" x1="0" y1={yMinBound} x2="0" y2={yMaxBound} />
			<line stroke="black" fill="none" x1={-GRAPH_AXIS_MARK_LENGTH} y1="1"  x2={GRAPH_AXIS_MARK_LENGTH} y2="1" />
			<line stroke="black" fill="none" x1={-GRAPH_AXIS_MARK_LENGTH} y1="2"  x2={GRAPH_AXIS_MARK_LENGTH} y2="2" />
			<line stroke="black" fill="none" x1={-GRAPH_AXIS_MARK_LENGTH} y1="3"  x2={GRAPH_AXIS_MARK_LENGTH} y2="3" />
			<line stroke="black" fill="none" x1={-GRAPH_AXIS_MARK_LENGTH} y1="4"  x2={GRAPH_AXIS_MARK_LENGTH} y2="4" />
			<line stroke="black" fill="none" x1={-GRAPH_AXIS_MARK_LENGTH} y1="-1" x2={GRAPH_AXIS_MARK_LENGTH} y2="-1" />
			<line stroke="black" fill="none" x1={-GRAPH_AXIS_MARK_LENGTH} y1="-2" x2={GRAPH_AXIS_MARK_LENGTH} y2="-2" />
			<line stroke="black" fill="none" x1={-GRAPH_AXIS_MARK_LENGTH} y1="-3" x2={GRAPH_AXIS_MARK_LENGTH} y2="-3" />
			<line stroke="black" fill="none" x1={-GRAPH_AXIS_MARK_LENGTH} y1="-4" x2={GRAPH_AXIS_MARK_LENGTH} y2="-4" />

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
	
	<label for="range1">interval bound 1</label>
	<input class="bound-range1" type="range" min={xMinBound} max={xMaxBound} step=".01" bind:value={integralBound1}>
	<label for="bound-range2">interval bound 2</label>
	<input class="bound-range2" type="range" min={xMinBound} max={xMaxBound} step=".01" bind:value={integralBound2}>

	<label for="rectangle-width">Rectangle Width: {(dx).toFixed(3)}</label>
	<input id="rectangle-width" type="range" min="0.01" step="0.01" max={Math.log(xMaxBound - xMinBound).toFixed(2)} bind:value={sliderRectangleWidth}>
</div>
</div>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.css" integrity="sha384-AfEj0r4/OFrOo5t7NnNe46zW/tFgW6x/bCJG8FqQCEo3+Aro6EYUG4+cU+KJWu/X" crossorigin="anonymous">
<style>
	.outer {
		width: 100%;
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

	input[type="range"], svg.cartesian {
		width: min(65vh, 100%);
		display: block;
		margin: 0 auto;
	}

	.container {
		width: min(70vh, 100%);
		display: block;
		margin: 0 auto;
	}

	/* Flip the vertical axis in <g> to emulate cartesian. */
	svg.cartesian > g {
		transform: scaleY(-1);
	}

	/* Re-flip all <text> element descendants to their original side up. */
	svg.cartesian > g text {
		transform: scaleY(-1);
	}

	.highlighted {
		background-color: limegreen;
	}

	label {
		width: max-content;
	}
</style>