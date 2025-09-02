// types/sensor.ts - TypeScript definitions for iOS sensor APIs

// Extend the global DeviceOrientationEvent interface to include iOS-specific properties
declare global {
	interface DeviceOrientationEvent {
		webkitCompassHeading?: number;
		webkitCompassAccuracy?: number;
	}

	interface DeviceOrientationEventConstructor {
		requestPermission?: () => Promise<'granted' | 'denied' | 'default'>;
	}

	interface DeviceMotionEventConstructor {
		requestPermission?: () => Promise<'granted' | 'denied' | 'default'>;
	}
}

// Sensor data store type
export interface SensorData {
	truePitch: number;
	trueRoll: number;
	totalTilt: number;
	isLevel: boolean;
	compassHeading: number | null;
	isListening: boolean;
	hasPermission: boolean;
	error: string | null;
}

// Acceleration data type
export interface AccelerationData {
	x: number;
	y: number;
	z: number;
}

// True angles calculation result
export interface TrueAngles {
	pitch: number;
	roll: number;
	totalTilt: number;
	isLevel: boolean;
}

// Slope calculation result
export interface SlopeResult {
	straightDistance: number;
	slopeDistance: number;
	angle: number;
	additionalDistance: number;
}
