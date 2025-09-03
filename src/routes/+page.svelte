<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	// import DashboardPage from './dashboard/+page.svelte';
	import {
		sensorData,
		requestSensorPermission,
		startSensorListening,
		isIOSSafari,
		stopListening,
		startListening
	} from '$lib/utils/sensorUtils';

	$: isListening = $sensorData.isListening;
	$: hasPermission = $sensorData.hasPermission;
	$: error = $sensorData.error;

	// onDestroy(() => {
	// 	if (cleanupSensors) {
	// 		cleanupSensors();
	// 	}
	// });

	// Handle permission request (must be from user click)
	async function handleRequestPermission() {
		// Need to do
		const granted = await requestSensorPermission();
		if (granted) {
			startListening();
			goto('/dashboard');
		}
	}

	// // Start sensor listening
	// function startListening() {
	// 	if (cleanupSensors) {
	// 		cleanupSensors(); // Clean up existing listeners
	// 	}
	// 	cleanupSensors = startSensorListening();
	// }

	// // Stop sensor listening
	// function stopListening() {
	// 	if (cleanupSensors) {
	// 		cleanupSensors();
	// 		cleanupSensors = null;
	// 	}
	// }
</script>

<div>
	<h1>Welcome to SDC</h1>
	<p>Approve permissions to continue</p>
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
</div>

<style>
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
</style>
