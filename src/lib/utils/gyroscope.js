// Device orientation utilities

/**
 * Check if the device orientation API is available
 * @returns {boolean} True if the API is available
 */
export function isDeviceOrientationAvailable() {
	return 'DeviceOrientationEvent' in window;
}

/**
 * Check if the device is in portrait orientation
 * @returns {boolean} True if in portrait mode
 */
export function isPortrait() {
	return window.matchMedia('(orientation: portrait)').matches;
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
export function toRadians(degrees) {
	return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 * @param {number} radians - Angle in radians
 * @returns {number} Angle in degrees
 */
export function toDegrees(radians) {
	return radians * (180 / Math.PI);
}

/**
 * Calculate the tilt angle from device orientation data
 * @param {number} beta - The beta rotation (x-axis)
 * @param {number} gamma - The gamma rotation (y-axis)
 * @returns {number} The calculated tilt angle in degrees
 */
export function calculateTiltAngle(beta, gamma) {
	if (beta === null || gamma === null) return 0;

	// Convert degrees to radians
	const betaRad = toRadians(beta);
	const gammaRad = toRadians(gamma);

	// Calculate tilt angle
	const tilt = Math.atan2(Math.sin(betaRad), Math.cos(betaRad) * Math.cos(gammaRad));

	return toDegrees(tilt);
}

/**
 * Smooth out the angle values using a simple moving average
 * @param {number} newAngle - New angle value to add to the buffer
 * @param {number[]} buffer - Array of previous angle values
 * @param {number} bufferSize - Maximum size of the buffer
 * @returns {object} Object containing the smoothed angle and updated buffer
 */
export function smoothAngle(newAngle, buffer = [], bufferSize = 5) {
	// Add new angle to buffer
	buffer.push(newAngle);

	// Remove oldest angle if buffer is full
	if (buffer.length > bufferSize) {
		buffer.shift();
	}

	// Calculate average
	const sum = buffer.reduce((a, b) => a + b, 0);
	const average = sum / buffer.length;

	return {
		angle: average,
		buffer
	};
}
