<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { goto } from '$app/navigation';
    import { AngleCapture } from '../../lib/utils/sensorUtils';

let currentAngle = 0;
    let angleCapture: AngleCapture;

    onMount(() => {
        angleCapture = new AngleCapture();
        angleCapture.onAngleUpdate = (angle) => {
            currentAngle = angle;
        };
        angleCapture.start();
    });

    onDestroy(() => {
        if (angleCapture) {
            angleCapture.stop();
        }
    });

    function handleCapture() {
        const capturedAngle = angleCapture.capture();
        goto(`/distance-input?angle=${capturedAngle}`);
    }

    function handleScreenTap() {
        handleCapture();
    }

    function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
        handleCapture();
    }
}

</script>

<div class="capture-area" on:click={handleScreenTap} on:keydown={handleKeydown} tabindex="0" role="button" aria-label="Tap anywhere to capture angle">
    <div class="arrow">↑</div>
    
    <div class="angle-display">
        {currentAngle}°
    </div>
    
    <button on:click|stopPropagation={handleCapture} class="capture-btn">
        Capture
    </button>
</div>

<style>
.capture-area {
    height: 100vh;
    width: 100vw;
    background: #000;
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    cursor: crosshair;
}

    .arrow {
        position: absolute;
        top: 2rem;
        font-size: 3rem;
        transform: rotate(0deg);
    }

    .angle-display {
        font-size: 4rem;
        font-weight: bold;
        background: rgba(255,255,255,0.1);
        padding: 1rem 2rem;
        border-radius: 12px;
        border: 2px solid white;
    }

    .capture-btn {
        position: absolute;
        bottom: 2rem;
        right: 2rem;
        padding: 1rem 2rem;
        font-size: 1.2rem;
        background: #28a745;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
    }
</style>

    <!-- // ! Below is using screen lock
//     let currentAngle = 0;
//     let angleCapture: AngleCapture;

//     onMount(() => {
//         // Lock to landscape orientation with TypeScript workaround
//         if (screen.orientation) {
//             const orientation = screen.orientation as any;
//             if (orientation.lock) {
//                 orientation.lock('landscape').catch(() => {
//                     // Orientation lock not supported, continue anyway
//                     console.log('Orientation lock not available');
//                 });
//             }
//         }

//         angleCapture = new AngleCapture();
//         angleCapture.onAngleUpdate = (angle) => {
//             currentAngle = angle;
//         };
//         angleCapture.start();
//     });

//     onDestroy(() => {
//         if (angleCapture) {
//             angleCapture.stop();
//         }
//     });

//     function handleCapture() {
//         const capturedAngle = angleCapture.capture();
//         goto(`/distance-input?angle=${capturedAngle}`);
//     }

//     function handleScreenTap() {
//         handleCapture();
//     }
// </script>

// <main on:click={handleScreenTap}>
//     <div class="arrow">↑</div>
    
//     <div class="angle-display">
//         {currentAngle}°
//     </div>
    
//     <button on:click|stopPropagation={handleCapture} class="capture-btn">
//         Capture
//     </button>
// </main>

// <style>
//     main {
//         height: 100vh;
//         width: 100vw;
//         background: #000;
//         color: white;
//         display: flex;
//         flex-direction: column;
//         justify-content: center;
//         align-items: center;
//         position: relative;
//         cursor: crosshair;
//     }

//     .arrow {
//         position: absolute;
//         top: 2rem;
//         font-size: 3rem;
//         transform: rotate(0deg);
//     }

//     .angle-display {
//         font-size: 4rem;
//         font-weight: bold;
//         background: rgba(255,255,255,0.1);
//         padding: 1rem 2rem;
//         border-radius: 12px;
//         border: 2px solid white;
//     }

//     .capture-btn {
//         position: absolute;
//         bottom: 2rem;
//         right: 2rem;
//         padding: 1rem 2rem;
//         font-size: 1.2rem;
//         background: #28a745;
//         color: white;
//         border: none;
//         border-radius: 8px;
//         cursor: pointer;
//     }
// </style> -->