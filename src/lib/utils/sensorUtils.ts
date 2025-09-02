// sensorUtils.ts - TypeScript version with proper types
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { SensorData, AccelerationData, TrueAngles, SlopeResult } from '../types/sensor.ts';

// Simple store for sensor data with proper typing
export const sensorData = writable<SensorData>({
  truePitch: 0,
  trueRoll: 0,
  totalTilt: 0,
  isLevel: false,
  compassHeading: null,
  isListening: false,
  hasPermission: false,
  error: null
});

// Check if we're on iOS Safari
export function isIOSSafari(): boolean {
  if (!browser) return false;
  
  // Type assertion for iOS-specific API
  const DeviceOrientationEventTyped = DeviceOrientationEvent as unknown as {
    requestPermission?: () => Promise<'granted' | 'denied' | 'default'>;
  };
  
  return typeof DeviceOrientationEventTyped.requestPermission === 'function';
}

// Request permissions for iOS (must be called from user click)
export async function requestSensorPermission(): Promise<boolean> {
  if (!browser) return false;

  try {
    if (isIOSSafari()) {
      // Type assertions for iOS APIs
      const DeviceOrientationEventTyped = DeviceOrientationEvent as unknown as {
        requestPermission: () => Promise<'granted' | 'denied' | 'default'>;
      };
      
      const DeviceMotionEventTyped = DeviceMotionEvent as unknown as {
        requestPermission: () => Promise<'granted' | 'denied' | 'default'>;
      };

      // iOS - request both permissions
      const orientationPermission = await DeviceOrientationEventTyped.requestPermission();
      const motionPermission = await DeviceMotionEventTyped.requestPermission();
      
      const granted = orientationPermission === 'granted' && motionPermission === 'granted';
      
      sensorData.update((data: SensorData) => ({
        ...data,
        hasPermission: granted,
        error: granted ? null : 'Permission denied'
      }));
      
      return granted;
    } else {
      // Non-iOS - usually works without permission
      sensorData.update((data: SensorData) => ({
        ...data,
        hasPermission: true,
        error: null
      }));
      return true;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    sensorData.update((data: SensorData) => ({
      ...data,
      hasPermission: false,
      error: errorMessage
    }));
    return false;
  }
}

// Calculate true pitch and roll from accelerometer gravity readings
export function calculateTrueAngles(accelerationWithGravity: AccelerationData): TrueAngles {
  const { x, y, z } = accelerationWithGravity;
  
  // Calculate pitch (forward/backward tilt)
  const pitch = Math.atan2(-x, Math.sqrt(y * y + z * z)) * (180 / Math.PI);
  
  // Calculate roll (left/right tilt)  
  const roll = Math.atan2(y, Math.sqrt(x * x + z * z)) * (180 / Math.PI);
  
  // Total tilt magnitude
  const totalTilt = Math.sqrt(pitch * pitch + roll * roll);
  
  // Check if level (within 1 degree)
  const isLevel = totalTilt <= 1.0;
  
  return { pitch, roll, totalTilt, isLevel };
}

// Start listening to sensors
export function startSensorListening(): (() => void) | null {
  if (!browser) return null;

  // Listen to device motion for true level (accelerometer)
  const motionHandler = (event: DeviceMotionEvent): void => {
    const gravity = event.accelerationIncludingGravity;
    if (gravity && gravity.x !== null && gravity.y !== null && gravity.z !== null) {
      const gravityData: AccelerationData = {
        x: gravity.x,
        y: gravity.y,
        z: gravity.z
      };
      
      const angles = calculateTrueAngles(gravityData);
      
      sensorData.update((data: SensorData) => ({
        ...data,
        truePitch: angles.pitch,
        trueRoll: angles.roll,
        totalTilt: angles.totalTilt,
        isLevel: angles.isLevel
      }));
    }
  };

  // Listen to device orientation for compass (gyroscope)
  const orientationHandler = (event: DeviceOrientationEvent): void => {
    // Access iOS-specific property with type assertion
    const heading = (event as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading;
    
    sensorData.update((data: SensorData) => ({
      ...data,
      compassHeading: heading ?? null
    }));
  };

  // Add the listeners
  window.addEventListener('devicemotion', motionHandler);
  window.addEventListener('deviceorientation', orientationHandler);
  
  sensorData.update((data: SensorData) => ({
    ...data,
    isListening: true
  }));

  // Return cleanup function
  return (): void => {
    window.removeEventListener('devicemotion', motionHandler);
    window.removeEventListener('deviceorientation', orientationHandler);
    sensorData.update((data: SensorData) => ({
      ...data,
      isListening: false
    }));
  };
}

// Calculate slope distance from straight distance and angle
export function calculateSlopeDistance(straightDistance: number, pitchAngle: number): SlopeResult {
  const angleInRadians = pitchAngle * (Math.PI / 180);
  const slopeDistance = straightDistance / Math.cos(Math.abs(angleInRadians));
  
  return {
    straightDistance: parseFloat(straightDistance.toString()),
    slopeDistance: slopeDistance,
    angle: pitchAngle,
    additionalDistance: slopeDistance - straightDistance
  };
}