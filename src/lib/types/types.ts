export interface RangefinderData {
    hasPermission: boolean;
    lastAngle: number;
    lastDistance: number;
    lastTrueDistance: number;
    error: string | null;
}

export interface AccelerationData {
    x: number;
    y: number;
    z: number;
}