<script lang="ts">
	type Point = {
		x: number
		y: number
	}

	type Rectangle = {
		lowerLeftCorner: Point,
		width: number,
		height: number
	}

	function sumBy<T>(array: T[], getNumber: (a: T) => number): number {
		let sum = 0;
		for (let a of array) {
			sum += getNumber(a)
		}

		return sum;
	}

	function area(rectangle: Rectangle): number {
		return rectangle.width * rectangle.height;
	}

	function range(n: number): number[] {
		let retVal: number[] = [];

		for (let i = 0; i < n; i++) {
			retVal.push(i);
		}

		return retVal;
	}

	// variables of graph 
	const DEFAULT_BOUND_MAGNITUDE = 100

	let xMaxBound = DEFAULT_BOUND_MAGNITUDE
	let xMinBound = -DEFAULT_BOUND_MAGNITUDE

	let yMaxBound = DEFAULT_BOUND_MAGNITUDE
	let yMinBound = -DEFAULT_BOUND_MAGNITUDE

	let integralUpperBound = DEFAULT_BOUND_MAGNITUDE
	let integralLowerBound = -DEFAULT_BOUND_MAGNITUDE

	let dx: number = 5

	let f: (x: number) => number
	$: f = function(x) {
		return (x * x) / 250;
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

</script>

<main>
	<ul>
		<li>
			Brett has <input type="number"> dollars in his bank account.
		</li>
		<li>
			Rectangle Width {dx}
			<input type="range" min="1" max={integralUpperBound - integralLowerBound} bind:value={dx}>
		</li>
		<li>
			Function
			<select bind:value={f}>
				<option value={x => (x * x) / 250}>Squared</option>
				<option value={x => Math.sin(x / 50) * 100}>Sine</option>
			</select>
		</li>
		<li>
			The sum of the rectangles rounded to 1's place is {Math.round(sumBy(riemannRectangles, area))}
		</li>
	</ul>

	<svg class="cartesian" viewBox="{xMinBound} {yMinBound} {xMaxBound - xMinBound} {yMaxBound - yMinBound}">
		<g>
			<line stroke="black" fill="none" x1={xMinBound} y1="0" x2={xMaxBound} y2="0" />
			<line stroke="black" fill="none" x1="0" y1={yMinBound} x2="0" y2={yMaxBound} />

			<line stroke="black" stroke-dasharray="2,2" fill="none" x1={integralLowerBound} y1={yMinBound} x2={integralLowerBound} y2={yMaxBound} />
			<line stroke="black" stroke-dasharray="2,2" fill="none" x1={integralUpperBound} y1={yMinBound} x2={integralUpperBound} y2={yMaxBound} />

			{#each riemannRectangles as rectangle}
					<rect
						class="riemann-rectangle"
						x={rectangle.lowerLeftCorner.x}
						y={rectangle.lowerLeftCorner.y}
						width={rectangle.width}
						height={rectangle.height}
					/>
			{/each}
			<polyline stroke="black" fill="none" points={points.map(point => `${point.x},${point.y}`).join(' ')} />

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