<script lang="ts">
	let width: number = 100;
	let height: number = 100;

	let numberString: string = '1 2 3 4 5'

	type Point = {
		x: number
		y: number
	}

	type Rectangle = {
		lowerLeftCorner: Point,
		width: number,
		height: number
	}
	
	function sum(numbers: number[]): number {
		let sum = 0;
		for (let number of numbers) {
			sum += number
		}

		return sum;
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

	function allAreas(rectangles: Rectangle[]): number {
		return sumBy(rectangles, area)
	}


	function integrate(lowerBound: number, upperBound: number, rectangleWidth: number): number {
		return 0
	}

	type Maybe<T> = {
		kind: 'Just'
		value: T
	} | {
		kind: 'Nothing'
	}

	function myParseInt(string: string): Maybe<number> {
		const value = parseInt(string) // May give back NaN
		return isNaN(value) ? {kind: 'Nothing'} : {kind: 'Just', value}
	}

	function justs<T>(maybes: Maybe<T>[]): T[] {
		let retVal: T[] = []
		
		for (let maybe of maybes) {
			if (maybe.kind === "Just") {
				retVal.push(maybe.value)
			}
		}

		return retVal;
	}

	function parse(stringOfSpaceSeparatedNumbers: string): number[] {
		return justs(stringOfSpaceSeparatedNumbers.split(' ').map(myParseInt));
	}

	let mySum: number
	$: mySum = sum(parse(numberString))


	function range(n: number): number[] {
		let retVal: number[] = [];

		for (let i = 0; i < n; i++) {
			retVal.push(i);
		}

		return retVal;
	}

	// varibles of graph 
	let boundQuantity = 100

	let upperBound
	$: upperBound = boundQuantity

	let lowerBound
	$: lowerBound = -boundQuantity

	let dx = 250;

	let f
	$: f = function(x: number): number {
		return (x * x) / 250;
	}

	let domain
	$: domain = (upperBound - lowerBound)

	let numberOfPoints: number = 50

	// -10 -> 5
	// offset => 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15
	// lowerBound + offset
	// -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5

	let points: Point[]
	$: points = [...range(numberOfPoints).map(n => {
		const x = lowerBound + (n * (domain / numberOfPoints))
		return {x: x, y: f(x)}
	}), {x: upperBound, y: f(upperBound)}];

	let numberRectangles
	$: numberRectangles = (upperBound - lowerBound) / dx;

	let riemannRectangles: Rectangle[]
	$: riemannRectangles = range(numberRectangles).map(n => {
		const x = lowerBound + (n * (upperBound - lowerBound) / numberRectangles);
		const y = f(x);	
	
		return (y > 0)? {
			height: y,
			width: dx,
			lowerLeftCorner: {x: x, y: 0}
		} 
		:
		{ // correct rectangles with f(x) < 0 
			height: -y,
			width: dx,
			lowerLeftCorner: {x: x, y: y}
		};
	});

</script>

<main>
	<ul>
		<li>
			X Axis Bounds
			<input type="range" min="50" max="300" bind:value={boundQuantity}>
		</li>
		<li>
			Rectangle Width {dx}
			<input type="range" min="1" max="100" bind:value={dx}>
		</li>
		<li>
			Function
			<select bind:value={f}>
				<option value={x => (x * x) / 250}>Squared</option>
				<option value={x => Math.sin(x / 50) * 100}>Sine</option>
			</select>
		</li>
	</ul>

	<svg width="800" height="800" class="cartesian" viewBox="{lowerBound} {lowerBound} {upperBound - lowerBound} {upperBound - lowerBound}">
		<g>
			<line stroke="black" fill="none" x1={lowerBound} y1="0" x2={upperBound} y2="0" />
			<line stroke="black" fill="none" x1="0" y1={lowerBound} x2="0" y2={upperBound} />

			{#each riemannRectangles as rectangle}
				{#if true}
					<rect
						class="riemann-rectangle"
						x={rectangle.lowerLeftCorner.x}
						y={rectangle.lowerLeftCorner.y}
						width={rectangle.width}
						height={rectangle.height}
					/>
				{/if}
			{/each}
			<polyline stroke="black" fill="none" points={points.map(point => `${point.x},${point.y}`).join(' ')} />

		</g>
	</svg>
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

	svg.cartesian {
		display:flex;
	}

	/* Flip the vertical axis in <g> to emulate cartesian. */
	svg.cartesian > g {
		transform: scaleY(-1);
	}

	/* Re-flip all <text> element descendants to their original side up. */
	svg.cartesian > g text {
		transform: scaleY(-1);
	}
</style>