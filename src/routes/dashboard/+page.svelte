<script lang="ts">
    import { goto } from '$app/navigation';
    import { rangefinderData } from '../../lib/stores/rangefinder';
    import { checkPermissions } from '../../lib/utils/sensorUtils';

    async function handleCaptureAngle() {
        // Check permissions first if needed
        if (!$rangefinderData.hasPermission) {
            const granted = await checkPermissions();
            if (!granted) {
                alert('Sensor permissions required');
                return;
            }
        }
        
        goto('/capture-angle');
    }

    async function handleRequestPermissions() {
        await checkPermissions();
    }
</script>

<main>
    <h1>Rangefinder</h1>
    
    <div class="stats">
        <div>Last True Distance: {$rangefinderData.lastTrueDistance} yards</div>
        <div>Last Angle: {$rangefinderData.lastAngle}°</div>
        <div>Last Straight Distance: {$rangefinderData.lastDistance} yards</div>
    </div>

    <div class="buttons">
        <button on:click={handleCaptureAngle} class="primary">
            Capture New Angle
        </button>
        
        {#if !$rangefinderData.hasPermission}
            <button on:click={handleRequestPermissions}>
                Request Permissions
            </button>
        {/if}
    </div>

    {#if $rangefinderData.error}
        <div class="error">{$rangefinderData.error}</div>
    {/if}
</main>

<style>
    main {
        padding: 2rem;
        text-align: center;
    }
    
    .stats {
        margin: 2rem 0;
        padding: 1rem;
        background: #f5f5f5;
        border-radius: 8px;
    }
    
    .stats div {
        margin: 0.5rem 0;
        font-size: 1.1rem;
    }
    
    .buttons {
        margin: 2rem 0;
    }
    
    button {
        display: block;
        margin: 1rem auto;
        padding: 1rem 2rem;
        font-size: 1.1rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
    }
    
    .primary {
        background: #007bff;
        color: white;
    }
    
    .error {
        color: red;
        margin-top: 1rem;
    }
</style>