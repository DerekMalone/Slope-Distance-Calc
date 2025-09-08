// routes/distance-input/+page.svelte
<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { calculateTrueDistance, saveMeasurement } from '../../lib/utils/sensorUtils';
    

    const angle = parseInt($page.url.searchParams.get('angle') || '0');
    let distance = '';
    let error = '';

    function handleSubmit() {
        const numDistance = parseFloat(distance);
        
        if (!distance || numDistance <= 0 || numDistance >= 999) {
            error = 'Distance must be between 0 and 999 yards';
            return;
        }

        const trueDistance = calculateTrueDistance(numDistance, angle);
        saveMeasurement(angle, numDistance, trueDistance);
        
        goto('/');
    }
</script>

<main>
    <h1>Enter Straight Distance</h1>
    
    <div class="angle-info">
        Captured Angle: {angle}°
    </div>

    <form on:submit|preventDefault={handleSubmit}>
        <div class="input-group">
            <label for="distance">Distance (yards):</label>
            <input 
                id="distance"
                type="number" 
                bind:value={distance}
                min="0.1"
                max="999"
                step="0.1"
                placeholder="Enter distance"
                required
            />
        </div>

        {#if error}
            <div class="error">{error}</div>
        {/if}

        <button type="submit">Calculate True Distance</button>
    </form>
</main>

<style>
    main {
        padding: 2rem;
        text-align: center;
        max-width: 400px;
        margin: 0 auto;
    }

    .angle-info {
        margin: 1rem 0;
        padding: 1rem;
        background: #e9ecef;
        border-radius: 8px;
        font-size: 1.2rem;
    }

    .input-group {
        margin: 2rem 0;
    }

    label {
        display: block;
        margin-bottom: 0.5rem;
        font-size: 1.1rem;
    }

    input {
        width: 100%;
        padding: 1rem;
        font-size: 1.2rem;
        border: 2px solid #ddd;
        border-radius: 8px;
        text-align: center;
    }

    input:focus {
        outline: none;
        border-color: #007bff;
    }

    button {
        padding: 1rem 2rem;
        font-size: 1.1rem;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        margin-top: 1rem;
    }

    .error {
        color: red;
        margin: 1rem 0;
    }
</style>