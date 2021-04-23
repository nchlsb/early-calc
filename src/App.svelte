<script lang="ts">
	import type { Rectangle, RectangleStrategy } from "./rectangles";
	import type { LimitStrategy, Point} from "./graphablefunctions";
	import { slope, twoPointForm } from "./graphablefunctions";
	import { range, sumBy} from "./helpers";
	import { visitStrategy } from "./rectangles";
	import RangeSlider from "svelte-range-slider-pips";
	import * as katex from "katex";
	import Katex from "./Katex.svelte"
	import { onMount } from 'svelte/internal';
	import { tooltip } from './tooltip';

	// ********************* graph *********************
	const DEFAULT_BOUND_MAGNITUDE = Math.ceil(Math.PI);
	const GRAPH_AXIS_MARK_LENGTH = 0.08;

	const xMaxBound = DEFAULT_BOUND_MAGNITUDE
	const xMinBound = -DEFAULT_BOUND_MAGNITUDE

	const yMaxBound = DEFAULT_BOUND_MAGNITUDE
	const yMinBound = -DEFAULT_BOUND_MAGNITUDE

	// ********************* function *********************

	let f: (x: number) => number
	$: f = functions[selectedFunctionIndex].implementation

	let numberOfPoints: number = 100;

	let points: Point[]
	$: points = [...range(numberOfPoints).map(n => {
		const x = xMinBound + (n * ((xMaxBound - xMinBound) / numberOfPoints))
		return {x: x, y: f(x)}
	}), {x: xMaxBound, y: f(xMaxBound)}];

	// ********************* derivatives *********************
	// Aproximation of delta x -> 0
	const DELTA_X_APPROACHES_0 = 0.00000001;

	// Delta x
	let deltaXSliderFromRight = [1];
	let deltaXSliderFromLeft = [-1];
	$: deltaX = (derivativeLimitStrategy === 'FromRight') ? deltaXSliderFromRight[0] : deltaXSliderFromLeft[0]

	// User input into the fucntion x
	let xSlider = [1]
	let x: number;
	$: x = xSlider[0]

	// Wheather delta x -> 0 from the left or the right 
	let derivativeLimitStrategy: LimitStrategy = 'FromRight'
	
	// Points of tangnet line
	let secantPoint1: Point
	$: secantPoint1 = {x: x, y: f(x)}
	let secantPoint2: Point
	$: secantPoint2 = (deltaX !== 0) ? {x: x + deltaX, y: f(x + deltaX)} : tangentPoint2

	// Points of secant line
	let tangentPoint1: Point
	$: tangentPoint1 = {x: x, y: f(x)}
	let tangentPoint2: Point
	$: tangentPoint2 = {x: x + DELTA_X_APPROACHES_0, y: f(x + DELTA_X_APPROACHES_0)}

	// Function for secant line
	let secant: (x: number) => number
	$: secant = twoPointForm(secantPoint1, secantPoint2)

	// Slope of the secant
	let slopeSecant: number
	$: slopeSecant = (deltaX !== 0) ? slope(secantPoint1, secantPoint2) : slopeTangent

	// Display of seecant lane 
	let secantLine: {x1: number, y1: number, x2: number, y2: number}
	$: secantLine = {
		x1: xMinBound, y1: secant(xMinBound),
		x2: xMaxBound, y2: secant(xMaxBound)
	}

	// Function for tangnet line
	let tangent: (x: number) => number
	$: tangent = twoPointForm(tangentPoint1, tangentPoint2)

	// Slope of tangnet
	let slopeTangent: number
	$: slopeTangent = slope(tangentPoint1, tangentPoint2)

	let tangentLine: {x1: number, y1: number, x2: number, y2: number}
	$: tangentLine = {
		x1: xMinBound, y1: tangent(xMinBound),
		x2: xMaxBound, y2: tangent(xMaxBound)
	}

	// $: derivativeDef = `\\dfrac{\\mathrm{d}}{\\mathrm{d}x} ${(deltaX !== 0) ? `{\\color{crimson}\\:\\approx}` : `=`} 
	// 	{\\color{${(deltaX !== 0) ? `lightgray` : `crimson`}}
	// 	\\lim_{\\Delta x \\rightarrow 0}} \\frac{f(x + \\Delta x) - f(x)}{\\Delta x} 
	// 	= ${slopeSecant.toFixed(2).replace('-0.00', '0.00')}`;

	$: derivativeDef = `\\dfrac{\\mathrm{d}}{\\mathrm{d}x} f(x)
		${(deltaX !== 0) ? `{\\color{crimson}\\:\\approx}` : `{\\color{crimson}\\:=}`} 
		{\\color{${(deltaX !== 0) ? `lightgray` : `crimson`}} \\lim_{\\Delta x \\rightarrow 0}} 
		\\frac{f(x + \\Delta x) - f(x)}{\\Delta x} 
		= ${slopeSecant.toFixed(2).replace('-0.00', '0.00')}`;
	

	// ********************* integrals *********************
	// Maximum user input of the slider before the user makes n -> infinity
	const MAX_INPUT_RECTANGLES = 150
	// Number of rectangles used to display integral when n approches infinity  
	const DISPLAY_N_APPROCHES_INFINITY = 1000;

	// Bounds of the integral 
	let integralBoundsInput = [-DEFAULT_BOUND_MAGNITUDE, DEFAULT_BOUND_MAGNITUDE]
	$: integralLowerBound = integralBoundsInput[0];
	$: integralUpperBound = integralBoundsInput[1];

	// Type of Riemann integral 
	let rectangleStrategy: RectangleStrategy
	$: rectangleStrategy = 'Left'

	// Weather integral is approximate or note. AKA "n approches infinity"
	let nApprochesInfinity = false;
	$: nApprochesInfinity = (numberRectanglesInput[0] === MAX_INPUT_RECTANGLES + 1) 

	// Number of rectangles in the Riemann integral 
	let numberRectanglesInput = [5]
	$: numberRectangles = (nApprochesInfinity) ? DISPLAY_N_APPROCHES_INFINITY : numberRectanglesInput[0]

	// Width of each rectangle
	let rectangleWidth: number;
	$: rectangleWidth = Math.abs((integralUpperBound - integralLowerBound) / numberRectangles)//sliderRectangleWidth//Math.exp(sliderRectangleWidth) - 1;

	// Riemann rectangles
	let riemannRectangles: Rectangle[]
	$: riemannRectangles = range(numberRectangles).map(n => {
		const x = integralLowerBound + (n * (integralUpperBound - integralLowerBound) / numberRectangles);

		const y = f(x + visitStrategy(rectangleStrategy, {
			Left: 0,
			Midpoint: (rectangleWidth / 2),
			Right: rectangleWidth
		}))

		// SVG can't process negative height 
		return {
			height: Math.abs(y),
			width: rectangleWidth,
			lowerLeftCorner: {x: x, y: (y > 0) ? 0 : y}
		};
	});

	// Sum of all rectangles 
	let riemannSum: number;
	$: riemannSum = sumBy(riemannRectangles, rectangle => (rectangle.lowerLeftCorner.y === 0) ? 
		rectangle.width * rectangle.height : 
		-rectangle.width * rectangle.height)

	// Real value of the integral when n -> infinity
	$: integralValue = functions[selectedFunctionIndex].integral(integralUpperBound) 
		- functions[selectedFunctionIndex].integral(integralLowerBound)	
	
	// Location of the labels for the upper and lower bounds
	let boundLabelPostion: number;
	$: boundLabelPostion = (() => {	
		if (integralUpperBound === xMaxBound && integralLowerBound === xMaxBound)
			return integralUpperBound - 0.4
		else if (integralUpperBound === xMinBound && integralLowerBound === xMinBound)
			return integralUpperBound
		else
			return integralUpperBound - 0.15
	})()
	
	

	// Displayed approximation or definition of an integral, depending on whether n approaches infinity 
	$: integralDef = `\\int_{a}^{b} f(x)dx ${(!nApprochesInfinity) ? `{\\color{crimson}\\:\\approx}` : `{\\color{crimson}\\:=}`} 
		{\\color{${(!nApprochesInfinity) ? `lightgray` : `crimson`}} 
		\\lim_{n \\rightarrow \\infty}} \\sum_{i=1}^n f(x_i)\\Delta x
		= ${((!nApprochesInfinity) ? riemannSum : integralValue).toFixed(2).replace('-0.00', '0.00')}`	 

	// ********************* controls *********************

	type Context = "Derivative" | "Integral" | "About"
	let context: Context
	$: context = "Derivative"
	// $: context = "Integral"
	// $: context = "About"

	let selectedFunctionIndex = 0;

	const functions = [
		{
			id: 'sine', 
			implementation: (x: number) => Math.sin(x), 
			integral: (x: number) => -Math.cos(x),
			representation: 'f(x) = \\sin(x)'
		},
		{
			id: 'quadratic', 
			implementation: (x: number) => x * x, 
			integral: (x: number) => Math.pow(x, 3) / 3,
			representation: 'f(x) = x^2'},
		{
			id: 'exponential', 
			implementation: (x: number) => Math.exp(x), 
			integral: (x: number) => Math.exp(x),
			representation: 'f(x) = e^x'
		},
		{
			id: 'cubic', 
			implementation: (x: number) => (x - 1) * (x) * (x + 1),
			integral: (x: number) => (Math.pow(x, 2) * (Math.pow(x, 2) - 2)) / 4,
			representation: 'f(x) = (x - 1)(x)(x + 1)'
		},
	];
	
	// ********************* equation rendering *********************

	// onMount(() => {

	// 	// functions at the top
	// 	for (let f of functions) {
	// 		katex.render(f.representation, document.getElementById(`${f.id}`), {output: 'html'});
	// 	}
	
	// 	//renderEquation()
	// });

	function renderEquation(): void {
		// katex.render(`x = ${x}`, document.getElementById('xEquals'))
		// katex.render(`\\Delta x = ${deltaX}`, document.getElementById('deltaXEquals'))


		// katex.render('m = \\lim_{\\Delta x \\rightarrow 0} \\frac{f(x + \\Delta x) - f(x)}{\\Delta x}',
		// 	document.getElementById('differenceEquation1'), {output: 'html'})
		// katex.render(`m = \\frac{f(x + ${g(deltaX)}) - f(x)}{${g(deltaX)}}`,
		// 	document.getElementById('differenceEquation2'), {output: 'html'})
		// katex.render(`m = \\frac{f(${g(x)} + ${g(deltaX)}) - f(${g(x)})}{${g(deltaX)}}`,
		// 	document.getElementById('differenceEquation3'), {output: 'html'})
		// katex.render(`m = \\frac{f(${g(x + deltaX)}) - f(${g(x)})}{${g(deltaX)}}`,
		// 	document.getElementById('differenceEquation4'), {output: 'html'})
		// katex.render(`m = ${g(f(x + deltaX) - f(x) / deltaX)}`,
		// 	document.getElementById('differenceEquation5'), {output: 'html'})
	}

	function g(n: number): string {
		return n.toFixed(2)
	}

</script>
<div class="outer">
<div class="container">
	<p>
		<button class={context === 'Derivative' ? 'highlighted' : ''}  on:click={_ => context = 'Derivative'}>Derivatives</button>
		<button class={context === 'Integral' ? 'highlighted' : ''}  on:click={_ => context = 'Integral'}>Integral</button>
		| <button class={context === 'About' ? 'highlighted' : ''}  on:click={_ => context = 'About'}>About</button>
		
	</p>
	{#if context !== 'About'}
		{#each functions as f, functionIndex}
			<button class={functionIndex === selectedFunctionIndex ? 'highlighted' : ''} on:click={() => selectedFunctionIndex = functionIndex}>
				<Katex math={f.representation}/>
			</button>
		{/each}
		
		<!-- derivatives -->
		<svg class="cartesian" viewBox="{xMinBound} {yMinBound} {(xMaxBound - xMinBound)} {(yMaxBound - yMinBound)}">
			<g>
				{#if context === 'Derivative'}
					
					<line stroke="crimson" stroke-dasharray="4,4" fill="none"
						x1={secantLine.x1} y1={secantLine.y1}
						x2={secantLine.x2} y2={secantLine.y2}
					/>

					<!-- <line stroke="grey" stroke-dasharray="4,4" fill="none"
						x1={tangentLine.x1} y1={tangentLine.y1}
						x2={tangentLine.x2} y2={tangentLine.y2}
						visibility={(deltaX !== 0) ? "visible" : "hidden"}
					/> -->

					<circle use:tooltip data-title={`(${x.toFixed(2)}, ${f(x).toFixed(2)})`} cx={x} cy={f(x)} r=".075" fill="crimson"></circle>
					<circle use:tooltip data-title={`(${(x + deltaX).toFixed(2)}, ${f(x + deltaX).toFixed(2)})`} cx={x + deltaX} cy={f(x + deltaX)} r=".075" fill="crimson"></circle>
			
					<!-- why does the y value need to be negative?-->
					<!-- <text x={x + deltaX + 0.5} y={-secant(x + deltaX)} font-size=".4">m={slope(secantPoint1, secantPoint2).toFixed(2)}</text> -->
				{:else}
					<!-- bounds of integral -->
					<line stroke="black" stroke-dasharray="2,2" fill="none" x1={integralLowerBound} y1={yMinBound + 0.3} x2={integralLowerBound} y2={yMaxBound} />
					<text class="integeralBound" x={integralLowerBound} y={-yMinBound - 0.04}>{(integralLowerBound !== integralUpperBound) ? 'a' : ''}</text>
		
					<line stroke="black" stroke-dasharray="2,2" fill="none" x1={integralUpperBound} y1={yMinBound + 0.3} x2={integralUpperBound} y2={yMaxBound} />
					<text class="integeralBound" x={boundLabelPostion} y={-yMinBound - 0.04}>
						{(integralLowerBound !== integralUpperBound) ? 'b' : 'a, b'}
					</text>

					{#each riemannRectangles as rectangle}
						<rect
							class={(rectangleWidth > 0.1) ? "riemann-rectangle" : "riemann-rectangle-no-stroke"}
							x={rectangle.lowerLeftCorner.x}
							y={rectangle.lowerLeftCorner.y}
							width={rectangle.width}
							height={rectangle.height}
						/>
					{/each}


				
				{/if}
				<!-- x and y axis -->
				<text class="AxisLabel" x={xMaxBound - 0.30} y={0.25}>+x</text>
				<line stroke="black" fill="none" x1={xMinBound} y1="0" x2={xMaxBound} y2="0" />
				<line stroke="black" fill="none" x1="1"  y1={GRAPH_AXIS_MARK_LENGTH} x2="1"  y2={-GRAPH_AXIS_MARK_LENGTH} />
				<line stroke="black" fill="none" x1="2"  y1={GRAPH_AXIS_MARK_LENGTH} x2="2"  y2={-GRAPH_AXIS_MARK_LENGTH} />
				<line stroke="black" fill="none" x1="3"  y1={GRAPH_AXIS_MARK_LENGTH} x2="3"  y2={-GRAPH_AXIS_MARK_LENGTH} />
				<line stroke="black" fill="none" x1="4"  y1={GRAPH_AXIS_MARK_LENGTH} x2="4"  y2={-GRAPH_AXIS_MARK_LENGTH} />
				<line stroke="black" fill="none" x1="-1" y1={GRAPH_AXIS_MARK_LENGTH} x2="-1" y2={-GRAPH_AXIS_MARK_LENGTH} />
				<line stroke="black" fill="none" x1="-2" y1={GRAPH_AXIS_MARK_LENGTH} x2="-2" y2={-GRAPH_AXIS_MARK_LENGTH} />
				<line stroke="black" fill="none" x1="-3" y1={GRAPH_AXIS_MARK_LENGTH} x2="-3" y2={-GRAPH_AXIS_MARK_LENGTH} />
				<line stroke="black" fill="none" x1="-4" y1={GRAPH_AXIS_MARK_LENGTH} x2="-4" y2={-GRAPH_AXIS_MARK_LENGTH} />
				<text class="AxisLabel" x={0.1} y={yMinBound + 0.2}>+y</text>
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
			</g>
		</svg>

		<span class='equation'>
			{#if context === 'Derivative'}
				<Katex math={derivativeDef} displayMode/>
			{:else}
				<Katex math={integralDef} displayMode/>
			{/if}
		</span>

		{#if context === 'Derivative'}
			<label for="deltaX">
				<Katex math={`\\Delta x :`}></Katex> {deltaX.toFixed(2)}
			</label>

			<span id="deltaXInput" class="slider">
				{#if derivativeLimitStrategy === 'FromRight'}
					<RangeSlider 
					step={0.01} 
					bind:values={deltaXSliderFromRight}		
					range={false}
					min={0}
					max={1}
					pips
					first={'label'} 
					last={'label'}
					rest={false}
					springValues={{stiffness: 1, damping: 1 }}
					/>
				{:else}
					<RangeSlider 
					step={0.01} 
					bind:values={deltaXSliderFromLeft}		
					range={false}
					min={-1}
					max={0}
					pips
					first={'label'} 
					last={'label'}
					rest={false}
					springValues={{stiffness: 1, damping: 1 }}
					/>
				{/if}
				
			</span>
			
			<label for="xSliderInput"><Katex math={`x :`}></Katex> {x.toFixed(2)}</label>
			<span id="xSliderInput" class="slider">
				<RangeSlider  
				min={xMinBound} 
				max={xMaxBound}
				step={0.01} 
				bind:values={xSlider}		
				range={false}
				pips
				first={'label'} 
				last={'label'}
				rest={false}
				springValues={{stiffness: 1, damping: 1 }}
				/>
			</span>

			<button class={derivativeLimitStrategy === 'FromLeft' ? 'highlighted' : ''}  on:click={_ => derivativeLimitStrategy = 'FromLeft'}>Limit from left</button>
			<button class={derivativeLimitStrategy === 'FromRight' ? 'highlighted' : ''}  on:click={_ => derivativeLimitStrategy = 'FromRight'}>Limit from right</button>
		{:else}
			<label id="NumberRectangles" for="RectangleWidthValue"><Katex math={`n :`}></Katex> {(nApprochesInfinity) ? `∞` : numberRectangles}</label>
			<span class="slider">
				<RangeSlider 
					min={1} 
					max={MAX_INPUT_RECTANGLES + 1} 
					pips 
					all='label' 
					bind:values={numberRectanglesInput}
					pipstep={20}	
					formatter={value => (value === MAX_INPUT_RECTANGLES + 1) ? '∞' : value}	
					float 
					hover
					springValues={{stiffness: 1, damping: 1 }}
				/>
			</span>

			<span class="slider">
				<RangeSlider 
					range 
					min={xMinBound} 
					max={xMaxBound} 
					bind:values={integralBoundsInput}
					step={0.01}
					float 
					hover
					springValues={{stiffness: 1, damping: 1 }}
				/>	
			</span>
			
			<button class={rectangleStrategy === 'Left' ? 'highlighted' : ''}  on:click={_ => rectangleStrategy = 'Left'}>Left</button>
			<button class={rectangleStrategy === 'Midpoint' ? 'highlighted' : ''}  on:click={_ => rectangleStrategy = 'Midpoint'}>Midpoint</button>
			<button class={rectangleStrategy === 'Right' ? 'highlighted' : ''}  on:click={_ => rectangleStrategy = 'Right'}>Right</button>	
		{/if}
	{:else}
			<h1>Early Calculus Supplement App</h1>
			<h2>Calculus Might Not Be Easy</h2>
				<p>But this app helps visualize the transition from finite to infinite
				so you have something to understand instead of just rules to memorize.</p>
			<h2>Credits</h2>
				<h3>Devlopers: 
					<a href="https://github.com/schreiberbrett">Brett Schreiber</a> and
					<a href="https://github.com/nchlsb">Nick Brady</a> 
				</h3>
				<h3>Calculs Tutors Conulsted: 
					<a href="https://www.math.ucla.edu/~esserl/?fbclid=IwAR0lUHqLf1uoD5DgY1yz1i_zEYqAunsRI8QsSmMvilNgDQOeewqyWLS3prQ">Louis Esser</a>, 
					Richard Shaffer, and Steven Wood</h3>
				<h3> Introduced the Devs to Eachother: Cal Doughan</h3>
				<h3>
					Insperations:
					<a href="https://www.desmos.com/calculator">Desmos</a> and
					<a href="https://www.youtube.com/watch?v=WUvTyaaNkzM"> 3Blue1Brown</a> 
				</h3>
			<h2>Source Code</h2>
				<a href="https://github.com/nchlsb/IntegralVisualizer">Link to GitHub</a>
	{/if}
	<!-- <p id="differenceEquation1"></p>
	<p id="differenceEquation2"></p>
	<p id="differenceEquation3"></p>
	<p id="differenceEquation4"></p>
	<p id="differenceEquation5"></p>
	<p id="xEquals"></p>
	<p id="deltaXEquals"></p> -->
	
</div>
</div>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.css" integrity="sha384-AfEj0r4/OFrOo5t7NnNe46zW/tFgW6x/bCJG8FqQCEo3+Aro6EYUG4+cU+KJWu/X" crossorigin="anonymous">
<style>
	.outer {
		width: 90%;
		margin: auto;
	}

	.riemann-rectangle {
		fill: crimson;
		stroke: black;
		stroke-width: 1;
	}

	.riemann-rectangle-no-stroke {
		fill: crimson;
		stroke: crimson;
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

	/* input[type="range"], svg.cartesian {
		width: min(65vh, 100%);
		display: block;
		margin: 0 auto;
	} */

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
		font-size: 20px;
	}

	#AreaOfRectangles {
		color: crimson
	}

	/* .grayout {
		opacity: 0.4;
	}	 */

	.slider {
		--range-handle-focus: rgb(177, 27, 57);
		--range-handle: rgb(177, 27, 57);
		--range-handle-inactive: rgb(177, 27, 57);
		--range-range: rgb(187, 187, 187);
		--range-range-inactive: rgb(187, 187, 187);
	}

	/* .equation {
		font-size: 25px;
	} */

	@media screen and (min-width: 320px) {
		.equation {
			font-size: calc(14px + 5 * ((100vw - 320px) / 680));
			width: 90%;
			margin: auto;
		}
	}
	
	@media screen and (min-width: 1000px) {
		.equation {
			font-size: 30px;
			width: 90%;
			margin: auto;
		}
	} 	

	.integeralBound 
	{
		font-size: 0.25px;
	}

	.AxisLabel {
		font-size: 0.25px;
	}

</style>