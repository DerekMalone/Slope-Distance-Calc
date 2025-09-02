<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		sensorData,
		requestSensorPermission,
		startSensorListening,
		calculateSlopeDistance,
		isIOSSafari
	} from '$lib/utils/sensorUtils.js';
	import type { SlopeResult } from '$lib/types/sensor';

	// Component state
	let cleanupSensors: (() => void) | null = null;
	let straightDistance = 100;
	let slopeResult: SlopeResult | null = null;

	// Reactive values from store
	$: truePitch = $sensorData.truePitch;
	$: trueRoll = $sensorData.trueRoll;
	$: totalTilt = $sensorData.totalTilt;
	$: isLevel = $sensorData.isLevel;
	$: compassHeading = $sensorData.compassHeading;
	$: isListening = $sensorData.isListening;
	$: hasPermission = $sensorData.hasPermission;
	$: error = $sensorData.error;

	// Calculate slope whenever values change
	$: if (straightDistance && isListening && truePitch !== undefined) {
		slopeResult = calculateSlopeDistance(straightDistance, truePitch);
	}

	onDestroy(() => {
		if (cleanupSensors) {
			cleanupSensors();
		}
	});

	// Handle permission request (must be from user click)
	async function handleRequestPermission() {
		const granted = await requestSensorPermission();
		if (granted) {
			startListening();
		}
	}

	// Start sensor listening
	function startListening() {
		if (cleanupSensors) {
			cleanupSensors(); // Clean up existing listeners
		}
		cleanupSensors = startSensorListening();
	}

	// Stop sensor listening
	function stopListening() {
		if (cleanupSensors) {
			cleanupSensors();
			cleanupSensors = null;
		}
	}

	// Helper functions
	function formatAngle(angle: number | null) {
		return angle !== null && !isNaN(angle) ? angle.toFixed(1) + '°' : 'N/A';
	}

	function formatDistance(distance: number | null) {
		return distance !== null && !isNaN(distance) ? distance.toFixed(2) + ' ft' : 'N/A';
	}

	function getLevelColor() {
		if (!isListening) return '#999';
		if (isLevel) return '#00C851';
		if (totalTilt < 3) return '#ffbb33';
		return '#ff4444';
	}
</script>

<!-- src/routes/test/+page.svelte -->
<!-- SimpleSlopeLevel.svelte -->
import type {slopeResult} from '$lib/types/sensor.ts';

<div class="slope-app">
	<h1>Digital Level & Slope Calculator</h1>

	<!-- Status Display -->
	<div class="status-card">
		<h3>Status</h3>
		<div class="status-grid">
			<span>Platform:</span>
			<span>{isIOSSafari() ? 'iOS Safari' : 'Other Browser'}</span>

			<span>Permission:</span>
			<span class:granted={hasPermission}>{hasPermission ? '✅ Granted' : '❌ Not Granted'}</span>

			<span>Sensors:</span>
			<span class:active={isListening}>{isListening ? '✅ Active' : '❌ Stopped'}</span>
		</div>

		{#if error}
			<p class="error">Error: {error}</p>
		{/if}
	</div>

	<!-- Permission Button -->
	{#if !hasPermission}
		<div class="button-section">
			<button on:click={handleRequestPermission} class="permission-btn"> Enable Sensors </button>
			<p class="note">
				{#if isIOSSafari()}
					iOS requires a button click to access device sensors
				{:else}
					Click to start using device sensors
				{/if}
			</p>
		</div>
	{/if}

	<!-- Control Buttons -->
	{#if hasPermission}
		<div class="button-section">
			<button
				on:click={isListening ? stopListening : startListening}
				class="control-btn"
				class:stop={isListening}
			>
				{isListening ? 'Stop Measuring' : 'Start Measuring'}
			</button>
		</div>
	{/if}

	<!-- Level Display -->
	{#if isListening}
		<!-- Level Status -->
		<div class="level-status" style="color: {getLevelColor()}">
			{#if isLevel}
				✅ LEVEL
			{:else}
				⚠️ {totalTilt.toFixed(1)}° off level
			{/if}
		</div>

		<!-- Visual Level Indicators -->
		<div class="level-displays">
			<!-- Bubble Level (Roll) -->
			<div class="bubble-level">
				<h4>Roll (Left/Right Tilt)</h4>
				<div class="level-tube">
					<div
						class="bubble"
						style="transform: translateX({Math.max(-40, Math.min(40, trueRoll * 4))}px)"
						class:centered={Math.abs(trueRoll) < 1}
					></div>
					<div class="center-mark"></div>
				</div>
				<p class="reading">{formatAngle(trueRoll)}</p>
			</div>

			<!-- Pitch Indicator -->
			<div class="pitch-display">
				<h4>Pitch (Forward/Back Tilt)</h4>
				<div class="pitch-meter">
					<div
						class="pitch-needle"
						style="transform: rotate({Math.max(-45, Math.min(45, truePitch * 2))}deg)"
					></div>
				</div>
				<p class="reading">{formatAngle(truePitch)}</p>
			</div>
		</div>

		<!-- Distance Calculator -->
		<div class="calculator-section">
			<h3>Distance Calculator</h3>

			<div class="input-section">
				<label for="distance">Straight-Line Distance:</label>
				<input id="distance" type="number" bind:value={straightDistance} min="0.1" step="0.1" /> feet
			</div>

			{#if slopeResult}
				<div class="results">
					<div class="result-item">
						<span>Straight Distance:</span>
						<span>{formatDistance(slopeResult.straightDistance)}</span>
					</div>

					<div class="result-item">
						<span>Slope Angle:</span>
						<span>{formatAngle(slopeResult.angle)}</span>
					</div>

					<div class="result-item highlight">
						<span>Slope Distance:</span>
						<span>{formatDistance(slopeResult.slopeDistance)}</span>
					</div>

					<div class="result-item">
						<span>Extra Distance:</span>
						<span>{formatDistance(slopeResult.additionalDistance)}</span>
					</div>
				</div>
			{/if}
		</div>

		<!-- Raw Values (for debugging) -->
		<details class="debug">
			<summary>Raw Sensor Values</summary>
			<div class="debug-values">
				<p>True Pitch: {formatAngle(truePitch)}</p>
				<p>True Roll: {formatAngle(trueRoll)}</p>
				<p>Total Tilt: {formatAngle(totalTilt)}</p>
				{#if compassHeading !== null}
					<p>Compass: {formatAngle(compassHeading | 0)}</p>
				{/if}
			</div>
		</details>
	{/if}
</div>

<style>
	.slope-app {
		max-width: 500px;
		margin: 0 auto;
		padding: 20px;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
	}

	h1 {
		text-align: center;
		color: #333;
		margin-bottom: 30px;
	}

	.status-card {
		background: #f8f9fa;
		padding: 20px;
		border-radius: 10px;
		margin-bottom: 20px;
		border: 1px solid #e9ecef;
	}

	.status-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
		font-size: 14px;
	}

	.granted {
		color: #28a745;
	}
	.active {
		color: #007bff;
	}
	.error {
		color: #dc3545;
		margin-top: 10px;
		font-weight: bold;
	}

	.button-section {
		text-align: center;
		margin: 20px 0;
	}

	.permission-btn,
	.control-btn {
		background: #007aff;
		color: white;
		border: none;
		padding: 15px 30px;
		border-radius: 25px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.control-btn.stop {
		background: #dc3545;
	}

	.permission-btn:hover,
	.control-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	.note {
		color: #666;
		font-size: 14px;
		margin-top: 10px;
	}

	.level-status {
		text-align: center;
		font-size: 24px;
		font-weight: bold;
		margin: 30px 0;
		padding: 15px;
		border-radius: 10px;
		background: rgba(0, 0, 0, 0.05);
	}

	.level-displays {
		display: grid;
		gap: 30px;
		margin: 30px 0;
	}

	.bubble-level,
	.pitch-display {
		text-align: center;
	}

	.level-tube {
		width: 200px;
		height: 40px;
		background: linear-gradient(90deg, #666, #999, #666);
		border-radius: 20px;
		margin: 15px auto;
		position: relative;
		border: 2px solid #333;
	}

	.bubble {
		width: 25px;
		height: 25px;
		background: #00ff00;
		border-radius: 50%;
		position: absolute;
		top: 7.5px;
		left: 50%;
		margin-left: -12.5px;
		transition: transform 0.2s ease;
		border: 2px solid #fff;
	}

	.bubble.centered {
		background: #00cc00;
		box-shadow: 0 0 8px #00ff00;
	}

	.center-mark {
		position: absolute;
		top: 0;
		left: 50%;
		width: 2px;
		height: 100%;
		background: #fff;
		margin-left: -1px;
	}

	.pitch-meter {
		width: 100px;
		height: 100px;
		border: 3px solid #333;
		border-radius: 50%;
		margin: 15px auto;
		position: relative;
		background: radial-gradient(circle, #f0f0f0, #ddd);
	}

	.pitch-needle {
		position: absolute;
		top: 10px;
		left: 50%;
		width: 3px;
		height: 35px;
		background: #ff0000;
		border-radius: 2px;
		transform-origin: bottom center;
		margin-left: -1.5px;
		transition: transform 0.2s ease;
	}

	.reading {
		font-size: 18px;
		font-weight: 600;
		color: #333;
		margin: 10px 0;
	}

	.calculator-section {
		background: #e3f2fd;
		padding: 20px;
		border-radius: 10px;
		margin: 30px 0;
	}

	.input-section {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 20px;
		flex-wrap: wrap;
	}

	.input-section input {
		width: 100px;
		padding: 8px 12px;
		border: 1px solid #ccc;
		border-radius: 5px;
		font-size: 16px;
	}

	.results {
		display: grid;
		gap: 10px;
	}

	.result-item {
		display: flex;
		justify-content: space-between;
		padding: 12px;
		background: white;
		border-radius: 8px;
		font-weight: 500;
	}

	.result-item.highlight {
		background: #bbdefb;
		font-weight: 700;
	}

	.debug {
		margin-top: 20px;
		padding: 15px;
		background: #f8f9fa;
		border-radius: 8px;
	}

	.debug-values {
		margin-top: 10px;
		font-family: monospace;
		font-size: 14px;
		line-height: 1.6;
	}

	@media (max-width: 480px) {
		.slope-app {
			padding: 15px;
		}

		.level-tube {
			width: 150px;
		}

		.input-section {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
