<script lang="ts">
	import { browser } from '$app/environment';
	import type { BeforeInstallPromptEvent } from '$lib/types/pwa.js';

	let deferredPrompt: BeforeInstallPromptEvent | null = null;
	let showInstallButton = false;
	let isStandalone = false;

	if (browser) {
		isStandalone = window.matchMedia('(display-mode: standalone)').matches;

		if (!isStandalone) {
			window.addEventListener('beforeinstallprompt', (e) => {
				e.preventDefault();
				deferredPrompt = e; // Now properly typed!
				showInstallButton = true;
			});
		}
	}

	async function installApp() {
		if (deferredPrompt) {
			await deferredPrompt.prompt();
			const { outcome } = await deferredPrompt.userChoice;
			deferredPrompt = null;
			showInstallButton = false;
		}
	}
</script>

<!-- Only show if not installed AND installable -->
{#if showInstallButton && !isStandalone}
	<button on:click={installApp} class="install-btn"> 📱 Install App </button>
{/if}
