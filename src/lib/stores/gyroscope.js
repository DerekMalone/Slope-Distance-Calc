/**
 * @typedef {Object} DeviceOrientationEventiOS
 * @property {() => Promise<PermissionState>} requestPermission
 */
/**
 * @typedef {Object} DeviceOrientation
 * @property {number | null} alpha - Rotation around z-axis (0-360)
 * @property {number | null} beta - Rotation around x-axis (-180 to 180)
 * @property {number | null} gamma - Rotation around y-axis (-90 to 90)
 * @property {boolean} absolute
 * @property {number} timestamp
 */

import { writable, derived } from 'svelte/store';

/** @type {import('svelte/store').Writable<DeviceOrientation>} */
export const deviceOrientation = writable({
	alpha: null,
	beta: null,
	gamma: null,
	absolute: false,
	timestamp: 0
});

// Store for calibration offset
/** @type {import('svelte/store').Writable<number>} */
export const calibrationOffset = writable(0);

// Store for permission state
/** @type {import('svelte/store').Writable<string>} */
export const permissionState = writable('prompt'); // 'granted', 'denied', or 'prompt'

// Derived store for calibrated pitch angle
export const pitchAngle = derived(
	[deviceOrientation, calibrationOffset],
	([$deviceOrientation, $calibrationOffset]) => {
		if ($deviceOrientation.beta === null) return null;
		return $deviceOrientation.beta + $calibrationOffset;
	}
);

// Request permission for device orientation
async function requestPermission() {
	if (
		typeof DeviceOrientationEvent === 'undefined' ||
		!('requestPermission' in DeviceOrientationEvent) ||
		typeof DeviceOrientationEvent.requestPermission !== 'function'
	) {
		// API not available, probably not iOS 13+
		return true;
	}

	try {
		const permission = await DeviceOrientationEvent.requestPermission();
		permissionState.set(permission);
		return permission === 'granted';
	} catch (error) {
		console.error('Error requesting device orientation permission:', error);
		permissionState.set('denied');
		return false;
	}
}

// Calibration function
export function calibrate() {
	deviceOrientation.update((orientation) => {
		if (orientation.beta === null) {
			console.warn('Cannot Calibrate: device orientation data not available');
			return orientation;
		}
		calibrationOffset.set(-orientation.beta || 0);
		return orientation;
	});
}

export const gyroscope = {
	requestPermission,
	calibrate,
	subscribe: deviceOrientation.subscribe,
	pitchAngle: {
		subscribe: pitchAngle.subscribe
	},
	permission: {
		subscribe: permissionState.subscribe
	}
};

// Initialize event listener if permissions are already granted
if (typeof window !== 'undefined') {
	window.addEventListener(
		'deviceorientation',
		(event) => {
			if (event.alpha !== null) {
				deviceOrientation.set({
					alpha: event.alpha,
					beta: event.beta,
					gamma: event.gamma,
					absolute: event.absolute,
					timestamp: event.timeStamp
				});
			}
		},
		true
	);
}
