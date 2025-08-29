<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { gyroscope } from '$lib/stores/gyroscope';
	import { isDeviceOrientationAvailable } from '$lib/utils/gyroscope';

	let angle = 0;
	let isSupported = true;
	let permissionGranted = false;
	let error: string | null = null;
	let isCalibrating = false;

	// Subscribe to pitch angle updates
	const unsubscribe = gyroscope.pitchAngle.subscribe((value) => {
		if (value !== null) {
			angle = value;
		}
	});

	// Check permission state
	const permissionUnsubscribe = gyroscope.permission.subscribe((state) => {
		permissionGranted = state === 'granted';
	});

	onMount(async () => {
		isSupported = isDeviceOrientationAvailable();
		if (!isSupported) {
			error = 'Device orientation not supported on this device';
			return;
		}

		// Request permission when component mounts
		try {
			const granted = await gyroscope.requestPermission();
			if (!granted) {
				error = 'Permission to access device orientation was denied';
			}
		} catch (err) {
			console.error('Error initializing gyroscope:', err);
			error = 'Failed to initialize device orientation';
		}
	});

	function handleCalibrate() {
		isCalibrating = true;
		gyroscope.calibrate();
		// Reset calibration state after a short delay
		setTimeout(() => {
			isCalibrating = false;
		}, 1000);
	}

	onDestroy(() => {
		unsubscribe();
		permissionUnsubscribe();
	});
</script>

// Meant to display angle and capture angle

<div class="angle-meter-container">
	{#if !isSupported}
		<div class="error-message">
			<p>Device orientation is not supported on this device.</p>
		</div>
	{:else if error}
		<div class="error-message">
			<p>{error}</p>
		</div>
	{:else if !permissionGranted}
		<div class="permission-prompt">
			<p>Please allow access to device orientation to use the angle meter.</p>
			<button class="permission-button" on:click={gyroscope.requestPermission}>
				Grant Permission
			</button>
		</div>
	{:else}
		<div class="angle-display" class:calibrating={isCalibrating}>
			<div class="angle-value">{Math.abs(angle).toFixed(1)}°</div>
			<div class="angle-direction">
				{angle > 0 ? 'Up' : angle < 0 ? 'Down' : 'Level'}
			</div>
			<div class="angle-indicator" style={`transform: rotate(${angle}deg)`}>
				<div class="indicator-line"></div>
			</div>
		</div>

		<div class="controls">
			<button class="calibrate-button" on:click={handleCalibrate} disabled={isCalibrating}>
				{isCalibrating ? 'Calibrating...' : 'Calibrate'}
			</button>
		</div>
	{/if}
</div>

<style>
	.angle-meter-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		background: #ffffff;
		border-radius: 1rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		max-width: 100%;
		width: 300px;
		margin: 0 auto;
	}

	.error-message,
	.permission-prompt {
		text-align: center;
		color: #ef4444;
		padding: 1rem;
	}

	.permission-prompt {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
	}

	.permission-button,
	.calibrate-button {
		background-color: #3b82f6;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.permission-button:hover,
	.calibrate-button:hover {
		background-color: #2563eb;
	}

	.permission-button:disabled,
	.calibrate-button:disabled {
		background-color: #9ca3af;
		cursor: not-allowed;
	}

	.angle-display {
		position: relative;
		width: 200px;
		height: 200px;
		border-radius: 50%;
		background: #f8fafc;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin-bottom: 1.5rem;
		border: 2px solid #e2e8f0;
		transition: transform 0.5s ease-in-out;
	}

	.angle-display.calibrating {
		animation: pulse 1s infinite;
	}

	@keyframes pulse {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.05);
		}
		100% {
			transform: scale(1);
		}
	}

	.angle-value {
		font-size: 2.5rem;
		font-weight: 700;
		color: #1e293b;
	}

	.angle-direction {
		font-size: 1rem;
		color: #64748b;
		margin-top: 0.5rem;
	}

	.angle-indicator {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.1s ease-out;
	}

	.indicator-line {
		width: 80%;
		height: 4px;
		background: linear-gradient(90deg, #3b82f6, #60a5fa);
		border-radius: 2px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.controls {
		margin-top: 1rem;
		display: flex;
		gap: 1rem;
	}

	.calibrate-button {
		background-color: #10b981;
	}

	.calibrate-button:hover {
		background-color: #059669;
	}
</style>
