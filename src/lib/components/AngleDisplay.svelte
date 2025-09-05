<!-- AngleDisplay.svelte -->
<script lang="ts">
	export let digits: number = 0;
	export let unit: string = '°';
	export let compassHeading: number | null = null; // New prop for compass functionality

	// Format the digits display
	$: displayValue = Math.abs(digits).toFixed(1);
	$: isNegative = digits < 0;
</script>

<div class="angle-display-container">
	<!-- Original Angle Display -->
	<div class="angle-display">
		<div class="angle-digits">
			{displayValue}
		</div>
		<div class="angle-unit">
			{unit}
		</div>
		<div class="sign">
			{compassHeading !== null && compassHeading !== undefined ? '' : isNegative ? '-' : '+'}
		</div>
	</div>

	<!-- Compass Arrow (points to top of phone) -->
	<div class="arrow-container">
		<div class="arrow" style="transform: rotate({-(compassHeading ?? 0)}deg)">
			<svg viewBox="0 0 24 24" fill="none">
				<path
					d="M12 2 L16 10 L12 8 L8 10 Z"
					fill="currentColor"
					stroke="currentColor"
					stroke-width="1"
				/>
			</svg>
		</div>
	</div>
</div>

<style>
	.angle-display-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
	}

	.angle-display {
		display: flex;
		align-items: baseline;
		justify-content: center;
		background: rgba(0, 0, 0, 0.8);
		color: white;
		border: 2px solid #333;
		border-radius: 8px;
		padding: 1rem 1.5rem;
		font-family: 'Courier New', monospace;
		min-width: 120px;
	}

	.angle-digits {
		font-size: clamp(2rem, 8vw, 4rem);
		font-weight: bold;
		letter-spacing: 0.1em;
	}

	.angle-unit {
		font-size: clamp(1rem, 4vw, 2rem);
		margin-left: 0.25rem;
		opacity: 0.8;
	}

	.sign {
		font-size: clamp(1rem, 4vw, 2rem);
		margin-right: 0.25rem;
		opacity: 0.6;
	}

	.arrow-container {
		display: flex;
		align-items: center;
		justify-content: center;
		transform: rotate(-90deg); /* Points to top regardless of orientation */
	}

	.arrow-container svg {
		width: 100px;
		height: auto;
		filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
	}
</style>
