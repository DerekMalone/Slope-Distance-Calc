// sensorUtils.ts - TypeScript version with proper types
import { browser } from '$app/environment';
import { type AccelerationData } from '../types/types';
import { rangefinderData } from '../stores/rangefinder';

export function isIOSSafari(): boolean {
    if (!browser) return false;
    // Check if the actual API exists instead of guessing browser
    return typeof (DeviceOrientationEvent as any).requestPermission === 'function';
}

// Check and request permissions
export async function checkPermissions(): Promise<boolean> {

	if (!browser) return false;
    
    try {
        if (isIOSSafari()) {
            const DeviceOrientationEventTyped = DeviceOrientationEvent as unknown as {
                requestPermission: () => Promise<'granted' | 'denied' | 'default'>;
            };
            const DeviceMotionEventTyped = DeviceMotionEvent as unknown as {
                requestPermission: () => Promise<'granted' | 'denied' | 'default'>;
            };

            
            const orientationPermission = await DeviceOrientationEventTyped.requestPermission();
            const motionPermission = await DeviceMotionEventTyped.requestPermission();
            const granted = orientationPermission === 'granted' && motionPermission === 'granted';
            
            rangefinderData.update(data => ({
                ...data,
                hasPermission: granted,
                error: granted ? null : 'Permission denied'
            }));
            
            return granted;
        } else {
            rangefinderData.update(data => ({
                ...data,
                hasPermission: true,
                error: null
            }));
            return true;
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        rangefinderData.update(data => ({
            ...data,
            hasPermission: false,
            error: errorMessage
        }));
        return false;
    }
}

// Calculate angle from accelerometer data
function calculateAngle(accelerationWithGravity: AccelerationData): number {
    const { x, y, z } = accelerationWithGravity;
    // Calculate pitch (forward/backward tilt) - this is beta in landscape
    // const pitch = Math.atan2(-x, Math.sqrt(y * y + z * z)) * (180 / Math.PI);
	const pitch = Math.atan2(-y, Math.sqrt(x * x + z * z)) * (180 / Math.PI); // ! testing if correct
	// const pitch = Math.atan2(x, Math.sqrt(y * y + z * z)) * (180 / Math.PI); // ! Next possible solution
    return Math.round(pitch); // Round to nearest degree
}

// Simple angle capture class
export class AngleCapture {
    private intervalId: number | null = null;
    private currentAngle: number = 0;
    public onAngleUpdate: (angle: number) => void = () => {};

    start() {
        if (!browser || this.intervalId) return;
        
        const handleMotion = (event: DeviceMotionEvent) => {
            const gravity = event.accelerationIncludingGravity;
            if (gravity && gravity.x !== null && gravity.y !== null && gravity.z !== null) {
                this.currentAngle = calculateAngle({
                    x: gravity.x,
                    y: gravity.y,
                    z: gravity.z
                });
                this.onAngleUpdate(this.currentAngle);
            }
        };

        // Add event listener
        window.addEventListener('devicemotion', handleMotion);
        
        // Store cleanup function
        this.intervalId = window.setTimeout(() => {}, 0); // Placeholder for cleanup tracking
        
        // Store the actual cleanup
        this.cleanup = () => {
            window.removeEventListener('devicemotion', handleMotion);
        };
    }

    private cleanup: () => void = () => {};

    stop() {
        if (this.intervalId) {
            this.cleanup();
            this.intervalId = null;
        }
    }

    capture(): number {
        this.stop();
        return this.currentAngle;
    }
}

// Calculate true distance using trigonometry
export function calculateTrueDistance(straightDistance: number, angle: number): number {
    if (angle === 0) return straightDistance;
    
    const angleInRadians = Math.abs(angle) * (Math.PI / 180);
    const trueDistance = straightDistance / Math.cos(angleInRadians);
    
    return Math.round(trueDistance * 10) / 10; // Round to 1 decimal place
}

// Update store with new measurement
export function saveMeasurement(angle: number, straightDistance: number, trueDistance: number) {
    rangefinderData.update(data => ({
        ...data,
        lastAngle: angle,
        lastDistance: straightDistance,
        lastTrueDistance: trueDistance
    }));
}
